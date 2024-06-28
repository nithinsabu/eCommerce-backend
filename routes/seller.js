const express = require('express')
const {addProduct, fetchHistory, orderShipment} = require('../controllers/sellerController.js')
const router = express.Router()
router.post('/addproduct', addProduct)
router.get('/fetchhistory', fetchHistory)
router.post('/ordershipment', orderShipment)
module.exports = router