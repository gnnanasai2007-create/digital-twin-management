import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import SensorNode3D from './SensorNode3D';

export default function MachineryModel({
  type = 'PUMP',
  status = 'HEALTHY',
  sensors = [],
  onSelectComponent,
  selectedComponentName,
}) {
  const shaftRef = useRef();
  const fanRef = useRef();
  const spindleRef = useRef();

  // Rotate shafts and fans based on health/status
  useFrame((_, delta) => {
    const speedMultiplier = status === 'OFFLINE' ? 0 : status === 'CRITICAL' ? 0.4 : 1.0;
    if (shaftRef.current) shaftRef.current.rotation.x += delta * 6 * speedMultiplier;
    if (fanRef.current) fanRef.current.rotation.z += delta * 12 * speedMultiplier;
    if (spindleRef.current) spindleRef.current.rotation.y += delta * 8 * speedMultiplier;
  });

  const getSensor = (typeKey) => sensors.find((s) => s.type === typeKey);
  const tempSensor = getSensor('TEMPERATURE');
  const vibSensor = getSensor('VIBRATION');
  const pressSensor = getSensor('PRESSURE');
  const rpmSensor = getSensor('RPM');

  // Highlight color for selected component
  const getMaterialProps = (compName, defaultColor = '#334155', metalness = 0.8, roughness = 0.3) => {
    const isSelected = selectedComponentName === compName;
    return {
      color: isSelected ? '#06b6d4' : defaultColor,
      emissive: isSelected ? '#0891b2' : status === 'CRITICAL' ? '#7f1d1d' : '#000000',
      emissiveIntensity: isSelected ? 0.5 : status === 'CRITICAL' ? 0.3 : 0,
      metalness,
      roughness,
    };
  };

  // 1. PUMP MODEL
  if (type === 'PUMP') {
    return (
      <group position={[0, -0.5, 0]}>
        {/* Base Plate */}
        <mesh
          position={[0, 0.1, 0]}
          onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Cast Iron Mounting Skid', 'Base Frame'); }}
        >
          <boxGeometry args={[4.2, 0.2, 1.8]} />
          <meshStandardMaterial {...getMaterialProps('Cast Iron Mounting Skid', '#1e293b', 0.9, 0.4)} />
        </mesh>

        {/* Electric Motor Housing */}
        <group position={[-1.1, 0.9, 0]}>
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Motor Stator Housing', 'Electric Motor'); }}
          >
            <cylinderGeometry args={[0.65, 0.65, 1.4, 24]} />
            <meshStandardMaterial {...getMaterialProps('Motor Stator Housing', '#0f766e', 0.7, 0.3)} />
          </mesh>

          {/* Cooling Fins */}
          {[-0.5, -0.25, 0, 0.25, 0.5].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.72, 0.72, 0.04, 24]} />
              <meshStandardMaterial color="#115e59" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}

          {/* Terminal Box */}
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[0.4, 0.3, 0.3]} />
            <meshStandardMaterial color="#042f2e" metalness={0.6} roughness={0.4} />
          </mesh>

          {/* Rear Cooling Fan Cowl */}
          <mesh position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.6, 0.6, 0.25, 24]} />
            <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>

        {/* Coupler / Bearing Housing */}
        <mesh
          position={[0, 0.9, 0]}
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Drive End Bearing Housing', 'Bearings'); }}
        >
          <cylinderGeometry args={[0.35, 0.35, 0.6, 16]} />
          <meshStandardMaterial {...getMaterialProps('Drive End Bearing Housing', '#475569', 0.9, 0.2)} />
        </mesh>

        {/* Rotating Internal Shaft */}
        <mesh ref={shaftRef} position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Centrifugal Volute Casing (Pump Body) */}
        <mesh
          position={[1.1, 0.9, 0]}
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Spiral Volute Casing', 'Volute'); }}
        >
          <cylinderGeometry args={[0.85, 0.85, 0.7, 24]} />
          <meshStandardMaterial {...getMaterialProps('Spiral Volute Casing', '#0369a1', 0.8, 0.3)} />
        </mesh>

        {/* Suction Inlet Flange (Front) */}
        <mesh
          position={[1.1, 0.9, 0.7]}
          rotation={[Math.PI / 2, 0, 0]}
          onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Suction Flange & Impeller', 'Impeller'); }}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.6, 16]} />
          <meshStandardMaterial {...getMaterialProps('Suction Flange & Impeller', '#0284c7', 0.8, 0.2)} />
        </mesh>
        <mesh position={[1.1, 0.9, 1.05]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.38, 0.08, 16, 24]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Discharge Outlet Flange (Vertical) */}
        <mesh position={[1.1, 1.8, 0]} onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Discharge Valve Port', 'Discharge'); }}>
          <cylinderGeometry args={[0.25, 0.25, 0.9, 16]} />
          <meshStandardMaterial {...getMaterialProps('Discharge Valve Port', '#0284c7', 0.8, 0.2)} />
        </mesh>
        <mesh position={[1.1, 2.3, 0]}>
          <torusGeometry args={[0.34, 0.08, 16, 24]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* 3D Sensor Nodes Placed on Pump Hotspots */}
        <SensorNode3D
          position={[-1.1, 1.7, 0]}
          label="TEMP"
          value={tempSensor?.value || tempSensor?.currentReading}
          unit={tempSensor?.unit || '°C'}
          status={tempSensor?.status || 'NORMAL'}
          onClick={() => onSelectComponent?.('Motor Stator Housing', 'Electric Motor')}
        />
        <SensorNode3D
          position={[0, 1.4, 0]}
          label="VIB"
          value={vibSensor?.value || vibSensor?.currentReading}
          unit={vibSensor?.unit || 'mm/s'}
          status={vibSensor?.status || 'NORMAL'}
          onClick={() => onSelectComponent?.('Drive End Bearing Housing', 'Bearings')}
        />
        <SensorNode3D
          position={[1.1, 2.5, 0]}
          label="PRESS"
          value={pressSensor?.value || pressSensor?.currentReading}
          unit={pressSensor?.unit || 'bar'}
          status={pressSensor?.status || 'NORMAL'}
          onClick={() => onSelectComponent?.('Discharge Valve Port', 'Discharge')}
        />
      </group>
    );
  }

  // 2. CNC MACHINE MODEL
  if (type === 'CNC_MACHINE') {
    return (
      <group position={[0, -0.8, 0]}>
        {/* Machine Base */}
        <mesh position={[0, 0.4, 0]} onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Rigid Polymer Cast Base', 'Bed'); }}>
          <boxGeometry args={[3.2, 0.8, 2.8]} />
          <meshStandardMaterial {...getMaterialProps('Rigid Polymer Cast Base', '#1e293b', 0.8, 0.3)} />
        </mesh>

        {/* Enclosure Pillars */}
        <mesh position={[-1.4, 1.8, -1.2]}>
          <boxGeometry args={[0.2, 2.0, 0.2]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[1.4, 1.8, -1.2]}>
          <boxGeometry args={[0.2, 2.0, 0.2]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Back Gantry Column */}
        <mesh position={[0, 2.0, -1.0]} onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Z-Axis Vertical Gantry', 'Gantry'); }}>
          <boxGeometry args={[2.6, 2.2, 0.6]} />
          <meshStandardMaterial {...getMaterialProps('Z-Axis Vertical Gantry', '#0f766e', 0.8, 0.2)} />
        </mesh>

        {/* Tool Spindle Assembly (Vertical) */}
        <group position={[0, 2.1, -0.2]}>
          <mesh onClick={(e) => { e.stopPropagation(); onSelectComponent?.('High-Speed Milling Spindle', 'Spindle'); }}>
            <boxGeometry args={[0.7, 0.9, 0.7]} />
            <meshStandardMaterial {...getMaterialProps('High-Speed Milling Spindle', '#0369a1', 0.8, 0.2)} />
          </mesh>
          {/* Rotating Spindle Tool Tip */}
          <mesh ref={spindleRef} position={[0, -0.65, 0]}>
            <cylinderGeometry args={[0.15, 0.05, 0.5, 16]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>

        {/* Machine Table Bed (X/Y) */}
        <mesh position={[0, 0.95, 0.2]} onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Precision T-Slot Machining Bed', 'Table'); }}>
          <boxGeometry args={[2.0, 0.2, 1.6]} />
          <meshStandardMaterial {...getMaterialProps('Precision T-Slot Machining Bed', '#64748b', 0.9, 0.2)} />
        </mesh>

        {/* Control Console */}
        <mesh position={[1.7, 1.6, 0.8]} rotation={[0, -0.4, 0]}>
          <boxGeometry args={[0.5, 0.7, 0.1]} />
          <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.6} />
        </mesh>

        {/* Sensor Nodes */}
        <SensorNode3D
          position={[0, 2.7, -0.2]}
          label="SPINDLE TEMP"
          value={tempSensor?.value || tempSensor?.currentReading}
          unit="°C"
          status={tempSensor?.status || 'NORMAL'}
          onClick={() => onSelectComponent?.('High-Speed Milling Spindle', 'Spindle')}
        />
        <SensorNode3D
          position={[0, 1.2, 0.2]}
          label="VIB"
          value={vibSensor?.value || vibSensor?.currentReading}
          unit="mm/s"
          status={vibSensor?.status || 'NORMAL'}
          onClick={() => onSelectComponent?.('Precision T-Slot Machining Bed', 'Table')}
        />
        <SensorNode3D
          position={[0, 2.1, 0.3]}
          label="RPM"
          value={rpmSensor?.value || rpmSensor?.currentReading}
          unit="RPM"
          status={rpmSensor?.status || 'NORMAL'}
          onClick={() => onSelectComponent?.('High-Speed Milling Spindle', 'Spindle')}
        />
      </group>
    );
  }

  // 3. ELECTRIC MOTOR MODEL
  if (type === 'ELECTRIC_MOTOR') {
    return (
      <group position={[0, -0.4, 0]}>
        {/* Foot Mounting Brackets */}
        <mesh position={[0, 0.1, 0]} onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Cast Foot Bracket', 'Mounting'); }}>
          <boxGeometry args={[2.4, 0.2, 1.8]} />
          <meshStandardMaterial {...getMaterialProps('Cast Foot Bracket', '#1e293b', 0.9, 0.3)} />
        </mesh>

        {/* Stator Cylindrical Frame */}
        <mesh
          position={[0, 1.0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Stator Copper Windings', 'Stator'); }}
        >
          <cylinderGeometry args={[0.85, 0.85, 2.0, 32]} />
          <meshStandardMaterial {...getMaterialProps('Stator Copper Windings', '#0f766e', 0.8, 0.3)} />
        </mesh>

        {/* Radial Cooling Ribs */}
        {[-0.8, -0.5, -0.2, 0.1, 0.4, 0.7].map((x, i) => (
          <mesh key={i} position={[x, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.95, 0.95, 0.05, 32]} />
            <meshStandardMaterial color="#115e59" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}

        {/* Rotor Central Shaft */}
        <mesh ref={shaftRef} position={[1.4, 1.0, 0]} rotation={[0, 0, Math.PI / 2]} onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Rotor Output Shaft', 'Shaft'); }}>
          <cylinderGeometry args={[0.22, 0.22, 1.0, 16]} />
          <meshStandardMaterial {...getMaterialProps('Rotor Output Shaft', '#cbd5e1', 0.95, 0.1)} />
        </mesh>

        {/* Terminal Connection Box */}
        <mesh position={[0, 2.05, 0]} onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Terminal Wiring Box', 'Electrical'); }}>
          <boxGeometry args={[0.6, 0.4, 0.5]} />
          <meshStandardMaterial {...getMaterialProps('Terminal Wiring Box', '#0284c7', 0.7, 0.3)} />
        </mesh>

        {/* End Bearings Caps */}
        <mesh position={[-1.05, 1.0, 0]} rotation={[0, 0, Math.PI / 2]} onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Non-Drive End Bearings', 'Bearings'); }}>
          <cylinderGeometry args={[0.65, 0.65, 0.25, 24]} />
          <meshStandardMaterial {...getMaterialProps('Non-Drive End Bearings', '#475569', 0.9, 0.2)} />
        </mesh>
        <mesh position={[1.05, 1.0, 0]} rotation={[0, 0, Math.PI / 2]} onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Drive End Bearing Assembly', 'Bearings'); }}>
          <cylinderGeometry args={[0.65, 0.65, 0.25, 24]} />
          <meshStandardMaterial {...getMaterialProps('Drive End Bearing Assembly', '#475569', 0.9, 0.2)} />
        </mesh>

        {/* Sensor Nodes */}
        <SensorNode3D
          position={[0, 2.4, 0]}
          label="WINDING TEMP"
          value={tempSensor?.value || tempSensor?.currentReading}
          unit="°C"
          status={tempSensor?.status || 'NORMAL'}
          onClick={() => onSelectComponent?.('Stator Copper Windings', 'Stator')}
        />
        <SensorNode3D
          position={[1.1, 1.7, 0]}
          label="DRIVE VIB"
          value={vibSensor?.value || vibSensor?.currentReading}
          unit="mm/s"
          status={vibSensor?.status || 'NORMAL'}
          onClick={() => onSelectComponent?.('Drive End Bearing Assembly', 'Bearings')}
        />
      </group>
    );
  }

  // 4. ROTARY SCREW COMPRESSOR / DEFAULT INDUSTRIAL UNIT
  return (
    <group position={[0, -0.5, 0]}>
      {/* Heavy Base Skid */}
      <mesh position={[0, 0.15, 0]} onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Structural Steel Base Frame', 'Chassis'); }}>
        <boxGeometry args={[3.8, 0.3, 2.2]} />
        <meshStandardMaterial {...getMaterialProps('Structural Steel Base Frame', '#1e293b', 0.9, 0.3)} />
      </mesh>

      {/* Main Enclosure Body */}
      <mesh position={[-0.4, 1.2, 0]} onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Acoustic Sound Enclosure', 'Housing'); }}>
        <boxGeometry args={[2.2, 1.8, 1.8]} />
        <meshStandardMaterial {...getMaterialProps('Acoustic Sound Enclosure', '#0284c7', 0.8, 0.3)} />
      </mesh>

      {/* Cylindrical Air Receiver Tank */}
      <mesh position={[1.2, 1.2, 0]} rotation={[0, 0, Math.PI / 2]} onClick={(e) => { e.stopPropagation(); onSelectComponent?.('Pressurized Air Receiver Tank', 'Vessel'); }}>
        <cylinderGeometry args={[0.7, 0.7, 1.6, 24]} />
        <meshStandardMaterial {...getMaterialProps('Pressurized Air Receiver Tank', '#0f766e', 0.8, 0.2)} />
      </mesh>

      {/* Air Outlet Manifold */}
      <mesh position={[1.2, 2.1, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Top Exhaust Vent Fan */}
      <mesh ref={fanRef} position={[-0.4, 2.15, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Sensors */}
      <SensorNode3D
        position={[-0.4, 2.4, 0]}
        label="CORE TEMP"
        value={tempSensor?.value || tempSensor?.currentReading}
        unit="°C"
        status={tempSensor?.status || 'NORMAL'}
        onClick={() => onSelectComponent?.('Acoustic Sound Enclosure', 'Housing')}
      />
      <SensorNode3D
        position={[1.2, 2.5, 0]}
        label="LINE PRESS"
        value={pressSensor?.value || pressSensor?.currentReading}
        unit="bar"
        status={pressSensor?.status || 'NORMAL'}
        onClick={() => onSelectComponent?.('Pressurized Air Receiver Tank', 'Vessel')}
      />
      <SensorNode3D
        position={[0, 1.5, 1.0]}
        label="VIB"
        value={vibSensor?.value || vibSensor?.currentReading}
        unit="mm/s"
        status={vibSensor?.status || 'NORMAL'}
        onClick={() => onSelectComponent?.('Structural Steel Base Frame', 'Chassis')}
      />
    </group>
  );
}
