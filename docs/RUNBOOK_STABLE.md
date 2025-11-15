# GhostQuant Stable Operations Runbook

## Overview
This runbook provides operational procedures for running, monitoring, and maintaining the GhostQuant platform in production.

## Quick Start

### Local Development
```bash
# Clone repository
git clone https://github.com/aldric144/ghostquant-crypto.git
cd ghostquant-crypto

# Copy environment template
cp .env.example .env
# Edit .env with your values

# Start all services
docker compose up -d

# Check service health
docker compose ps
```

### Production Deployment (DigitalOcean Droplet)
```bash
# SSH to droplet
ssh root@159.89.178.196

# Navigate to project
cd /root/ghostquant-crypto

# Deploy latest changes
./deploy/deploy.sh
```

## Service URLs

### Production (DigitalOcean)
- **Web Dashboard**: http://159.89.178.196:3000
- **API**: http://159.89.178.196:8080
- **AlphaBrain**: http://159.89.178.196:8081
- **Ecoscan**: http://159.89.178.196:8082
- **Ingest WS Health**: http://159.89.178.196:8099

### Health Check Endpoints
- API: `http://159.89.178.196:8080/health`
- AlphaBrain: `http://159.89.178.196:8081/health`
- Ecoscan: `http://159.89.178.196:8082/health`
- Ingest WS: `http://159.89.178.196:8099/health`

## Docker Compose Commands

### Start Services
```bash
# Start all services
docker compose up -d

# Start specific service
docker compose up -d api

# Start with rebuild
docker compose up -d --build
```

### Stop Services
```bash
# Stop all services
docker compose down

# Stop and remove volumes (DESTRUCTIVE)
docker compose down -v
```

### View Logs
```bash
# View all logs
docker compose logs

# Follow logs for specific service
docker compose logs -f api

# View last 100 lines
docker compose logs --tail=100 web

# View logs with timestamps
docker compose logs -t alphabrain
```

### Check Service Status
```bash
# List all services with status
docker compose ps

# Check specific service
docker compose ps api

# View resource usage
docker stats
```

### Restart Services
```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart web

# Restart with rebuild
docker compose up -d --force-recreate --build web
```

## Service Architecture

### Critical Services (restart: always)
1. **postgres** - TimescaleDB database
2. **redis** - Cache and message queue
3. **api** - Main FastAPI backend (port 8080)
4. **web** - Next.js dashboard (port 3000)
5. **alphabrain** - Quant intelligence service (port 8081)
6. **ecoscan** - Ecosystem analysis service (port 8082)

### Supporting Services
- **ingest** - Historical data ingestion
- **ingest_ws** - Real-time WebSocket data streams (port 8099)
- **signals** - Signal generation engine
- **alerts** - Notification service
- **ingester** - CoinGecko data ingestion
- **backtest-worker** - Backtesting engine

## Troubleshooting

### Service Won't Start
```bash
# Check logs for errors
docker compose logs <service-name>

# Check if port is already in use
sudo netstat -tulpn | grep <port>

# Remove and recreate container
docker compose rm -f <service-name>
docker compose up -d <service-name>
```

### Database Connection Issues
```bash
# Check postgres is healthy
docker compose ps postgres

# Connect to database
docker exec -it ghostquant-db psql -U ghost -d ghostquant

# Check database logs
docker compose logs postgres
```

### Web Dashboard Not Loading
```bash
# Check web service logs
docker compose logs web

# Verify API is accessible from web container
docker exec ghostquant-web wget -O- http://api:8080/health

# Check environment variables
docker exec ghostquant-web env | grep NEXT_PUBLIC
```

### AlphaBrain or Ecoscan Errors
```bash
# Check service health
curl http://159.89.178.196:8081/health
curl http://159.89.178.196:8082/health

# Check service logs
docker compose logs alphabrain
docker compose logs ecoscan

# Restart services
docker compose restart alphabrain ecoscan
```

### High Memory Usage
```bash
# Check resource usage
docker stats

# Restart memory-intensive services
docker compose restart ingest_ws signals

# Clear Redis cache
docker exec ghostquant-redis redis-cli FLUSHDB
```

### Disk Space Issues
```bash
# Check disk usage
df -h

# Remove unused Docker resources
docker system prune -a

# Check log sizes
du -sh /var/lib/docker/containers/*

# Rotate logs (see Logging section)
```

## Backups

### Manual Backup
```bash
# Run backup script
/root/ghostquant-crypto/ops/backup-db.sh

# Backups are stored in /backups/
ls -lh /backups/
```

### Automated Backups
Backups run automatically via cron:
- **Hourly**: Critical short-term backups (last 24 hours)
- **Daily**: Long-term backups (retained for 30 days)

```bash
# View cron schedule
crontab -l

# Check backup logs
tail -f /var/log/ghostquant-backup.log
```

### Restore from Backup
```bash
# Stop services
docker compose down

# Restore Postgres
docker compose up -d postgres
docker exec -i ghostquant-db pg_restore -U ghost -d ghostquant -c < /backups/ghostquant-YYYY-MM-DD-HHMM.dump

# Restore Redis
docker cp /backups/redis-YYYY-MM-DD-HHMM.rdb ghostquant-redis:/data/dump.rdb
docker compose restart redis

# Start all services
docker compose up -d
```

## Monitoring

### Health Checks
The monitoring script runs every 5 minutes via cron:
```bash
# Manual health check
/root/ghostquant-crypto/ops/healthcheck.sh

# View monitoring logs
tail -f /var/log/ghostquant-health.log
```

### Key Metrics to Monitor
- Service health endpoints (all should return 200)
- Docker container status (all critical services should be "Up" and "healthy")
- Disk space (should be >20% free)
- Memory usage (should be <80%)
- Database connections (check for connection leaks)

## Deployment

### Deploy New Changes
```bash
# SSH to droplet
ssh root@159.89.178.196

# Run deploy script
cd /root/ghostquant-crypto
./deploy/deploy.sh

# Verify deployment
docker compose ps
curl http://159.89.178.196:8080/health
```

### Rollback
```bash
# View recent tags
git tag -l

# Checkout previous stable version
git checkout vstable-YYYYMMDD

# Rebuild and restart
docker compose down
docker compose up -d --build

# Verify rollback
docker compose ps
```

## Environment Variables

### Required Variables (.env)
```bash
# Database
POSTGRES_DB=ghostquant
POSTGRES_USER=ghost
POSTGRES_PASSWORD=<secure-password>

# Redis
REDIS_URL=redis://redis:6379/0

# API
API_PORT=8080

# Web (build-time variables)
NEXT_PUBLIC_API_BASE=http://159.89.178.196:8080
NEXT_PUBLIC_ALPHABRAIN_API=http://159.89.178.196:8081
NEXT_PUBLIC_ECOSCAN_API=http://159.89.178.196:8082
```

### Optional Variables
```bash
# CoinGecko API
COINGECKO_API_KEY=<your-key>

# Alerts
TELEGRAM_BOT_TOKEN=<token>
TELEGRAM_CHAT_ID=<chat-id>
SMTP_HOST=<smtp-server>
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<password>

# Feature Flags
USE_MOCK_DATA=true
USE_MOCK_MACRO_DATA=true
USE_MOCK_ECOSCAN_DATA=true
```

## Logging

### Log Locations
- **Docker logs**: `docker compose logs <service>`
- **Backup logs**: `/var/log/ghostquant-backup.log`
- **Health check logs**: `/var/log/ghostquant-health.log`

### Log Rotation
Docker logs are automatically rotated with these settings:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

## Security

### Best Practices
1. Keep `.env` file secure and never commit to git
2. Use strong passwords for database and services
3. Regularly update Docker images: `docker compose pull`
4. Monitor logs for suspicious activity
5. Keep backups in secure, off-host location

### Firewall Rules (UFW)
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow web traffic
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 8081/tcp
sudo ufw allow 8082/tcp

# Enable firewall
sudo ufw enable
```

## Maintenance

### Regular Tasks
- **Daily**: Check service health and logs
- **Weekly**: Review disk space and resource usage
- **Monthly**: Update Docker images and dependencies
- **Quarterly**: Review and test backup restoration

### Update Docker Images
```bash
# Pull latest images
docker compose pull

# Rebuild and restart
docker compose up -d --build

# Clean up old images
docker image prune -a
```

### Database Maintenance
```bash
# Connect to database
docker exec -it ghostquant-db psql -U ghost -d ghostquant

# Check database size
SELECT pg_size_pretty(pg_database_size('ghostquant'));

# Vacuum and analyze
VACUUM ANALYZE;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Support

### Getting Help
1. Check this runbook for common issues
2. Review service logs: `docker compose logs <service>`
3. Check GitHub issues: https://github.com/aldric144/ghostquant-crypto/issues
4. Contact: klove144@bellsouth.net

### Useful Commands Reference
```bash
# Quick health check all services
for port in 8080 8081 8082 8099; do echo "Port $port:"; curl -s http://localhost:$port/health | jq .; done

# Check all container statuses
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Follow all logs
docker compose logs -f

# Restart everything
docker compose restart

# Nuclear option (rebuild everything)
docker compose down && docker compose up -d --build
```
