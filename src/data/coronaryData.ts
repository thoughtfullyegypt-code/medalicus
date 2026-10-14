import { ProjectionPreset, VesselDefinition, QuizQuestion, ClinicalCase } from '../types';

export const PROJECTION_PRESETS: ProjectionPreset[] = [
  {
    id: 'lao-caudal-spider',
    name: 'LAO Caudal ("Spider View")',
    shorthand: 'LAO 40° / CAUD 30°',
    angles: { primary: 40, secondary: -30 },
    vesselTarget: 'LCA',
    bestFor: 'LMCA Bifurcation & Proximal LAD / LCx',
    clinicalRationale: 'The classic "Spider" projection swings under the heart to unfurl the Left Main bifurcation, separating the proximal LAD and LCx without foreshortening.',
    keyLandmarks: ['Spine is seen on the right side of the screen (LAO)', 'Diaphragm is visible inferiorly', 'Left Main divides clearly into LAD going up/forward and LCx going down/back']
  },
  {
    id: 'rao-cranial',
    name: 'RAO Cranial',
    shorthand: 'RAO 30° / CRAN 30°',
    angles: { primary: -30, secondary: 30 },
    vesselTarget: 'LCA',
    bestFor: 'LAD Mid & Distal, Diagonal Branches',
    clinicalRationale: 'Cranial angulation elongates the entire course of the LAD towards the apex and throws the diagonal branches out to the right without overlap.',
    keyLandmarks: ['Spine is seen on the left side of the screen (RAO)', 'Diaphragm obscures inferior vessels if Cranial is too steep', 'LAD runs diagonally from upper left towards apex']
  },
  {
    id: 'lao-cranial',
    name: 'LAO Cranial',
    shorthand: 'LAO 45° / CRAN 30°',
    angles: { primary: 45, secondary: 30 },
    vesselTarget: 'LCA',
    bestFor: 'Mid-to-Distal LAD & Diagonal Takeoffs',
    clinicalRationale: 'Opens the apex and isolates the mid/distal LAD and its apical wrap-around, minimizing foreshortening.',
    keyLandmarks: ['Spine on right of screen (LAO)', 'LAD forms a sweeping anterior curve toward apex', 'Diaphragm is elevated into view']
  },
  {
    id: 'rao-caudal',
    name: 'RAO Caudal',
    shorthand: 'RAO 30° / CAUD 20°',
    angles: { primary: -30, secondary: -20 },
    vesselTarget: 'LCA',
    bestFor: 'LCx Trunk & Obtuse Marginal (OM) Branches',
    clinicalRationale: 'Moves the LAD away, throwing the Left Circumflex and its Obtuse Marginal branches downward and backward into clear profile.',
    keyLandmarks: ['Spine on left (RAO)', 'LAD runs along the superior profile', 'LCx branches downward towards the inferior-lateral wall']
  },
  {
    id: 'ap-cranial-lca',
    name: 'AP Cranial',
    shorthand: 'AP 0° / CRAN 35°',
    angles: { primary: 0, secondary: 35 },
    vesselTarget: 'LCA',
    bestFor: 'LAD Origin & Diagonal Bifurcations',
    clinicalRationale: 'Straight-on cranial tilt, useful when patient anatomy produces overlapping ribs on oblique views.',
    keyLandmarks: ['Spine is centered vertically in background', 'Heart apex projects directly downward']
  },
  {
    id: 'lao-rca-c-shape',
    name: 'LAO Straight ("C-Shape")',
    shorthand: 'LAO 30° / 0°',
    angles: { primary: 30, secondary: 0 },
    vesselTarget: 'RCA',
    bestFor: 'Proximal & Mid RCA, Crux bifurcation',
    clinicalRationale: 'Unfolds the RCA into its classic sweeping "C" contour around the atrioventricular groove, highlighting proximal and mid-vessel lesions.',
    keyLandmarks: ['Spine on right of screen (LAO)', 'RCA makes a large letter "C" contour', 'Distal bifurcates at the crux into PDA and PLB']
  },
  {
    id: 'rao-rca-l-shape',
    name: 'RAO Straight ("L-Shape")',
    shorthand: 'RAO 30° / 0°',
    angles: { primary: -30, secondary: 0 },
    vesselTarget: 'RCA',
    bestFor: 'Mid-RCA Length & PDA Body',
    clinicalRationale: 'Compresses the RCA into an inverted "L" or walking stick shape, laying out the mid-vessel and tracing the PDA in the posterior interventricular sulcus.',
    keyLandmarks: ['Spine on left of screen (RAO)', 'Mid-RCA runs horizontally across the screen', 'PDA projects downwards towards apex']
  },
  {
    id: 'lao-cranial-rca',
    name: 'LAO Cranial (RCA Crux)',
    shorthand: 'LAO 30° / CRAN 30°',
    angles: { primary: 30, secondary: 30 },
    vesselTarget: 'RCA',
    bestFor: 'RCA Crux, PDA & Posterolateral Branches',
    clinicalRationale: 'Elongates the crux cordis bifurcation, separating the Posterior Descending Artery (PDA) from Posterolateral Branches (PLB).',
    keyLandmarks: ['Spine on right', 'Distal crux branch points are clearly separated']
  }
];

export const CORONARY_VESSELS: VesselDefinition[] = [
  // Left Coronary System
  {
    id: 'lmca',
    name: 'Left Main Coronary Artery',
    abbr: 'LMCA',
    system: 'LCA',
    description: 'Arises from the left aortic sinus. Typically 5–15 mm in length before bifurcating into the LAD and LCx.',
    clinicalSignificance: 'Stenosis here ("the widow-maker") threatens >75% of left ventricular myocardium and typically mandates urgent CABG.',
    color: '#ef4444',
    radius: 0.18,
    points: [
      [0.0, 1.4, 0.4],
      [0.4, 1.35, 0.6],
      [0.85, 1.25, 0.75]
    ]
  },
  {
    id: 'lad-prox',
    name: 'LAD (Proximal Segment)',
    abbr: 'Prox LAD',
    system: 'LCA',
    description: 'Travels from the LMCA bifurcation down to the takeoff of the first large septal perforator or first diagonal.',
    clinicalSignificance: 'Very high risk territory; culprit lesion in massive anterior wall STEMI.',
    color: '#f87171',
    radius: 0.15,
    points: [
      [0.85, 1.25, 0.75],
      [1.15, 0.95, 0.95],
      [1.35, 0.55, 1.1]
    ]
  },
  {
    id: 'lad-mid',
    name: 'LAD (Mid Segment)',
    abbr: 'Mid LAD',
    system: 'LCA',
    description: 'Runs in the anterior interventricular groove from the first diagonal/septal branch to the second diagonal branch.',
    clinicalSignificance: 'Common site for PCI stenting; feeds the anterior wall and anterolateral myocardium.',
    color: '#fb7185',
    radius: 0.13,
    points: [
      [1.35, 0.55, 1.1],
      [1.45, 0.0, 1.15],
      [1.4, -0.6, 1.05]
    ]
  },
  {
    id: 'lad-distal',
    name: 'LAD (Distal Segment & Apical Wrap)',
    abbr: 'Distal LAD',
    system: 'LCA',
    description: 'Continues along the anterior groove to the cardiac apex, often wrapping around to the posterior inferior tip.',
    clinicalSignificance: 'Wraparound LAD can cause both anterior and inferior ST elevations when occluded.',
    color: '#fda4af',
    radius: 0.1,
    points: [
      [1.4, -0.6, 1.05],
      [1.2, -1.2, 0.85],
      [0.9, -1.75, 0.5],
      [0.6, -1.9, 0.2]
    ]
  },
  {
    id: 'd1',
    name: 'First Diagonal Branch',
    abbr: 'D1',
    system: 'LCA',
    description: 'First major branch arising from the LAD coursing laterally across the anterior surface of the left ventricle.',
    clinicalSignificance: 'Occlusion causes high lateral wall myocardial infarction (leads I, aVL).',
    color: '#f43f5e',
    radius: 0.11,
    points: [
      [1.35, 0.55, 1.1],
      [1.8, 0.4, 0.85],
      [2.15, 0.1, 0.5],
      [2.35, -0.3, 0.15]
    ]
  },
  {
    id: 'd2',
    name: 'Second Diagonal Branch',
    abbr: 'D2',
    system: 'LCA',
    description: 'Second major branch branching from mid-LAD across the anterolateral free wall.',
    clinicalSignificance: 'Supplies anterolateral LV free wall.',
    color: '#fb7185',
    radius: 0.09,
    points: [
      [1.45, 0.0, 1.15],
      [1.85, -0.2, 0.9],
      [2.1, -0.65, 0.55]
    ]
  },
  {
    id: 's1',
    name: 'First Septal Perforator',
    abbr: 'S1',
    system: 'LCA',
    description: 'Dives deep at roughly 90° into the interventricular septum to supply conduction tissue (bundle branches).',
    clinicalSignificance: 'Occlusion can precipitate new Right Bundle Branch Block (RBBB) or AV nodal conduction blocks.',
    color: '#e11d48',
    radius: 0.08,
    points: [
      [1.15, 0.95, 0.95],
      [0.9, 0.75, 0.6],
      [0.65, 0.5, 0.25],
      [0.45, 0.25, -0.05]
    ]
  },
  {
    id: 'lcx-prox',
    name: 'Left Circumflex (Proximal)',
    abbr: 'Prox LCx',
    system: 'LCA',
    description: 'Runs posteriorly in the left atrioventricular groove beneath the left atrial appendage.',
    clinicalSignificance: 'Supplies the lateral and posterior walls of the left ventricle.',
    color: '#38bdf8',
    radius: 0.14,
    points: [
      [0.85, 1.25, 0.75],
      [0.95, 1.15, 0.3],
      [0.8, 0.85, -0.3]
    ]
  },
  {
    id: 'om1',
    name: 'First Obtuse Marginal Branch',
    abbr: 'OM1',
    system: 'LCA',
    description: 'Originates from the circumflex artery and courses across the obtuse margin towards the LV apex.',
    clinicalSignificance: 'Primary vessel responsible for lateral wall perfusion; commonly targeted for PCI or CABG (LIMA/radial graft).',
    color: '#0ea5e9',
    radius: 0.11,
    points: [
      [0.8, 0.85, -0.3],
      [1.3, 0.5, -0.4],
      [1.7, 0.0, -0.45],
      [1.95, -0.6, -0.4]
    ]
  },
  {
    id: 'om2',
    name: 'Second Obtuse Marginal Branch',
    abbr: 'OM2',
    system: 'LCA',
    description: 'Subsequent branch from the circumflex artery supplying the posterolateral LV.',
    clinicalSignificance: 'Posterolateral wall perfusion.',
    color: '#0284c7',
    radius: 0.09,
    points: [
      [0.55, 0.5, -0.75],
      [0.95, 0.15, -0.85],
      [1.35, -0.35, -0.8]
    ]
  },
  {
    id: 'lcx-distal',
    name: 'Distal Circumflex',
    abbr: 'Distal LCx',
    system: 'LCA',
    description: 'Continues in the posterior AV groove toward the crux cordis.',
    clinicalSignificance: 'In left-dominant circulation (approx 10% of patients), gives rise to the PDA and supplies the AV node.',
    color: '#7dd3fc',
    radius: 0.09,
    points: [
      [0.8, 0.85, -0.3],
      [0.55, 0.5, -0.75],
      [0.15, 0.2, -1.05],
      [-0.3, -0.1, -1.2]
    ]
  },

  // Right Coronary System
  {
    id: 'rca-prox',
    name: 'Right Coronary Artery (Proximal)',
    abbr: 'Prox RCA',
    system: 'RCA',
    description: 'Originates from the right coronary aortic sinus and passes anteriorly between pulmonary trunk and right auricle.',
    clinicalSignificance: 'Culprit in inferior STEMI (leads II, III, aVF) and high-degree AV block.',
    color: '#eab308',
    radius: 0.16,
    points: [
      [0.0, 1.4, 0.4],
      [-0.5, 1.25, 0.55],
      [-1.0, 1.0, 0.65],
      [-1.35, 0.6, 0.55]
    ]
  },
  {
    id: 'conus-branch',
    name: 'Conus Artery',
    abbr: 'Conus',
    system: 'RCA',
    description: 'Early branch supplying the muscular outflow tract of the right ventricle (conus arteriosus).',
    clinicalSignificance: 'Forms Vieussens ring, an important collateral pathway to the LAD during LAD chronic total occlusion.',
    color: '#facc15',
    radius: 0.07,
    points: [
      [-0.5, 1.25, 0.55],
      [-0.6, 1.35, 0.85],
      [-0.45, 1.15, 1.1]
    ]
  },
  {
    id: 'sa-nodal',
    name: 'Sinoatrial (SA) Nodal Branch',
    abbr: 'SA Nodal',
    system: 'RCA',
    description: 'Ascends along the anteromedial wall of the right atrium to encircle the base of the superior vena cava.',
    clinicalSignificance: 'Arises from RCA in ~60% of people (and from LCx in ~40%). Occlusion produces sinus arrest or profound bradycardia.',
    color: '#fde047',
    radius: 0.08,
    points: [
      [-1.0, 1.0, 0.65],
      [-1.15, 1.45, 0.4],
      [-0.95, 1.9, 0.0]
    ]
  },
  {
    id: 'rca-mid',
    name: 'Right Coronary Artery (Mid)',
    abbr: 'Mid RCA',
    system: 'RCA',
    description: 'Descends vertically in the right atrioventricular groove along the anterior surface of the right ventricle.',
    clinicalSignificance: 'Frequent target for PCI; occlusion affects RV marginal branches.',
    color: '#ca8a04',
    radius: 0.14,
    points: [
      [-1.35, 0.6, 0.55],
      [-1.55, 0.0, 0.4],
      [-1.5, -0.65, 0.15]
    ]
  },
  {
    id: 'acute-marginal',
    name: 'Acute Marginal Branch',
    abbr: 'Acute Marginal',
    system: 'RCA',
    description: 'Branches from the mid-to-distal RCA along the acute inferior margin of the right ventricle towards the apex.',
    clinicalSignificance: 'Supplies the anterior right ventricular wall.',
    color: '#f59e0b',
    radius: 0.09,
    points: [
      [-1.5, -0.65, 0.15],
      [-1.75, -0.8, 0.45],
      [-1.85, -1.1, 0.75]
    ]
  },
  {
    id: 'rca-distal',
    name: 'Right Coronary Artery (Distal)',
    abbr: 'Distal RCA',
    system: 'RCA',
    description: 'Curves posteriorly around the inferior heart border towards the crux cordis.',
    clinicalSignificance: 'Distal occlusion preserves RV branches but threatens the posterior descending artery.',
    color: '#b45309',
    radius: 0.13,
    points: [
      [-1.5, -0.65, 0.15],
      [-1.3, -1.15, -0.25],
      [-0.8, -1.4, -0.65],
      [-0.2, -1.5, -0.85]
    ]
  },
  {
    id: 'pda',
    name: 'Posterior Descending Artery (PDA)',
    abbr: 'PDA',
    system: 'RCA',
    description: 'Runs in the posterior interventricular groove from the crux cordis toward the cardiac apex.',
    clinicalSignificance: 'Supplies the posterior 1/3 of the interventricular septum and inferior LV wall. Defines coronary dominance (right dominant in 85%).',
    color: '#d97706',
    radius: 0.11,
    points: [
      [-0.2, -1.5, -0.85],
      [0.0, -1.6, -0.5],
      [0.35, -1.75, -0.1],
      [0.6, -1.85, 0.15]
    ]
  },
  {
    id: 'plb',
    name: 'Posterolateral Branch (PLB)',
    abbr: 'PLB',
    system: 'RCA',
    description: 'Courses past the crux cordis across the posterior free wall of the left ventricle.',
    clinicalSignificance: 'Supplies posterobasal left ventricular myocardium and the posteromedial papillary muscle.',
    color: '#92400e',
    radius: 0.1,
    points: [
      [-0.2, -1.5, -0.85],
      [0.2, -1.4, -1.05],
      [0.6, -1.1, -1.15],
      [0.9, -0.7, -1.1]
    ]
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    vesselId: 'lmca',
    preset: PROJECTION_PRESETS[0], // LAO Caudal Spider View
    options: ['Left Main Coronary Artery (LMCA)', 'First Diagonal (D1)', 'Right Coronary Artery (RCA)', 'Acute Marginal Branch'],
    correctAnswer: 'Left Main Coronary Artery (LMCA)',
    hint: 'Look at the root entering the bifurcation under the LAO Caudal ("Spider") projection.',
    explanation: 'In the LAO Caudal Spider view, the C-arm looks up from below, clearly displaying the Left Main Coronary Artery (LMCA) prior to its bifurcation into the anterior-going LAD and the lateral-going LCx.'
  },
  {
    id: 'q2',
    vesselId: 'lad-mid',
    preset: PROJECTION_PRESETS[1], // RAO Cranial
    options: ['Left Circumflex (LCx)', 'Mid Left Anterior Descending (LAD)', 'Posterior Descending Artery (PDA)', 'Obtuse Marginal (OM1)'],
    correctAnswer: 'Mid Left Anterior Descending (LAD)',
    hint: 'Notice the spine is on the left (RAO). The vessel running down the interventricular groove towards the apex is elongated by cranial tilt.',
    explanation: 'RAO Cranial is the workhorse projection for the mid-and-distal LAD. The cranial angulation elongates the LAD and projects it towards the cardiac apex while the spine remains on the left side of the screen.'
  },
  {
    id: 'q3',
    vesselId: 'om1',
    preset: PROJECTION_PRESETS[3], // RAO Caudal
    options: ['First Obtuse Marginal Branch (OM1)', 'First Diagonal Branch (D1)', 'Conus Artery', 'Sinoatrial Nodal Branch'],
    correctAnswer: 'First Obtuse Marginal Branch (OM1)',
    hint: 'In RAO Caudal, the circumflex system is isolated and its lateral branches swing downward and outward.',
    explanation: 'RAO Caudal separates the Left Circumflex trunk and its Obtuse Marginal (OM) branches from the LAD, laying OM1 out across the lateral wall.'
  },
  {
    id: 'q4',
    vesselId: 'pda',
    preset: PROJECTION_PRESETS[6], // RAO Straight
    options: ['Posterior Descending Artery (PDA)', 'Left Main (LMCA)', 'First Septal Perforator (S1)', 'Posterolateral Branch (PLB)'],
    correctAnswer: 'Posterior Descending Artery (PDA)',
    hint: 'This terminal branch arises at the crux cordis and travels straight down the posterior interventricular sulcus.',
    explanation: 'The PDA runs in the posterior interventricular groove. In right-dominant individuals, it arises from the distal RCA at the crux cordis and feeds the inferior wall.'
  },
  {
    id: 'q5',
    vesselId: 'rca-prox',
    preset: PROJECTION_PRESETS[5], // LAO 30 RCA
    options: ['Proximal Right Coronary Artery (RCA)', 'Left Anterior Descending (LAD)', 'First Diagonal (D1)', 'Left Circumflex (LCx)'],
    correctAnswer: 'Proximal Right Coronary Artery (RCA)',
    hint: 'Spine on right (LAO). The vessel forms a sweeping "C-shape" profile.',
    explanation: 'LAO 30° is the classic view to inspect the proximal and mid RCA, laying out the entire vessel in a smooth "C" configuration.'
  }
];

export const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: 'case-anterior-stemi',
    title: '62-year-old with Crushing Retrosternal Chest Pain',
    presentation: 'Patient arrives via EMS with 10/10 substernal pressure radiating to the jaw, diaphoretic and pale.',
    ecgFinding: 'Marked 4mm ST-segment elevation in leads V1–V4 with reciprocal depressions in II, III, and aVF (Acute Anterior STEMI).',
    targetVesselId: 'lad-prox',
    lesionLocation: 'Proximal LAD (99% thrombotic occlusion)',
    stenosisPercent: 99,
    optimalProjectionId: 'rao-cranial',
    explanation: 'Anterior STEMIs are predominantly caused by acute thrombotic occlusions of the LAD. RAO Cranial and LAO Cranial views provide optimal visualization of the proximal-to-mid LAD segment without foreshortening to guide wire navigation and stent deployment.'
  },
  {
    id: 'case-inferior-stemi',
    title: '55-year-old with Epigastric Pain & Bradycardia',
    presentation: 'Sudden onset vomiting, epigastric burning, and heart rate of 38 bpm (Mobitz Type I / Wenckebach block).',
    ecgFinding: 'ST elevation in leads II, III, and aVF with reciprocal ST depression in I and aVL (Acute Inferior STEMI).',
    targetVesselId: 'rca-prox',
    lesionLocation: 'Proximal RCA occlusion involving the AV nodal branch origin',
    stenosisPercent: 100,
    optimalProjectionId: 'lao-rca-c-shape',
    explanation: 'The RCA supplies the inferior wall and the AV node (via the AV nodal branch). Acute proximal RCA occlusion presents with inferior STEMI complicated by bradyarrhythmias. The LAO 30° view reveals the classic "C-shape" cutoff.'
  },
  {
    id: 'case-lateral-stemi',
    title: '70-year-old with Sudden Dyspnea & Diaphoresis',
    presentation: 'New onset shortness of breath and left shoulder discomfort while climbing stairs.',
    ecgFinding: 'ST elevations in leads I, aVL, V5, V6 (High Lateral STEMI).',
    targetVesselId: 'om1',
    lesionLocation: 'First Obtuse Marginal (OM1) 95% stenosis',
    stenosisPercent: 95,
    optimalProjectionId: 'rao-caudal',
    explanation: 'Isolated high lateral infarction corresponds to the Left Circumflex or its Obtuse Marginal branches. The RAO Caudal and LAO Caudal projections clearly isolate the OM branches from the LAD to assess the lesion.'
  }
];
