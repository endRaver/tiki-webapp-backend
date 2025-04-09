import axios from "axios";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"
import crypto from "crypto"

import User from "../models/user.model.js";

import { redis } from "../lib/redis.js";
import { sendResetPasswordEmail, sendResetSuccessEmail, sendVerificationEmail } from "../mailtrap/emails.js";

dotenv.config();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })

  return { accessToken, refreshToken }
}

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60)  // 7 days
}

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true, // Set to true even in development when using https backend
    sameSite: "none", // Change from "strict" to "none" to allow cross-site cookies
    maxAge: 60 * 60 * 1000, // 1 hour
  })
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // Set to true even in development when using https backend
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days  
  })
}

export const signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Tất cả các trường là bắt buộc' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists && userExists.isVerified) {
      return res.status(400).json({ message: 'Tài khoản đã tồn tại' });
    }

    if (userExists && !userExists.isVerified) {
      if (userExists.authType === 'google') {
        return res.status(400).json({ message: 'Tài khoản đã tồn tại với Google' });
      }

      userExists.verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      userExists.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
      await userExists.save();

      sendVerificationEmail(userExists.email, userExists.verificationToken);  // TODO: Remove when email verification is implemented

      return res.status(400).json({ message: 'Tài khoản đã tồn tại, vui lòng xác thực email' });
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name: email.split('@')[0],
      email,
      password,
      // isVerified: true, // TODO: Remove when email verification is implemented
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // authenticate user
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    sendVerificationEmail(user.email, verificationToken);  // TODO: Uncomment when email verification is implemented

    res.status(201).json({
      success: true,
      message: 'Tài khoản đã được tạo thành công, vui lòng xác thực email',
      user: {
        ...user._doc,
        password: undefined,
        cartItems: undefined
      }
    });
  } catch (error) {
    console.log('Error in signup controller', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Vui lòng xác thực email của bạn' });
    }

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id)

      if (user.authType === 'google') {
        return res.status(400).json({
          message: "Tài khoản này sử dụng xác thực Google. Vui lòng đăng nhập bằng Google."
        });
      }

      await storeRefreshToken(user._id, refreshToken)
      setCookies(res, accessToken, refreshToken)

      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        message: "Đăng nhập thành công",
        user: {
          ...user._doc,
          password: undefined,
          cartItems: undefined
        }
      })
    } else {
      return res.status(401).json({ message: "Email hoặc mật khẩu không hợp lệ" })
    }
  } catch (error) {
    console.log('Error in login controller', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.log('Error in logout controller', error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// this will refresh the access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Không có token xác thực được cung cấp' })
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: 'Token xác thực không hợp lệ' })
    }

    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true, // Set to true even in development when using https backend
      sameSite: "none", // Change from "strict" to "none" to allow cross-site cookies
      maxAge: 15 * 60 * 1000,
    })

    res.json({ message: "Token truy cập đã được cập nhật thành công" })
  } catch (error) {
    console.log('Error in refresh token controller', error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.log('Error in get profile controller', error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    // Use the access token to get user info directly
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const { email, name, sub: googleId } = userInfoResponse.data;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email, name, googleId, authType: 'google', isVerified: true, });
    }

    if (user.authType === 'local') {
      return res.status(400).json({ message: 'Tài khoản đã tồn tại với email' });
    }

    // Generate tokens for the app
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error("Google auth error:", error.response?.data || error.message);
    res.status(401).json({ error: "Xác thực thất bại" });
  }
}

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Mã xác thực không hợp lệ hoặc đã hết hạn" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email đã được xác thực thành công',
      user: {
        ...user._doc,
        password: undefined,
      },
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Tài khoản không tồn tại' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: 'Tài khoản chưa được xác thực' });
    }

    if (user.authType === 'google') {
      return res.status(400).json({ success: false, message: 'Tài khoản này sử dụng xác thực Google. Vui lòng đăng nhập bằng Google.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    await sendResetPasswordEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
    );

    return res.status(200).json({
      success: true,
      message: 'Email đặt lại mật khẩu đã được gửi đến tài khoản của bạn',
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export const resetPassword = async (req, res) => {

  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    console.log('user', token);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}