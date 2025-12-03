"""
API Code Examples Generator
Generates code examples in multiple languages for API endpoints.
"""

from typing import Dict, List
from .apidocs_schema import APIEndpointDoc, APICodeExample, HTTPMethod


class CodeExampleGenerator:
    """Generate code examples in multiple languages."""
    
    def __init__(self, api_base_url: str = "https://api.ghostquant.ai"):
        self.api_base_url = api_base_url
    
    def generate_python_requests(self, endpoint: APIEndpointDoc) -> str:
        """Generate Python requests example."""
        if endpoint.method == HTTPMethod.GET:
            code = f'''import requests

url = "{self.api_base_url}{endpoint.path}"
'''
            if endpoint.query_params:
                code += '''
params = {
'''
                for param in endpoint.query_params[:3]:
                    code += f'    "{param["name"]}": "value",\n'
                code += '''}

response = requests.get(url, params=params)
'''
            else:
                code += '''
response = requests.get(url)
'''
        else:  # POST, PUT, etc.
            code = f'''import requests

url = "{self.api_base_url}{endpoint.path}"

'''
            if endpoint.body_schema:
                code += '''payload = {
'''
                for key in list(endpoint.body_schema.keys())[:5]:
                    code += f'    "{key}": "value",\n'
                code += '''}

response = requests.post(url, json=payload)
'''
            else:
                code += '''response = requests.post(url)
'''
        
        code += '''
if response.status_code == 200:
    data = response.json()
    print(data)
else:
    print(f"Error: {response.status_code}")
'''
        return code
    
    def generate_python_async(self, endpoint: APIEndpointDoc) -> str:
        """Generate Python async example."""
        if endpoint.method == HTTPMethod.GET:
            code = f'''import aiohttp
import asyncio

async def {endpoint.endpoint_id}():
    """
    {endpoint.summary}
    """
    url = "{self.api_base_url}{endpoint.path}"
    
    async with aiohttp.ClientSession() as session:
'''
            if endpoint.query_params:
                code += '''        params = {
'''
                for param in endpoint.query_params[:3]:
                    code += f'            "{param["name"]}": "value",\n'
                code += '''        }
        async with session.get(url, params=params) as response:
'''
            else:
                code += '''        async with session.get(url) as response:
'''
        else:
            code = f'''import aiohttp
import asyncio

async def {endpoint.endpoint_id}():
    """
    {endpoint.summary}
    """
    url = "{self.api_base_url}{endpoint.path}"
    
'''
            if endpoint.body_schema:
                code += '''    payload = {
'''
                for key in list(endpoint.body_schema.keys())[:5]:
                    code += f'        "{key}": "value",\n'
                code += '''    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
'''
            else:
                code += '''    async with aiohttp.ClientSession() as session:
        async with session.post(url) as response:
'''
        
        code += '''            if response.status == 200:
                data = await response.json()
                return data
            else:
                print(f"Error: {response.status}")
                return None

asyncio.run({endpoint.endpoint_id}())
'''
        return code
    
    def generate_javascript_fetch(self, endpoint: APIEndpointDoc) -> str:
        """Generate JavaScript fetch example."""
        if endpoint.method == HTTPMethod.GET:
            code = f'''// {endpoint.summary}
const url = "{self.api_base_url}{endpoint.path}";
'''
            if endpoint.query_params:
                code += '''
const params = new URLSearchParams({
'''
                for param in endpoint.query_params[:3]:
                    code += f'  {param["name"]}: "value",\n'
                code += '''});

fetch(`${url}?${params}`)
'''
            else:
                code += '''
fetch(url)
'''
        else:
            code = f'''// {endpoint.summary}
const url = "{self.api_base_url}{endpoint.path}";

'''
            if endpoint.body_schema:
                code += '''const payload = {
'''
                for key in list(endpoint.body_schema.keys())[:5]:
                    code += f'  {key}: "value",\n'
                code += '''};

fetch(url, {
  method: "{method}",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
})
'''.format(method=endpoint.method.value)
            else:
                code += f'''fetch(url, {{
  method: "{endpoint.method.value}",
}})
'''
        
        code += '''  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error("Error:", error);
  });
'''
        return code
    
    def generate_javascript_node(self, endpoint: APIEndpointDoc) -> str:
        """Generate Node.js example."""
        if endpoint.method == HTTPMethod.GET:
            code = f'''// {endpoint.summary}
const axios = require('axios');

const url = "{self.api_base_url}{endpoint.path}";
'''
            if endpoint.query_params:
                code += '''
const params = {
'''
                for param in endpoint.query_params[:3]:
                    code += f'  {param["name"]}: "value",\n'
                code += '''};

axios.get(url, { params })
'''
            else:
                code += '''
axios.get(url)
'''
        else:
            code = f'''// {endpoint.summary}
const axios = require('axios');

const url = "{self.api_base_url}{endpoint.path}";

'''
            if endpoint.body_schema:
                code += '''const payload = {
'''
                for key in list(endpoint.body_schema.keys())[:5]:
                    code += f'  {key}: "value",\n'
                code += '''};

axios.post(url, payload)
'''
            else:
                code += '''axios.post(url)
'''
        
        code += '''  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error("Error:", error.message);
  });
'''
        return code
    
    def generate_curl(self, endpoint: APIEndpointDoc) -> str:
        """Generate cURL example."""
        if endpoint.method == HTTPMethod.GET:
            code = f'''# {endpoint.summary}
curl -X GET "{self.api_base_url}{endpoint.path}"'''
            
            if endpoint.query_params:
                params = []
                for param in endpoint.query_params[:3]:
                    params.append(f'{param["name"]}=value')
                code += '?' + '&'.join(params)
            
            code += ''' \\
  -H "Accept: application/json"
'''
        else:
            code = f'''# {endpoint.summary}
curl -X {endpoint.method.value} "{self.api_base_url}{endpoint.path}" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json"'''
            
            if endpoint.body_schema:
                code += ''' \\
  -d '{
'''
                items = list(endpoint.body_schema.items())[:5]
                for i, (key, value) in enumerate(items):
                    comma = ',' if i < len(items) - 1 else ''
                    code += f'    "{key}": "value"{comma}\n'
                code += "  }'\n"
            else:
                code += '\n'
        
        return code
    
    def generate_go(self, endpoint: APIEndpointDoc) -> str:
        """Generate Go example."""
        if endpoint.method == HTTPMethod.GET:
            code = f'''package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
    "net/url"
)

// {endpoint.summary}
func main() {{
    baseURL := "{self.api_base_url}{endpoint.path}"
'''
            if endpoint.query_params:
                code += '''    
    params := url.Values{}
'''
                for param in endpoint.query_params[:3]:
                    code += f'    params.Add("{param["name"]}", "value")\n'
                code += '''    
    fullURL := baseURL + "?" + params.Encode()
    
    resp, err := http.Get(fullURL)
'''
            else:
                code += '''    
    resp, err := http.Get(baseURL)
'''
        else:
            code = f'''package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

// {endpoint.summary}
func main() {{
    url := "{self.api_base_url}{endpoint.path}"
    
'''
            if endpoint.body_schema:
                code += '''    payload := map[string]interface{}{
'''
                for key in list(endpoint.body_schema.keys())[:5]:
                    code += f'        "{key}": "value",\n'
                code += '''    }
    
    jsonData, err := json.Marshal(payload)
    if err != nil {
        fmt.Println("Error marshaling JSON:", err)
        return
    }
    
    resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
'''
            else:
                code += '''    resp, err := http.Post(url, "application/json", nil)
'''
        
        code += '''    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    defer resp.Body.Close()
    
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        fmt.Println("Error reading response:", err)
        return
    }
    
    var result map[string]interface{}
    json.Unmarshal(body, &result)
    fmt.Println(result)
}
'''
        return code
    
    def generate_java(self, endpoint: APIEndpointDoc) -> str:
        """Generate Java example."""
        if endpoint.method == HTTPMethod.GET:
            code = f'''import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

// {endpoint.summary}
public class GhostQuantAPI {{
    public static void main(String[] args) throws Exception {{
        String url = "{self.api_base_url}{endpoint.path}";
'''
            if endpoint.query_params:
                code += '''        
        // Add query parameters
        url += "?";
'''
                for i, param in enumerate(endpoint.query_params[:3]):
                    if i > 0:
                        code += '        url += "&";\n'
                    code += f'        url += "{param["name"]}=value";\n'
            
            code += '''        
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .GET()
            .build();
'''
        else:
            code = f'''import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

// {endpoint.summary}
public class GhostQuantAPI {{
    public static void main(String[] args) throws Exception {{
        String url = "{self.api_base_url}{endpoint.path}";
        
'''
            if endpoint.body_schema:
                code += '''        String jsonPayload = "{";
'''
                items = list(endpoint.body_schema.keys())[:5]
                for i, key in enumerate(items):
                    comma = ',' if i < len(items) - 1 else ''
                    code += f'        jsonPayload += "\\"{key}\\": \\"value\\"{comma}";\n'
                code += '''        jsonPayload += "}";
        
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();
'''
            else:
                code += '''        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .POST(HttpRequest.BodyPublishers.noBody())
            .build();
'''
        
        code += '''        
        HttpResponse<String> response = client.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        System.out.println("Status: " + response.statusCode());
        System.out.println("Response: " + response.body());
    }
}
'''
        return code
    
    def generate_all_examples(self, endpoint: APIEndpointDoc) -> Dict[str, str]:
        """Generate all code examples for an endpoint."""
        return {
            "python_requests": self.generate_python_requests(endpoint),
            "python_async": self.generate_python_async(endpoint),
            "javascript_fetch": self.generate_javascript_fetch(endpoint),
            "javascript_node": self.generate_javascript_node(endpoint),
            "curl": self.generate_curl(endpoint),
            "go": self.generate_go(endpoint),
            "java": self.generate_java(endpoint),
        }
    
    def get_language_examples(self, language: str) -> List[APICodeExample]:
        """Get all examples for a specific language."""
        from .apidocs_registry import get_all_endpoints
        
        examples = []
        endpoints = get_all_endpoints()
        
        for endpoint in endpoints[:10]:  # Sample first 10
            if language == "python":
                code = self.generate_python_requests(endpoint)
            elif language == "javascript":
                code = self.generate_javascript_fetch(endpoint)
            elif language == "curl":
                code = self.generate_curl(endpoint)
            elif language == "go":
                code = self.generate_go(endpoint)
            elif language == "java":
                code = self.generate_java(endpoint)
            else:
                continue
            
            example = APICodeExample(
                example_id=f"{endpoint.endpoint_id}_{language}",
                endpoint_id=endpoint.endpoint_id,
                language=language,
                title=f"{endpoint.name} - {language}",
                code=code,
                description=endpoint.summary,
            )
            examples.append(example)
        
        return examples
