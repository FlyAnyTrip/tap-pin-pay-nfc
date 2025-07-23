const express = require("express")
const cors = require("cors")
require("dotenv").config()

// Import database connection
const connectDB = require("./config/database")

// Import controllers
const productController = require("./controllers/productController")
const orderController = require("./controllers/orderController")

const app = express()

// Middleware
app.use(
  cors({
    origin: [
      "https://tap-pin-pay-frontend.vercel.app", // Your client URL
      "http://localhost:3000",
      /https:\/\/.*\.vercel\.app$/,
    ],
    credentials: true,
  }),
)
app.use(express.json())

// Connect to MongoDB
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    console.error("Database connection failed:", error)
    res.status(500).json({ error: "Database connection failed" })
  }
})

// Root route for testing
app.get("/", (req, res) => {
  res.json({
    message: "QR Scanner API Server is running!",
    status: "OK",
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running with MongoDB",
    database: "MongoDB",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

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

// Database status
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
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      "GET /",
      "GET /api/health",
      "GET /api/products",
      "GET /api/product/:id",
      "POST /api/products",
      "POST /api/orders",
    ],
  })
})

// Export for Vercel
module.exports = app
