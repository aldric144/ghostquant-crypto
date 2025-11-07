"""
Harvard Finance Analytics Suite

Institutional-grade performance analytics inspired by Harvard Business School
and elite finance education.

Computes:
- Sharpe Ratio, Sortino Ratio, Calmar Ratio
- Beta, Alpha vs benchmarks
- Rolling factor regressions
- Information Ratio, Tracking Error
- Maximum Drawdown, CVaR (Conditional Value at Risk)
- Win Rate, Profit Factor, Payoff Ratio

Produces printable "Investor Letters" like a hedge fund would.
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from scipy import stats

logger = logging.getLogger(__name__)


class HarvardAnalytics:
    """
    Comprehensive performance analytics suite.
    
    Provides institutional-grade metrics for portfolio evaluation.
    """
    
    def __init__(self, risk_free_rate: float = 0.0):
        """
        Args:
            risk_free_rate: Annual risk-free rate (default 0% for crypto)
        """
        self.risk_free_rate = risk_free_rate
    
    def compute_sharpe_ratio(self, 
                            returns: pd.Series,
                            periods_per_year: int = 365) -> float:
        """
        Compute Sharpe Ratio.
        
        Sharpe = (E[R] - Rf) / σ(R)
        
        Args:
            returns: Series of returns
            periods_per_year: Number of periods per year (365 for daily)
        
        Returns:
            Annualized Sharpe Ratio
        """
        if len(returns) < 2:
            return 0.0
        
        excess_returns = returns - self.risk_free_rate / periods_per_year
        
        if excess_returns.std() == 0:
            return 0.0
        
        sharpe = excess_returns.mean() / excess_returns.std()
        sharpe_annual = sharpe * np.sqrt(periods_per_year)
        
        return sharpe_annual
    
    def compute_sortino_ratio(self,
                             returns: pd.Series,
                             periods_per_year: int = 365) -> float:
        """
        Compute Sortino Ratio (downside deviation only).
        
        Sortino = (E[R] - Rf) / σ_downside(R)
        
        Args:
            returns: Series of returns
            periods_per_year: Number of periods per year
        
        Returns:
            Annualized Sortino Ratio
        """
        if len(returns) < 2:
            return 0.0
        
        excess_returns = returns - self.risk_free_rate / periods_per_year
        
        downside_returns = excess_returns[excess_returns < 0]
        
        if len(downside_returns) == 0 or downside_returns.std() == 0:
            return 0.0
        
        sortino = excess_returns.mean() / downside_returns.std()
        sortino_annual = sortino * np.sqrt(periods_per_year)
        
        return sortino_annual
    
    def compute_calmar_ratio(self,
                            returns: pd.Series,
                            periods_per_year: int = 365) -> float:
        """
        Compute Calmar Ratio.
        
        Calmar = CAGR / Max Drawdown
        
        Args:
            returns: Series of returns
            periods_per_year: Number of periods per year
        
        Returns:
            Calmar Ratio
        """
        if len(returns) < 2:
            return 0.0
        
        cagr = self.compute_cagr(returns, periods_per_year)
        max_dd = self.compute_max_drawdown(returns)
        
        if max_dd == 0:
            return 0.0
        
        return cagr / abs(max_dd)
    
    def compute_cagr(self,
                    returns: pd.Series,
                    periods_per_year: int = 365) -> float:
        """
        Compute Compound Annual Growth Rate.
        
        CAGR = (Final Value / Initial Value)^(1/years) - 1
        
        Args:
            returns: Series of returns
            periods_per_year: Number of periods per year
        
        Returns:
            Annualized CAGR
        """
        if len(returns) == 0:
            return 0.0
        
        cumulative_return = (1 + returns).prod() - 1
        n_years = len(returns) / periods_per_year
        
        if n_years == 0:
            return 0.0
        
        cagr = (1 + cumulative_return) ** (1 / n_years) - 1
        
        return cagr
    
    def compute_max_drawdown(self, returns: pd.Series) -> float:
        """
        Compute Maximum Drawdown.
        
        Max DD = max(peak - trough) / peak
        
        Args:
            returns: Series of returns
        
        Returns:
            Maximum drawdown (negative value)
        """
        if len(returns) == 0:
            return 0.0
        
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        
        return drawdown.min()
    
    def compute_beta(self,
                    portfolio_returns: pd.Series,
                    benchmark_returns: pd.Series) -> float:
        """
        Compute Beta vs benchmark.
        
        Beta = Cov(R_p, R_b) / Var(R_b)
        
        Args:
            portfolio_returns: Portfolio returns
            benchmark_returns: Benchmark returns
        
        Returns:
            Beta coefficient
        """
        if len(portfolio_returns) < 2 or len(benchmark_returns) < 2:
            return 0.0
        
        aligned = pd.DataFrame({
            'portfolio': portfolio_returns,
            'benchmark': benchmark_returns
        }).dropna()
        
        if len(aligned) < 2:
            return 0.0
        
        covariance = aligned['portfolio'].cov(aligned['benchmark'])
        benchmark_var = aligned['benchmark'].var()
        
        if benchmark_var == 0:
            return 0.0
        
        beta = covariance / benchmark_var
        
        return beta
    
    def compute_alpha(self,
                     portfolio_returns: pd.Series,
                     benchmark_returns: pd.Series,
                     periods_per_year: int = 365) -> float:
        """
        Compute Alpha (Jensen's Alpha).
        
        Alpha = R_p - [Rf + Beta * (R_b - Rf)]
        
        Args:
            portfolio_returns: Portfolio returns
            benchmark_returns: Benchmark returns
            periods_per_year: Number of periods per year
        
        Returns:
            Annualized alpha
        """
        if len(portfolio_returns) < 2 or len(benchmark_returns) < 2:
            return 0.0
        
        beta = self.compute_beta(portfolio_returns, benchmark_returns)
        
        portfolio_return = portfolio_returns.mean() * periods_per_year
        benchmark_return = benchmark_returns.mean() * periods_per_year
        
        alpha = portfolio_return - (self.risk_free_rate + beta * (benchmark_return - self.risk_free_rate))
        
        return alpha
    
    def compute_information_ratio(self,
                                 portfolio_returns: pd.Series,
                                 benchmark_returns: pd.Series,
                                 periods_per_year: int = 365) -> float:
        """
        Compute Information Ratio.
        
        IR = (R_p - R_b) / Tracking Error
        
        Args:
            portfolio_returns: Portfolio returns
            benchmark_returns: Benchmark returns
            periods_per_year: Number of periods per year
        
        Returns:
            Annualized Information Ratio
        """
        if len(portfolio_returns) < 2 or len(benchmark_returns) < 2:
            return 0.0
        
        aligned = pd.DataFrame({
            'portfolio': portfolio_returns,
            'benchmark': benchmark_returns
        }).dropna()
        
        if len(aligned) < 2:
            return 0.0
        
        excess_returns = aligned['portfolio'] - aligned['benchmark']
        
        if excess_returns.std() == 0:
            return 0.0
        
        ir = excess_returns.mean() / excess_returns.std()
        ir_annual = ir * np.sqrt(periods_per_year)
        
        return ir_annual
    
    def compute_tracking_error(self,
                              portfolio_returns: pd.Series,
                              benchmark_returns: pd.Series,
                              periods_per_year: int = 365) -> float:
        """
        Compute Tracking Error.
        
        TE = σ(R_p - R_b)
        
        Args:
            portfolio_returns: Portfolio returns
            benchmark_returns: Benchmark returns
            periods_per_year: Number of periods per year
        
        Returns:
            Annualized tracking error
        """
        if len(portfolio_returns) < 2 or len(benchmark_returns) < 2:
            return 0.0
        
        aligned = pd.DataFrame({
            'portfolio': portfolio_returns,
            'benchmark': benchmark_returns
        }).dropna()
        
        if len(aligned) < 2:
            return 0.0
        
        excess_returns = aligned['portfolio'] - aligned['benchmark']
        te = excess_returns.std() * np.sqrt(periods_per_year)
        
        return te
    
    def compute_cvar(self,
                    returns: pd.Series,
                    confidence_level: float = 0.95) -> float:
        """
        Compute Conditional Value at Risk (CVaR / Expected Shortfall).
        
        CVaR = E[R | R <= VaR]
        
        Args:
            returns: Series of returns
            confidence_level: Confidence level (e.g., 0.95 for 95%)
        
        Returns:
            CVaR (negative value)
        """
        if len(returns) < 10:
            return 0.0
        
        var = np.percentile(returns, (1 - confidence_level) * 100)
        cvar = returns[returns <= var].mean()
        
        return cvar
    
    def compute_win_rate(self, returns: pd.Series) -> float:
        """
        Compute win rate (percentage of positive returns).
        
        Args:
            returns: Series of returns
        
        Returns:
            Win rate (0 to 1)
        """
        if len(returns) == 0:
            return 0.0
        
        win_rate = (returns > 0).sum() / len(returns)
        
        return win_rate
    
    def compute_profit_factor(self, returns: pd.Series) -> float:
        """
        Compute profit factor.
        
        Profit Factor = Sum(Gains) / Sum(Losses)
        
        Args:
            returns: Series of returns
        
        Returns:
            Profit factor
        """
        gains = returns[returns > 0].sum()
        losses = abs(returns[returns < 0].sum())
        
        if losses == 0:
            return float('inf') if gains > 0 else 0.0
        
        return gains / losses
    
    def compute_payoff_ratio(self, returns: pd.Series) -> float:
        """
        Compute payoff ratio (average win / average loss).
        
        Args:
            returns: Series of returns
        
        Returns:
            Payoff ratio
        """
        wins = returns[returns > 0]
        losses = returns[returns < 0]
        
        if len(wins) == 0 or len(losses) == 0:
            return 0.0
        
        avg_win = wins.mean()
        avg_loss = abs(losses.mean())
        
        if avg_loss == 0:
            return float('inf') if avg_win > 0 else 0.0
        
        return avg_win / avg_loss
    
    def rolling_factor_regression(self,
                                  portfolio_returns: pd.Series,
                                  factor_returns: pd.DataFrame,
                                  window: int = 90) -> pd.DataFrame:
        """
        Compute rolling factor regression.
        
        R_p = alpha + beta_1*F_1 + ... + beta_n*F_n + epsilon
        
        Args:
            portfolio_returns: Portfolio returns
            factor_returns: DataFrame of factor returns
            window: Rolling window size
        
        Returns:
            DataFrame with rolling alpha and betas
        """
        if len(portfolio_returns) < window:
            return pd.DataFrame()
        
        results = []
        
        for i in range(window, len(portfolio_returns)):
            window_portfolio = portfolio_returns.iloc[i-window:i]
            window_factors = factor_returns.iloc[i-window:i]
            
            aligned = pd.concat([window_portfolio, window_factors], axis=1).dropna()
            
            if len(aligned) < 10:
                continue
            
            y = aligned.iloc[:, 0]
            X = aligned.iloc[:, 1:]
            
            X_with_const = np.column_stack([np.ones(len(X)), X])
            
            try:
                coeffs, _, _, _ = np.linalg.lstsq(X_with_const, y, rcond=None)
                
                result = {
                    'date': portfolio_returns.index[i],
                    'alpha': coeffs[0],
                }
                
                for j, factor_name in enumerate(X.columns):
                    result[f'beta_{factor_name}'] = coeffs[j+1]
                
                results.append(result)
                
            except Exception as e:
                logger.warning(f"Regression failed: {e}")
                continue
        
        return pd.DataFrame(results)
    
    def compute_comprehensive_metrics(self,
                                     returns: pd.Series,
                                     benchmark_returns: Optional[pd.Series] = None,
                                     periods_per_year: int = 365) -> Dict:
        """
        Compute all performance metrics.
        
        Args:
            returns: Portfolio returns
            benchmark_returns: Optional benchmark returns
            periods_per_year: Number of periods per year
        
        Returns:
            Dict with all metrics
        """
        metrics = {
            'total_return': (1 + returns).prod() - 1,
            'cagr': self.compute_cagr(returns, periods_per_year),
            'mean_return': returns.mean() * periods_per_year,
            
            'volatility': returns.std() * np.sqrt(periods_per_year),
            'max_drawdown': self.compute_max_drawdown(returns),
            'cvar_95': self.compute_cvar(returns, 0.95),
            
            'sharpe_ratio': self.compute_sharpe_ratio(returns, periods_per_year),
            'sortino_ratio': self.compute_sortino_ratio(returns, periods_per_year),
            'calmar_ratio': self.compute_calmar_ratio(returns, periods_per_year),
            
            'win_rate': self.compute_win_rate(returns),
            'profit_factor': self.compute_profit_factor(returns),
            'payoff_ratio': self.compute_payoff_ratio(returns),
            
            'n_periods': len(returns),
            'n_positive': (returns > 0).sum(),
            'n_negative': (returns < 0).sum(),
        }
        
        if benchmark_returns is not None and len(benchmark_returns) > 0:
            metrics['beta'] = self.compute_beta(returns, benchmark_returns)
            metrics['alpha'] = self.compute_alpha(returns, benchmark_returns, periods_per_year)
            metrics['information_ratio'] = self.compute_information_ratio(returns, benchmark_returns, periods_per_year)
            metrics['tracking_error'] = self.compute_tracking_error(returns, benchmark_returns, periods_per_year)
        
        return metrics
    
    def generate_performance_summary(self,
                                    returns: pd.Series,
                                    benchmark_returns: Optional[pd.Series] = None,
                                    portfolio_name: str = "Portfolio") -> str:
        """
        Generate human-readable performance summary.
        
        Args:
            returns: Portfolio returns
            benchmark_returns: Optional benchmark returns
            portfolio_name: Name of portfolio
        
        Returns:
            Formatted summary string
        """
        metrics = self.compute_comprehensive_metrics(returns, benchmark_returns)
        
        summary = f"""
{'='*60}
{portfolio_name} Performance Summary
{'='*60}

RETURN METRICS
--------------
Total Return:        {metrics['total_return']:>10.2%}
CAGR:               {metrics['cagr']:>10.2%}
Mean Annual Return: {metrics['mean_return']:>10.2%}

RISK METRICS
------------
Volatility:         {metrics['volatility']:>10.2%}
Max Drawdown:       {metrics['max_drawdown']:>10.2%}
CVaR (95%):         {metrics['cvar_95']:>10.2%}

RISK-ADJUSTED METRICS
---------------------
Sharpe Ratio:       {metrics['sharpe_ratio']:>10.2f}
Sortino Ratio:      {metrics['sortino_ratio']:>10.2f}
Calmar Ratio:       {metrics['calmar_ratio']:>10.2f}

TRADE STATISTICS
----------------
Win Rate:           {metrics['win_rate']:>10.2%}
Profit Factor:      {metrics['profit_factor']:>10.2f}
Payoff Ratio:       {metrics['payoff_ratio']:>10.2f}
"""
        
        if benchmark_returns is not None:
            summary += f"""
BENCHMARK-RELATIVE METRICS
--------------------------
Beta:               {metrics.get('beta', 0):>10.2f}
Alpha:              {metrics.get('alpha', 0):>10.2%}
Information Ratio:  {metrics.get('information_ratio', 0):>10.2f}
Tracking Error:     {metrics.get('tracking_error', 0):>10.2%}
"""
        
        summary += f"""
{'='*60}
"""
        
        return summary
    
    def generate_investor_letter(self,
                                returns: pd.Series,
                                portfolio_weights: Dict[str, float],
                                market_commentary: str,
                                period_start: datetime,
                                period_end: datetime) -> str:
        """
        Generate hedge fund-style investor letter.
        
        Args:
            returns: Portfolio returns for period
            portfolio_weights: Current portfolio weights
            market_commentary: Commentary on market conditions
            period_start: Period start date
            period_end: Period end date
        
        Returns:
            Formatted investor letter
        """
        metrics = self.compute_comprehensive_metrics(returns)
        
        letter = f"""
{'='*70}
                        INVESTOR LETTER
                    {period_start.strftime('%B %Y')}
{'='*70}

Dear Investors,

We are pleased to present our performance update for the period from
{period_start.strftime('%B %d, %Y')} to {period_end.strftime('%B %d, %Y')}.

PERFORMANCE SUMMARY
-------------------
The portfolio generated a return of {metrics['total_return']:.2%} during the period,
with an annualized volatility of {metrics['volatility']:.2%}. Our Sharpe ratio of
{metrics['sharpe_ratio']:.2f} reflects strong risk-adjusted performance.

Maximum drawdown was {metrics['max_drawdown']:.2%}, demonstrating disciplined risk
management. The portfolio's win rate of {metrics['win_rate']:.2%} and profit factor
of {metrics['profit_factor']:.2f} indicate consistent alpha generation.

MARKET COMMENTARY
-----------------
{market_commentary}

PORTFOLIO POSITIONING
---------------------
Current portfolio allocation:
"""
        
        sorted_weights = sorted(portfolio_weights.items(), key=lambda x: x[1], reverse=True)
        for asset, weight in sorted_weights[:10]:
            letter += f"  {asset:<10} {weight:>8.2%}\n"
        
        letter += f"""

RISK MANAGEMENT
---------------
We maintain strict risk controls with position limits and correlation monitoring.
Our CVaR (95%) of {metrics['cvar_95']:.2%} represents our tail risk exposure.

OUTLOOK
-------
We remain focused on generating consistent risk-adjusted returns through our
systematic approach combining momentum, value, and carry factors with adaptive
risk management.

Thank you for your continued confidence.

Sincerely,
The GhostQuant Team

{'='*70}
"""
        
        return letter
