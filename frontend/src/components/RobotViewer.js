// this file is useful when you want to present the digital twin of robot in the interface


import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import URDFLoader from 'urdf-loader';

const RobotViewer = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Setup scene
    const scene = new THREE.Scene();

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 2;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });  // 🔥 alpha true for transparency
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // 🔥 transparent background
    mountRef.current.appendChild(renderer.domElement);

    // Setup light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Load URDF
    const loader = new URDFLoader();
    loader.load('/urdf/ur3e_clean.urdf', (robot) => {
      robot.rotation.x = Math.PI / 2;
      robot.scale.set(1.5, 1.5, 1.5);
      scene.add(robot);
      console.log("✅ Robot loaded successfully");
    });

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (mountRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
    />
  );
};

export default RobotViewer;
