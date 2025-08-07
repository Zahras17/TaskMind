#!/usr/bin/env python3
"""
Simple test to verify that the robot finished task endpoint works correctly.
"""

import requests
import time

def test_robot_finished_task_endpoint():
    """Test the robot finished task endpoint directly"""
    
    base_url = "http://127.0.0.1:8000"
    
    print("🧪 Testing robot finished task endpoint...")
    
    # Step 1: Check initial state
    print("\n1. Checking initial finished tasks state...")
    try:
        response = requests.get(f"{base_url}/get-finished-tasks")
        if response.status_code == 200:
            initial_state = response.json()
            print(f"   Initial robot finished tasks: {initial_state.get('robot_finished', [])}")
            print(f"   Initial all finished tasks: {initial_state.get('all_finished', [])}")
        else:
            print(f"   ❌ Failed to get initial state: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error getting initial state: {e}")
        return False
    
    # Step 2: Manually trigger robot finished task
    print("\n2. Manually triggering robot finished task...")
    test_task = "Hospital_base"
    
    try:
        response = requests.post(f"{base_url}/add-robot-finished-task?task_name={test_task}")
        print(f"   Response status: {response.status_code}")
        print(f"   Response content: {response.text}")
        
        if response.status_code == 200:
            print(f"   ✅ Successfully added '{test_task}' to robot finished tasks")
        else:
            print(f"   ❌ Failed to add task: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error adding robot finished task: {e}")
        return False
    
    # Step 3: Check final state
    print("\n3. Checking final finished tasks state...")
    try:
        response = requests.get(f"{base_url}/get-finished-tasks")
        if response.status_code == 200:
            final_state = response.json()
            robot_finished = final_state.get('robot_finished', [])
            all_finished = final_state.get('all_finished', [])
            
            print(f"   Final robot finished tasks: {robot_finished}")
            print(f"   Final all finished tasks: {all_finished}")
            
            # Verify the task is in both lists
            if test_task in robot_finished:
                print(f"   ✅ Task '{test_task}' found in robot finished tasks")
            else:
                print(f"   ❌ Task '{test_task}' NOT found in robot finished tasks")
                return False
                
            if test_task in all_finished:
                print(f"   ✅ Task '{test_task}' found in all finished tasks")
            else:
                print(f"   ❌ Task '{test_task}' NOT found in all finished tasks")
                return False
                
        else:
            print(f"   ❌ Failed to get final state: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error getting final state: {e}")
        return False
    
    print("\n🎉 Robot finished task endpoint test completed successfully!")
    return True

def test_robot_executor_mark_task_completed():
    """Test the mark_task_completed method directly"""
    
    print("\n🧪 Testing robot executor mark_task_completed method...")
    
    try:
        from robot_executor import robot_executor
        
        # Test task
        test_urp = "hospital_base"
        
        print(f"   Testing mark_task_completed with URP: '{test_urp}'")
        
        # Call the method directly
        robot_executor.mark_task_completed(test_urp)
        
        print(f"   ✅ mark_task_completed method executed successfully")
        
        # Check if the task was added to executed_tasks
        if test_urp in robot_executor.executed_tasks:
            print(f"   ✅ Task '{test_urp}' found in executed_tasks")
        else:
            print(f"   ❌ Task '{test_urp}' NOT found in executed_tasks")
            
    except Exception as e:
        print(f"   ❌ Error testing mark_task_completed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Starting robot finished task tests...")
    
    # Test the endpoint directly
    success1 = test_robot_finished_task_endpoint()
    
    # Test the robot executor method
    success2 = test_robot_executor_mark_task_completed()
    
    if success1 and success2:
        print("\n🎉 All tests passed! Robot finished task functionality is working.")
    else:
        print("\n❌ Some tests failed. Please check the implementation.") 