const { getFaceEncoding } = require('../helpers/faceEncodingHelper');
const express = require("express");
const path = require('path');
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const facultyAttendance = require("../models/facultyAttendance")
const leaveApplication = require('../models/leaveApplication');

const { verifyToken, roleCheck } = require('../middlewares/authMiddleware');

router.post("/register", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email })

    if (user) {
      return res.status(400).json({ email: "Faculty already exists" });
    } else {
     

      newUser = new User({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        role: 'faculty',
        fid: req.body.fid,
        gender: req.body.gender,
        dob: req.body.dob,
        phone: req.body.phone,
        facialEncoding:[]
       
      });

      const salt = await bcrypt.genSalt(10);

      newUser.password = await bcrypt.hash(newUser.password, salt);
      await newUser.save();

      res.status(201).json({ message: 'Faculty registered successfully' });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile', verifyToken, roleCheck(['faculty']), async (req, res) => {
  try {
    // Fetch the user's profile, ensuring the user is a faculty member
    const facultyProfile = await User.findOne({ fid: req.user.id, role: 'faculty' });

    if (!facultyProfile) {
      return res.status(404).json({ message: 'Faculty profile not found' });
    }

    res.json(facultyProfile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Faculty Profile
router.put('/profile', verifyToken, roleCheck(['faculty']), async (req, res) => {
  try {
    // Extract fields to update from the request body
    const { phone } = req.body;

    // Find the logged-in user by their ID and role
    const facultyProfile = await User.findOne({ fid: req.user.id, role: 'faculty' });

    if (!facultyProfile) {
      return res.status(404).json({ message: 'Faculty profile not found' });
    }

    // Update fields only if they are provided in the request
   
    
    if (phone) facultyProfile.phone = phone;
    

    // Save the updated profile
    await facultyProfile.save();

    res.json({ message: 'Profile updated successfully', facultyProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Endpoint to change password
router.post('/changePassword', verifyToken, roleCheck(['faculty']), async (req, res) => {
  try {
    const { newPassword } = req.body;

    // Find the logged-in user by their ID and role
    const facultyProfile = await User.findOne({ fid: req.user.id, role: 'faculty' });

    if (!facultyProfile) {
      return res.status(404).json({ message: 'Faculty profile not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    facultyProfile.password = await bcrypt.hash(newPassword, salt);

    // Save the updated profile
    await facultyProfile.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance and leave for a particular faculty by their faculty_id
router.get('/:faculty_id/attendanceAndLeave', verifyToken, roleCheck(['faculty', 'admin']), async (req, res) => {
  try {
    const facultyId = req.params.faculty_id;

    // Query for finding attendance and leave records for the given faculty_id
    const attendanceRecords = await facultyAttendance.find({ faculty_id: facultyId });

    const leaveDetails = await leaveApplication.find({ faculty_id: facultyId });


    res.json({
      attendanceRecords,
      leaveDetails
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply for leave
router.post('/leave', verifyToken, roleCheck(['faculty']), async (req, res) => {
  try {
    const { fromDate, toDate, leaveReason } = req.body;

    // Ensure fromDate, toDate, and leaveReason are provided
    if (!fromDate || !toDate || !leaveReason) {
      return res.status(400).json({ message: 'Please provide all required details' });
    }

    // Create a new leave application
    const newLeave = new leaveApplication({
      faculty_id: req.user.id,  // Faculty ID from the JWT token
      fromDate,
      toDate,
      leaveReason,
    });

    // Save the leave application to the database
    await newLeave.save();

    res.status(201).json({ message: 'Leave application submitted successfully', newLeave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;