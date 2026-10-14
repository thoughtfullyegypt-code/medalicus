import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GantryAngles } from '../types';
import { buildCoronaryAnatomy, calculateCarmVector, BuiltAnatomy } from '../utils/anatomyBuilder';
import { LayerVisibility } from './LayerControls';

interface ClinicalCanvasProps {
  angles: GantryAngles;
  layers: LayerVisibility;
  selectedVesselId: string | null;
  onSelectVessel: (id: string | null) => void;
}

export const ClinicalCanvas: React.FC<ClinicalCanvasProps> = ({
  angles,
  layers,
  selectedVesselId,
  onSelectVessel
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const anatomyRef = useRef<BuiltAnatomy | null>(null);

  const [hoveredVessel, setHoveredVessel] = React.useState<{ name: string; abbr: string } | null>(null);

  // Initialize Three.js scene for the 2D Fluoroscopy View
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdce1e8); // Phosphor fluoroscopy background
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 50);
    cameraRef.current = camera;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 0, 10);
    scene.add(dirLight);

    // Build Anatomy
    const anatomy = buildCoronaryAnatomy();
    anatomyRef.current = anatomy;

    // Fluoroscopy Mode styling:
    // Radiopaque contrast vessels appear dark/black against bone background
    anatomy.vesselMeshes.forEach(mesh => {
      mesh.material = new THREE.MeshBasicMaterial({
        color: 0x111827 // Contrast dye is black
      });
    });

    if (anatomy.stenosisMesh) {
      anatomy.stenosisMesh.material = new THREE.MeshBasicMaterial({
        color: 0xd97706 // Atheroma plaque
      });
    }

    // Hide apparatus not seen in fluoroscopic receptor
    anatomy.carmGroup.visible = false;
    anatomy.beamMesh.visible = false;
    anatomy.probeGroup.visible = false;
    if (anatomy.bodyGroup) anatomy.bodyGroup.visible = false;

    // Spine, Ribs, and Sternum are semi-transparent gray shadows (bone density)
    const boneFluoroMat = () => new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.32
    });

    if (anatomy.spineMesh) {
      anatomy.spineMesh.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = boneFluoroMat();
        }
      });
    }

    if (anatomy.ribsMesh) {
      anatomy.ribsMesh.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = boneFluoroMat();
        }
      });
    }

    if (anatomy.sternumMesh) {
      anatomy.sternumMesh.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = boneFluoroMat();
        }
      });
    }

    // Heart mass is faint cardiac silhouette
    if (anatomy.heartMesh) {
      anatomy.heartMesh.material = new THREE.MeshBasicMaterial({
        color: 0xa8b3c4,
        transparent: true,
        opacity: 0.18
      });
    }

    scene.add(anatomy.rootGroup);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    containerRef.current.replaceChildren(renderer.domElement);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Detector Camera Position whenever Gantry Angles change
  useEffect(() => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;

    const pos = calculateCarmVector(angles.primary, angles.secondary, 9.0);
    camera.position.copy(pos);
    camera.lookAt(0, 0, 0);

    const secRad = THREE.MathUtils.degToRad(angles.secondary);
    if (Math.abs(angles.secondary) > 85) {
      camera.up.set(0, 0, angles.secondary > 0 ? -1 : 1);
    } else {
      camera.up.set(0, 1, 0);
    }
  }, [angles]);

  // Update Layer Visibilities
  useEffect(() => {
    if (!anatomyRef.current) return;
    const { 
      heartMesh, 
      aortaMesh, 
      pulmonaryMesh, 
      spineMesh, 
      ribsMesh, 
      sternumMesh, 
      catheterMesh 
    } = anatomyRef.current;

    if (heartMesh) {
      heartMesh.visible = layers.heartChambers;
      (heartMesh.material as THREE.MeshBasicMaterial).opacity = (layers.heartOpacity / 100) * 0.35;
    }
    if (aortaMesh) aortaMesh.visible = layers.aorta;
    if (pulmonaryMesh) pulmonaryMesh.visible = layers.aorta;
    if (spineMesh) spineMesh.visible = layers.ribsAndSpine;
    if (ribsMesh) ribsMesh.visible = layers.ribsAndSpine;
    if (sternumMesh) sternumMesh.visible = layers.ribsAndSpine;
    if (catheterMesh) catheterMesh.visible = layers.catheter;
  }, [layers]);

  // Update Vessel Highlights in Fluoro View
  useEffect(() => {
    if (!anatomyRef.current) return;
    const { vesselMeshes } = anatomyRef.current;

    vesselMeshes.forEach((mesh, id) => {
      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (selectedVesselId === id) {
        mat.color.setHex(0xd97706); // Amber radiopaque highlighting
      } else {
        mat.color.setHex(0x0f172a); // Deep radiopaque black contrast
      }
    });
  }, [selectedVesselId]);

  // Raycasting for vessel identification in 2D fluoro
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !anatomyRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const meshes = Array.from(anatomyRef.current.vesselMeshes.values());
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      setHoveredVessel({
        name: hit.userData.name,
        abbr: hit.userData.abbr
      });
      containerRef.current.style.cursor = 'pointer';
    } else {
      setHoveredVessel(null);
      containerRef.current.style.cursor = 'crosshair';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !anatomyRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const meshes = Array.from(anatomyRef.current.vesselMeshes.values());
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      onSelectVessel(hit.userData.vesselId);
    } else {
      onSelectVessel(null);
    }
  };

  const primaryStr = angles.primary === 0 ? 'AP 0°' : angles.primary > 0 ? `LAO ${angles.primary}°` : `RAO ${Math.abs(angles.primary)}°`;
  const secondaryStr = angles.secondary === 0 ? '0°' : angles.secondary > 0 ? `CRAN ${angles.secondary}°` : `CAUD ${Math.abs(angles.secondary)}°`;

  return (
    <div 
      className="relative w-full h-full overflow-hidden select-none bg-slate-900"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Fluoroscopy Circular Collimator Mask Overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-full border-[18px] border-[#0a0f18]/90 shadow-[inset_0_0_60px_rgba(0,0,0,0.6)]" />

      {/* Cath Lab PACS Monitor HUD - Top Left */}
      <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-700 bg-white/70 backdrop-blur px-2.5 py-1 rounded shadow-sm border border-slate-300 pointer-events-none">
        <div className="font-bold text-slate-900 tracking-wider">MEDALICUS CATH LAB 01</div>
        <div>SERIES: 3D CORONARY CINE</div>
        <div>TUBE: 78 kVp &bull; 125 mA</div>
      </div>

      {/* Cath Lab PACS Monitor HUD - Top Right Gantry Readout */}
      <div className="absolute top-3 right-4 text-right pointer-events-none">
        <div className="bg-slate-900/90 text-teal-400 font-mono text-xs font-bold px-3 py-1 rounded shadow-md border border-teal-500/40 inline-block">
          {primaryStr} / {secondaryStr}
        </div>
        <div className="text-[9px] font-mono text-slate-600 mt-0.5">DETECTOR PROJECTION</div>
      </div>

      {/* Center Alignment Reticle Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
        <div className="w-8 h-px bg-slate-700" />
        <div className="h-8 w-px bg-slate-700 -mt-4 ml-4" />
      </div>

      {/* Bottom Left Frame Rate & Dose */}
      <div className="absolute bottom-3 left-4 text-[10px] font-mono text-slate-700 bg-white/70 backdrop-blur px-2.5 py-1 rounded shadow-sm border border-slate-300 pointer-events-none">
        <div>15 FPS &bull; PULSED CINE</div>
        <div>FOV: 20 cm &bull; DOSE: 0.12 Gy</div>
      </div>

      {/* Hovered / Clicked Vessel Banner */}
      {hoveredVessel && (
        <div className="absolute bottom-3 right-4 bg-slate-900/95 border border-teal-400 text-teal-200 px-3 py-1.5 rounded-lg shadow-2xl pointer-events-none">
          <div className="font-bold text-xs">{hoveredVessel.name}</div>
          <div className="text-[10px] text-teal-400 font-mono">({hoveredVessel.abbr}) &bull; Click to Inspect</div>
        </div>
      )}
    </div>
  );
};
