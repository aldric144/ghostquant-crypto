import asyncio
import logging
import psycopg
from psycopg.rows import dict_row
import os
from datetime import datetime, timedelta
from alerts.channels.telegram import TelegramChannel
from alerts.channels.email_smtp import EmailChannel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER', 'ghost')}:{os.getenv('POSTGRES_PASSWORD', 'ghostpass')}@{os.getenv('POSTGRES_HOST', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'ghostquant')}"

class AlertsEngine:
    def __init__(self):
        self.conn = None
        self.telegram = TelegramChannel()
        self.email = EmailChannel()
        self.sent_alerts = set()
        self.throttle_minutes = 15
        self.interval = 60
        
    async def initialize(self):
        self.conn = await psycopg.AsyncConnection.connect(DATABASE_URL)
        logger.info("Alerts engine initialized")
        
    async def get_latest_signals(self):
        async with self.conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("""
                SELECT DISTINCT ON (s.asset_id)
                    s.asset_id,
                    a.symbol,
                    s.ts,
                    s.trend_score,
                    s.pretrend_prob,
                    s.action,
                    s.confidence,
                    s.rationale
                FROM signals s
                JOIN assets a ON s.asset_id = a.asset_id
                WHERE s.ts >= NOW() - INTERVAL '5 minutes'
                ORDER BY s.asset_id, s.ts DESC
            """)
            return await cur.fetchall()
    
    def should_alert(self, signal):
        if signal['action'] == 'HOLD':
            return False
        
        if signal['confidence'] < 0.5:
            return False
        
        alert_key = f"{signal['asset_id']}_{signal['action']}_{signal['ts'].strftime('%Y%m%d%H%M')}"
        
        if alert_key in self.sent_alerts:
            return False
        
        return True
    
    def format_alert_message(self, signal):
        symbol = signal['symbol']
        action = signal['action']
        trend_score = signal['trend_score']
        pretrend_prob = signal['pretrend_prob']
        
        rationale = signal.get('rationale', {})
        if isinstance(rationale, str):
            import json
            try:
                rationale = json.loads(rationale)
            except:
                rationale = {}
        
        top_drivers = rationale.get('top_drivers', [])
        drivers_text = ', '.join([f"{d['name']}({d['contribution']:.1f})" for d in top_drivers[:3]])
        
        if action == 'BUY':
            emoji = '🟢'
        elif action == 'TRIM':
            emoji = '🟡'
        elif action == 'EXIT':
            emoji = '🔴'
        else:
            emoji = '⚪'
        
        message = f"{emoji} <b>{symbol}</b>: {action}\n"
        message += f"Pre-Trend ↑ {pretrend_prob*100:.1f}% | TrendScore {trend_score:.1f}\n"
        message += f"Drivers: {drivers_text}"
        
        return message
    
    def format_email_subject(self, signal):
        return f"GhostQuant Alert: {signal['symbol']} - {signal['action']}"
    
    async def send_alert(self, signal):
        message = self.format_alert_message(signal)
        
        telegram_sent = await self.telegram.send_alert(message)
        
        if not telegram_sent:
            subject = self.format_email_subject(signal)
            email_sent = await self.email.send_alert(subject, message.replace('<b>', '').replace('</b>', ''))
        
        alert_key = f"{signal['asset_id']}_{signal['action']}_{signal['ts'].strftime('%Y%m%d%H%M')}"
        self.sent_alerts.add(alert_key)
        
        logger.info(f"Alert sent for {signal['symbol']}: {signal['action']}")
    
    async def cleanup_old_alerts(self):
        cutoff = datetime.utcnow() - timedelta(minutes=self.throttle_minutes * 2)
        cutoff_str = cutoff.strftime('%Y%m%d%H%M')
        
        self.sent_alerts = {
            key for key in self.sent_alerts
            if key.split('_')[-1] >= cutoff_str
        }
    
    async def process_signals(self):
        signals = await self.get_latest_signals()
        
        for signal in signals:
            if self.should_alert(signal):
                await self.send_alert(signal)
        
        await self.cleanup_old_alerts()
    
    async def start(self):
        await self.initialize()
        
        logger.info(f"Starting alerts engine (interval={self.interval}s)")
        
        while True:
            try:
                await self.process_signals()
            except Exception as e:
                logger.error(f"Error in alerts cycle: {e}")
            
            await asyncio.sleep(self.interval)

async def main():
    engine = AlertsEngine()
    await engine.start()

if __name__ == "__main__":
    asyncio.run(main())
