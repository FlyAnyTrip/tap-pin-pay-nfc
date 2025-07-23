const mongoose = require("mongoose")
const Product = require("../models/Product")
require("dotenv").config()

const sampleProducts = [
  // Electronics
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

  // Food Items - Indian Street Food
  {
    id: "FOOD001",
    name: "Vada Pav",
    price: 25.0,
    image: "/placeholder.svg?height=100&width=100&text=Vada+Pav",
    description: "Mumbai's famous street food - spicy potato fritter in bun",
    category: "Street Food",
    stock: 50,
  },
  {
    id: "FOOD002",
    name: "Pav Bhaji",
    price: 60.0,
    image: "/placeholder.svg?height=100&width=100&text=Pav+Bhaji",
    description: "Spicy vegetable curry served with buttered bread rolls",
    category: "Street Food",
    stock: 30,
  },
  {
    id: "FOOD003",
    name: "Dosa",
    price: 45.0,
    image: "/placeholder.svg?height=100&width=100&text=Dosa",
    description: "Crispy South Indian crepe served with sambar and chutney",
    category: "South Indian",
    stock: 40,
  },
  {
    id: "FOOD004",
    name: "Biryani",
    price: 120.0,
    image: "/placeholder.svg?height=100&width=100&text=Biryani",
    description: "Aromatic basmati rice with spiced chicken/mutton",
    category: "Main Course",
    stock: 25,
  },
  {
    id: "FOOD005",
    name: "Samosa",
    price: 15.0,
    image: "/placeholder.svg?height=100&width=100&text=Samosa",
    description: "Crispy triangular pastry filled with spiced potatoes",
    category: "Snacks",
    stock: 100,
  },
  {
    id: "FOOD006",
    name: "Chole Bhature",
    price: 80.0,
    image: "/placeholder.svg?height=100&width=100&text=Chole+Bhature",
    description: "Spicy chickpea curry with fluffy fried bread",
    category: "North Indian",
    stock: 20,
  },
  {
    id: "FOOD007",
    name: "Masala Chai",
    price: 10.0,
    image: "/placeholder.svg?height=100&width=100&text=Masala+Chai",
    description: "Traditional Indian spiced tea",
    category: "Beverages",
    stock: 200,
  },
  {
    id: "FOOD008",
    name: "Paneer Tikka",
    price: 90.0,
    image: "/placeholder.svg?height=100&width=100&text=Paneer+Tikka",
    description: "Grilled cottage cheese cubes with spices",
    category: "Appetizers",
    stock: 35,
  },
  {
    id: "FOOD009",
    name: "Butter Chicken",
    price: 150.0,
    image: "/placeholder.svg?height=100&width=100&text=Butter+Chicken",
    description: "Creamy tomato-based chicken curry",
    category: "Main Course",
    stock: 30,
  },
  {
    id: "FOOD010",
    name: "Gulab Jamun",
    price: 40.0,
    image: "/placeholder.svg?height=100&width=100&text=Gulab+Jamun",
    description: "Sweet milk dumplings in sugar syrup",
    category: "Desserts",
    stock: 60,
  },

  // Fast Food
  {
    id: "FOOD011",
    name: "Pizza Margherita",
    price: 180.0,
    image: "/placeholder.svg?height=100&width=100&text=Pizza",
    description: "Classic pizza with tomato sauce, mozzarella and basil",
    category: "Fast Food",
    stock: 25,
  },
  {
    id: "FOOD012",
    name: "Chicken Burger",
    price: 120.0,
    image: "/placeholder.svg?height=100&width=100&text=Burger",
    description: "Juicy chicken patty with lettuce, tomato and mayo",
    category: "Fast Food",
    stock: 40,
  },
  {
    id: "FOOD013",
    name: "French Fries",
    price: 50.0,
    image: "/placeholder.svg?height=100&width=100&text=Fries",
    description: "Crispy golden potato fries with salt",
    category: "Sides",
    stock: 80,
  },
  {
    id: "FOOD014",
    name: "Cold Coffee",
    price: 60.0,
    image: "/placeholder.svg?height=100&width=100&text=Cold+Coffee",
    description: "Refreshing iced coffee with milk and sugar",
    category: "Beverages",
    stock: 50,
  },
  {
    id: "FOOD015",
    name: "Chocolate Shake",
    price: 80.0,
    image: "/placeholder.svg?height=100&width=100&text=Shake",
    description: "Rich chocolate milkshake with whipped cream",
    category: "Beverages",
    stock: 30,
  },

  // Electronics (keeping some original items)
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
]

const seedDatabase = async () => {
  try {
    console.log("🚀 Starting database seeding process...")

    // Connect to MongoDB Atlas
    const mongoURI = process.env.MONGODB_URI

    if (!mongoURI) {
      console.error("❌ MONGODB_URI environment variable not found!")
      process.exit(1)
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ Connected to MongoDB Atlas")
    console.log(`📊 Database: ${mongoose.connection.name}`)

    // Check existing products
    const existingProducts = await Product.countDocuments()
    console.log(`📦 Existing products in database: ${existingProducts}`)

    if (existingProducts > 0) {
      console.log("⚠️  Products already exist. Do you want to:")
      console.log("1. Clear existing and add new products")
      console.log("2. Add new products without clearing")
      console.log("3. Exit without changes")

      // For automated seeding, we'll clear and add new
      console.log("🗑️  Clearing existing products...")
      await Product.deleteMany({})
      console.log("✅ Cleared existing products")
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
    console.log(`🌐 Test your API: https://tap-pin-pay-backend.vercel.app/api/products`)

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
}

module.exports = seedDatabase
