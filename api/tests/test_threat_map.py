"""
Integration tests for Global Threat Map API endpoints.
"""
import pytest
from fastapi.testclient import TestClient


def test_darkpool_activity(client: TestClient):
    """Test darkpool activity endpoint."""
    response = client.get("/darkpool/activity")
    assert response.status_code == 200
    data = response.json()
    assert "events" in data
    assert "count" in data
    assert isinstance(data["events"], list)


def test_darkpool_summary(client: TestClient):
    """Test darkpool summary endpoint."""
    response = client.get("/darkpool/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_volume_24h" in data
    assert "risk_score" in data
    assert "threat_level" in data


def test_darkpool_institutional_flow(client: TestClient):
    """Test darkpool institutional flow endpoint."""
    response = client.get("/darkpool/institutional-flow")
    assert response.status_code == 200
    data = response.json()
    assert "net_flow" in data
    assert "flow_direction" in data


def test_manipulation_alerts(client: TestClient):
    """Test manipulation alerts endpoint."""
    response = client.get("/manipulation/alerts")
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data
    assert "count" in data
    assert isinstance(data["alerts"], list)


def test_manipulation_summary(client: TestClient):
    """Test manipulation summary endpoint."""
    response = client.get("/manipulation/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_alerts_24h" in data
    assert "risk_score" in data
    assert "threat_level" in data


def test_manipulation_wash_trading(client: TestClient):
    """Test wash trading detection endpoint."""
    response = client.get("/manipulation/wash-trading")
    assert response.status_code == 200
    data = response.json()
    assert "detections" in data
    assert "count" in data


def test_stablecoin_flows(client: TestClient):
    """Test stablecoin flows endpoint."""
    response = client.get("/stablecoin/flows")
    assert response.status_code == 200
    data = response.json()
    assert "flows" in data
    assert "count" in data
    assert isinstance(data["flows"], list)


def test_stablecoin_summary(client: TestClient):
    """Test stablecoin summary endpoint."""
    response = client.get("/stablecoin/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_market_cap" in data
    assert "risk_score" in data
    assert "threat_level" in data


def test_stablecoin_depeg_alerts(client: TestClient):
    """Test stablecoin depeg alerts endpoint."""
    response = client.get("/stablecoin/depeg-alerts")
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data
    assert "count" in data


def test_derivatives_overview(client: TestClient):
    """Test derivatives overview endpoint."""
    response = client.get("/derivatives/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_open_interest" in data
    assert "risk_score" in data
    assert "threat_level" in data


def test_derivatives_liquidations(client: TestClient):
    """Test derivatives liquidations endpoint."""
    response = client.get("/derivatives/liquidations")
    assert response.status_code == 200
    data = response.json()
    assert "liquidations" in data
    assert "count" in data
    assert "total_value" in data


def test_derivatives_funding_rates(client: TestClient):
    """Test derivatives funding rates endpoint."""
    response = client.get("/derivatives/funding-rates")
    assert response.status_code == 200
    data = response.json()
    assert "funding_rates" in data
    assert "count" in data


def test_derivatives_open_interest(client: TestClient):
    """Test derivatives open interest endpoint."""
    response = client.get("/derivatives/open-interest")
    assert response.status_code == 200
    data = response.json()
    assert "open_interest_data" in data
    assert "total_open_interest" in data


def test_derivatives_risk_alerts(client: TestClient):
    """Test derivatives risk alerts endpoint."""
    response = client.get("/derivatives/risk-alerts")
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data
    assert "count" in data


def test_unified_risk_all_threats(client: TestClient):
    """Test unified risk all threats endpoint."""
    response = client.get("/unified-risk/all-threats")
    assert response.status_code == 200
    data = response.json()
    assert "threats" in data
    assert "count" in data
    assert "summary" in data
    assert isinstance(data["threats"], list)


def test_unified_risk_dashboard(client: TestClient):
    """Test unified risk dashboard endpoint."""
    response = client.get("/unified-risk/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "overall_risk_score" in data
    assert "threat_level" in data
    assert "categories" in data
    assert "market_sentiment" in data


def test_unified_risk_timeline(client: TestClient):
    """Test unified risk timeline endpoint."""
    response = client.get("/unified-risk/timeline")
    assert response.status_code == 200
    data = response.json()
    assert "timeline" in data
    assert "hours" in data
    assert "interval" in data
    assert isinstance(data["timeline"], list)


def test_unified_risk_heatmap(client: TestClient):
    """Test unified risk heatmap endpoint."""
    response = client.get("/unified-risk/heatmap")
    assert response.status_code == 200
    data = response.json()
    assert "heatmap" in data
    assert "categories" in data
    assert isinstance(data["heatmap"], list)


def test_unified_risk_symbol(client: TestClient):
    """Test unified risk symbol endpoint."""
    response = client.get("/unified-risk/symbol/BTC")
    assert response.status_code == 200
    data = response.json()
    assert "symbol" in data
    assert "threats" in data
    assert "risk_score" in data
    assert "threat_level" in data
    assert data["symbol"] == "BTC"
