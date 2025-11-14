"""
Alert manager - creates and sends alerts via email, Telegram, and push notifications.
"""
import os
import logging
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import aiohttp

logger = logging.getLogger(__name__)


class AlertManager:
    """
    Manage alerts for momentum signals, whale activity, and price changes.
    Supports email (SMTP), Telegram Bot, and web push notifications.
    """
    
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_pass = os.getenv("SMTP_PASS", "")
        self.alert_from = os.getenv("ALERT_EMAIL_FROM", "no-reply@ghostquant.local")
        
        self.telegram_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID", "")
        
        self.enable_email = os.getenv("ENABLE_EMAIL_ALERTS", "true").lower() == "true"
        self.enable_telegram = os.getenv("ENABLE_TELEGRAM_ALERTS", "true").lower() == "true"
        self.enable_push = os.getenv("ENABLE_PUSH_ALERTS", "false").lower() == "true"
        
        self.rate_limit_minutes = int(os.getenv("ALERT_RATE_LIMIT_MINUTES", 15))
        
        self.alerts = {}
        self.alert_history = []
    
    async def create_alert(
        self,
        user_contact: str,
        symbol: str,
        alert_type: str,
        threshold: float,
        channels: List[str],
        db
    ) -> str:
        """
        Create a new alert.
        Returns alert_id.
        """
        try:
            alert_id = str(uuid.uuid4())
            
            alert = {
                "alert_id": alert_id,
                "user_contact": user_contact,
                "symbol": symbol.upper(),
                "alert_type": alert_type,
                "threshold": threshold,
                "channels": channels,
                "created_at": datetime.utcnow().isoformat(),
                "last_triggered": None,
                "trigger_count": 0,
                "active": True
            }
            
            self.alerts[alert_id] = alert
            
            logger.info(f"Created alert {alert_id} for {symbol} ({alert_type} {threshold})")
            
            return alert_id
        
        except Exception as e:
            logger.error(f"Error creating alert: {e}")
            raise
    
    async def check_alerts(self, scored_coins: List[Dict[str, Any]]):
        """
        Check all active alerts against current coin data.
        Called by background worker after each refresh.
        """
        try:
            for alert_id, alert in self.alerts.items():
                if not alert["active"]:
                    continue
                
                if alert["last_triggered"]:
                    last_triggered = datetime.fromisoformat(alert["last_triggered"])
                    if datetime.utcnow() - last_triggered < timedelta(minutes=self.rate_limit_minutes):
                        continue
                
                symbol = alert["symbol"]
                coin = next((c for c in scored_coins if c.get("symbol", "").upper() == symbol), None)
                
                if not coin:
                    continue
                
                should_trigger = False
                message = ""
                
                alert_type = alert["alert_type"]
                threshold = alert["threshold"]
                
                if alert_type == "score_above":
                    momentum_score = coin.get("momentum_score", 0)
                    if momentum_score >= threshold:
                        should_trigger = True
                        message = f"{symbol} momentum score reached {momentum_score:.1f} (threshold: {threshold})"
                
                elif alert_type == "score_below":
                    momentum_score = coin.get("momentum_score", 0)
                    if momentum_score <= threshold:
                        should_trigger = True
                        message = f"{symbol} momentum score dropped to {momentum_score:.1f} (threshold: {threshold})"
                
                elif alert_type == "price_above":
                    price = coin.get("current_price", 0)
                    if price >= threshold:
                        should_trigger = True
                        message = f"{symbol} price reached ${price:,.2f} (threshold: ${threshold:,.2f})"
                
                elif alert_type == "price_below":
                    price = coin.get("current_price", 0)
                    if price <= threshold:
                        should_trigger = True
                        message = f"{symbol} price dropped to ${price:,.2f} (threshold: ${threshold:,.2f})"
                
                elif alert_type == "whale_seen":
                    whale_confidence = coin.get("whale_confidence", 0)
                    if whale_confidence >= threshold:
                        should_trigger = True
                        message = f"{symbol} whale activity detected (confidence: {whale_confidence*100:.1f}%)"
                
                elif alert_type == "pretrend_above":
                    pretrend_prob = coin.get("pretrend_prob", 0)
                    if pretrend_prob >= threshold:
                        should_trigger = True
                        message = f"{symbol} PreTrend probability reached {pretrend_prob*100:.1f}% (threshold: {threshold*100:.1f}%)"
                
                if should_trigger:
                    await self._send_alert(alert, message, coin)
                    alert["last_triggered"] = datetime.utcnow().isoformat()
                    alert["trigger_count"] += 1
        
        except Exception as e:
            logger.error(f"Error checking alerts: {e}", exc_info=True)
    
    async def _send_alert(self, alert: Dict[str, Any], message: str, coin: Dict[str, Any]):
        """
        Send alert via configured channels.
        """
        user_contact = alert["user_contact"]
        channels = alert["channels"]
        
        detailed_message = self._format_alert_message(message, coin)
        
        for channel in channels:
            try:
                if channel == "email" and self.enable_email:
                    await self._send_email(user_contact, alert["symbol"], detailed_message)
                
                elif channel == "telegram" and self.enable_telegram:
                    await self._send_telegram(detailed_message)
                
                elif channel == "push" and self.enable_push:
                    await self._send_push(user_contact, message)
                
                logger.info(f"Sent alert via {channel} to {user_contact}")
            
            except Exception as e:
                logger.error(f"Error sending alert via {channel}: {e}")
    
    def _format_alert_message(self, message: str, coin: Dict[str, Any]) -> str:
        """
        Format a detailed alert message with coin data.
        """
        symbol = coin.get("symbol", "").upper()
        momentum_score = coin.get("momentum_score", 0)
        price = coin.get("current_price", 0)
        price_change_24h = coin.get("price_change_percentage_24h", 0)
        action = coin.get("action", "HOLD")
        
        return f"""
🚨 GhostQuant Alert

{message}

📊 Current Stats:
• Symbol: {symbol}
• Price: ${price:,.2f} ({price_change_24h:+.2f}% 24h)
• Momentum Score: {momentum_score:.1f}/100
• Action: {action}

View details: https://ghostquant.local/market/coin/{coin.get('id')}
"""
    
    async def _send_email(self, to_email: str, symbol: str, message: str):
        """
        Send email alert via SMTP.
        """
        if not self.smtp_host or not self.smtp_user:
            logger.warning("SMTP not configured, skipping email alert")
            return
        
        try:
            msg = MIMEMultipart()
            msg["From"] = self.alert_from
            msg["To"] = to_email
            msg["Subject"] = f"GhostQuant Alert: {symbol}"
            
            msg.attach(MIMEText(message, "plain"))
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.send_message(msg)
            
            logger.info(f"Sent email alert to {to_email}")
        
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            raise
    
    async def _send_telegram(self, message: str):
        """
        Send Telegram alert via Bot API.
        """
        if not self.telegram_token or not self.telegram_chat_id:
            logger.warning("Telegram not configured, skipping telegram alert")
            return
        
        try:
            url = f"https://api.telegram.org/bot{self.telegram_token}/sendMessage"
            payload = {
                "chat_id": self.telegram_chat_id,
                "text": message,
                "parse_mode": "Markdown"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, timeout=10) as response:
                    if response.status != 200:
                        logger.error(f"Telegram API returned {response.status}")
                    else:
                        logger.info("Sent Telegram alert")
        
        except Exception as e:
            logger.error(f"Error sending Telegram alert: {e}")
            raise
    
    async def _send_push(self, subscription: str, message: str):
        """
        Send web push notification (placeholder).
        """
        logger.info(f"Push notifications not yet implemented: {message}")
