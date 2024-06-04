const User = require('../models/user.js')
const jwt = require('jsonwebtoken')
const Cart = require('../models/cart.js')
const Order = require('../models/order.js')
const mongoose = require('mongoose')
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });
};

const userLogin = async (req, res) => {
    const user = await User.findOne({email: req.body.email})
    console.log(req.body.email)
    if (!user){
        res.status(400).json({error:"Email not registered"})
    }else{
        try{
            const result = await user.matchPassword(req.body.password)
            if (result){
                const token = generateToken(user._id)
                const response_user = {
                    displayName: user.name,
                    addresses :  user.addresses,
                    token : token,
                    favouriteItems : user.favorites,
                    email: user.email,
                    phone: user.phone,
                    paymentMethods: user.paymentMethods
                }
                const cart = await Cart.findOne({user : user._id})
                const basket = cart? cart.products: []
                const orders = await Order.find({user: user._id})
                response_user.orders = orders
                res.status(200).json({success: true, user: response_user, basket: basket})
            }else{
                res.status(401).json({error:"Incorrect Password"})
            }
        }catch{
            res.status(500).json({error: "Error in signin"})
        }
    }
    console.log(req.body.email, req.body.password)
}

const userSignup = async (req, res) => {
    const users = await User.find({email: req.body.email})
    if (users.length>0){
        res.status(400).json({error: "Email already in use"})
    }else{
        try{
            const user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone
            })
            const basket = await Cart.create({
                user: user._id,
            })
            const token = generateToken(user._id)
            const response_user = {
                displayName: user.name,
                addresses :  user.addresses,
                token : token,
                favouriteItems : user.favorites,
                orders: [],
                email: user.email,
                phone: user.phone,
                paymentMethods: user.paymentMethods
            }
            res.status(201).json({success: true, user: response_user, basket: []})
        }catch{
            res.status(500).json({error: "Error with database"})
        }
    }
    console.log(req.body.email, req.body.password)
}

const getDetails = async (req, res) => {
    console.log(1)
    const token = req.headers.authorization.split(' ')[1]
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const objectId = new mongoose.Types.ObjectId(decoded.id)
        const user = await User.findById(objectId)
        const response_user = {}
        response_user.displayName = user.name      
        res.status(200).json(user1)
    }catch{
        res.status(401).json({error: 'Invalid token'})
    }
}

const updateDetails = async(req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    const fields = Object.keys(req.query)
    const updateObject = {}
    for (const field of fields){
        updateObject[field] = req.query[field]
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // console.log(decoded)
        const objectId = new mongoose.Types.ObjectId(decoded.id)
        const updateResult = await User.findOneAndUpdate({_id: objectId}, updateObject)
        // console.log(updateResult)
        res.status(201).json({success: true})
    }catch(err){
        console.log(err)
        res.status(500).json({error: 'Error updating'})
    }

}

const editAddress = async(req, res) => {
    try{
        const token = req.headers.authorization.split(' ')[1]
        const field = req.query['request']
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const objectId = new mongoose.Types.ObjectId(decoded.id)
        if (field==='add'){
            const user = await User.findOne({_id: objectId})
            // console.log(req.body)
            user.addresses.push(req.body.address)
            await user.save()
            res.status(201).json({success: true})
        }
        if (field==='update'){
            console.log(req.body.address)
            const user = await User.findOne({_id: objectId})
            // console.log(req.body)
            const indexToUpdate = user.addresses.findIndex(obj => obj.id === req.body.address.id)
            if (indexToUpdate===-1) throw new Error("Error in updating")
            user.addresses[indexToUpdate] = {...user.addresses[indexToUpdate], ...req.body.address}
            await user.save()
            res.status(201).json({success: true})
        }
        if (field==='delete'){
            const user = await User.findOne({_id: objectId})
            const idToDelete = req.query['id']
            const indexToDelete = user.addresses.findIndex(obj => obj.id === idToDelete)
            if (indexToDelete===-1) throw new Error("Error in updating")
            user.addresses.splice(indexToDelete, 1)
            await user.save()
            res.status(204).json({success: true})
        }
    }catch(err){
        console.log(err)
        res.status(500).json({error: 'Error updating'})
    }
    // res.status(500).json({error:'er'})
}
module.exports = {userLogin, userSignup, getDetails, updateDetails, editAddress}