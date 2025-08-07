#!/usr/bin/env python3
"""
Find Robot IP Address
Scans common IP ranges to find the UR robot
"""

import socket
import threading
import time

def scan_ip(ip, port, results):
    """Scan a single IP address"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((ip, port))
        if result == 0:
            results.append(ip)
        sock.close()
    except:
        pass

def find_robot():
    """Find UR robot on network"""
    print("🔍 Scanning for UR robot...")
    print("This may take a few minutes...")
    
    # Common IP ranges for UR robots
    base_ips = [
        "192.168.1",  # Common default
        "192.168.0",  # Alternative default
        "10.0.0",     # Some networks
        "172.16.0",   # Some networks
    ]
    
    dashboard_port = 29999
    results = []
    threads = []
    
    # Scan each base IP range
    for base_ip in base_ips:
        print(f"Scanning {base_ip}.0/24...")
        for i in range(1, 255):
            ip = f"{base_ip}.{i}"
            thread = threading.Thread(target=scan_ip, args=(ip, dashboard_port, results))
            threads.append(thread)
            thread.start()
            
            # Limit concurrent threads
            if len(threads) >= 50:
                for t in threads:
                    t.join()
                threads = []
    
    # Wait for remaining threads
    for t in threads:
        t.join()
    
    if results:
        print(f"\n✅ Found potential UR robots at:")
        for ip in results:
            print(f"   {ip}:{dashboard_port}")
        
        # Test each found IP
        print("\n🔍 Testing found IPs...")
        for ip in results:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(3)
                sock.connect((ip, dashboard_port))
                sock.send(b"programState\n")
                response = sock.recv(1024).decode()
                sock.close()
                
                if "STOPPED" in response.upper() or "RUNNING" in response.upper():
                    print(f"✅ CONFIRMED UR ROBOT: {ip}")
                    print(f"   Response: {response.strip()}")
                else:
                    print(f"⚠️  {ip} responds but may not be UR robot")
            except Exception as e:
                print(f"❌ {ip} failed test: {e}")
    else:
        print("\n❌ No UR robots found on common IP ranges")
        print("   Check your network configuration")
        print("   Make sure robot is powered on and connected")

if __name__ == "__main__":
    find_robot() 