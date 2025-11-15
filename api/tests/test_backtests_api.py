"""Tests for backtests API routes."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_backtest_health():
    """Test backtest health endpoint."""
    response = client.get("/backtests/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data


def test_list_backtests():
    """Test listing backtests."""
    response = client.get("/backtests?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert "total" in data
    assert "page" in data
    assert "limit" in data


def test_create_backtest():
    """Test creating a backtest."""
    backtest_data = {
        "strategy": "trend_v1",
        "symbol": "BTC",
        "timeframe": "1d",
        "start_date": "2024-01-01",
        "end_date": "2024-06-01",
        "initial_capital": 10000,
        "params": {
            "fast_ma": 20,
            "slow_ma": 50
        }
    }
    
    response = client.post("/backtests", json=backtest_data)
    assert response.status_code == 200
    data = response.json()
    assert "run_id" in data
    assert data["strategy"] == "trend_v1"
    assert data["symbol"] == "BTC"
    assert data["status"] == "pending"


def test_get_backtest_invalid_id():
    """Test getting backtest with invalid ID."""
    response = client.get("/backtests/invalid-uuid")
    assert response.status_code == 400


def test_create_backtest_invalid_data():
    """Test creating backtest with invalid data."""
    invalid_data = {
        "strategy": "trend_v1",
    }
    
    response = client.post("/backtests", json=invalid_data)
    assert response.status_code == 422  # Validation error
