"""
API Endpoint Tester
Live endpoint testing and validation.
"""

import time
import json
from typing import Dict, Any, Optional
from datetime import datetime
import uuid
from .apidocs_schema import APITestResult, APIEndpointDoc, HTTPMethod


class APIEndpointTester:
    """Test API endpoints and validate responses."""
    
    def __init__(self, api_base_url: str = "http://localhost:8000"):
        self.api_base_url = api_base_url
    
    def test_endpoint(
        self,
        endpoint: APIEndpointDoc,
        params: Optional[Dict[str, Any]] = None,
        body: Optional[Dict[str, Any]] = None,
    ) -> APITestResult:
        """
        Test an API endpoint with provided parameters.
        
        Args:
            endpoint: Endpoint documentation
            params: Query parameters
            body: Request body
        
        Returns:
            APITestResult: Test result
        """
        import requests
        
        test_id = f"test_{uuid.uuid4().hex[:12]}"
        timestamp = datetime.utcnow()
        
        url = f"{self.api_base_url}{endpoint.path}"
        
        if params and endpoint.params:
            for param in endpoint.params:
                param_name = param.get("name")
                if param_name and param_name in params:
                    url = url.replace(f"{{{param_name}}}", str(params[param_name]))
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        
        query_params = {}
        if params and endpoint.query_params:
            for qp in endpoint.query_params:
                qp_name = qp.get("name")
                if qp_name and qp_name in params:
                    query_params[qp_name] = params[qp_name]
        
        start_time = time.time()
        success = False
        error = None
        warnings = []
        status_code = 0
        response_body = None
        response_headers = {}
        
        try:
            if endpoint.method == HTTPMethod.GET:
                response = requests.get(url, params=query_params, headers=headers, timeout=10)
            elif endpoint.method == HTTPMethod.POST:
                response = requests.post(url, params=query_params, json=body, headers=headers, timeout=10)
            elif endpoint.method == HTTPMethod.PUT:
                response = requests.put(url, params=query_params, json=body, headers=headers, timeout=10)
            elif endpoint.method == HTTPMethod.DELETE:
                response = requests.delete(url, params=query_params, headers=headers, timeout=10)
            else:
                response = requests.request(endpoint.method.value, url, params=query_params, json=body, headers=headers, timeout=10)
            
            response_time_ms = (time.time() - start_time) * 1000
            status_code = response.status_code
            response_headers = dict(response.headers)
            
            try:
                response_body = response.json()
            except:
                response_body = response.text
            
            if 200 <= status_code < 300:
                success = True
            else:
                error = f"HTTP {status_code}: {response.reason}"
            
            if response_time_ms > 5000:
                warnings.append("Response time exceeds 5 seconds")
            
            if status_code == 404:
                warnings.append("Endpoint not found - may not be implemented yet")
            
        except requests.exceptions.Timeout:
            response_time_ms = (time.time() - start_time) * 1000
            error = "Request timeout (10s)"
            warnings.append("Endpoint may be slow or unresponsive")
        
        except requests.exceptions.ConnectionError:
            response_time_ms = (time.time() - start_time) * 1000
            error = "Connection error - API may be offline"
        
        except Exception as e:
            response_time_ms = (time.time() - start_time) * 1000
            error = f"Test error: {str(e)}"
        
        return APITestResult(
            test_id=test_id,
            endpoint_id=endpoint.endpoint_id,
            timestamp=timestamp,
            method=endpoint.method.value,
            url=url,
            headers=headers,
            params=params or {},
            body=body,
            status_code=status_code,
            response_time_ms=response_time_ms,
            response_body=response_body,
            response_headers=response_headers,
            success=success,
            error=error,
            warnings=warnings,
        )
    
    def validate_request(self, endpoint: APIEndpointDoc, params: Dict[str, Any], body: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validate request parameters against endpoint schema.
        
        Args:
            endpoint: Endpoint documentation
            params: Request parameters
            body: Request body
        
        Returns:
            Dict: Validation result
        """
        errors = []
        warnings = []
        
        if endpoint.params:
            for param in endpoint.params:
                if param.get("required") and param.get("name") not in params:
                    errors.append(f"Missing required parameter: {param.get('name')}")
        
        if endpoint.query_params:
            for qp in endpoint.query_params:
                if qp.get("required") and qp.get("name") not in params:
                    errors.append(f"Missing required query parameter: {qp.get('name')}")
        
        if endpoint.method in [HTTPMethod.POST, HTTPMethod.PUT, HTTPMethod.PATCH]:
            if endpoint.body_schema and not body:
                warnings.append("Endpoint expects request body but none provided")
            elif body and not endpoint.body_schema:
                warnings.append("Request body provided but endpoint may not expect one")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
        }
    
    def mock_payload(self, endpoint: APIEndpointDoc) -> Dict[str, Any]:
        """
        Generate mock payload for endpoint testing.
        
        Args:
            endpoint: Endpoint documentation
        
        Returns:
            Dict: Mock payload
        """
        payload = {}
        
        if endpoint.body_schema:
            for key, value_type in endpoint.body_schema.items():
                if isinstance(value_type, str):
                    if "string" in value_type.lower():
                        payload[key] = "test_value"
                    elif "integer" in value_type.lower() or "int" in value_type.lower():
                        payload[key] = 123
                    elif "float" in value_type.lower() or "number" in value_type.lower():
                        payload[key] = 123.45
                    elif "boolean" in value_type.lower() or "bool" in value_type.lower():
                        payload[key] = True
                    elif "array" in value_type.lower():
                        payload[key] = ["item1", "item2"]
                    elif "object" in value_type.lower():
                        payload[key] = {"nested": "value"}
                    else:
                        payload[key] = "value"
        
        return payload
    
    def format_response(self, response_body: Any) -> str:
        """
        Format response body for display.
        
        Args:
            response_body: Response body
        
        Returns:
            str: Formatted response
        """
        if isinstance(response_body, dict) or isinstance(response_body, list):
            return json.dumps(response_body, indent=2)
        else:
            return str(response_body)
    
    def generate_test_report(self, test_results: list) -> Dict[str, Any]:
        """
        Generate test report from multiple test results.
        
        Args:
            test_results: List of APITestResult
        
        Returns:
            Dict: Test report
        """
        total_tests = len(test_results)
        successful_tests = sum(1 for r in test_results if r.success)
        failed_tests = total_tests - successful_tests
        
        avg_response_time = sum(r.response_time_ms for r in test_results) / total_tests if total_tests > 0 else 0
        
        status_codes = {}
        for result in test_results:
            code = result.status_code
            status_codes[code] = status_codes.get(code, 0) + 1
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "total_tests": total_tests,
            "successful_tests": successful_tests,
            "failed_tests": failed_tests,
            "success_rate": (successful_tests / total_tests * 100) if total_tests > 0 else 0,
            "average_response_time_ms": avg_response_time,
            "status_codes": status_codes,
            "test_results": [r.dict() for r in test_results],
        }
