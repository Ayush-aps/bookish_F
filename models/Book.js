/**
 * Book model with support for new and second-hand books
 */

const mongoose = require("mongoose")

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  author: {
    type: String,
    required: [true, "Please add an author"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  isbn: {
    type: String,
    required: [true, "Please add an ISBN"],
    unique: true,
    match: [/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/, "Please add a valid ISBN"],
  },
  coverImage: {
    type: String,
    default: "default-book-cover.jpg",
  },
  price: {
    type: Number,
    required: [true, "Please add a price"],
  },
  discountPrice: {
    type: Number,
  },
  publisher: {
    type: String,
    required: [true, "Please add a publisher"],
  },
  publishedDate: {
    type: Date,
  },
  pageCount: {
    type: Number,
  },
  language: {
    type: String,
    default: "English",
  },
  genres: {
    type: [String],
    required: true,
    validate: [(v) => v.length > 0, "At least 1 genre required"],
  },
  condition: {
    type: String,
    enum: ["new", "used"],
    default: "new",
  },
  originalOwner: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  stock: {
    type: Number,
    required: [true, "Please add stock quantity"],
    min: [0, "Stock cannot be negative"],
  },
  format: {
    type: String,
    enum: ["paperback", "hardcover", "ebook", "audiobook"],
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create index for search functionality
BookSchema.index({
  title: "text",
  author: "text",
  description: "text",
  publisher: "text",
  genres: "text",
})

module.exports = mongoose.model("Book", BookSchema)

