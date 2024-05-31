const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
            }],
        default: []
    },
    orderDate: {
        type: Date,
        default: Date.now()
    },
    orderAmount: {
        type: Number,
        default: 0
    },
    paymentDetails: {
        type: String
    }
})

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;