"""Tests for rate limiter."""
import pytest
import asyncio
import time
from ingester.rate_limiter import RateLimiter


@pytest.mark.asyncio
async def test_rate_limiter_basic():
    """Test basic rate limiting functionality."""
    limiter = RateLimiter(requests_per_minute=10)
    
    start = time.time()
    await limiter.acquire()
    elapsed = time.time() - start
    
    assert elapsed < 0.1  # Should be nearly instant


@pytest.mark.asyncio
async def test_rate_limiter_enforces_limit():
    """Test that rate limiter enforces the limit."""
    limiter = RateLimiter(requests_per_minute=5)
    
    for _ in range(5):
        await limiter.acquire()
    
    start = time.time()
    await limiter.acquire()
    elapsed = time.time() - start
    
    assert elapsed > 1.0


@pytest.mark.asyncio
async def test_rate_limiter_current_rate():
    """Test getting current rate."""
    limiter = RateLimiter(requests_per_minute=10)
    
    assert limiter.get_current_rate() == 0
    
    await limiter.acquire()
    assert limiter.get_current_rate() == 1
    
    await limiter.acquire()
    assert limiter.get_current_rate() == 2


@pytest.mark.asyncio
async def test_rate_limiter_wait_time():
    """Test getting wait time estimate."""
    limiter = RateLimiter(requests_per_minute=5)
    
    assert limiter.get_wait_time() == 0.0
    
    for _ in range(5):
        await limiter.acquire()
    
    wait_time = limiter.get_wait_time()
    assert wait_time > 0
