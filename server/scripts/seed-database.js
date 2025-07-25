const mongoose = require("mongoose")
const Product = require("../models/Product")
require("dotenv").config()

const sampleProducts = [
  {
    id: "FOOD001",
    name: "Vada Pav",
    price: 25.0,
    image: "/images/vada-pav.jpg", // ✅ Updated with real image
    description: "Mumbai's famous street food - spicy potato fritter in bun",
    category: "Street Food",
    stock: 50,
  },
  {
    id: "FOOD002",
    name: "Pav Bhaji",
    price: 60.0,
    image: "/images/pav-bhaji.jpg", // ✅ Updated with real image
    description: "Spicy vegetable curry served with buttered bread rolls",
    category: "Street Food",
    stock: 30,
  },
  {
    id: "FOOD003",
    name: "Dosa",
    price: 45.0,
    image: "/images/dosa.jpg", // ✅ Updated with real image
    description: "Crispy South Indian crepe served with sambar and chutney",
    category: "South Indian",
    stock: 40,
  },
  {
    id: "FOOD004",
    name: "Biryani",
    price: 120.0,
    image: "/images/biryani.jpg", // ✅ Updated with real image
    description: "Aromatic basmati rice with spiced chicken/mutton",
    category: "Main Course",
    stock: 25,
  },
  {
    id: "FOOD005",
    name: "Samosa",
    price: 15.0,
    image: "/images/samosa.jpg", // ✅ Updated with real image
    description: "Crispy triangular pastry filled with spiced potatoes",
    category: "Snacks",
    stock: 100,
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
    console.log("📝 Inserting sample products with real images...")
    const insertedProducts = await Product.insertMany(sampleProducts)
    console.log(`✅ Successfully inserted ${insertedProducts.length} products`)

    // Display inserted products
    console.log("\n📋 Inserted Products:")
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.id} - ${product.name} (₹${product.price}) - Image: ${product.image}`)
    })

    console.log("\n🎉 Database seeded successfully with real images!")
    console.log("🔗 You can now test with QR codes: FOOD001, FOOD002, FOOD003, etc.")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error.message)
    process.exit(1)
  }
}

seedDatabase()
