"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { showSuccess, showError, showInfo } from "../utils/notificationManager.js"

const Invoice = () => {
  const [orderDetails, setOrderDetails] = useState(null)

  useEffect(() => {
    const savedOrder = localStorage.getItem("lastOrder")
    if (savedOrder) {
      setOrderDetails(JSON.parse(savedOrder))
    }
  }, [])

  const downloadPDF = async () => {
    const element = document.getElementById("invoice-content")
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    })
    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF()
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`invoice-${orderDetails.id}.pdf`)
  }

  const printInvoice = () => {
    window.print()
  }

  const shareInvoice = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${orderDetails.id}`,
          text: `Order invoice for ₹${orderDetails.finalTotal}`,
          url: window.location.href,
        })
        showSuccess("Invoice shared successfully!")
      } catch (error) {
        console.log("Error sharing:", error)
        showError("Failed to share invoice.")
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      showInfo("Invoice link copied to clipboard!")
    }
  }

  if (!orderDetails) {
    return (
      <div className="container">
        <div className="header">
          <h1>Invoice</h1>
        </div>
        <div className="invoice-container">
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📄</div>
            <h3>No invoice found</h3>
            <p>Please complete a purchase first to generate an invoice.</p>
            <Link to="/" className="nav-btn" style={{ marginTop: "1rem" }}>
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const orderDate = new Date(orderDetails.date)
  const currency = orderDetails.currency || "INR"
  const currencySymbol = currency === "INR" ? "₹" : "$"

  return (
    <div className="container">
      <div className="header" style={{ background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)" }}>
        <h1>📄 Invoice Generated</h1>
        <p>Order completed successfully!</p>
      </div>

      <div className="nav-buttons">
        <button onClick={downloadPDF} className="nav-btn" style={{ background: "#28a745" }}>
          📄 Download PDF
        </button>
        <button onClick={printInvoice} className="nav-btn" style={{ background: "#17a2b8" }}>
          🖨️ Print Invoice
        </button>
        <button onClick={shareInvoice} className="nav-btn" style={{ background: "#ffc107", color: "#000" }}>
          📤 Share Invoice
        </button>
        <Link to="/" className="nav-btn">
          🛒 New Order
        </Link>
      </div>

      <div className="invoice-container" id="invoice-content">
        {/* Invoice Header */}
        <div className="invoice-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div>
              <h2 style={{ color: "#4CAF50", margin: "0" }}>🏪 QR Scanner Store</h2>
              <p style={{ margin: "0.5rem 0", color: "#666" }}>Digital Food & Electronics Store</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h3 style={{ color: "#333", margin: "0" }}>INVOICE</h3>
              <p style={{ margin: "0.5rem 0", color: "#666" }}>#{orderDetails.id}</p>
            </div>
          </div>

          {/* Payment Status Badge */}
          <div
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              background: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "20px",
              color: "#155724",
              fontWeight: "bold",
              marginBottom: "2rem",
            }}
          >
            ✅ Payment Successful
          </div>
        </div>

        {/* Order & Payment Details */}
        <div className="invoice-details">
          <div>
            <h4 style={{ color: "#4CAF50", borderBottom: "2px solid #4CAF50", paddingBottom: "0.5rem" }}>
              📋 Order Information
            </h4>
            <p>
              <strong>Order ID:</strong> {orderDetails.id}
            </p>
            <p>
              <strong>Date:</strong> {orderDate.toLocaleDateString("en-IN")}
            </p>
            <p>
              <strong>Time:</strong> {orderDate.toLocaleTimeString("en-IN")}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span style={{ color: "#28a745", fontWeight: "bold" }}>✅ {orderDetails.status}</span>
            </p>
            <p>
              <strong>Items Count:</strong> {orderDetails.items.length} items
            </p>
          </div>

          <div>
            <h4 style={{ color: "#4CAF50", borderBottom: "2px solid #4CAF50", paddingBottom: "0.5rem" }}>
              💳 Payment Information
            </h4>
            <p>
              <strong>Payment Method:</strong> {orderDetails.paymentMethod}
            </p>
            <p>
              <strong>Transaction ID:</strong> {orderDetails.transactionId}
            </p>
            <p>
              <strong>Payment Status:</strong>{" "}
              <span style={{ color: "#28a745", fontWeight: "bold" }}>✅ Completed</span>
            </p>
            <p>
              <strong>Currency:</strong> {currency}
            </p>
            {orderDetails.paymentMethod === "UPI Payment" && (
              <p>
                <strong>UPI ID:</strong> asinghvns99-2@okicici
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="invoice-items">
          <h4 style={{ color: "#4CAF50", borderBottom: "2px solid #4CAF50", paddingBottom: "0.5rem" }}>
            🛒 Items Ordered
          </h4>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #4CAF50", background: "#f8f9fa" }}>
                <th style={{ textAlign: "left", padding: "12px", color: "#333" }}>Item</th>
                <th style={{ textAlign: "center", padding: "12px", color: "#333" }}>Qty</th>
                <th style={{ textAlign: "right", padding: "12px", color: "#333" }}>Unit Price</th>
                <th style={{ textAlign: "right", padding: "12px", color: "#333" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.items.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>
                    <div>
                      <strong>{item.name}</strong>
                      {item.description && (
                        <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{item.description}</div>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: "center", padding: "12px" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right", padding: "12px" }}>
                    {currencySymbol}
                    {item.price.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right", padding: "12px", fontWeight: "bold" }}>
                    {currencySymbol}
                    {(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "2rem",
          }}
        >
          <div style={{ minWidth: "300px" }}>
            <div className="invoice-item" style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
              <span>Subtotal:</span>
              <span>
                {currencySymbol}
                {orderDetails.total.toFixed(2)}
              </span>
            </div>
            <div className="invoice-item" style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
              <span>{currency === "INR" ? "GST (18%)" : "Tax (8%)"}:</span>
              <span>
                {currencySymbol}
                {orderDetails.tax.toFixed(2)}
              </span>
            </div>
            <div className="invoice-item" style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
              <span>Shipping:</span>
              <span style={{ color: "#28a745", fontWeight: "bold" }}>Free</span>
            </div>
            <div
              className="invoice-item"
              style={{
                borderTop: "3px solid #4CAF50",
                paddingTop: "12px",
                marginTop: "8px",
                fontWeight: "bold",
                fontSize: "1.3rem",
                color: "#4CAF50",
              }}
            >
              <span>Total Paid:</span>
              <span>
                {currencySymbol}
                {(orderDetails.finalTotal || orderDetails.total + orderDetails.tax).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "3rem",
            textAlign: "center",
            color: "#666",
            fontSize: "14px",
            borderTop: "1px solid #eee",
            paddingTop: "2rem",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <h4 style={{ color: "#4CAF50", margin: "0 0 0.5rem 0" }}>🎉 Thank you for your purchase!</h4>
            <p style={{ margin: "0" }}>Your order has been confirmed and will be processed shortly.</p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <p style={{ margin: "0", fontWeight: "bold" }}>QR Scanner Store - Digital Commerce Platform</p>
            <p style={{ margin: "0" }}>📧 support@qrscanner.com | 📞 +91-9999999999</p>
            <p style={{ margin: "0" }}>🌐 www.qrscanner.com</p>
          </div>

          {orderDetails.paymentMethod === "UPI Payment" && (
            <div
              style={{
                background: "#e8f5e8",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #c3e6cb",
                marginTop: "1rem",
              }}
            >
              <p style={{ margin: "0", color: "#155724" }}>
                💳 Payment processed securely via UPI (asinghvns99-2@okicici)
              </p>
            </div>
          )}

          <p style={{ margin: "1rem 0 0 0", fontSize: "12px", color: "#999" }}>
            This is a computer-generated invoice. No signature required.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <div
          style={{
            background: "#f8f9fa",
            padding: "1.5rem",
            borderRadius: "10px",
            border: "1px solid #dee2e6",
          }}
        >
          <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>📱 Quick Actions</h4>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={downloadPDF}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              📄 Download PDF
            </button>
            <button
              onClick={printInvoice}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              🖨️ Print
            </button>
            <button
              onClick={shareInvoice}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#ffc107",
                color: "#000",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              📤 Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Invoice
