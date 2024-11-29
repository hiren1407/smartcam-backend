const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const facultyAttendanceSchema = new Schema({
   faculty_id:{
    type:String
   },
   attendanceDate:{
    type:String
   },
   attendanceTime:{
    type:String
   },
   facultyStatus:{
    type:String
   }
   
});

module.exports = mongoose.model('facultyAttendance', facultyAttendanceSchema);