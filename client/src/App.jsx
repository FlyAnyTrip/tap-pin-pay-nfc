import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { CartProvider } from "./utils/CartContext.jsx"
import Home from "./pages/Home.jsx"
import Cart from "./pages/Cart.jsx"
import Payment from "./pages/Payment.jsx"
import Invoice from "./pages/Invoice.jsx"
import NFCManager from "./pages/NFCManager.jsx"
import "./App.css"

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#ffffff",
                color: "#1f2937",
                border: "1px solid #e5e7eb",
                borderRadius: "0.75rem",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                fontSize: "0.875rem",
                fontWeight: "500",
                padding: "1rem 1.25rem",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#ffffff",
                },
                style: {
                  borderLeft: "4px solid #10b981",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff",
                },
                style: {
                  borderLeft: "4px solid #ef4444",
                },
              },
              loading: {
                iconTheme: {
                  primary: "#6366f1",
                  secondary: "#ffffff",
                },
                style: {
                  borderLeft: "4px solid #6366f1",
                },
              },
            }}
            // Prevent duplicate toasts
            containerStyle={{
              top: 20,
              right: 20,
            }}
            // Limit the number of toasts shown at once
            visibleToasts={3}
            // Remove toasts when they're dismissed
            reverseOrder={false}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/nfc-manager" element={<NFCManager />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  )
}

export default App
