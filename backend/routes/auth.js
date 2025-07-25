const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { mobile, firstName, lastName, email, comment, isAdmin, isSelected, place, gender, age, preferredLang, refSource, referrerInfo, country, profession, address } = req.body;
    if (!mobile || !firstName || !lastName || !place || !gender || !age || !preferredLang || !refSource || !referrerInfo || !country) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    const existing = await User.findOne({ mobile });
    if (existing) return res.status(400).json({ error: 'User with provided mobile already exists' });
    const user = await User.create({
      mobile,
      firstName,
      lastName,
      email: email || undefined,
      comment: comment || undefined,
      isAdmin: isAdmin || false,
      isSelected: typeof isSelected === 'boolean' ? isSelected : false,
      place,
      gender,
      age,
      preferredLang,
      refSource,
      referrerInfo,
      country,
      profession: profession || undefined,
      address: address || undefined,
      courses: {},
      events: {}
    });
    const token = jwt.sign({ id: user._id, mobile: user.mobile, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        userId: user._id,
        mobile: user.mobile,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        comment: user.comment,
        isAdmin: user.isAdmin,
        isSelected: user.isSelected,
        place: user.place,
        gender: user.gender,
        age: user.age,
        preferredLang: user.preferredLang,
        refSource: user.refSource,
        referrerInfo: user.referrerInfo,
        country: user.country,
        profession: user.profession,
        address: user.address
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err && err.message ? err.message : 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) return res.status(400).json({ error: 'Mobile and OTP required' });
    // Placeholder OTP validation (always succeeds)
    // In production, validate OTP properly
    const user = await User.findOne({ mobile });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    // Assume OTP is always valid for now
    const token = jwt.sign({ id: user._id, mobile: user.mobile, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        userId: user._id,
        mobile: user.mobile,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        comment: user.comment,
        isAdmin: user.isAdmin,
        isSelected: user.isSelected
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Check if user exists and is registered by mobile number
router.post('/check-mobile', async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ error: 'Mobile is required' });
    const user = await User.findOne({ mobile });
    if (!user) return res.json({ exists: false, isSelected: false });
    return res.json({ exists: true, isSelected: !!user.isSelected });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check mobile' });
  }
});

module.exports = router; 