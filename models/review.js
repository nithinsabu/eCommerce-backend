const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    products: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    },
    ratings: {
        type: Number,
        min: 1,
        max: 5
    },
    review: {
        type: String,  
    }
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;