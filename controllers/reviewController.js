const jwt = require("jsonwebtoken");
const Review = require("../models/review.js");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

const editReview = asyncHandler(async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const request = req.query["request"];
    console.log(request)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (request==='ADD'){
        const review = await Review.create({
            comment: req.body.comment,
            rating: req.body.rating,
            reviewer: new mongoose.Types.ObjectId(decoded.id),
            date: Date.now(),
            product: new mongoose.Types.ObjectId(req.body.product)
        })
        res.status(201).json({id: review.id})
    }
    if (request==='EDIT'){
        const review =  await Review.findById(new mongoose.Types.ObjectId(req.body.id))
        if (!review) throw new Error('Error in database')
        review.comment = req.body.comment
        review.rating = req.body.rating
        review.date = Date.now()
        await review.save()
        res.status(201).json({date: review.date})
    }
    if (request==="DELETE"){
        await Review.findByIdAndDelete(new mongoose.Types.ObjectId(req.body.id))
        res.status(204).json({success: true})
    }
  } catch(e) {
    res.status(400).json({error: e.message})
  }
});

module.exports = { editReview };
