/**
 * Bookish - Main JavaScript File
 * Contains common functionality used across the site
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize cart count
  updateCartCount()

  // Initialize mobile menu
  initMobileMenu()

  // Initialize flash message dismissal
  initFlashMessages()

  // Initialize tooltips
  initTooltips()
})

/**
 * Updates the cart count in the header
 */
function updateCartCount() {
  const cartCountElement = document.getElementById("cart-count")

  if (cartCountElement) {
    // Fetch cart count from API
    fetch("/buyer/api/cart/count")
      //******* */
    .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response
      })
      .catch((error) => {
        console.error("Error fetching cart count:", error)
      })
      //************* */
      .then((response) => response.json())
      .then((data) => {
        cartCountElement.textContent = data.count

        // Hide count if zero
        if (data.count === 0) {
          cartCountElement.classList.add("hidden")
        } else {
          cartCountElement.classList.remove("hidden")
        }
      })
      .catch((error) => {
        console.error("Error fetching cart count:", error)
      })
  }
}

/**
 * Initializes the mobile menu functionality
 */
function initMobileMenu() {
  const mobileMenuButton = document.getElementById("mobile-menu-button")
  const mobileMenu = document.getElementById("mobile-menu")

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden")
    })
  }
}

/**
 * Initializes flash message dismissal
 */
function initFlashMessages() {
  const flashMessages = document.querySelectorAll(".alert")

  flashMessages.forEach((message) => {
    const closeButton = message.querySelector(".close")

    if (closeButton) {
      closeButton.addEventListener("click", () => {
        message.remove()
      })

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        message.classList.add("opacity-0")
        setTimeout(() => {
          message.remove()
        }, 300)
      }, 5000)
    }
  })
}

/**
 * Initializes tooltips
 */
function initTooltips() {
  const tooltips = document.querySelectorAll("[data-tooltip]")

  tooltips.forEach((tooltip) => {
    tooltip.addEventListener("mouseenter", function () {
      const tooltipText = this.getAttribute("data-tooltip")

      if (tooltipText) {
        const tooltipElement = document.createElement("div")
        tooltipElement.className = "absolute bg-dark text-white text-xs rounded py-1 px-2 z-10"
        tooltipElement.textContent = tooltipText
        tooltipElement.style.bottom = "calc(100% + 5px)"
        tooltipElement.style.left = "50%"
        tooltipElement.style.transform = "translateX(-50%)"

        this.style.position = "relative"
        this.appendChild(tooltipElement)

        this.addEventListener("mouseleave", () => {
          tooltipElement.remove()
        })
      }
    })
  })
} 

/**
 * Adds an item to the cart
 * @param {string} bookId - The ID of the book to add
 * @param {number} quantity - The quantity to add
 */
function addToCart(bookId, quantity = 1) {
  fetch("/buyer/cart/add/" + bookId, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Show success message
        showNotification("Book added to cart", "success")

        // Update cart count
        updateCartCount()
      } else {
        showNotification(data.message || "Error adding book to cart", "error")
      }
    })
    .catch((error) => {
      console.error("Error adding to cart:", error)
      showNotification("Error adding book to cart", "error")
    })
}

/**
 * Shows a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 */
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
        ? "bg-red-500 text-white"
        : "bg-blue-500 text-white"
  }`
  notification.textContent = message

  document.body.appendChild(notification)

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.add("opacity-0")
    notification.style.transition = "opacity 0.3s ease-in-out"

    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 3000)
}

/**
 * Formats a price as Indian Rupees
 * @param {number} price - The price to format
 * @returns {string} - The formatted price
 */
function formatPrice(price) {
  return "₹" + price.toLocaleString("en-IN")
}

