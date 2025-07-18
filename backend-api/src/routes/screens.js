const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken, auditApiCall } = require('../middleware/auth');

const router = express.Router();

// Load registry.json
const getRegistry = () => {
  try {
    const registryPath = path.join(__dirname, '../../registry.json');
    const registryData = fs.readFileSync(registryPath, 'utf8');
    return JSON.parse(registryData);
  } catch (error) {
    console.error('Failed to load registry.json:', error);
    return { tenants: {} };
  }
};

// Get screens for current user's tenant
router.get('/me/screens', authenticateToken, auditApiCall('get_user_screens'), async (req, res) => {
  try {
    const registry = getRegistry();
    const userCustomerId = req.user.customerId;
    const userRole = req.user.role;

    // Get tenant configuration
    const tenantConfig = registry.tenants[userCustomerId];
    
    if (!tenantConfig) {
      return res.json({
        tenant: userCustomerId,
        screens: [],
        message: 'No screens configured for this tenant'
      });
    }

    // Filter screens based on user role permissions
    const availableScreens = tenantConfig.screens.filter(screen => {
      // If no permissions specified, allow all roles
      if (!screen.permissions || screen.permissions.length === 0) {
        return true;
      }
      
      // Check if user role has permission for this screen
      return screen.permissions.includes(userRole);
    });

    // Transform screens for response
    const screens = availableScreens.map(screen => ({
      id: screen.id,
      name: screen.name,
      url: screen.url,
      moduleName: screen.moduleName,
      scope: screen.scope,
      permissions: screen.permissions
    }));

    res.json({
      tenant: userCustomerId,
      tenantName: tenantConfig.name,
      userRole: userRole,
      screens: screens,
      total: screens.length
    });

  } catch (error) {
    console.error('Get screens error:', error);
    res.status(500).json({ error: 'Failed to get screens' });
  }
});

// Get all available screens (admin only)
router.get('/admin/screens', authenticateToken, auditApiCall('get_all_screens'), async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const registry = getRegistry();
    
    res.json({
      registry: registry.tenants,
      requestedBy: {
        userId: req.user.id,
        customerId: req.user.customerId,
        role: req.user.role
      }
    });

  } catch (error) {
    console.error('Get all screens error:', error);
    res.status(500).json({ error: 'Failed to get all screens' });
  }
});

// Health check for registry
router.get('/registry/health', async (req, res) => {
  try {
    const registry = getRegistry();
    const tenantCount = Object.keys(registry.tenants).length;
    const totalScreens = Object.values(registry.tenants)
      .reduce((total, tenant) => total + tenant.screens.length, 0);

    res.json({
      status: 'healthy',
      tenantCount,
      totalScreens,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Registry health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: 'Failed to load registry',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;