"use client"

import { useState } from "react"
import { useCart } from "../utils/CartContext.jsx"
import { getProductById } from "../utils/productData.js"
import { playSuccessSound } from "../utils/soundUtils.js"

const ManualProductEntry = ({ onProductAdded }) => {
  const [productId, setProductId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("") // success, error, info
  const { addItemOnce, isItemInCart } = useCart()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!productId.trim()) {
      showMessage("Please enter a Product ID", "error")
      return
    }

    setIsLoading(true)
    showMessage("Looking up product...", "info")

    try {
      // Fetch product from database
      const product = await getProductById(productId.trim().toUpperCase())

      if (product) {
        // Check if product is already in cart
        if (isItemInCart(product.id)) {
          showMessage(`${product.name} is already in your cart! Use +/- buttons to change quantity.`, "error")
        } else {
          // Success - add to cart
          addItemOnce(product)
          playSuccessSound()
          showMessage(`✅ Successfully added ${product.name} to cart!`, "success")

          // Notify parent component
          if (onProductAdded) {
            onProductAdded(product)
          }

          // Clear input after successful addition
          setProductId("")
        }
      } else {
        showMessage(`❌ Product with ID "${productId.trim().toUpperCase()}" not found`, "error")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      showMessage("❌ Error connecting to server. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const showMessage = (msg, type) => {
    setMessage(msg)
    setMessageType(type)

    // Auto-clear message after 4 seconds
    setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 4000)
  }

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase() // Convert to uppercase for consistency
    setProductId(value)

    // Clear message when user starts typing
    if (message) {
      setMessage("")
      setMessageType("")
    }
  }

  const getMessageStyle = () => {
    const baseStyle = {
      padding: "0.75rem",
      borderRadius: "8px",
      marginTop: "1rem",
      fontSize: "14px",
      textAlign: "center",
      transition: "all 0.3s ease",
    }

    switch (messageType) {
      case "success":
        return {
          ...baseStyle,
          background: "#d4edda",
          border: "1px solid #c3e6cb",
          color: "#155724",
        }
      case "error":
        return {
          ...baseStyle,
          background: "#f8d7da",
          border: "1px solid #f5c6cb",
          color: "#721c24",
        }
      case "info":
        return {
          ...baseStyle,
          background: "#d1ecf1",
          border: "1px solid #bee5eb",
          color: "#0c5460",
        }
      default:
        return baseStyle
    }
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: "15px",
        padding: "1.5rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        margin: "1rem 0",
      }}
    >
      <h3 style={{ marginBottom: "1rem", color: "#333", textAlign: "center" }}>📝 Manual Product Entry</h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="productId"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#555",
            }}
          >
            Product ID:
          </label>
          <input
            type="text"
            id="productId"
            value={productId}
            onChange={handleInputChange}
            placeholder="Enter Product ID (e.g., PROD001)"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "2px solid #ddd",
              borderRadius: "8px",
              fontSize: "16px",
              textTransform: "uppercase",
              transition: "border-color 0.3s ease",
              opacity: isLoading ? 0.7 : 1,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4CAF50"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#ddd"
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !productId.trim()}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: isLoading || !productId.trim() ? "#ccc" : "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: isLoading || !productId.trim() ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            opacity: isLoading || !productId.trim() ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading && productId.trim()) {
              e.target.style.transform = "translateY(-2px)"
              e.target.style.boxShadow = "0 4px 8px rgba(76, 175, 80, 0.3)"
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)"
            e.target.style.boxShadow = "none"
          }}
        >
          {isLoading ? "🔄 Adding Product..." : "➕ Add to Cart"}
        </button>
      </form>

      {message && <div style={getMessageStyle()}>{message}</div>}

      {/* Sample Product IDs */}
      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          background: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #dee2e6",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "14px", color: "#666" }}>💡 Sample Product IDs to try:</h4>
        <div style={{ fontSize: "12px", color: "#888" }}>
          <span
            style={{
              display: "inline-block",
              margin: "2px 4px",
              padding: "2px 6px",
              background: "#e9ecef",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => setProductId("PROD001")}
          >
            PROD001
          </span>
          <span
            style={{
              display: "inline-block",
              margin: "2px 4px",
              padding: "2px 6px",
              background: "#e9ecef",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => setProductId("PROD002")}
          >
            PROD002
          </span>
          <span
            style={{
              display: "inline-block",
              margin: "2px 4px",
              padding: "2px 6px",
              background: "#e9ecef",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => setProductId("PROD003")}
          >
            PROD003
          </span>
          <span
            style={{
              display: "inline-block",
              margin: "2px 4px",
              padding: "2px 6px",
              background: "#e9ecef",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => setProductId("PROD004")}
          >
            PROD004
          </span>
          <span
            style={{
              display: "inline-block",
              margin: "2px 4px",
              padding: "2px 6px",
              background: "#e9ecef",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => setProductId("PROD005")}
          >
            PROD005
          </span>
        </div>
        <p style={{ fontSize: "11px", color: "#999", margin: "0.5rem 0 0 0" }}>
          Click on any Product ID above to auto-fill the input field
        </p>
      </div>
    </div>
  )
}

export default ManualProductEntry
