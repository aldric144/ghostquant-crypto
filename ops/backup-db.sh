#!/bin/bash
set -e


BACKUP_DIR="/backups"
TIMESTAMP=$(date +%F-%H%M)
POSTGRES_CONTAINER="ghostquant-db"
REDIS_CONTAINER="ghostquant-redis"
POSTGRES_USER="${POSTGRES_USER:-ghost}"
POSTGRES_DB="${POSTGRES_DB:-ghostquant}"
RETENTION_DAYS=30

LOG_FILE="/var/log/ghostquant-backup.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "Starting GhostQuant backup"
log "=========================================="

if [ ! -d "$BACKUP_DIR" ]; then
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
    log "ERROR: Postgres container is not running"
    exit 1
fi

if ! docker ps | grep -q "$REDIS_CONTAINER"; then
    log "ERROR: Redis container is not running"
    exit 1
fi

log "Backing up Postgres database..."
POSTGRES_BACKUP="$BACKUP_DIR/ghostquant-${TIMESTAMP}.dump"

if docker exec "$POSTGRES_CONTAINER" pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB" > "$POSTGRES_BACKUP"; then
    BACKUP_SIZE=$(du -h "$POSTGRES_BACKUP" | cut -f1)
    log "✓ Postgres backup completed: $POSTGRES_BACKUP ($BACKUP_SIZE)"
else
    log "✗ Postgres backup failed"
    exit 1
fi

log "Backing up Redis data..."
REDIS_BACKUP="$BACKUP_DIR/redis-${TIMESTAMP}.rdb"

docker exec "$REDIS_CONTAINER" redis-cli BGSAVE > /dev/null

sleep 5

if docker cp "$REDIS_CONTAINER:/data/dump.rdb" "$REDIS_BACKUP" 2>/dev/null; then
    BACKUP_SIZE=$(du -h "$REDIS_BACKUP" | cut -f1)
    log "✓ Redis backup completed: $REDIS_BACKUP ($BACKUP_SIZE)"
else
    log "⚠ Redis backup skipped (no data or already saved)"
fi

log "Cleaning up backups older than $RETENTION_DAYS days..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "ghostquant-*.dump" -mtime +$RETENTION_DAYS -delete -print | wc -l)
DELETED_COUNT=$((DELETED_COUNT + $(find "$BACKUP_DIR" -name "redis-*.rdb" -mtime +$RETENTION_DAYS -delete -print | wc -l)))

if [ "$DELETED_COUNT" -gt 0 ]; then
    log "✓ Deleted $DELETED_COUNT old backup(s)"
else
    log "✓ No old backups to delete"
fi

log "=========================================="
log "Backup Summary"
log "=========================================="
log "Backup directory: $BACKUP_DIR"
log "Total backups: $(ls -1 "$BACKUP_DIR" | wc -l)"
log "Disk usage: $(du -sh "$BACKUP_DIR" | cut -f1)"
log ""


log "Backup completed successfully"
log "=========================================="

exit 0
