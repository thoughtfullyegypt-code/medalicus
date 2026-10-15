#!/usr/bin/env node
/**
 * Automated Build-Time Precheck
 * Asserts that all 3D models (.glb, .gltf) and clinical data manifests
 * referenced by the codebase exist in public/ and are non-empty before build.
 */
import fs from 'fs';
import path from 'path';

const REQUIRED_ASSETS = [
  { path: 'public/models/heart.glb', minSize: 1000000, description: 'Realistic 3D Cardiac Mesh' },
  { path: 'public/models/human_body.glb', minSize: 500000, description: 'Human Body Skin Envelope Mesh' },
  { path: 'public/data/bodyparts3d_coronary.json', minSize: 10000, description: 'BodyParts3D 4.0 Coronary Manifest' },
  { path: 'public/favicon.svg', minSize: 100, description: 'Application Favicon' }
];

let failed = false;

console.log('[Medalicus Pre-Build Check] Verifying 3D models and clinical datasets...');

for (const asset of REQUIRED_ASSETS) {
  const fullPath = path.resolve(process.cwd(), asset.path);
  if (!fs.existsSync(fullPath)) {
    console.error(`✗ ERROR: Missing required asset: ${asset.path} (${asset.description})`);
    failed = true;
    continue;
  }

  const stats = fs.statSync(fullPath);
  if (stats.size < asset.minSize) {
    console.error(`✗ ERROR: Asset ${asset.path} is too small (${stats.size} bytes < min ${asset.minSize} bytes)`);
    failed = true;
    continue;
  }

  console.log(`✓ Verified ${asset.path} (${(stats.size / 1024 / 1024).toFixed(2)} MB) - ${asset.description}`);
}

if (failed) {
  console.error('\n✗ Pre-build verification failed! Ensure all 3D assets exist before building.');
  process.exit(1);
}

console.log('✓ All 3D models and anatomical datasets verified successfully for production build.\n');
process.exit(0);
