const express = require('express');
const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const { verifyWebhookSecret } = require('../utils/workflow');

const router = express.Router();

// Webhook endpoint for n8n callback when ticket processing is done
router.post('/ticket-done', async (req, res) => {
  try {
    // Verify webhook secret
    const receivedSecret = req.headers['x-webhook-secret'] || req.body.secret;
    
    if (!verifyWebhookSecret(receivedSecret)) {
      console.warn('Invalid webhook secret received');
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    const { ticketId, customerId, status, message, workflowData } = req.body;

    if (!ticketId || !customerId) {
      return res.status(400).json({ error: 'ticketId and customerId are required' });
    }

    // Find the ticket with tenant isolation
    const ticket = await Ticket.findOne({ 
      _id: ticketId, 
      customerId: customerId 
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Update ticket based on webhook data
    const updates = {};
    
    if (status && ['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
      updates.status = status;
    }

    // Update workflow completion data
    updates['workflowData.completedAt'] = new Date();
    updates['workflowData.webhookData'] = {
      message,
      data: workflowData,
      receivedAt: new Date()
    };

    await Ticket.updateOne({ _id: ticketId }, { $set: updates });

    // Log the webhook event
    await AuditLog.logAction({
      action: 'workflow_completed',
      userId: ticket.userId,
      customerId: ticket.customerId,
      resourceType: 'ticket',
      resourceId: ticket._id.toString(),
      details: {
        webhookMessage: message,
        newStatus: status,
        workflowData: workflowData,
        processingTime: new Date() - ticket.workflowData.triggeredAt
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    console.log(`Webhook processed for ticket ${ticketId} (${customerId}):`, { status, message });

    res.json({
      message: 'Webhook processed successfully',
      ticketId,
      customerId,
      updatedStatus: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Health check endpoint for webhooks
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'webhook-handler',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/webhook/ticket-done'
    ]
  });
});

// Test endpoint for webhook development (only in development)
router.post('/test', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    const { ticketId, customerId, secret } = req.body;

    // Verify secret
    if (!verifyWebhookSecret(secret)) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    res.json({
      message: 'Test webhook received',
      received: {
        ticketId,
        customerId,
        timestamp: new Date().toISOString()
      },
      note: 'This is a test endpoint for development only'
    });

  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({ error: 'Test webhook failed' });
  }
});

module.exports = router;