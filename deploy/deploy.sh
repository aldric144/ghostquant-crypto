#!/bin/bash
set -e


echo "=========================================="
echo "GhostQuant Deployment Script"
echo "=========================================="
echo ""

if [ "$EUID" -ne 0 ]; then 
    echo "Warning: Not running as root. Some operations may require sudo."
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "Project directory: $PROJECT_DIR"
echo ""

if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please create .env file with required environment variables."
    echo "See .env.example for reference."
    exit 1
fi

echo "Step 1: Fetching latest changes from origin..."
git fetch origin

echo ""
echo "Step 2: Pulling latest changes from main branch..."
git pull origin main

echo ""
echo "Step 3: Pulling latest Docker images..."
docker compose pull

echo ""
echo "Step 4: Building Docker images..."
docker compose build --pull

echo ""
echo "Step 5: Stopping and removing old containers..."
docker compose down --remove-orphans

echo ""
echo "Step 6: Starting services..."
docker compose up -d --build

echo ""
echo "Step 7: Waiting for services to start (30 seconds)..."
sleep 30

echo ""
echo "Step 8: Checking service status..."
docker compose ps

echo ""
echo "Step 9: Running health checks..."
echo ""

check_health() {
    local service=$1
    local url=$2
    local max_attempts=10
    local attempt=1
    
    echo -n "Checking $service health... "
    
    while [ $attempt -le $max_attempts ]; do
        if curl -sf "$url" > /dev/null 2>&1; then
            echo "✓ OK"
            return 0
        fi
        sleep 3
        attempt=$((attempt + 1))
    done
    
    echo "✗ FAILED (after $max_attempts attempts)"
    return 1
}

HEALTH_FAILED=0

check_health "API" "http://localhost:8080/health" || HEALTH_FAILED=1
check_health "AlphaBrain" "http://localhost:8081/health" || HEALTH_FAILED=1
check_health "Ecoscan" "http://localhost:8082/health" || HEALTH_FAILED=1
check_health "Web" "http://localhost:3000" || HEALTH_FAILED=1

echo ""
if [ $HEALTH_FAILED -eq 0 ]; then
    echo "=========================================="
    echo "✓ Deployment completed successfully!"
    echo "=========================================="
    echo ""
    echo "Service URLs:"
    echo "  - Web Dashboard: http://$(hostname -I | awk '{print $1}'):3000"
    echo "  - API: http://$(hostname -I | awk '{print $1}'):8080"
    echo "  - AlphaBrain: http://$(hostname -I | awk '{print $1}'):8081"
    echo "  - Ecoscan: http://$(hostname -I | awk '{print $1}'):8082"
    echo ""
    echo "To view logs: docker compose logs -f"
    echo "To check status: docker compose ps"
    exit 0
else
    echo "=========================================="
    echo "⚠ Deployment completed with warnings"
    echo "=========================================="
    echo ""
    echo "Some health checks failed. Please review logs:"
    echo "  docker compose logs"
    echo ""
    echo "To restart a specific service:"
    echo "  docker compose restart <service-name>"
    exit 1
fi
