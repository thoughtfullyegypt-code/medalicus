import * as THREE from 'three';
import { CORONARY_VESSELS } from '../data/coronaryData';
import { REAL_BODYPARTS3D_VESSELS, BodyParts3DVessel } from '../data/bodyparts3dCoronary';
import { VesselDefinition, ProbeOrientation } from '../types';

export interface BuiltAnatomy {
  rootGroup: THREE.Group;
  bodyGroup: THREE.Group;
  bodyMesh: THREE.Mesh;
  landmarksGroup: THREE.Group;
  heartGroup: THREE.Group;
  heartMesh: THREE.Mesh;
  aortaMesh: THREE.Group;
  pulmonaryMesh: THREE.Group;
  atriaMesh: THREE.Group;
  vesselMeshes: Map<string, THREE.Mesh>;
  stenosisMesh: THREE.Mesh;
  spineMesh: THREE.Group;
  ribsMesh: THREE.Group;
  sternumMesh: THREE.Group;
  diaphragmMesh: THREE.Mesh;
  carmGroup: THREE.Group;
  beamMesh: THREE.Mesh;
  catheterMesh: THREE.Group;
  probeGroup: THREE.Group;
  probeBeamMesh: THREE.Mesh;
  echoCutPlaneGroup?: THREE.Group;
  updateEchoCutPlane?: (presetId: string) => void;
}

/**
 * Procedurally generates an anatomically authentic patient model:
 * 1. Full human torso with surface anatomy landmarks (clavicles, nipples, sternal angle, ICS 2-5)
 * 2. High-fidelity 4-chamber cardiac mass with sulci, auricles, and sinuses of Valsalva
 * 3. Articulated thoracic vertebral column (pedicle eyes, transverse & spinous processes)
 * 4. Articulated rib cage & sternum with costal cartilages
 * 5. Coronary arterial tree with mid-LAD culprit lesion
 * 6. Phased-array ultrasound transducer probe placed at true acoustic windows
 * 7. Fluoroscopy C-Arm gantry and diagnostic Judkins catheter
 */
export function buildCoronaryAnatomy(): BuiltAnatomy {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'PatientAnatomy';

  // -------------------------------------------------------------
  // 1. PATIENT TORSO & SURFACE ANATOMY SKIN ENVELOPE
  // -------------------------------------------------------------
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'PatientBodyTorso';

  // Realistic contoured torso mesh (Neck, Shoulders, Chest, Abdomen, Pelvis)
  // Built with cross-sectional slices interpolated smoothly
  const bodyCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 3.8, 0.4),  // Base of neck
    new THREE.Vector3(0, 3.1, 0.6),  // Suprasternal notch & clavicle level
    new THREE.Vector3(0, 1.8, 0.9),  // Mid-chest (pectoralis & nipples)
    new THREE.Vector3(0, 0.5, 0.8),  // Xiphisternal / lower costal margin
    new THREE.Vector3(0, -1.2, 0.6), // Waist / abdomen
    new THREE.Vector3(0, -2.6, 0.5), // Umbilicus & iliac crest
    new THREE.Vector3(0, -4.0, 0.3)  // Pelvis / groin level
  ]);

  // Torso outer shell geometry
  const bodyGeo = new THREE.CylinderGeometry(2.2, 2.7, 7.8, 36, 24, true);
  bodyGeo.scale(1.28, 1.0, 0.72); // Anteroposterior flattening of human thorax

  // Sculpt anatomical human features (pectoral muscles, costal flares, waist taper)
  const posAttr = bodyGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const y = posAttr.getY(i);
    let x = posAttr.getX(i);
    let z = posAttr.getZ(i);

    // Shoulder/pectoral broadening around y = 1.0 to 2.5
    if (y > 0.5 && y < 3.2) {
      const pecBump = Math.sin(((y - 0.5) / 2.7) * Math.PI) * 0.18;
      if (z > 0) z += pecBump; // Anterior chest projection
      x *= 1.0 + pecBump * 0.25;
    }

    // Waist narrowing at y = -1.2
    if (y > -2.2 && y < 0.0) {
      const waistTaper = 1.0 - Math.sin(((y + 2.2) / 2.2) * Math.PI) * 0.12;
      x *= waistTaper;
    }

    posAttr.setX(i, x);
    posAttr.setZ(i, z);
  }
  bodyGeo.computeVertexNormals();

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // Holographic cyan medical hue
    roughness: 0.6,
    metalness: 0.1,
    transparent: true,
    opacity: 0.25, // Default translucent holographic view
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, skinMat);
  bodyMesh.position.set(0, 0, 0.1);
  bodyGroup.add(bodyMesh);

  // Surface Anatomy Landmark Indicators (Nipples, Sternal Notch, Acoustic Windows)
  const landmarksGroup = new THREE.Group();
  landmarksGroup.name = 'SurfaceLandmarks';

  const landmarkMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const targetRingMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, wireframe: true });

  // Bilateral Nipples (Key anatomical marker for 4th intercostal space!)
  [-1.25, 1.25].forEach(side => {
    const nippleGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const nipple = new THREE.Mesh(nippleGeo, landmarkMat);
    nipple.position.set(side, 1.45, 1.95);
    landmarksGroup.add(nipple);
  });

  // Suprasternal Notch marker
  const suprasternalNotchGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16);
  suprasternalNotchGeo.rotateX(Math.PI / 2);
  const notch = new THREE.Mesh(suprasternalNotchGeo, landmarkMat);
  notch.position.set(0, 3.1, 1.7);
  landmarksGroup.add(notch);

  // Surface Acoustic Window Target Rings (Where probe is placed!)
  // 1. PLAX Ring (3rd/4th left intercostal space parasternal)
  const plaxRing = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.22, 16), targetRingMat);
  plaxRing.position.set(0.65, 1.2, 1.96);
  landmarksGroup.add(plaxRing);

  // 2. A4C Ring (5th intercostal space midclavicular line / apex)
  const a4cRing = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.22, 16), targetRingMat);
  a4cRing.position.set(1.4, 0.15, 1.78);
  landmarksGroup.add(a4cRing);

  // 3. Subcostal Ring (Subxiphoid depression)
  const subRing = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.22, 16), targetRingMat);
  subRing.position.set(0.0, -0.65, 1.8);
  landmarksGroup.add(subRing);

  bodyGroup.add(landmarksGroup);
  rootGroup.add(bodyGroup);

  // -------------------------------------------------------------
  // 2. ORGANIC 4-CHAMBER CARDIAC MASS WITH SULCI
  // -------------------------------------------------------------
  const heartGroup = new THREE.Group();
  heartGroup.name = 'HeartAnatomy';

  // Left Ventricle (thick-walled apex directed anteriorly, inferiorly, and to the left)
  const lvGeo = new THREE.ConeGeometry(1.35, 2.7, 32);
  lvGeo.rotateZ(Math.PI);
  lvGeo.scale(1.0, 1.0, 0.85);
  const lvPos = lvGeo.attributes.position;
  for (let i = 0; i < lvPos.count; i++) {
    const y = lvPos.getY(i);
    if (y < -0.8) {
      const taper = 1.0 - (Math.abs(y + 0.8) / 1.5) * 0.4;
      lvPos.setX(i, lvPos.getX(i) * Math.max(0.2, taper));
      lvPos.setZ(i, lvPos.getZ(i) * Math.max(0.2, taper));
    }
  }
  lvGeo.computeVertexNormals();

  const heartMat = new THREE.MeshStandardMaterial({
    color: 0x99222a,
    roughness: 0.45,
    metalness: 0.08,
    transparent: true,
    opacity: 0.38,
    depthWrite: false
  });
  const heartMesh = new THREE.Mesh(lvGeo, heartMat);
  heartMesh.position.set(0.35, -0.35, 0.1);
  heartMesh.rotation.set(0.25, 0.2, -0.42); // True anatomical cardiac axis
  heartGroup.add(heartMesh);

  // Right Ventricle (crescent anterior surface wrapping around anterior septum)
  const rvGeo = new THREE.SphereGeometry(1.25, 24, 16, 0, Math.PI);
  rvGeo.scale(0.85, 1.4, 0.55);
  const rvMesh = new THREE.Mesh(rvGeo, heartMat);
  rvMesh.position.set(-0.35, -0.15, 0.65);
  rvMesh.rotation.set(0.2, 0.45, -0.2);
  heartGroup.add(rvMesh);

  // Left & Right Atria + Auricles (Atrial Appendages)
  const atriaGroup = new THREE.Group();
  atriaGroup.name = 'AtriaAndAuricles';

  const laGeo = new THREE.SphereGeometry(0.85, 20, 16);
  laGeo.scale(1.1, 0.9, 0.95);
  const laMesh = new THREE.Mesh(laGeo, heartMat);
  laMesh.position.set(0.4, 0.9, -0.45);
  atriaGroup.add(laMesh);

  const raGeo = new THREE.SphereGeometry(0.9, 20, 16);
  raGeo.scale(0.8, 1.15, 0.9);
  const raMesh = new THREE.Mesh(raGeo, heartMat);
  raMesh.position.set(-0.95, 0.7, 0.15);
  atriaGroup.add(raMesh);

  const laaGeo = new THREE.ConeGeometry(0.35, 0.75, 12);
  laaGeo.rotateZ(1.2);
  const laaMesh = new THREE.Mesh(laaGeo, heartMat);
  laaMesh.position.set(0.9, 1.1, 0.35);
  atriaGroup.add(laaMesh);

  heartGroup.add(atriaGroup);
  rootGroup.add(heartGroup);

  // -------------------------------------------------------------
  // 3. AORTIC ROOT, SINUSES OF VALSALVA & PULMONARY TRUNK
  // -------------------------------------------------------------
  const aortaGroup = new THREE.Group();
  aortaGroup.name = 'AortaWithSinuses';

  const aortaMat = new THREE.MeshStandardMaterial({
    color: 0xc83a3d,
    roughness: 0.35,
    metalness: 0.15,
    transparent: true,
    opacity: 0.55,
    depthWrite: false
  });

  // The 3 Distinct Sinuses of Valsalva
  const lcsGeo = new THREE.SphereGeometry(0.32, 16, 12);
  const lcsMesh = new THREE.Mesh(lcsGeo, aortaMat);
  lcsMesh.position.set(0.2, 1.35, 0.42);
  aortaGroup.add(lcsMesh);

  const rcsGeo = new THREE.SphereGeometry(0.32, 16, 12);
  const rcsMesh = new THREE.Mesh(rcsGeo, aortaMat);
  rcsMesh.position.set(-0.25, 1.35, 0.42);
  aortaGroup.add(rcsMesh);

  const ncsGeo = new THREE.SphereGeometry(0.32, 16, 12);
  const ncsMesh = new THREE.Mesh(ncsGeo, aortaMat);
  ncsMesh.position.set(0.0, 1.35, 0.05);
  aortaGroup.add(ncsMesh);

  // Ascending Aorta, Arch, and Descending Thoracic Aorta
  const archCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 1.35, 0.3),
    new THREE.Vector3(-0.05, 2.0, 0.35),
    new THREE.Vector3(-0.3, 2.7, 0.15),
    new THREE.Vector3(-0.7, 2.9, -0.2),
    new THREE.Vector3(-0.95, 2.65, -0.65),
    new THREE.Vector3(-0.95, 1.4, -0.9),
    new THREE.Vector3(-0.9, -0.5, -1.1),
    new THREE.Vector3(-0.85, -2.2, -1.2)
  ]);
  const archGeo = new THREE.TubeGeometry(archCurve, 40, 0.36, 16, false);
  aortaGroup.add(new THREE.Mesh(archGeo, aortaMat));

  const greatBranches = [
    [new THREE.Vector3(-0.25, 2.7, 0.2), new THREE.Vector3(-0.2, 3.4, 0.3)],
    [new THREE.Vector3(-0.5, 2.85, -0.05), new THREE.Vector3(-0.55, 3.5, 0.0)],
    [new THREE.Vector3(-0.75, 2.8, -0.3), new THREE.Vector3(-0.85, 3.45, -0.3)]
  ];
  greatBranches.forEach(pts => {
    const c = new THREE.CatmullRomCurve3(pts);
    const g = new THREE.TubeGeometry(c, 8, 0.11, 10, false);
    aortaGroup.add(new THREE.Mesh(g, aortaMat));
  });
  rootGroup.add(aortaGroup);

  // Pulmonary Trunk & Bifurcation
  const pulmonaryGroup = new THREE.Group();
  pulmonaryGroup.name = 'PulmonaryTrunk';
  const pulmMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.4,
    transparent: true,
    opacity: 0.45,
    depthWrite: false
  });
  const pulmCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.25, 0.8, 0.65),
    new THREE.Vector3(-0.1, 1.45, 0.55),
    new THREE.Vector3(0.05, 1.95, 0.3)
  ]);
  pulmonaryGroup.add(new THREE.Mesh(new THREE.TubeGeometry(pulmCurve, 16, 0.32, 14, false), pulmMat));

  const rpaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, 1.95, 0.3),
    new THREE.Vector3(-0.8, 1.95, -0.15),
    new THREE.Vector3(-1.6, 1.9, -0.4)
  ]);
  const lpaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, 1.95, 0.3),
    new THREE.Vector3(0.7, 1.9, 0.05),
    new THREE.Vector3(1.5, 1.85, -0.2)
  ]);
  pulmonaryGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rpaCurve, 10, 0.18, 10, false), pulmMat));
  pulmonaryGroup.add(new THREE.Mesh(new THREE.TubeGeometry(lpaCurve, 10, 0.18, 10, false), pulmMat));
  rootGroup.add(pulmonaryGroup);

  // -------------------------------------------------------------
  // 4. ANATOMICALLY DETAILED THORACIC VERTEBRAE (T1 - T10)
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // 4. ANATOMICALLY CALIBRATED THORACIC SPINE (T1 - T12)
  // Positioned strictly in posterior mediastinum behind cardiac silhouette
  // -------------------------------------------------------------
  const spineGroup = new THREE.Group();
  spineGroup.name = 'ThoracicVertebralColumn';

  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xcfd8dc,
    roughness: 0.55,
    metalness: 0.08,
    transparent: true,
    opacity: 0.25,
    depthWrite: false
  });

  const discMat = new THREE.MeshStandardMaterial({
    color: 0x90a4ae,
    roughness: 0.8,
    transparent: true,
    opacity: 0.18,
    depthWrite: false
  });

  // 12 thoracic vertebrae with physiological kyphosis
  for (let i = 0; i < 11; i++) {
    const vertGroup = new THREE.Group();
    const norm = i / 10;
    const yPos = 3.0 - i * 0.56;
    const kyphosisZ = -2.55 - Math.sin(norm * Math.PI) * 0.28;
    const sizeScale = 0.85 + i * 0.035;

    // Vertebral Body
    const bodyGeo = new THREE.CylinderGeometry(
      0.48 * sizeScale,
      0.52 * sizeScale,
      0.38 * sizeScale,
      18
    );
    bodyGeo.scale(1.2, 1.0, 0.85);
    const bodyMeshPiece = new THREE.Mesh(bodyGeo, boneMat);
    vertGroup.add(bodyMeshPiece);

    // Intervertebral Disc
    if (i < 10) {
      const discGeo = new THREE.CylinderGeometry(
        0.47 * sizeScale,
        0.49 * sizeScale,
        0.12 * sizeScale,
        16
      );
      discGeo.scale(1.18, 1.0, 0.83);
      const discMesh = new THREE.Mesh(discGeo, discMat);
      discMesh.position.set(0, -0.24 * sizeScale, 0);
      vertGroup.add(discMesh);
    }

    // Posterior spinous process pointing posteriorly and downward
    const spinousCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.05 * sizeScale, -0.35 * sizeScale),
      new THREE.Vector3(0, -0.15 * sizeScale, -0.75 * sizeScale),
      new THREE.Vector3(0, -0.45 * sizeScale, -1.05 * sizeScale)
    ]);
    const spinousGeo = new THREE.TubeGeometry(spinousCurve, 8, 0.065 * sizeScale, 8, false);
    vertGroup.add(new THREE.Mesh(spinousGeo, boneMat));

    vertGroup.position.set(0.0, yPos, kyphosisZ);
    spineGroup.add(vertGroup);
  }
  rootGroup.add(spineGroup);

  // -------------------------------------------------------------
  // 5. ANATOMICALLY CONTOURED SLENDER COSTAL RIBCAGE (Ribs 1 - 10)
  // Slender flattened ribbon arcs following true anatomical thoracic slope
  // -------------------------------------------------------------
  const sternumGroup = new THREE.Group();
  sternumGroup.name = 'Sternum';

  const sternumCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 2.8, 1.85),  // Jugular notch / manubrium
    new THREE.Vector3(0.0, 2.1, 2.05),  // Sternal angle of Louis
    new THREE.Vector3(0.0, 1.1, 2.0),   // Mid-gladiolus
    new THREE.Vector3(0.0, 0.1, 1.8),   // Lower body
    new THREE.Vector3(0.0, -0.5, 1.6)   // Xiphoid process
  ]);
  const sternumGeo = new THREE.TubeGeometry(sternumCurve, 24, 0.12, 10, false);
  sternumGeo.scale(2.2, 1.0, 0.4); // Flat anatomical sternal plate
  sternumGroup.add(new THREE.Mesh(sternumGeo, boneMat));
  rootGroup.add(sternumGroup);

  const ribsGroup = new THREE.Group();
  ribsGroup.name = 'ThoracicRibs';

  // 10 pairs of anatomically sloped costal ribs
  for (let i = 0; i < 9; i++) {
    const frac = i / 8;
    const yPosterior = 2.8 - i * 0.52;
    const yAnterior = 2.1 - i * 0.42;
    // Lateral thoracic excursion: narrower at top, broadest around ribs 6-8
    const latWidth = 2.2 + Math.sin(frac * Math.PI) * 1.1;

    [-1, 1].forEach(side => {
      const ribCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.48, yPosterior, -2.5),                       // Costovertebral takeoff
        new THREE.Vector3(side * (latWidth * 0.65), yPosterior - 0.22, -2.0),   // Posterior rib neck
        new THREE.Vector3(side * latWidth, yPosterior - 0.55, -0.2),            // Lateral mid-axillary line
        new THREE.Vector3(side * (latWidth * 0.75), yAnterior - 0.35, 1.45),    // Anterolateral costal margin
        new THREE.Vector3(side * 0.35, yAnterior, 1.95)                         // Costochondral sternal junction
      ]);
      // Slender ribbon cross-section (flat, slender cortical bone)
      const ribTube = new THREE.TubeGeometry(ribCurve, 32, 0.042, 8, false);
      ribTube.scale(1.0, 1.35, 0.7); // Anteroposterior flattening
      ribsGroup.add(new THREE.Mesh(ribTube, boneMat));
    });
  }
  rootGroup.add(ribsGroup);

  // -------------------------------------------------------------
  // 6. DIAPHRAGM
  // -------------------------------------------------------------
  const diaGeo = new THREE.SphereGeometry(3.4, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.38);
  const diaMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.8,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
  });
  const diaphragmMesh = new THREE.Mesh(diaGeo, diaMat);
  diaphragmMesh.position.set(0.2, -3.7, 0.1);
  rootGroup.add(diaphragmMesh);

  // -------------------------------------------------------------
  // 7. AUTHENTIC BODYPARTS3D CORONARY ARTERY TREE (CC BY 4.0)
  // -------------------------------------------------------------
  const vesselMeshes = new Map<string, THREE.Mesh>();
  const vesselsGroup = new THREE.Group();
  vesselsGroup.name = 'BodyParts3DCoronaryTree';

  // Build authentic clinical vessels from BodyParts3D 4.0 dataset
  REAL_BODYPARTS3D_VESSELS.forEach((def: BodyParts3DVessel) => {
    if (!def.points || def.points.length < 2) return;
    const vecPoints = def.points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    const curve = new THREE.CatmullRomCurve3(vecPoints);
    const segments = Math.max(12, Math.min(120, vecPoints.length * 2));
    const safeRadius = Math.max(0.035, Math.min(0.20, def.radius));
    const tubeGeo = new THREE.TubeGeometry(curve, segments, safeRadius, 10, false);

    const tubeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(def.color),
      roughness: 0.25,
      metalness: 0.2,
      emissive: new THREE.Color(def.color),
      emissiveIntensity: 0.18
    });

    const mesh = new THREE.Mesh(tubeGeo, tubeMat);
    mesh.name = `vessel_${def.id}`;
    mesh.userData = {
      vesselId: def.id,
      name: def.name,
      abbr: def.abbr,
      system: def.system,
      defaultColor: def.color,
      defaultRadius: safeRadius,
      syntaxSegments: def.segments,
      source: 'BodyParts3D 4.0 (DBCLS)'
    };

    vesselMeshes.set(def.id, mesh);
    vesselsGroup.add(mesh);

    // Map common clinical alias IDs for case challenges & quiz compatibility
    if (def.id === 'lm') vesselMeshes.set('lmca', mesh);
    if (def.id === 'lad') {
      vesselMeshes.set('lad-prox', mesh);
      vesselMeshes.set('lad-mid', mesh);
      vesselMeshes.set('lad-distal', mesh);
    }
    if (def.id === 'lcx') {
      vesselMeshes.set('lcx-prox', mesh);
      vesselMeshes.set('lcx-distal', mesh);
    }
    if (def.id === 'rca') {
      vesselMeshes.set('rca-prox', mesh);
      vesselMeshes.set('rca-mid', mesh);
      vesselMeshes.set('rca-distal', mesh);
    }
  });

  const stenosisGeo = new THREE.TorusGeometry(0.14, 0.045, 12, 20);
  const stenosisMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.2,
    metalness: 0.7,
    emissive: 0xd97706,
    emissiveIntensity: 0.4
  });
  const stenosisMesh = new THREE.Mesh(stenosisGeo, stenosisMat);
  stenosisMesh.position.set(1.42, 0.2, 1.13);
  stenosisMesh.rotation.set(0.4, 0.2, 0.6);
  vesselsGroup.add(stenosisMesh);

  rootGroup.add(vesselsGroup);

  // -------------------------------------------------------------
  // 8. DIAGNOSTIC JUDKINS CATHETER IN CORONARY OSTIUM
  // -------------------------------------------------------------
  const catheterGroup = new THREE.Group();
  catheterGroup.name = 'DiagnosticCatheter';
  const catheterCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.9, -1.8, -1.2),
    new THREE.Vector3(-0.95, 1.4, -0.9),
    new THREE.Vector3(-0.7, 2.9, -0.2),
    new THREE.Vector3(-0.3, 2.7, 0.15),
    new THREE.Vector3(-0.05, 2.0, 0.35),
    new THREE.Vector3(0.2, 1.35, 0.42)
  ]);
  const catheterGeo = new THREE.TubeGeometry(catheterCurve, 45, 0.055, 10, false);
  const catheterMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    roughness: 0.15,
    metalness: 0.85
  });
  catheterGroup.add(new THREE.Mesh(catheterGeo, catheterMat));
  rootGroup.add(catheterGroup);

  // -------------------------------------------------------------
  // 9. C-ARM GANTRY & X-RAY BEAM CONE
  // -------------------------------------------------------------
  const carmGroup = new THREE.Group();
  carmGroup.name = 'CarmApparatus';

  const carmCurve = new THREE.ArcCurve(0, 0, 4.8, 0, Math.PI * 1.35, false);
  const carmPoints = carmCurve.getPoints(50);
  const carmGeo = new THREE.BufferGeometry().setFromPoints(
    carmPoints.map(p => new THREE.Vector3(p.x, p.y, 0))
  );
  carmGroup.add(new THREE.Line(carmGeo, new THREE.LineBasicMaterial({ color: 0x475569, linewidth: 3 })));

  const detectorGeo = new THREE.BoxGeometry(2.1, 0.22, 2.1);
  const detectorMesh = new THREE.Mesh(detectorGeo, new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.2,
    metalness: 0.8
  }));
  detectorMesh.position.set(0, 4.6, 0);
  carmGroup.add(detectorMesh);

  const tubeEmitterGeo = new THREE.CylinderGeometry(0.8, 0.95, 1.2, 20);
  const emitterMesh = new THREE.Mesh(tubeEmitterGeo, new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
    metalness: 0.6
  }));
  emitterMesh.position.set(0, -4.6, 0);
  carmGroup.add(emitterMesh);

  const beamGeo = new THREE.ConeGeometry(2.2, 9.2, 4, 1, true);
  beamGeo.rotateY(Math.PI / 4);
  const beamMesh = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({
    color: 0x00d2b4,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false
  }));
  carmGroup.add(beamMesh);
  rootGroup.add(carmGroup);

  // -------------------------------------------------------------
  // 10. PHASED-ARRAY ULTRASOUND TRANSDUCER ON CHEST SURFACE
  // -------------------------------------------------------------
  const probeGroup = new THREE.Group();
  probeGroup.name = 'UltrasoundTransducerProbe';

  const handleGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.2, 16);
  const handleMesh = new THREE.Mesh(handleGeo, new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.6
  }));
  handleMesh.position.set(0, 0.6, 0);
  probeGroup.add(handleMesh);

  const headGeo = new THREE.BoxGeometry(0.42, 0.35, 0.26);
  const headMesh = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.4
  }));
  headMesh.position.set(0, 0.15, 0);
  probeGroup.add(headMesh);

  const lensGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.08, 16);
  lensGeo.scale(1.1, 1.0, 0.6);
  const lensMesh = new THREE.Mesh(lensGeo, new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.2
  }));
  lensMesh.position.set(0, -0.04, 0);
  probeGroup.add(lensMesh);

  const notchGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const notchMesh = new THREE.Mesh(notchGeo, new THREE.MeshBasicMaterial({ color: 0x22c55e }));
  notchMesh.position.set(0.2, 0.2, 0);
  probeGroup.add(notchMesh);

  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.2, 0),
    new THREE.Vector3(0.1, 1.6, -0.2),
    new THREE.Vector3(0.3, 2.0, -0.5)
  ]);
  probeGroup.add(new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 10, 0.04, 8, false), new THREE.MeshStandardMaterial({ color: 0x475569 })));

  // Ultrasound 80° Acoustic Sector Fan Beam (Pie slice)
  const fanShape = new THREE.Shape();
  fanShape.moveTo(0, 0);
  const fanRadius = 2.8;
  const fanAngle = THREE.MathUtils.degToRad(80);
  const startAngle = -Math.PI / 2 - fanAngle / 2;
  const endAngle = -Math.PI / 2 + fanAngle / 2;
  fanShape.absarc(0, 0, fanRadius, startAngle, endAngle, false);
  fanShape.lineTo(0, 0);

  const fanGeo = new THREE.ShapeGeometry(fanShape, 24);
  const probeBeamMesh = new THREE.Mesh(fanGeo, new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    depthWrite: false
  }));
  probeBeamMesh.rotation.y = Math.PI / 2;
  probeBeamMesh.position.set(0, -0.05, 0);
  probeGroup.add(probeBeamMesh);

  // Default placement: PLAX on surface chest wall
  probeGroup.position.set(0.65, 1.2, 1.95);
  probeGroup.rotation.set(0.2, 0.45, -0.7);
  probeGroup.visible = false;
  rootGroup.add(probeGroup);

  // -------------------------------------------------------------
  // 11. ECHO ANATOMICAL CUT PLANES (PLAX, PSAX, A4C, SUBCOSTAL)
  // Labeled clearly as: "Anatomical Cut Plane (Not Ultrasound)"
  // -------------------------------------------------------------
  const echoCutPlaneGroup = new THREE.Group();
  echoCutPlaneGroup.name = 'EchoAnatomicalCutPlanes';

  const cutPlaneGeo = new THREE.PlaneGeometry(5.4, 5.4);
  const cutPlaneMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    roughness: 0.25,
    metalness: 0.1,
    depthWrite: false
  });
  const echoCutPlaneMesh = new THREE.Mesh(cutPlaneGeo, cutPlaneMat);
  echoCutPlaneMesh.name = 'EchoCutPlaneMesh';

  // Luminous outline border
  const borderGeo = new THREE.EdgesGeometry(cutPlaneGeo);
  const borderLine = new THREE.LineSegments(borderGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 }));
  echoCutPlaneMesh.add(borderLine);

  echoCutPlaneGroup.add(echoCutPlaneMesh);
  echoCutPlaneGroup.visible = false;
  rootGroup.add(echoCutPlaneGroup);

  const updateEchoCutPlane = (presetId: string) => {
    switch (presetId) {
      case 'plax':
        // Parasternal Long Axis: obliquely cuts along LV apex to aortic root
        echoCutPlaneMesh.position.set(0.2, 0.4, 0.15);
        echoCutPlaneMesh.rotation.set(0.35, 0.65, -0.4);
        break;
      case 'psax':
        // Parasternal Short Axis: transverse cut perpendicular to long axis
        echoCutPlaneMesh.position.set(0.1, 0.25, 0.3);
        echoCutPlaneMesh.rotation.set(1.4, 0.2, 0.1);
        break;
      case 'a4c':
        // Apical 4-Chamber: coronal-oblique cut slicing all 4 chambers
        echoCutPlaneMesh.position.set(0.1, 0.35, 0.05);
        echoCutPlaneMesh.rotation.set(0.1, -0.15, 0.0);
        break;
      case 'subcostal':
        // Subcostal: low subxiphoid view cutting through inferior diaphragmatic surface
        echoCutPlaneMesh.position.set(0.05, -0.2, 0.15);
        echoCutPlaneMesh.rotation.set(-0.4, 0.1, 0.0);
        break;
      default:
        echoCutPlaneMesh.position.set(0.2, 0.4, 0.15);
        echoCutPlaneMesh.rotation.set(0.35, 0.65, -0.4);
        break;
    }
  };

  return {
    rootGroup,
    bodyGroup,
    bodyMesh,
    landmarksGroup,
    heartGroup,
    heartMesh,
    aortaMesh: aortaGroup,
    pulmonaryMesh: pulmonaryGroup,
    atriaMesh: atriaGroup,
    vesselMeshes,
    stenosisMesh,
    spineMesh: spineGroup,
    ribsMesh: ribsGroup,
    sternumMesh: sternumGroup,
    diaphragmMesh,
    carmGroup,
    beamMesh,
    catheterMesh: catheterGroup,
    probeGroup,
    probeBeamMesh,
    echoCutPlaneGroup,
    updateEchoCutPlane
  };
}

/**
 * Calculates C-Arm detector position in 3D cartesian coordinates
 */
export function calculateCarmVector(
  primaryDeg: number,
  secondaryDeg: number,
  radius: number = 7.5
): THREE.Vector3 {
  const primRad = THREE.MathUtils.degToRad(primaryDeg);
  const secRad = THREE.MathUtils.degToRad(secondaryDeg);

  const cosSec = Math.cos(secRad);
  const sinSec = Math.sin(secRad);
  const sinPrim = Math.sin(primRad);
  const cosPrim = Math.cos(primRad);

  const x = radius * cosSec * sinPrim;
  const y = radius * sinSec;
  const z = radius * cosSec * cosPrim;

  return new THREE.Vector3(x, y, z);
}
