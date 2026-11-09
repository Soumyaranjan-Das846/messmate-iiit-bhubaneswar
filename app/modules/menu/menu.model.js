
const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
    {
        messId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },

        day: {
            type: String,
            enum: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
            ],
            required: true
        },

        breakfast: {
            type: [String],
            default: []
        },

        lunch: {
            type: [String],
            default: []
        },

        snacks: {
            type: [String],
            default: []
        },

        dinner: {
            type: [String],
            default: []
        },

        specialNote: {
            type: String,
            default: ''
        },

        isSpecialDay: {
            type: Boolean,
            default: false
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    },
    {
        timestamps: true
    }
);

// Only one menu per day for each mess
menuSchema.index(
    { messId: 1, day: 1 },
    { unique: true }
);

module.exports = mongoose.model('menu', menuSchema);
