const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String },
  email: { type: String,  },
  password: { type: String,  },
  role: { type: String, enum: ['admin', 'faculty'] },
  gender:{type:String},
  dob:{type:String},
  fid:{type:String},
  phone:{type:String},
  profilePicturePath: {type:String},
  facialEncoding:{type:Array}
   
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);