/**
 * Order model for tracking book purchases
 */

const mongoose = require("mongoose")

const OrderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.ObjectId,
    ref: "Book",
    required: true,
  },
  title: String,
  author: String,
  coverImage: String,
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"],
  },
  price: {
    type: Number,
    required: true,
  },
})

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["credit_card", "debit_card", "upi", "net_banking", "cash_on_delivery"],
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  orderStatus: {
    type: String,
    enum: ["processing", "shipped", "delivered", "cancelled"],
    default: "processing",
  },
  trackingNumber: String,
  orderDate: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Order", OrderSchema)

