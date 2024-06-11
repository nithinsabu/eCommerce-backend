const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },
  mrp: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: "other",
  },
  images: {
    type: [String],
    default: [],
  },
  keyFeatures: {
    type: [String],
    default: [],
  },
  specifications: {
    type: Object,
    default: {},
  },

  //   minQuantity: {
  //     type: Number,
  //     required: true,
  //     default: 1,
  //   },
  description: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0,
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  available: {
    type: Number,
    default: 0,
  },
  dateAdded: {
    type: Date,
    default: Date.now(),
  },
  tags: {
    type: [String],
    default: [],
  },
  reviews: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "review",
      },
    ],
    default: [],
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
