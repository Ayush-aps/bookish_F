/**
 * Cart functionality for Bookish
 */

class BookishCart {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('bookish-cart')) || [];
    this.cartCountElement = document.getElementById('cart-count');
    this.init();
  }

  init() {
    // Initialize cart badge
    this.updateCartDisplay();
    
    // Add event listeners to all Add to Cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', (e) => this.addToCart(e));
    });
  }

  addToCart(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const bookId = button.getAttribute('data-id');
    
    // Check if book is already in cart
    const existingBook = this.cart.find(item => item.id === bookId);
    
    if (existingBook) {
      existingBook.quantity += 1;
    } else {
      this.cart.push({
        id: bookId,
        quantity: 1
      });
    }
    
    // Save to localStorage
    this.saveCart();
    
    // Update UI
    this.updateCartDisplay();
    this.showAddedFeedback(button);
  }

  showAddedFeedback(button) {
    // Show visual feedback
    button.textContent = 'ADDED TO BAG';
    button.classList.add('bg-dark');
    
    // Add bump animation to cart count
    if (this.cartCountElement) {
      this.cartCountElement.classList.add('bump');
      setTimeout(() => {
        this.cartCountElement.classList.remove('bump');
      }, 400);
    }
    
    // Reset button after delay
    setTimeout(() => {
      button.textContent = 'ADD TO BAG';
      button.classList.remove('bg-dark');
    }, 1500);
  }

  updateCartDisplay() {
    if (!this.cartCountElement) return;
    
    const count = this.getTotalItems();
    this.cartCountElement.textContent = count;
    this.cartCountElement.style.display = count > 0 ? 'flex' : 'none';
  }

  getTotalItems() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  saveCart() {
    localStorage.setItem('bookish-cart', JSON.stringify(this.cart));
  }

  removeItem(bookId) {
    this.cart = this.cart.filter(item => item.id !== bookId);
    this.saveCart();
    this.updateCartDisplay();
  }

  updateQuantity(bookId, quantity) {
    const item = this.cart.find(item => item.id === bookId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeItem(bookId);
      } else {
        this.saveCart();
        this.updateCartDisplay();
      }
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartDisplay();
  }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.bookishCart = new BookishCart();
}); 