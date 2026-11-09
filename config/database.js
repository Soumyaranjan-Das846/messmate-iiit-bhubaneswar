
const mongoose = require('mongoose');

module.exports = function () {
    mongoose.connection.on('connected', () => {
        console.log('MongoDB connected successfully');
    });

    mongoose.connection.on('disconnected', () => {
        console.error('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected successfully');
    });

    mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error.message);
    });

    return mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        connectTimeoutMS: 30000,
    })
        .then(() => {
            console.log('Initial MongoDB connection established');
        })
        .catch((error) => {
            console.error('Initial MongoDB connection failed:', error);
            throw error;
        });
};
