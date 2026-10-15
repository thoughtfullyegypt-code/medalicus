import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Loader2, AlertTriangle, X } from 'lucide-react';
import { GantryAngles, ImagingModality, OrganSystemId } from '../types';
import { buildCoronaryAnatomy, calculateCarmVector, BuiltAnatomy } from '../utils/anatomyBuilder';
import { System3DScene } from '../utils/proceduralSystemsBuilder';
import { buildRealSystem3D } from '../utils/realAnatomyBuilder';
import { PROBE_PRESETS } from '../data/challengesData';
import { LayerVisibility } from './LayerControls';

interface AnatomyCanvasProps {
  systemId?: OrganSystemId;
  angles: GantryAngles;
  layers: LayerVisibility;
  systemLayers?: Record<string, boolean>;
  organOpacity?: number;
  bodySkinOpacity?: number;
  modality: ImagingModality;
  activeProbePreset: 'plax' | 'psax' | 'a4c' | 'subcostal' | string;
  selectedVesselId: string | null;
  onSelectVessel: (id: string | null) => void;
  alignTrigger: number;
  sliceIndex?: number;
  cameraPresetTrigger?: { preset: 'axial' | 'coronal' | 'sagittal' | '3d'; timestamp: number } | null;
}

const SYSTEM_CAMERA_FRAMES: Record<OrganSystemId, { target: [number, number, number]; radius: number; phi: number; theta: number }> = {
  cardiovascular: { target: [0, 0.2, 0], radius: 8.5, phi: 1.1, theta: 0.4 },
  neurology: { target: [0, 2.7, 0], radius: 4.5, phi: 1.25, theta: 0.4 },
  pulmonology: { target: [0, 1.5, 0], radius: 5.1, phi: 1.15, theta: 0.35 },
  gastroenterology: { target: [0, 0.55, 0], radius: 5.0, phi: 1.2, theta: 0.3 },
  nephrology: { target: [0, 0.15, 0], radius: 5.0, phi: 1.15, theta: 0.35 },
  musculoskeletal: { target: [0, 0, 0], radius: 9.0, phi: 1.25, theta: 0.45 },
  obstetrics: { target: [0.1, 0, 0], radius: 6.8, phi: 1.2, theta: 0.4 },
  ophthalmology_ent: { target: [0, 0, 0], radius: 4.5, phi: 1.25, theta: 0.25 }
};

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && 
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

export const AnatomyCanvas: React.FC<AnatomyCanvasProps> = ({
  systemId = 'cardiovascular',
  angles,
  layers,
  systemLayers = {},
  organOpacity = 42,
  bodySkinOpacity = 22,
  modality,
  activeProbePreset,
  selectedVesselId,
  onSelectVessel,
  alignTrigger,
  sliceIndex = 50,
  cameraPresetTrigger
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const anatomyRef = useRef<BuiltAnatomy | null>(null);
  const system3DRef = useRef<System3DScene | null>(null);
  const realisticHeartRef = useRef<THREE.Group | null>(null);
  const realisticBodyRef = useRef<THREE.Group | null>(null);

  // Orbit controls state
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const cameraSphericalRef = useRef({ radius: 8.5, theta: 0.4, phi: 1.1 });

  // Hover tooltip
  const [hoveredVessel, setHoveredVessel] = useState<{ name: string; abbr?: string } | null>(null);

  // 3D Model Loading & Error states
  const [modelLoading, setModelLoading] = useState<{ active: boolean; label: string; progress: number } | null>(null);
  const [modelError, setModelError] = useState<{ file: string; message: string } | null>(null);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(
      cameraTargetRef.current.x + x,
      cameraTargetRef.current.y + y,
      cameraTargetRef.current.z + z
    );
    cameraRef.current.lookAt(cameraTargetRef.current);
  };

  // 1. Initialize Three.js scene & renderer
  useEffect(() => {
    if (!checkWebGLSupport()) {
      setWebglAvailable(false);
      return;
    }
    if (!containerRef.current) return;
    const width = Math.max(containerRef.current.clientWidth, 320);
    const height = Math.max(containerRef.current.clientHeight, 240);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f8fb);
    sceneRef.current = scene;

    // Grid Floor
    const grid = new THREE.GridHelper(14, 28, 0xdbe2ea, 0xeef1f5);
    grid.position.y = -3.8;
    scene.add(grid);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // Lighting (Warm Key + Medical Cyan Fill + Soft Ambient)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.25);
    dirLight1.position.set(6, 12, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x597d9a, 0.4);
    dirLight2.position.set(-6, -4, -6);
    scene.add(dirLight2);

    const backLight = new THREE.DirectionalLight(0xc6d6e5, 0.3);
    backLight.position.set(0, 8, -8);
    scene.add(backLight);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    containerRef.current.replaceChildren(renderer.domElement);

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = Math.max(containerRef.current.clientWidth, 320);
      const h = Math.max(containerRef.current.clientHeight, 240);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // 2. Re-build anatomy & adjust camera when systemId changes
  useEffect(() => {
    let cancelled = false;
    setModelError(null);
    setModelLoading(null);
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old roots
    if (anatomyRef.current?.rootGroup) {
      scene.remove(anatomyRef.current.rootGroup);
      anatomyRef.current = null;
    }
    if (system3DRef.current?.rootGroup) {
      scene.remove(system3DRef.current.rootGroup);
      system3DRef.current = null;
    }
    realisticHeartRef.current = null;
    realisticBodyRef.current = null;

    // Reset camera target & framing for this system
    const frame = SYSTEM_CAMERA_FRAMES[systemId] || SYSTEM_CAMERA_FRAMES.cardiovascular;
    cameraTargetRef.current.set(frame.target[0], frame.target[1], frame.target[2]);
    cameraSphericalRef.current = {
      radius: frame.radius,
      phi: frame.phi,
      theta: frame.theta
    };
    updateCameraPosition();

    if (systemId === 'cardiovascular') {
      const anatomy = buildCoronaryAnatomy();
      anatomyRef.current = anatomy;
      scene.add(anatomy.rootGroup);

      // Attempt to load realistic textured heart GLB model
      const loader = new GLTFLoader();
      const cleanBase = (import.meta.env.BASE_URL || './').replace(/\/+$/, '') + '/';
      const heartUrl = `${cleanBase}models/heart.glb`;
      const bodyUrl = `${cleanBase}models/human_body.glb`;

      console.log(`[3D Loader] Initiating fetch for ${heartUrl}...`);
      setModelLoading({ active: true, label: 'Realistic Cardiac Anatomy (heart.glb)', progress: 0 });

      loader.load(
        heartUrl,
        (gltf) => {
          if (cancelled) return;
          console.log(`[3D Loader] ✓ Successfully loaded and parsed ${heartUrl}`);
          setModelLoading(null);
          setModelError(null);
          const heartModel = gltf.scene;
          heartModel.name = 'RealisticHeartModel';
          heartModel.scale.set(1.45, 1.45, 1.45);
          heartModel.position.set(0.12, 0.32, 0.15);
          heartModel.rotation.set(-0.08, 0.25, 0.05);

          heartModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (mesh.material) {
                const mat = mesh.material as THREE.MeshStandardMaterial;
                mat.roughness = 0.42;
                mat.metalness = 0.10;
                mat.transparent = true;
                mat.opacity = layers.heartOpacity / 100;
              }
            }
          });

          // Smoothly replace procedural mass with high-res model
          if (anatomy.heartMesh) anatomy.heartMesh.visible = false;
          if (anatomy.atriaMesh) anatomy.atriaMesh.visible = false;
          anatomy.heartGroup.add(heartModel);
          realisticHeartRef.current = heartModel;
        },
        (xhr) => {
          if (cancelled) return;
          if (xhr.lengthComputable && xhr.total > 0) {
            const pct = Math.round((xhr.loaded / xhr.total) * 100);
            console.log(`[3D Loader] Loading heart.glb: ${pct}%`);
            setModelLoading({ active: true, label: 'Realistic Cardiac Anatomy (heart.glb)', progress: pct });
          }
        },
        (err) => {
          if (cancelled) return;
          console.error(`[3D Loader] ✗ Failed to load ${heartUrl}:`, err);
          setModelLoading(null);
          setModelError({
            file: 'models/heart.glb',
            message: 'Failed to download or parse 3D heart model. Clinical procedural anatomy fallback is active.'
          });
        }
      );

      // Attempt to load realistic body skin envelope GLB
      loader.load(
        bodyUrl,
        (gltf) => {
          if (cancelled) return;
          console.log(`[3D Loader] ✓ Successfully loaded ${bodyUrl}`);
          const bodyModel = gltf.scene;
          bodyModel.name = 'RealisticBodyModel';
          bodyModel.rotation.y = Math.PI / 2;
          bodyModel.scale.set(8.2, 8.2, 8.2);
          bodyModel.position.set(0, 0, 0);
          bodyModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.material = new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: layers.bodySkinOpacity / 100,
                roughness: 0.6,
                metalness: 0.1
              });
            }
          });
          if (anatomy.bodyMesh) anatomy.bodyMesh.visible = false;
          anatomy.bodyGroup.add(bodyModel);
          realisticBodyRef.current = bodyModel;
        },
        undefined,
        (err) => { if (!cancelled) console.log(`[3D Loader] human_body.glb unavailable:`, err); }
      );
    } else {
      setModelLoading({ active: true, label: 'Loading licensed 3D anatomy atlas', progress: 0 });
      buildRealSystem3D(systemId).then((sys3D) => {
        if (cancelled || sceneRef.current !== scene) {
          return;
        }
        system3DRef.current = sys3D;
        scene.add(sys3D.rootGroup);

        // Apply current controls after asynchronous GLB loading completes.
        sys3D.layerGroups.forEach((obj, key) => {
          if (systemLayers[key] !== undefined) obj.visible = systemLayers[key];
        });
        const skinOpacity = bodySkinOpacity !== undefined ? bodySkinOpacity : 22;
        const skinMaterials = sys3D.bodyMesh
          ? (Array.isArray(sys3D.bodyMesh.material) ? sys3D.bodyMesh.material : [sys3D.bodyMesh.material])
          : [];
        if (sys3D.bodyMesh) {
          sys3D.bodyMesh.visible = skinOpacity > 0 && systemLayers.bodySkin !== false;
          skinMaterials.forEach(material => {
            material.transparent = true;
            material.opacity = skinOpacity / 100;
            material.depthWrite = false;
          });
        }
        const opacity = Math.max(0.1, Math.min(1, organOpacity / 100));
        sys3D.organMeshes?.forEach(mesh => {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach(material => {
            material.transparent = opacity < 1;
            material.opacity = opacity;
            material.depthWrite = opacity >= 0.75;
          });
        });

        setModelLoading(null);
        setModelError(null);
      }).catch((error: unknown) => {
        if (cancelled) return;
        console.error('[Real Anatomy] Failed to load atlas models:', error);
        setModelLoading(null);
        setModelError({
          file: 'real anatomy atlas',
          message: error instanceof Error
            ? error.message
            : 'The anatomical model could not be loaded. Check the network connection and model source availability.'
        });
      });
    }
    return () => { cancelled = true; };
  }, [systemId]);

  // 3. Animation Loop
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (!scene || !camera || !renderer) return;

    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) / 1000;

      // Subtle physiological pulsation
      if (anatomyRef.current?.heartGroup) {
        const pulse = 1.0 + Math.sin(elapsedTime * 4.2) * 0.018;
        anatomyRef.current.heartGroup.scale.set(pulse, pulse, pulse);
      }

      if (system3DRef.current?.animator) {
        system3DRef.current.animator(elapsedTime);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => cancelAnimationFrame(animId);
  }, [systemId]);

  // 4. Update 3D MPR Slicing Plane when sliceIndex changes
  useEffect(() => {
    if (system3DRef.current?.updateSlice) {
      system3DRef.current.updateSlice(sliceIndex);
    }
  }, [sliceIndex]);

  // 5. Handle Camera Preset Navigation (Axial, Coronal, Sagittal, 3D)
  useEffect(() => {
    if (!cameraPresetTrigger) return;
    const { preset } = cameraPresetTrigger;
    const frame = SYSTEM_CAMERA_FRAMES[systemId] || SYSTEM_CAMERA_FRAMES.cardiovascular;
    const currentRadius = cameraSphericalRef.current.radius || frame.radius;

    switch (preset) {
      case 'axial': // Top-down axial view (CT cross-section)
        cameraSphericalRef.current = { radius: currentRadius, phi: 0.04, theta: 0 };
        break;
      case 'coronal': // True coronal AP view
        cameraSphericalRef.current = { radius: currentRadius, phi: Math.PI / 2, theta: 0 };
        break;
      case 'sagittal': // Right lateral sagittal view
        cameraSphericalRef.current = { radius: currentRadius, phi: Math.PI / 2, theta: Math.PI / 2 };
        break;
      case '3d': // Isometric clinical perspective
        cameraSphericalRef.current = { radius: frame.radius, phi: frame.phi, theta: frame.theta };
        break;
    }
    updateCameraPosition();
  }, [cameraPresetTrigger]);

  // 6. Align camera along C-arm beam axis when requested
  useEffect(() => {
    if (alignTrigger === 0 || !cameraRef.current) return;
    const detectorVec = calculateCarmVector(angles.primary, angles.secondary, 8.5);

    const radius = 8.5;
    const phi = Math.acos(Math.max(-1, Math.min(1, detectorVec.y / radius)));
    const theta = Math.atan2(detectorVec.x, detectorVec.z);

    cameraSphericalRef.current = { radius, theta, phi };
    cameraTargetRef.current.set(0, 0, 0);
    updateCameraPosition();
  }, [alignTrigger]);

  // 7. Update C-Arm orientation whenever angles change
  useEffect(() => {
    if (!anatomyRef.current?.carmGroup) return;
    const { carmGroup } = anatomyRef.current;

    const primRad = THREE.MathUtils.degToRad(angles.primary);
    const secRad = THREE.MathUtils.degToRad(angles.secondary);

    carmGroup.rotation.order = 'YXZ';
    carmGroup.rotation.y = primRad;
    carmGroup.rotation.x = -secRad;
  }, [angles]);

  // 8. Handle Modality Switching (C-Arm vs. Ultrasound Probe & Echo Cut Plane)
  useEffect(() => {
    if (!anatomyRef.current) return;
    const { carmGroup, beamMesh, probeGroup, echoCutPlaneGroup } = anatomyRef.current;

    if (modality === 'ultrasound') {
      if (carmGroup) carmGroup.visible = false;
      if (beamMesh) beamMesh.visible = false;
      if (probeGroup) probeGroup.visible = true;
      if (echoCutPlaneGroup) echoCutPlaneGroup.visible = true;
    } else {
      if (carmGroup) carmGroup.visible = true;
      if (beamMesh) beamMesh.visible = layers.beamCone;
      if (probeGroup) probeGroup.visible = false;
      if (echoCutPlaneGroup) echoCutPlaneGroup.visible = false;
    }
  }, [modality, layers.beamCone]);

  // 9. Update Ultrasound Probe position & Echo Anatomical Cut Plane
  useEffect(() => {
    if (!anatomyRef.current) return;
    const { probeGroup, updateEchoCutPlane } = anatomyRef.current;
    const preset = PROBE_PRESETS.find(p => p.presetId === activeProbePreset) || PROBE_PRESETS[0];

    if (probeGroup) {
      probeGroup.position.set(
        preset.chestPosition[0],
        preset.chestPosition[1],
        preset.chestPosition[2]
      );
      probeGroup.rotation.set(
        preset.rotation[0],
        preset.rotation[1],
        preset.rotation[2]
      );
    }

    if (updateEchoCutPlane) {
      updateEchoCutPlane(activeProbePreset);
    }
  }, [activeProbePreset]);

  // 10. Update Cardiovascular Layer Visibilities & Opacities
  useEffect(() => {
    if (!anatomyRef.current) return;
    const { 
      bodyMesh,
      landmarksGroup,
      heartMesh, 
      aortaMesh, 
      pulmonaryMesh, 
      spineMesh, 
      ribsMesh, 
      sternumMesh, 
      beamMesh, 
      catheterMesh 
    } = anatomyRef.current;

    if (bodyMesh) {
      bodyMesh.visible = layers.bodySkin && layers.bodySkinOpacity > 0;
      (bodyMesh.material as THREE.MeshStandardMaterial).opacity = layers.bodySkinOpacity / 100;
    }
    if (landmarksGroup) landmarksGroup.visible = layers.surfaceLandmarks;
    if (heartMesh && !realisticHeartRef.current) {
      heartMesh.visible = layers.heartChambers;
      (heartMesh.material as THREE.MeshStandardMaterial).opacity = layers.heartOpacity / 100;
    }
    if (realisticHeartRef.current) {
      realisticHeartRef.current.visible = layers.heartChambers;
      realisticHeartRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
          ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = layers.heartOpacity / 100;
        }
      });
    }
    if (aortaMesh) aortaMesh.visible = layers.aorta;
    if (pulmonaryMesh) pulmonaryMesh.visible = layers.aorta;
    if (spineMesh) spineMesh.visible = layers.ribsAndSpine;
    if (ribsMesh) ribsMesh.visible = layers.ribsAndSpine;
    if (sternumMesh) sternumMesh.visible = layers.ribsAndSpine;
    if (beamMesh && modality === 'fluoro') beamMesh.visible = layers.beamCone;
    if (catheterMesh) catheterMesh.visible = layers.catheter;
  }, [layers, modality]);

  // 11. Update Multi-System Layer Visibilities & Opacities
  useEffect(() => {
    if (!system3DRef.current) return;
    const { layerGroups, bodyMesh, organMeshes } = system3DRef.current;

    // Toggle layer groups
    layerGroups.forEach((obj, key) => {
      if (systemLayers[key] !== undefined) {
        obj.visible = systemLayers[key];
      }
    });

    // Update body skin opacity
    if (bodyMesh && bodyMesh.material) {
      const skinOp = bodySkinOpacity !== undefined ? bodySkinOpacity : 22;
      bodyMesh.visible = skinOp > 0 && (systemLayers.bodySkin !== false);
      (bodyMesh.material as THREE.MeshStandardMaterial).opacity = skinOp / 100;
    }

    // Update organ opacity
    if (organMeshes) {
      const op = organOpacity / 100;
      organMeshes.forEach(mesh => {
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.transparent = true;
          mat.opacity = Math.max(0.1, Math.min(1.0, op));
        }
      });
    }
  }, [systemLayers, organOpacity, bodySkinOpacity]);

  // 12. Update Vessel / Segment Highlights
  useEffect(() => {
    if (anatomyRef.current?.vesselMeshes) {
      anatomyRef.current.vesselMeshes.forEach((mesh, id) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (selectedVesselId === id) {
          mat.color.setHex(0x00f5d4);
          mat.emissive.setHex(0x00f5d4);
          mat.emissiveIntensity = 0.8;
        } else {
          const defaultColor = mesh.userData.defaultColor || '#ef4444';
          mat.color.setStyle(defaultColor);
          mat.emissive.setStyle(defaultColor);
          mat.emissiveIntensity = 0.18;
        }
      });
    }

    if (system3DRef.current?.interactiveMeshes) {
      system3DRef.current.interactiveMeshes.forEach((mesh, id) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (selectedVesselId === id) {
          mat.emissive?.setHex?.(0x00f5d4);
          if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0.85;
        } else {
          if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0.18;
        }
      });
    }
  }, [selectedVesselId]);

  // Mouse & Touch Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) isDraggingRef.current = true;
    if (e.button === 2) isRightDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current && !isRightDraggingRef.current && containerRef.current && cameraRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

      let meshes: THREE.Mesh[] = [];
      if (anatomyRef.current?.vesselMeshes) {
        meshes = Array.from(anatomyRef.current.vesselMeshes.values());
      } else if (system3DRef.current?.interactiveMeshes) {
        meshes = Array.from(system3DRef.current.interactiveMeshes.values());
      }

      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        setHoveredVessel({
          name: hit.userData.name || hit.name,
          abbr: hit.userData.abbr
        });
        containerRef.current.style.cursor = 'pointer';
      } else {
        setHoveredVessel(null);
        containerRef.current.style.cursor = 'default';
      }
    }

    if (isDraggingRef.current) {
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      const s = cameraSphericalRef.current;
      s.theta -= deltaX * 0.008;
      s.phi = Math.max(0.04, Math.min(Math.PI - 0.04, s.phi - deltaY * 0.008));
      updateCameraPosition();
    }

    if (isRightDraggingRef.current) {
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      cameraTargetRef.current.y += deltaY * 0.01;
      updateCameraPosition();
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isRightDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const s = cameraSphericalRef.current;
    s.radius = Math.max(2.5, Math.min(22, s.radius + e.deltaY * 0.008));
    updateCameraPosition();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    if (anatomyRef.current?.vesselMeshes) {
      const meshes = Array.from(anatomyRef.current.vesselMeshes.values());
      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        onSelectVessel(hit.userData.vesselId);
        return;
      }
    } else if (system3DRef.current?.interactiveMeshes) {
      const entries = Array.from(system3DRef.current.interactiveMeshes.entries());
      const meshes = entries.map(([_, m]) => m);
      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const matched = entries.find(([_, m]) => m === hit);
        if (matched) {
          onSelectVessel(matched[0]);
          return;
        }
      }
    }
    onSelectVessel(null);
  };

  if (!webglAvailable) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-[#0a0f18] text-center select-none">
        <div className="bg-[#0f1724] border border-amber-500/40 rounded-2xl p-6 max-w-md shadow-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">WebGL Acceleration Unavailable</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your browser or device environment does not currently have WebGL graphics enabled.
          </p>
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-left text-[11px] text-slate-300 space-y-1">
            <div className="font-semibold text-teal-400">Recommended Steps:</div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              <li>Enable "Hardware Acceleration" in your browser settings.</li>
              <li>Try opening the link in Google Chrome, Apple Safari, or Microsoft Edge.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full overflow-hidden select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
      onContextMenu={e => e.preventDefault()}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Viewport Badge */}
      <div className="absolute top-3 left-3 flex flex-col space-y-1 z-20 pointer-events-none">
        <div className="flex items-center space-x-2 bg-slate-900/85 backdrop-blur border border-slate-700/80 px-2.5 py-1 rounded-md">
          <div className={`w-2 h-2 rounded-full animate-ping ${modality === 'ultrasound' ? 'bg-cyan-400' : 'bg-teal-400'}`} />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            {systemId === 'cardiovascular'
              ? (modality === 'ultrasound' ? '3D Patient & Echo Teaching View' : '3D Patient & C-Arm Observer')
              : `3D Clinical Anatomy • ${systemId.toUpperCase()}`}
          </span>
        </div>
        {systemId === 'cardiovascular' && modality === 'ultrasound' && (
          <div className="flex items-center space-x-1.5 bg-cyan-950/80 backdrop-blur border border-cyan-500/40 px-2 py-0.5 rounded text-[10px] text-cyan-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Anatomical Cut Plane ({activeProbePreset.toUpperCase()}) &bull; Not Ultrasound</span>
          </div>
        )}
      </div>

      {/* Orbit Helper Tip */}
      <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 bg-slate-950/70 backdrop-blur px-2 py-0.5 rounded border border-slate-800 pointer-events-none">
        Drag to Orbit &bull; Right-Click to Pan &bull; Scroll to Zoom
      </div>

      {/* Hovered Tooltip */}
      {hoveredVessel && (
        <div className="absolute top-3 right-3 bg-teal-950/90 border border-teal-500/80 text-teal-200 px-3 py-1.5 rounded-lg shadow-xl pointer-events-none">
          <div className="font-bold text-xs">{hoveredVessel.name}</div>
          <div className="text-[10px] text-teal-400 font-mono">
            {hoveredVessel.abbr ? `(${hoveredVessel.abbr}) - ` : ''}Click to Inspect
          </div>
        </div>
      )}
      {/* 3D Model Loading Spinner Overlay */}
      {modelLoading?.active && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center z-30 pointer-events-none">
          <div className="bg-[#0d131c] border border-teal-500/40 rounded-xl p-4 shadow-2xl flex flex-col items-center space-y-2.5 max-w-xs text-center">
            <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
            <div className="text-xs font-semibold text-slate-200">{modelLoading.label}</div>
            <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-teal-400 h-full transition-all duration-200" 
                style={{ width: `${modelLoading.progress}%` }} 
              />
            </div>
            <div className="text-[10px] font-mono text-teal-400">{modelLoading.progress}%</div>
          </div>
        </div>
      )}

      {/* 3D Model Load Error Alert Banner */}
      {modelError && (
        <div className="absolute top-12 left-3 right-3 sm:right-auto sm:max-w-md bg-amber-950/90 border border-amber-500/80 text-amber-200 px-3 py-2 rounded-lg shadow-xl z-30 flex items-start justify-between space-x-2">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-[11px] font-bold text-amber-300">
                {modelError.file === 'real anatomy atlas' ? 'Real Anatomy Model Unavailable' : 'Model Load Warning'}: <span className="font-mono text-amber-200">{modelError.file}</span>
              </div>
              <div className="text-[10px] text-amber-200/90 leading-tight">
                {modelError.message}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setModelError(null)}
            className="text-amber-400 hover:text-white p-0.5 rounded hover:bg-amber-900/50 transition cursor-pointer"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
