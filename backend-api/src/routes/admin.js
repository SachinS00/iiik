const express = require('express');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const { authenticateToken, requireAdmin, auditApiCall } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin requirement to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users (with tenant filtering for non-super-admin)
router.get('/users', auditApiCall('admin_get_users'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, customerId } = req.query;
    
    // Build query - admins can only see users from their tenant
    const query = { customerId: req.user.customerId };
    
    if (role) query.role = role;
    if (customerId && customerId !== req.user.customerId) {
      // For future super-admin functionality
      return res.status(403).json({ error: 'Cannot access other tenants' });
    }

    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get all tickets across all users in tenant
router.get('/tickets', auditApiCall('admin_get_all_tickets'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, userId } = req.query;
    
    // Admin can see all tickets in their tenant
    const query = { customerId: req.user.customerId };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (userId) query.userId = userId;

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
    console.error('Admin get tickets error:', error);
    res.status(500).json({ error: 'Failed to get tickets' });
  }
});

// Get audit logs for the tenant
router.get('/audit-logs', auditApiCall('admin_get_audit_logs'), async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId, resourceType, startDate, endDate } = req.query;
    
    // Build query for tenant audit logs
    const query = { customerId: req.user.customerId };
    
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (resourceType) query.resourceType = resourceType;
    
    // Date range filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const logs = await AuditLog.find(query)
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(query);

    // Get action summary for the filter period
    const actionSummary = await AuditLog.aggregate([
      { $match: query },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      logs,
      actionSummary,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin get audit logs error:', error);
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
});

// Get dashboard statistics
router.get('/dashboard', auditApiCall('admin_get_dashboard'), async (req, res) => {
  try {
    const tenantFilter = { customerId: req.user.customerId };

    // User statistics
    const userStats = await User.aggregate([
      { $match: tenantFilter },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'Admin'] }, 1, 0] } },
          regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'User'] }, 1, 0] } }
        }
      }
    ]);

    // Ticket statistics
    const ticketStats = await Ticket.aggregate([
      { $match: tenantFilter },
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          openTickets: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          inProgressTickets: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          resolvedTickets: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closedTickets: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          highPriorityTickets: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          urgentTickets: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          workflowTriggered: { $sum: { $cond: ['$workflowTriggered', 1, 0] } }
        }
      }
    ]);

    // Recent activity
    const recentActivity = await AuditLog.find(tenantFilter)
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('action userId resourceType createdAt details');

    // Activity by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityByDay = await AuditLog.aggregate([
      { 
        $match: { 
          ...tenantFilter,
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      tenant: req.user.customerId,
      userStatistics: userStats[0] || { totalUsers: 0, adminUsers: 0, regularUsers: 0 },
      ticketStatistics: ticketStats[0] || { 
        totalTickets: 0, openTickets: 0, inProgressTickets: 0, 
        resolvedTickets: 0, closedTickets: 0, highPriorityTickets: 0, 
        urgentTickets: 0, workflowTriggered: 0 
      },
      recentActivity,
      activityByDay,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Update user role (within same tenant)
router.put('/users/:userId/role', auditApiCall('admin_update_user_role'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['User', 'Admin'].includes(role)) {
      return res.status(400).json({ error: 'Valid role (User or Admin) is required' });
    }

    // Find user in same tenant
    const user = await User.findOne({ 
      _id: userId, 
      customerId: req.user.customerId 
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found in your tenant' });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    // Log the role change
    await AuditLog.logAction({
      action: 'user_role_updated',
      userId: req.user.id,
      customerId: req.user.customerId,
      resourceType: 'user',
      resourceId: user._id.toString(),
      details: {
        targetUser: user.email,
        previousRole,
        newRole: role
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        customerId: user.customerId
      },
      previousRole
    });

  } catch (error) {
    console.error('Admin update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

module.exports = router;