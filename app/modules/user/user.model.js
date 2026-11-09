
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    rollNumber: {
        type: String
    },
    department: {
        type: String
    },
    hostel: {
        type: String
    },
    roomNumber: {
        type: String
    },
    messId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
});

module.exports = mongoose.model('user', userSchema);
