const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true,
        unique: true
    },

    minQuantity: {
        type: Number,
        required: true,
        default: 1
    },

    description: {
        type: String
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId, ref: 'user' 
    }
})

const Product = mongoose.model('Product', productSchema);

module.exports = Product;