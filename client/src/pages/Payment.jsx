"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../utils/CartContext.jsx"
import { createOrder } from "../utils/productData.js"

const Payment = () => {
  const { items, getTotal, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("demo")
  const navigate = useNavigate()

  // Calculate total in INR (₹1 per product for now)
  const getTotalINR = () => {
    return items.reduce((total, item) => total + 1 * item.quantity, 0) // ₹1 per item
  }

  const getTaxINR = () => {
    return Math.round(getTotalINR() * 0.18) // 18% GST in India
  }

  const getFinalTotalINR = () => {
    return getTotalINR() + getTaxINR()
  }

  const handleUPIPayment = () => {
    const totalAmount = getFinalTotalINR()
    const upiIntent = `upi://pay?pa=asinghvns99-2@okicici&pn=pay&am=${totalAmount}&tn=QR Scanner Purchase - Order ${Date.now()}&cu=INR`

    console.log("🔗 UPI Intent URL:", upiIntent)

    // Try to open UPI intent
    try {
      window.location.href = upiIntent

      // Show processing state
      setIsProcessing(true)

      // Simulate payment completion after user returns
      // In real app, you'd verify payment status via webhook/API
      setTimeout(() => {
        if (window.confirm("Did you complete the UPI payment successfully?")) {
          handlePaymentSuccess()
        } else {
          setIsProcessing(false)
          alert("Payment cancelled. Please try again.")
        }
      }, 3000)
    } catch (error) {
      console.error("Error opening UPI intent:", error)
      alert("Unable to open UPI app. Please ensure you have a UPI app installed.")
    }
  }

  const handleDemoPayment = async () => {
    setIsProcessing(true)

    // Simulate demo payment processing
    setTimeout(() => {
      handlePaymentSuccess()
    }, 2000)
  }

  const handlePaymentSuccess = async () => {
    try {
      // Create order in database
      const orderDetails = {
        id: "ORD" + Date.now(),
        items: [...items],
        total: getTotalINR(),
        tax: getTaxINR(),
        finalTotal: getFinalTotalINR(),
        paymentMethod: selectedPaymentMethod === "upi" ? "UPI Payment" : "Demo Payment",
        status: "completed",
        currency: "INR",
      }

      // Save to database
      await createOrder(orderDetails)

      // Store order details in localStorage for invoice
      localStorage.setItem(
        "lastOrder",
        JSON.stringify({
          ...orderDetails,
          date: new Date().toISOString(),
        }),
      )

      // Clear cart and redirect to invoice
      clearCart()
      navigate("/invoice")
    } catch (error) {
      console.error("Error creating order:", error)
      setIsProcessing(false)
      alert("Error processing payment. Please try again.")
    }
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="header">
          <h1>Payment</h1>
        </div>
        <div className="payment-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h3>🛒 No items in cart</h3>
            <p>Please add items before checkout.</p>
            <Link to="/" className="nav-btn" style={{ marginTop: "1rem" }}>
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Payment</h1>
        <p>Review your order and complete payment</p>
      </div>

      <div className="nav-buttons">
        <Link to="/cart" className="nav-btn secondary">
          ← Back to Cart
        </Link>
      </div>

      <div className="payment-container">
        <div className="payment-summary">
          <h3>📋 Order Summary</h3>

          {items.map((item) => (
            <div key={item.id} className="payment-item">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>₹{(1 * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="payment-item">
            <span>Subtotal</span>
            <span>₹{getTotalINR().toFixed(2)}</span>
          </div>

          <div className="payment-item">
            <span>GST (18%)</span>
            <span>₹{getTaxINR().toFixed(2)}</span>
          </div>

          <div className="payment-item">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className="payment-item payment-total">
            <span>Total</span>
            <span>₹{getFinalTotalINR().toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div style={{ marginBottom: "2rem" }}>
          <h3>💳 Select Payment Method</h3>

          {/* UPI Payment Option */}
          <div
            style={{
              padding: "1rem",
              border: selectedPaymentMethod === "upi" ? "2px solid #4CAF50" : "2px solid #ddd",
              borderRadius: "10px",
              background: selectedPaymentMethod === "upi" ? "#f8fff8" : "#f8f9fa",
              marginBottom: "1rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => setSelectedPaymentMethod("upi")}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={selectedPaymentMethod === "upi"}
                onChange={() => setSelectedPaymentMethod("upi")}
                style={{ marginRight: "0.5rem" }}
              />
              <strong>📱 UPI Payment</strong>
            </div>
            <p style={{ fontSize: "14px", color: "#666", margin: "0", paddingLeft: "1.5rem" }}>
              Pay securely using any UPI app (PhonePe, Google Pay, Paytm, etc.)
            </p>
            <p style={{ fontSize: "12px", color: "#888", margin: "0.5rem 0 0 1.5rem" }}>
              UPI ID: asinghvns99-2@okicici | Amount: ₹{getFinalTotalINR()}
            </p>
          </div>

          {/* Demo Payment Option */}
          <div
            style={{
              padding: "1rem",
              border: selectedPaymentMethod === "demo" ? "2px solid #2196F3" : "2px solid #ddd",
              borderRadius: "10px",
              background: selectedPaymentMethod === "demo" ? "#f8fbff" : "#f8f9fa",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => setSelectedPaymentMethod("demo")}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                type="radio"
                name="paymentMethod"
                value="demo"
                checked={selectedPaymentMethod === "demo"}
                onChange={() => setSelectedPaymentMethod("demo")}
                style={{ marginRight: "0.5rem" }}
              />
              <strong>🧪 Demo Payment</strong>
            </div>
            <p style={{ fontSize: "14px", color: "#666", margin: "0", paddingLeft: "1.5rem" }}>
              For testing purposes only - No real payment will be processed
            </p>
          </div>
        </div>

        {/* Payment Button */}
        {selectedPaymentMethod === "upi" ? (
          <button
            className="pay-btn"
            onClick={handleUPIPayment}
            disabled={isProcessing}
            style={{
              opacity: isProcessing ? 0.7 : 1,
              cursor: isProcessing ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
            }}
          >
            {isProcessing ? "🔄 Opening UPI App..." : `📱 Pay ₹${getFinalTotalINR()} via UPI`}
          </button>
        ) : (
          <button
            className="pay-btn"
            onClick={handleDemoPayment}
            disabled={isProcessing}
            style={{
              opacity: isProcessing ? 0.7 : 1,
              cursor: isProcessing ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
            }}
          >
            {isProcessing ? "🔄 Processing Demo Payment..." : `🧪 Demo Pay ₹${getFinalTotalINR()}`}
          </button>
        )}

        {isProcessing && (
          <div style={{ textAlign: "center", marginTop: "1rem", color: "#666" }}>
            {selectedPaymentMethod === "upi" ? (
              <div>
                <p>📱 Opening your UPI app...</p>
                <p>Complete the payment and return to this page</p>
                <p style={{ fontSize: "12px", color: "#888" }}>
                  If UPI app doesn't open, please ensure you have a UPI app installed
                </p>
              </div>
            ) : (
              <div>
                <p>Please wait while we process your payment...</p>
                <p>🔄 This may take a few seconds</p>
              </div>
            )}
          </div>
        )}

        {/* UPI Instructions */}
        {selectedPaymentMethod === "upi" && !isProcessing && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#e8f5e8",
              border: "1px solid #c3e6cb",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#155724" }}>📱 UPI Payment Instructions:</h4>
            <ol style={{ margin: "0", paddingLeft: "1.5rem", color: "#155724" }}>
              <li>Click the "Pay via UPI" button above</li>
              <li>Your UPI app will open automatically</li>
              <li>Verify the payment details</li>
              <li>Enter your UPI PIN to complete payment</li>
              <li>Return to this page after payment</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

export default Payment
