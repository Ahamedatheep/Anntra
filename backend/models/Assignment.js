const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    foodBatch: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodBatch', required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'reassigned'],
        default: 'assigned'
    },
    logs: [
        {
            status: { type: String },
            timestamp: { type: Date, default: Date.now },
            location: {
                type: { type: String, default: 'Point' },
                coordinates: { type: [Number] }
            }
        }
    ],
    lastMovementAt: { type: Date, default: Date.now },
    assignedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
