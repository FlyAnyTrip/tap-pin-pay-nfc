// Your deployed backend URL
const API_BASE_URL = "https://tap-pin-pay-nfc-backend.vercel.app/api"

// Test API connection on load
const testConnection = async () => {
  try {
    console.log("🔄 Testing API connection to:", API_BASE_URL)
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

// Test connection immediately
testConnection()

export const getProductById = async (id) => {
  try {
    console.log(`🔍 Fetching product from: ${API_BASE_URL}/product/${id}`)
    const response = await fetch(`${API_BASE_URL}/product/${id}`)
    if (response.ok) {
      const product = await response.json()
      console.log("✅ Product found:", product)
      return product
    } else {
      console.log("❌ Product not found:", response.status)
      return null
    }
  } catch (error) {
    console.error("❌ Error fetching product:", error)
    return null
  }
}

export const getAllProducts = async () => {
  try {
    console.log(`📦 Fetching all products from: ${API_BASE_URL}/products`)
    const response = await fetch(`${API_BASE_URL}/products`)
    if (response.ok) {
      const products = await response.json()
      console.log("✅ Products fetched successfully:", Object.keys(products).length, "products")
      return products
    } else {
      console.log("❌ Failed to fetch products:", response.status)
      return {}
    }
  } catch (error) {
    console.error("❌ Error fetching products:", error)
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
      console.log("✅ Product added successfully:", result)
      return result
    } else {
      throw new Error("Failed to add product")
    }
  } catch (error) {
    console.error("❌ Error adding product:", error)
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
      console.log("✅ Stock updated successfully:", result)
      return result
    } else {
      throw new Error("Failed to update stock")
    }
  } catch (error) {
    console.error("❌ Error updating stock:", error)
    throw error
  }
}

export const createOrder = async (orderData) => {
  try {
    console.log("💳 Creating order at:", `${API_BASE_URL}/orders`)
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    if (response.ok) {
      const result = await response.json()
      console.log("✅ Order created successfully:", result)
      return result
    } else {
      throw new Error("Failed to create order")
    }
  } catch (error) {
    console.error("❌ Error creating order:", error)
    throw error
  }
}

export const getOrderById = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/order/${orderId}`)
    if (response.ok) {
      const order = await response.json()
      console.log("✅ Order fetched successfully:", order)
      return order
    } else {
      console.log("❌ Order not found:", response.status)
      return null
    }
  } catch (error) {
    console.error("❌ Error fetching order:", error)
    return null
  }
}

// Debug function to test API connectivity
export const testAPIConnection = async () => {
  return await testConnection()
}
