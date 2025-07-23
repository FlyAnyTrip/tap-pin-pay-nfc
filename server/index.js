const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
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

// MongoDB Connection Function
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined")
    }

    console.log("🔄 Connecting to MongoDB...")

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    return true
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    return false
  }
}

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "QR Scanner API Server is running!",
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Health check with database connection
app.get("/api/health", async (req, res) => {
  try {
    const isConnected = await connectDB()

    res.json({
      status: "OK",
      message: "Server is running",
      database: isConnected ? "Connected" : "Disconnected",
      mongoUri: process.env.MONGODB_URI ? "Environment variable exists" : "Missing",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Health check failed",
      database: "Error",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// Database status endpoint
app.get("/api/db-status", async (req, res) => {
  try {
    const isConnected = await connectDB()

    res.json({
      database: "MongoDB",
      status: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      host: mongoose.connection.host || "Unknown",
      name: mongoose.connection.name || "Unknown",
      readyState: mongoose.connection.readyState,
      envCheck: process.env.MONGODB_URI ? "✅ Environment variable exists" : "❌ Environment variable missing",
      connectionTest: isConnected ? "✅ Connection successful" : "❌ Connection failed",
    })
  } catch (error) {
    res.status(500).json({
      database: "MongoDB",
      status: "Error",
      error: error.message,
      envCheck: process.env.MONGODB_URI ? "✅ Environment variable exists" : "❌ Environment variable missing",
    })
  }
})

// Products endpoint with sample data
app.get("/api/products", async (req, res) => {
  try {
    // Sample products data
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
      PROD004: {
        id: "PROD004",
        name: "Portable Power Bank",
        price: 39.99,
        image: "/placeholder.svg?height=100&width=100&text=Power+Bank",
        description: "10000mAh portable charger with fast charging",
      },
      PROD005: {
        id: "PROD005",
        name: "Wireless Mouse",
        price: 29.99,
        image: "/placeholder.svg?height=100&width=100&text=Mouse",
        description: "Ergonomic wireless mouse with precision tracking",
      },
    }

    res.json(sampleProducts)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products", details: error.message })
  }
})

// Single product endpoint
app.get("/api/product/:id", async (req, res) => {
  try {
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
      PROD004: {
        id: "PROD004",
        name: "Portable Power Bank",
        price: 39.99,
        image: "/placeholder.svg?height=100&width=100&text=Power+Bank",
        description: "10000mAh portable charger with fast charging",
      },
      PROD005: {
        id: "PROD005",
        name: "Wireless Mouse",
        price: 29.99,
        image: "/placeholder.svg?height=100&width=100&text=Mouse",
        description: "Ergonomic wireless mouse with precision tracking",
      },
    }

    const product = sampleProducts[id.toUpperCase()]

    if (product) {
      res.json(product)
    } else {
      res.status(404).json({ error: "Product not found" })
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product", details: error.message })
  }
})

// Orders endpoint (simple version)
app.post("/api/orders", async (req, res) => {
  try {
    const orderData = req.body

    // For now, just return success without database
    res.status(201).json({
      message: "Order created successfully",
      orderId: "ORD" + Date.now(),
      status: "completed",
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to create order", details: error.message })
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
      "POST /api/orders",
    ],
  })
})

module.exports = app
