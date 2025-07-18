#!/bin/bash

echo "🚀 Setting up Multi-Tenant Microfrontend Demo"
echo "=============================================="

# Wait for backend to be ready
echo "⏳ Waiting for backend API to be ready..."
until curl -f http://localhost:3001/health > /dev/null 2>&1; do
    echo "   Backend not ready yet, waiting..."
    sleep 2
done
echo "✅ Backend API is ready!"

# Create demo users
echo ""
echo "👥 Creating demo users..."

# Tenant A Admin
echo "   Creating Tenant A Admin..."
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tenant-a.com",
    "password": "password123",
    "customerId": "tenant-a",
    "role": "Admin"
  }' | jq '.'

# Tenant A User
echo "   Creating Tenant A User..."
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@tenant-a.com",
    "password": "password123",
    "customerId": "tenant-a",
    "role": "User"
  }' | jq '.'

# Tenant B Admin
echo "   Creating Tenant B Admin..."
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tenant-b.com",
    "password": "password123",
    "customerId": "tenant-b",
    "role": "Admin"
  }' | jq '.'

# Tenant B User
echo "   Creating Tenant B User..."
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@tenant-b.com",
    "password": "password123",
    "customerId": "tenant-b",
    "role": "User"
  }' | jq '.'

echo ""
echo "🎫 Creating sample tickets..."

# Login as Tenant A User and create tickets
echo "   Logging in as Tenant A user..."
TENANT_A_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@tenant-a.com",
    "password": "password123"
  }' | jq -r '.token')

if [ "$TENANT_A_TOKEN" != "null" ] && [ -n "$TENANT_A_TOKEN" ]; then
    echo "   Creating tickets for Tenant A..."
    
    curl -s -X POST http://localhost:3001/api/tickets \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TENANT_A_TOKEN" \
      -d '{
        "title": "Email not working",
        "description": "I cannot send emails from my account. Getting timeout errors.",
        "priority": "high"
      }' | jq '.'
      
    curl -s -X POST http://localhost:3001/api/tickets \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TENANT_A_TOKEN" \
      -d '{
        "title": "Password reset issue",
        "description": "Password reset link is not working. Need help accessing my account.",
        "priority": "urgent"
      }' | jq '.'
      
    curl -s -X POST http://localhost:3001/api/tickets \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TENANT_A_TOKEN" \
      -d '{
        "title": "Feature request: Dark mode",
        "description": "Would love to have a dark mode option in the application.",
        "priority": "low"
      }' | jq '.'
else
    echo "   ❌ Failed to get token for Tenant A user"
fi

# Login as Tenant B User and create tickets
echo "   Logging in as Tenant B user..."
TENANT_B_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@tenant-b.com",
    "password": "password123"
  }' | jq -r '.token')

if [ "$TENANT_B_TOKEN" != "null" ] && [ -n "$TENANT_B_TOKEN" ]; then
    echo "   Creating tickets for Tenant B..."
    
    curl -s -X POST http://localhost:3001/api/tickets \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TENANT_B_TOKEN" \
      -d '{
        "title": "Dashboard loading slowly",
        "description": "The main dashboard takes over 30 seconds to load. Performance issue.",
        "priority": "medium"
      }' | jq '.'
      
    curl -s -X POST http://localhost:3001/api/tickets \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TENANT_B_TOKEN" \
      -d '{
        "title": "Mobile app crash",
        "description": "Mobile app crashes when trying to upload files larger than 10MB.",
        "priority": "high"
      }' | jq '.'
else
    echo "   ❌ Failed to get token for Tenant B user"
fi

echo ""
echo "✅ Demo setup complete!"
echo ""
echo "📋 Demo Users Created:"
echo "   👑 admin@tenant-a.com / password123 (Tenant A Admin)"
echo "   👤 user@tenant-a.com / password123 (Tenant A User)"
echo "   👑 admin@tenant-b.com / password123 (Tenant B Admin)"
echo "   👤 user@tenant-b.com / password123 (Tenant B User)"
echo ""
echo "🌐 Access Points:"
echo "   Frontend Shell: http://localhost:3000"
echo "   Support Tickets: http://localhost:3002"
echo "   Backend API: http://localhost:3001"
echo "   n8n Workflows: http://localhost:5678 (admin/password)"
echo ""
echo "🧪 Test Tenant Isolation:"
echo "   cd backend-api && npm test"
echo ""
echo "Happy testing! 🚀"