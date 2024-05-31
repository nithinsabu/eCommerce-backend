const mongoose = require('mongoose')

const dbConnect = (dbURL) => {
    mongoose.connect(dbURL)
    .then(() => console.log("Connected"))
    .catch(() => console.log("Error in connection"))
}

module.exports = dbConnect