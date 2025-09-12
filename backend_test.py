#!/usr/bin/env python3
"""
Comprehensive Backend Test Suite for GCG Eyewear E-commerce Platform
Tests all API endpoints, authentication, database integration, and error handling
"""

import requests
import json
import time
from typing import Dict, Any, Optional

class GCGEyewearAPITester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.api_base = f"{self.base_url}/api"
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def test_health_check(self):
        """Test basic health check endpoint"""
        try:
            response = self.session.get(f"{self.api_base}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "GCG Eyewear" in data["message"]:
                    self.log_test("Health Check", True, "API root endpoint responding correctly", data)
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response format: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_health_endpoint(self):
        """Test dedicated health endpoint"""
        try:
            response = self.session.get(f"{self.api_base}/health")
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["status", "service", "version"]
                if all(field in data for field in expected_fields):
                    self.log_test("Health Endpoint", True, "Health endpoint responding with all required fields", data)
                    return True
                else:
                    self.log_test("Health Endpoint", False, f"Missing required fields in response: {data}")
                    return False
            else:
                self.log_test("Health Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Health Endpoint", False, f"Connection error: {str(e)}")
            return False

    def test_admin_login(self, username: str = "admin", password: str = "admin123"):
        """Test admin authentication"""
        try:
            login_data = {
                "username": username,
                "password": password
            }
            
            response = self.session.post(f"{self.api_base}/admin/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["access_token", "token_type", "expires_in", "user_info"]
                
                if all(field in data for field in required_fields):
                    self.auth_token = data["access_token"]
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    self.log_test("Admin Login", True, f"Successfully authenticated as {username}", {
                        "token_type": data["token_type"],
                        "expires_in": data["expires_in"],
                        "user_info": data["user_info"]
                    })
                    return True
                else:
                    self.log_test("Admin Login", False, f"Missing required fields in login response: {data}")
                    return False
            else:
                self.log_test("Admin Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Login error: {str(e)}")
            return False

    def test_admin_me(self):
        """Test getting current admin info"""
        if not self.auth_token:
            self.log_test("Admin Me", False, "No authentication token available")
            return False
            
        try:
            response = self.session.get(f"{self.api_base}/admin/me")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "username", "email", "role", "is_active"]
                
                if all(field in data for field in required_fields):
                    self.log_test("Admin Me", True, "Successfully retrieved admin info", {
                        "username": data["username"],
                        "role": data["role"],
                        "is_active": data["is_active"]
                    })
                    return True
                else:
                    self.log_test("Admin Me", False, f"Missing required fields: {data}")
                    return False
            else:
                self.log_test("Admin Me", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Me", False, f"Error: {str(e)}")
            return False

    def test_products_list(self):
        """Test getting products list"""
        try:
            response = self.session.get(f"{self.api_base}/products")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check first product structure
                        product = data[0]
                        required_fields = ["id", "name", "collection", "price", "sku", "gender", "type", 
                                         "frame_color", "lens_color", "materials", "main_image"]
                        
                        if all(field in product for field in required_fields):
                            self.log_test("Products List", True, f"Retrieved {len(data)} products successfully", {
                                "count": len(data),
                                "sample_product": {
                                    "name": product["name"],
                                    "collection": product["collection"],
                                    "price": product["price"],
                                    "type": product["type"]
                                }
                            })
                            return True
                        else:
                            missing_fields = [f for f in required_fields if f not in product]
                            self.log_test("Products List", False, f"Missing required fields in product: {missing_fields}")
                            return False
                    else:
                        self.log_test("Products List", True, "Products endpoint working but no products found", {"count": 0})
                        return True
                else:
                    self.log_test("Products List", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Products List", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Products List", False, f"Error: {str(e)}")
            return False

    def test_featured_products(self):
        """Test getting featured products"""
        try:
            response = self.session.get(f"{self.api_base}/products/featured")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    featured_count = len([p for p in data if p.get("is_featured", False)])
                    self.log_test("Featured Products", True, f"Retrieved {len(data)} featured products", {
                        "total_returned": len(data),
                        "actually_featured": featured_count
                    })
                    return True
                else:
                    self.log_test("Featured Products", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Featured Products", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Featured Products", False, f"Error: {str(e)}")
            return False

    def test_product_filtering(self):
        """Test product filtering functionality"""
        test_filters = [
            {"collection": "New Arrivals"},
            {"gender": "Men"},
            {"type": "Sunglasses"},
            {"is_featured": True},
            {"price_min": 100, "price_max": 500}
        ]
        
        all_passed = True
        
        for filter_params in test_filters:
            try:
                response = self.session.get(f"{self.api_base}/products", params=filter_params)
                
                if response.status_code == 200:
                    data = response.json()
                    filter_name = list(filter_params.keys())[0]
                    self.log_test(f"Product Filter - {filter_name}", True, 
                                f"Filter working, returned {len(data)} products", 
                                {"filter": filter_params, "count": len(data)})
                else:
                    self.log_test(f"Product Filter - {filter_name}", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    all_passed = False
                    
            except Exception as e:
                filter_name = list(filter_params.keys())[0]
                self.log_test(f"Product Filter - {filter_name}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_product_search(self):
        """Test product search functionality"""
        search_terms = ["Milano", "Aviator", "Classic", "Vintage"]
        
        all_passed = True
        
        for term in search_terms:
            try:
                response = self.session.get(f"{self.api_base}/products/search", params={"q": term})
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_test(f"Product Search - '{term}'", True, 
                                f"Search working, returned {len(data)} results", 
                                {"search_term": term, "count": len(data)})
                else:
                    self.log_test(f"Product Search - '{term}'", False, 
                                f"HTTP {response.status_code}: {response.text}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Product Search - '{term}'", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_collections_active(self):
        """Test getting active collections"""
        try:
            response = self.session.get(f"{self.api_base}/collections/active")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        collection = data[0]
                        required_fields = ["id", "name", "slug", "is_active"]
                        
                        if all(field in collection for field in required_fields):
                            active_count = len([c for c in data if c.get("is_active", False)])
                            self.log_test("Active Collections", True, 
                                        f"Retrieved {len(data)} collections, {active_count} active", {
                                "total": len(data),
                                "active": active_count,
                                "sample": {"name": collection["name"], "slug": collection["slug"]}
                            })
                            return True
                        else:
                            missing_fields = [f for f in required_fields if f not in collection]
                            self.log_test("Active Collections", False, f"Missing fields: {missing_fields}")
                            return False
                    else:
                        self.log_test("Active Collections", True, "Collections endpoint working but no collections found")
                        return True
                else:
                    self.log_test("Active Collections", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Active Collections", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Active Collections", False, f"Error: {str(e)}")
            return False

    def test_admin_stats(self):
        """Test admin statistics endpoint"""
        if not self.auth_token:
            self.log_test("Admin Stats", False, "No authentication token available")
            return False
            
        try:
            response = self.session.get(f"{self.api_base}/admin/stats")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Admin Stats", True, "Successfully retrieved admin statistics", data)
                return True
            elif response.status_code == 401:
                self.log_test("Admin Stats", False, "Authentication failed - token may be invalid")
                return False
            else:
                self.log_test("Admin Stats", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Stats", False, f"Error: {str(e)}")
            return False

    def test_pagination(self):
        """Test pagination parameters"""
        try:
            # Test with different pagination parameters
            response1 = self.session.get(f"{self.api_base}/products", params={"limit": 2, "skip": 0})
            response2 = self.session.get(f"{self.api_base}/products", params={"limit": 2, "skip": 2})
            
            if response1.status_code == 200 and response2.status_code == 200:
                data1 = response1.json()
                data2 = response2.json()
                
                # Check if pagination is working (different results)
                if len(data1) <= 2 and len(data2) <= 2:
                    # Check if results are different (assuming we have more than 2 products)
                    if len(data1) > 0 and len(data2) > 0:
                        different = data1[0]["id"] != data2[0]["id"] if len(data1) > 0 and len(data2) > 0 else True
                        if different:
                            self.log_test("Pagination", True, "Pagination working correctly", {
                                "page1_count": len(data1),
                                "page2_count": len(data2)
                            })
                            return True
                        else:
                            self.log_test("Pagination", False, "Pagination not working - same results returned")
                            return False
                    else:
                        self.log_test("Pagination", True, "Pagination parameters accepted", {
                            "page1_count": len(data1),
                            "page2_count": len(data2)
                        })
                        return True
                else:
                    self.log_test("Pagination", False, f"Limit not respected: got {len(data1)} and {len(data2)} items")
                    return False
            else:
                self.log_test("Pagination", False, f"HTTP errors: {response1.status_code}, {response2.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Pagination", False, f"Error: {str(e)}")
            return False

    def test_error_handling(self):
        """Test error handling for various scenarios"""
        error_tests = [
            {
                "name": "Invalid Endpoint",
                "url": f"{self.api_base}/nonexistent",
                "expected_status": 404
            },
            {
                "name": "Invalid Product ID",
                "url": f"{self.api_base}/products/invalid-id-12345",
                "expected_status": 404
            },
            {
                "name": "Invalid Collection ID",
                "url": f"{self.api_base}/collections/invalid-id-12345",
                "expected_status": 404
            }
        ]
        
        all_passed = True
        
        for test in error_tests:
            try:
                response = self.session.get(test["url"])
                
                if response.status_code == test["expected_status"]:
                    self.log_test(f"Error Handling - {test['name']}", True, 
                                f"Correctly returned HTTP {response.status_code}")
                else:
                    self.log_test(f"Error Handling - {test['name']}", False, 
                                f"Expected {test['expected_status']}, got {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Error Handling - {test['name']}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_authentication_protection(self):
        """Test that protected endpoints require authentication"""
        # Temporarily remove auth token
        original_headers = self.session.headers.copy()
        if "Authorization" in self.session.headers:
            del self.session.headers["Authorization"]
        
        protected_endpoints = [
            f"{self.api_base}/admin/me",
            f"{self.api_base}/admin/stats",
            f"{self.api_base}/admin/products"
        ]
        
        all_passed = True
        
        for endpoint in protected_endpoints:
            try:
                response = self.session.get(endpoint)
                
                if response.status_code == 401:
                    endpoint_name = endpoint.split("/")[-1]
                    self.log_test(f"Auth Protection - {endpoint_name}", True, 
                                "Correctly requires authentication")
                else:
                    endpoint_name = endpoint.split("/")[-1]
                    self.log_test(f"Auth Protection - {endpoint_name}", False, 
                                f"Expected 401, got {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                endpoint_name = endpoint.split("/")[-1]
                self.log_test(f"Auth Protection - {endpoint_name}", False, f"Error: {str(e)}")
                all_passed = False
        
        # Restore original headers
        self.session.headers.update(original_headers)
        
        return all_passed

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting GCG Eyewear Backend API Tests")
        print("=" * 60)
        
        # Core API Tests
        print("\n📋 Core API Endpoints:")
        self.test_health_check()
        self.test_health_endpoint()
        
        # Authentication Tests
        print("\n🔐 Authentication System:")
        auth_success = self.test_admin_login()
        if auth_success:
            self.test_admin_me()
            self.test_admin_stats()
        
        # Product Management Tests
        print("\n📦 Product Management:")
        self.test_products_list()
        self.test_featured_products()
        self.test_product_filtering()
        self.test_product_search()
        self.test_pagination()
        
        # Collections Tests
        print("\n📚 Collections:")
        self.test_collections_active()
        
        # Error Handling Tests
        print("\n⚠️  Error Handling:")
        self.test_error_handling()
        self.test_authentication_protection()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = len([t for t in self.test_results if t["success"]])
        failed = len([t for t in self.test_results if not t["success"]])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if failed > 0:
            print("\n🔍 Failed Tests:")
            for test in self.test_results:
                if not test["success"]:
                    print(f"  • {test['test']}: {test['details']}")
        
        return passed, failed, total

def main():
    """Main test execution"""
    # Use the production URL from frontend/.env
    BASE_URL = "https://gcgelegance.preview.emergentagent.com"
    
    print(f"Testing GCG Eyewear API at: {BASE_URL}")
    
    tester = GCGEyewearAPITester(BASE_URL)
    passed, failed, total = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    exit(main())