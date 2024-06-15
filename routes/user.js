const { userLogin, userSignup, getDetails, updateDetails, editAddress, editBasket, editFavourites, checkout } = require('../controllers/userController.js');
const express = require('express')

const router = express.Router()

router.post('/login', userLogin)
router.post('/signup', userSignup)
router.get('/getdetails', getDetails)
router.put('/updatedetails', updateDetails)
router.post('/editaddress', editAddress)
router.put('/editbasket', editBasket)
router.put('/editfavourites', editFavourites)
router.post('/checkout', checkout)
module.exports = router