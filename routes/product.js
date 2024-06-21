const express = require('express')
const { uploadDummyProducts, fetchProducts, editProduct } = require('./../controllers/productControllers')
const router = express.Router()

router.post('/uploaddummyproducts', uploadDummyProducts)
router.get('/fetchproducts', fetchProducts)
router.post('/editproduct', editProduct)
module.exports = router