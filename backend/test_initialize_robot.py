#!/usr/bin/env python3
"""
Test script for the Initialize Robot functionality
"""

import requests
import json

def test_initialize_robot():
    """Test the initialize robot endpoint"""
    base_url = "http://127.0.0.1:8000"
    
    try:
        # Test the initialize robot endpoint
        print("🧪 Testing Initialize Robot endpoint...")
        response = requests.post(f"{base_url}/robot/initialize")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Initialize robot successful!")
            print(f"   Status: {data.get('status')}")
            print(f"   Task type: {data.get('task_type')}")
            print(f"   Joint positions: {data.get('joint_positions')}")
            print(f"   Gripper activated: {data.get('gripper_activated')}")
        else:
            print(f"❌ Initialize robot failed with status code: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the backend server. Make sure it's running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Error testing initialize robot: {e}")

def test_execution_state():
    """Test the execution state endpoint to see current tasks"""
    base_url = "http://127.0.0.1:8000"
    
    try:
        print("\n🧪 Testing Execution State endpoint...")
        response = requests.get(f"{base_url}/get-execution-state")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Execution state retrieved!")
            print(f"   Current human task: {data.get('current_human_task')}")
            print(f"   Current robot task: {data.get('current_robot_task')}")
            print(f"   Human assigned tasks: {data.get('human_assigned_tasks')}")
            print(f"   Robot assigned tasks: {data.get('robot_assigned_tasks')}")
        else:
            print(f"❌ Execution state failed with status code: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the backend server.")
    except Exception as e:
        print(f"❌ Error testing execution state: {e}")

if __name__ == "__main__":
    print("🚀 Testing Initialize Robot Functionality")
    print("=" * 50)
    
    test_execution_state()
    test_initialize_robot()
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!") 