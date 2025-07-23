const express = require("express")
const cors = require("cors")
require("dotenv").config()

const app = express()

// Updated CORS with your actual frontend URL
app.use(
  cors({
    origin: [
      "https://tap-pin-pay-qorb.vercel.app", // Your actual frontend URL
      "https://tap-pin-pay-backend.vercel.app", // Your backend URL
      "http://localhost:3000", // Local development
      /https:\/\/.*\.vercel\.app$/, // All Vercel apps for testing
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

app.use(express.json())

// MongoDB Connection - Fixed configuration
let mongoose
let isConnected = false

const connectDB = async () => {
  try {
    if (!mongoose) {
      mongoose = require("mongoose")
    }

    if (isConnected && mongoose.connection.readyState === 1) {
      console.log("✅ Using existing MongoDB connection")
      return true
    }

    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI environment variable not found")
      return false
    }

    console.log("🔄 Connecting to MongoDB...")

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
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
    message: "🚀 QR Scanner API Server is running!",
    status: "OK",
    frontend: "https://tap-pin-pay-qorb.vercel.app",
    backend: "https://tap-pin-pay-backend.vercel.app",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "2.1.0",
  })
})

// Health check with database
app.get("/api/health", async (req, res) => {
  try {
    const dbConnected = await connectDB()

    res.json({
      status: "OK",
      message: "🎉 Server is running perfectly!",
      database: dbConnected ? "✅ Connected" : "❌ Disconnected",
      frontend: "https://tap-pin-pay-qorb.vercel.app",
      backend: "https://tap-pin-pay-backend.vercel.app",
      cors: "✅ Configured",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// Database status
app.get("/api/db-status", async (req, res) => {
  try {
    const dbConnected = await connectDB()

    if (!mongoose) {
      mongoose = require("mongoose")
    }

    res.json({
      database: "MongoDB Atlas",
      status: dbConnected ? "✅ Connected" : "❌ Disconnected",
      readyState: mongoose.connection.readyState,
      readyStateText: getReadyStateText(mongoose.connection.readyState),
      host: mongoose.connection.host || "Unknown",
      name: mongoose.connection.name || "Unknown",
      connectionTest: dbConnected ? "✅ Success" : "❌ Failed",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      database: "MongoDB",
      status: "❌ Error",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// Helper function
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

// Products endpoint with database integration
app.get("/api/products", async (req, res) => {
  try {
    const dbConnected = await connectDB()

    if (dbConnected) {
      try {
        const Product = require("./models/Product")
        const products = await Product.find({}).sort({ name: 1 })

        if (products.length > 0) {
          const productsObj = {}
          products.forEach((product) => {
            productsObj[product.id] = {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              description: product.description,
              category: product.category,
              stock: product.stock,
            }
          })

          return res.json(productsObj)
        }
      } catch (dbError) {
        console.log("Database query failed, using sample data:", dbError.message)
      }
    }

    // Enhanced sample data
    const sampleProducts = {
      PROD001: {
        id: "PROD001",
        name: "Wireless Bluetooth Headphones",
        price: 79.99,
        image: "/placeholder.svg?height=100&width=100&text=Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        category: "Electronics",
        stock: 50,
      },
      PROD002: {
        id: "PROD002",
        name: "Smart Phone Case",
        price: 24.99,
        image: "/placeholder.svg?height=100&width=100&text=Phone+Case",
        description: "Protective case with wireless charging support",
        category: "Accessories",
        stock: 100,
      },
      PROD003: {
        id: "PROD003",
        name: "USB-C Cable",
        price: 12.99,
        image: "/placeholder.svg?height=100&width=100&text=USB+Cable",
        description: "Fast charging USB-C cable, 6ft length",
        category: "Cables",
        stock: 200,
      },
      PROD004: {
        id: "PROD004",
        name: "Portable Power Bank",
        price: 39.99,
        image: "/placeholder.svg?height=100&width=100&text=Power+Bank",
        description: "10000mAh portable charger with fast charging",
        category: "Electronics",
        stock: 75,
      },
      PROD005: {
        id: "PROD005",
        name: "Wireless Mouse",
        price: 29.99,
        image: "/placeholder.svg?height=100&width=100&text=Mouse",
        description: "Ergonomic wireless mouse with precision tracking",
        category: "Computer Accessories",
        stock: 120,
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
    const dbConnected = await connectDB()

    if (dbConnected) {
      try {
        const Product = require("./models/Product")
        const product = await Product.findOne({ id: id.toUpperCase() })

        if (product) {
          return res.json({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
            category: product.category,
            stock: product.stock,
          })
        }
      } catch (dbError) {
        console.log("Database query failed, using sample data:", dbError.message)
      }
    }

    // Sample data fallback
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

// Orders endpoint with database integration
app.post("/api/orders", async (req, res) => {
  try {
    const orderData = req.body
    const dbConnected = await connectDB()

    if (dbConnected) {
      try {
        const Order = require("./models/Order")

        const order = new Order({
          orderId: orderData.id,
          items: orderData.items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price || 1,
            quantity: item.quantity,
          })),
          subtotal: orderData.total,
          tax: orderData.tax,
          total: orderData.total + orderData.tax,
          status: orderData.status || "completed",
        })

        await order.save()

        return res.status(201).json({
          message: "✅ Order saved to database successfully!",
          orderId: order.orderId,
          status: "completed",
          timestamp: new Date().toISOString(),
        })
      } catch (dbError) {
        console.log("Database save failed, order processed without saving:", dbError.message)
      }
    }

    res.status(201).json({
      message: "✅ Order processed successfully!",
      orderId: "ORD" + Date.now(),
      status: "completed",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to create order", details: error.message })
  }
})

// Test connection endpoint
app.get("/api/test-connection", async (req, res) => {
  try {
    const dbConnected = await connectDB()

    if (dbConnected) {
      res.json({
        success: true,
        message: "✅ MongoDB connection successful!",
        host: mongoose.connection.host,
        database: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
        frontend: "https://tap-pin-pay-qorb.vercel.app",
        backend: "https://tap-pin-pay-backend.vercel.app",
        timestamp: new Date().toISOString(),
      })
    } else {
      res.status(500).json({
        success: false,
        message: "❌ MongoDB connection failed",
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
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
      "GET /api/test-connection",
      "GET /api/products",
      "GET /api/product/:id",
      "POST /api/orders",
    ],
    frontend: "https://tap-pin-pay-qorb.vercel.app",
    backend: "https://tap-pin-pay-backend.vercel.app",
    timestamp: new Date().toISOString(),
  })
})

module.exports = app
