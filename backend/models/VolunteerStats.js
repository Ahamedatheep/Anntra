const mongoose = require('mongoose');

const VolunteerStatsSchema = new mongoose.Schema({
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reliabilityScore: { type: Number, default: 100 },
    completedDeliveries: { type: Number, default: 0 },
    assignedDeliveries: { type: Number, default: 0 },
    tier: { type: Number, enum: [1, 2, 3], default: 3 }, // Tier 1: 95%+, Tier 2: 80%+, Tier 3: <80%
    totalMealsServed: { type: Number, default: 0 },
    totalCO2Saved: { type: Number, default: 0 }, // in kg
    lastActiveAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VolunteerStats', VolunteerStatsSchema);
