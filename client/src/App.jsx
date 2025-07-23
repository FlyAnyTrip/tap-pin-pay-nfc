import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { CartProvider } from "./utils/CartContext.jsx"
import Home from "./pages/Home.jsx"
import Cart from "./pages/Cart.jsx"
import Payment from "./pages/Payment.jsx"
import Invoice from "./pages/Invoice.jsx"
import "./App.css"

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/invoice" element={<Invoice />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  )
}

export default App
