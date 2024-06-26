const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: { type: Date, default: Date.now() },
  expiresAt: Date,
});

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;
