#!/usr/bin/env python3
"""
Test to check if the robot is connected and if state detection is working.
"""

import socket
import time

def test_robot_connection():
    """Test if the robot is connected"""
    
    print("🧪 Testing robot connection...")
    
    ROBOT_IP = "192.168.1.10"
    DASHBOARD_PORT = 29999
    
    try:
        # Test basic socket connection
        print(f"   Testing connection to {ROBOT_IP}:{DASHBOARD_PORT}...")
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(5)  # 5 second timeout
            s.connect((ROBOT_IP, DASHBOARD_PORT))
            print(f"   ✅ Successfully connected to robot")
            
            # Test dashboard communication
            time.sleep(0.1)
            s.recv(1024)  # Clear initial message
            s.sendall(b"programState\n")
            time.sleep(0.1)
            response = s.recv(1024).decode().strip()
            print(f"   Robot state: {response}")
            
            if response:
                print(f"   ✅ Robot communication working")
                return True
            else:
                print(f"   ❌ Robot communication failed")
                return False
                
    except socket.timeout:
        print(f"   ❌ Connection timeout - robot not reachable")
        return False
    except ConnectionRefusedError:
        print(f"   ❌ Connection refused - robot not listening on port {DASHBOARD_PORT}")
        return False
    except Exception as e:
        print(f"   ❌ Connection error: {e}")
        return False

def test_urp_trigger():
    """Test the urp_trigger module"""
    
    print("\n🧪 Testing urp_trigger module...")
    
    try:
        from urp_trigger import send_dashboard_command
        
        # Test getting robot state
        print("   Testing send_dashboard_command...")
        state = send_dashboard_command("programState")
        print(f"   Robot state via urp_trigger: {state}")
        
        if state is not None:
            print(f"   ✅ urp_trigger working")
            return True
        else:
            print(f"   ❌ urp_trigger failed")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing urp_trigger: {e}")
        return False

def test_robot_executor_without_robot():
    """Test robot executor without actual robot connection"""
    
    print("\n🧪 Testing robot executor without robot...")
    
    try:
        from robot_executor import robot_executor
        
        # Test task mapping
        print("   Testing task mapping...")
        robot_executor.load_task_mapping()
        print(f"   Task mapping: {robot_executor.task_mapping}")
        
        # Test mark_task_completed without robot
        test_urp = "hospital_base"
        print(f"   Testing mark_task_completed with '{test_urp}'...")
        robot_executor.mark_task_completed(test_urp)
        print(f"   ✅ mark_task_completed executed successfully")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error testing robot executor: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting robot connection tests...")
    
    # Test basic connection
    connection_ok = test_robot_connection()
    
    # Test urp_trigger
    urp_trigger_ok = test_urp_trigger()
    
    # Test robot executor
    executor_ok = test_robot_executor_without_robot()
    
    if connection_ok and urp_trigger_ok and executor_ok:
        print("\n🎉 All tests passed! Robot connection and functionality working.")
    else:
        print("\n❌ Some tests failed.")
        if not connection_ok:
            print("   - Robot connection issue detected")
        if not urp_trigger_ok:
            print("   - urp_trigger module issue detected")
        if not executor_ok:
            print("   - Robot executor issue detected") 