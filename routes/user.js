const { userLogin, userSignup, fetchUser, updateDetails, editAddress, editBasket, editFavourites, placeOrder, fetchOrders } = require('../controllers/userController.js');
const {sendOtp, verifyOtp} = require('../controllers/otpController.js')
const express = require('express')

const router = express.Router()

router.post('/login', userLogin)
router.post('/signup', verifyOtp, userSignup)
router.get('/fetchuser', fetchUser)
router.put('/updatedetails', updateDetails)
router.post('/editaddress', editAddress)
router.put('/editbasket', editBasket)
router.put('/editfavourites', editFavourites)
router.post('/placeorder', placeOrder)
router.post('/sendotp', sendOtp)
router.get('/fetchorders', fetchOrders)
module.exports = router