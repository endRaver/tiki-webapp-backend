import Seller from "../models/seller.model.js";

export const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.status(200).json({ sellers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const getSellerById = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findById(id);
    res.status(200).json({ seller });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
