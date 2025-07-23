"use client"

import { useEffect, useRef, useState } from "react"
import QrScanner from "qr-scanner"
import { useCart } from "../utils/CartContext.jsx"
import { getProductById } from "../utils/productData.js"
import { playBeepSound, playSuccessSound, preloadAudio } from "../utils/soundUtils.js"

const QRScannerComponent = ({ isActive = true, onProductAdded }) => {
  const videoRef = useRef(null)
  const scannerRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState("idle") // idle, scanning, success, error
  const [lastScanned, setLastScanned] = useState("")
  const [showMessage, setShowMessage] = useState("")
  const { addItemOnce, isItemInCart } = useCart()

  // Preload audio file on component mount
  useEffect(() => {
    preloadAudio()
  }, [])

  useEffect(() => {
    if (!isActive) {
      // Stop scanner if not active
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current.destroy()
        scannerRef.current = null
        setIsScanning(false)
      }
      return
    }

    const startScanner = async () => {
      try {
        if (videoRef.current && !scannerRef.current) {
          scannerRef.current = new QrScanner(videoRef.current, (result) => handleScanResult(result.data), {
            highlightScanRegion: false,
            highlightCodeOutline: false,
            preferredCamera: "environment",
          })

          await scannerRef.current.start()
          setIsScanning(true)
          console.log("📷 QR Scanner started")
        }
      } catch (error) {
        console.error("Error starting scanner:", error)
        setShowMessage("Camera access denied or not available")
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current.destroy()
        scannerRef.current = null
        setIsScanning(false)
        console.log("📷 QR Scanner stopped")
      }
    }
  }, [isActive])

  const handleScanResult = async (data) => {
    if (data === lastScanned) return // Prevent duplicate scans

    setLastScanned(data)
    setScanStatus("scanning")

    // Play custom beep sound from success.mp3
    playBeepSound()

    try {
      // Look up product in database via API
      const product = await getProductById(data)

      if (product) {
        // Check if product is already in cart
        if (isItemInCart(product.id)) {
          setTimeout(() => {
            setScanStatus("error")
            setShowMessage(`${product.name} is already in your cart! Use +/- buttons to change quantity.`)

            setTimeout(() => {
              setScanStatus("idle")
              setShowMessage("")
              setLastScanned("") // Reset to allow rescanning
            }, 3000)
          }, 500)
        } else {
          // Success - add to cart (only once)
          setTimeout(() => {
            setScanStatus("success")

            // Play custom success sound from success.mp3
            playSuccessSound()

            addItemOnce(product)
            setShowMessage(`✅ Added ${product.name} to cart!`)

            // Notify parent component
            if (onProductAdded) {
              onProductAdded(product)
            }

            setTimeout(() => {
              setScanStatus("idle")
              setShowMessage("")
              setLastScanned("") // Reset to allow rescanning
            }, 2000)
          }, 500)
        }
      } else {
        // Invalid QR code
        setTimeout(() => {
          setScanStatus("error")
          setShowMessage("❌ Invalid QR code - Product not found")

          setTimeout(() => {
            setScanStatus("idle")
            setShowMessage("")
            setLastScanned("") // Reset to allow rescanning
          }, 2000)
        }, 500)
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      setTimeout(() => {
        setScanStatus("error")
        setShowMessage("❌ Error connecting to server")

        setTimeout(() => {
          setScanStatus("idle")
          setShowMessage("")
          setLastScanned("") // Reset to allow rescanning
        }, 2000)
      }, 500)
    }
  }

  if (!isActive) {
    return (
      <div className="scanner-container" style={{ opacity: 0.5, pointerEvents: "none" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "400px",
            background: "#f5f5f5",
            borderRadius: "15px",
            color: "#666",
            fontSize: "18px",
          }}
        >
          📷 Scanner Disabled - Click "Add More Products" to scan
        </div>
      </div>
    )
  }

  return (
    <div className="scanner-container">
      <video ref={videoRef} className="scanner-video" playsInline muted />

      <div className="scanner-overlay">
        <div className={`scan-box ${scanStatus}`}>
          <div className="scan-corners"></div>
        </div>
      </div>

      {showMessage && <div className="success-message">{showMessage}</div>}

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          background: "rgba(0,0,0,0.7)",
          padding: "10px 20px",
          borderRadius: "20px",
          fontSize: "14px",
          textAlign: "center",
        }}
      >
        {isScanning ? "Point camera at QR code" : "Starting camera..."}
      </div>

      {/* Audio status indicator */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "5px 10px",
          borderRadius: "15px",
          fontSize: "12px",
        }}
      >
        🔊 Custom Sound Ready
      </div>
    </div>
  )
}

export default QRScannerComponent
