"use client"

import { useState, useEffect } from "react"
import { useCart } from "../utils/CartContext.jsx"
import { getAllProducts, getProductById } from "../utils/productData.js"
import { playSuccessSound } from "../utils/soundUtils.js"

const ManualProductEntry = ({ onProductAdded }) => {
  const [productId, setProductId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("") // success, error, info
  const [allProducts, setAllProducts] = useState({})
  const [showProductList, setShowProductList] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { addItemOnce, isItemInCart } = useCart()

  // Load all products on component mount
  useEffect(() => {
    loadAllProducts()
  }, [])

  const loadAllProducts = async () => {
    try {
      console.log("📦 Loading all products...")
      const products = await getAllProducts()
      setAllProducts(products)
      console.log("✅ Loaded", Object.keys(products).length, "products")
    } catch (error) {
      console.error("❌ Error loading products:", error)
      showMessage("Error loading products from database", "error")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!productId.trim()) {
      showMessage("Please enter a Product ID", "error")
      return
    }

    await addProductToCart(productId.trim().toUpperCase())
  }

  const addProductToCart = async (id) => {
    setIsLoading(true)
    showMessage("Looking up product...", "info")

    try {
      // Fetch product from database
      const product = await getProductById(id)

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
        showMessage(`❌ Product with ID "${id}" not found`, "error")
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
    const value = e.target.value.toUpperCase()
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

  // Filter products based on search and category
  const getFilteredProducts = () => {
    const products = Object.values(allProducts)

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory =
        selectedCategory === "all" || product.category?.toLowerCase() === selectedCategory.toLowerCase()

      return matchesSearch && matchesCategory
    })
  }

  // Get unique categories
  const getCategories = () => {
    const categories = [
      ...new Set(
        Object.values(allProducts)
          .map((p) => p.category)
          .filter(Boolean),
      ),
    ]
    return categories.sort()
  }

  const filteredProducts = getFilteredProducts()
  const categories = getCategories()

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ margin: "0", color: "#333" }}>📝 Manual Product Entry</h3>
        <button
          onClick={() => setShowProductList(!showProductList)}
          style={{
            padding: "0.5rem 1rem",
            background: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {showProductList ? "🔼 Hide Products" : "🔽 Show All Products"}
        </button>
      </div>

      {/* Manual ID Entry Form */}
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
            placeholder="Enter Product ID (e.g., FOOD001)"
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

      {/* Product List Section */}
      {showProductList && (
        <div style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h4 style={{ margin: "0", color: "#333" }}>🛒 Available Products ({filteredProducts.length})</h4>
            <button
              onClick={loadAllProducts}
              style={{
                padding: "0.5rem 1rem",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {/* Search and Filter */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: "1",
                minWidth: "200px",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                minWidth: "120px",
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Products Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
              maxHeight: "400px",
              overflowY: "auto",
              padding: "0.5rem",
              border: "1px solid #eee",
              borderRadius: "8px",
              background: "#fafafa",
            }}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "1rem",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)"
                    e.target.style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = "none"
                    e.target.style.transform = "translateY(0)"
                  }}
                  onClick={() => addProductToCart(product.id)}
                >
                  {/* Product Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      background: "#4CAF50",
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "12px",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    {product.id}
                  </div>

                  {/* Category Badge */}
                  {product.category && (
                    <div
                      style={{
                        position: "absolute",
                        top: "0.5rem",
                        left: "0.5rem",
                        background: "#2196F3",
                        color: "white",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "12px",
                        fontSize: "10px",
                      }}
                    >
                      {product.category}
                    </div>
                  )}

                  <div style={{ marginTop: "1.5rem" }}>
                    <h5 style={{ margin: "0 0 0.5rem 0", color: "#333", fontSize: "16px" }}>{product.name}</h5>
                    <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "12px", lineHeight: "1.4" }}>
                      {product.description}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "bold", color: "#4CAF50", fontSize: "18px" }}>
                        ₹{product.price.toFixed(2)}
                      </span>
                      {product.stock && <span style={{ fontSize: "12px", color: "#666" }}>Stock: {product.stock}</span>}
                    </div>
                  </div>

                  {/* Add Button */}
                  <button
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      background: isItemInCart(product.id) ? "#ffc107" : "#4CAF50",
                      color: isItemInCart(product.id) ? "#000" : "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      marginTop: "0.5rem",
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      addProductToCart(product.id)
                    }}
                  >
                    {isItemInCart(product.id) ? "✅ In Cart" : "➕ Add to Cart"}
                  </button>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", color: "#666" }}>
                {Object.keys(allProducts).length === 0 ? (
                  <div>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📦</div>
                    <p>Loading products...</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
                    <p>No products found matching your search.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Add Section */}
      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          background: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #dee2e6",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "14px", color: "#666" }}>⚡ Quick Add - Popular Items:</h4>

        {/* Food Items */}
        <div style={{ marginBottom: "1rem" }}>
          <h5 style={{ margin: "0 0 0.5rem 0", fontSize: "12px", color: "#333" }}>🍽️ Food:</h5>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {["FOOD001", "FOOD002", "FOOD003", "FOOD004", "FOOD005"].map((id) => {
              const product = allProducts[id]
              return (
                <button
                  key={id}
                  style={{
                    padding: "0.5rem 1rem",
                    background: isItemInCart(id) ? "#ffc107" : "#e9ecef",
                    color: isItemInCart(id) ? "#000" : "#333",
                    border: "1px solid #ddd",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => addProductToCart(id)}
                  onMouseEnter={(e) => {
                    if (!isItemInCart(id)) {
                      e.target.style.background = "#4CAF50"
                      e.target.style.color = "white"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isItemInCart(id)) {
                      e.target.style.background = "#e9ecef"
                      e.target.style.color = "#333"
                    }
                  }}
                >
                  {isItemInCart(id) ? "✅" : "+"} {id}
                  {product && ` - ₹${product.price}`}
                </button>
              )
            })}
          </div>
        </div>

        {/* Electronics */}
        <div style={{ marginBottom: "1rem" }}>
          <h5 style={{ margin: "0 0 0.5rem 0", fontSize: "12px", color: "#333" }}>📱 Electronics:</h5>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {["ELEC001", "ELEC002", "ELEC003", "ELEC004", "ELEC005"].map((id) => {
              const product = allProducts[id]
              return (
                <button
                  key={id}
                  style={{
                    padding: "0.5rem 1rem",
                    background: isItemInCart(id) ? "#ffc107" : "#e9ecef",
                    color: isItemInCart(id) ? "#000" : "#333",
                    border: "1px solid #ddd",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => addProductToCart(id)}
                  onMouseEnter={(e) => {
                    if (!isItemInCart(id)) {
                      e.target.style.background = "#2196F3"
                      e.target.style.color = "white"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isItemInCart(id)) {
                      e.target.style.background = "#e9ecef"
                      e.target.style.color = "#333"
                    }
                  }}
                >
                  {isItemInCart(id) ? "✅" : "+"} {id}
                  {product && ` - ₹${product.price}`}
                </button>
              )
            })}
          </div>
        </div>

        {/* Clothes */}
        <div style={{ marginBottom: "1rem" }}>
          <h5 style={{ margin: "0 0 0.5rem 0", fontSize: "12px", color: "#333" }}>👕 Clothes:</h5>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {["CLTH001", "CLTH002", "CLTH003", "CLTH004", "CLTH005"].map((id) => {
              const product = allProducts[id]
              return (
                <button
                  key={id}
                  style={{
                    padding: "0.5rem 1rem",
                    background: isItemInCart(id) ? "#ffc107" : "#e9ecef",
                    color: isItemInCart(id) ? "#000" : "#333",
                    border: "1px solid #ddd",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => addProductToCart(id)}
                  onMouseEnter={(e) => {
                    if (!isItemInCart(id)) {
                      e.target.style.background = "#9C27B0"
                      e.target.style.color = "white"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isItemInCart(id)) {
                      e.target.style.background = "#e9ecef"
                      e.target.style.color = "#333"
                    }
                  }}
                >
                  {isItemInCart(id) ? "✅" : "+"} {id}
                  {product && ` - ₹${product.price}`}
                </button>
              )
            })}
          </div>
        </div>

        <p style={{ fontSize: "11px", color: "#999", margin: "0.5rem 0 0 0" }}>
          Click on any Product ID above to add it instantly to your cart. Test NFC tags with these IDs!
        </p>
      </div>
    </div>
  )
}

export default ManualProductEntry
