const mongoose = require("mongoose");
const Product = require("../models/product.js");
const Seller = require("../models/seller.js");
const Order = require("../models/order.js");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const addProduct = asyncHandler(async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const product = req.body.product;
    product.seller = new mongoose.Types.ObjectId(decoded.id);
    await Product.create(product);
  } catch (e) {}
});
const fetchHistory = asyncHandler(async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded)
    const seller = await Seller.findOne({
      user: new mongoose.Types.ObjectId(decoded.id),
    });
    if (!seller) {
      return res.status(404).send({ error: "Seller not found." });
    }
    res.status(200).send(seller.sellingHistory);
  } catch (error) {
    console.log(error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      res.status(401).send({ error: "Invalid or expired token." });
    } else if (error.name === "CastError" || error.name === "MongoError") {
      res.status(500).send({
        error: "An error occurred while retrieving the seller history.",
      });
    } else {
      res.status(500).send({ error: "An unexpected error occurred." });
    }
  }
});
const orderShipment = asyncHandler(async (req, res) => {
    console.log(req.body.history)
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const seller = await Seller.findOne({
      user: new mongoose.Types.ObjectId(decoded.id),
    });
    const history = req.body.history;
    const index = seller.sellingHistory.findIndex(
      (hist) => hist._id.toString() === history
    );
    if (index===-1) throw new Error()
    seller.sellingHistory[index].orderStatus = 0;
    const products = [];
    for (const item of seller.sellingHistory[index].products) {
      products.push(item.product.toString());
    }
    const order = await Order.findById(seller.sellingHistory[index].order);
    for (let i = 0; i < order.cartItems.length; ++i) {
      if (products.some((p) => p === order.cartItems[i].product.toString())) {
        order.cartItems[i].orderStatus = 0;
      }
    }
    await seller.save();
    await order.save();
    res.status(201).json({ success: true });
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      // Handle expired token error
      res.status(401).json({ error: "Token expired" });
    } else if (e.name === "JsonWebTokenError") {
      // Handle invalid token error
      res.status(401).json({ error: "Invalid token" });
    } else {
      // Handle other errors
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
module.exports = { addProduct, fetchHistory , orderShipment};
