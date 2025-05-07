/**
 * Bookish - Online Book Marketplace
 * Main application entry point
 */

const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const methodOverride = require("method-override")
const flash = require("connect-flash")
const passport = require("passport")
const morgan = require("morgan")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/auth")
const buyerRoutes = require("./routes/buyer")
const sellerRoutes = require("./routes/seller")
const adminRoutes = require("./routes/admin")
const publicRoutes = require("./routes/public")

// Import database connection
const connectDB = require("./config/db")

// Initialize Express app
const app = express()

// Connect to MongoDB 
connectDB()

// Set view engine
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Middleware
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride("_method"))
app.use(morgan("dev"))

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));


/******************************* */

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
})

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}))

// Flash messages
app.use(flash())

// Passport initialization
app.use(passport.initialize())
app.use(passport.session())
require("./config/passport")(passport)

// Global variables middleware
app.use((req, res, next) => {
  res.locals.user = req.user || null
  res.locals.success_msg = req.flash("success_msg")
  res.locals.error_msg = req.flash("error_msg")
  res.locals.error = req.flash("error")
  next()
})

// Routes
app.use("/", publicRoutes)
app.use("/auth", authLimiter, authRoutes)
app.use("/buyer", buyerRoutes)
app.use("/seller", sellerRoutes)
app.use("/admin", adminRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).render("errors/404")
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).render("errors/500")
})

// Start server
const PORT =  3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

