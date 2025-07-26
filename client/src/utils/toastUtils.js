import toast from "react-hot-toast"

// Custom toast utility to prevent duplicates and manage toast lifecycle
class ToastManager {
  constructor() {
    this.activeToasts = new Set()
    this.lastToastTime = new Map()
    this.DUPLICATE_THRESHOLD = 1000 // 1 second
  }

  // Check if a similar toast was shown recently
  isDuplicate(id, message) {
    const key = id || message
    const now = Date.now()
    const lastTime = this.lastToastTime.get(key)

    if (lastTime && now - lastTime < this.DUPLICATE_THRESHOLD) {
      return true
    }

    this.lastToastTime.set(key, now)
    return false
  }

  success(message, options = {}) {
    const id = options.id || `success-${Date.now()}`

    if (this.isDuplicate(id, message)) {
      console.log("🚫 Duplicate toast prevented:", message)
      return
    }

    return toast.success(message, {
      ...options,
      id,
      onClose: () => {
        this.activeToasts.delete(id)
        if (options.onClose) options.onClose()
      },
    })
  }

  error(message, options = {}) {
    const id = options.id || `error-${Date.now()}`

    if (this.isDuplicate(id, message)) {
      console.log("🚫 Duplicate toast prevented:", message)
      return
    }

    return toast.error(message, {
      ...options,
      id,
      onClose: () => {
        this.activeToasts.delete(id)
        if (options.onClose) options.onClose()
      },
    })
  }

  loading(message, options = {}) {
    const id = options.id || `loading-${Date.now()}`

    // Don't prevent duplicate loading toasts as they might be for different operations
    return toast.loading(message, {
      ...options,
      id,
      onClose: () => {
        this.activeToasts.delete(id)
        if (options.onClose) options.onClose()
      },
    })
  }

  info(message, options = {}) {
    const id = options.id || `info-${Date.now()}`

    if (this.isDuplicate(id, message)) {
      console.log("🚫 Duplicate toast prevented:", message)
      return
    }

    return toast(message, {
      icon: "ℹ️",
      ...options,
      id,
      onClose: () => {
        this.activeToasts.delete(id)
        if (options.onClose) options.onClose()
      },
    })
  }

  // Dismiss a specific toast
  dismiss(id) {
    if (id) {
      this.activeToasts.delete(id)
      toast.dismiss(id)
    } else {
      // Dismiss all toasts
      this.activeToasts.clear()
      toast.dismiss()
    }
  }

  // Clear all toast history (useful for testing)
  clearHistory() {
    this.lastToastTime.clear()
    this.activeToasts.clear()
  }

  // Get active toast count
  getActiveCount() {
    return this.activeToasts.size
  }
}

// Export singleton instance
export const toastManager = new ToastManager()

// Export individual methods for convenience
export const showSuccess = (message, options) => toastManager.success(message, options)
export const showError = (message, options) => toastManager.error(message, options)
export const showLoading = (message, options) => toastManager.loading(message, options)
export const showInfo = (message, options) => toastManager.info(message, options)
export const dismissToast = (id) => toastManager.dismiss(id)
export const clearToastHistory = () => toastManager.clearHistory()

// Default export
export default toastManager
