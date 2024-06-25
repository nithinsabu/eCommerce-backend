const mongoose = require("mongoose");
const Product = require("../models/product.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadDir = path.join(__dirname, "..", "uploads");

const uploadDummyProducts = async (req, res) => {
  // console.log(req.body.products[0]);
  // fs.rmdirSync(path.join(uploadDir, '667a7c21df8fc2b009574f7d'), { recursive: true, force: true })
  const products = req.body.products;
  products.forEach(async (product) => {
    const { id, reviews, seller, ...dbProduct } = product;
    dbProduct.reviews = [];
    dbProduct.seller = new mongoose.Types.ObjectId("666ac60880e5ffa2606b9fcc");
    const dp = await Product.create(dbProduct);
    for (const rev of reviews) {
      rev.reviewer = new mongoose.Types.ObjectId("666ac60880e5ffa2606b9fcc");
      rev.product = dp._id
      const dr = await Review.create(rev);
      // dbProduct.reviews.push(dr._id);
    }
  });
  res.send("");
};

const fetchProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).lean();
  for (let i = 0; i < products.length; i++) {
    products[i].id = products[i]._id.toString();
    delete products[i]._id;
    // const reviews = [];
    // for (const rev of products[i].reviews) {
    //   // console.log(rev)
    //   const review = await Review.findById(rev).lean();
    //   const user = await User.findById(review.reviewer);
    //   review.reviewer = user?.name;
    //   review.id = review._id.toString();
    //   delete review._id;
    //   reviews.push(review);
    // }
    const reviews = await  Review.find({product: new mongoose.Types.ObjectId(products[i].id)}).lean()
    for (let i = 0; i<reviews.length; ++i){
      reviews[i].reviewer = await User.findById(new mongoose.Types.ObjectId(reviews[i].reviewer)).name
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
  if (req.headers.authorization) {
    try {
      const decoded = jwt.verify(
        req.headers.authorization.split(" ")[1],
        process.env.JWT_SECRET
      );
      const sellerProducts = products.filter(
        (product) => product.seller.toString() === decoded.id
      );
      res.status(200).send(sellerProducts);
    } catch {
      res.status(400).send({ error: "Unauthorized access" });
    }
    return;
  }
  res.status(200).send(products);
});

const fetchReviews = asyncHandler(async (req, res) => {
    const product = req.query['product']
    // console.log(product)
    const reviews = await Review.find({product: new mongoose.Types.ObjectId(product)}).lean()
    for (let i = 0; i<reviews.length; ++i){
      // reviews[i].reviewer = await User.findById(new mongoose.Types.ObjectId(reviews[i].reviewer)).name
      delete reviews[i].product
      reviews[i].id = reviews[i]._id
      delete reviews[i]._id
      delete reviews[i].__v
    }
    let user = ''
    const response ={reviews: reviews}
    try{
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = decoded.id
      response.userReview = reviews.find(review => review.reviewer.toString()===user)
    }catch(E){
      // console.log(E)
    }
    for (let i = 0; i<reviews.length; ++i){
      const reviewer = await User.findById(new mongoose.Types.ObjectId(reviews[i].reviewer))
      if (reviewer) reviews[i].reviewer = reviewer.name
    }
    res.status(200).json(response)
})

const editProduct = asyncHandler(async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_SECRET
    );
    const userID = new mongoose.Types.ObjectId(decoded.id);
    const request = req.query["request"];
    console.log(request);
    if (request === "ADD") {
      // console.log(req.body)
      const product = req.body;
      product.seller = userID; // Assuming userID is available in the context
      // console.log(product.specifications)
      const dbProduct_temp = await Product.create(product);
      const dbProduct = dbProduct_temp.toObject();
      const productId = dbProduct._id.toString();
      dbProduct.id = productId;
      delete dbProduct._id;
      delete dbProduct.__v;

      const imageUrls = product.images;
      const filenames = imageUrls.map((url) => {
        const pathname = new URL(url).pathname;
        return pathname.substring(pathname.lastIndexOf("/") + 1);
      });

      const productDir = path.join(__dirname, "..", "uploads", productId);
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
      }
      const newImageURLs = [];
      filenames.forEach((filename) => {
        const oldPath = path.join(__dirname, "..", "uploads", filename);
        const newPath = path.join(productDir, filename);
        newImageURLs.push(`${process.env.UPLOAD_URL}/${productId}/${filename}`);
        fs.renameSync(oldPath, newPath);
      });
      dbProduct.images = newImageURLs;
      dbProduct_temp.images = newImageURLs;
      await dbProduct_temp.save();
      res.status(201).send(dbProduct);
      return;
    }
    if (request === "DELETE") {
      const productId = req.query["id"];
      // console.log(productId);
      await Product.findByIdAndDelete(new mongoose.Types.ObjectId(productId));
      const deleteFolder = path.join(uploadDir, productId);
      console.log(deleteFolder)
      try {
        fs.accessSync(deleteFolder);
        fs.rmSync(deleteFolder, { recursive: true});
      } catch (error) {
        if (error.code === "ENOENT") {
          console.log(`Folder not found: ${deleteFolder}`);
        } else {
          console.error(`Error deleting folder: ${error.message}`);
        }
      }
    }
    if (request === "UPDATE") {
      let { reviews, dateAdded, rating, seller, __v, id, ...newProduct } =
        req.body;
      // newProduct.seller = new mongoose.Types.ObjectId(newProduct.seller)
      const productId = new mongoose.Types.ObjectId(id);
      // console.log(newProduct);
      await Product.findByIdAndUpdate(productId, newProduct, { new: true });
      const newImageNames = newProduct.images.map((url) => path.basename(url));
      const newDir = path.join(uploadDir, id);
      fs.readdir(newDir, (err, files) => {
        if (err) {
          console.error("Error reading upload directory:", err);
          return;
        }
        files.forEach((file) => {
          if (!newImageNames.includes(file)) {
            const filePath = path.join(newDir, file);
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error("Error deleting file:", filePath, err);
              }
            });
          }
        });
      });
    }
    if (request === "SET_QUANTITY") {
      const productId = req.query["id"];
      const quantity = Number(req.query["quantity"]);
      // console.log(quantity, productId)
      await Product.findByIdAndUpdate(new mongoose.Types.ObjectId(productId), {
        available: quantity,
      });
    }

    res.status(201).json({ success: true });
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Unauthorized access" });
  }
});

const uploadImage = asyncHandler(async (req, res) => {
  try {
    const files = req.files;
    // console.log("Uploaded files:", files);

    // Construct URLs for uploaded files
    let urls = files.map((file) => `/uploads/${file.filename}`);
    // console.log(urls)
    // console.log(req.query['id'])
    if (req.query["id"]) {
      urls = files.map(
        (file) => `/uploads/${req.query["id"]}/${file.filename}`
      );
    }
    // console.log(urls)
    // Send URLs back to client
    res.status(200).send(urls);
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Failed to upload files" });
  }
});
module.exports = {
  uploadDummyProducts,
  fetchProducts,
  editProduct,
  uploadImage,
  fetchReviews
};
