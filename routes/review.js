const express = require('express')
const {editReview} = require('../controllers/reviewController.js')
const router = express.Router()
router.post('/editreview', editReview)
module.exports = router