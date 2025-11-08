# Alerts Service Runbook

## Overview

The Alerts service monitors signals and sends notifications via Telegram and Email when significant trading opportunities are detected.

## Architecture

```
┌─────────────────┐
│  TimescaleDB    │
│  (signals table)│
└────────┬────────┘
         │
┌────────▼────────┐
│  Alerts Engine  │
│  (60s cycle)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Telegram│ │ Email │
│Channel │ │Channel│
└────────┘ └───────┘
```

## Configuration

### Environment Variables

```bash
# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=ghostquant
POSTGRES_USER=ghost
POSTGRES_PASSWORD=ghostpass

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ALERTS_FROM_EMAIL=alerts@ghostquant.local
ALERTS_TO_EMAIL=your_email@gmail.com
```

### Alert Settings

Edit `alerts/src/alerts/engine.py`:

```python
# Throttle period (minutes between duplicate alerts)
self.throttle_minutes = 15

# Polling interval (seconds)
self.interval = 60

# Minimum confidence for alerts
if signal['confidence'] < 0.5:
    return False
```

## Setting Up Telegram

### Step 1: Create Bot

1. Open Telegram and search for @BotFather
2. Send `/newbot` command
3. Follow prompts to create your bot
4. Copy the bot token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Get Chat ID

1. Start a chat with your new bot
2. Send any message to the bot
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Find `"chat":{"id":123456789}` in the response
5. Copy the chat ID

### Step 3: Configure

Add to `.env`:

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

### Step 4: Test

```bash
docker compose restart alerts
docker compose logs -f alerts
```

You should receive a test message when a signal is generated.

## Setting Up Email

### Gmail Configuration

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. Add to `.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
ALERTS_FROM_EMAIL=ghostquant@yourdomain.com
ALERTS_TO_EMAIL=your_email@gmail.com
```

### Other SMTP Providers

**Outlook/Office365**:
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
```

**Yahoo**:
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

**Custom SMTP**:
```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587  # or 465 for SSL
```

## Starting the Service

### Using Docker Compose

```bash
docker compose up alerts
```

### Standalone (for development)

```bash
cd alerts
poetry install
poetry run python -m alerts.engine
```

## Monitoring

### View Logs

```bash
# Docker
docker compose logs -f alerts

# Look for these log messages:
# - "Alerts engine initialized"
# - "Telegram alert sent successfully"
# - "Email alert sent: BTC - BUY"
# - "Alert sent for ETH: BUY"
```

### Check Alert History

The service maintains an in-memory cache of sent alerts. To see what's been sent, check the logs:

```bash
docker compose logs alerts | grep "Alert sent"
```

### Test Alert Manually

You can trigger a test alert by setting the environment variable:

```bash
# Add to .env
TEST_ALERT=true

# Restart service
docker compose restart alerts
```

## Alert Message Format

### Telegram Message

```
🟢 BTC: BUY
Pre-Trend ↑ 75.3% | TrendScore 82.5
Drivers: MOM_24H(18.2), MOM_1H(12.5), VOLUME_Z(8.3)
```

### Email Message

**Subject**: `GhostQuant Alert: BTC - BUY`

**Body**:
```
BTC: BUY
Pre-Trend ↑ 75.3% | TrendScore 82.5
Drivers: MOM_24H(18.2), MOM_1H(12.5), VOLUME_Z(8.3)
```

### Action Emojis

- 🟢 BUY (Green)
- 🟡 TRIM (Yellow)
- 🔴 EXIT (Red)
- ⚪ HOLD (White)

## Alert Filtering

### Conditions for Sending Alerts

An alert is sent only if ALL conditions are met:

1. **Action is not HOLD**: Signal must be BUY, TRIM, or EXIT
2. **Confidence threshold**: `confidence >= 0.5`
3. **Not recently sent**: No duplicate alert in last 15 minutes
4. **Signal is recent**: Signal timestamp within last 5 minutes

### Throttling

The service prevents spam by:

- Tracking sent alerts by `(asset_id, action, timestamp)`
- Throttling duplicates for 15 minutes
- Auto-cleanup of old alert records (2x throttle period)

## Troubleshooting

### Telegram Alerts Not Sending

**Symptom**: No messages received in Telegram

**Solution**:
1. Check bot token is correct: `docker compose logs alerts | grep "Telegram"`
2. Verify chat ID is correct
3. Ensure you've sent at least one message to the bot
4. Check bot hasn't been blocked
5. Test API manually:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
     -d "chat_id=<CHAT_ID>" \
     -d "text=Test message"
   ```

### Email Alerts Not Sending

**Symptom**: No emails received

**Solution**:
1. Check SMTP credentials: `docker compose logs alerts | grep "Email"`
2. Verify app password (not regular password for Gmail)
3. Check spam folder
4. Verify SMTP port (587 for TLS, 465 for SSL)
5. Test SMTP connection:
   ```bash
   docker compose exec alerts python -c "
   import smtplib
   server = smtplib.SMTP('smtp.gmail.com', 587)
   server.starttls()
   server.login('user@gmail.com', 'app_password')
   print('Success!')
   "
   ```

### Too Many Alerts

**Symptom**: Receiving excessive notifications

**Solution**:
1. Increase throttle period:
   ```python
   self.throttle_minutes = 30  # Increase from 15
   ```
2. Increase confidence threshold:
   ```python
   if signal['confidence'] < 0.7:  # Increase from 0.5
       return False
   ```
3. Filter by action:
   ```python
   if signal['action'] not in ['BUY', 'EXIT']:  # Ignore TRIM
       return False
   ```

### No Alerts Being Sent

**Symptom**: Service running but no alerts

**Solution**:
1. Check signals are being generated: `SELECT COUNT(*) FROM signals WHERE ts >= NOW() - INTERVAL '1 hour';`
2. Verify confidence levels: `SELECT AVG(confidence) FROM signals WHERE ts >= NOW() - INTERVAL '1 hour';`
3. Check action distribution: `SELECT action, COUNT(*) FROM signals WHERE ts >= NOW() - INTERVAL '1 hour' GROUP BY action;`
4. Lower confidence threshold temporarily for testing
5. Check service logs for errors

### Duplicate Alerts

**Symptom**: Receiving same alert multiple times

**Solution**:
1. Check throttle mechanism is working
2. Verify alert cache isn't being cleared prematurely
3. Increase throttle period
4. Check for service restarts (cache is in-memory)

## Customization

### Custom Alert Templates

Edit `alerts/src/alerts/engine.py`:

```python
def format_alert_message(self, signal):
    # Custom template
    message = f"🚨 SIGNAL ALERT 🚨\n"
    message += f"Asset: {signal['symbol']}\n"
    message += f"Action: {signal['action']}\n"
    message += f"Score: {signal['trend_score']:.1f}\n"
    message += f"Confidence: {signal['confidence']*100:.0f}%\n"
    
    return message
```

### Adding Discord Channel

1. Create new file `alerts/src/alerts/channels/discord.py`:

```python
import aiohttp
import os

class DiscordChannel:
    def __init__(self):
        self.webhook_url = os.getenv('DISCORD_WEBHOOK_URL', '')
        self.enabled = bool(self.webhook_url)
    
    async def send_alert(self, message: str):
        if not self.enabled:
            return False
        
        payload = {'content': message}
        
        async with aiohttp.ClientSession() as session:
            async with session.post(self.webhook_url, json=payload) as resp:
                return resp.status == 204
```

2. Add to `engine.py`:

```python
from alerts.channels.discord import DiscordChannel

self.discord = DiscordChannel()

# In send_alert method:
await self.discord.send_alert(message)
```

### Adding Slack Channel

Similar to Discord, use Slack Incoming Webhooks.

### Filtering by Asset

Only alert for specific assets:

```python
def should_alert(self, signal):
    # Only alert for BTC and ETH
    if signal['symbol'] not in ['BTC', 'ETH']:
        return False
    
    # ... rest of conditions
```

### Filtering by TrendScore Range

Only alert for extreme scores:

```python
def should_alert(self, signal):
    # Only alert for very high or very low scores
    if 40 < signal['trend_score'] < 70:
        return False
    
    # ... rest of conditions
```

## Performance Tuning

### Reduce Database Queries

Increase polling interval:

```python
self.interval = 120  # Check every 2 minutes instead of 1
```

### Batch Alerts

Collect multiple signals and send as single message:

```python
async def process_signals(self):
    signals = await self.get_latest_signals()
    
    alerts_to_send = [s for s in signals if self.should_alert(s)]
    
    if alerts_to_send:
        batch_message = "\n\n".join([
            self.format_alert_message(s) for s in alerts_to_send
        ])
        await self.telegram.send_alert(batch_message)
```

## Monitoring Alerts

### Alert Metrics

Track alert performance:

```python
# Add to engine.py
self.alert_count = 0
self.alert_by_action = {'BUY': 0, 'TRIM': 0, 'EXIT': 0}

# In send_alert:
self.alert_count += 1
self.alert_by_action[signal['action']] += 1

# Log periodically:
logger.info(f"Alerts sent: {self.alert_count}, Distribution: {self.alert_by_action}")
```

### Alert Success Rate

Track delivery success:

```python
self.telegram_success = 0
self.telegram_failures = 0

# In send_alert:
if telegram_sent:
    self.telegram_success += 1
else:
    self.telegram_failures += 1
```

## Security

### Protecting Credentials

- Never commit `.env` files
- Use environment variables only
- Rotate API keys regularly
- Use read-only database credentials where possible

### Rate Limiting

Implement rate limiting to prevent abuse:

```python
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self, max_per_hour=60):
        self.max_per_hour = max_per_hour
        self.sent_times = []
    
    def can_send(self):
        now = datetime.utcnow()
        cutoff = now - timedelta(hours=1)
        self.sent_times = [t for t in self.sent_times if t > cutoff]
        
        if len(self.sent_times) >= self.max_per_hour:
            return False
        
        self.sent_times.append(now)
        return True
```

## Maintenance

### Clearing Alert Cache

The in-memory cache is automatically cleaned. To force clear:

```bash
docker compose restart alerts
```

### Testing Channels

Test each channel independently:

```bash
# Test Telegram
docker compose exec alerts python -c "
import asyncio
from alerts.channels.telegram import TelegramChannel
async def test():
    channel = TelegramChannel()
    await channel.send_alert('Test message')
asyncio.run(test())
"

# Test Email
docker compose exec alerts python -c "
import asyncio
from alerts.channels.email_smtp import EmailChannel
async def test():
    channel = EmailChannel()
    await channel.send_alert('Test Subject', 'Test message')
asyncio.run(test())
"
```

## Alerts Best Practices

1. **Start Conservative**: Begin with high confidence thresholds and long throttle periods
2. **Monitor Performance**: Track which alerts lead to profitable signals
3. **Adjust Gradually**: Make small incremental changes to thresholds
4. **Use Multiple Channels**: Configure both Telegram and Email for redundancy
5. **Test Regularly**: Verify channels are working before relying on them
6. **Document Changes**: Keep notes on threshold adjustments and their effects

## Alerts Checklist

- [ ] Telegram bot created and configured
- [ ] Chat ID obtained and verified
- [ ] Email SMTP credentials configured
- [ ] Test alerts sent successfully
- [ ] Throttle period set appropriately
- [ ] Confidence threshold tuned
- [ ] Service running and monitored
- [ ] Logs checked for errors
- [ ] Backup notification channel configured
