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

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

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

// Serve static files from React build (in production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")))

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Database: MongoDB`)
  console.log(`API endpoints available at http://localhost:${PORT}/api/`)
})
