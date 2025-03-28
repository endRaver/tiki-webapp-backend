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
    sku: {
      type: String,
      required: true,
      default: '',
    },
    name: {
      type: String,
      required: true,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    link: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    product_id: {
      type: String,
      default: '',
    },
    store_id: {
      type: Number,
      default: 0,
    },
    is_best_store: {
      type: Boolean,
      default: false,
    },
    is_offline_installment_supported: {
      type: Boolean,
      default: false,
    },
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
  list_price: {
    type: Number,
    required: [true, "List price is required"],
    min: 0,
  },
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
  specifications: [
    {
      name: {
        type: String,
        default: 'Thông tin chung',
      },
      attributes: [
        {
          code: {
            type: String,
            default: '',
          },
          name: {
            type: String,
            default: '',
          },
          value: {
            type: String,
            default: '',
          },
        }
      ],
    }
  ],
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;