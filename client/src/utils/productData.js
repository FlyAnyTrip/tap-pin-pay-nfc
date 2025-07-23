// API-based product data functions
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "/api" // Use relative path in production
    : import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/product/${id}`)
    if (response.ok) {
      const product = await response.json()
      return product
    } else {
      return null
    }
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export const getAllProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`)
    if (response.ok) {
      const products = await response.json()
      return products
    } else {
      return {}
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return {}
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
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    if (response.ok) {
      const result = await response.json()
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
