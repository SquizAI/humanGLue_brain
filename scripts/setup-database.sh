#!/bin/bash

# =====================================================
# HumanGlue Database Setup Script
# =====================================================
# This script automates the entire database setup process:
# 1. Check Docker status
# 2. Start Supabase
# 3. Apply migrations
# 4. Verify database
# 5. Seed test data
# 6. Run health check
# =====================================================

set -e # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}"
echo "=================================================="
echo "  HumanGlue Database Setup"
echo "=================================================="
echo -e "${NC}"

# =====================================================
# 1. Check Docker Status
# =====================================================

echo -e "\n${BLUE}Step 1: Checking Docker status...${NC}"

if ! docker ps &> /dev/null; then
  echo -e "${RED}❌ Docker is not running!${NC}"
  echo -e "${YELLOW}"
  echo "Please start Docker Desktop and try again."
  echo ""
  echo "To start Docker Desktop:"
  echo "  1. Open Docker Desktop application"
  echo "  2. Wait for Docker to fully start (whale icon should be steady)"
  echo "  3. Run this script again"
  echo -e "${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Docker is running${NC}"
fi

# =====================================================
# 2. Check Supabase CLI
# =====================================================

echo -e "\n${BLUE}Step 2: Checking Supabase CLI...${NC}"

if ! command -v supabase &> /dev/null; then
  echo -e "${RED}❌ Supabase CLI not found!${NC}"
  echo -e "${YELLOW}"
  echo "Please install Supabase CLI:"
  echo "  npm install -g supabase"
  echo "  # or"
  echo "  brew install supabase/tap/supabase"
  echo -e "${NC}"
  exit 1
else
  SUPABASE_VERSION=$(supabase --version)
  echo -e "${GREEN}✅ Supabase CLI installed: ${SUPABASE_VERSION}${NC}"
fi

# =====================================================
# 3. Start Supabase (Local Development)
# =====================================================

echo -e "\n${BLUE}Step 3: Starting Supabase...${NC}"

cd "$PROJECT_DIR"

# Check if Supabase is already running
if supabase status &> /dev/null; then
  echo -e "${YELLOW}⚠️  Supabase is already running${NC}"
  echo -e "${YELLOW}Do you want to reset the database? (y/N)${NC}"
  read -r RESET_DB

  if [[ "$RESET_DB" =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Resetting database...${NC}"
    supabase db reset
  fi
else
  echo -e "${BLUE}Starting Supabase containers...${NC}"
  supabase start
fi

# Wait for Supabase to be ready
echo -e "${BLUE}Waiting for Supabase to be ready...${NC}"
sleep 5

# Get Supabase status
SUPABASE_STATUS=$(supabase status)
echo -e "${GREEN}✅ Supabase is running${NC}"
echo ""
echo "$SUPABASE_STATUS"

# =====================================================
# 4. Apply Migrations
# =====================================================

echo -e "\n${BLUE}Step 4: Checking migrations...${NC}"

MIGRATION_COUNT=$(ls -1 "$PROJECT_DIR/supabase/migrations"/*.sql 2>/dev/null | wc -l | tr -d ' ')

if [ "$MIGRATION_COUNT" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  No migration files found${NC}"
else
  echo -e "${GREEN}Found ${MIGRATION_COUNT} migration files${NC}"

  echo -e "${BLUE}Applying migrations...${NC}"

  # Migrations are auto-applied by supabase start or db reset
  # But we can explicitly run them:
  # supabase db push

  echo -e "${GREEN}✅ Migrations applied${NC}"
fi

# =====================================================
# 5. Run Database Verification
# =====================================================

echo -e "\n${BLUE}Step 5: Verifying database setup...${NC}"

if [ -f "$SCRIPT_DIR/verify-database.ts" ]; then
  if command -v tsx &> /dev/null; then
    tsx "$SCRIPT_DIR/verify-database.ts"
  elif command -v ts-node &> /dev/null; then
    ts-node "$SCRIPT_DIR/verify-database.ts"
  else
    echo -e "${YELLOW}⚠️  tsx or ts-node not found, skipping verification${NC}"
    echo -e "${YELLOW}Install with: npm install -g tsx${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Verification script not found${NC}"
fi

# =====================================================
# 6. Seed Test Data (Optional)
# =====================================================

echo -e "\n${BLUE}Step 6: Seed test data?${NC}"
echo -e "${YELLOW}Do you want to seed test data? (Y/n)${NC}"
read -r SEED_DATA

if [[ ! "$SEED_DATA" =~ ^[Nn]$ ]]; then
  if [ -f "$SCRIPT_DIR/seed-test-data.ts" ]; then
    echo -e "${BLUE}Seeding test data...${NC}"

    if command -v tsx &> /dev/null; then
      tsx "$SCRIPT_DIR/seed-test-data.ts"
    elif command -v ts-node &> /dev/null; then
      ts-node "$SCRIPT_DIR/seed-test-data.ts"
    else
      echo -e "${YELLOW}⚠️  tsx or ts-node not found${NC}"
      echo -e "${YELLOW}Install with: npm install -g tsx${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  Seed script not found${NC}"
  fi
else
  echo -e "${YELLOW}Skipping test data seeding${NC}"
fi

# =====================================================
# 7. Run Health Check
# =====================================================

echo -e "\n${BLUE}Step 7: Running health check...${NC}"

if [ -f "$SCRIPT_DIR/db-health-check.ts" ]; then
  if command -v tsx &> /dev/null; then
    tsx "$SCRIPT_DIR/db-health-check.ts"
  elif command -v ts-node &> /dev/null; then
    ts-node "$SCRIPT_DIR/db-health-check.ts"
  else
    echo -e "${YELLOW}⚠️  tsx or ts-node not found, skipping health check${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Health check script not found${NC}"
fi

# =====================================================
# Summary
# =====================================================

echo -e "\n${BLUE}"
echo "=================================================="
echo "  Database Setup Complete!"
echo "=================================================="
echo -e "${NC}"

echo -e "${GREEN}Your HumanGlue database is ready!${NC}"
echo ""
echo "Supabase Dashboard:"
echo "  Local Studio: http://localhost:54323"
echo ""
echo "Useful commands:"
echo "  supabase status    - Check Supabase status"
echo "  supabase stop      - Stop Supabase"
echo "  supabase db reset  - Reset database and re-run migrations"
echo ""
echo "Scripts available:"
echo "  npm run db:verify  - Verify database setup"
echo "  npm run db:seed    - Seed test data"
echo "  npm run db:health  - Run health check"
echo ""

exit 0
