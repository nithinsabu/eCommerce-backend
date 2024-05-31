const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    products: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
            }],
        default: []
    }
})

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;