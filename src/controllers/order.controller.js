import Order from "../models/order.model.js";

export const getOrders = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ userId });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id).populate({
      path: 'products.product',
      select: 'name images original_price list_price current_seller categories'
    });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrdersByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'user',
        select: 'name email phoneNumber address'
      })
      .populate({
        path: 'products.product',
        select: 'name images original_price list_price current_seller categories'
      })
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;

  const {
    status,
  } = req.body;

  if (!status) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const order = await Order.findByIdAndUpdate(id, {
      status
    }, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





