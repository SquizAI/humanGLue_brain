#!/bin/bash

###############################################################################
# Secret Scanning Script
#
# Scans the codebase for exposed secrets, API keys, passwords, and sensitive data
# Use this before committing code or during security audits
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Counters
ISSUES_FOUND=0
FILES_SCANNED=0

echo "🔍 Secret Scanning Tool"
echo "======================="
echo ""

# Check if .gitignore exists and contains sensitive files
echo "📝 Checking .gitignore configuration..."
if [ ! -f .gitignore ]; then
  echo -e "${RED}❌ No .gitignore file found!${NC}"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  # Check for important patterns in .gitignore
  REQUIRED_PATTERNS=(".env" ".env.local" ".env.*.local" "*.key" "*.pem" "secrets/" "credentials")

  for pattern in "${REQUIRED_PATTERNS[@]}"; do
    if ! grep -q "$pattern" .gitignore; then
      echo -e "${YELLOW}⚠️  Pattern '$pattern' not found in .gitignore${NC}"
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
  done

  echo -e "${GREEN}✓ .gitignore check completed${NC}"
fi

echo ""

# Scan for hardcoded secrets
echo "🔐 Scanning for hardcoded secrets..."
echo ""

# Patterns to search for (regex)
declare -A SECRET_PATTERNS=(
  ["AWS Access Key"]="AKIA[0-9A-Z]{16}"
  ["AWS Secret Key"]="aws_secret_access_key.*['\"][0-9a-zA-Z/+]{40}['\"]"
  ["Private Key"]="-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----"
  ["Generic API Key"]="api[_-]?key['\"]?\s*[:=]\s*['\"][0-9a-zA-Z]{20,}['\"]"
  ["Generic Secret"]="secret['\"]?\s*[:=]\s*['\"][0-9a-zA-Z]{20,}['\"]"
  ["Password"]="password['\"]?\s*[:=]\s*['\"][^'\"]{8,}['\"]"
  ["Supabase Key"]="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\."
  ["GitHub Token"]="ghp_[0-9a-zA-Z]{36}"
  ["Stripe Key"]="sk_live_[0-9a-zA-Z]{24,}"
  ["Database Connection"]="postgres://|mysql://|mongodb://"
  ["JWT Secret"]="jwt[_-]?secret['\"]?\s*[:=]"
  ["Basic Auth"]="Authorization:\s*Basic\s+[A-Za-z0-9+/=]+"
)

# Files to exclude from scanning
EXCLUDE_PATTERNS=(
  "node_modules"
  ".next"
  ".git"
  "package-lock.json"
  "*.md"
  "*.log"
  ".env.example"
  "scripts/scan-secrets.sh"
)

# Build exclude arguments for grep
EXCLUDE_ARGS=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=$pattern --exclude-dir=$pattern"
done

# Scan for each pattern
for name in "${!SECRET_PATTERNS[@]}"; do
  pattern="${SECRET_PATTERNS[$name]}"

  echo "  Searching for: $name"

  # Use grep to search for pattern
  if result=$(grep -rEIn $EXCLUDE_ARGS "$pattern" . 2>/dev/null); then
    echo -e "${RED}  ❌ Found potential $name:${NC}"
    echo "$result" | while IFS= read -r line; do
      echo "     $line"
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
    done
    echo ""
  fi
done

echo -e "${GREEN}✓ Secret pattern scan completed${NC}"
echo ""

# Check for .env files in git
echo "🗂️  Checking for .env files in git..."
if git ls-files | grep -q "\.env$\|\.env\.local$"; then
  echo -e "${RED}❌ Found .env files tracked in git!${NC}"
  git ls-files | grep "\.env"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo -e "${GREEN}✓ No .env files tracked in git${NC}"
fi

echo ""

# Check for sensitive file extensions
echo "📄 Checking for sensitive file types..."
SENSITIVE_EXTENSIONS=("*.key" "*.pem" "*.p12" "*.pfx" "*.keystore" "*.jks" "credentials.json")

for ext in "${SENSITIVE_EXTENSIONS[@]}"; do
  if files=$(git ls-files | grep -i "$ext"); then
    echo -e "${RED}❌ Found sensitive files ($ext) in git:${NC}"
    echo "$files"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
done

echo -e "${GREEN}✓ Sensitive file check completed${NC}"
echo ""

# Check environment files for exposed secrets
echo "🔧 Checking .env.example for actual secrets..."
if [ -f .env.example ]; then
  # Check if .env.example contains real values (not placeholders)
  if grep -qE "=.{32,}" .env.example; then
    if ! grep -q "your-.*-here\|CHANGE_ME\|placeholder\|example" .env.example; then
      echo -e "${YELLOW}⚠️  .env.example may contain real values${NC}"
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
  fi
  echo -e "${GREEN}✓ .env.example check completed${NC}"
else
  echo -e "${YELLOW}⚠️  No .env.example file found${NC}"
fi

echo ""

# Summary
echo "======================================"
echo "📊 Scan Summary"
echo "======================================"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
  echo -e "${GREEN}✅ No security issues found!${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Found $ISSUES_FOUND potential security issue(s)${NC}"
  echo ""
  echo "Recommendations:"
  echo "  1. Remove any exposed secrets from code"
  echo "  2. Add sensitive patterns to .gitignore"
  echo "  3. Use environment variables for secrets"
  echo "  4. Rotate any exposed credentials"
  echo "  5. Use git filter-branch or BFG to remove secrets from git history"
  echo ""
  exit 1
fi
