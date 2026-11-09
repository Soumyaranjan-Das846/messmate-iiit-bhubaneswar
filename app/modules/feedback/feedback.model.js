
const mongoose = require('mongoose');

const { Schema } = mongoose;

const feedbackSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },

    messId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    type: {
      type: String,
      enum: ['Feedback', 'Complaint'],
      required: true,
    },

    category: {
      type: String,
      enum: [
        'Food Quality',
        'Hygiene',
        'Taste',
        'Quantity',
        'Service',
        'Other',
      ],
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },

    adminResponse: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('feedback', feedbackSchema);
