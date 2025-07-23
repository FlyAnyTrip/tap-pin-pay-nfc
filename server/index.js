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

// MongoDB Connection with better error handling
let mongoose
let isConnected = false

const connectDB = async () => {
  try {
    // Import mongoose only when needed
    if (!mongoose) {
      mongoose = require("mongoose")
    }

    // If already connected, return
    if (isConnected && mongoose.connection.readyState === 1) {
      console.log("✅ Using existing MongoDB connection")
      return true
    }

    // Check environment variable
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI environment variable not found")
      return false
    }

    console.log("🔄 Attempting MongoDB connection...")
    console.log("URI length:", process.env.MONGODB_URI.length)
    console.log("URI starts with:", process.env.MONGODB_URI.substring(0, 25))

    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }

    // Connect with timeout
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // Increased timeout
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5, // Reduced pool size for serverless
      bufferCommands: false,
      bufferMaxEntries: 0,
    })

    isConnected = true
    console.log(`✅ MongoDB Connected Successfully!`)
    console.log(`🌐 Host: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)

    return true
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message)
    isConnected = false
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

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const dbConnected = await connectDB()

    res.json({
      status: "OK",
      message: "Server is running",
      database: dbConnected ? "Connected" : "Disconnected",
      mongoUri: process.env.MONGODB_URI ? "✅ Exists" : "❌ Missing",
      mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
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

// Database status with detailed info
app.get("/api/db-status", async (req, res) => {
  try {
    const dbConnected = await connectDB()

    if (!mongoose) {
      mongoose = require("mongoose")
    }

    res.json({
      database: "MongoDB",
      status: dbConnected ? "Connected" : "Disconnected",
      readyState: mongoose.connection.readyState,
      readyStateText: getReadyStateText(mongoose.connection.readyState),
      host: mongoose.connection.host || "Unknown",
      name: mongoose.connection.name || "Unknown",
      envCheck: process.env.MONGODB_URI ? "✅ Environment variable exists" : "❌ Missing",
      envLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
      envStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + "..." : "Not found",
      connectionAttempt: dbConnected ? "✅ Success" : "❌ Failed",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      database: "MongoDB",
      status: "Error",
      error: error.message,
      envCheck: process.env.MONGODB_URI ? "✅ Environment variable exists" : "❌ Missing",
      timestamp: new Date().toISOString(),
    })
  }
})

// Helper function for connection state
function getReadyStateText(state) {
  switch (state) {
    case 0:
      return "Disconnected"
    case 1:
      return "Connected"
    case 2:
      return "Connecting"
    case 3:
      return "Disconnecting"
    default:
      return "Unknown"
  }
}

// Test connection endpoint
app.get("/api/test-connection", async (req, res) => {
  try {
    console.log("🧪 Testing MongoDB connection...")

    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        success: false,
        error: "MONGODB_URI environment variable not found",
        envVars: Object.keys(process.env).filter((key) => key.includes("MONGO")),
      })
    }

    // Test connection with minimal config
    const mongoose = require("mongoose")

    // Disconnect first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }

    console.log("🔗 Attempting connection with URI:", process.env.MONGODB_URI.substring(0, 30) + "...")

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
    })

    res.json({
      success: true,
      message: "✅ MongoDB connection successful!",
      host: conn.connection.host,
      database: conn.connection.name,
      readyState: conn.connection.readyState,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Connection test failed:", error.message)

    res.status(500).json({
      success: false,
      error: error.message,
      errorCode: error.code,
      envUriExists: !!process.env.MONGODB_URI,
      envUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
      timestamp: new Date().toISOString(),
    })
  }
})

// Products endpoint (working without database)
app.get("/api/products", (req, res) => {
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
})

// Single product endpoint
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
})

// Orders endpoint
app.post("/api/orders", (req, res) => {
  try {
    const orderData = req.body

    res.status(201).json({
      message: "Order created successfully",
      orderId: "ORD" + Date.now(),
      status: "completed",
      timestamp: new Date().toISOString(),
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
      "GET /api/test-connection",
      "GET /api/products",
      "GET /api/product/:id",
      "POST /api/orders",
    ],
  })
})

module.exports = app
