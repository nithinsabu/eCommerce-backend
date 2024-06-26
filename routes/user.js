const { userLogin, userSignup, getDetails, updateDetails, editAddress, editBasket, editFavourites, checkout } = require('../controllers/userController.js');
const {sendOtp, verifyOtp} = require('../controllers/otpController.js')
const express = require('express')

const router = express.Router()

router.post('/login', userLogin)
router.post('/signup', verifyOtp, userSignup)
router.get('/getdetails', getDetails)
router.put('/updatedetails', updateDetails)
router.post('/editaddress', editAddress)
router.put('/editbasket', editBasket)
router.put('/editfavourites', editFavourites)
router.post('/checkout', checkout)
router.post('/sendotp', sendOtp)
module.exports = router