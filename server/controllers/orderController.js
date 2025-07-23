const Order = require("../models/Order")

// Create new order
const createOrder = async (req, res) => {
  try {
    const orderData = req.body

    const order = new Order({
      orderId: orderData.id,
      items: orderData.items.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal: orderData.total,
      tax: orderData.tax,
      total: orderData.total + orderData.tax,
      status: orderData.status || "completed",
    })

    await order.save()

    res.status(201).json({
      message: "Order created successfully",
      orderId: order.orderId,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    res.status(500).json({ error: "Failed to create order" })
  }
}

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id
    const order = await Order.findOne({ orderId })

    if (order) {
      res.json({
        id: order.orderId,
        items: order.items.map((item) => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: order.subtotal,
        tax: order.tax,
        status: order.status,
        date: order.createdAt.toISOString(),
      })
    } else {
      res.status(404).json({ error: "Order not found" })
    }
  } catch (error) {
    console.error("Error fetching order:", error)
    res.status(500).json({ error: "Failed to fetch order" })
  }
}

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 })

    const formattedOrders = orders.map((order) => ({
      id: order.orderId,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      status: order.status,
      date: order.createdAt,
    }))

    res.json(formattedOrders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).json({ error: "Failed to fetch orders" })
  }
}

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id
    const { status } = req.body

    const order = await Order.findOneAndUpdate({ orderId }, { status }, { new: true })

    if (order) {
      res.json({ message: "Order status updated successfully", status: order.status })
    } else {
      res.status(404).json({ error: "Order not found" })
    }
  } catch (error) {
    console.error("Error updating order status:", error)
    res.status(500).json({ error: "Failed to update order status" })
  }
}

module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
}
