const mongoose = require('mongoose');

const NGOSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationName: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    operatingRadius: { type: Number, default: 5000 }, // in meters
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    address: { type: String, required: true },
    approvedDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    approvedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    managedBeneficiaries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary' }],
    status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
    totalDeliveriesMonitored: { type: Number, default: 0 },
    emergencyContactNumber: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

NGOSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('NGO', NGOSchema);
