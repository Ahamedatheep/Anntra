const mongoose = require('mongoose');

const ImpactMetricsSchema = new mongoose.Schema({
    totalMealsSaved: { type: Number, default: 0 },
    totalCO2Reduced: { type: Number, default: 0 },
    donorsCount: { type: Number, default: 0 },
    volunteersCount: { type: Number, default: 0 },
    ngosCount: { type: Number, default: 0 },
    beneficiariesCount: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ImpactMetrics', ImpactMetricsSchema);
