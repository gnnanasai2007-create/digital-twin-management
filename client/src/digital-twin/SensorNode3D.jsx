import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export default function SensorNode3D({ position, label, value, unit, status = 'NORMAL', onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const statusColor = status === 'CRITICAL' ? '#ef4444' : status === 'WARNING' ? '#f59e0b' : '#10b981';

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 4) * 0.15;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position}>
      {/* Outer Pulse Halo */}
      <mesh ref={meshRef} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color={statusColor} transparent opacity={0.4} wireframe />
      </mesh>

      {/* Solid Core Sphere */}
      <mesh onClick={onClick}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={0.8} />
      </mesh>

      {/* Floating 3D HTML Tag */}
      <Html distanceFactor={8} position={[0, 0.35, 0]} center>
        <div
          onClick={onClick}
          className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-all border ${
            status === 'CRITICAL'
              ? 'bg-red-950/90 text-red-300 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
              : status === 'WARNING'
              ? 'bg-amber-950/90 text-amber-300 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
              : 'bg-slate-900/90 text-emerald-300 border-emerald-500/50'
          } ${hovered ? 'scale-110 z-20 ring-2 ring-cyan-400' : ''}`}
        >
          <span className="font-semibold text-slate-400 mr-1">{label}:</span>
          <span className="font-bold">{value !== undefined ? `${value} ${unit || ''}` : 'Active'}</span>
        </div>
      </Html>
    </group>
  );
}
