import * as THREE from 'three';
import { OrganSystemId } from '../types';
import { buildCoronaryAnatomy, BuiltAnatomy } from './anatomyBuilder';

export interface System3DScene {
  rootGroup: THREE.Group;
  primaryGroup: THREE.Group;
  interactiveMeshes: Map<string, THREE.Mesh>;
  layerGroups: Map<string, THREE.Object3D>;
  slicingPlaneMesh?: THREE.Mesh;
  bodyMesh?: THREE.Mesh;
  skeletonGroup?: THREE.Group;
  organMeshes?: THREE.Mesh[];
  updateSlice?: (sliceIndex: number) => void;
  animator?: (elapsedTime: number) => void;
}

// ============================================================================
// SHARED ANATOMICAL SKELETAL & SURFACE FOUNDATION BUILDERS
// ============================================================================

/**
 * Builds realistic articulated human vertebrae with authentic anatomical landmarks:
 * Vertebral body, pedicles, transverse processes, and spinous process.
 */
function buildArticulatedSpine(
  yBottom: number, 
  yTop: number, 
  count: number = 8, 
  curveZ: number = 0.25
): THREE.Group {
  const spineGroup = new THREE.Group();
  spineGroup.name = 'AnatomicalSpine';

  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xede8df,
    roughness: 0.45,
    metalness: 0.08
  });
  const discMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.6,
    metalness: 0.05,
    transparent: true,
    opacity: 0.75
  });

  const dy = (yTop - yBottom) / (count - 1);

  for (let i = 0; i < count; i++) {
    const y = yBottom + i * dy;
    const norm = i / (count - 1);
    const z = -0.7 - Math.sin(norm * Math.PI) * curveZ;

    const vertGroup = new THREE.Group();
    vertGroup.position.set(0, y, z);

    // 1. Vertebral Body (kidney/oval shaped cylinder with anterior convex surface)
    const bodyGeo = new THREE.CylinderGeometry(0.38, 0.42, dy * 0.65, 18);
    bodyGeo.scale(1.25, 1.0, 0.88);
    const bodyMesh = new THREE.Mesh(bodyGeo, boneMat);
    vertGroup.add(bodyMesh);

    // 2. Intervertebral Disc
    if (i < count - 1) {
      const discGeo = new THREE.CylinderGeometry(0.39, 0.40, dy * 0.28, 18);
      discGeo.scale(1.25, 1.0, 0.88);
      const discMesh = new THREE.Mesh(discGeo, discMat);
      discMesh.position.y = dy * 0.48;
      vertGroup.add(discMesh);
    }

    // 3. Bilateral Pedicles & Transverse Processes (pointing laterally)
    const tpGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.55, 8);
    tpGeo.rotateZ(Math.PI / 2);
    const tpLeft = new THREE.Mesh(tpGeo, boneMat);
    tpLeft.position.set(-0.55, 0.05, -0.18);
    vertGroup.add(tpLeft);

    const tpRight = new THREE.Mesh(tpGeo, boneMat);
    tpRight.position.set(0.55, 0.05, -0.18);
    vertGroup.add(tpRight);

    // 4. Spinous Process (pointing posteriorly and inferiorly)
    const spGeo = new THREE.ConeGeometry(0.12, 0.55, 8);
    spGeo.rotateX(-Math.PI / 2.6);
    const spMesh = new THREE.Mesh(spGeo, boneMat);
    spMesh.position.set(0, -0.08, -0.5);
    vertGroup.add(spMesh);

    spineGroup.add(vertGroup);
  }

  return spineGroup;
}

/**
 * Builds an authentic Pelvic Girdle for retroperitoneal & abdominal anatomy:
 * Flared iliac wings/crests, sacrum, pubic symphysis, and ischial spines.
 */
function buildArticulatedPelvis(yLevel: number = -1.6): THREE.Group {
  const pelvisGroup = new THREE.Group();
  pelvisGroup.name = 'PelvicGirdle';
  pelvisGroup.position.set(0, yLevel, 0);

  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xede8df,
    roughness: 0.45,
    metalness: 0.08
  });

  // Sacrum (wedge-shaped triangular bone postero-medial)
  const sacrumGeo = new THREE.ConeGeometry(0.65, 1.3, 14);
  sacrumGeo.scale(1.1, 1.0, 0.45);
  sacrumGeo.rotateX(Math.PI);
  const sacrum = new THREE.Mesh(sacrumGeo, boneMat);
  sacrum.position.set(0, 0.2, -0.65);
  pelvisGroup.add(sacrum);

  // Left & Right Flared Iliac Wings
  [-1, 1].forEach(side => {
    // Iliac Crest flare (curved extruded sheet)
    const iliumGeo = new THREE.TorusGeometry(1.05, 0.18, 10, 24, Math.PI * 0.7);
    iliumGeo.rotateZ(side * 0.45);
    iliumGeo.rotateY(side * 0.35);
    const ilium = new THREE.Mesh(iliumGeo, boneMat);
    ilium.position.set(side * 1.0, 0.35, -0.2);
    pelvisGroup.add(ilium);

    // Ischial & Pubic Ramus
    const pubisGeo = new THREE.CylinderGeometry(0.12, 0.14, 1.0, 10);
    pubisGeo.rotateZ(side * 0.75);
    const pubis = new THREE.Mesh(pubisGeo, boneMat);
    pubis.position.set(side * 0.45, -0.6, 0.15);
    pelvisGroup.add(pubis);
  });

  // Pubic Symphysis
  const symphGeo = new THREE.BoxGeometry(0.25, 0.35, 0.2);
  const symphMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
  const symph = new THREE.Mesh(symphGeo, symphMat);
  symph.position.set(0, -0.85, 0.45);
  pelvisGroup.add(symph);

  return pelvisGroup;
}

/**
 * Builds realistic Cranial Skull Base and Calvarium vault for Neurology & Ophthalmology.
 */
function buildArticulatedSkull(yLevel: number = 0.4): THREE.Group {
  const skullGroup = new THREE.Group();
  skullGroup.name = 'CranialSkull';
  skullGroup.position.set(0, yLevel, 0);

  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xede8df,
    roughness: 0.45,
    metalness: 0.08,
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide
  });

  // Calvarium vault dome
  const calvariumGeo = new THREE.SphereGeometry(1.85, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.58);
  calvariumGeo.scale(0.92, 1.08, 1.18);
  const calvarium = new THREE.Mesh(calvariumGeo, boneMat);
  calvarium.position.set(0, 0.2, 0);
  skullGroup.add(calvarium);

  // Skull Base (sphenoid, temporal, and occipital ridges)
  const baseGeo = new THREE.CylinderGeometry(1.5, 1.2, 0.5, 20);
  baseGeo.scale(0.9, 1.0, 1.1);
  const baseMesh = new THREE.Mesh(baseGeo, boneMat);
  baseMesh.position.set(0, -0.4, 0.1);
  skullGroup.add(baseMesh);

  // Bilateral Orbital Rims
  const orbitMat = new THREE.MeshStandardMaterial({ color: 0xd6cfc4, roughness: 0.4 });
  [-0.62, 0.62].forEach(x => {
    const orbitRim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.08, 8, 20), orbitMat);
    orbitRim.position.set(x, -0.22, 1.45);
    skullGroup.add(orbitRim);
  });

  return skullGroup;
}

/**
 * Builds a contoured, translucent medical holographic skin envelope for full anatomical spatial reference.
 */
function buildPatientSkinEnvelope(
  yCenter: number = 0,
  height: number = 7.5,
  scaleX: number = 1.35,
  scaleZ: number = 0.78,
  opacity: number = 0.22
): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(2.1, 2.5, height, 32, 20, true);
  geo.scale(scaleX, 1.0, scaleZ);

  // Smooth anatomical tapering
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    let x = pos.getX(i);
    let z = pos.getZ(i);

    // Chest/torso bulge
    if (y > 0 && y < 2.5) {
      const b = Math.sin((y / 2.5) * Math.PI) * 0.15;
      if (z > 0) z += b;
      x *= 1.0 + b * 0.2;
    }
    // Waist pinch
    if (y > -2.0 && y <= 0) {
      const w = Math.sin(((y + 2.0) / 2.0) * Math.PI) * 0.12;
      x *= (1.0 - w);
    }
    pos.setX(i, x);
    pos.setZ(i, z);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.5,
    metalness: 0.12,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'PatientSkinEnvelope';
  mesh.position.y = yCenter;
  return mesh;
}

/**
 * Creates an authentic reniform (kidney-bean) geometry with convex lateral border,
 * rounded superior/inferior poles, and concave medial renal hilum.
 */
function buildReniformKidney(isRight: boolean): THREE.Mesh {
  const kidneyGeo = new THREE.SphereGeometry(0.88, 28, 24);
  kidneyGeo.scale(0.68, 1.28, 0.58);

  const pos = kidneyGeo.attributes.position;
  const sideSign = isRight ? 1 : -1;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    let z = pos.getZ(i);

    // Indent medial hilum where x is towards midline
    const isMedial = isRight ? (x < 0.1) : (x > -0.1);
    if (isMedial && Math.abs(y) < 0.55) {
      const hilumIndent = (1.0 - Math.abs(y) / 0.55) * 0.28;
      pos.setX(i, x + (isRight ? hilumIndent : -hilumIndent));
      z *= (1.0 - hilumIndent * 0.8);
      pos.setZ(i, z);
    }
  }
  kidneyGeo.computeVertexNormals();

  const renalMat = new THREE.MeshStandardMaterial({
    color: 0x854d0e, // Rich reddish-brown renal parenchymal hue
    roughness: 0.38,
    metalness: 0.12
  });

  const mesh = new THREE.Mesh(kidneyGeo, renalMat);
  mesh.rotation.z = isRight ? -0.14 : 0.14;
  return mesh;
}

// ============================================================================
// MASTER SYSTEM 3D BUILDER FOR ALL 8 SYSTEMS
// ============================================================================

export function buildSystem3D(systemId: OrganSystemId): System3DScene {
  if (systemId === 'cardiovascular') {
    const built = buildCoronaryAnatomy();
    const map = new Map<string, THREE.Mesh>();
    built.vesselMeshes.forEach((mesh, id) => {
      map.set(id, mesh);
    });

    const layerGroups = new Map<string, THREE.Object3D>();
    if (built.heartGroup) layerGroups.set('heart', built.heartGroup);
    if (built.aortaMesh) layerGroups.set('aorta', built.aortaMesh);
    if (built.ribsMesh) layerGroups.set('skeleton', built.ribsMesh);
    if (built.spineMesh) layerGroups.set('spine', built.spineMesh);
    if (built.bodyMesh) layerGroups.set('bodySkin', built.bodyMesh);
    if (built.catheterMesh) layerGroups.set('catheter', built.catheterMesh);
    if (built.beamMesh) layerGroups.set('beamCone', built.beamMesh);

    return {
      rootGroup: built.rootGroup,
      primaryGroup: built.heartGroup,
      interactiveMeshes: map,
      layerGroups,
      bodyMesh: built.bodyMesh,
      skeletonGroup: built.ribsMesh,
      animator: (t) => {
        if (built.heartGroup) {
          const pulse = 1.0 + Math.sin(t * 4.2) * 0.02;
          built.heartGroup.scale.set(pulse, pulse, pulse);
        }
      }
    };
  }

  const rootGroup = new THREE.Group();
  rootGroup.name = `System_${systemId}`;
  const interactiveMeshes = new Map<string, THREE.Mesh>();
  const layerGroups = new Map<string, THREE.Object3D>();
  const organMeshes: THREE.Mesh[] = [];

  const primaryGroup = new THREE.Group();
  primaryGroup.name = 'PrimaryStructures';
  rootGroup.add(primaryGroup);
  layerGroups.set('primary', primaryGroup);

  // Common Clinical Grid Base
  const grid = new THREE.GridHelper(14, 28, 0x1e293b, 0x0f172a);
  grid.position.y = -3.8;
  rootGroup.add(grid);

  let slicingPlaneMesh: THREE.Mesh | undefined;
  let bodyMesh: THREE.Mesh | undefined;
  let skeletonGroup: THREE.Group | undefined;
  let updateSlice: ((sliceIndex: number) => void) | undefined;
  let animator: ((elapsedTime: number) => void) | undefined;

  // Reusable PBR Vessel Material Generator
  const createVesselMat = (color: number) => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.32,
    metalness: 0.20,
    emissive: color,
    emissiveIntensity: 0.18
  });

  // Reusable Slicing Plane Generator with Luminous Glowing Edge
  const createSlicingPlane = (yMin: number, yMax: number, size: number = 4.2): THREE.Mesh => {
    const planeGeo = new THREE.PlaneGeometry(size, size);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
      roughness: 0.3,
      metalness: 0.1
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = Math.PI / 2; // Axial horizontal plane
    plane.position.y = (yMin + yMax) / 2;

    // Glowing border edges
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(planeGeo),
      new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
    );
    plane.add(edges);

    updateSlice = (sliceIndex: number) => {
      const t = Math.max(0, Math.min(100, sliceIndex)) / 100;
      plane.position.y = yMin + t * (yMax - yMin);
    };

    rootGroup.add(plane);
    layerGroups.set('slicingPlane', plane);
    return plane;
  };

  switch (systemId) {
    // ========================================================================
    // 1. NEPHROLOGY: Kidneys, Vasculature, Ureters, Bladder, Prostate & Pelvis
    // ========================================================================
    case 'nephrology': {
      // 1. Skeletal Foundation: Lumbar Spine & Articulated Pelvis
      const spine = buildArticulatedSpine(-2.0, 1.6, 7, 0.2);
      const pelvis = buildArticulatedPelvis(-1.7);
      const skelGroup = new THREE.Group();
      skelGroup.add(spine);
      skelGroup.add(pelvis);
      rootGroup.add(skelGroup);
      skeletonGroup = skelGroup;
      layerGroups.set('skeleton', skelGroup);

      // 2. Patient Abdominal/Pelvic Skin Envelope
      const skin = buildPatientSkinEnvelope(-0.4, 6.8, 1.4, 0.85, 0.20);
      rootGroup.add(skin);
      bodyMesh = skin;
      layerGroups.set('bodySkin', skin);

      // 3. Great Retroperitoneal Vessels: Abdominal Aorta & IVC
      const aortaCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 1.6, -0.42),
        new THREE.Vector3(-0.05, 0.4, -0.45),
        new THREE.Vector3(-0.08, -0.8, -0.48),
        new THREE.Vector3(-0.35, -1.5, -0.42) // Left iliac branch
      ]);
      const aorta = new THREE.Mesh(new THREE.TubeGeometry(aortaCurve, 20, 0.16, 14, false), createVesselMat(0xef4444));
      primaryGroup.add(aorta);

      const rIliacCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.08, -0.8, -0.48),
        new THREE.Vector3(0.35, -1.5, -0.42)
      ]);
      const rIliac = new THREE.Mesh(new THREE.TubeGeometry(rIliacCurve, 10, 0.12, 12, false), createVesselMat(0xef4444));
      primaryGroup.add(rIliac);

      const ivcCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.25, 1.6, -0.38),
        new THREE.Vector3(0.22, 0.4, -0.40),
        new THREE.Vector3(0.18, -0.8, -0.42),
        new THREE.Vector3(0.42, -1.5, -0.38)
      ]);
      const ivc = new THREE.Mesh(new THREE.TubeGeometry(ivcCurve, 20, 0.18, 14, false), createVesselMat(0x2563eb));
      primaryGroup.add(ivc);

      const vascGroup = new THREE.Group();
      vascGroup.add(aorta);
      vascGroup.add(rIliac);
      vascGroup.add(ivc);
      layerGroups.set('vasculature', vascGroup);

      // 4. Bilateral Kidneys (Reniform bean geometry with hilum)
      const rKidney = buildReniformKidney(true);
      rKidney.position.set(1.42, 0.22, -0.32); // Slightly lower due to liver
      rKidney.name = 'Renal_RightKidney';
      primaryGroup.add(rKidney);
      organMeshes.push(rKidney);

      const lKidney = buildReniformKidney(false);
      lKidney.position.set(-1.42, 0.48, -0.32); // Higher at T12-L2
      lKidney.name = 'Renal_LeftKidney';
      primaryGroup.add(lKidney);
      organMeshes.push(lKidney);

      const kidneyGroup = new THREE.Group();
      kidneyGroup.add(rKidney);
      kidneyGroup.add(lKidney);
      layerGroups.set('kidneys', kidneyGroup);

      // 5. Main Renal Arteries (MRA) & Renal Veins
      const lMraCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.06, 0.45, -0.45),
        new THREE.Vector3(-0.65, 0.46, -0.38),
        new THREE.Vector3(-1.25, 0.48, -0.32)
      ]);
      const lMraMesh = new THREE.Mesh(new THREE.TubeGeometry(lMraCurve, 14, 0.08, 12, false), createVesselMat(0xef4444));
      lMraMesh.name = 'Renal_MRA';
      primaryGroup.add(lMraMesh);
      interactiveMeshes.set('renal-artery-main', lMraMesh);

      const rMraCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.04, 0.25, -0.45),
        new THREE.Vector3(0.55, 0.24, -0.48), // Courses posterior to IVC
        new THREE.Vector3(1.25, 0.22, -0.32)
      ]);
      const rMraMesh = new THREE.Mesh(new THREE.TubeGeometry(rMraCurve, 14, 0.08, 12, false), createVesselMat(0xef4444));
      primaryGroup.add(rMraMesh);

      // 6. Renal Pelvis & Bilateral Ureters coursing down to Bladder
      const pelvisMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
      const lPelvisGeo = new THREE.ConeGeometry(0.24, 0.55, 12);
      lPelvisGeo.rotateZ(Math.PI / 2.8);
      const lPelvis = new THREE.Mesh(lPelvisGeo, pelvisMat);
      lPelvis.position.set(-1.18, 0.46, -0.32);
      lPelvis.name = 'Renal_Pelvis';
      primaryGroup.add(lPelvis);
      interactiveMeshes.set('renal-pelvis', lPelvis);

      const ureterMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.35 });
      const lUreterCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.15, 0.42, -0.32),
        new THREE.Vector3(-0.95, -0.4, -0.35),
        new THREE.Vector3(-0.65, -1.1, -0.25),
        new THREE.Vector3(-0.25, -1.65, 0.15)
      ]);
      const lUreter = new THREE.Mesh(new THREE.TubeGeometry(lUreterCurve, 18, 0.045, 10, false), ureterMat);
      primaryGroup.add(lUreter);

      const rUreterCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.15, 0.18, -0.32),
        new THREE.Vector3(0.95, -0.4, -0.35),
        new THREE.Vector3(0.65, -1.1, -0.25),
        new THREE.Vector3(0.25, -1.65, 0.15)
      ]);
      const rUreter = new THREE.Mesh(new THREE.TubeGeometry(rUreterCurve, 18, 0.045, 10, false), ureterMat);
      primaryGroup.add(rUreter);

      // 7. Urinary Bladder
      const bladderGeo = new THREE.SphereGeometry(0.65, 20, 18);
      bladderGeo.scale(1.15, 0.95, 0.95);
      const bladderMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.4,
        metalness: 0.1,
        transparent: true,
        opacity: 0.45
      });
      const bladder = new THREE.Mesh(bladderGeo, bladderMat);
      bladder.position.set(0, -1.62, 0.22);
      primaryGroup.add(bladder);

      const ureterGroup = new THREE.Group();
      ureterGroup.add(lPelvis);
      ureterGroup.add(lUreter);
      ureterGroup.add(rUreter);
      ureterGroup.add(bladder);
      layerGroups.set('ureters', ureterGroup);

      // 8. Prostate Gland (Peripheral Zone PZ and Transition Zone TZ)
      const pzMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.45,
        metalness: 0.15
      });
      const tzMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.45,
        metalness: 0.15
      });

      const pzGeo = new THREE.SphereGeometry(0.52, 18, 16);
      pzGeo.scale(1.15, 0.85, 0.75);
      const pzMesh = new THREE.Mesh(pzGeo, pzMat);
      pzMesh.position.set(0, -2.18, 0.15);
      pzMesh.name = 'Uro_PZ';
      primaryGroup.add(pzMesh);
      interactiveMeshes.set('prostate-pz', pzMesh);

      const tzGeo = new THREE.SphereGeometry(0.32, 16, 14);
      const tzMesh = new THREE.Mesh(tzGeo, tzMat);
      tzMesh.position.set(0, -2.15, 0.22);
      tzMesh.name = 'Uro_TZ';
      primaryGroup.add(tzMesh);
      interactiveMeshes.set('prostate-tz', tzMesh);

      const prostateGroup = new THREE.Group();
      prostateGroup.add(pzMesh);
      prostateGroup.add(tzMesh);
      layerGroups.set('prostate', prostateGroup);

      // 9. Axial MPR Slicing Plane (moving from pelvis -2.4 to upper abdomen 1.5)
      slicingPlaneMesh = createSlicingPlane(-2.4, 1.5, 4.4);
      break;
    }

    // ========================================================================
    // 2. NEUROLOGY: Cerebral Hemispheres, Ventricles, Circle of Willis, Skull
    // ========================================================================
    case 'neurology': {
      // 1. Skull Vault & Calvarium
      const skull = buildArticulatedSkull(0.4);
      rootGroup.add(skull);
      skeletonGroup = skull;
      layerGroups.set('skull', skull);

      // 2. Head & Neck Skin Envelope
      const skin = buildPatientSkinEnvelope(0.2, 5.0, 1.15, 1.25, 0.18);
      rootGroup.add(skin);
      bodyMesh = skin;
      layerGroups.set('bodySkin', skin);

      // 3. Cerebral Hemispheres (sculpted with gyral/sulcal relief)
      const brainMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7, // Royal neuro purple
        roughness: 0.65,
        metalness: 0.08,
        transparent: true,
        opacity: 0.42
      });

      const leftHemiGeo = new THREE.SphereGeometry(1.65, 28, 24);
      leftHemiGeo.scale(0.85, 1.12, 1.25);
      // Gyral displacement bump
      const posL = leftHemiGeo.attributes.position;
      for (let i = 0; i < posL.count; i++) {
        const x = posL.getX(i), y = posL.getY(i), z = posL.getZ(i);
        const gyri = Math.sin(x * 6.0) * Math.cos(y * 6.0) * Math.sin(z * 6.0) * 0.045;
        posL.setX(i, x + gyri);
        posL.setY(i, y + gyri);
        posL.setZ(i, z + gyri);
      }
      leftHemiGeo.computeVertexNormals();
      const leftHemi = new THREE.Mesh(leftHemiGeo, brainMat);
      leftHemi.position.set(-0.62, 0.45, 0);
      primaryGroup.add(leftHemi);
      organMeshes.push(leftHemi);

      const rightHemiGeo = leftHemiGeo.clone();
      const rightHemi = new THREE.Mesh(rightHemiGeo, brainMat);
      rightHemi.position.set(0.62, 0.45, 0);
      primaryGroup.add(rightHemi);
      organMeshes.push(rightHemi);

      // 4. Cerebellum & Brainstem
      const cerebGeo = new THREE.SphereGeometry(0.85, 20, 16);
      cerebGeo.scale(1.4, 0.8, 0.85);
      const cerebMesh = new THREE.Mesh(cerebGeo, brainMat);
      cerebMesh.position.set(0, -0.65, -0.75);
      primaryGroup.add(cerebMesh);

      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.1, -0.1),
        new THREE.Vector3(0, -0.6, -0.3),
        new THREE.Vector3(0, -1.4, -0.45)
      ]);
      const stemMesh = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 14, 0.25, 14, false), brainMat);
      primaryGroup.add(stemMesh);

      const cortexGroup = new THREE.Group();
      cortexGroup.add(leftHemi);
      cortexGroup.add(rightHemi);
      cortexGroup.add(cerebMesh);
      cortexGroup.add(stemMesh);
      layerGroups.set('cortex', cortexGroup);

      // 5. C-Shaped Ventricular System (Lateral Ventricles)
      const ventMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.3,
        transparent: true,
        opacity: 0.65
      });
      [-0.32, 0.32].forEach(side => {
        const ventCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 0.45, 0.8, 0.35),  // Anterior horn
          new THREE.Vector3(side * 0.35, 0.65, 0.0),  // Body
          new THREE.Vector3(side * 0.55, 0.35, -0.55),// Trigone / Atrium
          new THREE.Vector3(side * 0.75, 0.05, -0.15) // Temporal horn
        ]);
        const ventMesh = new THREE.Mesh(new THREE.TubeGeometry(ventCurve, 16, 0.09, 10, false), ventMat);
        primaryGroup.add(ventMesh);
      });
      layerGroups.set('ventricles', ventMat as any);

      // 6. Complete Circle of Willis Arterial System
      const basilarCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -1.2, -0.42),
        new THREE.Vector3(0, -0.55, -0.25),
        new THREE.Vector3(0, -0.1, -0.12)
      ]);
      const basilarMesh = new THREE.Mesh(new THREE.TubeGeometry(basilarCurve, 16, 0.095, 12, false), createVesselMat(0x8b5cf6));
      basilarMesh.name = 'Neuro_Basilar';
      primaryGroup.add(basilarMesh);
      interactiveMeshes.set('basilar', basilarMesh);

      // Internal Carotid Arteries (ICA)
      const icaLCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.65, -1.2, 0.05),
        new THREE.Vector3(-0.52, -0.4, 0.12),
        new THREE.Vector3(-0.42, 0.05, 0.08)
      ]);
      const icaLMesh = new THREE.Mesh(new THREE.TubeGeometry(icaLCurve, 16, 0.095, 12, false), createVesselMat(0xef4444));
      icaLMesh.name = 'Neuro_ICA';
      primaryGroup.add(icaLMesh);
      interactiveMeshes.set('ica', icaLMesh);

      const icaRCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.65, -1.2, 0.05),
        new THREE.Vector3(0.52, -0.4, 0.12),
        new THREE.Vector3(0.42, 0.05, 0.08)
      ]);
      const icaRMesh = new THREE.Mesh(new THREE.TubeGeometry(icaRCurve, 16, 0.095, 12, false), createVesselMat(0xef4444));
      primaryGroup.add(icaRMesh);

      // MCA M1 & M2 Segments
      const mcaM1RCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.42, 0.05, 0.08),
        new THREE.Vector3(0.85, 0.12, 0.14),
        new THREE.Vector3(1.28, 0.22, 0.12)
      ]);
      const mcaM1RMesh = new THREE.Mesh(new THREE.TubeGeometry(mcaM1RCurve, 16, 0.085, 12, false), createVesselMat(0xf59e0b));
      mcaM1RMesh.name = 'Neuro_M1';
      primaryGroup.add(mcaM1RMesh);
      interactiveMeshes.set('mca-m1', mcaM1RMesh);

      const mcaM2RCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.28, 0.22, 0.12),
        new THREE.Vector3(1.52, 0.52, 0.22),
        new THREE.Vector3(1.75, 0.92, 0.32)
      ]);
      const mcaM2RMesh = new THREE.Mesh(new THREE.TubeGeometry(mcaM2RCurve, 16, 0.065, 12, false), createVesselMat(0xeab308));
      mcaM2RMesh.name = 'Neuro_M2';
      primaryGroup.add(mcaM2RMesh);
      interactiveMeshes.set('mca-m2', mcaM2RMesh);

      // ACA A1 & A2
      const acaRCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.42, 0.05, 0.08),
        new THREE.Vector3(0.2, 0.22, 0.28),
        new THREE.Vector3(0.06, 0.32, 0.38),
        new THREE.Vector3(0.06, 0.82, 0.55)
      ]);
      const acaRMesh = new THREE.Mesh(new THREE.TubeGeometry(acaRCurve, 16, 0.075, 10, false), createVesselMat(0x06b6d4));
      acaRMesh.name = 'Neuro_ACA';
      primaryGroup.add(acaRMesh);
      interactiveMeshes.set('aca-a1', acaRMesh);

      const cowGroup = new THREE.Group();
      cowGroup.add(basilarMesh);
      cowGroup.add(icaLMesh);
      cowGroup.add(icaRMesh);
      cowGroup.add(mcaM1RMesh);
      cowGroup.add(mcaM2RMesh);
      cowGroup.add(acaRMesh);
      layerGroups.set('circleOfWillis', cowGroup);

      // 7. CT Axial Slicing Plane
      slicingPlaneMesh = createSlicingPlane(-1.2, 1.8, 4.0);
      break;
    }

    // ========================================================================
    // 3. PULMONOLOGY: Tracheobronchial Tree, 5 Lung Lobes, Vasculature, Ribs
    // ========================================================================
    case 'pulmonology': {
      // 1. Thoracic Spine & Ribs
      const spine = buildArticulatedSpine(-2.2, 2.2, 10, 0.28);
      rootGroup.add(spine);
      skeletonGroup = spine;
      layerGroups.set('skeleton', spine);

      // 2. Patient Thoracic Skin Envelope
      const skin = buildPatientSkinEnvelope(0.2, 6.8, 1.35, 0.82, 0.20);
      rootGroup.add(skin);
      bodyMesh = skin;
      layerGroups.set('bodySkin', skin);

      // 3. Trachea with 16 Articulated Cartilage Rings & Carina
      const airwayMat = (col: number) => new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.35,
        metalness: 0.12,
        emissive: col,
        emissiveIntensity: 0.15
      });

      const trachCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 2.5, 0.12),
        new THREE.Vector3(0, 1.4, 0.05),
        new THREE.Vector3(0, 0.5, -0.08) // Carina bifurcation at T4/T5
      ]);
      const trachMesh = new THREE.Mesh(new THREE.TubeGeometry(trachCurve, 20, 0.20, 18, false), airwayMat(0x06b6d4));
      trachMesh.name = 'Pulm_Trachea';
      primaryGroup.add(trachMesh);
      interactiveMeshes.set('trachea', trachMesh);

      // 16 Tracheal Cartilage Rings
      for (let r = 0; r < 14; r++) {
        const ringY = 0.65 + r * 0.13;
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.22, 0.035, 8, 20, Math.PI * 1.6),
          airwayMat(0xe2e8f0)
        );
        ring.position.set(0, ringY, 0.08);
        ring.rotation.x = Math.PI / 2;
        primaryGroup.add(ring);
      }

      // Right Mainstem Bronchus (shorter, wider, ~25° angle)
      const rmbCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.5, -0.08),
        new THREE.Vector3(0.42, 0.15, -0.15),
        new THREE.Vector3(0.88, -0.32, -0.22)
      ]);
      const rmbMesh = new THREE.Mesh(new THREE.TubeGeometry(rmbCurve, 16, 0.15, 14, false), airwayMat(0x3b82f6));
      rmbMesh.name = 'Pulm_RMB';
      primaryGroup.add(rmbMesh);
      interactiveMeshes.set('right-main-bronchus', rmbMesh);

      // Right Upper Lobe Bronchus (eparterial)
      const rulCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.42, 0.15, -0.15),
        new THREE.Vector3(0.72, 0.55, -0.12),
        new THREE.Vector3(1.15, 0.85, -0.10)
      ]);
      const rulMesh = new THREE.Mesh(new THREE.TubeGeometry(rulCurve, 14, 0.10, 12, false), airwayMat(0x10b981));
      rulMesh.name = 'Pulm_RUL';
      primaryGroup.add(rulMesh);
      interactiveMeshes.set('right-upper-lobe', rulMesh);

      // Left Mainstem Bronchus (longer, narrower, ~45° angle)
      const lmbCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.5, -0.08),
        new THREE.Vector3(-0.48, 0.18, -0.12),
        new THREE.Vector3(-1.02, -0.25, -0.18)
      ]);
      const lmbMesh = new THREE.Mesh(new THREE.TubeGeometry(lmbCurve, 16, 0.13, 14, false), airwayMat(0x8b5cf6));
      lmbMesh.name = 'Pulm_LMB';
      primaryGroup.add(lmbMesh);
      interactiveMeshes.set('left-main-bronchus', lmbMesh);

      const airwaysGroup = new THREE.Group();
      airwaysGroup.add(trachMesh);
      airwaysGroup.add(rmbMesh);
      airwaysGroup.add(rulMesh);
      airwaysGroup.add(lmbMesh);
      layerGroups.set('airways', airwaysGroup);

      // 4. Bilateral Anatomical Lung Lobes (3 lobes right, 2 lobes left)
      const lungMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.75,
        metalness: 0.08,
        transparent: true,
        opacity: 0.32,
        depthWrite: false
      });

      // Right Lung (Superior, Middle, Inferior Lobes)
      const rLung = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 20), lungMat);
      rLung.scale.set(0.92, 1.45, 0.88);
      rLung.position.set(1.22, 0.35, -0.2);
      primaryGroup.add(rLung);
      organMeshes.push(rLung);

      // Left Lung (Superior with cardiac notch, Inferior Lobe)
      const lLung = new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 20), lungMat);
      lLung.scale.set(0.85, 1.40, 0.82);
      lLung.position.set(-1.22, 0.35, -0.2);
      primaryGroup.add(lLung);
      organMeshes.push(lLung);

      const lungGroup = new THREE.Group();
      lungGroup.add(rLung);
      lungGroup.add(lLung);
      layerGroups.set('lungs', lungGroup);

      // 5. Pulmonary Arteries & Veins
      const paCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.1, 0.25),
        new THREE.Vector3(0.5, 0.35, -0.05),
        new THREE.Vector3(1.1, 0.3, -0.2)
      ]);
      const paMesh = new THREE.Mesh(new THREE.TubeGeometry(paCurve, 14, 0.12, 12, false), createVesselMat(0x0284c7));
      primaryGroup.add(paMesh);
      layerGroups.set('pulmArteries', paMesh);

      // 6. Chest CT Axial Slicing Plane
      slicingPlaneMesh = createSlicingPlane(-1.6, 2.2, 4.6);
      break;
    }

    // ========================================================================
    // 4. GASTROENTEROLOGY: Liver Couinaud Lobes, Gallbladder, Biliary Tree
    // ========================================================================
    case 'gastroenterology': {
      // 1. Lower Spine & Pelvis
      const spine = buildArticulatedSpine(-2.0, 1.8, 8, 0.22);
      rootGroup.add(spine);
      skeletonGroup = spine;
      layerGroups.set('skeleton', spine);

      // 2. Abdominal Skin Envelope
      const skin = buildPatientSkinEnvelope(0.0, 6.2, 1.4, 0.85, 0.20);
      rootGroup.add(skin);
      bodyMesh = skin;
      layerGroups.set('bodySkin', skin);

      // 3. Anatomical Liver (Couinaud Lobes)
      const liverMat = new THREE.MeshStandardMaterial({
        color: 0x991b1b, // Hepatic mahogany/red-brown
        roughness: 0.42,
        metalness: 0.12
      });

      // Right Lobe (Segments V, VI, VII, VIII)
      const rLobeGeo = new THREE.SphereGeometry(1.5, 24, 20);
      rLobeGeo.scale(1.25, 0.95, 0.85);
      const rLobe = new THREE.Mesh(rLobeGeo, liverMat);
      rLobe.position.set(0.75, 0.65, 0.1);
      primaryGroup.add(rLobe);
      organMeshes.push(rLobe);

      // Left Lobe (Segments II, III)
      const lLobeGeo = new THREE.SphereGeometry(1.05, 20, 18);
      lLobeGeo.scale(1.15, 0.75, 0.65);
      const lLobe = new THREE.Mesh(lLobeGeo, liverMat);
      lLobe.position.set(-0.75, 0.75, 0.15);
      primaryGroup.add(lLobe);
      organMeshes.push(lLobe);

      // Couinaud Segment IV (Medial Segment)
      const seg4Geo = new THREE.BoxGeometry(0.75, 0.85, 0.65);
      const seg4Mat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 });
      const seg4Mesh = new THREE.Mesh(seg4Geo, seg4Mat);
      seg4Mesh.position.set(-0.08, 0.55, 0.25);
      seg4Mesh.name = 'GI_Seg4';
      primaryGroup.add(seg4Mesh);
      interactiveMeshes.set('couinaud-iv', seg4Mesh);

      const liverGroup = new THREE.Group();
      liverGroup.add(rLobe);
      liverGroup.add(lLobe);
      liverGroup.add(seg4Mesh);
      layerGroups.set('liver', liverGroup);

      // 4. Gallbladder with Fundus, Body, and Neck
      const gbGeo = new THREE.ConeGeometry(0.32, 0.95, 14);
      gbGeo.scale(1.0, 1.0, 0.75);
      gbGeo.rotateX(Math.PI / 1.4);
      const gbMat = new THREE.MeshStandardMaterial({
        color: 0x65a30d, // Bile olive-green
        roughness: 0.35,
        metalness: 0.15
      });
      const gbMesh = new THREE.Mesh(gbGeo, gbMat);
      gbMesh.position.set(0.48, 0.18, 0.45);
      primaryGroup.add(gbMesh);

      // Cystic Duct
      const cdCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.42, 0.38, 0.35),
        new THREE.Vector3(0.28, 0.32, 0.28),
        new THREE.Vector3(0.12, 0.22, 0.22)
      ]);
      const cdMesh = new THREE.Mesh(new THREE.TubeGeometry(cdCurve, 12, 0.045, 10, false), gbMat);
      cdMesh.name = 'GI_CysticDuct';
      primaryGroup.add(cdMesh);
      interactiveMeshes.set('cystic-duct', cdMesh);

      // Cystic Artery
      const caCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.05, 0.42, 0.15),
        new THREE.Vector3(0.22, 0.38, 0.22),
        new THREE.Vector3(0.38, 0.42, 0.32)
      ]);
      const caMesh = new THREE.Mesh(new THREE.TubeGeometry(caCurve, 12, 0.038, 10, false), createVesselMat(0xef4444));
      caMesh.name = 'GI_CysticArtery';
      primaryGroup.add(caMesh);
      interactiveMeshes.set('cystic-artery', caMesh);

      // Common Bile Duct (CBD)
      const cbdCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.12, 0.45, 0.18),
        new THREE.Vector3(0.12, 0.1, 0.22),
        new THREE.Vector3(0.15, -0.65, 0.25) // Into ampulla
      ]);
      const cbdMesh = new THREE.Mesh(new THREE.TubeGeometry(cbdCurve, 16, 0.065, 12, false), gbMat);
      cbdMesh.name = 'GI_CBD';
      primaryGroup.add(cbdMesh);
      interactiveMeshes.set('common-bile-duct', cbdMesh);

      const biliaryGroup = new THREE.Group();
      biliaryGroup.add(gbMesh);
      biliaryGroup.add(cdMesh);
      biliaryGroup.add(caMesh);
      biliaryGroup.add(cbdMesh);
      layerGroups.set('biliary', biliaryGroup);

      // 5. Laparoscopic / CT Slicing Plane
      slicingPlaneMesh = createSlicingPlane(-1.2, 1.6, 4.4);
      break;
    }

    // ========================================================================
    // 5. MUSCULOSKELETAL: Femur Condyles, Tibia Plateau, Patella, Menisci, ACL
    // ========================================================================
    case 'musculoskeletal': {
      const boneMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.38,
        metalness: 0.10
      });
      const cartMat = new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        roughness: 0.25,
        metalness: 0.15
      });
      const ligMat = (col: number) => new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.32,
        metalness: 0.20
      });

      // 1. Distal Femur with Medial & Lateral Condyles and Trochlear Groove
      const femurShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.88, 2.2, 20), boneMat);
      femurShaft.position.set(0, 1.8, 0);
      primaryGroup.add(femurShaft);

      // Medial Condyle
      const medCondyle = new THREE.Mesh(new THREE.SphereGeometry(0.62, 18, 16), cartMat);
      medCondyle.scale.set(0.85, 1.1, 1.3);
      medCondyle.position.set(-0.55, 0.55, -0.15);
      primaryGroup.add(medCondyle);

      // Lateral Condyle
      const latCondyle = new THREE.Mesh(new THREE.SphereGeometry(0.58, 18, 16), cartMat);
      latCondyle.scale.set(0.85, 1.1, 1.3);
      latCondyle.position.set(0.55, 0.55, -0.15);
      primaryGroup.add(latCondyle);

      // 2. Proximal Tibia Plateau & Intercondylar Eminence
      const tibiaShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.72, 2.4, 20), boneMat);
      tibiaShaft.position.set(0, -1.6, 0);
      primaryGroup.add(tibiaShaft);

      const tibiaPlateau = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.05, 0.45, 24), boneMat);
      tibiaPlateau.scale.set(1.15, 1.0, 0.88);
      tibiaPlateau.position.set(0, -0.32, 0);
      primaryGroup.add(tibiaPlateau);

      // 3. Patella (kneecap)
      const patellaGeo = new THREE.SphereGeometry(0.48, 18, 16);
      patellaGeo.scale(1.1, 1.25, 0.5);
      const patella = new THREE.Mesh(patellaGeo, boneMat);
      patella.position.set(0, 0.52, 0.85);
      primaryGroup.add(patella);

      // Patellar Tendon
      const ptGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.95, 12);
      const ptMesh = new THREE.Mesh(ptGeo, ligMat(0xe2e8f0));
      ptMesh.position.set(0, -0.05, 0.82);
      primaryGroup.add(ptMesh);

      const bonesGroup = new THREE.Group();
      bonesGroup.add(femurShaft);
      bonesGroup.add(medCondyle);
      bonesGroup.add(latCondyle);
      bonesGroup.add(tibiaShaft);
      bonesGroup.add(tibiaPlateau);
      bonesGroup.add(patella);
      bonesGroup.add(ptMesh);
      layerGroups.set('bones', bonesGroup);

      // 4. Anterior Cruciate Ligament (ACL)
      const aclCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.45, 0.55, -0.28),  // Medial lateral condyle
        new THREE.Vector3(0.18, 0.12, -0.05),
        new THREE.Vector3(-0.25, -0.22, 0.25) // Anterior tibia spine
      ]);
      const aclMesh = new THREE.Mesh(new THREE.TubeGeometry(aclCurve, 16, 0.088, 12, false), ligMat(0xef4444));
      aclMesh.name = 'MSK_ACL';
      primaryGroup.add(aclMesh);
      interactiveMeshes.set('acl', aclMesh);

      // 5. Posterior Cruciate Ligament (PCL)
      const pclCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.40, 0.48, 0.10), // Lateral medial condyle
        new THREE.Vector3(-0.15, 0.08, -0.15),
        new THREE.Vector3(0.22, -0.28, -0.35) // Posterior tibia
      ]);
      const pclMesh = new THREE.Mesh(new THREE.TubeGeometry(pclCurve, 16, 0.095, 12, false), ligMat(0x3b82f6));
      pclMesh.name = 'MSK_PCL';
      primaryGroup.add(pclMesh);
      interactiveMeshes.set('pcl', pclMesh);

      // 6. Medial Meniscus (C-shaped fibrocartilage ring)
      const mmGeo = new THREE.TorusGeometry(0.58, 0.14, 10, 24, Math.PI * 0.92);
      const mmMesh = new THREE.Mesh(mmGeo, ligMat(0x10b981));
      mmMesh.rotation.x = Math.PI / 2;
      mmMesh.position.set(-0.48, -0.14, -0.05);
      mmMesh.name = 'MSK_MM';
      primaryGroup.add(mmMesh);
      interactiveMeshes.set('medial-meniscus', mmMesh);

      // Lateral Meniscus (O-shaped fibrocartilage)
      const lmGeo = new THREE.TorusGeometry(0.52, 0.13, 10, 24, Math.PI * 1.6);
      const lmMesh = new THREE.Mesh(lmGeo, ligMat(0x10b981));
      lmMesh.rotation.x = Math.PI / 2;
      lmMesh.position.set(0.48, -0.14, -0.05);
      primaryGroup.add(lmMesh);

      const ligGroup = new THREE.Group();
      ligGroup.add(aclMesh);
      ligGroup.add(pclMesh);
      ligGroup.add(mmMesh);
      ligGroup.add(lmMesh);
      layerGroups.set('ligaments', ligGroup);

      // 7. Sagittal MRI Slicing Plane
      slicingPlaneMesh = createSlicingPlane(-1.5, 1.5, 3.8);
      break;
    }

    // ========================================================================
    // 6. OBSTETRICS: 20-Week Fetal Phantom, Skull (BPD), Spine, Limbs, Placenta
    // ========================================================================
    case 'obstetrics': {
      // 1. Gravid Uterus Wall & Amniotic Sac
      const uterusGeo = new THREE.SphereGeometry(2.4, 28, 24);
      uterusGeo.scale(1.1, 1.25, 0.95);
      const uterusMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        roughness: 0.55,
        transparent: true,
        opacity: 0.18,
        depthWrite: false
      });
      const uterus = new THREE.Mesh(uterusGeo, uterusMat);
      rootGroup.add(uterus);
      layerGroups.set('uterus', uterus);

      // 2. Placenta (discoid vascular plate on anterior/fundal wall)
      const placGeo = new THREE.CylinderGeometry(1.2, 1.25, 0.28, 20);
      placGeo.rotateZ(0.4);
      const placMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.45 });
      const placenta = new THREE.Mesh(placGeo, placMat);
      placenta.position.set(-1.1, 1.4, 0.4);
      primaryGroup.add(placenta);

      // 3. Fetal Skull (BPD / Head Circumference Plane)
      const skullMat = new THREE.MeshStandardMaterial({ color: 0xe9d5ff, roughness: 0.35 });
      const headGeo = new THREE.SphereGeometry(1.05, 24, 20);
      headGeo.scale(0.88, 1.15, 1.25);
      const headMesh = new THREE.Mesh(headGeo, skullMat);
      headMesh.position.set(-0.25, 1.35, 0);
      headMesh.name = 'Fetal_Head';
      primaryGroup.add(headMesh);
      interactiveMeshes.set('fetal-bpd-thalamus', headMesh);
      organMeshes.push(headMesh);

      // 4. Curved Fetal Spine
      const spineCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.25, 0.85, -0.3),
        new THREE.Vector3(0.2, 0.2, -0.45),
        new THREE.Vector3(0.45, -0.5, -0.3),
        new THREE.Vector3(0.2, -1.2, 0.1)
      ]);
      const fetalSpine = new THREE.Mesh(new THREE.TubeGeometry(spineCurve, 20, 0.12, 12, false), skullMat);
      primaryGroup.add(fetalSpine);

      // 5. Fetal Abdomen (AC Plane)
      const abdMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        roughness: 0.5,
        transparent: true,
        opacity: 0.42
      });
      const abdMesh = new THREE.Mesh(new THREE.SphereGeometry(0.98, 20, 18), abdMat);
      abdMesh.position.set(0.15, -0.35, 0.12);
      abdMesh.name = 'Fetal_Abdomen';
      primaryGroup.add(abdMesh);
      interactiveMeshes.set('fetal-ac-plane', abdMesh);
      organMeshes.push(abdMesh);

      // 6. Fetal Femur Bone (FL Caliper)
      const femurBone = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.2, 12), skullMat);
      femurBone.position.set(0.65, -1.35, 0.25);
      femurBone.rotation.z = 0.55;
      femurBone.name = 'Fetal_Femur';
      primaryGroup.add(femurBone);
      interactiveMeshes.set('fetal-femur-diaphysis', femurBone);

      // 7. Helical Umbilical Cord
      const cordCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.15, -0.35, 0.25),
        new THREE.Vector3(-0.2, -0.1, 0.5),
        new THREE.Vector3(-0.6, 0.6, 0.5),
        new THREE.Vector3(-1.0, 1.2, 0.4)
      ]);
      const cordMesh = new THREE.Mesh(new THREE.TubeGeometry(cordCurve, 24, 0.065, 10, false), createVesselMat(0x38bdf8));
      primaryGroup.add(cordMesh);

      // 8. Ultrasound Slicing Plane
      slicingPlaneMesh = createSlicingPlane(-1.6, 1.8, 4.4);
      break;
    }

    // ========================================================================
    // 7. OPHTHALMOLOGY & ENT: Eyeball, Cornea, Lens, Retina, Optic Nerve
    // ========================================================================
    case 'ophthalmology_ent': {
      // 1. Orbital Rim & Cavity
      const orbitRim = new THREE.Mesh(
        new THREE.TorusGeometry(1.85, 0.22, 12, 32),
        new THREE.MeshStandardMaterial({ color: 0xede8df, roughness: 0.45 })
      );
      orbitRim.position.set(0, 0, 0.85);
      rootGroup.add(orbitRim);
      layerGroups.set('orbit', orbitRim);

      // 2. Scleral Shell (Ocular Globe)
      const scleraMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.22,
        metalness: 0.05
      });
      const globe = new THREE.Mesh(new THREE.SphereGeometry(1.45, 32, 28), scleraMat);
      primaryGroup.add(globe);
      organMeshes.push(globe);

      // 3. Anterior Cornea Dome (Transparent glass-like dome)
      const corneaMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.45
      });
      const cornea = new THREE.Mesh(
        new THREE.SphereGeometry(0.78, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.45),
        corneaMat
      );
      cornea.position.set(0, 0, 1.25);
      primaryGroup.add(cornea);

      // 4. Colored Iris & Pupil Aperture
      const irisMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 });
      const iris = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.72, 24), irisMat);
      iris.position.set(0, 0, 1.22);
      primaryGroup.add(iris);

      // 5. Crystalline Biconvex Lens
      const lensMat = new THREE.MeshStandardMaterial({
        color: 0xf0fdf4,
        roughness: 0.15,
        transparent: true,
        opacity: 0.65
      });
      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.48, 20, 16), lensMat);
      lens.scale.set(1.0, 1.0, 0.55);
      lens.position.set(0, 0, 0.98);
      primaryGroup.add(lens);

      // 6. Posterior Retina & Foveal Depression
      const foveaGeo = new THREE.SphereGeometry(0.38, 18, 16);
      const foveaMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25 });
      const foveaMesh = new THREE.Mesh(foveaGeo, foveaMat);
      foveaMesh.position.set(0, 0, -1.40);
      foveaMesh.scale.set(1.0, 0.45, 0.35);
      foveaMesh.name = 'Eye_Fovea';
      primaryGroup.add(foveaMesh);
      interactiveMeshes.set('foveal-pit', foveaMesh);

      // Retinal Pigment Epithelium (RPE)
      const rpeGeo = new THREE.TorusGeometry(0.85, 0.08, 10, 24);
      const rpeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35 });
      const rpeMesh = new THREE.Mesh(rpeGeo, rpeMat);
      rpeMesh.position.set(0, 0, -1.35);
      rpeMesh.name = 'Eye_RPE';
      primaryGroup.add(rpeMesh);
      interactiveMeshes.set('rpe-photoreceptors', rpeMesh);

      // 7. Optic Nerve (Cranial Nerve II) with Central Retinal Vasculature
      const nerveCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.35, 0.15, -1.42),
        new THREE.Vector3(-0.55, 0.25, -2.2),
        new THREE.Vector3(-0.75, 0.35, -3.0)
      ]);
      const nerveMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
      const nerveMesh = new THREE.Mesh(new THREE.TubeGeometry(nerveCurve, 16, 0.22, 14, false), nerveMat);
      primaryGroup.add(nerveMesh);

      // 8. 4 Rectus Extraocular Muscles
      const muscleMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.45 });
      [
        { pos: [0, 1.4, 0], rot: [0, 0, 0] },     // Superior
        { pos: [0, -1.4, 0], rot: [0, 0, 0] },    // Inferior
        { pos: [-1.4, 0, 0], rot: [0, 0, Math.PI / 2] }, // Medial
        { pos: [1.4, 0, 0], rot: [0, 0, Math.PI / 2] }  // Lateral
      ].forEach(m => {
        const musc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 2.2, 10), muscleMat);
        musc.position.set(m.pos[0], m.pos[1], -0.6);
        musc.rotation.set(m.rot[0], m.rot[1], m.rot[2]);
        musc.rotateX(Math.PI / 2);
        primaryGroup.add(musc);
      });

      // 9. OCT Linear Slicing Scan Line
      slicingPlaneMesh = createSlicingPlane(-1.5, 1.5, 3.5);
      break;
    }
  }

  return {
    rootGroup,
    primaryGroup,
    interactiveMeshes,
    layerGroups,
    slicingPlaneMesh,
    bodyMesh,
    skeletonGroup,
    organMeshes,
    updateSlice,
    animator
  };
}
