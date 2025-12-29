#!/bin/bash
# Deploy HumanGlue to Digital Ocean Kubernetes
# Usage: ./scripts/deploy-to-do.sh [command]
# Commands: setup, build, push, deploy, all

set -e

# Configuration
REGISTRY="registry.digitalocean.com/humanglue"
CLUSTER_NAME="humanglue-k8s"
REGION="nyc1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    command -v doctl >/dev/null 2>&1 || error "doctl is not installed. Run: brew install doctl"
    command -v docker >/dev/null 2>&1 || error "Docker is not installed"
    command -v kubectl >/dev/null 2>&1 || error "kubectl is not installed. Run: brew install kubectl"

    # Check if authenticated with DO
    doctl auth list >/dev/null 2>&1 || error "Not authenticated with Digital Ocean. Run: doctl auth init"

    log "All prerequisites met!"
}

# Setup Digital Ocean resources
setup_do() {
    log "Setting up Digital Ocean resources..."

    # Create container registry if it doesn't exist
    log "Creating container registry..."
    doctl registry create humanglue --region $REGION 2>/dev/null || warn "Registry already exists"

    # Login to registry
    log "Logging into container registry..."
    doctl registry login

    # Create Kubernetes cluster if it doesn't exist
    log "Creating Kubernetes cluster..."
    doctl kubernetes cluster create $CLUSTER_NAME \
        --region $REGION \
        --size s-2vcpu-4gb \
        --count 2 \
        --tag humanglue 2>/dev/null || warn "Cluster already exists"

    # Get cluster credentials
    log "Getting cluster credentials..."
    doctl kubernetes cluster kubeconfig save $CLUSTER_NAME

    # Install NGINX Ingress Controller
    log "Installing NGINX Ingress Controller..."
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/do/deploy.yaml 2>/dev/null || warn "Ingress controller may already be installed"

    # Install cert-manager for TLS
    log "Installing cert-manager..."
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml 2>/dev/null || warn "cert-manager may already be installed"

    log "Setup complete!"
}

# Build Docker images
build_images() {
    log "Building Docker images..."

    # Build main Next.js app
    log "Building Next.js app..."
    docker build -t $REGISTRY/web:latest -t $REGISTRY/web:$(git rev-parse --short HEAD) .

    # Build Discord bot
    log "Building Discord bot..."
    docker build -t $REGISTRY/discord-bot:latest -t $REGISTRY/discord-bot:$(git rev-parse --short HEAD) ./services/discord-bot

    log "Build complete!"
}

# Push images to registry
push_images() {
    log "Pushing images to Digital Ocean Container Registry..."

    # Login first
    doctl registry login

    # Push images
    docker push $REGISTRY/web:latest
    docker push $REGISTRY/web:$(git rev-parse --short HEAD)
    docker push $REGISTRY/discord-bot:latest
    docker push $REGISTRY/discord-bot:$(git rev-parse --short HEAD)

    log "Push complete!"
}

# Deploy to Kubernetes
deploy() {
    log "Deploying to Kubernetes..."

    # Apply kustomize
    kubectl apply -k k8s/overlays/production

    # Wait for rollout
    log "Waiting for deployments to roll out..."
    kubectl rollout status deployment/humanglue-web -n humanglue --timeout=300s
    kubectl rollout status deployment/discord-bot -n humanglue --timeout=300s

    # Show status
    log "Deployment status:"
    kubectl get pods -n humanglue
    kubectl get services -n humanglue
    kubectl get ingress -n humanglue

    log "Deployment complete!"
}

# Create secrets
create_secrets() {
    log "Creating Kubernetes secrets..."

    # Check for .env.production file
    if [ ! -f .env.production ]; then
        error ".env.production file not found. Create it with production values."
    fi

    # Source the env file
    set -a
    source .env.production
    set +a

    # Create web secrets
    kubectl create secret generic humanglue-web-secrets \
        --from-literal=SUPABASE_URL="$SUPABASE_URL" \
        --from-literal=SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
        --from-literal=SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
        --from-literal=ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
        --from-literal=OPENAI_API_KEY="$OPENAI_API_KEY" \
        --from-literal=RESEND_API_KEY="$RESEND_API_KEY" \
        --from-literal=TWILIO_ACCOUNT_SID="$TWILIO_ACCOUNT_SID" \
        --from-literal=TWILIO_AUTH_TOKEN="$TWILIO_AUTH_TOKEN" \
        --from-literal=TWILIO_PHONE_NUMBER="$TWILIO_PHONE_NUMBER" \
        -n humanglue --dry-run=client -o yaml | kubectl apply -f -

    # Create Discord bot secrets
    kubectl create secret generic discord-bot-secrets \
        --from-literal=DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" \
        --from-literal=DISCORD_APPLICATION_ID="$DISCORD_APPLICATION_ID" \
        --from-literal=DISCORD_CLIENT_ID="$DISCORD_CLIENT_ID" \
        --from-literal=ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
        --from-literal=NEO4J_URI="$NEO4J_URI" \
        --from-literal=NEO4J_PASSWORD="$NEO4J_PASSWORD" \
        -n humanglue --dry-run=client -o yaml | kubectl apply -f -

    log "Secrets created!"
}

# Main
case "${1:-all}" in
    setup)
        check_prerequisites
        setup_do
        ;;
    build)
        build_images
        ;;
    push)
        push_images
        ;;
    deploy)
        deploy
        ;;
    secrets)
        create_secrets
        ;;
    all)
        check_prerequisites
        build_images
        push_images
        deploy
        ;;
    *)
        echo "Usage: $0 {setup|build|push|deploy|secrets|all}"
        exit 1
        ;;
esac
