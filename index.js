const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors')
const userRouter = require('./routes/user.js')
const dbConnect = require('./dbConnect.js')


dotenv.config({ path: __dirname + "/.env" });
dbConnect(process.env.DB_URL)

const app = express()

app.use(cors())
app.use(express.json())

app.use('/user', userRouter)

app.listen(process.env.PORT, () => {
    console.log("listening on port "+process.env.PORT)
})


