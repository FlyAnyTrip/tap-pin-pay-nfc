const mongoose = require("mongoose")

let isConnected = false

const connectDB = async () => {
  // If already connected, return
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection")
    return
  }

  try {
    // Use your MongoDB URI with specific database name
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb+srv://alispatel1112003:eRu2Kpql6QWXajHA@cluster0.cke1m7w.mongodb.net/pin-tap-pay?retryWrites=true&w=majority&appName=Cluster0"

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    })

    isConnected = conn.connection.readyState === 1

    console.log(`✅ MongoDB Connected Successfully!`)
    console.log(`🌐 Host: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)
    console.log(`🔗 Connection State: ${isConnected ? "Connected" : "Disconnected"}`)
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    isConnected = false
    throw error
  }
}

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose connected to MongoDB Atlas")
  isConnected = true
})

mongoose.connection.on("error", (err) => {
  console.log("🔴 Mongoose connection error:", err)
  isConnected = false
})

mongoose.connection.on("disconnected", () => {
  console.log("🟡 Mongoose disconnected")
  isConnected = false
})

module.exports = connectDB
