const express = require('express')
const {addProduct} = require('../controllers/sellerControllers.js')
const router = express.Router()
router.post('/addproduct', addProduct)
module.exports = router