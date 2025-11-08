import pandas as pd
import numpy as np
from typing import Dict, Any, List
from datetime import datetime
from backtest.slippage import apply_slippage, calculate_fees

class BacktestEngine:
    def __init__(self, initial_capital: float = 100000, fee_rate: float = 0.001):
        self.initial_capital = initial_capital
        self.capital = initial_capital
        self.fee_rate = fee_rate
        self.positions = {}
        self.trades = []
        self.equity_curve = []
        
    def execute_trade(
        self,
        timestamp: datetime,
        asset_id: int,
        side: str,
        size: float,
        price: float,
        avg_daily_volume: float,
        reason: str = ""
    ):
        slippage_result = apply_slippage(price, size, side, avg_daily_volume)
        executed_price = slippage_result['executed_price']
        slippage_bps = slippage_result['slippage_bps']
        
        trade_value = size * executed_price
        fees = calculate_fees(size, executed_price, self.fee_rate)
        
        if side.lower() == 'buy':
            cost = trade_value + fees
            if cost > self.capital:
                return None
            
            self.capital -= cost
            
            if asset_id not in self.positions:
                self.positions[asset_id] = {'size': 0, 'avg_price': 0}
            
            current_size = self.positions[asset_id]['size']
            current_avg = self.positions[asset_id]['avg_price']
            
            new_size = current_size + size
            new_avg = ((current_size * current_avg) + (size * executed_price)) / new_size if new_size > 0 else executed_price
            
            self.positions[asset_id] = {'size': new_size, 'avg_price': new_avg}
            
            pnl = 0
            
        else:
            if asset_id not in self.positions or self.positions[asset_id]['size'] < size:
                return None
            
            proceeds = trade_value - fees
            self.capital += proceeds
            
            avg_price = self.positions[asset_id]['avg_price']
            pnl = (executed_price - avg_price) * size - fees
            
            self.positions[asset_id]['size'] -= size
            
            if self.positions[asset_id]['size'] <= 0:
                del self.positions[asset_id]
        
        trade = {
            'ts': timestamp,
            'asset_id': asset_id,
            'side': side,
            'size': size,
            'px': executed_price,
            'slippage_bps': slippage_bps,
            'pnl': pnl,
            'reason': reason
        }
        
        self.trades.append(trade)
        
        return trade
    
    def get_portfolio_value(self, current_prices: Dict[int, float]) -> float:
        position_value = sum(
            pos['size'] * current_prices.get(asset_id, pos['avg_price'])
            for asset_id, pos in self.positions.items()
        )
        
        return self.capital + position_value
    
    def record_equity(self, timestamp: datetime, current_prices: Dict[int, float]):
        portfolio_value = self.get_portfolio_value(current_prices)
        
        self.equity_curve.append({
            'timestamp': timestamp,
            'equity': portfolio_value
        })
    
    def calculate_metrics(self) -> Dict[str, Any]:
        if not self.equity_curve:
            return {}
        
        df = pd.DataFrame(self.equity_curve)
        df.set_index('timestamp', inplace=True)
        
        returns = df['equity'].pct_change().dropna()
        
        if len(returns) == 0:
            return {}
        
        total_return = (df['equity'].iloc[-1] - self.initial_capital) / self.initial_capital
        
        mean_return = returns.mean()
        std_return = returns.std()
        sharpe = (mean_return / std_return) * np.sqrt(252 * 24 * 60) if std_return > 0 else 0
        
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_dd = drawdown.min()
        
        days = (df.index[-1] - df.index[0]).days
        years = days / 365.25 if days > 0 else 1
        cagr = ((df['equity'].iloc[-1] / self.initial_capital) ** (1 / years)) - 1 if years > 0 else 0
        
        return {
            'sharpe': sharpe,
            'max_dd': max_dd,
            'cagr': cagr,
            'total_return': total_return,
            'trade_count': len(self.trades),
            'final_equity': df['equity'].iloc[-1]
        }

def run_trend_strategy(
    bars: pd.DataFrame,
    signals: pd.DataFrame,
    asset_id: int,
    engine: BacktestEngine,
    position_size: float = 1.0
):
    avg_volume = bars['volume'].mean()
    
    for idx, row in signals.iterrows():
        timestamp = idx
        action = row.get('action', 'HOLD')
        
        if timestamp not in bars.index:
            continue
        
        current_price = bars.loc[timestamp, 'close']
        
        if action == 'BUY':
            engine.execute_trade(
                timestamp=timestamp,
                asset_id=asset_id,
                side='buy',
                size=position_size,
                price=current_price,
                avg_daily_volume=avg_volume,
                reason=f"TrendScore={row.get('trend_score', 0):.1f}"
            )
        elif action in ['TRIM', 'EXIT']:
            if asset_id in engine.positions and engine.positions[asset_id]['size'] > 0:
                size_to_sell = engine.positions[asset_id]['size'] * (0.5 if action == 'TRIM' else 1.0)
                engine.execute_trade(
                    timestamp=timestamp,
                    asset_id=asset_id,
                    side='sell',
                    size=size_to_sell,
                    price=current_price,
                    avg_daily_volume=avg_volume,
                    reason=f"Action={action}"
                )
        
        engine.record_equity(timestamp, {asset_id: current_price})
