"use client"

import { useEffect, useRef, useState } from "react"
import { useCart } from "../utils/CartContext.jsx"
import { getProductById } from "../utils/productData.js"
import { playBeepSound, playSuccessSound, preloadAudio } from "../utils/soundUtils.js"

const NFCReaderComponent = ({ isActive = true, onProductAdded }) => {
  const [isReading, setIsReading] = useState(false)
  const [nfcStatus, setNfcStatus] = useState("idle") // idle, reading, success, error
  const [lastRead, setLastRead] = useState("")
  const [showMessage, setShowMessage] = useState("")
  const [isNFCSupported, setIsNFCSupported] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const { addItemOnce, isItemInCart } = useCart()
  const abortControllerRef = useRef(null)
  const ndefReaderRef = useRef(null)

  // Check NFC support on component mount
  useEffect(() => {
    checkNFCSupport()
    preloadAudio()
  }, [])

  // Start/stop NFC reading based on isActive prop
  useEffect(() => {
    if (!isActive || !isNFCSupported) {
      stopNFCReading()
      return
    }

    if (isActive && isNFCSupported) {
      startNFCReading()
    }

    return () => {
      stopNFCReading()
    }
  }, [isActive, isNFCSupported])

  const checkNFCSupport = () => {
    // Check if Web NFC API is supported
    if ("NDEFReader" in window) {
      setIsNFCSupported(true)
      console.log("✅ Web NFC API is supported")
      setShowMessage("NFC is supported on this device")
    } else {
      setIsNFCSupported(false)
      console.log("❌ Web NFC API is not supported")
      setShowMessage("NFC is not supported on this device or browser")
    }
  }

  const requestNFCPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: "nfc" })
      console.log("📱 NFC permission status:", permission.state)

      if (permission.state === "granted") {
        setPermissionGranted(true)
        return true
      } else if (permission.state === "prompt") {
        // Permission will be requested when we try to scan
        return true
      } else {
        setPermissionGranted(false)
        setShowMessage("NFC permission denied. Please enable NFC permissions.")
        return false
      }
    } catch (error) {
      console.log("⚠️ Could not check NFC permissions:", error)
      // Continue anyway, permission will be requested during scan
      return true
    }
  }

  const startNFCReading = async () => {
    if (!isNFCSupported || isReading) return

    try {
      setIsReading(true)
      setNfcStatus("reading")
      setShowMessage("Requesting NFC permissions...")

      // Request permission first
      const hasPermission = await requestNFCPermission()
      if (!hasPermission) {
        setIsReading(false)
        setNfcStatus("error")
        return
      }

      setShowMessage("Ready to read NFC tags - Tap a product tag")

      // Create new AbortController for this reading session
      abortControllerRef.current = new AbortController()

      // Create NDEFReader instance using native Web NFC API
      ndefReaderRef.current = new window.NDEFReader()

      // Start scanning
      await ndefReaderRef.current.scan({ signal: abortControllerRef.current.signal })
      console.log("📱 NFC Reader started successfully")

      // Add event listeners
      ndefReaderRef.current.addEventListener("reading", handleNFCReading)
      ndefReaderRef.current.addEventListener("readingerror", handleNFCError)

      setPermissionGranted(true)
      setShowMessage("🎯 NFC Reader Active - Tap an NFC tag")
    } catch (error) {
      console.error("❌ Error starting NFC reader:", error)
      setIsReading(false)
      setNfcStatus("error")

      if (error.name === "NotAllowedError") {
        setShowMessage("❌ NFC access denied. Please allow NFC permissions in your browser settings.")
      } else if (error.name === "NotSupportedError") {
        setShowMessage("❌ NFC is not supported on this device.")
        setIsNFCSupported(false)
      } else if (error.name === "NotReadableError") {
        setShowMessage("❌ NFC is disabled. Please enable NFC in your device settings.")
      } else {
        setShowMessage(`❌ NFC Error: ${error.message || "Unknown error occurred"}`)
      }
    }
  }

  const stopNFCReading = () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }

      if (ndefReaderRef.current) {
        ndefReaderRef.current.removeEventListener("reading", handleNFCReading)
        ndefReaderRef.current.removeEventListener("readingerror", handleNFCError)
        ndefReaderRef.current = null
      }

      setIsReading(false)
      setNfcStatus("idle")
      console.log("📱 NFC Reader stopped")
    } catch (error) {
      console.error("Error stopping NFC reader:", error)
    }
  }

  const handleNFCReading = (event) => {
    console.log("📱 NFC tag detected:", event.serialNumber)
    handleNFCRead(event.message, event.serialNumber)
  }

  const handleNFCError = (error) => {
    console.error("❌ NFC reading error:", error)
    setNfcStatus("error")
    setShowMessage("❌ Error reading NFC tag. Please try again.")

    setTimeout(() => {
      if (isReading) {
        setNfcStatus("reading")
        setShowMessage("🎯 Ready to read NFC tags - Tap a product tag")
      }
    }, 2000)
  }

  const handleNFCRead = async (message, serialNumber) => {
    try {
      console.log("📱 Processing NFC tag:", serialNumber)
      console.log("📄 NFC message records:", message.records.length)

      // Extract product ID from NFC message
      let productId = null

      for (const record of message.records) {
        console.log("📋 Record type:", record.recordType)
        console.log("📋 Record data:", record.data)

        if (record.recordType === "text") {
          try {
            // Improved text record decoding
            const textDecoder = new TextDecoder("utf-8")
            let text = ""

            // Handle different text record formats
            if (record.data.byteLength > 0) {
              // Check if it's a proper NDEF text record (starts with language code)
              const firstByte = new Uint8Array(record.data)[0]

              if (firstByte < 32) {
                // Likely has language code prefix, skip it
                const languageCodeLength = firstByte & 0x3f
                const textData = record.data.slice(1 + languageCodeLength)
                text = textDecoder.decode(textData)
              } else {
                // Direct text data
                text = textDecoder.decode(record.data)
              }
            }

            console.log("📄 Decoded NFC text:", text)

            // Clean up the text and check for product ID format
            const cleanText = text.trim().toUpperCase()

            // Check if it matches ANY product ID format (FOOD, ELEC, CLTH, BOOK, HOME, SPRT)
            const productMatch = cleanText.match(/^(FOOD|ELEC|CLTH|BOOK|HOME|SPRT)\d{3}$/i)
            if (productMatch) {
              productId = cleanText
              console.log("✅ Found product ID in text:", productId)
              break
            }

            // Also try to extract from longer text (in case there's extra info)
            const extractMatch = cleanText.match(/(FOOD|ELEC|CLTH|BOOK|HOME|SPRT)\d{3}/i)
            if (extractMatch) {
              productId = extractMatch[0].toUpperCase()
              console.log("✅ Extracted product ID from text:", productId)
              break
            }
          } catch (decodeError) {
            console.error("Error decoding text record:", decodeError)

            // Fallback: try raw bytes as ASCII
            try {
              const rawText = String.fromCharCode(...new Uint8Array(record.data))
              console.log("📄 Raw text fallback:", rawText)
              const fallbackMatch = rawText.match(/(FOOD|ELEC|CLTH|BOOK|HOME|SPRT)\d{3}/i)
              if (fallbackMatch) {
                productId = fallbackMatch[0].toUpperCase()
                console.log("✅ Found product ID in raw text:", productId)
                break
              }
            } catch (rawError) {
              console.error("Raw text fallback failed:", rawError)
            }
          }
        } else if (record.recordType === "url") {
          try {
            // Handle URL record
            const url = new TextDecoder().decode(record.data)
            console.log("🔗 NFC URL content:", url)

            // Extract product ID from URL (e.g., https://example.com/product/ELEC001)
            const urlMatch = url.match(/\/product\/([A-Z0-9]+)$/i)
            if (urlMatch) {
              const extractedId = urlMatch[1].toUpperCase()
              // Verify it matches our product ID pattern
              if (extractedId.match(/^(FOOD|ELEC|CLTH|BOOK|HOME|SPRT)\d{3}$/)) {
                productId = extractedId
                console.log("✅ Found product ID in URL:", productId)
                break
              }
            }
          } catch (decodeError) {
            console.error("Error decoding URL record:", decodeError)
          }
        }
      }

      if (!productId) {
        console.log("❌ No valid product ID found in NFC tag")
        setNfcStatus("error")
        setShowMessage("❌ Invalid NFC tag - No product information found")

        setTimeout(() => {
          if (isReading) {
            setNfcStatus("reading")
            setShowMessage("🎯 Ready to read NFC tags - Tap a product tag")
          }
        }, 3000)
        return
      }

      // Prevent duplicate reads within 2 seconds
      if (productId === lastRead) {
        console.log("⚠️ Duplicate NFC read ignored:", productId)
        return
      }

      setLastRead(productId)
      setNfcStatus("reading")
      setShowMessage(`🔍 Processing ${productId}...`)

      // Play beep sound
      playBeepSound()

      // Look up product in database
      console.log("🔍 Looking up product:", productId)
      const product = await getProductById(productId)

      if (product) {
        console.log("✅ Product found:", product.name)

        // Check if product is already in cart
        if (isItemInCart(product.id)) {
          setTimeout(() => {
            setNfcStatus("error")
            setShowMessage(`⚠️ ${product.name} is already in your cart! Use +/- buttons to change quantity.`)

            setTimeout(() => {
              if (isReading) {
                setNfcStatus("reading")
                setShowMessage("🎯 Ready to read NFC tags - Tap a product tag")
                setLastRead("") // Reset to allow re-reading
              }
            }, 4000)
          }, 500)
        } else {
          // Success - add to cart
          setTimeout(() => {
            setNfcStatus("success")
            playSuccessSound()
            addItemOnce(product)
            setShowMessage(`✅ Added ${product.name} to cart via NFC!`)

            // Notify parent component
            if (onProductAdded) {
              onProductAdded(product)
            }

            setTimeout(() => {
              if (isReading) {
                setNfcStatus("reading")
                setShowMessage("🎯 Ready to read NFC tags - Tap a product tag")
                setLastRead("") // Reset to allow re-reading
              }
            }, 3000)
          }, 500)
        }
      } else {
        // Invalid product ID
        console.log("❌ Product not found:", productId)
        setTimeout(() => {
          setNfcStatus("error")
          setShowMessage(`❌ Product ${productId} not found in database`)

          setTimeout(() => {
            if (isReading) {
              setNfcStatus("reading")
              setShowMessage("🎯 Ready to read NFC tags - Tap a product tag")
              setLastRead("") // Reset to allow re-reading
            }
          }, 3000)
        }, 500)
      }

      // Clear last read after 2 seconds to allow re-reading
      setTimeout(() => {
        setLastRead("")
      }, 2000)
    } catch (error) {
      console.error("❌ Error processing NFC tag:", error)
      setNfcStatus("error")
      setShowMessage("❌ Error processing NFC tag. Please try again.")

      setTimeout(() => {
        if (isReading) {
          setNfcStatus("reading")
          setShowMessage("🎯 Ready to read NFC tags - Tap a product tag")
          setLastRead("") // Reset to allow re-reading
        }
      }, 3000)
    }
  }

  if (!isActive) {
    return (
      <div className="nfc-container" style={{ opacity: 0.5, pointerEvents: "none" }}>
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
            textAlign: "center",
            padding: "2rem",
          }}
        >
          📱 NFC Reader Disabled
          <br />
          <small>Click "Add More Products" to activate</small>
        </div>
      </div>
    )
  }

  if (!isNFCSupported) {
    return (
      <div className="nfc-container">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "400px",
            background: "#fff3cd",
            border: "2px solid #ffeaa7",
            borderRadius: "15px",
            color: "#856404",
            fontSize: "16px",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📱</div>
          <h3>NFC Not Supported</h3>
          <p>Your device or browser doesn't support NFC functionality.</p>
          <div style={{ fontSize: "14px", marginTop: "1rem", textAlign: "left" }}>
            <p>
              <strong>NFC is supported on:</strong>
            </p>
            <ul style={{ paddingLeft: "1.5rem" }}>
              <li>Android devices with Chrome browser</li>
              <li>Requires HTTPS connection</li>
              <li>NFC must be enabled in device settings</li>
            </ul>
          </div>
          <p style={{ fontSize: "14px", marginTop: "1rem", fontWeight: "bold" }}>
            Please use QR code scanning instead.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="nfc-container">
      <div
        style={{
          position: "relative",
          maxWidth: "500px",
          margin: "0 auto",
          background: "white",
          borderRadius: "15px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          height: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* NFC Animation */}
        <div
          style={{
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${
              nfcStatus === "reading"
                ? "#2196F3"
                : nfcStatus === "success"
                  ? "#4CAF50"
                  : nfcStatus === "error"
                    ? "#f44336"
                    : "#666"
            } 0%, ${
              nfcStatus === "reading"
                ? "#1976D2"
                : nfcStatus === "success"
                  ? "#45a049"
                  : nfcStatus === "error"
                    ? "#d32f2f"
                    : "#555"
            } 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "2rem",
            animation: nfcStatus === "reading" ? "nfcPulse 2s infinite" : "none",
          }}
        >
          <div style={{ fontSize: "4rem", color: "white" }}>
            {nfcStatus === "reading" ? "📡" : nfcStatus === "success" ? "✅" : nfcStatus === "error" ? "❌" : "📱"}
          </div>
        </div>

        {/* Status Message */}
        <div
          style={{
            textAlign: "center",
            padding: "1rem",
            fontSize: "16px",
            fontWeight: "bold",
            color: nfcStatus === "success" ? "#4CAF50" : nfcStatus === "error" ? "#f44336" : "#333",
            minHeight: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {showMessage || "Initializing NFC reader..."}
        </div>

        {/* Instructions */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#666",
            background: "rgba(255,255,255,0.95)",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "12px",
            textAlign: "center",
            border: "1px solid #ddd",
            maxWidth: "90%",
          }}
        >
          {isReading ? "Hold device near NFC tag" : "Starting NFC reader..."}
        </div>

        {/* NFC Status Indicator */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: isReading ? "rgba(33, 150, 243, 0.9)" : "rgba(0,0,0,0.7)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "11px",
          }}
        >
          📡 {isReading ? "ACTIVE" : "INACTIVE"}
        </div>

        {/* Permission Status */}
        {isNFCSupported && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: permissionGranted ? "rgba(76, 175, 80, 0.9)" : "rgba(255, 152, 0, 0.9)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "11px",
            }}
          >
            🔐 {permissionGranted ? "ALLOWED" : "PENDING"}
          </div>
        )}
      </div>

      {/* CSS for NFC pulse animation */}
      <style jsx>{`
        @keyframes nfcPulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default NFCReaderComponent
