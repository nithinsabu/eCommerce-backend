const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  // products: {
  //   type: [
  //     {
  //       product: {
  //         type: mongoose.Schema.Types.ObjectId,
  //         ref: "product",
  //       },
  //     },
  //   ],
  //   default: [],
  // },
});

const Seller = mongoose.model("Seller", sellerSchema);

module.exports = Seller;
