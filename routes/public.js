/**
 * Public routes for home page, about, and pricing
 */

const express = require("express")
const router = express.Router()
const Book = require("../models/Book")

/**
 * @route   GET /
 * @desc    Home page
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    // Get featured books
    const featuredBooks = await Book.find({ isApproved: true, isAvailable: true }).sort({ rating: -1 }).limit(8)

    // Get new arrivals
    const newArrivals = await Book.find({ isApproved: true, isAvailable: true }).sort({ createdAt: -1 }).limit(8)

    // Get trending books (based on review count)
    const trendingBooks = await Book.find({ isApproved: true, isAvailable: true }).sort({ reviewCount: -1 }).limit(8)

    res.render("home", {
      title: "Bookish - Online Book Marketplace",
      featuredBooks,
      newArrivals,
      trendingBooks,
      user: req.user,
    })
  } catch (err) {
    console.error(err)
    res.status(500).render("errors/500")
  }
})

/**
 * @route   GET /about
 * @desc    About page
 * @access  Public
 */
router.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us - Bookish",
    user: req.user,
  })
})

/**
 * @route   GET /pricing
 * @desc    Revenue model and pricing page
 * @access  Public
 */
router.get("/pricing", (req, res) => {
  // Define pricing plans
  const plans = [
    {
      name: "Free",
      price: 0,
      features: ["Browse all books", "Purchase physical books", "Basic recommendation system", "Standard delivery"],
    },
    {
      name: "Premium",
      price: 199,
      period: "month",
      features: [
        "All Free features",
        "Access to e-books and audiobooks",
        "Advanced recommendation system",
        "Priority delivery",
        "Exclusive discounts",
      ],
    },
    {
      name: "Premium Plus",
      price: 499,
      period: "month",
      features: [
        "All Premium features",
        "Unlimited e-book access",
        "Monthly free physical book",
        "Free express delivery",
        "Early access to new releases",
      ],
    },
  ]

  // Define seller fees
  const sellerFees = [
    {
      name: "Basic Seller",
      fee: "10%",
      features: ["List up to 50 books", "Standard visibility", "Basic analytics"],
    },
    {
      name: "Professional Seller",
      fee: "8%",
      monthlyFee: 499,
      features: ["Unlimited book listings", "Enhanced visibility", "Advanced analytics", "Priority support"],
    },
  ]

  res.render("pricing", {
    title: "Pricing - Bookish",
    plans,
    sellerFees,
    user: req.user,
  })
})

/**
 * @route   GET /contact
 * @desc    Contact page
 * @access  Public
 */
router.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact Us - Bookish",
    user: req.user,
  })
})

/**
 * @route   POST /contact/submit
 * @desc    Process contact form
 * @access  Public
 */
router.post("/contact/submit", (req, res) => {
  const { name, email, subject, message } = req.body;
  
  // Here you would typically:
  // 1. Validate the input
  // 2. Store the message in your database
  // 3. Send notification email
  // 4. Send confirmation email to user
  
  // For now, just redirect with success message
  req.flash("success_msg", "Thanks for your message! We'll get back to you soon.");
  res.redirect("/contact");
});

/**
 * @route   GET /books/browse
 * @desc    Public browse books page
 * @access  Public
 */
router.get("/books/browse", async (req, res) => {
  try {
    const { search, genre, condition, minPrice, maxPrice, sort } = req.query

    // Build query
    const query = { isApproved: true, isAvailable: true }

    if (search) {
      query.$text = { $search: search }
    }

    if (genre) {
      query.genres = genre
    }

    if (condition) {
      query.condition = condition
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    // Sort options
    let sortOption = {}
    if (sort === "price-asc") {
      sortOption = { price: 1 }
    } else if (sort === "price-desc") {
      sortOption = { price: -1 }
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 }
    } else if (sort === "rating") {
      sortOption = { rating: -1 }
    } else {
      // Default sort
      sortOption = { createdAt: -1 }
    }

    // Get all genres for filter
    const genres = await Book.distinct("genres")

    // Fetch books
    const books = await Book.find(query).sort(sortOption).populate("seller", "name").populate("originalOwner", "name")

    res.render("buyer/browse", {
      title: "Browse Books - Bookish",
      books,
      genres,
      filters: {
        search,
        genre,
        condition,
        minPrice,
        maxPrice,
        sort,
      },
      user: req.user,
    })
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error fetching books")
    res.redirect("/")
  }
})

module.exports = router

