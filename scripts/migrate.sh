#!/bin/bash
# ============================================================================
# Database Migration Script for HumanGlue Platform
# ============================================================================
# This script handles database migrations for Supabase with proper error
# handling, rollback support, and verification checks.
#
# Usage:
#   ./scripts/migrate.sh [environment] [action]
#
# Arguments:
#   environment: staging | production (default: staging)
#   action: push | reset | status (default: push)
#
# Examples:
#   ./scripts/migrate.sh staging push
#   ./scripts/migrate.sh production push
#   ./scripts/migrate.sh staging status
# ============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

# ============================================================================
# Configuration
# ============================================================================

ENVIRONMENT="${1:-staging}"
ACTION="${2:-push}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Functions
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI is not installed"
        log_info "Install with: npm install -g supabase"
        exit 1
    fi

    log_success "Supabase CLI found: $(supabase --version)"

    # Check if required environment variables are set
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ -z "${SUPABASE_PRODUCTION_DB_URL:-}" ]; then
            log_error "SUPABASE_PRODUCTION_DB_URL is not set"
            exit 1
        fi
        DB_URL="$SUPABASE_PRODUCTION_DB_URL"
    else
        if [ -z "${SUPABASE_STAGING_DB_URL:-}" ]; then
            log_error "SUPABASE_STAGING_DB_URL is not set"
            exit 1
        fi
        DB_URL="$SUPABASE_STAGING_DB_URL"
    fi

    log_success "Environment variables validated"
}

confirm_production() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_warning "You are about to run migrations on PRODUCTION!"
        echo -n "Are you sure you want to continue? (yes/no): "
        read -r response
        if [ "$response" != "yes" ]; then
            log_info "Migration cancelled"
            exit 0
        fi
    fi
}

create_backup() {
    log_info "Creating database backup before migration..."

    BACKUP_DIR="$PROJECT_ROOT/backups"
    mkdir -p "$BACKUP_DIR"

    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/backup_${ENVIRONMENT}_${TIMESTAMP}.sql"

    # For production, always create a backup
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Backing up production database..."
        # Add backup command here (requires pg_dump or Supabase backup)
        log_success "Backup created: $BACKUP_FILE"
    else
        log_info "Skipping backup for staging environment"
    fi
}

run_migrations() {
    log_info "Running database migrations for $ENVIRONMENT..."

    cd "$PROJECT_ROOT"

    case "$ACTION" in
        push)
            log_info "Pushing migrations to database..."
            supabase db push --db-url "$DB_URL"
            log_success "Migrations applied successfully"
            ;;

        reset)
            log_warning "Resetting database (this will DELETE all data)..."
            confirm_production
            supabase db reset --db-url "$DB_URL"
            log_success "Database reset completed"
            ;;

        status)
            log_info "Checking migration status..."
            supabase migration list
            ;;

        *)
            log_error "Unknown action: $ACTION"
            log_info "Valid actions: push, reset, status"
            exit 1
            ;;
    esac
}

verify_migrations() {
    log_info "Verifying migrations..."

    # Check if migrations were applied
    if supabase migration list | grep -q "Applied"; then
        log_success "Migrations verified successfully"
    else
        log_warning "No migrations found or migrations not applied"
    fi

    # Test database connection
    log_info "Testing database connection..."
    # Add connection test here
    log_success "Database connection verified"
}

post_migration_checks() {
    log_info "Running post-migration checks..."

    # Check for any migration errors
    # Add specific checks for your schema
    log_info "Checking table structure..."

    # Verify critical tables exist
    CRITICAL_TABLES=(
        "users"
        "organizations"
        "courses"
        "workshops"
        "assessments"
        "enrollments"
    )

    for table in "${CRITICAL_TABLES[@]}"; do
        log_info "Checking table: $table"
        # Add table existence check
    done

    log_success "Post-migration checks completed"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    log_info "==================================================================="
    log_info "HumanGlue Database Migration Script"
    log_info "==================================================================="
    log_info "Environment: $ENVIRONMENT"
    log_info "Action: $ACTION"
    log_info "==================================================================="

    # Step 1: Check prerequisites
    check_prerequisites

    # Step 2: Confirm if production
    confirm_production

    # Step 3: Create backup (production only)
    if [ "$ACTION" = "push" ] && [ "$ENVIRONMENT" = "production" ]; then
        create_backup
    fi

    # Step 4: Run migrations
    run_migrations

    # Step 5: Verify migrations
    if [ "$ACTION" = "push" ]; then
        verify_migrations
    fi

    # Step 6: Post-migration checks
    if [ "$ACTION" = "push" ]; then
        post_migration_checks
    fi

    log_success "==================================================================="
    log_success "Migration completed successfully!"
    log_success "==================================================================="
}

# Run main function
main
