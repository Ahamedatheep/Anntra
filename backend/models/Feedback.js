const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    foodBatch: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodBatch', required: true },
    beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5, required: true },
    foodQuality: { type: Number, min: 1, max: 5 },
    deliveryTime: { type: Number, min: 1, max: 5 },
    volunteerBehavior: { type: Number, min: 1, max: 5 },
    comments: { type: String },
    type: { type: String, enum: ['delivery', 'quality', 'general'], default: 'delivery' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
