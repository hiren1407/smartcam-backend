// models/leaveApplication.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaveApplicationSchema = new Schema({
  faculty_id: {
    type: String,
    required: true
  },
  fromDate: {
    type: String,  // Start date of the leave
    required: true
  },
  toDate: {
    type: String,  // End date of the leave
    required: true
  },
  leaveReason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Denied'],
    default: 'Pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('leaveApplication', leaveApplicationSchema);
