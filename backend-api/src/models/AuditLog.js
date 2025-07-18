const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerId: {
    type: String,
    required: true,
    index: true
  },
  resourceType: {
    type: String,
    required: true // e.g., 'ticket', 'user', 'auth'
  },
  resourceId: {
    type: String // ID of the resource being acted upon
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Static method to log action
auditLogSchema.statics.logAction = async function(actionData) {
  try {
    const log = new this({
      ...actionData,
      timestamp: new Date()
    });
    await log.save();
    return log;
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't fail the main operation if audit logging fails
  }
};

// Static method to find by tenant
auditLogSchema.statics.findByTenant = function(customerId, filter = {}) {
  return this.find({ customerId, ...filter }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('AuditLog', auditLogSchema);