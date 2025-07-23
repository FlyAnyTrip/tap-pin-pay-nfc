const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

// Import database connection
const connectDB = require("./config/database")

// Import controllers
const productController = require("./controllers/productController")
const orderController = require("./controllers/orderController")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: [
      "https://qr-scanner-client-xyz.vercel.app", // Replace with your actual client URL after deployment
      "http://localhost:3000", // Keep for local development
      /https:\/\/.*\.vercel\.app$/, // Allow all vercel apps for testing
    ],
    credentials: true,
  }),
)
app.use(express.json())

// Connect to MongoDB for each request in serverless environment
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    console.error("Database connection failed:", error)
    res.status(500).json({ error: "Database connection failed" })
  }
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running with MongoDB",
    database: "MongoDB",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
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

// For Vercel serverless functions
if (process.env.NODE_ENV === "production") {
  // Export the Express app as a serverless function
  module.exports = app
} else {
  // For local development
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Database: MongoDB`)
    console.log(`API endpoints available at http://localhost:${PORT}/api/`)
  })
}
