const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const userRouter = require('./routes/user.js')
const productRouter = require('./routes/product.js')
const sellerRouter = require('./routes/seller.js')
const reviewRouter = require('./routes/review.js')
const dbConnect = require('./dbConnect.js')


dotenv.config({ path: __dirname + "/.env" });
dbConnect(process.env.DB_URL)

const app = express()

app.use(cors())
app.use(express.json())

app.use('/user', userRouter)
app.use('/product', productRouter)
app.use('/seller', sellerRouter)
app.use('/review', reviewRouter)
app.use('/uploads', express.static(path.join(__dirname,'uploads')))
app.listen(process.env.PORT, () => {
    console.log("listening on port "+process.env.PORT)
})


