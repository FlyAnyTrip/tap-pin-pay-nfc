const mongoose = require("mongoose")

let isConnected = false

const connectDB = async () => {
  // If already connected, return
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection")
    return
  }

  try {
    // MongoDB URI with error handling
    const mongoURI = process.env.MONGODB_URI

    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is not defined")
    }

    console.log("🔄 Connecting to MongoDB...")
    console.log("URI:", mongoURI.replace(/:[^:@]*@/, ":****@")) // Hide password in logs

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
    })

    isConnected = conn.connection.readyState === 1

    console.log(`✅ MongoDB Connected Successfully!`)
    console.log(`🌐 Host: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)

    return conn
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    isConnected = false

    // Don't throw error, let the app continue with error response
    return null
  }
}

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose connected to MongoDB Atlas")
  isConnected = true
})

mongoose.connection.on("error", (err) => {
  console.log("🔴 Mongoose connection error:", err.message)
  isConnected = false
})

mongoose.connection.on("disconnected", () => {
  console.log("🟡 Mongoose disconnected")
  isConnected = false
})

module.exports = connectDB
