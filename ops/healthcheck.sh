#!/bin/bash


LOG_FILE="/var/log/ghostquant-health.log"
ALERT_EMAIL="${ALERT_EMAIL:-}"
ALERT_WEBHOOK="${ALERT_WEBHOOK:-}"

declare -A SERVICES=(
    ["API"]="http://localhost:8080/health"
    ["AlphaBrain"]="http://localhost:8081/health"
    ["Ecoscan"]="http://localhost:8082/health"
    ["Web"]="http://localhost:3000"
)

declare -A CONTAINERS=(
    ["API"]="ghostquant-api"
    ["AlphaBrain"]="ghostquant-alphabrain"
    ["Ecoscan"]="ghostquant-ecoscan"
    ["Web"]="ghostquant-web"
)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

send_alert() {
    local message="$1"
    
    if [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "GhostQuant Alert" "$ALERT_EMAIL" 2>/dev/null || true
    fi
    
    if [ -n "$ALERT_WEBHOOK" ]; then
        curl -X POST "$ALERT_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"$message\"}" \
            2>/dev/null || true
    fi
}

check_service() {
    local name="$1"
    local url="$2"
    local timeout=5
    
    if curl -sf --max-time "$timeout" "$url" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

restart_container() {
    local name="$1"
    local container="${CONTAINERS[$name]}"
    
    log "Attempting to restart $name container: $container"
    
    if docker restart "$container" > /dev/null 2>&1; then
        log "✓ Successfully restarted $name"
        send_alert "GhostQuant: $name service was down and has been restarted"
        
        sleep 10
        
        if check_service "$name" "${SERVICES[$name]}"; then
            log "✓ $name is now healthy after restart"
            return 0
        else
            log "✗ $name is still unhealthy after restart"
            send_alert "GhostQuant: $name service failed to recover after restart"
            return 1
        fi
    else
        log "✗ Failed to restart $name"
        send_alert "GhostQuant: Failed to restart $name service"
        return 1
    fi
}

log "=========================================="
log "Starting health check"
log "=========================================="

FAILED_SERVICES=()
RESTARTED_SERVICES=()

for service in "${!SERVICES[@]}"; do
    url="${SERVICES[$service]}"
    
    log "Checking $service: $url"
    
    if check_service "$service" "$url"; then
        log "✓ $service is healthy"
    else
        log "✗ $service is unhealthy"
        FAILED_SERVICES+=("$service")
        
        if restart_container "$service"; then
            RESTARTED_SERVICES+=("$service")
        fi
    fi
done

log ""
log "Checking Docker container status..."
UNHEALTHY_CONTAINERS=$(docker ps --filter "health=unhealthy" --format "{{.Names}}" 2>/dev/null)

if [ -n "$UNHEALTHY_CONTAINERS" ]; then
    log "⚠ Unhealthy containers detected:"
    echo "$UNHEALTHY_CONTAINERS" | while read -r container; do
        log "  - $container"
    done
else
    log "✓ All containers are healthy"
fi

log ""
log "=========================================="
log "Health Check Summary"
log "=========================================="

if [ ${#FAILED_SERVICES[@]} -eq 0 ]; then
    log "✓ All services are healthy"
    exit 0
else
    log "⚠ ${#FAILED_SERVICES[@]} service(s) had issues:"
    for service in "${FAILED_SERVICES[@]}"; do
        log "  - $service"
    done
    
    if [ ${#RESTARTED_SERVICES[@]} -gt 0 ]; then
        log ""
        log "Restarted services:"
        for service in "${RESTARTED_SERVICES[@]}"; do
            log "  - $service"
        done
    fi
    
    exit 1
fi
