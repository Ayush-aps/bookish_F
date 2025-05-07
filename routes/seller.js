/**
 * Seller routes for managing book inventory and sales
 */

const express = require("express")
const router = express.Router()
const Book = require("../models/Book")
const Order = require("../models/Order")
const { ensureAuthenticated, ensureSeller } = require("../middleware/auth")

/**
 * @route   GET /seller/dashboard
 * @desc    Seller dashboard with sales analytics 
 * @access  Private (Seller)
 */
router.get("/dashboard", ensureAuthenticated, ensureSeller, async (req, res) => {
  try {
    // Get seller's books
    const books = await Book.find({ seller: req.user._id })

    // Get orders containing seller's books
    const orders = await Order.find({
      "items.book": { $in: books.map((book) => book._id) },
      orderStatus: { $in: ["processing", "shipped", "delivered"] },
    }).sort({ orderDate: -1 })

    // Calculate total sales
    let totalSales = 0
    let monthlySales = 0
    const totalOrders = orders.length
    let pendingOrders = 0

    // Current month
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    orders.forEach((order) => {
      // Calculate total sales
      order.items.forEach((item) => {
        if (books.some((book) => book._id.toString() === item.book.toString())) {
          totalSales += item.price * item.quantity

          // Calculate monthly sales
          const orderDate = new Date(order.orderDate)
          if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
            monthlySales += item.price * item.quantity
          }
        }
      })

      // Count pending orders
      if (order.orderStatus === "processing") {
        pendingOrders++
      }
    })

    // Mock data for charts
    const salesData = [
      { month: "Jan", sales: 1200 },
      { month: "Feb", sales: 1900 },
      { month: "Mar", sales: 1500 },
      { month: "Apr", sales: 2100 },
      { month: "May", sales: 1800 },
      { month: "Jun", sales: 2400 },
      { month: "Jul", sales: 2200 },
      { month: "Aug", sales: 2600 },
      { month: "Sep", sales: 2900 },
      { month: "Oct", sales: 3100 },
      { month: "Nov", sales: 3300 },
      { month: "Dec", sales: 3500 },
    ]

    // Get top selling books
    const topBooks = books.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5)

    res.render("seller/dashboard", {
      title: "Seller Dashboard - Bookish",
      totalSales,
      monthlySales,
      totalOrders,
      pendingOrders,
      salesData,
      topBooks,
      recentOrders: orders.slice(0, 5),
      user: req.user,
    })
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error loading dashboard")
    res.redirect("/")
  }
})

/**
 * @route   GET /seller/upload
 * @desc    Render book upload form
 * @access  Private (Seller)
 */
router.get("/upload", ensureAuthenticated, ensureSeller, (req, res) => {
  res.render("seller/upload", {
    title: "Upload Book - Bookish",
    user: req.user,
  })
})

/**
 * @route   POST /seller/upload
 * @desc    Upload a new book
 * @access  Private (Seller)
 */
router.post("/upload", ensureAuthenticated, ensureSeller, async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      isbn,
      price,
      discountPrice,
      publisher,
      publishedDate,
      pageCount,
      language,
      genres,
      condition,
      stock,
      format,
      coverImageUrl,
    } = req.body

    // Validate required fields
    if (!title || !author || !description || !isbn || !price || !publisher || !genres || !stock || !format) {
      req.flash("error_msg", "Please fill in all required fields")
      return res.redirect("/seller/upload");
    }

    let finalCoverImage =
      coverImageUrl && coverImageUrl.trim() !== ""
        ? coverImageUrl.trim()
        : "https://nnpdev.wustl.edu/img/BookCovers/genericBookCover.jpg";
        // https://static.wikia.nocookie.net/gijoe/images/b/bf/Default_book_cover.jpg/revision/latest/scale-to-width-down/340?cb=20120719182552

    // Create new book
    const newBook = new Book({
      title,
      author,
      description,
      isbn,
      price,
      discountPrice: discountPrice || price,
      publisher,
      publishedDate,
      pageCount,
      language,
      genres: Array.isArray(genres) ? genres : [genres],
      condition,
      seller: req.user._id,
      stock,
      format,
      // If book is used, set current seller as original owner
      originalOwner: condition === "used" ? req.user._id : null,
      // Default cover image
      coverImage: finalCoverImage,
    })

    await newBook.save()

    req.flash("success_msg", "Book uploaded successfully and pending approval")
    res.redirect("/seller/inventory")
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error uploading book")
    res.redirect("/seller/upload")
  }
})

/**
 * @route   GET /seller/inventory
 * @desc    View and manage book inventory
 * @access  Private (Seller)
 */
router.get("/inventory", ensureAuthenticated, ensureSeller, async (req, res) => {
  try {
    const books = await Book.find({ seller: req.user._id }).sort({ createdAt: -1 })

    res.render("seller/inventory", {
      title: "Book Inventory - Bookish",
      books,
      user: req.user,
    })
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error fetching inventory")
    res.redirect("/seller/dashboard")
  }
})

/**
 * @route   GET /seller/edit/:id
 * @desc    Edit book form
 * @access  Private (Seller)
 */
router.get("/edit/:id", ensureAuthenticated, ensureSeller, async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      seller: req.user._id,
    })

    if (!book) {
      req.flash("error_msg", "Book not found or you are not authorized")
      return res.redirect("/seller/inventory");
    }

    res.render("seller/edit-book", {
      title: "Edit Book - Bookish",
      book,
      user: req.user,
    })
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error fetching book")
    res.redirect("/seller/inventory")
  }
})

/**
 * @route   POST /seller/edit/:id
 * @desc    Update book
 * @access  Private (Seller)
 */
router.post("/edit/:id", ensureAuthenticated, ensureSeller, async (req, res) => {
  try {
    const { title, author, description, price, discountPrice, stock, isAvailable } = req.body

    // Find book
    const book = await Book.findOne({
      _id: req.params.id,
      seller: req.user._id,
    })

    if (!book) {
      req.flash("error_msg", "Book not found or you are not authorized")
      return res.redirect("/seller/inventory");
    }

    // Update book
    book.title = title
    book.author = author
    book.description = description
    book.price = price
    book.discountPrice = discountPrice || price
    book.stock = stock
    book.isAvailable = isAvailable === "on"

    await book.save()

    req.flash("success_msg", "Book updated successfully")
    res.redirect("/seller/inventory")
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error updating book")
    res.redirect("/seller/inventory")
  }
})

/**
 * @route   POST /seller/delete/:id
 * @desc    Delete book
 * @access  Private (Seller)
 */
router.post("/delete/:id", ensureAuthenticated, ensureSeller, async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      seller: req.user._id,
    })

    if (!book) {
      req.flash("error_msg", "Book not found or you are not authorized")
      return res.redirect("/seller/inventory");
    }

    await book.remove()

    req.flash("success_msg", "Book deleted successfully")
    res.redirect("/seller/inventory")
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error deleting book")
    res.redirect("/seller/inventory")
  }
})

/**
 * @route   GET /seller/orders
 * @desc    View orders for seller's books
 * @access  Private (Seller)
 */
router.get("/orders", ensureAuthenticated, ensureSeller, async (req, res) => {
  try {
    // Get seller's books
    const books = await Book.find({ seller: req.user._id })

    // Get orders containing seller's books
    const orders = await Order.find({
      "items.book": { $in: books.map((book) => book._id) },
    })
      .populate("user", "name email")
      .sort({ orderDate: -1 })

    res.render("seller/orders", {
      title: "Orders - Bookish",
      orders,
      books,
      user: req.user,
    })
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error fetching orders")
    res.redirect("/seller/dashboard")
  }
})

module.exports = router

