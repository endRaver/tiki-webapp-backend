import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
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
}, { timestamps: true });

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;
