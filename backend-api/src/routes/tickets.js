const express = require('express');
const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const { authenticateToken, ensureTenantIsolation, auditApiCall } = require('../middleware/auth');
const { triggerTicketWorkflow } = require('../utils/workflow');

const router = express.Router();

// Apply authentication and tenant isolation to all routes
router.use(authenticateToken);
router.use(ensureTenantIsolation);

// Get all tickets for current user's tenant
router.get('/', auditApiCall('get_tickets'), async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    
    // Build query with tenant filter
    const query = { ...req.tenantFilter };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // If user is not admin, only show their own tickets
    if (req.user.role !== 'Admin') {
      query.userId = req.user.id;
    }

    const skip = (page - 1) * limit;
    
    const tickets = await Ticket.find(query)
      .populate('userId', 'email')
      .populate('assignedTo', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ticket.countDocuments(query);

    res.json({
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to get tickets' });
  }
});

// Get single ticket by ID
router.get('/:id', auditApiCall('get_ticket'), async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ 
      _id: req.params.id, 
      ...req.tenantFilter 
    })
    .populate('userId', 'email')
    .populate('assignedTo', 'email');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Non-admin users can only view their own tickets
    if (req.user.role !== 'Admin' && ticket.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ ticket });

  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to get ticket' });
  }
});

// Create new ticket
router.post('/', auditApiCall('create_ticket'), async (req, res) => {
  try {
    const { title, description, priority = 'medium' } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Create ticket with automatic tenant isolation
    const ticketData = {
      title,
      description,
      priority,
      customerId: req.user.customerId,
      userId: req.user.id
    };

    const ticket = new Ticket(ticketData);
    await ticket.save();

    // Populate user info for response
    await ticket.populate('userId', 'email');

    // Trigger n8n workflow
    const workflowResult = await triggerTicketWorkflow(ticket);
    
    if (workflowResult) {
      ticket.workflowTriggered = true;
      ticket.workflowData.triggeredAt = new Date();
      await ticket.save();
    }

    // Log ticket creation
    await AuditLog.logAction({
      action: 'ticket_created',
      userId: req.user.id,
      customerId: req.user.customerId,
      resourceType: 'ticket',
      resourceId: ticket._id.toString(),
      details: { 
        title: ticket.title, 
        priority: ticket.priority,
        workflowTriggered: ticket.workflowTriggered
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket,
      workflowTriggered: ticket.workflowTriggered
    });

  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Update ticket
router.put('/:id', auditApiCall('update_ticket'), async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo } = req.body;
    
    const ticket = await Ticket.findOne({ 
      _id: req.params.id, 
      ...req.tenantFilter 
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Non-admin users can only update their own tickets
    if (req.user.role !== 'Admin' && ticket.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update fields
    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    
    // Only admins can assign tickets
    if (assignedTo && req.user.role === 'Admin') {
      ticket.assignedTo = assignedTo;
    }

    await ticket.save();
    await ticket.populate(['userId', 'assignedTo'], 'email');

    // Log ticket update
    await AuditLog.logAction({
      action: 'ticket_updated',
      userId: req.user.id,
      customerId: req.user.customerId,
      resourceType: 'ticket',
      resourceId: ticket._id.toString(),
      details: { 
        updates: { title, description, status, priority, assignedTo },
        previousStatus: ticket.status
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Ticket updated successfully',
      ticket
    });

  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Delete ticket (admin only)
router.delete('/:id', auditApiCall('delete_ticket'), async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const ticket = await Ticket.findOne({ 
      _id: req.params.id, 
      ...req.tenantFilter 
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    await Ticket.deleteOne({ _id: ticket._id });

    // Log ticket deletion
    await AuditLog.logAction({
      action: 'ticket_deleted',
      userId: req.user.id,
      customerId: req.user.customerId,
      resourceType: 'ticket',
      resourceId: ticket._id.toString(),
      details: { 
        title: ticket.title,
        status: ticket.status
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Ticket deleted successfully' });

  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

// Get ticket statistics for current tenant
router.get('/stats/summary', auditApiCall('get_ticket_stats'), async (req, res) => {
  try {
    const query = { ...req.tenantFilter };
    
    // If user is not admin, only show their own ticket stats
    if (req.user.role !== 'Admin') {
      query.userId = req.user.id;
    }

    const stats = await Ticket.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, high: 0, urgent: 0
    };

    res.json({
      statistics: result,
      tenant: req.user.customerId,
      userRole: req.user.role
    });

  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({ error: 'Failed to get ticket statistics' });
  }
});

module.exports = router;