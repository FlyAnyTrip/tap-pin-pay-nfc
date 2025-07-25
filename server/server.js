const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

// Import database connection
const connectDB = require("./config/database")

// Import controllers
const productController = require("./controllers/productController")
const orderController = require("./controllers/orderController")

// Import Product model for seeding
const Product = require("./models/Product")

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Root route - IMPORTANT for Vercel
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Tip Tap Pay Backend API is running!",
    status: "OK",
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      orders: "/api/orders",
    },
    timestamp: new Date().toISOString(),
  })
})

// API Routes

// Product routes
app.get("/api/products", productController.getAllProducts)
app.get("/api/product/:id", productController.getProductById)
app.post("/api/products", productController.addProduct)
app.put("/api/product/:id/stock", productController.updateProductStock)
app.delete("/api/product/:id", productController.deleteProduct)

// Order routes
app.post("/api/orders", orderController.createOrder)
app.get("/api/order/:id", orderController.getOrderById)
app.get("/api/orders", orderController.getAllOrders)
app.put("/api/order/:id/status", orderController.updateOrderStatus)

// Seed database endpoint (for manual seeding) - UPDATED WITH IMAGES
app.post("/api/seed", async (req, res) => {
  try {
    const sampleProducts = [
      {
        id: "FOOD001",
        name: "Vada Pav",
        price: 25.0,
        image: "/images/vada-pav.jpg", // ✅ Real image path
        description: "Mumbai's famous street food - spicy potato fritter in bun",
        category: "Street Food",
        stock: 50,
      },
      {
        id: "FOOD002",
        name: "Pav Bhaji",
        price: 60.0,
        image: "/images/pav-bhaji.jpg", // ✅ Real image path
        description: "Spicy vegetable curry served with buttered bread rolls",
        category: "Street Food",
        stock: 30,
      },
      {
        id: "FOOD003",
        name: "Dosa",
        price: 45.0,
        image: "/images/dosa.jpg", // ✅ Real image path
        description: "Crispy South Indian crepe served with sambar and chutney",
        category: "South Indian",
        stock: 40,
      },
      {
        id: "FOOD004",
        name: "Biryani",
        price: 120.0,
        image: "/images/biryani.jpg", // ✅ Real image path
        description: "Aromatic basmati rice with spiced chicken/mutton",
        category: "Main Course",
        stock: 25,
      },
      {
        id: "FOOD005",
        name: "Samosa",
        price: 15.0,
        image: "/images/samosa.jpg", // ✅ Real image path
        description: "Crispy triangular pastry filled with spiced potatoes",
        category: "Snacks",
        stock: 100,
      },
    ]

    // Clear existing products
    await Product.deleteMany({})

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts)

    res.json({
      message: "Database seeded successfully with real images",
      count: insertedProducts.length,
      products: insertedProducts.map((p) => ({ id: p.id, name: p.name, image: p.image })),
    })
  } catch (error) {
    console.error("Seeding error:", error)
    res.status(500).json({ error: "Failed to seed database" })
  }
})

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running with MongoDB",
    database: "MongoDB",
    timestamp: new Date().toISOString(),
  })
})

// Test database connection endpoint
app.get("/api/db-status", async (req, res) => {
  const mongoose = require("mongoose")
  res.json({
    database: "MongoDB",
    status: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The route ${req.originalUrl} does not exist`,
    availableRoutes: ["GET /", "GET /api/health", "GET /api/products", "GET /api/product/:id", "POST /api/orders"],
  })
})

// Error handler
app.use((error, req, res, next) => {
  console.error("Server Error:", error)
  res.status(500).json({
    error: "Internal Server Error",
    message: error.message,
  })
})

// Export for Vercel
module.exports = app

// Start server (for local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Database: MongoDB`)
    console.log(`API endpoints available at http://localhost:${PORT}/api/`)
  })
}
