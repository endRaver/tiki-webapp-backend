import Product from "../models/product.model.js"
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinaryService.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ products });

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
    } = req.body;

    // Upload new image to Cloudinary
    const imageFiles = req.files;
    let imageFilesArray = Array.isArray(imageFiles)
      ? imageFiles
      : Object.values(imageFiles);

    let imageUrls = [];
    if (imageFilesArray.length > 0) {
      for (const imageFile of imageFilesArray) {
        if (!imageFile?.data) {
          console.error("Invalid file:", imageFile);
          continue;
        }
        try {
          const imageUrl = await uploadToCloudinary(
            imageFile,
            "Ecommerce-Store/products"
          );
          imageUrls.push(imageUrl);
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    } else {
      console.log(
        "No image files uploaded or files are not in the expected format."
      );
    }

    // Create authors array
    let authorsArray = [];
    for (const author of authors) {
      authorsArray.push({
        name: author,
        slug: author.toLowerCase().replace(/ /g, '-')
      });
    }

    // Create the product object matching the schema
    const productData = {
      name,
      description,
      short_description,
      original_price: price,
      list_price: price,
      authors: authorsArray || [], // If authors is provided, use it, otherwise empty array
      categories: {
        name: category,
        is_leaf: false
      },
      current_seller: {
        sku: '',
        name: '',
        price: 0,
        link: '',
        logo: '',
        product_id: '',
        store_id: 0,
        is_best_store: false,
        is_offline_installment_supported: false
      },
      images: imageUrls || [],
    };

    const product = await Product.create(productData);

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const { name, description, category, authors, short_description, price, images } = req.body;

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create authors array
    let authorsArray = [];
    for (const author of authors) {
      authorsArray.push({
        name: author,
        slug: author.toLowerCase().replace(/ /g, '-')
      });
    }

    let imagesArray = [];
    // Upload new image to Cloudinary
    let imageFilesArray = Array.isArray(images)
      ? images
      : Object.values(images);

    if (imageFilesArray.length > 0) {
      for (const imageFile of imageFilesArray) {
        if (!imageFile?.data) {
          console.error("Invalid file:", imageFile);
          continue;
        }
        try {
          const imageUrl = await uploadToCloudinary(
            imageFile,
            "Cakery19/products"
          );
          imagesArray.push(imageUrl);
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    } else {
      console.log(
        "No image files uploaded or files are not in the expected format."
      );
    }


    const updateData = {
      name,
      description,
      category,
      authors: authorsArray,
      short_description,
      price,
      images: imagesArray
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

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
          await deleteFromCloudinary(image);
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
