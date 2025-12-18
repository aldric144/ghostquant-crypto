# GhostQuant-Crypto Backup Instructions

## Quick Backup (5 minutes)

### 1. Database Backup

```bash
# SSH to production
ssh root@159.89.178.196

# Create database backup
cd /root/ghostquant-crypto
docker compose exec postgres pg_dump -U ghost ghostquant > backups/db_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backups/
```

### 2. Configuration Backup

```bash
# Backup environment file
cp .env backups/env_backup_$(date +%Y%m%d_%H%M%S)

# Backup docker-compose
cp docker-compose.yml backups/docker-compose_backup_$(date +%Y%m%d_%H%M%S).yml
```

### 3. Code Backup (Already on GitHub)

Your code is already safely stored on GitHub:
- **Repository**: https://github.com/aldric144/ghostquant-crypto
- **Branch**: main
- **Latest Commits**: All whale badge fixes (PRs #14-17)

## What's Already Saved

### ✅ Code (GitHub)
- All source code
- All recent fixes (PRs #14-17)
- Deployment guide
- Documentation

**Repository**: https://github.com/aldric144/ghostquant-crypto

### ✅ Docker Images
- Built images on production server
- Can be rebuilt from source

### ⚠️ Needs Regular Backup
- Database (time-series data)
- Environment configuration (.env)
- Custom settings

## Restore Instructions

### Restore Database

```bash
# SSH to production
ssh root@159.89.178.196

# Stop services
cd /root/ghostquant-crypto
docker compose down

# Restore database
docker compose up -d postgres
sleep 10
docker compose exec -T postgres psql -U ghost ghostquant < backups/db_backup_20251114.sql

# Start all services
docker compose up -d

# Verify
docker compose ps
curl http://localhost:8080/health
```

### Restore Configuration

```bash
# Restore .env
cp backups/env_backup_20251114 .env

# Restore docker-compose.yml
cp backups/docker-compose_backup_20251114.yml docker-compose.yml

# Restart services
docker compose down
docker compose up -d
```

## Disaster Recovery

### If Server is Lost

1. **Spin up new DigitalOcean droplet** (Ubuntu 22.04)

2. **Install Docker**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

3. **Clone repository**:
```bash
git clone https://github.com/aldric144/ghostquant-crypto.git
cd ghostquant-crypto
```

4. **Restore configuration**:
```bash
# Copy your backed up .env file
cp ~/backups/env_backup_20251114 .env
```

5. **Start services**:
```bash
docker compose up -d --build
```

6. **Restore database**:
```bash
# Restore
docker compose exec -T postgres psql -U ghost ghostquant < ~/backups/db_backup_20251114.sql
```

## Emergency Contacts

**Repository Owner**: Al (klove144@bellsouth.net) @aldric144  
**Devin Session**: https://app.devin.ai/sessions/19e85c587aa04b22b57881a0e0da15b6  
**Production Server**: 159.89.178.196

## Quick Reference

```bash
# Quick backup
docker compose exec postgres pg_dump -U ghost ghostquant > backup.sql

# Quick restore
docker compose exec -T postgres psql -U ghost ghostquant < backup.sql

# Check backup size
ls -lh backups/

# List all backups
ls -lt backups/
```
