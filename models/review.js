const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  
  // product: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "product",
  // },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  image: {
    type: String,
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
