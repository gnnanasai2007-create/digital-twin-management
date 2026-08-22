import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import MachineryModel from './MachineryModel';
import { Maximize2, RotateCcw, Eye } from 'lucide-react';

export default function ThreeScene({
  assetType = 'PUMP',
  status = 'HEALTHY',
  sensors = [],
  onSelectComponent,
  selectedComponentName,
  className = 'h-[450px]',
}) {
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const statusLightColor =
    status === 'CRITICAL' ? '#ef4444' : status === 'WARNING' ? '#f59e0b' : '#06b6d4';

  return (
    <div className={`relative w-full rounded-xl overflow-hidden glass-panel border border-slate-800 bg-[#070c18] ${className}`}>
      {/* 3D Scene Controls Overlay */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all border ${
            autoRotate
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
          title="Toggle Auto Rotation"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
          <span>Rotate</span>
        </button>

        <button
          onClick={() => setWireframe(!wireframe)}
          className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all border ${
            wireframe
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
          title="Toggle Wireframe Mode"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Wireframe</span>
        </button>
      </div>

      {/* Live Badge in 3D Canvas */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-lg backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span>DIGITAL TWIN 3D VIEW</span>
        </div>
      </div>

      {/* R3F Canvas */}
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[4, 3, 5]} fov={50} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.05}
          minDistance={2}
          maxDistance={12}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
        />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[6, 8, 4]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-4, 3, -2]} intensity={0.6} color="#38bdf8" />
        <pointLight position={[0, 4, 0]} intensity={1.2} color={statusLightColor} />

        {/* Parametric Machinery Geometry */}
        <Suspense fallback={null}>
          <MachineryModel
            type={assetType}
            status={status}
            sensors={sensors}
            onSelectComponent={onSelectComponent}
            selectedComponentName={selectedComponentName}
          />
        </Suspense>

        {/* Industrial Ground Grid */}
        <Grid
          position={[0, -0.6, 0]}
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.8}
          cellColor="#1e293b"
          sectionSize={2.0}
          sectionThickness={1.2}
          sectionColor="#06b6d4"
          fadeDistance={15}
          fadeStrength={1.5}
        />
      </Canvas>

      {/* Instructions Overlay */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-500 pointer-events-none">
        <span>Click components to inspect • Drag to rotate • Scroll to zoom</span>
        <span className="hidden sm:inline">Physics Simulation Active</span>
      </div>
    </div>
  );
}
