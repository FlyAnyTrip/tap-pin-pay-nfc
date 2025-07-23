const express = require("express")
const cors = require("cors")
require("dotenv").config()

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

// Environment variable debug endpoint
app.get("/api/debug", (req, res) => {
  res.json({
    mongoUri: process.env.MONGODB_URI ? "Environment variable exists" : "Environment variable missing",
    mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
    mongoUriStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + "..." : "Not found",
    allEnvVars: Object.keys(process.env).filter((key) => key.includes("MONGO")),
    nodeEnv: process.env.NODE_ENV,
  })
})

// Health check with detailed database connection
app.get("/api/health", async (req, res) => {
  try {
    // Check if environment variable exists
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        status: "ERROR",
        message: "MONGODB_URI environment variable not found",
        database: "Environment variable missing",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      })
    }

    // Try to connect to MongoDB
    const mongoose = require("mongoose")

    // Close existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }

    console.log("🔄 Attempting MongoDB connection...")
    console.log("URI exists:", !!process.env.MONGODB_URI)
    console.log("URI length:", process.env.MONGODB_URI?.length)

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    })

    console.log("✅ MongoDB connected successfully!")

    res.json({
      status: "OK",
      message: "Server is running",
      database: "Connected",
      dbHost: mongoose.connection.host,
      dbName: mongoose.connection.name,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    console.error("❌ Database connection error:", error.message)

    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      database: "Disconnected",
      error: error.message,
      mongoUriExists: !!process.env.MONGODB_URI,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    })
  }
})

// Simple products endpoint without database dependency
app.get("/api/products", (req, res) => {
  // Sample data for testing
  const sampleProducts = {
    PROD001: {
      id: "PROD001",
      name: "Wireless Bluetooth Headphones",
      price: 79.99,
      image: "/placeholder.svg?height=100&width=100&text=Headphones",
      description: "High-quality wireless headphones with noise cancellation",
    },
    PROD002: {
      id: "PROD002",
      name: "Smart Phone Case",
      price: 24.99,
      image: "/placeholder.svg?height=100&width=100&text=Phone+Case",
      description: "Protective case with wireless charging support",
    },
    PROD003: {
      id: "PROD003",
      name: "USB-C Cable",
      price: 12.99,
      image: "/placeholder.svg?height=100&width=100&text=USB+Cable",
      description: "Fast charging USB-C cable, 6ft length",
    },
  }

  res.json(sampleProducts)
})

// Simple product by ID endpoint
app.get("/api/product/:id", (req, res) => {
  const { id } = req.params

  const sampleProducts = {
    PROD001: {
      id: "PROD001",
      name: "Wireless Bluetooth Headphones",
      price: 79.99,
      image: "/placeholder.svg?height=100&width=100&text=Headphones",
      description: "High-quality wireless headphones with noise cancellation",
    },
    PROD002: {
      id: "PROD002",
      name: "Smart Phone Case",
      price: 24.99,
      image: "/placeholder.svg?height=100&width=100&text=Phone+Case",
      description: "Protective case with wireless charging support",
    },
    PROD003: {
      id: "PROD003",
      name: "USB-C Cable",
      price: 12.99,
      image: "/placeholder.svg?height=100&width=100&text=USB+Cable",
      description: "Fast charging USB-C cable, 6ft length",
    },
  }

  const product = sampleProducts[id.toUpperCase()]

  if (product) {
    res.json(product)
  } else {
    res.status(404).json({ error: "Product not found" })
  }
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: ["GET /", "GET /api/health", "GET /api/debug", "GET /api/products", "GET /api/product/:id"],
  })
})

module.exports = app
