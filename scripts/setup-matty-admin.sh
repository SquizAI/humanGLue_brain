#!/bin/bash

# Setup Matty as Super Admin
# This script applies the migration to set up matty@lhumanglue.ai with all roles

echo "🚀 Setting up matty@lhumanglue.ai as Super Admin..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/migrations/011_setup_matty_super_admin.sql" ]; then
    echo "❌ Migration file not found. Please run this script from the project root."
    exit 1
fi

# Apply the migration
echo "📝 Applying migration..."
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "📊 Matty's account setup:"
    echo "   Email: matty@lhumanglue.ai"
    echo "   Roles: admin, expert, instructor, client"
    echo "   Access: All portals and features"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Login as matty@lhumanglue.ai"
    echo "   2. You'll see the role switcher with all 4 portals"
    echo "   3. Switch between Admin, Expert, Instructor, and Student portals"
    echo "   4. Access real live data (not demo data)"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi
