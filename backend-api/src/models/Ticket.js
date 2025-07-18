const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  customerId: {
    type: String,
    required: true,
    index: true // Ensure efficient tenant queries
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  workflowTriggered: {
    type: Boolean,
    default: false
  },
  workflowData: {
    triggeredAt: Date,
    completedAt: Date,
    webhookData: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Static method to find by tenant
ticketSchema.statics.findByTenant = function(customerId, filter = {}) {
  return this.find({ customerId, ...filter });
};

// Instance method to update workflow status
ticketSchema.methods.updateWorkflowStatus = function(webhookData) {
  this.workflowData.completedAt = new Date();
  this.workflowData.webhookData = webhookData;
  return this.save();
};

module.exports = mongoose.model('Ticket', ticketSchema);