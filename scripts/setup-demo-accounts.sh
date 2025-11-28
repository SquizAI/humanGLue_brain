#!/bin/bash

echo "🚀 Setting up demo accounts for HumanGlue..."
echo ""

# Create info@lvng.ai (instructor)
echo "1️⃣ Creating info@lvng.ai (instructor)..."
curl -X POST https://hmnglue.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "info@lvng.ai",
    "password": "Demo!2o25@Secure",
    "fullName": "LVNG Instructor Demo",
    "role": "instructor"
  }' | jq '.'

echo ""
echo ""

# Create matty@humanglue.ai (will be admin)
echo "2️⃣ Creating matty@humanglue.ai (admin)..."
curl -X POST https://hmnglue.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "matty@humanglue.ai",
    "password": "Admin!2o25@Secure",
    "fullName": "Matty Admin",
    "role": "client"
  }' | jq '.'

echo ""
echo ""
echo "✅ Done creating accounts!"
echo ""
echo "📧 Check these emails for confirmation links:"
echo "   - info@lvng.ai"
echo "   - matty@humanglue.ai"
echo ""
echo "🔑 Demo passwords:"
echo "   info@lvng.ai: Demo!2o25@Secure"
echo "   matty@humanglue.ai: Admin!2o25@Secure"
echo ""
echo "📝 Database updates needed:"
echo "   UPDATE users SET role = 'admin' WHERE email = 'matty@humanglue.ai';"
echo "   UPDATE users SET role = 'member' WHERE email = 'matty@lvng.ai';"
