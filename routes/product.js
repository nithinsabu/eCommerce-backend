const express = require('express')
const { uploadDummyProducts, fetchProducts } = require('./../controllers/productControllers')
const router = express.Router()

router.post('/uploaddummyproducts', uploadDummyProducts)
router.get('/fetchproducts', fetchProducts)
module.exports = router