const { userLogin, userSignup, getDetails, updateDetails } = require('../controllers/userLogin.js');
const express = require('express')

const router = express.Router()

router.post('/login', userLogin)
router.post('/signup', userSignup)
router.get('/getdetails', getDetails)
router.put('/updatedetails', updateDetails)
module.exports = router