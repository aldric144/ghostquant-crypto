#!/usr/bin/env python3
"""
GhostQuant Deployment Safeguard - Layer 1
Pre-Deploy Endpoint Integrity Checker

This script validates that all required GQ-Core endpoints are registered
before allowing deployment to proceed. If any endpoint is missing,
deployment is aborted with detailed error messages and fix instructions.

Usage:
    python tools/check_endpoints.py

Exit codes:
    0 - All endpoints present, deployment can proceed
    1 - Missing endpoints, deployment aborted
"""

import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from typing import List, Dict, Set
from dataclasses import dataclass


@dataclass
class EndpointCheck:
    """Result of an endpoint check."""
    path: str
    methods: Set[str]
    found: bool = False


# Required GQ-Core endpoints that MUST be present for deployment
REQUIRED_ENDPOINTS: List[Dict[str, any]] = [
    {"path": "/gq-core/overview", "methods": ["GET"]},
    {"path": "/gq-core/risk", "methods": ["GET"]},
    {"path": "/gq-core/whales", "methods": ["GET"]},
    {"path": "/gq-core/trends", "methods": ["GET"]},
    {"path": "/gq-core/map", "methods": ["GET"]},
    {"path": "/gq-core/anomalies", "methods": ["GET"]},
    {"path": "/gq-core/entities", "methods": ["GET"]},
    {"path": "/gq-core/narratives", "methods": ["GET"]},
    {"path": "/gq-core/rings", "methods": ["GET"]},
    {"path": "/gq-core/system-status", "methods": ["GET"]},
    {"path": "/gq-core/health", "methods": ["GET"]},
    {"path": "/gq-core/ecosystems", "methods": ["GET"]},
    {"path": "/gq-core/ecosystems/{chain}", "methods": ["GET"]},
]


def get_registered_routes() -> Dict[str, Set[str]]:
    """
    Load the FastAPI app and extract all registered routes.
    
    Returns:
        Dictionary mapping route paths to their HTTP methods
    """
    try:
        # Import the FastAPI app
        from app.main import app
        
        routes = {}
        for route in app.routes:
            if hasattr(route, 'path') and hasattr(route, 'methods'):
                path = route.path
                methods = set(route.methods) if route.methods else set()
                routes[path] = methods
        
        return routes
    except Exception as e:
        print(f"\n[ERROR] Failed to load FastAPI app: {e}")
        print("\nThis may indicate a broken import or missing dependency.")
        print("Please check the backend logs for more details.")
        sys.exit(1)


def check_endpoints() -> tuple[List[EndpointCheck], List[EndpointCheck]]:
    """
    Check all required endpoints against registered routes.
    
    Returns:
        Tuple of (found_endpoints, missing_endpoints)
    """
    registered = get_registered_routes()
    
    found = []
    missing = []
    
    for endpoint in REQUIRED_ENDPOINTS:
        path = endpoint["path"]
        required_methods = set(endpoint["methods"])
        
        check = EndpointCheck(
            path=path,
            methods=required_methods
        )
        
        if path in registered:
            registered_methods = registered[path]
            if required_methods.issubset(registered_methods):
                check.found = True
                found.append(check)
            else:
                missing_methods = required_methods - registered_methods
                check.methods = missing_methods
                missing.append(check)
        else:
            missing.append(check)
    
    return found, missing


def print_results(found: List[EndpointCheck], missing: List[EndpointCheck]) -> None:
    """Print the endpoint check results."""
    print("\n" + "=" * 60)
    print("GhostQuant Pre-Deploy Endpoint Integrity Check")
    print("=" * 60)
    
    print(f"\n[SUMMARY]")
    print(f"  Total required endpoints: {len(REQUIRED_ENDPOINTS)}")
    print(f"  Found: {len(found)}")
    print(f"  Missing: {len(missing)}")
    
    if found:
        print(f"\n[FOUND ENDPOINTS] ({len(found)})")
        for check in found:
            methods = ", ".join(sorted(check.methods))
            print(f"  [OK] {check.path} [{methods}]")
    
    if missing:
        print(f"\n[MISSING ENDPOINTS] ({len(missing)})")
        for check in missing:
            methods = ", ".join(sorted(check.methods))
            print(f"  [MISSING] {check.path} [{methods}]")


def print_fix_instructions(missing: List[EndpointCheck]) -> None:
    """Print instructions for fixing missing endpoints."""
    print("\n" + "=" * 60)
    print("FIX INSTRUCTIONS")
    print("=" * 60)
    
    print("\nTo fix missing endpoints, add them to:")
    print("  api/app/routers/gq_core.py")
    
    print("\nExample endpoint template:")
    print("""
    @router.get("/endpoint-name")
    async def get_endpoint_name() -> Dict[str, Any]:
        \"\"\"Description of the endpoint.\"\"\"
        service = get_gq_core_service()
        return await service.get_endpoint_name()
    """)
    
    print("\nMissing endpoint paths that need to be added:")
    for check in missing:
        print(f"  - {check.path}")
    
    print("\nAfter adding the endpoints:")
    print("  1. Run this check again: python tools/check_endpoints.py")
    print("  2. Ensure all endpoints return [OK]")
    print("  3. Commit and push changes")
    print("  4. Redeploy to DigitalOcean")


def main() -> int:
    """
    Main entry point for the endpoint checker.
    
    Returns:
        Exit code (0 for success, 1 for failure)
    """
    print("\nStarting GhostQuant Pre-Deploy Endpoint Check...")
    
    found, missing = check_endpoints()
    print_results(found, missing)
    
    if missing:
        print_fix_instructions(missing)
        print("\n" + "=" * 60)
        print("[DEPLOYMENT ABORTED]")
        print("Cannot proceed with deployment - missing required endpoints")
        print("=" * 60 + "\n")
        return 1
    else:
        print("\n" + "=" * 60)
        print("[DEPLOYMENT APPROVED]")
        print("All required GQ-Core endpoints are registered")
        print("=" * 60 + "\n")
        return 0


if __name__ == "__main__":
    sys.exit(main())
