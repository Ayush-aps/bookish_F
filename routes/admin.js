/**
 * Admin routes for user management, content moderation, and system reports
 */

const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Book = require("../models/Book")
const Order = require("../models/Order")
const { ensureAuthenticated, ensureAdmin } = require("../middleware/auth")

/**
 * @route   GET /admin/users
 * @desc    User management
 * @access  Private (Admin)
 */
router.get("/users", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })

    res.render("admin/users", {
      title: "User Management - Bookish",
      users,
      user: req.user,
    })
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error fetching users")
    res.redirect("/admin/reports")
  }
})

/**
 * @route   POST /admin/users/:id/update-role
 * @desc    Update user role
 * @access  Private (Admin)
 */
router.post(
  "/users/:id/update-role",
  ensureAuthenticated,
  ensureAdmin,
  async (req, res) => {
    try {
      const { role } = req.body

      // Validate role
      const validRoles = ["buyer", "seller", "admin"]
      if (!validRoles.includes(role)) {
        req.flash("error_msg", "Invalid role")
        return res.redirect("/admin/users");
      }

      // Update user role
      await User.findByIdAndUpdate(req.params.id, { role })

      req.flash("success_msg", "User role updated successfully")
      res.redirect("/admin/users")
    } catch (err) {
      console.error(err)
      req.flash("error_msg", "Error updating user role")
      res.redirect("/admin/users")
    }
  }
)

/**
 * @route   POST /admin/users/:id/toggle-status
 * @desc    Toggle user active status
 * @access  Private (Admin)
 */
router.post(
  "/users/:id/toggle-status",
  ensureAuthenticated,
  ensureAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id)

      if (!user) {
        req.flash("error_msg", "User not found")
        return res.redirect("/admin/users");
      }

      // Toggle isVerified status
      user.isVerified = !user.isVerified
      await user.save()

      req.flash(
        "success_msg",
        `User ${user.isVerified ? "activated" : "deactivated"} successfully`
      )
      res.redirect("/admin/users")
    } catch (err) {
      console.error(err)
      req.flash("error_msg", "Error updating user status")
      res.redirect("/admin/users")
    }
  }
)

/**
 * @route   GET /admin/reports
 * @desc    System health reports
 * @access  Private (Admin)
 */
router.get("/reports", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments()
    const bookCount = await Book.countDocuments()
    const orderCount = await Order.countDocuments()

    // Get user distribution by role
    const buyerCount = await User.countDocuments({ role: "buyer" })
    const sellerCount = await User.countDocuments({ role: "seller" })
    const adminCount = await User.countDocuments({ role: "admin" })

    // Get book distribution by condition
    const newBookCount = await Book.countDocuments({ condition: "new" })
    const usedBookCount = await Book.countDocuments({ condition: "used" })

    // Get order distribution by status
    const processingOrderCount = await Order.countDocuments({ orderStatus: "processing" })
    const shippedOrderCount = await Order.countDocuments({ orderStatus: "shipped" })
    const deliveredOrderCount = await Order.countDocuments({ orderStatus: "delivered" })
    const cancelledOrderCount = await Order.countDocuments({ orderStatus: "cancelled" })

    // Get recent users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5)

    // Get recent orders
    const recentOrders = await Order.find().populate("user", "name email").sort({ orderDate: -1 }).limit(5)

    // Mock system health data
    const systemHealth = {
      cpu: "32%",
      memory: "1.2GB / 4GB",
      disk: "12GB / 50GB",
      uptime: "7 days, 3 hours",
      lastRestart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    res.render("admin/reports", {
      title: "System Reports - Bookish",
      counts: {
        users: userCount,
        books: bookCount,
        orders: orderCount,
      },
      userDistribution: {
        buyers: buyerCount,
        sellers: sellerCount,
        admins: adminCount,
      },
      bookDistribution: {
        new: newBookCount,
        used: usedBookCount,
      },
      orderDistribution: {
        processing: processingOrderCount,
        shipped: shippedOrderCount,
        delivered: deliveredOrderCount,
        cancelled: cancelledOrderCount,
      },
      recentUsers,
      recentOrders,
      systemHealth,
      user: req.user,
    })
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error generating reports")
    res.redirect("/")
  }
})

/**
 * @route   GET /admin/content
 * @desc    Content moderation
 * @access  Private (Admin)
 */
router.get("/content", ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    // Get pending books
    const pendingBooks = await Book.find({ isApproved: false }).populate("seller", "name email").sort({ createdAt: -1 })

    // Get approved books
    const approvedBooks = await Book.find({ isApproved: true })
      .populate("seller", "name email")
      .sort({ createdAt: -1 })
      .limit(10)

    res.render("admin/content", {
      title: "Content Moderation - Bookish",
      pendingBooks,
      approvedBooks,
      user: req.user, 
    })
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error fetching content")
    res.redirect("/admin/reports")
  }
})

/**
 * @route   POST /admin/content/:id/approve
 * @desc    Approve book
 * @access  Private (Admin)
 */
router.post(
  "/content/:id/approve",
  ensureAuthenticated,
  ensureAdmin,
  async (req, res) => {
    try {
      await Book.findByIdAndUpdate(req.params.id, { isApproved: true })

      req.flash("success_msg", "Book approved successfully")
      res.redirect("/admin/content")
    } catch (err) {
      console.error(err)
      req.flash("error_msg", "Error approving book")
      res.redirect("/admin/content")
    }
  }
)

/**
 * @route   POST /admin/content/:id/reject
 * @desc    Reject book
 * @access  Private (Admin)
 */
router.post(
  "/content/:id/reject",
  ensureAuthenticated,
  ensureAdmin,
  async (req, res) => {
    try {
      await Book.findByIdAndDelete(req.params.id)

      req.flash("success_msg", "Book rejected and removed")
      res.redirect("/admin/content")
    } catch (err) {
      console.error(err)
      req.flash("error_msg", "Error rejecting book")
      res.redirect("/admin/content")
    }
  }
)

/**
 * @route   GET /seed-admin
 * @desc    Create initial admin account
 * @access  Public (only for initial setup)
 */
router.get("/seed-admin", async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: "admin" })

    if (adminExists) {
      req.flash("error_msg", "Admin account already exists")
      return res.redirect("/");
    }

    // Create admin account
    const admin = new User({
      name: "Admin",
      email: "admin@bookish.in",
      password: "admin123",
      role: "admin",
      isVerified: true,
    })

    await admin.save()

    req.flash("success_msg", "Admin account created successfully")
    res.redirect("/auth/login")
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "Error creating admin account")
    res.redirect("/")
  }
})

module.exports = router

