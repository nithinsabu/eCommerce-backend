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
  sellingHistory: {
    type: [
      {
        buyerName: {
          type: String,
        },

        products: {
          type: [
            {
              product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
              },
              productTitle: String,
              quantity: {
                type: Number,
                default: 1,
              },
              price: Number
            },
          ],
        },
        order: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "order",
        },
        shippingAddress: {
          recipient: {
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
        transactionID: {
          type: String,
          default: "",
        },
        paymentMethod: {
          type: String,
          default: "",
        },
        orderStatus: {
          type: Number,
          min: -1,
          max: 1,
        },
        amount: {
          type: Number,
          default: 0
        },
        orderDate: {
          type: Date,
          default: Date.now()
        }
      },
    ],
    default: [],
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
