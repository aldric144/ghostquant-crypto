# GhostQuant-Crypto Deployment Guide

## Current Production Deployment

**Production Server**: 159.89.178.196 (DigitalOcean Droplet)  
**Repository**: https://github.com/aldric144/ghostquant-crypto  
**Branch**: main  
**Owner**: Al (klove144@bellsouth.net) @aldric144

### Service URLs

- **Web Dashboard**: http://159.89.178.196:3000
- **API**: http://159.89.178.196:8080
- **API Health**: http://159.89.178.196:8080/health
- **API Docs**: http://159.89.178.196:8080/docs

### Services Running

All services are containerized with Docker Compose:

1. **PostgreSQL (TimescaleDB)** - Port 5432
2. **Redis** - Port 6379
3. **API (FastAPI)** - Port 8080
4. **Web (Next.js)** - Port 3000
5. **AlphaBrain** - Port 8081
6. **Ingest** - Background service
7. **Signals** - Background service
8. **Ecoscan** - Port 8082

## Recent Fixes (November 2025)

### Whale Badge Fix (PRs #14-17)

**Problem**: Whale badges were showing 404 errors and were not clickable.

**Solution**: 
1. Added asyncpg dependency for database connections (PR #14)
2. Fixed Redis cache JSON serialization (PR #15)
3. Replaced non-existent Whale icon with Fish icon (PR #16)
4. Fixed database query removing non-existent name column (PR #17)

**Result**: All whale badges now clickable with intelligent fallback:
- Covered assets (BTC, ETH, SOL): Full database explanations
- Non-covered assets: Market data lite explanations

## Quick Start

### Deploy from Scratch

```bash
# Clone repository
git clone https://github.com/aldric144/ghostquant-crypto.git
cd ghostquant-crypto

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start all services
docker compose up -d --build

# Check service health
docker compose ps
curl http://localhost:8080/health
```

### Update Production

```bash
# SSH to production server
ssh root@159.89.178.196

# Navigate to repo
cd /root/ghostquant-crypto

# Pull latest changes
git pull origin main

# Rebuild services (if code changed)
docker compose build --no-cache api web

# Restart services
docker compose up -d

# Verify health
docker compose ps
curl http://localhost:8080/health
```

## Monitoring

### Check Service Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f web

# Last 100 lines
docker compose logs --tail 100 api
```

### Check Service Health

```bash
# All services status
docker compose ps

# API health
curl http://localhost:8080/health

# Web accessibility
curl http://localhost:3000
```

## Backup & Recovery

### Quick Database Backup

```bash
# Create backup
docker compose exec postgres pg_dump -U ghost ghostquant > backup_$(date +%Y%m%d).sql

# Restore backup
docker compose exec -T postgres psql -U ghost ghostquant < backup_20251114.sql
```

### Configuration Backup

```bash
# Backup .env file
cp .env .env.backup_$(date +%Y%m%d)

# Backup docker-compose.yml
cp docker-compose.yml docker-compose.yml.backup_$(date +%Y%m%d)
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose logs service_name

# Rebuild without cache
docker compose build --no-cache service_name

# Restart
docker compose restart service_name
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker compose ps postgres

# Restart database
docker compose restart postgres
```

### API 500 Errors

```bash
# Check API logs
docker compose logs -f api

# Restart API
docker compose restart api
```

## Contact & Support

**Repository**: https://github.com/aldric144/ghostquant-crypto  
**Owner**: Al (klove144@bellsouth.net) @aldric144  
**Devin Session**: https://app.devin.ai/sessions/19e85c587aa04b22b57881a0e0da15b6

## Version History

### v1.0.0 (November 2025)
- Initial deployment
- All 8 services operational
- Whale badge fix implemented (PRs #14-17)
- AlphaBrain module integrated
