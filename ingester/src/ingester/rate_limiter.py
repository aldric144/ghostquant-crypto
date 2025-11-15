"""Rate limiter for API requests."""
import asyncio
import time
from collections import deque
from typing import Optional


class RateLimiter:
    """
    Token bucket rate limiter for API requests.
    
    Ensures we don't exceed the specified requests per minute.
    """
    
    def __init__(self, requests_per_minute: int):
        """
        Initialize rate limiter.
        
        Args:
            requests_per_minute: Maximum number of requests allowed per minute
        """
        self.requests_per_minute = requests_per_minute
        self.window_seconds = 60.0
        self.request_times: deque = deque()
        self.lock = asyncio.Lock()
    
    async def acquire(self) -> None:
        """
        Acquire permission to make a request.
        
        Blocks if rate limit would be exceeded.
        """
        async with self.lock:
            now = time.time()
            
            while self.request_times and now - self.request_times[0] >= self.window_seconds:
                self.request_times.popleft()
            
            if len(self.request_times) >= self.requests_per_minute:
                oldest_request = self.request_times[0]
                wait_time = self.window_seconds - (now - oldest_request)
                
                if wait_time > 0:
                    await asyncio.sleep(wait_time)
                    now = time.time()
                    
                    while self.request_times and now - self.request_times[0] >= self.window_seconds:
                        self.request_times.popleft()
            
            self.request_times.append(now)
    
    def get_current_rate(self) -> int:
        """Get the current number of requests in the time window."""
        now = time.time()
        while self.request_times and now - self.request_times[0] >= self.window_seconds:
            self.request_times.popleft()
        return len(self.request_times)
    
    def get_wait_time(self) -> float:
        """Get the estimated wait time before next request can be made."""
        now = time.time()
        
        while self.request_times and now - self.request_times[0] >= self.window_seconds:
            self.request_times.popleft()
        
        if len(self.request_times) < self.requests_per_minute:
            return 0.0
        
        oldest_request = self.request_times[0]
        return max(0.0, self.window_seconds - (now - oldest_request))
