const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');
const Ticket = require('../src/models/Ticket');

describe('Tenant Isolation', () => {
  let tenantAUser, tenantBUser, tenantAAdmin, tenantBAdmin;
  let tenantAToken, tenantBToken, tenantAAdminToken, tenantBAdminToken;
  let tenantATicket, tenantBTicket;

  // Setup test database
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/multitenantapp_test?authSource=admin';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Clear test data
    await User.deleteMany({});
    await Ticket.deleteMany({});
  });

  beforeEach(async () => {
    // Create test users for different tenants
    
    // Tenant A users
    tenantAUser = new User({
      email: 'user-a@tenant-a.com',
      password: 'password123',
      customerId: 'tenant-a',
      role: 'User'
    });
    await tenantAUser.save();

    tenantAAdmin = new User({
      email: 'admin-a@tenant-a.com',
      password: 'password123',
      customerId: 'tenant-a',
      role: 'Admin'
    });
    await tenantAAdmin.save();

    // Tenant B users
    tenantBUser = new User({
      email: 'user-b@tenant-b.com',
      password: 'password123',
      customerId: 'tenant-b',
      role: 'User'
    });
    await tenantBUser.save();

    tenantBAdmin = new User({
      email: 'admin-b@tenant-b.com',
      password: 'password123',
      customerId: 'tenant-b',
      role: 'Admin'
    });
    await tenantBAdmin.save();

    // Get auth tokens
    const loginA = await request(app)
      .post('/api/auth/login')
      .send({ email: tenantAUser.email, password: 'password123' });
    tenantAToken = loginA.body.token;

    const loginB = await request(app)
      .post('/api/auth/login')
      .send({ email: tenantBUser.email, password: 'password123' });
    tenantBToken = loginB.body.token;

    const loginAAdmin = await request(app)
      .post('/api/auth/login')
      .send({ email: tenantAAdmin.email, password: 'password123' });
    tenantAAdminToken = loginAAdmin.body.token;

    const loginBAdmin = await request(app)
      .post('/api/auth/login')
      .send({ email: tenantBAdmin.email, password: 'password123' });
    tenantBAdminToken = loginBAdmin.body.token;

    // Create test tickets for each tenant
    tenantATicket = new Ticket({
      title: 'Tenant A Ticket',
      description: 'This is a ticket from tenant A',
      customerId: 'tenant-a',
      userId: tenantAUser._id,
      priority: 'high'
    });
    await tenantATicket.save();

    tenantBTicket = new Ticket({
      title: 'Tenant B Ticket',
      description: 'This is a ticket from tenant B',
      customerId: 'tenant-b',
      userId: tenantBUser._id,
      priority: 'medium'
    });
    await tenantBTicket.save();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await User.deleteMany({});
    await Ticket.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Ticket Access Isolation', () => {
    test('Tenant A user cannot access Tenant B tickets', async () => {
      // Tenant A user tries to get all tickets - should only see their own
      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${tenantAToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tickets).toHaveLength(1);
      expect(response.body.tickets[0].customerId).toBe('tenant-a');
      expect(response.body.tickets[0].title).toBe('Tenant A Ticket');
    });

    test('Tenant B user cannot access Tenant A tickets', async () => {
      // Tenant B user tries to get all tickets - should only see their own
      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${tenantBToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tickets).toHaveLength(1);
      expect(response.body.tickets[0].customerId).toBe('tenant-b');
      expect(response.body.tickets[0].title).toBe('Tenant B Ticket');
    });

    test('Tenant A user cannot access specific Tenant B ticket by ID', async () => {
      const response = await request(app)
        .get(`/api/tickets/${tenantBTicket._id}`)
        .set('Authorization', `Bearer ${tenantAToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Ticket not found');
    });

    test('Tenant B user cannot access specific Tenant A ticket by ID', async () => {
      const response = await request(app)
        .get(`/api/tickets/${tenantATicket._id}`)
        .set('Authorization', `Bearer ${tenantBToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Ticket not found');
    });

    test('Tenant A user cannot update Tenant B ticket', async () => {
      const response = await request(app)
        .put(`/api/tickets/${tenantBTicket._id}`)
        .set('Authorization', `Bearer ${tenantAToken}`)
        .send({ title: 'Hacked ticket', status: 'closed' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Ticket not found');

      // Verify the original ticket is unchanged
      const originalTicket = await Ticket.findById(tenantBTicket._id);
      expect(originalTicket.title).toBe('Tenant B Ticket');
      expect(originalTicket.status).toBe('open');
    });
  });

  describe('Admin Access Isolation', () => {
    test('Tenant A admin cannot see Tenant B users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${tenantAAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(2); // Only tenant A users
      expect(response.body.users.every(user => user.customerId === 'tenant-a')).toBe(true);
    });

    test('Tenant B admin cannot see Tenant A tickets', async () => {
      const response = await request(app)
        .get('/api/admin/tickets')
        .set('Authorization', `Bearer ${tenantBAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tickets).toHaveLength(1); // Only tenant B tickets
      expect(response.body.tickets[0].customerId).toBe('tenant-b');
    });

    test('Admin cannot access audit logs from other tenants', async () => {
      const response = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${tenantAAdminToken}`);

      expect(response.status).toBe(200);
      // All returned logs should be from tenant A only
      if (response.body.logs.length > 0) {
        expect(response.body.logs.every(log => log.customerId === 'tenant-a')).toBe(true);
      }
    });
  });

  describe('Data Creation Isolation', () => {
    test('Created tickets automatically get correct tenant ID', async () => {
      const newTicketA = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${tenantAToken}`)
        .send({
          title: 'New Ticket A',
          description: 'This should belong to tenant A'
        });

      expect(newTicketA.status).toBe(201);
      expect(newTicketA.body.ticket.customerId).toBe('tenant-a');

      const newTicketB = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${tenantBToken}`)
        .send({
          title: 'New Ticket B',
          description: 'This should belong to tenant B'
        });

      expect(newTicketB.status).toBe(201);
      expect(newTicketB.body.ticket.customerId).toBe('tenant-b');

      // Verify they can't see each other's tickets
      const tenantATickets = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${tenantAToken}`);

      const tenantBTickets = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${tenantBToken}`);

      expect(tenantATickets.body.tickets).toHaveLength(2); // Original + new
      expect(tenantBTickets.body.tickets).toHaveLength(2); // Original + new
      
      expect(tenantATickets.body.tickets.every(t => t.customerId === 'tenant-a')).toBe(true);
      expect(tenantBTickets.body.tickets.every(t => t.customerId === 'tenant-b')).toBe(true);
    });

    test('Users cannot override customerId in requests', async () => {
      // Try to create a ticket with wrong customerId
      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${tenantAToken}`)
        .send({
          title: 'Malicious Ticket',
          description: 'Trying to create for different tenant',
          customerId: 'tenant-b' // This should be ignored and overridden
        });

      expect(response.status).toBe(201);
      expect(response.body.ticket.customerId).toBe('tenant-a'); // Should be forced to correct tenant
    });
  });

  describe('Screen Registry Isolation', () => {
    test('Users only see screens configured for their tenant', async () => {
      const tenantAScreens = await request(app)
        .get('/api/me/screens')
        .set('Authorization', `Bearer ${tenantAToken}`);

      const tenantBScreens = await request(app)
        .get('/api/me/screens')
        .set('Authorization', `Bearer ${tenantBToken}`);

      expect(tenantAScreens.status).toBe(200);
      expect(tenantBScreens.status).toBe(200);

      expect(tenantAScreens.body.tenant).toBe('tenant-a');
      expect(tenantBScreens.body.tenant).toBe('tenant-b');

      // Both should have access to support tickets, but with different names
      expect(tenantAScreens.body.screens.some(s => s.name === 'Support Tickets')).toBe(true);
      expect(tenantBScreens.body.screens.some(s => s.name === 'Help Desk')).toBe(true);
    });

    test('Admin users see admin screens, regular users do not', async () => {
      const adminScreens = await request(app)
        .get('/api/me/screens')
        .set('Authorization', `Bearer ${tenantAAdminToken}`);

      const userScreens = await request(app)
        .get('/api/me/screens')
        .set('Authorization', `Bearer ${tenantAToken}`);

      expect(adminScreens.status).toBe(200);
      expect(userScreens.status).toBe(200);

      const adminHasAdminDashboard = adminScreens.body.screens.some(s => s.id === 'admin-dashboard');
      const userHasAdminDashboard = userScreens.body.screens.some(s => s.id === 'admin-dashboard');

      expect(adminHasAdminDashboard).toBe(true);
      expect(userHasAdminDashboard).toBe(false);
    });
  });

  describe('Database Query Verification', () => {
    test('Direct database queries show proper tenant separation', async () => {
      // Query database directly to verify isolation
      const tenantATickets = await Ticket.find({ customerId: 'tenant-a' });
      const tenantBTickets = await Ticket.find({ customerId: 'tenant-b' });

      expect(tenantATickets).toHaveLength(1);
      expect(tenantBTickets).toHaveLength(1);

      expect(tenantATickets[0].customerId).toBe('tenant-a');
      expect(tenantBTickets[0].customerId).toBe('tenant-b');

      // Verify that a cross-tenant query returns nothing
      const crossTenantQuery = await Ticket.find({ 
        customerId: 'tenant-a', 
        _id: tenantBTicket._id 
      });
      expect(crossTenantQuery).toHaveLength(0);
    });

    test('User model queries respect tenant boundaries', async () => {
      const tenantAUsers = await User.findByTenant('tenant-a');
      const tenantBUsers = await User.findByTenant('tenant-b');

      expect(tenantAUsers).toHaveLength(2);
      expect(tenantBUsers).toHaveLength(2);

      expect(tenantAUsers.every(user => user.customerId === 'tenant-a')).toBe(true);
      expect(tenantBUsers.every(user => user.customerId === 'tenant-b')).toBe(true);
    });
  });
});