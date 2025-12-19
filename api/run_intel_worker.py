#!/usr/bin/env python3
"""
GhostQuant Real-Time Intelligence Worker

This is a standalone worker that runs the real-time intelligence engine
independently of the main FastAPI application. It handles:

- Intelligence Feed Simulator (generates test events)
- Background Intel Worker (processes Redis channels)
- WebSocket Alert Engine polling
- Socket.IO Gateway polling

Deploy this as a separate DigitalOcean App Platform Worker component.

Usage:
    python run_intel_worker.py

Environment Variables Required:
    - REDIS_REST_URL: Upstash Redis REST URL
    - REDIS_REST_TOKEN: Upstash Redis REST Token
"""

import asyncio
import os
import signal
import sys

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.gde.fabric.intelligence_queue_worker import IntelligenceQueueWorker
from app.gde.fabric.intelligence_feed_simulator import IntelligenceFeedSimulator
from app.gde.fabric.background_worker import BackgroundIntelWorker


class IntelWorkerManager:
    """
    Manages all real-time intelligence workers.
    """
    
    def __init__(self):
        self.gde_worker = IntelligenceQueueWorker()
        self.gde_simulator = IntelligenceFeedSimulator(self.gde_worker)
        self.background_worker = BackgroundIntelWorker()
        self.running = False
        
    async def start(self):
        """Start all workers."""
        self.running = True
        print("[IntelWorkerManager] Starting GhostQuant Real-Time Intelligence Engine...")
        
        # Check Redis configuration
        redis_url = os.getenv("REDIS_REST_URL")
        redis_token = os.getenv("REDIS_REST_TOKEN")
        
        if not redis_url or not redis_token:
            print("[IntelWorkerManager] WARNING: Redis not configured - running in limited mode")
            print("[IntelWorkerManager] Set REDIS_REST_URL and REDIS_REST_TOKEN for full functionality")
        else:
            print("[IntelWorkerManager] Redis configured - full functionality enabled")
        
        # Start the intelligence queue worker
        await self.gde_worker.start()
        print("[IntelWorkerManager] Intelligence Queue Worker started")
        
        # Start the background worker (polls Redis channels)
        await self.background_worker.start()
        print("[IntelWorkerManager] Background Intel Worker started")
        
        # Start the feed simulator (generates test events)
        # This runs in a task so it doesn't block
        simulator_interval = float(os.getenv("SIMULATOR_INTERVAL", "2.0"))
        asyncio.create_task(self.gde_simulator.start(interval=simulator_interval))
        print(f"[IntelWorkerManager] Feed Simulator started (interval: {simulator_interval}s)")
        
        print("[IntelWorkerManager] All workers started successfully")
        print("[IntelWorkerManager] Press Ctrl+C to stop")
        
    async def stop(self):
        """Stop all workers."""
        print("[IntelWorkerManager] Stopping workers...")
        self.running = False
        
        await self.gde_simulator.stop()
        await self.gde_worker.stop()
        await self.background_worker.stop()
        
        print("[IntelWorkerManager] All workers stopped")
        
    async def run_forever(self):
        """Run the worker manager until interrupted."""
        await self.start()
        
        # Keep running until stopped
        while self.running:
            await asyncio.sleep(1)
            
    def get_stats(self):
        """Get worker statistics."""
        return {
            "running": self.running,
            "background_worker": self.background_worker.get_stats(),
            "gde_worker_running": self.gde_worker.running,
            "simulator_running": self.gde_simulator.running
        }


async def main():
    """Main entry point."""
    print("=" * 60)
    print("GhostQuant Real-Time Intelligence Worker")
    print("=" * 60)
    
    manager = IntelWorkerManager()
    
    # Handle shutdown signals
    loop = asyncio.get_event_loop()
    
    def signal_handler():
        print("\n[IntelWorkerManager] Received shutdown signal...")
        asyncio.create_task(manager.stop())
    
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, signal_handler)
    
    try:
        await manager.run_forever()
    except KeyboardInterrupt:
        print("\n[IntelWorkerManager] Interrupted by user")
    finally:
        if manager.running:
            await manager.stop()
    
    print("[IntelWorkerManager] Shutdown complete")


if __name__ == "__main__":
    asyncio.run(main())
