import Product from '../models/product.model.js';

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } })
      .populate('current_seller.seller')

    // add quantity to each product
    const cartItems = products.map(product => {
      const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id);
      return {
        ...product.toJSON(),
        quantity: item.quantity,
        shippingPrice: item.shippingPrice,
        shippingDate: item.shippingDate
      }
    })

    res.status(200).json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cartItems.push({
        _id: productId,
        quantity: quantity,
      });
    }

    await user.save();

    // Find the updated or newly added item
    const updatedItem = user.cartItems.find((item) => item.id === productId);
    const product = await Product.findById(productId);

    const cartItems = {
      ...product.toJSON(),
      quantity: quantity,
      shippingPrice: updatedItem.shippingPrice,
      shippingDate: updatedItem.shippingDate
    }

    res.status(200).json(cartItems);
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter(item => item.id !== productId);
    }

    await user.save();
    res.status(200).json(user.cartItems);

  } catch (error) {
    console.log("Error in removeAllFromCart controller", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find(item => item.id === productId);

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        return res.status(200).json(user.cartItems);
      }

      existingItem.quantity = quantity;
      await user.save();
      res.status(200).json(user.cartItems);
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

  } catch (error) {
    console.log("Error in updateQuantity controller", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const deleteAllCart = async (req, res) => {
  try {
    const user = req.user;
    user.cartItems = [];
    await user.save();
    res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("Error in deleteAllCart controller", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}


