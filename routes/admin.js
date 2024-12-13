// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const facultyAttendance = require('../models/facultyAttendance');
const leaveApplication = require('../models/leaveApplication');
const { verifyToken, roleCheck } = require('../middlewares/authMiddleware');

// Endpoint to show details on admin dashboard - faculties present, absent and on leave for today's date
router.get('/dashboard', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const today = new Date().toLocalString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    // Fetch all faculties
    const faculties = await User.find({ role: 'faculty' });

    // Fetch attendance records for today
    const attendanceRecords = await facultyAttendance.find({ attendanceDate: today });

    // Fetch pending leave applications
    const pendingLeaveApplications = await leaveApplication.find({ status: 'Pending' });
    

    const presentFaculties = attendanceRecords.filter(record => record.facultyStatus === 'P').map(record => record.faculty_id);
    const onLeaveFaculties = attendanceRecords.filter(record => record.facultyStatus === 'L').map(record => record.faculty_id);
    const absentFaculties = faculties.filter(faculty => !presentFaculties.includes(faculty.fid.toString()) && !onLeaveFaculties.includes(faculty.fid.toString()));

    res.json({
      present: presentFaculties.length,
      absent: absentFaculties.length,
      onLeave: onLeaveFaculties.length,
      pendingLeaves: pendingLeaveApplications.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all faculty details
router.get('/faculty', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const faculties = await User.find({ role: 'faculty' }); // Fetch all users with the role of 'faculty'
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance and leave for a particular faculty by their faculty_id
router.get('/:faculty_id/facultyDetails', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const facultyId = req.params.faculty_id;

    // Query for finding attendance and leave records for the given faculty_id
    const attendanceRecords = await facultyAttendance.find({ faculty_id: facultyId }).sort({ attendanceDate: -1 });
    const leaveDetails = await leaveApplication.find({ faculty_id: facultyId }).sort({ fromDate: -1 });
    const facultyData = await User.findOne({ fid: facultyId, role: 'faculty' });

    res.json({
      facultyData,
      attendanceRecords,
      leaveDetails
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a faculty by their faculty_id
router.delete('/faculty/:faculty_id', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const facultyId = req.params.faculty_id;

    // Find the faculty user by their ID and role
    const faculty = await User.findOne({ fid: facultyId, role: 'faculty' });

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Delete the faculty user
    await User.deleteOne({ fid: facultyId, role: 'faculty' });

    // Optionally, delete related faculty attendance and leave records
    await facultyAttendance.deleteMany({ faculty_id: facultyId });

    await leaveApplication.deleteMany({ faculty_id: facultyId });

    res.json({ message: 'Faculty and related attendance records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all pending leave applications with faculty names
router.get('/leave/pending', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    // Fetch pending leave applications
    const pendingLeaves = await leaveApplication.find({ status: 'Pending' });

    // Extract faculty IDs from pending leave applications
    const facultyIds = pendingLeaves.map(leave => leave.faculty_id);

    // Fetch user details for the faculty members
    const facultyDetails = await User.find({ fid: { $in: facultyIds } }, 'fid name');

    // Create a map of faculty details
    const facultyMap = facultyDetails.reduce((map, faculty) => {
      map[faculty.fid] = faculty;
      return map;
    }, {});

    // Combine leave application data with faculty details
    const result = pendingLeaves.map(leave => ({
      ...leave.toObject(),
      faculty: facultyMap[leave.faculty_id]
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Approve or Deny leave request
router.put('/leave/:leave_id', verifyToken, roleCheck(['admin']), async (req, res) => {
    try {
      const leaveId = req.params.leave_id;
      const { status } = req.body;
  
      // Ensure status is either 'Approved' or 'Denied'
      if (status !== 'Approved' && status !== 'Denied') {
        return res.status(400).json({ message: 'Invalid status. Must be either Approved or Denied.' });
      }
  
      // Find the leave application by its ID
      const leave = await leaveApplication.findById(leaveId);
  
      if (!leave) {
        return res.status(404).json({ message: 'Leave application not found' });
      }
  
      // Update the leave application status
      leave.status = status;
      leave.decisionBy = req.user.id;  // Admin ID from the JWT token
  
      // If approved, update the faculty attendance status
      if (status === 'Approved') {
        const fromDate = new Date(leave.fromDate);
        const toDate = new Date(leave.toDate);
        const facultyId = leave.faculty_id;
  
        // Loop through each date between fromDate and toDate
        for (let date = fromDate; date <= toDate; date.setDate(date.getDate() + 1)) {
          const attendanceDate = date.toLocalString().split('T')[0];  // Convert to YYYY-MM-DD
  
          // Update the faculty's attendance status to 'L' for each leave date
          const res = await facultyAttendance.updateOne(
            { faculty_id: facultyId, attendanceDate: attendanceDate },
            { facultyStatus: 'L' },
            { upsert: true }  // Create a new attendance record if one doesn't exist
          );
        }
      }
  
      // Save the updated leave application
      await leave.save();
  
      res.json({ message: `Leave request has been ${status.toLowerCase()}`, leave });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

module.exports = router;
