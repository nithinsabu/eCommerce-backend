const mongoose = require("mongoose");
const Product = require("../models/product.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const uploadDummyProducts = async (req, res) => {
  // console.log(req.body.products[0]);
  const products = req.body.products;
  products.forEach(async (product) => {
    const { id, reviews, seller, ...dbProduct } = product;
    dbProduct.reviews = [];
    dbProduct.seller = new mongoose.Types.ObjectId("666ac60880e5ffa2606b9fcc");
    for (const rev of reviews) {
      rev.reviewer = new mongoose.Types.ObjectId("666ac60880e5ffa2606b9fcc");
      const dr = await Review.create(rev);
      dbProduct.reviews.push(dr._id);
    }
    const dp = await Product.create(dbProduct);
  });
  res.send("");
};

const fetchProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).lean();
  for (let i = 0; i < products.length; i++) {
    products[i].id = products[i]._id.toString();
    const reviews = [];
    for (const rev of products[i].reviews) {
      // console.log(rev)
      const review = await Review.findById(rev).lean();
      const user = await User.findById(review.reviewer)
      review.reviewer = user?.name;
      review.id = review._id.toString();
      delete review._id;
      reviews.push(review);
    }
    products[i].reviews = reviews;
  }
  // await new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     resolve(3)
  //   }, 5000)
  // })
  // console.log(products[0])
  // console.log('Products fetched')
  if (req.query['seller']){
    const decoded = jwt.verify(req.query['seller'], process.env.JWT_SECRET)
    const sellerProducts = products.filter(product => product.seller.toString()===req.query['seller'])
    console.log(sellerProducts)
    res.status(200).send(sellerProducts)
    return
  }
  res.status(200).send(products);
}
)

module.exports = { uploadDummyProducts, fetchProducts };
