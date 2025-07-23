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
    origin: ["https://tap-pin-pay-frontend.vercel.app", "http://localhost:3000", /https:\/\/.*\.vercel\.app$/],
    credentials: true,
  }),
)
app.use(express.json())

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "QR Scanner API Server is running!",
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Health check with database test
app.get("/api/health", async (req, res) => {
  try {
    const dbConnection = await connectDB()

    res.json({
      status: "OK",
      message: "Server is running",
      database: dbConnection ? "Connected" : "Disconnected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Server running but database connection failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// Database connection middleware (non-blocking)
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    console.error("Database connection failed:", error.message)
    // Continue anyway, let individual routes handle DB errors
    next()
  }
})

// Product routes
app.get("/api/products", async (req, res) => {
  try {
    await connectDB()
    await productController.getAllProducts(req, res)
  } catch (error) {
    res.status(500).json({ error: "Database connection failed", details: error.message })
  }
})

app.get("/api/product/:id", async (req, res) => {
  try {
    await connectDB()
    await productController.getProductById(req, res)
  } catch (error) {
    res.status(500).json({ error: "Database connection failed", details: error.message })
  }
})

app.post("/api/products", async (req, res) => {
  try {
    await connectDB()
    await productController.addProduct(req, res)
  } catch (error) {
    res.status(500).json({ error: "Database connection failed", details: error.message })
  }
})

// Order routes
app.post("/api/orders", async (req, res) => {
  try {
    await connectDB()
    await orderController.createOrder(req, res)
  } catch (error) {
    res.status(500).json({ error: "Database connection failed", details: error.message })
  }
})

app.get("/api/order/:id", async (req, res) => {
  try {
    await connectDB()
    await orderController.getOrderById(req, res)
  } catch (error) {
    res.status(500).json({ error: "Database connection failed", details: error.message })
  }
})

// Database status endpoint
app.get("/api/db-status", async (req, res) => {
  try {
    const connection = await connectDB()
    const mongoose = require("mongoose")

    res.json({
      database: "MongoDB",
      status: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      connectionState: mongoose.connection.readyState,
      envCheck: process.env.MONGODB_URI ? "Environment variable exists" : "Environment variable missing",
    })
  } catch (error) {
    res.status(500).json({
      database: "MongoDB",
      status: "Connection Failed",
      error: error.message,
      envCheck: process.env.MONGODB_URI ? "Environment variable exists" : "Environment variable missing",
    })
  }
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      "GET /",
      "GET /api/health",
      "GET /api/db-status",
      "GET /api/products",
      "GET /api/product/:id",
      "POST /api/products",
      "POST /api/orders",
    ],
  })
})

module.exports = app
