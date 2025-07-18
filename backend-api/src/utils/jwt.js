const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    customerId: user.customerId,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'multitenant-app'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id,
    customerId: user.customerId,
    type: 'refresh'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'multitenant-app'
  });
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken
};