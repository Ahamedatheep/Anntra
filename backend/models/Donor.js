const mongoose = require('mongoose');

const DonorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationType: { type: String, enum: ['restaurant', 'hotel', 'catering', 'individual', 'event', 'other'], default: 'individual' },
    totalDonations: { type: Number, default: 0 },
    totalMealsDonated: { type: Number, default: 0 },
    successfulDeliveries: { type: Number, default: 0 },
    trustScore: { type: Number, default: 100, min: 0, max: 100 },
    badges: [
        {
            name: { type: String },
            earnedAt: { type: Date, default: Date.now },
            icon: { type: String }
        }
    ],
    preferredPickupTimes: [
        {
            dayOfWeek: { type: Number }, // 0-6 (Sunday-Saturday)
            startTime: { type: String }, // e.g., "18:00"
            endTime: { type: String }
        }
    ],
    avgResponseTime: { type: Number, default: 0 }, // in minutes
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donor', DonorSchema);
