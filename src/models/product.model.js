import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  authors: [
    {
      name: {
        type: String,
      },
      slug: {
        type: String,
      },
    }
  ],
  categories:
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
    },
    is_leaf: {
      type: Boolean,
      default: false,
    },
  },
  current_seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
  },
  description: {
    type: String,
    default: '',
  },
  images: [
    {
      base_url: {
        type: String,
        required: true,
      },
      is_gallery: {
        type: Boolean,
        default: false,
      },
      label: {
        type: String,
        default: '',
      },
      position: {
        type: String,
        default: null,
      },
      large_url: {
        type: String,
        default: '',
      },
      medium_url: {
        type: String,
        default: '',
      },
      small_url: {
        type: String,
        default: '',
      },
      thumbnail_url: {
        type: String,
        default: '',
      },
    },
  ],
  name: {
    type: String,
    required: [true, "Product name is required"],
  },
  original_price: {
    type: Number,
    required: [true, "Original price is required"],
    min: 0,
  },
  quantity_sold: {
    text: {
      type: String,
      default: '',
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  rating_average: {
    type: Number,
    default: 0,
    min: 0,
  },
  short_description: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;