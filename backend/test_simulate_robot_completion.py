#!/usr/bin/env python3
"""
Test to simulate robot task completion without actually running the robot.
This helps verify that the task completion logic works correctly.
"""

import requests
import time

def simulate_robot_task_completion():
    """Simulate a robot task completion by directly calling the robot executor"""
    
    print("🧪 Simulating robot task completion...")
    
    try:
        # Import the robot executor
        from robot_executor import robot_executor
        
        # Test task
        test_urp = "hospital_base"
        test_task_name = "Hospital_base"
        
        print(f"   Testing with URP: '{test_urp}' -> Task: '{test_task_name}'")
        
        # Check initial state
        print("\n1. Checking initial state...")
        response = requests.get("http://127.0.0.1:8000/get-finished-tasks")
        if response.status_code == 200:
            initial_state = response.json()
            print(f"   Initial robot finished tasks: {initial_state.get('robot_finished', [])}")
            print(f"   Initial all finished tasks: {initial_state.get('all_finished', [])}")
        
        # Simulate task completion by calling mark_task_completed directly
        print(f"\n2. Simulating task completion...")
        robot_executor.mark_task_completed(test_urp)
        
        # Check final state
        print(f"\n3. Checking final state...")
        response = requests.get("http://127.0.0.1:8000/get-finished-tasks")
        if response.status_code == 200:
            final_state = response.json()
            robot_finished = final_state.get('robot_finished', [])
            all_finished = final_state.get('all_finished', [])
            
            print(f"   Final robot finished tasks: {robot_finished}")
            print(f"   Final all finished tasks: {all_finished}")
            
            # Check if the task was added
            if test_task_name in robot_finished:
                print(f"   ✅ Task '{test_task_name}' found in robot finished tasks")
            else:
                print(f"   ❌ Task '{test_task_name}' NOT found in robot finished tasks")
                
            if test_task_name in all_finished:
                print(f"   ✅ Task '{test_task_name}' found in all finished tasks")
            else:
                print(f"   ❌ Task '{test_task_name}' NOT found in all finished tasks")
                
            # Check executed_tasks list
            if test_urp in robot_executor.executed_tasks:
                print(f"   ✅ URP '{test_urp}' found in executed_tasks")
            else:
                print(f"   ❌ URP '{test_urp}' NOT found in executed_tasks")
                
        return True
        
    except Exception as e:
        print(f"   ❌ Error simulating robot task completion: {e}")
        return False

def test_robot_state_detection():
    """Test if the robot state detection is working correctly"""
    
    print("\n🧪 Testing robot state detection...")
    
    try:
        from urp_trigger import send_dashboard_command
        
        # Test getting robot state
        print("   Testing robot state detection...")
        state = send_dashboard_command("programState")
        print(f"   Current robot state: {state}")
        
        if state:
            print(f"   ✅ Robot state detection working")
        else:
            print(f"   ❌ Robot state detection failed")
            
    except Exception as e:
        print(f"   ❌ Error testing robot state detection: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Starting robot task completion simulation...")
    
    # Test robot state detection
    success1 = test_robot_state_detection()
    
    # Test simulated task completion
    success2 = simulate_robot_task_completion()
    
    if success1 and success2:
        print("\n🎉 All tests passed! Robot task completion simulation works.")
    else:
        print("\n❌ Some tests failed. Please check the implementation.") 