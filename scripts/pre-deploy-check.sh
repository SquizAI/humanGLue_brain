#!/bin/bash

# ============================================================================
# HumanGlue Platform - Pre-Deployment Validation Script
# ============================================================================
# This script runs comprehensive checks before deploying to production
#
# Usage:
#   ./scripts/pre-deploy-check.sh
#
# Exit codes:
#   0 - All checks passed
#   1 - One or more checks failed
# ============================================================================

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
    echo ""
}

print_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((WARNINGS++))
}

# ============================================================================
# Validation Functions
# ============================================================================

check_node_version() {
    print_step "Checking Node.js version..."

    REQUIRED_NODE_VERSION=20
    CURRENT_NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

    if [ "$CURRENT_NODE_VERSION" -ge "$REQUIRED_NODE_VERSION" ]; then
        print_success "Node.js version: v$(node -v | cut -d'v' -f2)"
    else
        print_error "Node.js version v$CURRENT_NODE_VERSION is below required v$REQUIRED_NODE_VERSION"
        return 1
    fi
}

check_dependencies() {
    print_step "Checking dependencies are installed..."

    if [ ! -d "node_modules" ]; then
        print_error "node_modules not found. Run 'npm install'"
        return 1
    fi

    # Check for critical dependencies
    CRITICAL_DEPS=("next" "@supabase/supabase-js" "stripe")

    for dep in "${CRITICAL_DEPS[@]}"; do
        if [ ! -d "node_modules/$dep" ]; then
            print_error "Critical dependency missing: $dep"
            return 1
        fi
    done

    print_success "All dependencies are installed"
}

check_typescript() {
    print_step "Running TypeScript type checking..."

    if npm run type-check > /dev/null 2>&1; then
        print_success "TypeScript: No type errors"
    else
        print_error "TypeScript type checking failed"
        npm run type-check
        return 1
    fi
}

check_linting() {
    print_step "Running ESLint..."

    if npm run lint > /dev/null 2>&1; then
        print_success "ESLint: No linting errors"
    else
        print_error "ESLint failed"
        npm run lint
        return 1
    fi
}

check_tests() {
    print_step "Running unit tests..."

    if npm run test:unit > /dev/null 2>&1; then
        print_success "Unit tests: All tests passed"
    else
        print_error "Unit tests failed"
        npm run test:unit
        return 1
    fi
}

check_build() {
    print_step "Running production build..."

    # Clean previous build
    rm -rf .next

    if npm run build > /dev/null 2>&1; then
        print_success "Production build: Successful"
    else
        print_error "Production build failed"
        npm run build
        return 1
    fi
}

check_env_variables() {
    print_step "Checking environment variables..."

    if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
        print_warning "No .env.local or .env file found (OK if using Netlify env vars)"
    else
        print_success "Environment file found"
    fi

    # Check for .env.example
    if [ ! -f ".env.example" ]; then
        print_warning ".env.example file missing"
    fi
}

check_security() {
    print_step "Running security audit..."

    # Run npm audit with appropriate level
    AUDIT_OUTPUT=$(npm audit --production --audit-level=moderate 2>&1)
    AUDIT_EXIT_CODE=$?

    if [ $AUDIT_EXIT_CODE -eq 0 ]; then
        print_success "Security audit: No vulnerabilities found"
    else
        # Count vulnerabilities
        CRITICAL=$(echo "$AUDIT_OUTPUT" | grep -o "critical" | wc -l || echo "0")
        HIGH=$(echo "$AUDIT_OUTPUT" | grep -o "high" | wc -l || echo "0")
        MODERATE=$(echo "$AUDIT_OUTPUT" | grep -o "moderate" | wc -l || echo "0")

        if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
            print_error "Security audit: Found $CRITICAL critical, $HIGH high vulnerabilities"
            echo "$AUDIT_OUTPUT"
            return 1
        else
            print_warning "Security audit: Found $MODERATE moderate vulnerabilities (review recommended)"
        fi
    fi
}

check_git_status() {
    print_step "Checking Git status..."

    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_warning "Not a git repository"
        return 0
    fi

    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Uncommitted changes detected"
        git status --short
    else
        print_success "Git: Working directory clean"
    fi

    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current)
    print_success "Current branch: $CURRENT_BRANCH"
}

check_file_sizes() {
    print_step "Checking build output sizes..."

    if [ -d ".next" ]; then
        # Check total .next size
        NEXT_SIZE=$(du -sh .next | cut -f1)
        print_success "Build size: $NEXT_SIZE"

        # Check for large files (>1MB)
        LARGE_FILES=$(find .next -type f -size +1M 2>/dev/null || true)
        if [ -n "$LARGE_FILES" ]; then
            print_warning "Found large files in build:"
            echo "$LARGE_FILES" | while read -r file; do
                SIZE=$(du -h "$file" | cut -f1)
                echo "  - $file ($SIZE)"
            done
        fi
    else
        print_warning ".next directory not found (build not run yet)"
    fi
}

check_critical_files() {
    print_step "Checking critical files exist..."

    CRITICAL_FILES=(
        "package.json"
        "next.config.js"
        "netlify.toml"
        "app/layout.tsx"
        ".gitignore"
    )

    for file in "${CRITICAL_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Critical file missing: $file"
            return 1
        fi
    done

    print_success "All critical files present"
}

check_api_routes() {
    print_step "Checking API routes..."

    if [ -d "app/api" ]; then
        API_COUNT=$(find app/api -name "route.ts" -o -name "route.js" | wc -l)
        print_success "Found $API_COUNT API routes"
    elif [ -d "netlify/functions" ]; then
        FUNC_COUNT=$(find netlify/functions -name "*.ts" -o -name "*.js" | wc -l)
        print_success "Found $FUNC_COUNT Netlify functions"
    else
        print_warning "No API routes or functions found"
    fi
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    print_header "HumanGlue Platform - Pre-Deployment Checks"

    START_TIME=$(date +%s)

    # Run all checks (continue even if some fail)
    check_node_version || true
    check_critical_files || true
    check_dependencies || true
    check_env_variables || true
    check_git_status || true
    check_typescript || true
    check_linting || true
    check_tests || true
    check_security || true
    check_api_routes || true
    check_build || true
    check_file_sizes || true

    # Calculate duration
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))

    # Print summary
    print_header "Deployment Readiness Summary"

    echo -e "${GREEN}Passed:   $PASSED${NC}"
    echo -e "${RED}Failed:   $FAILED${NC}"
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
    echo ""
    echo "Duration: ${DURATION}s"
    echo ""

    # Final verdict
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}============================================================================${NC}"
        echo -e "${GREEN}✓ ALL CHECKS PASSED - READY FOR DEPLOYMENT${NC}"
        echo -e "${GREEN}============================================================================${NC}"

        if [ $WARNINGS -gt 0 ]; then
            echo ""
            echo -e "${YELLOW}Note: $WARNINGS warning(s) detected. Review recommended but not blocking.${NC}"
        fi

        exit 0
    else
        echo -e "${RED}============================================================================${NC}"
        echo -e "${RED}✗ DEPLOYMENT BLOCKED - $FAILED CHECK(S) FAILED${NC}"
        echo -e "${RED}============================================================================${NC}"
        echo ""
        echo "Please fix the errors above before deploying."
        exit 1
    fi
}

# Run main function
main
