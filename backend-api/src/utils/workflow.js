const axios = require('axios');

// Trigger n8n workflow when ticket is created
const triggerTicketWorkflow = async (ticketData) => {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn('N8N_WEBHOOK_URL not configured');
      return null;
    }

    const payload = {
      ticketId: ticketData._id,
      customerId: ticketData.customerId,
      title: ticketData.title,
      description: ticketData.description,
      priority: ticketData.priority,
      userId: ticketData.userId,
      createdAt: ticketData.createdAt,
      // Add callback URL for n8n to ping back
      callbackUrl: `${process.env.API_BASE_URL || 'http://backend-api:3001'}/webhook/ticket-done`,
      secret: process.env.N8N_WEBHOOK_SECRET
    };

    console.log('Triggering n8n workflow:', { ticketId: ticketData._id, customerId: ticketData.customerId });
    
    const response = await axios.post(webhookUrl, payload, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Multitenant-App/1.0'
      }
    });

    console.log('n8n workflow triggered successfully:', response.status);
    return response.data;

  } catch (error) {
    console.error('Failed to trigger n8n workflow:', error.message);
    // Don't fail the ticket creation if workflow fails
    return null;
  }
};

// Verify webhook secret from n8n
const verifyWebhookSecret = (requestSecret) => {
  const expectedSecret = process.env.N8N_WEBHOOK_SECRET;
  
  if (!expectedSecret) {
    console.warn('N8N_WEBHOOK_SECRET not configured');
    return false;
  }

  return requestSecret === expectedSecret;
};

module.exports = {
  triggerTicketWorkflow,
  verifyWebhookSecret
};