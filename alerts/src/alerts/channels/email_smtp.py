import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import os

logger = logging.getLogger(__name__)

class EmailChannel:
    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST', '')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_pass = os.getenv('SMTP_PASS', '')
        self.from_email = os.getenv('ALERTS_FROM_EMAIL', '')
        self.to_email = os.getenv('ALERTS_TO_EMAIL', '')
        
        self.enabled = bool(
            self.smtp_host and self.smtp_user and 
            self.smtp_pass and self.from_email and self.to_email
        )
        
        if not self.enabled:
            logger.warning("Email not configured (missing SMTP settings)")
    
    async def send_alert(self, subject: str, message: str):
        if not self.enabled:
            logger.debug(f"Email disabled, would send: {subject}")
            return False
        
        try:
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = self.to_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(message, 'plain'))
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.send_message(msg)
            
            logger.info(f"Email alert sent: {subject}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email alert: {e}")
            return False
