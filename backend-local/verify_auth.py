import requests
import json
import uuid

BASE_URL = 'http://localhost:5000/api/auth'

def test_registration():
    print("\n--- Testing Registration ---")
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "testpassword123"
    
    payload = {
        "email": email,
        "password": password,
        "fullName": "Test User",
        "role": "borrower"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=payload)
        print(f"Status: {response.status_code}")
        try:
            print(f"Response: {response.json()}")
        except:
            print(f"Response Text: {response.text}")
        
        if response.status_code == 201:
            print("✅ Registration Successful")
            return email, password
        else:
            print("❌ Registration Failed")
            return None, None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None, None

def test_login(email, password):
    print("\n--- Testing Login ---")
    if not email or not password:
        print("Skipping login test due to registration failure")
        return

    payload = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login Successful")
            print(f"Token received: {data.get('token') is not None}")
            print(f"User Role: {data.get('role')}")
        else:
            print(f"❌ Login Failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Verifying Auth Service with Local DB")
    email, password = test_registration()
    test_login(email, password)
