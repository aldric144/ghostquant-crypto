"""
AlphaBrain Configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql://ghost:ghostpass@postgres:5432/ghostquant'
)

REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379/0')

USE_MOCK_MACRO_DATA = os.getenv('USE_MOCK_MACRO_DATA', 'true').lower() == 'true'

FACTOR_LOOKBACK_DAYS = int(os.getenv('FACTOR_LOOKBACK_DAYS', '90'))
FACTOR_REBALANCE_HOURS = int(os.getenv('FACTOR_REBALANCE_HOURS', '24'))

VOLATILITY_TARGET = float(os.getenv('VOLATILITY_TARGET', '0.15'))  # 15% annual vol target
KELLY_FRACTION = float(os.getenv('KELLY_FRACTION', '0.25'))  # Conservative Kelly
MAX_POSITION_SIZE = float(os.getenv('MAX_POSITION_SIZE', '0.20'))  # 20% max per asset
MAX_CORRELATION_THRESHOLD = float(os.getenv('MAX_CORRELATION_THRESHOLD', '0.80'))

ALPHA_LEARNING_RATE = float(os.getenv('ALPHA_LEARNING_RATE', '0.01'))
ALPHA_DISCOUNT_FACTOR = float(os.getenv('ALPHA_DISCOUNT_FACTOR', '0.95'))
ALPHA_EXPLORATION_RATE = float(os.getenv('ALPHA_EXPLORATION_RATE', '0.10'))

VIX_RISK_ON_THRESHOLD = float(os.getenv('VIX_RISK_ON_THRESHOLD', '20.0'))
VIX_RISK_OFF_THRESHOLD = float(os.getenv('VIX_RISK_OFF_THRESHOLD', '30.0'))
DXY_STRONG_THRESHOLD = float(os.getenv('DXY_STRONG_THRESHOLD', '105.0'))
YIELD_CURVE_INVERSION_THRESHOLD = float(os.getenv('YIELD_CURVE_INVERSION_THRESHOLD', '-0.5'))

REPORT_OUTPUT_DIR = os.getenv('REPORT_OUTPUT_DIR', '/app/reports')
GENERATE_WEEKLY_REPORTS = os.getenv('GENERATE_WEEKLY_REPORTS', 'true').lower() == 'true'

ENABLE_NARRATIVE_ANALYSIS = os.getenv('ENABLE_NARRATIVE_ANALYSIS', 'false').lower() == 'true'
NARRATIVE_API_KEY = os.getenv('NARRATIVE_API_KEY', '')

LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
