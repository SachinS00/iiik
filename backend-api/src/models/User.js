const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  customerId: {
    type: String,
    required: true,
    index: true // Ensure efficient tenant queries
  },
  role: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Static method to find by tenant
userSchema.statics.findByTenant = function(customerId, filter = {}) {
  return this.find({ customerId, ...filter });
};

module.exports = mongoose.model('User', userSchema);