"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

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
    const canvas = await html2canvas(element)
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

  if (!orderDetails) {
    return (
      <div className="container">
        <div className="header">
          <h1>Invoice</h1>
        </div>
        <div className="invoice-container">
          <p>No order found. Please complete a purchase first.</p>
          <Link to="/" className="nav-btn">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  const orderDate = new Date(orderDetails.date)
  const currency = orderDetails.currency || "INR"
  const currencySymbol = currency === "INR" ? "₹" : "$"

  return (
    <div className="container">
      <div className="header">
        <h1>Invoice</h1>
        <p>Order completed successfully!</p>
      </div>

      <div className="nav-buttons">
        <button onClick={downloadPDF} className="download-btn">
          📄 Download PDF
        </button>
        <button onClick={printInvoice} className="download-btn">
          🖨️ Print Invoice
        </button>
        <Link to="/" className="nav-btn">
          🛒 New Order
        </Link>
      </div>

      <div className="invoice-container" id="invoice-content">
        <div className="invoice-header">
          <h2>INVOICE</h2>
          <p>Order #{orderDetails.id}</p>
        </div>

        <div className="invoice-details">
          <div>
            <h4>Order Information</h4>
            <p>
              <strong>Order ID:</strong> {orderDetails.id}
            </p>
            <p>
              <strong>Date:</strong> {orderDate.toLocaleDateString()}
            </p>
            <p>
              <strong>Time:</strong> {orderDate.toLocaleTimeString()}
            </p>
            <p>
              <strong>Status:</strong> {orderDetails.status}
            </p>
          </div>

          <div>
            <h4>Payment Information</h4>
            <p>
              <strong>Payment Method:</strong> {orderDetails.paymentMethod || "Demo Payment"}
            </p>
            <p>
              <strong>Transaction ID:</strong> TXN{Date.now()}
            </p>
            <p>
              <strong>Payment Status:</strong> Completed
            </p>
            <p>
              <strong>Currency:</strong> {currency}
            </p>
          </div>
        </div>

        <div className="invoice-items">
          <h4>Items Ordered</h4>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd" }}>
                <th style={{ textAlign: "left", padding: "10px" }}>Item</th>
                <th style={{ textAlign: "center", padding: "10px" }}>Qty</th>
                <th style={{ textAlign: "right", padding: "10px" }}>Price</th>
                <th style={{ textAlign: "right", padding: "10px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.items.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>{item.name}</td>
                  <td style={{ textAlign: "center", padding: "10px" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right", padding: "10px" }}>{currencySymbol}1.00</td>
                  <td style={{ textAlign: "right", padding: "10px" }}>
                    {currencySymbol}
                    {(1 * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "2rem",
          }}
        >
          <div style={{ minWidth: "300px" }}>
            <div className="invoice-item">
              <span>Subtotal:</span>
              <span>
                {currencySymbol}
                {orderDetails.total.toFixed(2)}
              </span>
            </div>
            <div className="invoice-item">
              <span>{currency === "INR" ? "GST (18%)" : "Tax (8%)"}:</span>
              <span>
                {currencySymbol}
                {orderDetails.tax.toFixed(2)}
              </span>
            </div>
            <div className="invoice-item">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div
              className="invoice-item"
              style={{
                borderTop: "2px solid #4CAF50",
                paddingTop: "10px",
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
            >
              <span>Total:</span>
              <span>
                {currencySymbol}
                {(orderDetails.finalTotal || orderDetails.total + orderDetails.tax).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "3rem",
            textAlign: "center",
            color: "#666",
            fontSize: "14px",
          }}
        >
          <p>Thank you for your purchase!</p>
          <p>QR Scanner Store - Demo Application</p>
          {orderDetails.paymentMethod === "UPI Payment" && <p>Payment processed via UPI (asinghvns99-2@okicici)</p>}
        </div>
      </div>
    </div>
  )
}

export default Invoice
