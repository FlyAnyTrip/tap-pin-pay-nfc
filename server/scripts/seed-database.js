const mongoose = require("mongoose")
const Product = require("../models/Product")
require("dotenv").config()

const sampleProducts = [
  {
    id: "PROD001",
    name: "Wireless Bluetooth Headphones",
    price: 79.99,
    image: "/placeholder.svg?height=100&width=100&text=Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    category: "Electronics",
    stock: 50,
  },
  {
    id: "PROD002",
    name: "Smart Phone Case",
    price: 24.99,
    image: "/placeholder.svg?height=100&width=100&text=Phone+Case",
    description: "Protective case with wireless charging support",
    category: "Accessories",
    stock: 100,
  },
  {
    id: "PROD003",
    name: "USB-C Cable",
    price: 12.99,
    image: "/placeholder.svg?height=100&width=100&text=USB+Cable",
    description: "Fast charging USB-C cable, 6ft length",
    category: "Cables",
    stock: 200,
  },
  {
    id: "PROD004",
    name: "Portable Power Bank",
    price: 39.99,
    image: "/placeholder.svg?height=100&width=100&text=Power+Bank",
    description: "10000mAh portable charger with fast charging",
    category: "Electronics",
    stock: 75,
  },
  {
    id: "PROD005",
    name: "Wireless Mouse",
    price: 29.99,
    image: "/placeholder.svg?height=100&width=100&text=Mouse",
    description: "Ergonomic wireless mouse with precision tracking",
    category: "Computer Accessories",
    stock: 120,
  },
  {
    id: "PROD006",
    name: "Smart Watch",
    price: 199.99,
    image: "/placeholder.svg?height=100&width=100&text=Smart+Watch",
    description: "Fitness tracking smartwatch with heart rate monitor",
    category: "Wearables",
    stock: 30,
  },
  {
    id: "PROD007",
    name: "Bluetooth Speaker",
    price: 49.99,
    image: "/placeholder.svg?height=100&width=100&text=Speaker",
    description: "Portable Bluetooth speaker with premium sound",
    category: "Audio",
    stock: 60,
  },
  {
    id: "PROD008",
    name: "Laptop Stand",
    price: 34.99,
    image: "/placeholder.svg?height=100&width=100&text=Laptop+Stand",
    description: "Adjustable aluminum laptop stand for better ergonomics",
    category: "Accessories",
    stock: 40,
  },
]

const seedDatabase = async () => {
  try {
    console.log("🚀 Starting database seeding process...")

    // Connect to your MongoDB Atlas database
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb+srv://alispatel1112003:eRu2Kpql6QWXajHA@cluster0.cke1m7w.mongodb.net/pin-tap-pay?retryWrites=true&w=majority&appName=Cluster0"

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ Connected to MongoDB Atlas")
    console.log(`📊 Database: ${mongoose.connection.name}`)

    // Check if products already exist
    const existingProducts = await Product.countDocuments()
    console.log(`📦 Existing products in database: ${existingProducts}`)

    if (existingProducts > 0) {
      console.log("⚠️  Products already exist. Clearing existing products...")
      await Product.deleteMany({})
      console.log("🗑️  Cleared existing products")
    }

    // Insert sample products
    console.log("📝 Inserting sample products...")
    const insertedProducts = await Product.insertMany(sampleProducts)
    console.log(`✅ Successfully inserted ${insertedProducts.length} products`)

    // Display inserted products
    console.log("\n📋 Inserted Products:")
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.id} - ${product.name} ($${product.price})`)
    })

    console.log("\n🎉 Database seeded successfully!")
    console.log("🔗 You can now test with QR codes: PROD001, PROD002, PROD003, etc.")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error.message)
    process.exit(1)
  }
}

seedDatabase()
