// Centralized notification manager - ONLY file for handling notifications
class NotificationManager {
  constructor() {
    this.notifications = []
    this.container = null
    this.maxNotifications = 3
    this.defaultDuration = 4000
    this.init()
  }

  init() {
    // Create notification container
    this.container = document.createElement("div")
    this.container.id = "notification-container"
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
      max-width: 400px;
    `
    document.body.appendChild(this.container)
  }

  show(message, type = "info", options = {}) {
    const id = `notification-${Date.now()}-${Math.random()}`
    const duration = options.duration || this.defaultDuration

    // Prevent duplicates
    const isDuplicate = this.notifications.some(
      (n) => n.message === message && n.type === type && Date.now() - n.timestamp < 1000,
    )

    if (isDuplicate) {
      console.log("🚫 Duplicate notification prevented:", message)
      return
    }

    const notification = {
      id,
      message,
      type,
      timestamp: Date.now(),
      element: this.createElement(message, type, id),
    }

    this.notifications.push(notification)
    this.container.appendChild(notification.element)

    // Remove old notifications if too many
    if (this.notifications.length > this.maxNotifications) {
      const oldNotification = this.notifications.shift()
      this.remove(oldNotification.id)
    }

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration)
    }

    // Animate in
    requestAnimationFrame(() => {
      notification.element.style.transform = "translateX(0)"
      notification.element.style.opacity = "1"
    })

    return id
  }

  createElement(message, type, id) {
    const element = document.createElement("div")
    element.id = id
    element.style.cssText = `
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 12px;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: auto;
      cursor: pointer;
      border-left: 4px solid ${this.getTypeColor(type)};
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #1f2937;
      max-width: 380px;
      word-wrap: break-word;
    `

    const icon = this.getTypeIcon(type)
    const iconElement = document.createElement("span")
    iconElement.textContent = icon
    iconElement.style.fontSize = "18px"

    const messageElement = document.createElement("span")
    messageElement.textContent = message
    messageElement.style.flex = "1"

    const closeButton = document.createElement("button")
    closeButton.textContent = "×"
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      margin-left: 8px;
      line-height: 1;
    `
    closeButton.onclick = (e) => {
      e.stopPropagation()
      this.remove(id)
    }

    element.appendChild(iconElement)
    element.appendChild(messageElement)
    element.appendChild(closeButton)

    // Click to dismiss
    element.onclick = () => this.remove(id)

    return element
  }

  getTypeColor(type) {
    const colors = {
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#6366f1",
      loading: "#6366f1",
    }
    return colors[type] || colors.info
  }

  getTypeIcon(type) {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
      loading: "🔄",
    }
    return icons[type] || icons.info
  }

  remove(id) {
    const notification = this.notifications.find((n) => n.id === id)
    if (!notification) return

    // Animate out
    notification.element.style.transform = "translateX(100%)"
    notification.element.style.opacity = "0"

    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element)
      }
      this.notifications = this.notifications.filter((n) => n.id !== id)
    }, 300)
  }

  success(message, options = {}) {
    return this.show(message, "success", options)
  }

  error(message, options = {}) {
    return this.show(message, "error", options)
  }

  warning(message, options = {}) {
    return this.show(message, "warning", options)
  }

  info(message, options = {}) {
    return this.show(message, "info", options)
  }

  loading(message, options = {}) {
    return this.show(message, "loading", { duration: 0, ...options })
  }

  clear() {
    this.notifications.forEach((n) => this.remove(n.id))
  }
}

// Create singleton instance
const notificationManager = new NotificationManager()

// Export methods
export const showSuccess = (message, options) => notificationManager.success(message, options)
export const showError = (message, options) => notificationManager.error(message, options)
export const showWarning = (message, options) => notificationManager.warning(message, options)
export const showInfo = (message, options) => notificationManager.info(message, options)
export const showLoading = (message, options) => notificationManager.loading(message, options)
export const clearNotifications = () => notificationManager.clear()
export const removeNotification = (id) => notificationManager.remove(id)

export default notificationManager
