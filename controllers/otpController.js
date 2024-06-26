const Otp = require('../models/otp.js');
const User = require('../models/user.js')
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const sendOtp = async (req, res, next) => {
    try {
        const user = await User.find({email: req.body.email})
        if (user.length>0){
            return res.status(400).json({error: 'Email already registered'})
        }
        const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
        const hashedOtp = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await Otp.deleteMany({email: req.body.email})
        const newOtp = await Otp.create({
            email: req.body.email,
            otp: hashedOtp,
            expiresAt: expiresAt
        });

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.OTP_EMAIL,
                pass:  process.env.OTP_PASSWORD,
            }
        });

        const mailOptions = {
            from:  process.env.OTP_EMAIL,
            to: req.body.email,
            subject: 'Your OTP Code from STORE',
            text: `Your OTP code is ${otp}. It will expire in 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        res.status(201).json({success: true})
    } catch (error) {
        console.error(`Error sending OTP email: ${error.message}`);
        res.status(500).json({error: 'Server Error'})
    }
};

const verifyOtp = async (req, res, next) => {
    const { email, otp } = req.body;
    try {
        const user = await User.find({email: req.body.email})
        if (user.length>0){
            return res.status(400).json({error: 'Email already registered'})
        }
        const otpRecord = await Otp.findOne({ email });
        if (!otpRecord) {
            return res.status(500).json({ error: "OTP corrupted in database" });
        }

        const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
        const isOtpExpired = otpRecord.expiresAt < new Date();
        // console.log(isOtpValid, isOtpExpired)
        if (isOtpValid && !isOtpExpired) {
            await Otp.deleteMany({ email }); 
            next();
        } else if (isOtpExpired) {
            await Otp.deleteMany({ email });
            return res.status(400).json({ error: 'OTP has expired' });
        } else {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
    } catch (error) {
        console.error(`Error verifying OTP: ${error.message}`);
        res.status(500).json({ error: "ERROR IN SERVER" });
    }
};

module.exports = { sendOtp, verifyOtp };
