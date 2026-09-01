#!/usr/bin/env python3
"""
Backend API tests for Car Trading Ireland - Car Status Feature
Tests the new status field (available/sold) and PATCH /api/cars/{id}/status endpoint
"""

import requests
import json
import sys
from typing import Optional

# Base URL from frontend/.env
BASE_URL = "https://a999d3c9-3d8d-4589-9c61-e86d86fe7f20.preview.emergentagent.com/api"

# Admin credentials from test_credentials.md
ADMIN_EMAIL = "admin@hamoudecartrade.ie"
ADMIN_PASSWORD = "Admin@12345"

# Test state
admin_token = None
test_car_ids = []


def log_test(scenario: str, status: str, details: str = ""):
    """Log test results"""
    symbol = "✅" if status == "PASS" else "❌"
    print(f"\n{symbol} Scenario {scenario}: {status}")
    if details:
        print(f"   {details}")


def admin_login() -> Optional[str]:
    """Login as admin and return token"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            print(f"✓ Admin login successful, token: {token[:20]}...")
            return token
        else:
            print(f"✗ Admin login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"✗ Admin login error: {e}")
        return None


def test_scenario_1():
    """GET /api/cars — verify each car includes 'status' field and 'id'"""
    try:
        response = requests.get(f"{BASE_URL}/cars", timeout=10)
        if response.status_code != 200:
            log_test("1", "FAIL", f"GET /api/cars returned {response.status_code}")
            return False
        
        cars = response.json()
        if not cars:
            log_test("1", "FAIL", "No cars returned from GET /api/cars")
            return False
        
        # Check each car has status and id
        for car in cars:
            if "status" not in car:
                log_test("1", "FAIL", f"Car {car.get('id', 'unknown')} missing 'status' field")
                return False
            if "id" not in car:
                log_test("1", "FAIL", f"Car missing 'id' field")
                return False
            # Seeded cars should default to "available"
            if car.get("status") not in ["available", "sold"]:
                log_test("1", "FAIL", f"Car {car['id']} has invalid status: {car['status']}")
                return False
        
        log_test("1", "PASS", f"All {len(cars)} cars have 'status' and 'id' fields. Sample status: {cars[0]['status']}")
        return True
    except Exception as e:
        log_test("1", "FAIL", f"Exception: {e}")
        return False


def test_scenario_2():
    """GET /api/cars/{id} — verify single car includes 'status'"""
    try:
        # First get a car ID
        response = requests.get(f"{BASE_URL}/cars", timeout=10)
        if response.status_code != 200 or not response.json():
            log_test("2", "FAIL", "Cannot get cars list to test single car")
            return False
        
        car_id = response.json()[0]["id"]
        
        # Get single car
        response = requests.get(f"{BASE_URL}/cars/{car_id}", timeout=10)
        if response.status_code != 200:
            log_test("2", "FAIL", f"GET /api/cars/{car_id} returned {response.status_code}")
            return False
        
        car = response.json()
        if "status" not in car:
            log_test("2", "FAIL", f"Single car {car_id} missing 'status' field")
            return False
        
        log_test("2", "PASS", f"Single car {car_id} has status: {car['status']}")
        return True
    except Exception as e:
        log_test("2", "FAIL", f"Exception: {e}")
        return False


def test_scenario_3():
    """POST /api/cars — test default status and explicit status"""
    global test_car_ids
    
    if not admin_token:
        log_test("3", "FAIL", "No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test 3a: Create car WITHOUT status (should default to "available")
    try:
        car_data_no_status = {
            "title": "TEST 2022 Honda Civic",
            "make": "Honda",
            "model": "Civic",
            "year": 2022,
            "price": 25000,
            "mileage": 15000,
            "fuelType": "Petrol",
            "transmission": "Manual",
            "engineSize": "1.5L",
            "bodyType": "Sedan",
            "colour": "Blue",
            "doors": 4,
            "county": "Dublin",
            "description": "Test car for status feature",
            "features": ["Test Feature"],
            "images": [],
            "featured": False
        }
        
        response = requests.post(f"{BASE_URL}/cars", json=car_data_no_status, headers=headers, timeout=10)
        if response.status_code != 200:
            log_test("3a", "FAIL", f"POST /api/cars returned {response.status_code}: {response.text}")
            return False
        
        car1 = response.json()
        test_car_ids.append(car1["id"])
        
        if car1.get("status") != "available":
            log_test("3a", "FAIL", f"Car created without status has status '{car1.get('status')}', expected 'available'")
            return False
        
        log_test("3a", "PASS", f"Car created without status defaults to 'available' (ID: {car1['id']})")
        
    except Exception as e:
        log_test("3a", "FAIL", f"Exception: {e}")
        return False
    
    # Test 3b: Create car WITH status="sold"
    try:
        car_data_with_status = {
            "title": "TEST 2021 Toyota Corolla",
            "make": "Toyota",
            "model": "Corolla",
            "year": 2021,
            "price": 22000,
            "mileage": 25000,
            "fuelType": "Hybrid",
            "transmission": "Automatic",
            "engineSize": "1.8L",
            "bodyType": "Sedan",
            "colour": "Red",
            "doors": 4,
            "county": "Cork",
            "description": "Test car with sold status",
            "features": ["Test Feature"],
            "images": [],
            "featured": False,
            "status": "sold"
        }
        
        response = requests.post(f"{BASE_URL}/cars", json=car_data_with_status, headers=headers, timeout=10)
        if response.status_code != 200:
            log_test("3b", "FAIL", f"POST /api/cars returned {response.status_code}: {response.text}")
            return False
        
        car2 = response.json()
        test_car_ids.append(car2["id"])
        
        if car2.get("status") != "sold":
            log_test("3b", "FAIL", f"Car created with status='sold' has status '{car2.get('status')}'")
            return False
        
        log_test("3b", "PASS", f"Car created with status='sold' persists as 'sold' (ID: {car2['id']})")
        return True
        
    except Exception as e:
        log_test("3b", "FAIL", f"Exception: {e}")
        return False


def test_scenario_4():
    """PUT /api/cars/{id} — update car status to 'sold'"""
    global test_car_ids
    
    if not admin_token or not test_car_ids:
        log_test("4", "FAIL", "No admin token or test cars available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    car_id = test_car_ids[0]
    
    try:
        # Get current car data
        response = requests.get(f"{BASE_URL}/cars/{car_id}", timeout=10)
        if response.status_code != 200:
            log_test("4", "FAIL", f"Cannot get car {car_id}")
            return False
        
        car_data = response.json()
        car_data["status"] = "sold"
        
        # Update with PUT
        response = requests.put(f"{BASE_URL}/cars/{car_id}", json=car_data, headers=headers, timeout=10)
        if response.status_code != 200:
            log_test("4", "FAIL", f"PUT /api/cars/{car_id} returned {response.status_code}: {response.text}")
            return False
        
        updated_car = response.json()
        if updated_car.get("status") != "sold":
            log_test("4", "FAIL", f"PUT updated car has status '{updated_car.get('status')}', expected 'sold'")
            return False
        
        log_test("4", "PASS", f"PUT /api/cars/{car_id} successfully updated status to 'sold'")
        return True
        
    except Exception as e:
        log_test("4", "FAIL", f"Exception: {e}")
        return False


def test_scenario_5():
    """PATCH /api/cars/{id}/status — toggle between sold and available"""
    global test_car_ids
    
    if not admin_token or not test_car_ids:
        log_test("5", "FAIL", "No admin token or test cars available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    car_id = test_car_ids[0]
    
    # Test 5a: PATCH to sold
    try:
        response = requests.patch(f"{BASE_URL}/cars/{car_id}/status?status=sold", headers=headers, timeout=10)
        if response.status_code != 200:
            log_test("5a", "FAIL", f"PATCH status=sold returned {response.status_code}: {response.text}")
            return False
        
        car = response.json()
        if car.get("status") != "sold":
            log_test("5a", "FAIL", f"PATCH status=sold resulted in status '{car.get('status')}'")
            return False
        
        log_test("5a", "PASS", f"PATCH /api/cars/{car_id}/status?status=sold successful")
        
    except Exception as e:
        log_test("5a", "FAIL", f"Exception: {e}")
        return False
    
    # Test 5b: PATCH back to available
    try:
        response = requests.patch(f"{BASE_URL}/cars/{car_id}/status?status=available", headers=headers, timeout=10)
        if response.status_code != 200:
            log_test("5b", "FAIL", f"PATCH status=available returned {response.status_code}: {response.text}")
            return False
        
        car = response.json()
        if car.get("status") != "available":
            log_test("5b", "FAIL", f"PATCH status=available resulted in status '{car.get('status')}'")
            return False
        
        log_test("5b", "PASS", f"PATCH /api/cars/{car_id}/status?status=available successful (toggle verified)")
        return True
        
    except Exception as e:
        log_test("5b", "FAIL", f"Exception: {e}")
        return False


def test_scenario_6():
    """PATCH /api/cars/{id}/status with invalid status — verify 400"""
    global test_car_ids
    
    if not admin_token or not test_car_ids:
        log_test("6", "FAIL", "No admin token or test cars available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    car_id = test_car_ids[0]
    
    try:
        response = requests.patch(f"{BASE_URL}/cars/{car_id}/status?status=invalidvalue", headers=headers, timeout=10)
        if response.status_code != 400:
            log_test("6", "FAIL", f"PATCH with invalid status returned {response.status_code}, expected 400")
            return False
        
        log_test("6", "PASS", f"PATCH with invalid status correctly returned 400")
        return True
        
    except Exception as e:
        log_test("6", "FAIL", f"Exception: {e}")
        return False


def test_scenario_7():
    """PATCH /api/cars/{id}/status WITHOUT auth — verify 401"""
    global test_car_ids
    
    if not test_car_ids:
        log_test("7", "FAIL", "No test cars available")
        return False
    
    car_id = test_car_ids[0]
    
    try:
        # No Authorization header
        response = requests.patch(f"{BASE_URL}/cars/{car_id}/status?status=sold", timeout=10)
        if response.status_code != 401:
            log_test("7", "FAIL", f"PATCH without auth returned {response.status_code}, expected 401")
            return False
        
        log_test("7", "PASS", f"PATCH without auth correctly returned 401 (unauthorized)")
        return True
        
    except Exception as e:
        log_test("7", "FAIL", f"Exception: {e}")
        return False


def test_scenario_8():
    """PATCH /api/cars/{nonexistent-id}/status — verify 404"""
    if not admin_token:
        log_test("8", "FAIL", "No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    bad_id = "000000000000000000000000"  # Valid ObjectId format but doesn't exist
    
    try:
        response = requests.patch(f"{BASE_URL}/cars/{bad_id}/status?status=sold", headers=headers, timeout=10)
        if response.status_code != 404:
            log_test("8", "FAIL", f"PATCH with nonexistent ID returned {response.status_code}, expected 404")
            return False
        
        log_test("8", "PASS", f"PATCH with nonexistent ID correctly returned 404")
        return True
        
    except Exception as e:
        log_test("8", "FAIL", f"Exception: {e}")
        return False


def cleanup_test_cars():
    """Delete test cars created during testing"""
    global test_car_ids
    
    if not admin_token or not test_car_ids:
        return
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    print("\n🧹 Cleaning up test cars...")
    
    for car_id in test_car_ids:
        try:
            response = requests.delete(f"{BASE_URL}/cars/{car_id}", headers=headers, timeout=10)
            if response.status_code == 200:
                print(f"   ✓ Deleted car {car_id}")
            else:
                print(f"   ✗ Failed to delete car {car_id}: {response.status_code}")
        except Exception as e:
            print(f"   ✗ Error deleting car {car_id}: {e}")
    
    test_car_ids = []


def main():
    global admin_token
    
    print("=" * 70)
    print("Car Trading Ireland - Backend API Tests")
    print("Testing Car STATUS Feature")
    print("=" * 70)
    
    # Login as admin
    print("\n🔐 Authenticating as admin...")
    admin_token = admin_login()
    if not admin_token:
        print("\n❌ CRITICAL: Admin login failed. Cannot proceed with tests.")
        sys.exit(1)
    
    # Run all test scenarios
    results = {}
    
    print("\n" + "=" * 70)
    print("Running Test Scenarios")
    print("=" * 70)
    
    results["1"] = test_scenario_1()
    results["2"] = test_scenario_2()
    results["3"] = test_scenario_3()
    results["4"] = test_scenario_4()
    results["5"] = test_scenario_5()
    results["6"] = test_scenario_6()
    results["7"] = test_scenario_7()
    results["8"] = test_scenario_8()
    
    # Cleanup
    cleanup_test_cars()
    
    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for scenario, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"Scenario {scenario}: {status}")
    
    print(f"\nTotal: {passed}/{total} scenarios passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
