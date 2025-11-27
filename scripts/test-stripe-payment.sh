#!/bin/bash

# Stripe Payment Testing Script for HumanGlue Platform
# This script helps test the Stripe payment flow locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== HumanGlue Stripe Payment Testing ===${NC}\n"

# Check if required environment variables are set
if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo -e "${RED}Error: STRIPE_SECRET_KEY not set${NC}"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}Error: NEXT_PUBLIC_SUPABASE_URL not set${NC}"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}Error: SUPABASE_SERVICE_ROLE_KEY not set${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment variables validated${NC}\n"

# Function to test webhook endpoint
test_webhook_endpoint() {
    echo -e "${YELLOW}Testing webhook endpoint...${NC}"

    # Check if Stripe CLI is installed
    if ! command -v stripe &> /dev/null; then
        echo -e "${RED}Stripe CLI not installed. Install with: brew install stripe/stripe-cli/stripe${NC}"
        return 1
    fi

    echo -e "${GREEN}Stripe CLI installed${NC}"
    echo -e "\nTo test webhooks locally, run in a separate terminal:"
    echo -e "${YELLOW}stripe listen --forward-to http://localhost:8888/.netlify/functions/stripe-webhook${NC}\n"
}

# Function to check database tables
check_database_tables() {
    echo -e "${YELLOW}Checking database tables...${NC}"

    # This would require psql or Supabase CLI
    echo -e "Required tables:"
    echo "  - payments"
    echo "  - workshop_registrations"
    echo "  - workshops"
    echo "  - users"
    echo ""
    echo -e "${GREEN}✓ Run the migration: supabase db push${NC}\n"
}

# Function to display test cards
display_test_cards() {
    echo -e "${YELLOW}Stripe Test Cards:${NC}"
    echo ""
    echo "Success:"
    echo "  Card: 4242 4242 4242 4242"
    echo "  Any future expiry, any CVC, any ZIP"
    echo ""
    echo "Payment Declined:"
    echo "  Card: 4000 0000 0000 0002"
    echo ""
    echo "Insufficient Funds:"
    echo "  Card: 4000 0000 0000 9995"
    echo ""
    echo "Authentication Required (3D Secure):"
    echo "  Card: 4000 0025 0000 3155"
    echo ""
    echo "Processing Error:"
    echo "  Card: 4000 0000 0000 0119"
    echo ""
}

# Function to show curl examples
show_curl_examples() {
    echo -e "${YELLOW}API Testing Examples:${NC}\n"

    echo "1. Create Payment Intent:"
    echo -e "${GREEN}curl -X POST http://localhost:8888/.netlify/functions/create-payment-intent \\${NC}"
    echo -e "${GREEN}  -H 'Content-Type: application/json' \\${NC}"
    echo -e "${GREEN}  -H 'Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN' \\${NC}"
    echo -e "${GREEN}  -d '{\"workshopId\": \"YOUR_WORKSHOP_UUID\"}'${NC}"
    echo ""

    echo "2. Process Payment (after Stripe confirmation):"
    echo -e "${GREEN}curl -X POST http://localhost:8888/.netlify/functions/process-payment \\${NC}"
    echo -e "${GREEN}  -H 'Content-Type: application/json' \\${NC}"
    echo -e "${GREEN}  -H 'Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN' \\${NC}"
    echo -e "${GREEN}  -d '{\"paymentIntentId\": \"pi_xxx\", \"workshopId\": \"YOUR_WORKSHOP_UUID\"}'${NC}"
    echo ""
}

# Function to check Netlify dev server
check_netlify_dev() {
    echo -e "${YELLOW}Checking Netlify Dev server...${NC}"

    if ! command -v netlify &> /dev/null; then
        echo -e "${RED}Netlify CLI not installed. Install with: npm install -g netlify-cli${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ Netlify CLI installed${NC}"
    echo -e "\nStart development server with:"
    echo -e "${YELLOW}netlify dev${NC}\n"
}

# Main menu
echo "Select test to run:"
echo "1. Display test cards"
echo "2. Show API testing examples"
echo "3. Check webhook setup"
echo "4. Check database tables"
echo "5. Check Netlify dev server"
echo "6. All checks"
echo ""

read -p "Enter choice (1-6): " choice

case $choice in
    1)
        display_test_cards
        ;;
    2)
        show_curl_examples
        ;;
    3)
        test_webhook_endpoint
        ;;
    4)
        check_database_tables
        ;;
    5)
        check_netlify_dev
        ;;
    6)
        display_test_cards
        echo ""
        show_curl_examples
        echo ""
        test_webhook_endpoint
        echo ""
        check_database_tables
        echo ""
        check_netlify_dev
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}=== Testing Guide Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Ensure Netlify dev is running: netlify dev"
echo "2. Start Stripe webhook forwarding in another terminal"
echo "3. Create a test workshop in your database"
echo "4. Use the API examples above to test payments"
echo "5. Monitor logs in Netlify function logs and Stripe dashboard"
echo ""
