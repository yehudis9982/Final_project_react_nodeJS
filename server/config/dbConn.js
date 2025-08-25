const mongoose = require('mongoose');

const connectDB = async () => {
    console.log("DATABASE_URI:", process.env.DATABASE_URI); // בדיקה
    try {
        await mongoose.connect(process.env.DATABASE_URI);
    } catch (err) {
        console.log("error conection\n" + err);
    }
};

module.exports = connectDB;