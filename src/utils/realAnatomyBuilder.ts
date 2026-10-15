import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type { OrganSystemId } from '../types';
import type { System3DScene } from './proceduralSystemsBuilder';

/**
 * Browser-ready BodyParts3D-derived models and an Open3Dmodel skeleton.
 * Model URLs are pinned to a specific upstream commit, rather than tracking
 * a mutable "main" branch. Their source and licenses are documented in README.
 */
const SOURCE_COMMIT = 'e4d76fbb424d15e1364963528a082a78fa359161';
const SOURCE_ROOT = `https://raw.githubusercontent.com/yamz8/human-body-simulator/${SOURCE_COMMIT}/public`;
const MODEL_URLS = {
  organs: `${SOURCE_ROOT}/models/anatomy-organs.glb`,
  skin: `${SOURCE_ROOT}/models/anatomy-skin.glb`,
  skeleton: `${SOURCE_ROOT}/models/overview-skeleton.glb`
} as const;
const DRACO_PATH = `${SOURCE_ROOT}/draco/`;
const FLOOR_Y = -3.48;
const BODY_DEPTH = 0.4;
const BODY_HEIGHT = 6.717;

type LoadedGLTF = Awaited<ReturnType<GLTFLoader['loadAsync']>>;
const gltfCache = new Map<string, Promise<LoadedGLTF>>();

function loadAsset(url: string): Promise<LoadedGLTF> {
  let cached = gltfCache.get(url);
  if (!cached) {
    const draco = new DRACOLoader().setDecoderPath(DRACO_PATH);
    const loader = new GLTFLoader().setDRACOLoader(draco);
    cached = loader.loadAsync(url).finally(() => draco.dispose());
    gltfCache.set(url, cached);
  }
  return cached;
}

const ORGAN_COLORS: Record<string, number> = {
  brain: 0xd98599,
  lungs: 0xd98e98,
  heart: 0xbd3046,
  liver: 0x7d3039,
  stomach: 0xc97870,
  intestines: 0xd08a69,
  kidneys: 0x8f4854,
  gallbladder: 0x71a67a,
  'bile-duct': 0x95c5a0
};

const SYSTEM_ORGANS: Partial<Record<OrganSystemId, string[]>> = {
  neurology: ['brain'],
  pulmonology: ['lungs'],
  gastroenterology: ['liver', 'stomach', 'intestines', 'gallbladder', 'bile-duct'],
  nephrology: ['kidneys'],
  musculoskeletal: []
};

const BONE_FILTERS: Partial<Record<OrganSystemId, RegExp>> = {
  neurology: /skull|cranium|calvar|mandible|maxilla|sphenoid|temporal|frontal|parietal|occipital|ethmoid|nasal bone|zygomatic|lacrimal|palatine|vomer|concha|hyoid|os frontale|os parietale|os temporale/i,
  pulmonology: /rib|costae|sternum|vertebra|vertebrae|thoracic|clavicle|scapula|costal cartilage/i,
  gastroenterology: /rib|costae|sternum|vertebra|vertebrae|thoracic|lumbar|sacrum|costal cartilage/i,
  nephrology: /lumbar|vertebra|vertebrae|sacrum|ilium|ischium|pubis|pelvis|rib 11|rib 12/i
};

function getSemanticOrganId(name: string): string | null {
  const match = name.trim().match(/^([a-z][a-z0-9-]*)__([A-Z]+\d+)$/i);
  return match ? match[1].toLowerCase() : null;
}

function displayName(name: string): string {
  return name.replace(/__[A-Z]+\d+$/i, '').replaceAll('-', ' ').replaceAll('_', ' ').trim();
}

function createOrganMaterial(id: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: ORGAN_COLORS[id] ?? 0xc9877b,
    roughness: 0.68,
    metalness: 0.01
  });
}

function createSkinMaterial(opacity: number): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xc9877b,
    roughness: 0.68,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.FrontSide
  });
}

function placeAtSourceTransform(mesh: THREE.Mesh, source: THREE.Object3D): void {
  source.updateMatrixWorld(true);
  mesh.position.setFromMatrixPosition(source.matrixWorld);
  mesh.quaternion.setFromRotationMatrix(source.matrixWorld);
  mesh.scale.setFromMatrixScale(source.matrixWorld);
  mesh.updateMatrix();
  if (!mesh.geometry.getAttribute('normal')) mesh.geometry.computeVertexNormals();
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

function buildSkeletonLayer(
  sourceScene: THREE.Object3D,
  filter: RegExp | null,
  interactiveMeshes: Map<string, THREE.Mesh>,
  organMeshes: THREE.Mesh[]
): THREE.Group {
  sourceScene.updateMatrixWorld(true);
  const sourceBounds = new THREE.Box3().setFromObject(sourceScene);
  const size = sourceBounds.getSize(new THREE.Vector3());
  const scale = BODY_HEIGHT / Math.max(size.y, 0.001);
  const centerX = (Math.min(sourceBounds.min.x, -sourceBounds.max.x) + Math.max(sourceBounds.max.x, -sourceBounds.min.x)) / 2;
  const centerZ = (sourceBounds.min.z + sourceBounds.max.z) / 2;

  const root = new THREE.Group();
  root.name = 'Licensed anatomical skeleton';
  root.scale.setScalar(scale);
  root.position.set(-centerX * scale, FLOOR_Y - sourceBounds.min.y * scale, BODY_DEPTH - centerZ * scale);

  const selectedSourceMeshes: THREE.Mesh[] = [];
  sourceScene.traverse((object) => {
    if (!(object as THREE.Mesh).isMesh) return;
    const mesh = object as THREE.Mesh;
    const sourceName = mesh.name || 'Anatomical bone';
    if (!filter || filter.test(sourceName)) {
      selectedSourceMeshes.push(mesh);
    }
  });

  const material = new THREE.MeshStandardMaterial({ color: 0xd8d2c2, roughness: 0.67, metalness: 0.01 });
  const cartilageMaterial = new THREE.MeshStandardMaterial({ color: 0xb7aca0, roughness: 0.74 });
  const originals = new THREE.Group();
  originals.name = 'Source anatomical structures';
  const mirrored = new THREE.Group();
  mirrored.name = 'Mirrored contralateral structures';

  selectedSourceMeshes.forEach((sourceMesh) => {
    sourceMesh.updateWorldMatrix(true, false);
    const boneMaterial = /costal cartilage/i.test(sourceMesh.name) ? cartilageMaterial : material;
    const mesh = new THREE.Mesh(sourceMesh.geometry, boneMaterial);
    mesh.name = sourceMesh.name || 'Anatomical bone';
    mesh.position.setFromMatrixPosition(sourceMesh.matrixWorld);
    mesh.quaternion.setFromRotationMatrix(sourceMesh.matrixWorld);
    mesh.scale.setFromMatrixScale(sourceMesh.matrixWorld);
    mesh.userData.name = displayName(mesh.name);
    mesh.userData.defaultColor = '#d8d2c2';
    originals.add(mesh);
    organMeshes.push(mesh);
    interactiveMeshes.set(`bone:${mesh.name}`, mesh);

    // This atlas source only includes one side for many paired bones. Mirror
    // those explicitly labelled ".r" so the body is not visibly one-sided.
    if (/\.r\.?$/i.test(sourceMesh.name)) {
      const left = new THREE.Mesh(sourceMesh.geometry, boneMaterial);
      left.name = sourceMesh.name.trim().replace(/\.r\.?$/i, '.l');
      left.position.copy(mesh.position);
      left.position.x *= -1;
      left.quaternion.copy(mesh.quaternion);
      left.scale.copy(mesh.scale);
      left.scale.x *= -1;
      left.userData.name = displayName(left.name);
      left.userData.defaultColor = '#d8d2c2';
      mirrored.add(left);
      organMeshes.push(left);
      interactiveMeshes.set(`bone:${left.name}`, left);
    }
  });

  root.add(originals, mirrored);
  root.userData.ownedMaterials = [material, cartilageMaterial];
  return root;
}

/**
 * Creates a scene from real, semantically named atlas meshes. Systems without
 * an appropriate source model throw instead of silently drawing fake organs.
 */
export async function buildRealSystem3D(systemId: OrganSystemId): Promise<System3DScene> {
  const organIds = SYSTEM_ORGANS[systemId];
  if (!organIds) {
    throw new Error(
      systemId === 'obstetrics'
        ? 'A licensed, anatomically appropriate fetal and gravid-uterus 3D model has not been integrated yet. Synthetic anatomy is disabled.'
        : 'A licensed, anatomically appropriate eye and ENT 3D model has not been integrated yet. Synthetic anatomy is disabled.'
    );
  }

  const rootGroup = new THREE.Group();
  rootGroup.name = `RealAnatomy_${systemId}`;
  const primaryGroup = new THREE.Group();
  primaryGroup.name = 'Real anatomical structures';
  rootGroup.add(primaryGroup);

  const grid = new THREE.GridHelper(14, 28, 0x1e293b, 0x0f172a);
  grid.position.y = -3.8;
  rootGroup.add(grid);

  const interactiveMeshes = new Map<string, THREE.Mesh>();
  const layerGroups = new Map<string, THREE.Object3D>();
  const organMeshes: THREE.Mesh[] = [];

  // Load the open BodyParts3D-derived meshes only for the structures required
  // by the selected system. Names carry structure/FMA identifiers.
  if (organIds.length > 0) {
    const gltf = await loadAsset(MODEL_URLS.organs);
    const sourceRoot = gltf.scene.clone(true);
    sourceRoot.updateMatrixWorld(true);
    const bodyTranslation = new THREE.Vector3(0, FLOOR_Y - (-3.534865), 0);
    const organLayers = new Map<string, THREE.Group>();

    sourceRoot.traverse((object) => {
      if (!(object as THREE.Mesh).isMesh) return;
      const sourceMesh = object as THREE.Mesh;
      const organId = getSemanticOrganId(sourceMesh.name);
      if (!organId || !organIds.includes(organId)) return;

      let layer = organLayers.get(organId);
      if (!layer) {
        layer = new THREE.Group();
        layer.name = organId;
        organLayers.set(organId, layer);
        primaryGroup.add(layer);
      }

      const mesh = new THREE.Mesh(sourceMesh.geometry, createOrganMaterial(organId));
      mesh.name = sourceMesh.name;
      placeAtSourceTransform(mesh, sourceMesh);
      mesh.userData.name = displayName(sourceMesh.name);
      mesh.userData.organId = organId;
      mesh.userData.defaultColor = `#${(ORGAN_COLORS[organId] ?? 0xc9877b).toString(16).padStart(6, '0')}`;
      mesh.position.add(bodyTranslation);
      layer.add(mesh);
      organMeshes.push(mesh);
      interactiveMeshes.set(`organ:${organId}:${mesh.name}`, mesh);
    });

    if (organLayers.size === 0) {
      throw new Error(`The open anatomy atlas did not contain the expected ${organIds.join(', ')} mesh groups.`);
    }

    layerGroups.set('primary', primaryGroup);
    organLayers.forEach((group, id) => {
      if (id === 'brain') layerGroups.set('cortex', group);
      if (id === 'lungs') layerGroups.set('lungs', group);
      if (id === 'liver' || id === 'stomach' || id === 'intestines' || id === 'gallbladder' || id === 'bile-duct') {
        // The current GI control groups these digestive structures together.
        layerGroups.set('liver', primaryGroup);
      }
      if (id === 'kidneys') layerGroups.set('kidneys', group);
    });
  }

  // The complete real skin envelope is independent of system selection and
  // remains translucent so users can see the underlying anatomical structures.
  const skinGLTF = await loadAsset(MODEL_URLS.skin);
  const skinRoot = skinGLTF.scene.clone(true);
  skinRoot.name = 'BodyParts3D real skin envelope';
  const skinMaterial = createSkinMaterial(0.22);
  const skinMeshes: THREE.Mesh[] = [];
  skinRoot.traverse((object) => {
    if (!(object as THREE.Mesh).isMesh) return;
    const mesh = object as THREE.Mesh;
    mesh.material = skinMaterial;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = 10;
    mesh.userData.name = 'Skin envelope';
    skinMeshes.push(mesh);
  });
  skinRoot.position.y += FLOOR_Y - (-3.534865);
  rootGroup.add(skinRoot);
  if (skinMeshes[0]) layerGroups.set('bodySkin', skinRoot);

  // Skeletal regions are actual atlas meshes, not tubes/cylinders generated
  // from approximate coordinates.
  if (systemId === 'musculoskeletal' || BONE_FILTERS[systemId]) {
    const skeletonGLTF = await loadAsset(MODEL_URLS.skeleton);
    const skeletonScene = skeletonGLTF.scene.clone(true);
    const skeletonFilter = systemId === 'musculoskeletal' ? null : BONE_FILTERS[systemId] ?? null;
    const skeletonGroup = buildSkeletonLayer(skeletonScene, skeletonFilter, interactiveMeshes, organMeshes);
    layerGroups.set(
      systemId === 'neurology' ? 'skull' :
      systemId === 'musculoskeletal' ? 'bones' :
      'skeleton',
      skeletonGroup
    );
    rootGroup.add(skeletonGroup);
  }

  return {
    rootGroup,
    primaryGroup,
    interactiveMeshes,
    layerGroups,
    bodyMesh: skinMeshes[0],
    skeletonGroup: systemId === 'musculoskeletal' ? (layerGroups.get('bones') as THREE.Group | undefined) : undefined,
    organMeshes,
  };
}
