const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // e.g., 'CREATE_FOOD_BATCH', 'ASSIGN_VOLUNTEER', 'REASSIGN'
    entity: { type: String, required: true }, // e.g., 'FoodBatch', 'Assignment', 'User'
    entityId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: mongoose.Schema.Types.Mixed }, // Flexible object for additional data
    ipAddress: { type: String },
    userAgent: { type: String },
    severity: { type: String, enum: ['info', 'warning', 'error', 'critical'], default: 'info' },
    timestamp: { type: Date, default: Date.now }
});

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ user: 1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
