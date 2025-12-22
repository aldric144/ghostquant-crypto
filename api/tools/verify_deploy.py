#!/usr/bin/env python3
"""
GhostQuant Deployment Safeguard - Layer 2
Post-Deploy API Verification Bot

This script verifies that all GQ-Core endpoints are working correctly
after deployment. It pings every endpoint, validates responses, and
checks that synthetic fallback is functioning.

Usage:
    python tools/verify_deploy.py [--base-url URL]

Exit codes:
    0 - All endpoints verified successfully
    1 - One or more endpoints failed verification
"""

import sys
import os
import json
import argparse
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime

try:
    import httpx
except ImportError:
    print("Installing httpx...")
    os.system("pip install httpx")
    import httpx


@dataclass
class EndpointResult:
    """Result of an endpoint verification."""
    path: str
    status_code: int
    response_time_ms: float
    success: bool
    error: Optional[str] = None
    has_source_field: bool = False
    source_value: Optional[str] = None
    schema_valid: bool = False
    schema_errors: List[str] = field(default_factory=list)


# Required GQ-Core endpoints with expected schema fields
ENDPOINTS_TO_VERIFY = [
    {
        "path": "/gq-core/overview",
        "required_fields": ["source", "timestamp"],
    },
    {
        "path": "/gq-core/risk",
        "required_fields": ["source", "timestamp"],
    },
    {
        "path": "/gq-core/whales",
        "required_fields": ["source", "timestamp"],
    },
    {
        "path": "/gq-core/trends",
        "required_fields": ["source", "timestamp"],
    },
    {
        "path": "/gq-core/map",
        "required_fields": ["source", "timestamp"],
    },
    {
        "path": "/gq-core/anomalies",
        "required_fields": ["source", "timestamp"],
    },
    {
        "path": "/gq-core/entities",
        "required_fields": ["source", "timestamp"],
    },
    {
        "path": "/gq-core/narratives",
        "required_fields": ["source", "timestamp"],
    },
    {
        "path": "/gq-core/rings",
        "required_fields": ["source", "timestamp"],
    },
    {
        "path": "/gq-core/system-status",
        "required_fields": ["source", "timestamp"],
    },
    {
        "path": "/gq-core/health",
        "required_fields": ["status"],
    },
    {
        "path": "/gq-core/ecosystems",
        "required_fields": ["ecosystems"],
    },
    {
        "path": "/gq-core/ecosystems/ethereum",
        "required_fields": ["id", "name", "metrics"],
    },
]


def verify_endpoint(client: httpx.Client, base_url: str, endpoint: Dict) -> EndpointResult:
    """
    Verify a single endpoint.
    
    Args:
        client: HTTP client
        base_url: Base URL of the API
        endpoint: Endpoint configuration
        
    Returns:
        EndpointResult with verification details
    """
    path = endpoint["path"]
    required_fields = endpoint.get("required_fields", [])
    url = f"{base_url}{path}"
    
    result = EndpointResult(
        path=path,
        status_code=0,
        response_time_ms=0,
        success=False
    )
    
    try:
        start_time = time.time()
        response = client.get(url, timeout=30.0)
        result.response_time_ms = (time.time() - start_time) * 1000
        result.status_code = response.status_code
        
        if response.status_code != 200:
            result.error = f"HTTP {response.status_code}: {response.text[:200]}"
            return result
        
        # Parse JSON response
        try:
            data = response.json()
        except json.JSONDecodeError as e:
            result.error = f"Invalid JSON response: {e}"
            return result
        
        # Check for source field (indicates real vs synthetic)
        if "source" in data:
            result.has_source_field = True
            result.source_value = data.get("source")
        
        # Validate required schema fields
        result.schema_valid = True
        for field in required_fields:
            if field not in data:
                result.schema_valid = False
                result.schema_errors.append(f"Missing field: {field}")
        
        # Success if status 200 and schema valid
        result.success = result.status_code == 200 and result.schema_valid
        
    except httpx.TimeoutException:
        result.error = "Request timed out after 30 seconds"
    except httpx.ConnectError as e:
        result.error = f"Connection failed: {e}"
    except Exception as e:
        result.error = f"Unexpected error: {e}"
    
    return result


def verify_all_endpoints(base_url: str) -> List[EndpointResult]:
    """
    Verify all GQ-Core endpoints.
    
    Args:
        base_url: Base URL of the API
        
    Returns:
        List of EndpointResult objects
    """
    results = []
    
    with httpx.Client() as client:
        for endpoint in ENDPOINTS_TO_VERIFY:
            print(f"  Checking {endpoint['path']}...", end=" ", flush=True)
            result = verify_endpoint(client, base_url, endpoint)
            
            if result.success:
                source = f" [{result.source_value}]" if result.source_value else ""
                print(f"OK ({result.response_time_ms:.0f}ms){source}")
            else:
                print(f"FAILED")
                if result.error:
                    print(f"    Error: {result.error}")
                if result.schema_errors:
                    for err in result.schema_errors:
                        print(f"    Schema: {err}")
            
            results.append(result)
    
    return results


def print_summary(results: List[EndpointResult]) -> None:
    """Print verification summary."""
    total = len(results)
    passed = sum(1 for r in results if r.success)
    failed = total - passed
    
    avg_response_time = sum(r.response_time_ms for r in results) / total if total > 0 else 0
    
    # Count source types
    live_count = sum(1 for r in results if r.source_value == "real")
    synthetic_count = sum(1 for r in results if r.source_value == "synthetic")
    
    print("\n" + "=" * 60)
    print("POST-DEPLOY VERIFICATION SUMMARY")
    print("=" * 60)
    print(f"\n  Total endpoints: {total}")
    print(f"  Passed: {passed}")
    print(f"  Failed: {failed}")
    print(f"  Average response time: {avg_response_time:.0f}ms")
    print(f"\n  Data sources:")
    print(f"    Live (real): {live_count}")
    print(f"    Synthetic fallback: {synthetic_count}")
    
    if failed > 0:
        print("\n  Failed endpoints:")
        for r in results:
            if not r.success:
                print(f"    - {r.path}: {r.error or 'Schema validation failed'}")


def generate_report(results: List[EndpointResult], base_url: str) -> Dict[str, Any]:
    """Generate a JSON report of the verification results."""
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "base_url": base_url,
        "summary": {
            "total": len(results),
            "passed": sum(1 for r in results if r.success),
            "failed": sum(1 for r in results if not r.success),
            "avg_response_time_ms": sum(r.response_time_ms for r in results) / len(results) if results else 0,
        },
        "endpoints": [
            {
                "path": r.path,
                "status_code": r.status_code,
                "response_time_ms": r.response_time_ms,
                "success": r.success,
                "source": r.source_value,
                "error": r.error,
                "schema_errors": r.schema_errors,
            }
            for r in results
        ]
    }


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(description="GhostQuant Post-Deploy Verification")
    parser.add_argument(
        "--base-url",
        default=os.getenv("API_BASE_URL", "https://ghostquant-mewzi.ondigitalocean.app"),
        help="Base URL of the deployed API"
    )
    parser.add_argument(
        "--output",
        help="Output file for JSON report"
    )
    args = parser.parse_args()
    
    print("\n" + "=" * 60)
    print("GhostQuant Post-Deploy API Verification")
    print("=" * 60)
    print(f"\nTarget: {args.base_url}")
    print(f"Time: {datetime.utcnow().isoformat()}")
    print("\nVerifying endpoints...")
    
    results = verify_all_endpoints(args.base_url)
    print_summary(results)
    
    # Generate report
    report = generate_report(results, args.base_url)
    
    if args.output:
        with open(args.output, "w") as f:
            json.dump(report, f, indent=2)
        print(f"\nReport saved to: {args.output}")
    
    # Determine exit code
    failed = sum(1 for r in results if not r.success)
    
    if failed > 0:
        print("\n" + "=" * 60)
        print("[VERIFICATION FAILED]")
        print(f"{failed} endpoint(s) failed verification")
        print("\nRecommended actions:")
        print("  1. Check backend logs on DigitalOcean")
        print("  2. Verify GQ-Core router is registered in main.py")
        print("  3. Check for import errors in gq_core.py")
        print("  4. Verify ingress rules include /gq-core route")
        print("=" * 60 + "\n")
        return 1
    else:
        print("\n" + "=" * 60)
        print("[VERIFICATION PASSED]")
        print("All GQ-Core endpoints are working correctly")
        print("=" * 60 + "\n")
        return 0


if __name__ == "__main__":
    sys.exit(main())
