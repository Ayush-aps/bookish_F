/**
 * Authentication routes for user registration, login, and logout
 */

const express = require("express")
const router = express.Router()
const passport = require("passport")
const User = require("../models/User")
const { ensureNotAuthenticated } = require("../middleware/auth")

/**
 * @route   GET /auth/register
 * @desc    Render registration page
 * @access  Public
 */
router.get("/register", ensureNotAuthenticated, (req, res) => {
  res.render("auth/register", {
    title: "Register - Bookish",
    user: req.user,
  })
})

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", ensureNotAuthenticated, async (req, res) => {
  const { name, email, password, password2, role } = req.body
  const errors = []

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" })
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" })
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" })
  }

  // Validate role
  const validRoles = ["buyer", "seller"]
  if (!validRoles.includes(role)) {
    errors.push({ msg: "Invalid role selected" })
  }

  if (errors.length > 0) {
    return res.render("auth/register", {
      title: "Register - Bookish",
      errors,
      name,
      email,
      role,
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      errors.push({ msg: "Email is already registered" })
      return res.render("auth/register", {
        title: "Register - Bookish",
        errors,
        name,
        email,
        role,
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      role,
    })

    await newUser.save()

    req.flash("success_msg", "You are now registered and can log in")
    res.redirect("/auth/login")
  } catch (err) {
    console.error(err)
    req.flash("error_msg", "An error occurred during registration")
    res.redirect("/auth/register")
  }
})

/**
 * @route   GET /auth/login
 * @desc    Render login page
 * @access  Public
 */
router.get("/login", ensureNotAuthenticated, (req, res) => {
  res.render("auth/login", {
    title: "Login - Bookish",
    user: req.user,
  })
})

/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", ensureNotAuthenticated, (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })(req, res, next)
})

/**
 * @route   GET /auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "You are logged out")
    res.redirect("/auth/login")
  })
})

module.exports = router

