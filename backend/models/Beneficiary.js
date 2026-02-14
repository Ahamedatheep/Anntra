const mongoose = require('mongoose');

const BeneficiarySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Linked NGO
    familySize: { type: Number, default: 1 },
    preferredCategory: { type: String, enum: ['Veg', 'Non-Veg', 'Halal', 'Any'], default: 'Any' },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    address: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
    requests: [
        {
            requestedAt: { type: Date, default: Date.now },
            status: { type: String, enum: ['pending', 'approved', 'fulfilled', 'cancelled'], default: 'pending' },
            foodBatch: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodBatch' },
            fulfilledAt: { type: Date }
        }
    ],
    totalMealsReceived: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

BeneficiarySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Beneficiary', BeneficiarySchema);
