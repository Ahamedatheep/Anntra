const mongoose = require('mongoose');

const FoodBatchSchema = new mongoose.Schema({
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodType: { type: String, required: true },
    quantity: { type: String, required: true }, // e.g., "50 meals"
    category: { type: String, enum: ['Veg', 'Non-Veg', 'Halal'], default: 'Veg' },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'expired', 'cancelled'],
        default: 'pending'
    },
    preparationTime: { type: Date, required: true },
    pickupWindow: {
        start: { type: Date },
        end: { type: Date }
    },
    expiryTime: { type: Date, required: true },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    address: { type: String, required: true },
    assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    urgencyLevel: { type: String, enum: ['normal', 'urgent', 'critical'], default: 'normal' },
    photoProof: { type: String },
    createdAt: { type: Date, default: Date.now }
});

FoodBatchSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('FoodBatch', FoodBatchSchema);
