// "use client"

// import { useState } from "react"
// import { Link } from "react-router-dom"
// import QRScannerComponent from "../components/QRScanner.jsx"
// import ManualProductEntry from "../components/ManualProductEntry.jsx"
// import { useCart } from "../utils/CartContext.jsx"

// const Home = () => {
//   const { getItemCount, items, clearCart } = useCart()
//   const [isScannerActive, setIsScannerActive] = useState(true)
//   const [lastAddedProduct, setLastAddedProduct] = useState(null)
//   const [showManualEntry, setShowManualEntry] = useState(false)

//   const handleProductAdded = (product) => {
//     setLastAddedProduct(product)
//     // Disable scanner after adding a product
//     setIsScannerActive(false)
//   }

//   const handleAddMoreProducts = () => {
//     setIsScannerActive(true)
//     setLastAddedProduct(null)
//   }

//   const handleClearCart = () => {
//     if (window.confirm("Are you sure you want to clear your cart? This will also reset the scanner history.")) {
//       clearCart()
//       // Reset scanned products history
//       if (window.resetScannedProducts) {
//         window.resetScannedProducts()
//       }
//       setLastAddedProduct(null)
//       setIsScannerActive(true)
//     }
//   }

//   const toggleManualEntry = () => {
//     setShowManualEntry(!showManualEntry)
//   }

//   return (
//     <div className="container">
//       <div className="header">
//         <h1>QR Code Scanner</h1>
//         <p>Scan products to add them to your cart</p>
//       </div>

//       <div className="nav-buttons">
//         <Link to="/cart" className="nav-btn secondary">
//           🛒 Cart ({getItemCount()})
//         </Link>
//         {items.length > 0 && (
//           <Link to="/cart" className="nav-btn">
//             View Cart & Checkout
//           </Link>
//         )}
//         <button
//           onClick={toggleManualEntry}
//           className="nav-btn"
//           style={{ background: showManualEntry ? "#ff9800" : "#2196f3" }}
//         >
//           {showManualEntry ? "📷 Show Scanner" : "📝 Manual Entry"}
//         </button>
//         {items.length > 0 && (
//           <button onClick={handleClearCart} className="nav-btn danger">
//             🗑️ Clear Cart
//           </button>
//         )}
//       </div>

//       {/* Scanner Status */}
//       {!isScannerActive && lastAddedProduct && !showManualEntry && (
//         <div
//           style={{
//             background: "#d4edda",
//             border: "1px solid #c3e6cb",
//             borderRadius: "10px",
//             padding: "1rem",
//             margin: "1rem 0",
//             textAlign: "center",
//             color: "#155724",
//           }}
//         >
//           <h3>✅ Product Added Successfully!</h3>
//           <p>
//             <strong>{lastAddedProduct.name}</strong> has been added to your cart.
//           </p>
//           <p>Use the cart to modify quantities or scan more products.</p>
//         </div>
//       )}

//       {/* Add More Products Button */}
//       {!isScannerActive && !showManualEntry && (
//         <div style={{ textAlign: "center", margin: "1rem 0" }}>
//           <button
//             onClick={handleAddMoreProducts}
//             className="nav-btn"
//             style={{
//               background: "#28a745",
//               fontSize: "1.1rem",
//               padding: "1rem 2rem",
//             }}
//           >
//             📱 Add More Products
//           </button>
//         </div>
//       )}

//       {/* Manual Product Entry or QR Scanner */}
//       {showManualEntry ? (
//         <ManualProductEntry onProductAdded={handleProductAdded} />
//       ) : (
//         <QRScannerComponent isActive={isScannerActive} onProductAdded={handleProductAdded} />
//       )}

//       <div
//         style={{
//           textAlign: "center",
//           marginTop: "2rem",
//           padding: "1rem",
//           background: "white",
//           borderRadius: "10px",
//           boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//         }}
//       >
//         <h3>How to use:</h3>

//         {showManualEntry ? (
//           <ol style={{ textAlign: "left", maxWidth: "400px", margin: "1rem auto" }}>
//             <li>Enter a valid Product ID in the input field</li>
//             <li>Click "Add to Cart" button</li>
//             <li>Product will be fetched and added automatically</li>
//             <li>Use +/- buttons in cart to change quantities</li>
//             <li>Switch to scanner mode for QR code scanning</li>
//           </ol>
//         ) : (
//           <ol style={{ textAlign: "left", maxWidth: "400px", margin: "1rem auto" }}>
//             <li>Point your camera at a QR code</li>
//             <li>Wait for the green animation and beep sound</li>
//             <li>Product will be added to cart (only once per unique product)</li>
//             <li>Duplicate scans of same product are ignored</li>
//             <li>Use +/- buttons in cart to change quantities</li>
//             <li>Click "Add More Products" to scan additional items</li>
//           </ol>
//         )}

//         <div style={{ marginTop: "1rem", fontSize: "14px", color: "#666" }}>
//           <p>
//             <strong>Sample Product IDs to test:</strong>
//           </p>
//           <p>PROD001, PROD002, PROD003, PROD004, PROD005</p>
//         </div>

//         {/* Current Cart Summary */}
//         {items.length > 0 && (
//           <div
//             style={{
//               marginTop: "1rem",
//               padding: "1rem",
//               background: "#f8f9fa",
//               borderRadius: "8px",
//               border: "1px solid #dee2e6",
//             }}
//           >
//             <h4>🛒 Current Cart Summary:</h4>
//             <div style={{ fontSize: "14px", color: "#666" }}>
//               {items.map((item) => (
//                 <div key={item.id} style={{ margin: "0.5rem 0" }}>
//                   {item.name} - Qty: {item.quantity} - ₹{(1 * item.quantity).toFixed(2)}
//                 </div>
//               ))}
//               <div style={{ fontWeight: "bold", marginTop: "0.5rem", fontSize: "16px", color: "#333" }}>
//                 Total: ₹{items.reduce((total, item) => total + 1 * item.quantity, 0).toFixed(2)}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Feature Info */}
//         <div
//           style={{
//             marginTop: "1rem",
//             padding: "1rem",
//             background: "#e7f3ff",
//             border: "1px solid #b3d9ff",
//             borderRadius: "8px",
//             fontSize: "13px",
//             color: "#0066cc",
//           }}
//         >
//           <h4 style={{ margin: "0 0 0.5rem 0" }}>🆕 New Features:</h4>
//           <ul style={{ textAlign: "left", margin: "0", paddingLeft: "1.5rem" }}>
//             <li>
//               <strong>Smart Duplicate Prevention:</strong> Same QR code won't beep or add duplicates
//             </li>
//             <li>
//               <strong>Manual Product Entry:</strong> Add products by typing Product ID
//             </li>
//             <li>
//               <strong>Custom Sound:</strong> Uses your success.mp3 file for audio feedback
//             </li>
//             <li>
//               <strong>UPI Payment:</strong> Real UPI integration with dynamic amounts
//             </li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Home



// "use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import QRScannerComponent from "../components/QRScanner.jsx"
import ManualProductEntry from "../components/ManualProductEntry.jsx"
import { useCart } from "../utils/CartContext.jsx"
import NFCReaderComponent from "../components/NFCReader.jsx"

const Home = () => {
  const { getItemCount, items, clearCart } = useCart()
  const [isScannerActive, setIsScannerActive] = useState(true)
  const [lastAddedProduct, setLastAddedProduct] = useState(null)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [scanMode, setScanMode] = useState("qr") // "qr" or "nfc"

  const handleProductAdded = (product) => {
    setLastAddedProduct(product)
    // Disable scanner after adding a product
    setIsScannerActive(false)
  }

  const handleAddMoreProducts = () => {
    setIsScannerActive(true)
    setLastAddedProduct(null)
  }

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart? This will also reset the scanner history.")) {
      clearCart()
      // Reset scanned products history
      if (window.resetScannedProducts) {
        window.resetScannedProducts()
      }
      setLastAddedProduct(null)
      setIsScannerActive(true)
    }
  }

  const toggleManualEntry = () => {
    setShowManualEntry(!showManualEntry)
  }

  return (
    <div className="container">
      <div className="header">
        <h1>QR Code Scanner</h1>
        <p>Scan products to add them to your cart</p>
      </div>

      <div className="nav-buttons">
        <Link to="/cart" className="nav-btn secondary">
          🛒 Cart ({getItemCount()})
        </Link>
        {items.length > 0 && (
          <Link to="/cart" className="nav-btn">
            View Cart & Checkout
          </Link>
        )}
        <Link to="/nfc-manager" className="nav-btn" style={{ background: "#9C27B0" }}>
          📱 NFC Manager
        </Link>
        <button
          onClick={() => setScanMode("qr")}
          className="nav-btn"
          style={{ background: scanMode === "qr" ? "#4CAF50" : "#2196f3" }}
        >
          {scanMode === "qr" ? "📷 QR Active" : "📷 QR Scanner"}
        </button>
        <button
          onClick={() => setScanMode("nfc")}
          className="nav-btn"
          style={{ background: scanMode === "nfc" ? "#4CAF50" : "#FF9800" }}
        >
          {scanMode === "nfc" ? "📱 NFC Active" : "📱 NFC Reader"}
        </button>
        <button
          onClick={toggleManualEntry}
          className="nav-btn"
          style={{ background: showManualEntry ? "#ff9800" : "#2196f3" }}
        >
          {showManualEntry ? "📷 Show Scanner" : "📝 Manual Entry"}
        </button>
        {items.length > 0 && (
          <button onClick={handleClearCart} className="nav-btn danger">
            🗑️ Clear Cart
          </button>
        )}
      </div>

      {/* Scanner Status */}
      {!isScannerActive && lastAddedProduct && !showManualEntry && (
        <div
          style={{
            background: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "10px",
            padding: "1rem",
            margin: "1rem 0",
            textAlign: "center",
            color: "#155724",
          }}
        >
          <h3>✅ Product Added Successfully!</h3>
          <p>
            <strong>{lastAddedProduct.name}</strong> has been added to your cart.
          </p>
          <p>Use the cart to modify quantities or scan more products.</p>
        </div>
      )}

      {/* Add More Products Button */}
      {!isScannerActive && !showManualEntry && (
        <div style={{ textAlign: "center", margin: "1rem 0" }}>
          <button
            onClick={handleAddMoreProducts}
            className="nav-btn"
            style={{
              background: "#28a745",
              fontSize: "1.1rem",
              padding: "1rem 2rem",
            }}
          >
            📱 Add More Products
          </button>
        </div>
      )}

      {/* Manual Product Entry, QR Scanner, or NFC Reader */}
      {showManualEntry ? (
        <ManualProductEntry onProductAdded={handleProductAdded} />
      ) : scanMode === "qr" ? (
        <QRScannerComponent isActive={isScannerActive} onProductAdded={handleProductAdded} />
      ) : (
        <NFCReaderComponent isActive={isScannerActive} onProductAdded={handleProductAdded} />
      )}

      <div
        style={{
          textAlign: "center",
          marginTop: "2rem",
          padding: "1rem",
          background: "white",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3>How to use:</h3>

        {showManualEntry ? (
          <ol style={{ textAlign: "left", maxWidth: "400px", margin: "1rem auto" }}>
            <li>Browse all available products in the list below</li>
            <li>Click on any product card to add it to cart</li>
            <li>Or enter a Product ID manually and click "Add to Cart"</li>
            <li>Use search and category filters to find products easily</li>
            <li>Use +/- buttons in cart to change quantities</li>
            <li>Switch to scanner mode for QR code or NFC scanning</li>
          </ol>
        ) : scanMode === "qr" ? (
          <ol style={{ textAlign: "left", maxWidth: "400px", margin: "1rem auto" }}>
            <li>Point your camera at a QR code</li>
            <li>Wait for the green animation and beep sound</li>
            <li>Product will be added to cart (only once per unique product)</li>
            <li>Duplicate scans of same product are ignored</li>
            <li>Use +/- buttons in cart to change quantities</li>
            <li>Click "Add More Products" to scan additional items</li>
          </ol>
        ) : (
          <ol style={{ textAlign: "left", maxWidth: "400px", margin: "1rem auto" }}>
            <li>Hold your device near an NFC tag</li>
            <li>Wait for the blue animation and beep sound</li>
            <li>Product will be added to cart automatically</li>
            <li>Duplicate taps of same product are ignored</li>
            <li>Use +/- buttons in cart to change quantities</li>
            <li>Click "Add More Products" to read additional tags</li>
          </ol>
        )}

        <div style={{ marginTop: "1rem", fontSize: "14px", color: "#666" }}>
          <p>
            <strong>Sample Product IDs to test:</strong>
          </p>
          <p>FOOD001, FOOD002, FOOD003, FOOD004, FOOD005</p>
        </div>

        {/* Current Cart Summary */}
        {items.length > 0 && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
            }}
          >
            <h4>🛒 Current Cart Summary:</h4>
            <div style={{ fontSize: "14px", color: "#666" }}>
              {items.map((item) => (
                <div key={item.id} style={{ margin: "0.5rem 0" }}>
                  {item.name} - Qty: {item.quantity} - ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              ))}
              <div style={{ fontWeight: "bold", marginTop: "0.5rem", fontSize: "16px", color: "#333" }}>
                Total: ₹{items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Feature Info */}
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#e7f3ff",
            border: "1px solid #b3d9ff",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#0066cc",
          }}
        >
          <h4 style={{ margin: "0 0 0.5rem 0" }}>🆕 New Features:</h4>
          <ul style={{ textAlign: "left", margin: "0", paddingLeft: "1.5rem" }}>
            <li>
              <strong>Smart Product Browser:</strong> View all products with search and filters
            </li>
            <li>
              <strong>One-Click Add:</strong> Click any product card to add to cart instantly
            </li>
            <li>
              <strong>Category Filters:</strong> Filter by Street Food, South Indian, etc.
            </li>
            <li>
              <strong>Real-time Search:</strong> Search by name, ID, or description
            </li>
            <li>
              <strong>Indian Currency:</strong> All prices now shown in ₹ (Rupees)
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Home
