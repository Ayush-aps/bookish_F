/**
 * Bookish - Carousel JavaScript
 * Handles the auto-advancing carousel on the home page
 */

document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById("carousel-inner")
  const cards = document.querySelectorAll(".book-card")
  const prevBtn = document.getElementById("prev-btn")
  const nextBtn = document.getElementById("next-btn")

  if (!carousel || !cards.length || !prevBtn || !nextBtn) {
    return
  }

  let currentIndex = 0
  const visibleCards = 4 // Number of cards visible at once on desktop

  // Set initial position
  updateCarousel() 

  // Auto advance every 8 seconds
  let interval = setInterval(() => {
    nextSlide()
  }, 8000)

  // Previous button
  prevBtn.addEventListener("click", () => {
    prevSlide()
    resetInterval()
  })

  // Next button
  nextBtn.addEventListener("click", () => {
    nextSlide()
    resetInterval()
  })

  // Handle swipe on mobile
  let touchStartX = 0
  let touchEndX = 0

  carousel.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX
  })

  carousel.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX
    handleSwipe()
  })

  function handleSwipe() {
    const swipeThreshold = 50

    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe left
      nextSlide()
      resetInterval()
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe right
      prevSlide()
      resetInterval()
    }
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % (cards.length - visibleCards + 1)
    updateCarousel()
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + (cards.length - visibleCards + 1)) % (cards.length - visibleCards + 1)
    updateCarousel()
  }

  function updateCarousel() {
    // Remove active class from all cards
    cards.forEach((card) => card.classList.remove("active"))

    // Add active class to current card
    cards[currentIndex].classList.add("active")

    // Calculate translation
    const translateX = -currentIndex * (100 / cards.length)
    carousel.style.transform = `translateX(${translateX}%)`

    // Update button states
    if (currentIndex === 0) {
      prevBtn.classList.add("opacity-50", "cursor-not-allowed")
    } else {
      prevBtn.classList.remove("opacity-50", "cursor-not-allowed")
    }

    if (currentIndex === cards.length - visibleCards) {
      nextBtn.classList.add("opacity-50", "cursor-not-allowed")
    } else {
      nextBtn.classList.remove("opacity-50", "cursor-not-allowed")
    }
  }

  function resetInterval() {
    clearInterval(interval)
    interval = setInterval(() => {
      nextSlide()
    }, 8000)
  }

  // Adjust for responsive design
  window.addEventListener("resize", () => {
    // Recalculate visible cards based on screen width
    const screenWidth = window.innerWidth

    let visibleCards = 4

    if (screenWidth < 640) {
      visibleCards = 1
    } else if (screenWidth < 768) {
      visibleCards = 2
    } else if (screenWidth < 1024) {
      visibleCards = 3
    } else {
      visibleCards = 4
    }

    // Ensure currentIndex is valid
    if (currentIndex > cards.length - visibleCards) {
      currentIndex = cards.length - visibleCards
    }

    updateCarousel()
  })
})

