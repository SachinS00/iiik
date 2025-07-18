const express = require('express');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateToken } = require('../utils/jwt');
const { authenticateToken, auditApiCall } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', auditApiCall('user_register'), async (req, res) => {
  try {
    const { email, password, customerId, role = 'User' } = req.body;

    // Validate required fields
    if (!email || !password || !customerId) {
      return res.status(400).json({ 
        error: 'Email, password, and customerId are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({ email, password, customerId, role });
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Log successful registration
    await AuditLog.logAction({
      action: 'user_registered',
      userId: user._id,
      customerId: user.customerId,
      resourceType: 'user',
      resourceId: user._id.toString(),
      details: { email: user.email, role: user.role },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        customerId: user.customerId,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', auditApiCall('user_login'), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    // Log successful login
    await AuditLog.logAction({
      action: 'user_login',
      userId: user._id,
      customerId: user.customerId,
      resourceType: 'auth',
      details: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        customerId: user.customerId,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user info
router.get('/me', authenticateToken, auditApiCall('get_user_profile'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        customerId: user.customerId,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

module.exports = router;