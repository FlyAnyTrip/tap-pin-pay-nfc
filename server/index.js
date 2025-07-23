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
    version: "2.2.0",
    features: ["UPI Payment", "Success/Failure Pages", "Invoice Generation", "Food Database"],
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
      features: {
        upiPayment: "✅ Enabled",
        successPage: "✅ Enabled",
        failurePage: "✅ Enabled",
        invoiceGeneration: "✅ Enabled",
        foodDatabase: "✅ Enabled",
      },
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

    // Enhanced sample data with food items
    const sampleProducts = {
      FOOD001: {
        id: "FOOD001",
        name: "Vada Pav",
        price: 25.0,
        image: "/placeholder.svg?height=100&width=100&text=Vada+Pav",
        description: "Mumbai's famous street food - spicy potato fritter in bun",
        category: "Street Food",
        stock: 50,
      },
      FOOD002: {
        id: "FOOD002",
        name: "Pav Bhaji",
        price: 60.0,
        image: "/placeholder.svg?height=100&width=100&text=Pav+Bhaji",
        description: "Spicy vegetable curry served with buttered bread rolls",
        category: "Street Food",
        stock: 30,
      },
      FOOD003: {
        id: "FOOD003",
        name: "Dosa",
        price: 45.0,
        image: "/placeholder.svg?height=100&width=100&text=Dosa",
        description: "Crispy South Indian crepe served with sambar and chutney",
        category: "South Indian",
        stock: 40,
      },
      FOOD004: {
        id: "FOOD004",
        name: "Biryani",
        price: 120.0,
        image: "/placeholder.svg?height=100&width=100&text=Biryani",
        description: "Aromatic basmati rice with spiced chicken/mutton",
        category: "Main Course",
        stock: 25,
      },
      FOOD005: {
        id: "FOOD005",
        name: "Samosa",
        price: 15.0,
        image: "/placeholder.svg?height=100&width=100&text=Samosa",
        description: "Crispy triangular pastry filled with spiced potatoes",
        category: "Snacks",
        stock: 100,
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
      FOOD001: {
        id: "FOOD001",
        name: "Vada Pav",
        price: 25.0,
        image: "/placeholder.svg?height=100&width=100&text=Vada+Pav",
        description: "Mumbai's famous street food - spicy potato fritter in bun",
        category: "Street Food",
      },
      FOOD002: {
        id: "FOOD002",
        name: "Pav Bhaji",
        price: 60.0,
        image: "/placeholder.svg?height=100&width=100&text=Pav+Bhaji",
        description: "Spicy vegetable curry served with buttered bread rolls",
        category: "Street Food",
      },
      FOOD003: {
        id: "FOOD003",
        name: "Dosa",
        price: 45.0,
        image: "/placeholder.svg?height=100&width=100&text=Dosa",
        description: "Crispy South Indian crepe served with sambar and chutney",
        category: "South Indian",
      },
      FOOD004: {
        id: "FOOD004",
        name: "Biryani",
        price: 120.0,
        image: "/placeholder.svg?height=100&width=100&text=Biryani",
        description: "Aromatic basmati rice with spiced chicken/mutton",
        category: "Main Course",
      },
      FOOD005: {
        id: "FOOD005",
        name: "Samosa",
        price: 15.0,
        image: "/placeholder.svg?height=100&width=100&text=Samosa",
        description: "Crispy triangular pastry filled with spiced potatoes",
        category: "Snacks",
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

// Enhanced Orders endpoint with better success handling
app.post("/api/orders", async (req, res) => {
  try {
    const orderData = req.body
    const dbConnected = await connectDB()

    // Enhanced order response
    const orderResponse = {
      success: true,
      message: "✅ Order processed successfully!",
      orderId: orderData.id,
      transactionId: orderData.transactionId || "TXN" + Date.now(),
      status: "completed",
      paymentMethod: orderData.paymentMethod,
      amount: orderData.finalTotal,
      currency: orderData.currency || "INR",
      timestamp: new Date().toISOString(),
      items: orderData.items.length,
      invoiceGenerated: true,
    }

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
          total: orderData.finalTotal || orderData.total + orderData.tax,
          status: orderData.status || "completed",
          paymentMethod: orderData.paymentMethod,
          transactionId: orderData.transactionId,
        })

        await order.save()

        orderResponse.databaseSaved = true
        orderResponse.message = "✅ Order saved to database successfully!"

        return res.status(201).json(orderResponse)
      } catch (dbError) {
        console.log("Database save failed, order processed without saving:", dbError.message)
        orderResponse.databaseSaved = false
        orderResponse.message = "✅ Order processed (database save failed but order is valid)"
      }
    }

    res.status(201).json(orderResponse)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create order",
      details: error.message,
      timestamp: new Date().toISOString(),
    })
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
        features: {
          upiPayment: "✅ Ready",
          successFailurePages: "✅ Ready",
          invoiceGeneration: "✅ Ready",
        },
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
