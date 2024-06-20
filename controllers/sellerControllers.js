const mongoose = require("mongoose");
const Product = require("../models/product.js");
const asyncHandler = require('express-async-handler')

const addProduct = asyncHandler(async(req, res) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const product = req.body.product
        product.seller = new mongoose.Types.ObjectId(decoded.id)
        await Product.create(product)
    }
    catch(e){

    }
})
module.exports = {addProduct}