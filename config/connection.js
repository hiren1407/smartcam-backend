const uri = process.env.ATLAS_URI || "";


const mongoose = require('mongoose');

const db = uri


const connectDB = async () => {
    try {
        await mongoose.connect(db);
        console.log('MongoDB Connected!!!');
    } catch (error) {
        console.log(error);

        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;