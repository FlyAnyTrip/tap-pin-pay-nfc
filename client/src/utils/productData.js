// API-based product data functions
// Updated for your deployed backend
const API_BASE_URL = "https://tap-pin-pay-backend.vercel.app/api"

export const getProductById = async (id) => {
  try {
    console.log(`Fetching product from: ${API_BASE_URL}/product/${id}`)
    const response = await fetch(`${API_BASE_URL}/product/${id}`)
    if (response.ok) {
      const product = await response.json()
      console.log("Product fetched successfully:", product)
      return product
    } else {
      console.log("Product not found:", response.status)
      return null
    }
  } catch (error) {
    console.error("Error fetching product:", error)
    // Fallback to local data if API fails
    return productDatabase[id] || null
  }
}

export const getAllProducts = async () => {
  try {
    console.log(`Fetching all products from: ${API_BASE_URL}/products`)
    const response = await fetch(`${API_BASE_URL}/products`)
    if (response.ok) {
      const products = await response.json()
      console.log("Products fetched successfully:", Object.keys(products).length, "products")
      return products
    } else {
      console.log("Failed to fetch products:", response.status)
      return productDatabase
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return productDatabase
  }
}

export const addProduct = async (product) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    })

    if (response.ok) {
      const result = await response.json()
      return result
    } else {
      throw new Error("Failed to add product")
    }
  } catch (error) {
    console.error("Error adding product:", error)
    throw error
  }
}

export const updateProductStock = async (productId, stock) => {
  try {
    const response = await fetch(`${API_BASE_URL}/product/${productId}/stock`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stock }),
    })

    if (response.ok) {
      const result = await response.json()
      return result
    } else {
      throw new Error("Failed to update stock")
    }
  } catch (error) {
    console.error("Error updating stock:", error)
    throw error
  }
}

export const createOrder = async (orderData) => {
  try {
    console.log("Creating order at:", `${API_BASE_URL}/orders`)
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    if (response.ok) {
      const result = await response.json()
      console.log("Order created successfully:", result)
      return result
    } else {
      throw new Error("Failed to create order")
    }
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

export const getOrderById = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/order/${orderId}`)
    if (response.ok) {
      const order = await response.json()
      return order
    } else {
      return null
    }
  } catch (error) {
    console.error("Error fetching order:", error)
    return null
  }
}

// Sample product data for offline fallback
export const productDatabase = {
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

// Debug function to test API connectivity
export const testAPIConnection = async () => {
  try {
    console.log("Testing API connection...")
    const response = await fetch(`${API_BASE_URL}/health`)

    if (response.ok) {
      const result = await response.json()
      console.log("✅ API Connection successful:", result)
      return true
    } else {
      console.log("❌ API Connection failed:", response.status)
      return false
    }
  } catch (error) {
    console.error("❌ API Connection error:", error)
    return false
  }
}
