const Product = require("../models/Product")

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ name: 1 })

    // Convert to object format for compatibility
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

    res.json(productsObj)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
}

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id
    const product = await Product.findOne({ id: productId })

    if (product) {
      res.json({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        category: product.category,
        stock: product.stock,
      })
    } else {
      res.status(404).json({ error: "Product not found" })
    }
  } catch (error) {
    console.error("Error fetching product:", error)
    res.status(500).json({ error: "Failed to fetch product" })
  }
}

// Add new product
const addProduct = async (req, res) => {
  try {
    const productData = req.body

    // Check if product with same ID already exists
    const existingProduct = await Product.findOne({ id: productData.id })
    if (existingProduct) {
      return res.status(400).json({ error: "Product with this ID already exists" })
    }

    const product = new Product(productData)
    await product.save()

    res.status(201).json({
      message: "Product added successfully",
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        category: product.category,
        stock: product.stock,
      },
    })
  } catch (error) {
    console.error("Error adding product:", error)
    res.status(500).json({ error: "Failed to add product" })
  }
}

// Update product stock
const updateProductStock = async (req, res) => {
  try {
    const productId = req.params.id
    const { stock } = req.body

    const product = await Product.findOneAndUpdate({ id: productId }, { stock }, { new: true })

    if (product) {
      res.json({ message: "Stock updated successfully", stock: product.stock })
    } else {
      res.status(404).json({ error: "Product not found" })
    }
  } catch (error) {
    console.error("Error updating stock:", error)
    res.status(500).json({ error: "Failed to update stock" })
  }
}

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id
    const product = await Product.findOneAndDelete({ id: productId })

    if (product) {
      res.json({ message: "Product deleted successfully" })
    } else {
      res.status(404).json({ error: "Product not found" })
    }
  } catch (error) {
    console.error("Error deleting product:", error)
    res.status(500).json({ error: "Failed to delete product" })
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProductStock,
  deleteProduct,
}
