#!/usr/bin/env python3
"""
Simple Robot Connection Test
"""

import socket
import time

ROBOT_IP = "192.168.1.10"
DASHBOARD_PORT = 29999

def test_connection():
    print(f"🔍 Testing connection to {ROBOT_IP}:{DASHBOARD_PORT}")
    
    try:
        # Test 1: Basic socket connection
        print("1. Testing basic socket connection...")
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        sock.connect((ROBOT_IP, DASHBOARD_PORT))
        print("   ✅ Socket connection successful")
        
        # Test 2: Send initial command
        print("2. Testing initial command...")
        sock.send(b"programState\n")
        response = sock.recv(1024).decode()
        print(f"   Response: {response.strip()}")
        
        # Test 3: Send stop command
        print("3. Testing stop command...")
        sock.send(b"stop\n")
        response = sock.recv(1024).decode()
        print(f"   Response: {response.strip()}")
        
        sock.close()
        print("✅ All connection tests passed!")
        return True
        
    except socket.timeout:
        print("❌ Connection timed out")
        print("   Possible causes:")
        print("   - Robot is not powered on")
        print("   - Network cable not connected")
        print("   - Firewall blocking connection")
        print("   - Wrong IP address")
        return False
        
    except ConnectionRefusedError:
        print("❌ Connection refused")
        print("   - Robot dashboard server not running")
        print("   - Wrong port number")
        return False
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def ping_test():
    """Test if we can ping the robot"""
    import subprocess
    print(f"\n🔍 Pinging {ROBOT_IP}...")
    
    try:
        result = subprocess.run(['ping', '-n', '1', ROBOT_IP], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("✅ Ping successful - robot is reachable")
            return True
        else:
            print("❌ Ping failed - robot not reachable")
            return False
    except Exception as e:
        print(f"❌ Ping test failed: {e}")
        return False

if __name__ == "__main__":
    print("🤖 Simple Robot Connection Test")
    print("=" * 40)
    
    # Test ping first
    ping_test()
    
    # Test socket connection
    test_connection() 