const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  shippingAddress: {
    type: {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
      street: {
        type: String,
        // required: true
      },
      city: {
        type: String,
        // required: true
      },
      state: {
        type: String,
        // required: true
      },
      zip: {
        type: String,
        // required: true
      },
      country: {
        type: String,
      },
    },

    required: true,
  },
  cartItems: {
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        orderStatus: {
          type: Number,
          default: -1,
        },
        deliveryDate: {
          type: Date,
          // default: Date.now(),
        },
      },
    ],
    default: [],
  },
  orderDate: {
    type: Date,
    default: Date.now(),
  },
  // deliveryDate: {
  //   type: Date,
  //   default: Date.now(),
  // },
  orderAmount: {
    type: Number,
    default: 0,
  },
  paymentDetails: {
    type: String,
  },
  // orderStatus:{
  //   type: Number,
  //   default: -1
  // }
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
