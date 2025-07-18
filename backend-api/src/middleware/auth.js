const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user to ensure they still exist and get latest data
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user info to request
    req.user = {
      id: user._id,
      email: user.email,
      customerId: user.customerId,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    // Log unauthorized access attempt
    AuditLog.logAction({
      action: 'unauthorized_admin_access',
      userId: req.user.id,
      customerId: req.user.customerId,
      resourceType: 'admin_endpoint',
      details: { endpoint: req.path },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware to ensure tenant isolation
const ensureTenantIsolation = (req, res, next) => {
  // Add tenant filter to query parameters
  req.tenantFilter = { customerId: req.user.customerId };
  
  // For POST/PUT requests, ensure customerId is set correctly
  if (req.method === 'POST' || req.method === 'PUT') {
    if (req.body && typeof req.body === 'object') {
      req.body.customerId = req.user.customerId;
    }
  }
  
  next();
};

// Middleware to audit API calls
const auditApiCall = (action) => {
  return async (req, res, next) => {
    // Store original res.json to intercept responses
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log the action after successful response
      if (res.statusCode < 400) {
        AuditLog.logAction({
          action,
          userId: req.user?.id,
          customerId: req.user?.customerId,
          resourceType: req.route?.path?.split('/')[1] || 'unknown',
          resourceId: req.params?.id,
          details: {
            method: req.method,
            path: req.path,
            query: req.query,
            statusCode: res.statusCode
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
      
      // Call original json method
      originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  ensureTenantIsolation,
  auditApiCall
};