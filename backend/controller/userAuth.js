const UserDB = require('../models/userModel');
const { createHmac, randomBytes } = require('crypto');
const { generateTokenForUser } = require('../services/authentication');

const nodemailer = require('nodemailer');
const otpStore = {}; // OR use MongoDB



async function handleUserSignUp(req, res) {
  const { FullName, email, password } = req.body;
  const emailExist = await UserDB.findOne({ email })
  if (emailExist) { return res.status(400).json({ message: "Email already registered" }); }

  // ✅ 2. Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // ✅ 3. Store OTP temporarily
  otpStore[email] = otp;

  req.session.FullName = FullName;
  req.session.password = password;
  req.session.email = email;
  req.session.otp = otp;

  // ✅ 4. Send OTP via email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from:  process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Signup',
    html: `<h3>Your OTP is: ${otp}</h3>`
  });

  //res.render('verifyOTP', { email }); // Create this form page
  res.status(200).json({ message: 'OTP sent successfully', email });


}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  const user = await UserDB.findOne({ email });
  if (!user) {
     return res.status(400).json({ message: "User not found" });
  }
  const hashPassword = createHmac('sha256', user.salt)
    .update(password)
    .digest('hex');
    
  if (hashPassword !== user.password) {
     return res.status(400).json({ message: "Invalid password" });
  }
  const token = generateTokenForUser(user);
  //return res.cookie('token', token).redirect('/'); 
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000, // 1 hour
    // maxAge: 60 * 1000, // 50 seconds for testing
     sameSite: 'none',
      secure: true,
  });


  return res.status(200).json({ message: "Login Success", user });
}


module.exports = {
  handleUserSignUp,
  handleUserLogin,
};
