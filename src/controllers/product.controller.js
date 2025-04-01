import fs from 'fs';

import Product from "../models/product.model.js"
import Seller from "../models/seller.model.js";

import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinaryService.js";

const getTransformedUrl = (url, transformation) => {
  return url.replace("/upload/", `/upload/${transformation}/`);
};

export const getAllProducts = async (req, res) => {
  try {
    const productsWithSellers = await Product.find({})
      .populate('current_seller.seller')
      .lean(); // Convert Mongoose documents to plain JS objects

    const formattedProducts = productsWithSellers.map(product => {
      if (product.current_seller && product.current_seller.seller) {
        return {
          ...product, // Spread all other fields
          current_seller: {
            ...product.current_seller.seller, // Move seller fields up
            price: product.current_seller.price,
            product_id: product.current_seller.product_id,
            sku: product.current_seller.sku,
          }
        };
      }
      return product;
    });

    res.status(200).json({ products: formattedProducts });
  } catch (error) {
    console.log("Error in getAllProducts controller", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      authors,
      short_description,
      price,
      seller_id,
      seller_price,
    } = req.body;

    const seller = await Seller.findById(seller_id);
    if (!seller) {
      return res.status(400).json({ message: "Seller not found" });
    }

    const formattedAuthors = authors ? authors.split(",") : [];
    // Create authors array
    let authorsArray = [];
    if (formattedAuthors && Array.isArray(formattedAuthors)) {
      for (const author of formattedAuthors) {
        authorsArray.push({
          name: author,
          slug: author.toLowerCase().replace(/ /g, '-')
        });
      }
    } else {
      console.error("Authors must be an array of strings.");
      return res.status(400).json({ message: "Authors must be an array of strings." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    // Handle file uploads
    let imageUrls = [];
    for (const file of req.files) {
      try {
        const imageUrl = await uploadToCloudinary(
          file.path,
          "Ecommerce-Store/products"
        );
        imageUrls.push(imageUrl);

        // Delete the temporary file after upload
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    const images = imageUrls.map((imageUrl) => ({
      base_url: imageUrl,
      large_url: getTransformedUrl(imageUrl, "w_1200,h_1200,c_fill"),
      medium_url: getTransformedUrl(imageUrl, "w_600,h_600,c_fill"),
      small_url: getTransformedUrl(imageUrl, "w_300,h_300,c_fill"),
      thumbnail_url: getTransformedUrl(imageUrl, "w_150,h_150,c_fill"),
    }));

    // Create the product object matching the schema
    const productData = {
      name: name || '',
      description: description || '',
      short_description: short_description || '',
      original_price: parseFloat(price) || 0,
      list_price: parseFloat(price) || 0,
      authors: authorsArray,
      categories: {
        name: category || '',
        is_leaf: false
      },
      current_seller: {
        seller: seller._id,
        price: parseFloat(seller_price) || 0,
      },
      images: images,
    };

    const product = await Product.create(productData);
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const {
      name,
      description,
      category,
      authors,
      short_description,
      price,
      seller_id,
      seller_price,
    } = req.body;

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Initialize updateData object
    const updateData = {};

    // Only add fields to updateData if they are provided in the request
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (short_description) updateData.short_description = short_description;
    if (price) {
      updateData.original_price = parseFloat(price);
      updateData.list_price = parseFloat(price);
    }

    if (authors) {
      const formattedAuthors = authors.split(",");
      const authorsArray = formattedAuthors.map(author => ({
        name: author,
        slug: author.toLowerCase().replace(/ /g, '-')
      }));
      updateData.authors = authorsArray;
    }

    if (category) {
      updateData.categories = {
        name: category,
        is_leaf: false
      };
    }

    if (seller_id) {
      const seller = await Seller.findById(seller_id);
      if (!seller) {
        return res.status(400).json({ message: "Seller not found" });
      }
      updateData['current_seller.seller'] = seller._id;
    }

    if (seller_price) {
      updateData['current_seller.price'] = parseFloat(seller_price);
    }

    // Handle images if provided
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          try {
            await deleteFromCloudinary(image.base_url);
            console.log("Old image deleted from cloudinary");
          } catch (error) {
            console.log("Error in deleting old image from cloudinary", error.message);
          }
        }
      }

      let imageUrls = [];
      for (const file of req.files) {
        try {
          const imageUrl = await uploadToCloudinary(
            file.path,
            "Ecommerce-Store/products"
          );
          imageUrls.push(imageUrl);
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }

      updateData.images = imageUrls.map((imageUrl) => ({
        base_url: imageUrl,
        large_url: getTransformedUrl(imageUrl, "w_1200,h_1200,c_fill"),
        medium_url: getTransformedUrl(imageUrl, "w_600,h_600,c_fill"),
        small_url: getTransformedUrl(imageUrl, "w_300,h_300,c_fill"),
        thumbnail_url: getTransformedUrl(imageUrl, "w_150,h_150,c_fill"),
      }));
    }

    // Only proceed with update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({ message: 'Product updated successfully', updatedProduct });
  } catch (error) {
    console.log("Error in updateProduct controller", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.images) {
      for (const image of product.images) {
        try {
          await deleteFromCloudinary(image.base_url);
          console.log("Image deleted from cloudinary");
        } catch (error) {
          console.log("Error in deleting image from cloudinary", error.message);
        }
      }
    }

    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ deletedProduct, message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 4 }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        }
      }
    ]);

    res.status(200).json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ 'categories.name': category });
    res.status(200).json(products);
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// export const toggleFeaturedProduct = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const product = await Product.findById(id);
//     if (product) {
//       product.isFeatured = !product.isFeatured;
//       const updatedProduct = await product.save();

//       // update redis cache
//       await updateFeaturedProductsCache();
//       res.json(updatedProduct);
//     } else {
//       res.status(404).json({ message: 'Product not found' });
//     }
//   } catch (error) {
//     console.log("Error in toggleFeaturedProduct controller", error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// }


// export const getFeaturedProducts = async (req, res) => {
//   try {
//     let featuredProducts = await redis.get('featured_products');

//     if (featuredProducts) {
//       return res.status(200).json(JSON.parse(featuredProducts));
//     }

//     // if not in redis, fetch from mongoDB
//     // .lean() is used to return plain javascript objects instead of mongoose documents
//     // which is good for performance
//     featuredProducts = await Product.find({ isFeatured: true }).lean();

//     if (!featuredProducts) {
//       return res.status(404).json({ message: 'No featured products found' });
//     }

//     // store in redis for future quick access

//     await redis.set('featured_products', JSON.stringify(featuredProducts));
//     res.status(200).json(featuredProducts);

//   } catch (error) {
//     console.log("Error in getFeaturedProducts controller", error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// }

// async function updateFeaturedProductsCache() {
//   try {
//     const featuredProducts = await Product.find({ isFeatured: true }).lean();
//     await redis.set('featured_products', JSON.stringify(featuredProducts));
//   } catch (error) {
//     console.log("Error in update cache function", error.message);
//   }
// }
