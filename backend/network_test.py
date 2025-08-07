#!/usr/bin/env python3
"""
Network Configuration Test
Tests different IP addresses for robot connection
"""

import socket
import subprocess

def test_ip(ip):
    """Test if we can reach an IP address"""
    try:
        result = subprocess.run(['ping', '-n', '1', ip], 
                              capture_output=True, text=True, timeout=3)
        return result.returncode == 0
    except:
        return False

def test_robot_connection(ip):
    """Test robot dashboard connection"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        sock.connect((ip, 29999))
        sock.send(b"programState\n")
        response = sock.recv(1024).decode()
        sock.close()
        return "STOPPED" in response.upper() or "RUNNING" in response.upper()
    except:
        return False

def main():
    print("🔍 Testing network configurations...")
    
    # Test common robot IPs
    robot_ips = [
        "192.168.1.10",  # Your robot's IP
        "192.168.1.100", # Common UR default
        "192.168.1.2",   # Another common default
        "192.168.0.10",  # Alternative network
        "10.0.0.10",     # Another alternative
    ]
    
    print("\n📡 Testing ping connectivity:")
    for ip in robot_ips:
        if test_ip(ip):
            print(f"✅ {ip} - Reachable")
        else:
            print(f"❌ {ip} - Not reachable")
    
    print("\n🤖 Testing robot dashboard connection:")
    for ip in robot_ips:
        if test_robot_connection(ip):
            print(f"✅ {ip} - UR Robot Dashboard accessible")
        else:
            print(f"❌ {ip} - No robot dashboard")
    
    print("\n💡 Recommendations:")
    print("1. If no IPs are reachable: Check network cable connection")
    print("2. If IPs are reachable but no dashboard: Check robot power/network settings")
    print("3. If dashboard works: Update urp_trigger.py with the working IP")

if __name__ == "__main__":
    main() 