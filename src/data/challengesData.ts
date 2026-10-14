import { InspectionChallenge, ProbeOrientation } from '../types';

export const PROBE_PRESETS: ProbeOrientation[] = [
  {
    presetId: 'plax',
    name: 'Parasternal Long Axis (PLAX)',
    description: 'Probe placed at the 3rd-4th left intercostal space parasternally, index marker pointing toward patient right shoulder.',
    surfaceLandmark: '3rd/4th Left Intercostal Space, Left Sternal Border',
    chestPosition: [0.65, 1.2, 1.95],
    rotation: [0.2, 0.45, -0.7],
    visibleChambers: ['Left Ventricle (LV)', 'Right Ventricle Outflow (RVOT)', 'Left Atrium (LA)', 'Aortic Valve & Root', 'Mitral Valve']
  },
  {
    presetId: 'psax',
    name: 'Parasternal Short Axis (PSAX)',
    description: 'Rotated 90° clockwise from PLAX, index marker pointing toward left shoulder, cutting heart in transverse plane.',
    surfaceLandmark: '4th Left Intercostal Space, rotated 90° clockwise',
    chestPosition: [0.65, 1.2, 1.95],
    rotation: [0.3, 0.85, 0.6],
    visibleChambers: ['Left Ventricle doughnut cross-section', 'Right Ventricle crescent', 'Papillary muscles / Aortic "Mercedes-Benz" sign']
  },
  {
    presetId: 'a4c',
    name: 'Apical 4-Chamber (A4C)',
    description: 'Probe placed at the point of maximal impulse (apex) in the 5th intercostal space midclavicular line, pointing toward right scapula.',
    surfaceLandmark: '5th Left Intercostal Space, Midclavicular Line (Cardiac Apex / PMI)',
    chestPosition: [1.4, 0.15, 1.78],
    rotation: [-0.65, 0.3, -0.35],
    visibleChambers: ['Left Ventricle', 'Right Ventricle', 'Left Atrium', 'Right Atrium', 'Interventricular Septum', 'Mitral & Tricuspid Valves']
  },
  {
    presetId: 'subcostal',
    name: 'Subcostal 4-Chamber',
    description: 'Probe placed inferior to xiphoid process angled upward into thoracic cavity, ideal during CPR or trauma resuscitation.',
    surfaceLandmark: 'Subxiphoid / Infrasternal Notch pointing toward left shoulder',
    chestPosition: [0.0, -0.65, 1.8],
    rotation: [-1.1, 0.1, 0.0],
    visibleChambers: ['Liver acoustic window', 'Right Ventricle free wall', 'Left Ventricle', 'Both Atria', 'Pericardial space']
  }
];

export const INSPECTION_CHALLENGES: InspectionChallenge[] = [
  {
    id: 'ch-spider-lmca',
    title: 'Unfurl the LMCA Bifurcation ("Spider View")',
    modality: 'fluoro',
    prompt: 'A patient has suspected Left Main bifurcation stenosis. On straight AP view, the LAD and LCx severely overlap and foreshorten. Position the C-arm gantry into the classic "Spider View" to separate the bifurcation!',
    clinicalContext: 'Crucial for bifurcation PCI to avoid missing ostial LCx disease or plaque shift during stenting.',
    targetAngles: { primary: 40, secondary: -30 },
    toleranceDeg: 4,
    highlightVesselId: 'lmca',
    clue: 'Move primary angle to LAO 40° (spine shifts right on screen) and secondary tilt to Caudal 30° (detector tilts toward feet).',
    revealedInsight: 'Magnificent! Under LAO Caudal, the Left Main coronary artery stretches open like a web, clearly showing the LAD traveling anteriorly-superiorly and the LCx running laterally-inferiorly without overlap.',
    keyFeatureUnlocked: 'LMCA Bifurcation Completely Unfolded'
  },
  {
    id: 'ch-mid-lad-stenosis',
    title: 'Unmask the Mid-LAD Stenosis (RAO Cranial)',
    modality: 'fluoro',
    prompt: 'Find the culprit lesion in this anterior STEMI patient. Straight projections cause foreshortening and overlap with diagonals. Steer the C-arm into RAO Cranial to elongate the LAD and expose the stenosis!',
    clinicalContext: 'Cranial angulation elongates the entire descending course of the LAD toward the apex.',
    targetAngles: { primary: -30, secondary: 30 },
    toleranceDeg: 4,
    highlightVesselId: 'lad-mid',
    clue: 'Move primary angle to RAO 30° (spine shifts left on screen) and secondary tilt to Cranial 30° (detector tilts toward patient head).',
    revealedInsight: 'Critical 95% eccentric stenosis unmasked! Notice how cranial tilt throws the diagonal branches away from the LAD trunk, making the lesion length accurately measurable for stent selection.',
    keyFeatureUnlocked: '95% Mid-LAD Culprit Lesion Isolated'
  },
  {
    id: 'ch-rca-c-shape',
    title: 'Trace the RCA "C-Shape" Profile (LAO Straight)',
    modality: 'fluoro',
    prompt: 'Rotate the gantry to inspect the Right Coronary Artery in its classic, continuous "C-Shape" profile around the right atrioventricular groove.',
    clinicalContext: 'Evaluates the ostium, proximal, and mid-RCA before the acute margin.',
    targetAngles: { primary: 30, secondary: 0 },
    toleranceDeg: 4,
    highlightVesselId: 'rca-prox',
    clue: 'Set primary angle to LAO 30° and keep secondary tilt at 0° (flat). Spine will be on the right.',
    revealedInsight: 'Beautiful! The RCA opens into a sweeping letter "C", fully exposing the proximal and mid segments free of spinal shadow superimposition.',
    keyFeatureUnlocked: 'RCA C-Shape Profile Fully Mapped'
  },
  {
    id: 'ch-plax-echo',
    title: 'Acquire Parasternal Long Axis (PLAX) Ultrasound',
    modality: 'ultrasound',
    prompt: 'Position the ultrasound probe on the patient\'s chest at the 3rd/4th left intercostal space pointing to the right shoulder to establish the fundamental PLAX echocardiogram window.',
    clinicalContext: 'Standard initial acoustic window to evaluate LV systolic function, ejection fraction, and aortic/mitral valve motion.',
    targetAngles: { primary: 0, secondary: 0 },
    toleranceDeg: 5,
    targetProbePreset: 'plax',
    clue: 'Look for the glowing PLAX target ring on the left sternal border at the 4th intercostal space.',
    revealedInsight: 'PLAX Window Locked! The ultrasound plane cuts along the longitudinal axis from the LV apex to the aortic root, visualizing the IVS, posterior wall, mitral leaflets, and aortic valve.',
    keyFeatureUnlocked: 'Standard PLAX Acoustic Window Verified'
  },
  {
    id: 'ch-a4c-echo',
    title: 'Obtain Apical 4-Chamber (A4C) Ultrasound View',
    modality: 'ultrasound',
    prompt: 'Move the probe to the cardiac apex at the 5th intercostal space midclavicular line (apex beat / PMI) to bring all four cardiac chambers into simultaneous view.',
    clinicalContext: 'Gold standard for assessing right vs. left ventricular chamber sizes, tricuspid regurgitation velocity, and septal wall motion.',
    targetAngles: { primary: 0, secondary: 0 },
    toleranceDeg: 5,
    targetProbePreset: 'a4c',
    clue: 'Position the transducer over the glowing apical ring on the lower left anterior chest pointing toward the heart base.',
    revealedInsight: 'A4C Window Achieved! All 4 chambers (LV, RV, LA, RA) are symmetrically displayed along with both atrioventricular valves (Mitral and Tricuspid) and the central fibrous body.',
    keyFeatureUnlocked: 'Apical 4-Chamber Symmetry Verified'
  }
];
