const mongoose = require('mongoose');

const DistributionRecordSchema = new mongoose.Schema({
    foodBatch: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodBatch', required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pickupTime: { type: Date },
    deliveryTime: { type: Date, required: true },
    distance: { type: Number }, // in meters
    mealsServed: { type: Number, required: true },
    co2Saved: { type: Number, default: 0 }, // in kg
    methaneSaved: { type: Number, default: 0 }, // in kg
    photoProof: { type: String },
    route: {
        pickup: {
            type: { type: String, default: 'Point' },
            coordinates: { type: [Number] }
        },
        dropoff: {
            type: { type: String, default: 'Point' },
            coordinates: { type: [Number] }
        }
    },
    status: { type: String, enum: ['completed', 'verified', 'disputed'], default: 'completed' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DistributionRecord', DistributionRecordSchema);
