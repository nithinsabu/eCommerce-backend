const mongoose = require("mongoose");
const Product = require("../models/product.js");
const Review = require("../models/review.js");
const uploadDummyProducts = async (req, res) => {
  // console.log(req.body.products[0]);
  const products = req.body.products;
  products.forEach(async (product) => {
    const { id, reviews,seller, ...dbProduct } = product;
    dbProduct.reviews = []
    dbProduct.seller=new mongoose.Types.ObjectId('66603c345186e77df89152ea')
    for (const rev of reviews){
      rev.reviewer = new mongoose.Types.ObjectId('66603c345186e77df89152ea')
      const dr = await Review.create(rev)
      dbProduct.reviews.push(dr._id)
    }
    const dp = await Product.create(dbProduct);
  });
  res.send("");
};

const fetchProducts = async (req, res) => {
    const products = await Product.find({}).lean()
    for (let i = 0; i < products.length; i++) {
      products[i].id = products[i]._id.toString()
      const reviews = []
      for (const rev of products[i].reviews){
        // console.log(rev)
        reviews.push(await Review.findOne({_id: rev}))
      }
      products[i].reviews = reviews
    }
    // await new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     resolve(3)
    //   }, 5000)
    // })
    // console.log(products[0])
    // console.log('Products fetched')
    res.status(200).send(products)
}

module.exports = { uploadDummyProducts, fetchProducts };