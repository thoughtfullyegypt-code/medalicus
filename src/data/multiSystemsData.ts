import { AnatomicalSegment, ClinicalCase, SearchChecklistStep, OrganSystemId } from '../types';

export const ALL_SYSTEM_SEGMENTS: Record<OrganSystemId, AnatomicalSegment[]> = {
  cardiovascular: [
    {
      id: 'lmca',
      name: 'Left Main Coronary Artery',
      abbr: 'LMCA',
      system: 'cardiovascular',
      meshNodeName: 'LMCA',
      description: 'Arises from the left coronary sinus of Valsalva; courses between pulmonary trunk and left atrial appendage.',
      clinicalSignificance: 'Supplies >75% of left ventricular myocardium in right-dominant circulation. Stenosis >50% is a Class I indication for CABG.',
      color: '#ef4444',
      syntaxWeight: 5
    },
    {
      id: 'lad-prox',
      name: 'Proximal Left Anterior Descending',
      abbr: 'pLAD',
      system: 'cardiovascular',
      meshNodeName: 'pLAD',
      description: 'Extends from LM bifurcation to the origin of the first major septal perforator.',
      clinicalSignificance: 'Widow-maker lesion territory. Acute occlusion precipitates massive anteroseptal STEMI and cardiogenic shock.',
      color: '#f97316',
      syntaxWeight: 3.5
    },
    {
      id: 'lad-mid',
      name: 'Mid Left Anterior Descending',
      abbr: 'mLAD',
      system: 'cardiovascular',
      meshNodeName: 'mLAD',
      description: 'Extends from first septal perforator to the second diagonal branch along the anterior interventricular groove.',
      clinicalSignificance: 'Frequent site for isolated atherosclerotic plaques; best visualized in LAO Cranial projection.',
      color: '#fb923c',
      syntaxWeight: 2.5
    },
    {
      id: 'lcx',
      name: 'Left Circumflex Artery',
      abbr: 'LCx',
      system: 'cardiovascular',
      meshNodeName: 'LCx',
      description: 'Travels along the left atrioventricular groove beneath the left atrial appendage.',
      clinicalSignificance: 'Supplies the lateral and posterior LV free wall; best profiled in LAO Caudal ("Spider") view.',
      color: '#3b82f6',
      syntaxWeight: 2.5
    },
    {
      id: 'rca',
      name: 'Right Coronary Artery',
      abbr: 'RCA',
      system: 'cardiovascular',
      meshNodeName: 'RCA',
      description: 'Originates from right coronary sinus, travels down right AV groove toward crux cordis.',
      clinicalSignificance: 'Supplies SA node (60%), AV node (90%), RV free wall, and inferior LV wall. Occlusion causes inferior STEMI and high-degree AV block.',
      color: '#10b981',
      syntaxWeight: 1
    }
  ],
  neurology: [
    {
      id: 'ica',
      name: 'Internal Carotid Artery (C1-C7)',
      abbr: 'ICA',
      system: 'neurology',
      meshNodeName: 'Neuro_ICA',
      description: 'Ascends through the carotid canal, cavernous sinus, and pierces dura to bifurcate into MCA and ACA.',
      clinicalSignificance: 'Carotid bulb atherosclerosis is the primary source of thromboembolic anterior circulation stroke.',
      color: '#ef4444'
    },
    {
      id: 'mca-m1',
      name: 'MCA M1 Segment (Sphenoidal)',
      abbr: 'MCA-M1',
      system: 'neurology',
      meshNodeName: 'Neuro_M1',
      description: 'Horizontal trunk coursing laterally beneath anterior perforated substance giving off lateral lenticulostriate arteries.',
      clinicalSignificance: 'Emergent Large Vessel Occlusion (LVO) target. Eligible for mechanical thrombectomy within 24 hours (DAWN/DEFUSE-3).',
      color: '#f59e0b',
      aspectsRegion: 'M1'
    },
    {
      id: 'mca-m2',
      name: 'MCA M2 Segment (Insular)',
      abbr: 'MCA-M2',
      system: 'neurology',
      meshNodeName: 'Neuro_M2',
      description: 'Bifurcates on the surface of the insular cortex into superior and inferior divisions.',
      clinicalSignificance: 'Superior division occlusion causes contralateral hemiparesis and Broca expressive aphasia.',
      color: '#eab308',
      aspectsRegion: 'M2'
    },
    {
      id: 'basilar',
      name: 'Basilar Artery',
      abbr: 'BA',
      system: 'neurology',
      meshNodeName: 'Neuro_Basilar',
      description: 'Formed by the confluence of bilateral vertebral arteries at pontomedullary junction.',
      clinicalSignificance: 'Basilar occlusion leads to locked-in syndrome, coma, and bilateral decerebrate posturing. Fatal if recanalization fails.',
      color: '#8b5cf6'
    },
    {
      id: 'aca-a1',
      name: 'Anterior Cerebral Artery (A1)',
      abbr: 'ACA',
      system: 'neurology',
      meshNodeName: 'Neuro_ACA',
      description: 'Extends from ICA bifurcation to anterior communicating artery (ACom).',
      clinicalSignificance: 'Supplies medial frontal and parietal lobes; occlusion causes contralateral leg weakness > arm weakness.',
      color: '#06b6d4'
    }
  ],
  pulmonology: [
    {
      id: 'trachea',
      name: 'Trachea & Carina',
      abbr: 'TRACH',
      system: 'pulmonology',
      meshNodeName: 'Pulm_Trachea',
      description: 'Fibrocartilaginous tube extending from cricoid cartilage (C6) to carina (T4/T5).',
      clinicalSignificance: 'Airway alignment check on CXR: deviation indicates tension pneumothorax or massive atelectasis.',
      color: '#06b6d4'
    },
    {
      id: 'right-main-bronchus',
      name: 'Right Mainstem Bronchus',
      abbr: 'RMB',
      system: 'pulmonology',
      meshNodeName: 'Pulm_RMB',
      description: 'Wider, shorter, and more vertical than left mainstem bronchus (~25° angle vs 45°).',
      clinicalSignificance: 'Most frequent trajectory for aspirated foreign bodies and right mainstem endotracheal tube intubation.',
      color: '#3b82f6'
    },
    {
      id: 'left-main-bronchus',
      name: 'Left Mainstem Bronchus',
      abbr: 'LMB',
      system: 'pulmonology',
      meshNodeName: 'Pulm_LMB',
      description: 'Courses obliquely beneath the aortic arch and anterior to the esophagus.',
      clinicalSignificance: 'Compression by massive left atrial enlargement (Ortner syndrome) causes hoarseness from recurrent laryngeal nerve palsy.',
      color: '#8b5cf6'
    },
    {
      id: 'right-upper-lobe',
      name: 'Right Upper Lobe Bronchus',
      abbr: 'RUL',
      system: 'pulmonology',
      meshNodeName: 'Pulm_RUL',
      description: 'Eparterial bronchus branching superiorly before pulmonary artery crosses.',
      clinicalSignificance: 'Golden S sign on CXR: upper lobe collapse with hilar mass suggestive of central bronchogenic carcinoma.',
      color: '#10b981'
    }
  ],
  gastroenterology: [
    {
      id: 'cystic-duct',
      name: 'Cystic Duct',
      abbr: 'CD',
      system: 'gastroenterology',
      meshNodeName: 'GI_CysticDuct',
      description: 'Contains spiral valves of Heister connecting the gallbladder neck to common hepatic duct.',
      clinicalSignificance: 'Critical View of Safety: must be cleanly mobilized in Calot triangle before clipping to prevent common bile duct transection.',
      color: '#10b981'
    },
    {
      id: 'cystic-artery',
      name: 'Cystic Artery',
      abbr: 'CA',
      system: 'gastroenterology',
      meshNodeName: 'GI_CysticArtery',
      description: 'Typically arises from right hepatic artery (80%) inside hepatocystic triangle.',
      clinicalSignificance: 'Second of the "two and only two structures" entering gallbladder required for Critical View of Safety.',
      color: '#ef4444'
    },
    {
      id: 'common-bile-duct',
      name: 'Common Bile Duct',
      abbr: 'CBD',
      system: 'gastroenterology',
      meshNodeName: 'GI_CBD',
      description: 'Courses through hepatoduodenal ligament with portal vein and hepatic artery, empties at ampulla of Vater.',
      clinicalSignificance: 'Dilation >6mm suggests choledocholithiasis or periampullary neoplasm. Iatrogenic transection is catastrophic.',
      color: '#84cc16'
    },
    {
      id: 'couinaud-iv',
      name: 'Couinaud Segment IV (Left Medial)',
      abbr: 'Seg IV',
      system: 'gastroenterology',
      meshNodeName: 'GI_Seg4',
      description: 'Subdivided into IVa (superior) and IVb (inferior, quadrate lobe) bordered by falciform ligament and middle hepatic vein.',
      clinicalSignificance: 'Key surgical landmark in extended right and left hemihepatectomies.',
      color: '#f59e0b',
      couinaudSegment: 4
    }
  ],
  nephrology: [
    {
      id: 'renal-artery-main',
      name: 'Main Renal Artery',
      abbr: 'MRA',
      system: 'nephrology',
      meshNodeName: 'Renal_MRA',
      description: 'Branches from abdominal aorta below SMA at L1-L2; right renal artery is longer and passes posterior to IVC.',
      clinicalSignificance: 'Renal artery stenosis (>60%) causes renovascular hypertension and ischemic nephropathy.',
      color: '#ef4444'
    },
    {
      id: 'renal-pelvis',
      name: 'Renal Pelvis & Major Calyces',
      abbr: 'PELVIS',
      system: 'nephrology',
      meshNodeName: 'Renal_Pelvis',
      description: 'Funnel-shaped basin receiving 2-3 major calyces and continuous with ureter at ureteropelvic junction (UPJ).',
      clinicalSignificance: 'UPJ obstruction is the most common congenital cause of hydronephrosis in neonates and young adults.',
      color: '#f59e0b'
    },
    {
      id: 'prostate-pz',
      name: 'Prostate Peripheral Zone',
      abbr: 'PZ',
      system: 'nephrology',
      meshNodeName: 'Uro_PZ',
      description: 'Occupies 70% of normal prostate volume, wrapping posterolaterally around central and transition zones.',
      clinicalSignificance: 'Origin of 70-80% of prostate adenocarcinomas. Evaluated primarily on Diffusion-Weighted Imaging (DWI/ADC) in PI-RADS v2.1.',
      color: '#3b82f6',
      piradsZone: 'PZ'
    },
    {
      id: 'prostate-tz',
      name: 'Prostate Transition Zone',
      abbr: 'TZ',
      system: 'nephrology',
      meshNodeName: 'Uro_TZ',
      description: 'Surrounds proximal prostatic urethra between bladder neck and verumontanum.',
      clinicalSignificance: 'Site of Benign Prostatic Hyperplasia (BPH) and 20% of cancers. Evaluated primarily on T2-Weighted imaging in PI-RADS v2.1.',
      color: '#10b981',
      piradsZone: 'TZ'
    }
  ],
  musculoskeletal: [
    {
      id: 'acl',
      name: 'Anterior Cruciate Ligament',
      abbr: 'ACL',
      system: 'musculoskeletal',
      meshNodeName: 'MSK_ACL',
      description: 'Courses from posteromedial aspect of lateral femoral condyle to anterior intercondylar area of tibia.',
      clinicalSignificance: 'Primary restraint to anterior tibial translation. Non-visualization, hyperintensity, or empty notch sign indicates complete tear.',
      color: '#ef4444'
    },
    {
      id: 'pcl',
      name: 'Posterior Cruciate Ligament',
      abbr: 'PCL',
      system: 'musculoskeletal',
      meshNodeName: 'MSK_PCL',
      description: 'Thick, curved, uniformly low-signal band on T1/T2 from anterolateral medial femoral condyle to posterior tibia.',
      clinicalSignificance: 'Primary restraint to posterior tibial translation. Tears occur with dashboard injury or severe knee hyperextension.',
      color: '#3b82f6'
    },
    {
      id: 'medial-meniscus',
      name: 'Medial Meniscus (Posterior Horn)',
      abbr: 'MM-PH',
      system: 'musculoskeletal',
      meshNodeName: 'MSK_MM',
      description: 'C-shaped fibrocartilaginous wedge; posterior horn is much larger than anterior horn.',
      clinicalSignificance: 'High-signal line contacting articular surface on 2 consecutive slices confirms a true meniscal tear.',
      color: '#10b981'
    },
    {
      id: 'l5-nerve-root',
      name: 'L5 Exiting Spinal Nerve Root',
      abbr: 'L5-Root',
      system: 'musculoskeletal',
      meshNodeName: 'MSK_L5Root',
      description: 'Exits beneath L5 pedicle through L5-S1 neural foramen.',
      clinicalSignificance: 'Compressed by L4-L5 paracentral disc herniation (traversing root) or L5-S1 foraminal herniation (exiting root); causes foot drop.',
      color: '#facc15'
    }
  ],
  obstetrics: [
    {
      id: 'fetal-bpd-thalamus',
      name: 'Transthalamic Head Circumference Plane',
      abbr: 'BPD/HC',
      system: 'obstetrics',
      meshNodeName: 'Fetal_Head',
      description: 'Axial skull plane showing continuous elliptical calvarium, central falx cerebri, cavum septi pellucidi (CSP), and bilateral thalami.',
      clinicalSignificance: 'Strict biometry requirement: cerebellum and orbits must NOT be visible. Calipers placed outer-to-inner for BPD.',
      color: '#a855f7',
      fetalStructure: 'Head'
    },
    {
      id: 'fetal-ac-plane',
      name: 'Abdominal Circumference Plane',
      abbr: 'AC',
      system: 'obstetrics',
      meshNodeName: 'Fetal_Abdomen',
      description: 'Transverse circular section showing stomach bubble, single vertebral body, and short intrahepatic segment of umbilical vein.',
      clinicalSignificance: 'Most sensitive indicator of intrauterine fetal growth restriction (IUGR) and macrosomia. Kidneys must not be visible.',
      color: '#ec4899',
      fetalStructure: 'Abdomen'
    },
    {
      id: 'fetal-femur-diaphysis',
      name: 'Femur Diaphyseal Length',
      abbr: 'FL',
      system: 'obstetrics',
      meshNodeName: 'Fetal_Femur',
      description: 'Acoustic shadow behind straight ossified femoral shaft; beam perpendicular to shaft.',
      clinicalSignificance: 'Measure only the calcified diaphysis from blunt end to blunt end, excluding epiphysis and distal femoral point.',
      color: '#06b6d4',
      fetalStructure: 'Femur'
    }
  ],
  ophthalmology_ent: [
    {
      id: 'foveal-pit',
      name: 'Fovea Centralis & Pit',
      abbr: 'FOVEA',
      system: 'ophthalmology_ent',
      meshNodeName: 'Eye_Fovea',
      description: 'Avascular depression in central retina where inner retinal layers are displaced to maximize visual acuity.',
      clinicalSignificance: 'Loss of foveal depression contour is the earliest sign of macular edema; central full-thickness defect defines macular hole.',
      color: '#14b8a6',
      octLayer: 'Fovea'
    },
    {
      id: 'rpe-photoreceptors',
      name: 'RPE & Photoreceptor IS/OS Band (EZ)',
      abbr: 'EZ/RPE',
      system: 'ophthalmology_ent',
      meshNodeName: 'Eye_RPE',
      description: 'Hyper-reflective double band representing the ellipsoid zone and retinal pigment epithelium.',
      clinicalSignificance: 'Disruption correlates directly with permanent loss of visual acuity in wet AMD and central serous chorioretinopathy.',
      color: '#f59e0b',
      octLayer: 'EZ'
    },
    {
      id: 'ostiomeatal-complex',
      name: 'Ostiomeatal Complex (OMC)',
      abbr: 'OMC',
      system: 'ophthalmology_ent',
      meshNodeName: 'ENT_OMC',
      description: 'Key anatomical confluence: maxillary sinus ostium, ethmoid infundibulum, hiatus semilunaris, uncinate process, and middle turbinate.',
      clinicalSignificance: 'Common drainage pathway for anterior ethmoid, frontal, and maxillary sinuses. Target for functional endoscopic sinus surgery (FESS).',
      color: '#06b6d4'
    }
  ]
};

export const CLINICAL_CASES: ClinicalCase[] = [
  // 1. CARDIOVASCULAR CASES
  {
    id: 'case-cardio-stemi',
    system: 'cardiovascular',
    title: 'Acute Anteroseptal STEMI ("Widow Maker")',
    category: 'Interventional Cardiology',
    presentation: '58-year-old male with crushing substernal chest pain radiating to left arm and diaphoresis for 45 minutes.',
    ecgFinding: 'ST elevation in V1-V4 with reciprocal ST depressions in II, III, and aVF.',
    imagingFindings: 'Fluoroscopy reveals abrupt 99% cut-off of contrast flow in proximal LAD immediately past the first septal perforator.',
    diagnosticPearl: 'Proximal LAD occlusions have the highest mortality of all coronary lesions; emergency PCI with drug-eluting stent restores perfusion.',
    targetSegmentId: 'lad-prox',
    lesionLocation: 'Proximal LAD after S1',
    stenosisPercent: 99,
    isNormal: false,
    pairedTwinCaseId: 'case-cardio-normal',
    optimalProjectionId: 'lao-cranial',
    optimalViewAngles: { primary: 30, secondary: 30 },
    calculatorType: 'SYNTAX',
    searchPatternChecklist: [
      {
        id: 'sp-c1',
        label: 'Aortic Root & Catheter Engagement',
        systemRegion: 'Coronary Sinus',
        targetStructureId: 'lmca',
        pearl: 'Confirm coaxial catheter seating without dampening or ventricularization of pressure wave.',
        normalFindings: 'Smooth Judkins Left catheter engagement with pulsatile arterial pressure wave.',
        abnormalFinding: 'Catheter wedge or aortic dissection flap seen on unselective injection.'
      },
      {
        id: 'sp-c2',
        label: 'Left Main Trunk & Bifurcation',
        systemRegion: 'Left Coronary',
        targetStructureId: 'lmca',
        pearl: 'Inspect in Spider view (LAO 40 Caud 30) to eliminate foreshortening.',
        normalFindings: 'Wide caliber trunk bifurcating smoothly into LAD and LCx.',
        abnormalFinding: 'Ostial or shaft eccentric plaque >50% requires immediate surgical consultation.'
      },
      {
        id: 'sp-c3',
        label: 'LAD Course & Septal Runoff',
        systemRegion: 'Anterior Groove',
        targetStructureId: 'lad-prox',
        pearl: 'LAO Cranial projects LAD away from spine and diagonal overlap.',
        normalFindings: 'Uninterrupted contrast column running to cardiac apex with brisk TIMI 3 flow.',
        abnormalFinding: 'Abrupt cutoff, contrast stagnation, or intraluminal thrombus filling defect (TIMI 0/1).'
      },
      {
        id: 'sp-c4',
        label: 'Circumflex & Marginal Vessels',
        systemRegion: 'AV Groove',
        targetStructureId: 'lcx',
        pearl: 'RAO Caudal isolates proximal LCx and obtuse marginal takeoff.',
        normalFindings: 'Smooth caliber LCx wrapping around AV groove to supply posterior LV.',
        abnormalFinding: 'Ostial LCx stenosis or distal embolization.'
      }
    ],
    explanation: 'Emergency activation of cardiac catheterization lab indicated for primary percutaneous coronary intervention (PPCI) of proximal LAD.'
  },
  {
    id: 'case-cardio-normal',
    system: 'cardiovascular',
    title: 'Normal Coronary Angiogram & Reference Cycle',
    category: 'Normal Reference',
    presentation: '45-year-old female undergoing pre-operative evaluation for atypical chest discomfort and negative troponins.',
    ecgFinding: 'Normal sinus rhythm, normal axis, no ST-T changes.',
    imagingFindings: 'Smooth, pristine coronary vessels without luminal irregularity or stenosis. TIMI 3 flow throughout.',
    diagnosticPearl: 'Pristine 3-vessel runoff serves as the anatomical benchmark for comparison with ischemic lesions.',
    targetSegmentId: 'lad-prox',
    stenosisPercent: 0,
    isNormal: true,
    pairedTwinCaseId: 'case-cardio-stemi',
    optimalProjectionId: 'lao-cranial',
    optimalViewAngles: { primary: 30, secondary: 30 },
    calculatorType: 'SYNTAX',
    searchPatternChecklist: [
      {
        id: 'sp-cn1',
        label: 'Catheter Seating & Flush',
        systemRegion: 'Coronary Sinus',
        targetStructureId: 'lmca',
        pearl: 'Verify no pressure damping.',
        normalFindings: 'Good coaxial engagement, no dissection.',
        abnormalFinding: 'Damping or contrast staining.'
      },
      {
        id: 'sp-cn2',
        label: 'Pristine Left Main & LAD',
        systemRegion: 'Left Anterior',
        targetStructureId: 'lad-prox',
        pearl: 'Ensure contrast opacifies all septal and diagonal branches.',
        normalFindings: 'Full lumen opacification to cardiac apex.',
        abnormalFinding: 'Lumen narrowing.'
      }
    ],
    explanation: 'Completely normal coronary tree with right dominant anatomy and normal ventricular function.'
  },

  // 2. NEUROLOGY CASES
  {
    id: 'case-neuro-stroke',
    system: 'neurology',
    title: 'Hyperacute Right MCA M1 Occlusion (ASPECTS 6)',
    category: 'Vascular Neurology',
    presentation: '67-year-old male with sudden onset left dense hemiplegia, left hemineglect, and forced rightward eye gaze 2 hours ago. NIHSS 18.',
    imagingFindings: 'Non-contrast CT reveals loss of gray-white differentiation at the right insular ribbon, right lentiform nucleus, and M2/M3 cortex with dense MCA sign.',
    diagnosticPearl: 'Loss of the insular ribbon is one of the earliest signs of acute MCA infarction due to cytotoxic edema of the insular cortex.',
    targetSegmentId: 'mca-m1',
    isNormal: false,
    pairedTwinCaseId: 'case-neuro-normal',
    optimalSliceIndex: 42,
    calculatorType: 'ASPECTS',
    searchPatternChecklist: [
      {
        id: 'sp-n1',
        label: 'Hyperdense Vessel Check (Blood)',
        systemRegion: 'Circle of Willis',
        targetStructureId: 'mca-m1',
        pearl: 'Hyperdense MCA sign reflects fresh thrombus in the horizontal M1 trunk.',
        normalFindings: 'Symmetric vascular density in Sylvian fissure.',
        abnormalFinding: 'Focal bright attenuation in M1 trunk relative to contralateral side.'
      },
      {
        id: 'sp-n2',
        label: 'Basal Ganglia & Lentiform Nucleus',
        systemRegion: 'Deep Gray Matter',
        targetStructureId: 'mca-m1',
        pearl: 'Early hypodensity in putamen/globus pallidus indicates striatal ischemia.',
        normalFindings: 'Sharp demarcation between internal capsule white matter and lentiform gray matter.',
        abnormalFinding: 'Obscuration or hypoattenuation of lentiform nucleus.'
      },
      {
        id: 'sp-n3',
        label: 'Insular Ribbon Sign',
        systemRegion: 'Insula',
        targetStructureId: 'mca-m2',
        pearl: 'Insular cortex has lowest collateral supply and swells first in MCA territory infarction.',
        normalFindings: 'Distinct stripe of gray matter lateral to external capsule.',
        abnormalFinding: 'Loss of gray-white interface at insular cortex.'
      },
      {
        id: 'sp-n4',
        label: 'Sulcal Effacement & Cortical Sparing',
        systemRegion: 'Hemispheric Convexities',
        targetStructureId: 'mca-m2',
        pearl: 'Assess M1 through M6 cortical regions to calculate the 10-point ASPECTS score.',
        normalFindings: 'Symmetric CSF spaces in cerebral sulci bilaterally.',
        abnormalFinding: 'Sulcal effacement indicating cytotoxic tissue edema.'
      }
    ],
    explanation: 'ASPECTS score of 6 qualifies patient for emergency groin puncture and mechanical thrombectomy within the 24-hour extended window.'
  },
  {
    id: 'case-neuro-normal',
    system: 'neurology',
    title: 'Normal Non-Contrast Head CT & Circle of Willis',
    category: 'Normal Reference',
    presentation: '24-year-old female presenting with tension-type headache; non-focal neurological examination.',
    imagingFindings: 'Symmetric cerebral hemispheres, intact gray-white differentiation, normal ventricular size, baseline ASPECTS 10/10.',
    diagnosticPearl: 'Preserved gray-white distinction and patent Sylvian fissures establish baseline normal anatomy.',
    targetSegmentId: 'mca-m1',
    isNormal: true,
    pairedTwinCaseId: 'case-neuro-stroke',
    optimalSliceIndex: 42,
    calculatorType: 'ASPECTS',
    searchPatternChecklist: [
      {
        id: 'sp-nn1',
        label: 'Blood / Cisterns Evaluation',
        systemRegion: 'Subarachnoid Space',
        targetStructureId: 'basilar',
        pearl: 'Verify dark CSF attenuation in suprasellar, ambient, and quadrigeminal cisterns.',
        normalFindings: 'Open, symmetrical, CSF-filled basal cisterns.',
        abnormalFinding: 'Hyperdense subarachnoid hemorrhage filling cisterns.'
      },
      {
        id: 'sp-nn2',
        label: 'Cerebral Hemispheres & ASPECTS 10/10',
        systemRegion: 'Cortex & Basal Ganglia',
        targetStructureId: 'mca-m1',
        pearl: 'All 10 ASPECTS territories show sharp gray-white differentiation.',
        normalFindings: 'Crisp borders, no edema, no midline shift.',
        abnormalFinding: 'Hypodensity or loss of sulcal pattern.'
      }
    ],
    explanation: 'Normal head CT rules out acute hemorrhage, mass effect, and early ischemic changes.'
  },

  // 3. PULMONOLOGY CASES
  {
    id: 'case-pulm-pneumonia',
    system: 'pulmonology',
    title: 'Right Middle Lobe Consolidation (Silhouette Sign)',
    category: 'Thoracic Imaging',
    presentation: '62-year-old female with high fever, cough with purulent sputum, and right-sided pleuritic chest pain for 4 days.',
    imagingFindings: 'CXR shows dense triangular airspace opacity in the right mid-to-lower zone obscuring the right heart border (positive Silhouette Sign).',
    diagnosticPearl: 'Loss of the right cardiac border places the opacity in the Right Middle Lobe, because both share the anterior thoracic plane.',
    targetSegmentId: 'right-upper-lobe',
    isNormal: false,
    pairedTwinCaseId: 'case-pulm-normal',
    optimalSliceIndex: 55,
    searchPatternChecklist: [
      {
        id: 'sp-p1',
        label: 'Airway: Tracheal Alignment',
        systemRegion: 'Superior Mediastinum',
        targetStructureId: 'trachea',
        pearl: 'Trachea must be midline over spinous processes.',
        normalFindings: 'Midline trachea with patent column down to carina.',
        abnormalFinding: 'Deviation away from tension pneumothorax or toward collapse.'
      },
      {
        id: 'sp-p2',
        label: 'Cardiac Silhouette & Borders',
        systemRegion: 'Middle Mediastinum',
        targetStructureId: 'trachea',
        pearl: 'Cardiothoracic ratio <50% on PA projection.',
        normalFindings: 'Sharp right atrium border and left ventricular apex contour.',
        abnormalFinding: 'Silhouette sign: erasure of the right heart border by adjacent tissue of equal density.'
      },
      {
        id: 'sp-p3',
        label: 'Diaphragm & Costophrenic Angles',
        systemRegion: 'Bases',
        targetStructureId: 'left-main-bronchus',
        pearl: 'Posterior and lateral sulci must be sharp knife-edges.',
        normalFindings: 'Clear sharp right and left costophrenic angles.',
        abnormalFinding: 'Meniscus sign blunting angles indicating pleural effusion.'
      },
      {
        id: 'sp-p4',
        label: 'Fields: Lung Parenchyma & Air Bronchograms',
        systemRegion: 'Parenchyma',
        targetStructureId: 'right-main-bronchus',
        pearl: 'Compare symmetric lung lucencies apex to base.',
        normalFindings: 'Fine branching pulmonary vessels extending to outer 1/3 of lung fields.',
        abnormalFinding: 'Alveolar opacification with branching dark tubular air bronchograms.'
      }
    ],
    explanation: 'Classic community-acquired lobar pneumonia demonstrating the diagnostic power of the silhouette sign on plain radiographs.'
  },
  {
    id: 'case-pulm-normal',
    system: 'pulmonology',
    title: 'Normal Erect Posteroanterior (PA) Chest Radiograph',
    category: 'Normal Reference',
    presentation: '30-year-old male routine pre-employment health screening, non-smoker.',
    imagingFindings: 'Clear lung fields, sharp costophrenic angles, normal cardiothoracic ratio (42%), sharp diaphragmatic domes.',
    diagnosticPearl: 'Good inspiratory effort shows 9-10 posterior ribs above the diaphragm.',
    targetSegmentId: 'trachea',
    isNormal: true,
    pairedTwinCaseId: 'case-pulm-pneumonia',
    optimalSliceIndex: 55,
    searchPatternChecklist: [
      {
        id: 'sp-pn1',
        label: 'Airway & Mediastinum',
        systemRegion: 'Central',
        targetStructureId: 'trachea',
        pearl: 'Check carina bifurcation angle (<90°).',
        normalFindings: 'Midline trachea, normal aortic knob.',
        abnormalFinding: 'Subcarinal widening.'
      },
      {
        id: 'sp-pn2',
        label: 'Lung Fields & Costophrenic Angles',
        systemRegion: 'Bilateral Fields',
        targetStructureId: 'left-main-bronchus',
        pearl: 'Inspect retrocardiac space for hidden consolidation.',
        normalFindings: 'Equal radiolucency throughout both hemithoraces.',
        abnormalFinding: 'Focal infiltrate.'
      }
    ],
    explanation: 'Standard normal chest radiograph showing ideal inspiration, rotation, and penetration parameters.'
  },

  // 4. GASTROENTEROLOGY CASES
  {
    id: 'case-gi-cholecystitis',
    system: 'gastroenterology',
    title: 'Acute Calculous Cholecystitis & Calot Triangle Dissection',
    category: 'Minimally Invasive Surgery',
    presentation: '48-year-old female with acute severe RUQ abdominal pain radiating to right scapula, positive Murphy sign, and leukocytosis.',
    imagingFindings: 'Ultrasound and laparoscopy reveal distended thick-walled gallbladder (5.2 mm), impacted neck gallstone, and dense Calot triangle adhesions.',
    diagnosticPearl: 'Strict adherence to Strasberg Critical View of Safety prevents the devastating complication of iatrogenic common bile duct transection.',
    targetSegmentId: 'cystic-duct',
    isNormal: false,
    pairedTwinCaseId: 'case-gi-normal',
    optimalSliceIndex: 60,
    calculatorType: 'COUINAUD_RESECTION',
    searchPatternChecklist: [
      {
        id: 'sp-g1',
        label: 'Clear Hepatocystic Triangle',
        systemRegion: 'Calot Triangle',
        targetStructureId: 'cystic-duct',
        pearl: 'Clear all fibrofatty tissue out of the triangle bounded by cystic duct, hepatic duct, and liver edge.',
        normalFindings: 'Clean triangle free of adipose tissue and spurious vessels.',
        abnormalFinding: 'Dense phlegmonous adhesions or aberrant right hepatic artery.'
      },
      {
        id: 'sp-g2',
        label: 'Dissect Gallbladder off Cystic Plate',
        systemRegion: 'Lower 1/3 Gallbladder Bed',
        targetStructureId: 'cystic-duct',
        pearl: 'Expose the bare cystic plate in lower third of gallbladder before clipping anything.',
        normalFindings: 'Clear liver bed visible behind lower 1/3 of infundibulum.',
        abnormalFinding: 'Incomplete dissection mistaking common bile duct for cystic duct.'
      },
      {
        id: 'sp-g3',
        label: 'Two and Only Two Structures Entering',
        systemRegion: 'Gallbladder Neck',
        targetStructureId: 'cystic-artery',
        pearl: 'Confirm cystic duct and cystic artery are the sole conduits entering the gallbladder.',
        normalFindings: 'Two isolated structures clearly terminating in the gallbladder wall.',
        abnormalFinding: 'Third structure visible (risk of accessory bile duct or aberrant RHA).'
      }
    ],
    explanation: 'Laparoscopic cholecystectomy requires achieving the Critical View of Safety before dividing cystic duct and artery.'
  },
  {
    id: 'case-gi-normal',
    system: 'gastroenterology',
    title: 'Normal Liver Segments & Biliary Anatomy',
    category: 'Normal Reference',
    presentation: '40-year-old prospective living liver donor undergoing pre-donation multiphasic CT angiography.',
    imagingFindings: 'Normal Couinaud segmental liver architecture, normal portal vein branching, slender cystic duct with classic insertion into common hepatic duct.',
    diagnosticPearl: 'Segment I (caudate lobe) is functionally independent, draining directly into the IVC.',
    targetSegmentId: 'couinaud-iv',
    isNormal: true,
    pairedTwinCaseId: 'case-gi-cholecystitis',
    optimalSliceIndex: 60,
    calculatorType: 'COUINAUD_RESECTION',
    searchPatternChecklist: [
      {
        id: 'sp-gn1',
        label: 'Couinaud Segmental Volume',
        systemRegion: 'Hepatic Lobes',
        targetStructureId: 'couinaud-iv',
        pearl: 'Calculate future liver remnant (>30% of total volume required).',
        normalFindings: 'Symmetric liver parenchyma without steatosis or cirrhosis.',
        abnormalFinding: 'Atrophy-hypertrophy complex.'
      }
    ],
    explanation: 'Unremarkable multiphasic abdominal CT confirming ideal surgical anatomy for anatomical segmental resection.'
  },

  // 5. NEPHROLOGY & UROLOGY CASES
  {
    id: 'case-uro-pirads',
    system: 'nephrology',
    title: 'Prostate Peripheral Zone Adenocarcinoma (PI-RADS 5)',
    category: 'Urologic Oncology',
    presentation: '66-year-old male with elevated PSA of 8.4 ng/mL and palpable induration on digital rectal examination.',
    imagingFindings: 'Multiphasic MRI shows a 17mm focal mass in right mid-peripheral zone: profoundly hypointense on ADC map, markedly hyperintense on b=2000 DWI, with early focal contrast enhancement.',
    diagnosticPearl: 'In the Peripheral Zone, Diffusion-Weighted Imaging (DWI/ADC) is the dominant determining sequence for PI-RADS scoring.',
    targetSegmentId: 'prostate-pz',
    isNormal: false,
    pairedTwinCaseId: 'case-uro-normal',
    optimalSliceIndex: 68,
    calculatorType: 'PIRADS',
    searchPatternChecklist: [
      {
        id: 'sp-u1',
        label: 'Peripheral Zone (PZ) DWI/ADC Analysis',
        systemRegion: 'Posterolateral Prostate',
        targetStructureId: 'prostate-pz',
        pearl: 'Look for dark focus on ADC with corresponding bright signal on high-b value DWI.',
        normalFindings: 'Uniform high signal on T2W and no diffusion restriction in peripheral zone.',
        abnormalFinding: 'Focal restricted diffusion >=1.5cm or with extraprostatic extension (PI-RADS 5).'
      },
      {
        id: 'sp-u2',
        label: 'Transition Zone (TZ) T2W Analysis',
        systemRegion: 'Periurethral',
        targetStructureId: 'prostate-tz',
        pearl: 'T2W is dominant in TZ: look for "erased charcoal" appearance disrupting BPH nodules.',
        normalFindings: 'Heterogeneous well-circumscribed stromal and glandular nodules (BPH).',
        abnormalFinding: 'Non-circumscribed ill-defined hypointense area with restricted diffusion.'
      },
      {
        id: 'sp-u3',
        label: 'Capsular Integrity & Neurovascular Bundles',
        systemRegion: 'Prostatic Capsule',
        targetStructureId: 'prostate-pz',
        pearl: 'Bulging or breach of capsule predicts positive surgical margins.',
        normalFindings: 'Smooth continuous low-signal capsule line.',
        abnormalFinding: 'Capsular abutment >12mm or frank frank breach into neurovascular bundle.'
      }
    ],
    explanation: 'PI-RADS category 5 carries a >90% risk of clinically significant prostate cancer (Gleason score >=7). Targeted MRI-transrectal ultrasound fusion biopsy indicated.'
  },
  {
    id: 'case-uro-normal',
    system: 'nephrology',
    title: 'Normal Prostate Multiphasic MRI & Renal CT Urogram',
    category: 'Normal Reference',
    presentation: '52-year-old male screening for microscopic hematuria; normal renal function.',
    imagingFindings: 'Homogeneous high-signal peripheral zone, well-defined transition zone nodules without suspicious diffusion restriction (PI-RADS 1/5). Bilateral prompt contrast excretion.',
    diagnosticPearl: 'The intact bright T2W peripheral zone "halo" reliably excludes aggressive cancer.',
    targetSegmentId: 'prostate-pz',
    isNormal: true,
    pairedTwinCaseId: 'case-uro-pirads',
    optimalSliceIndex: 68,
    calculatorType: 'PIRADS',
    searchPatternChecklist: [
      {
        id: 'sp-un1',
        label: 'Baseline PZ T2W Signal',
        systemRegion: 'Peripheral Zone',
        targetStructureId: 'prostate-pz',
        pearl: 'Verify absence of wedge-shaped prostatitis hypointensity.',
        normalFindings: 'Bright, pristine, bilateral peripheral zones.',
        abnormalFinding: 'Focal hypointensity.'
      }
    ],
    explanation: 'Normal MRI examination confirming absence of clinically significant prostate malignancy.'
  },

  // 6. MUSCULOSKELETAL CASES
  {
    id: 'case-msk-acl-tear',
    system: 'musculoskeletal',
    title: 'Complete Mid-Substance ACL Tear with Pivot Shift Bone Contusion',
    category: 'Sports Medicine MRI',
    presentation: '22-year-old collegiate soccer player experienced a non-contact deceleration and pivoting injury with an audible "pop" followed by acute joint hemarthrosis.',
    imagingFindings: 'Sagittal MRI reveals complete disruption of ACL fibers with non-visualization of mid-substance, anterior tibial translation (>7mm), and kissing bone contusions on lateral femoral condyle and posterolateral tibial plateau.',
    diagnosticPearl: 'The kissing bone bruise pattern on the lateral compartment is pathognomonic for a pivot-shift ACL rupture.',
    targetSegmentId: 'acl',
    isNormal: false,
    pairedTwinCaseId: 'case-msk-normal',
    optimalSliceIndex: 50,
    searchPatternChecklist: [
      {
        id: 'sp-m1',
        label: 'Cruciate Ligaments (ACL & PCL)',
        systemRegion: 'Intercondylar Notch',
        targetStructureId: 'acl',
        pearl: 'ACL should run parallel to the intercondylar roof (Blumensaat line).',
        normalFindings: 'Taut, continuous, low-signal striated band from lateral condyle to tibia.',
        abnormalFinding: 'Discontinuous fibers, abnormal angle relative to Blumensaat line, or empty notch.'
      },
      {
        id: 'sp-m2',
        label: 'Meniscal Horns & "Bowtie" Appearance',
        systemRegion: 'Joint Compartments',
        targetStructureId: 'medial-meniscus',
        pearl: 'Sagittal slices must show 2 consecutive bowtie slices for normal meniscal body.',
        normalFindings: 'Uniform low signal triangular wedges without surface communication.',
        abnormalFinding: 'Hyperintense linear signal reaching superior or inferior articular surface.'
      },
      {
        id: 'sp-m3',
        label: 'Bone Marrow Edema Pattern',
        systemRegion: 'Femur & Tibia',
        targetStructureId: 'acl',
        pearl: 'Bone contusions highlight the biomechanical vector of injury.',
        normalFindings: 'Homogeneous dark signal on fluid-sensitive fat-suppressed sequences.',
        abnormalFinding: 'Hyperintense marrow edema in lateral femoral condyle and posterior lateral tibia.'
      }
    ],
    explanation: 'Complete ACL tear indicated for arthroscopic reconstruction with autologous patellar or hamstring graft.'
  },
  {
    id: 'case-msk-normal',
    system: 'musculoskeletal',
    title: 'Normal Knee Multi-Planar MRI Reference',
    category: 'Normal Reference',
    presentation: '28-year-old male evaluation for persistent anterior knee pain after marathoning; normal ligaments and cartilage.',
    imagingFindings: 'Taut intact ACL and PCL, sharp dark meniscal triangles, intact hyaline articular cartilage thickness, no effusion.',
    diagnosticPearl: 'Normal PCL appears uniformly black and gently curved on sagittal views.',
    targetSegmentId: 'acl',
    isNormal: true,
    pairedTwinCaseId: 'case-msk-acl-tear',
    optimalSliceIndex: 50,
    searchPatternChecklist: [
      {
        id: 'sp-mn1',
        label: 'Ligamentous Continuity',
        systemRegion: 'Notch',
        targetStructureId: 'acl',
        pearl: 'Check normal fascicular pattern of ACL.',
        normalFindings: 'Intact low signal throughout ACL and PCL.',
        abnormalFinding: 'Focal fiber disruption.'
      }
    ],
    explanation: 'Normal structural MRI of the knee confirming integrity of all stabilizers and cartilage.'
  },

  // 7. OBSTETRICS CASES
  {
    id: 'case-ob-fgr',
    system: 'obstetrics',
    title: 'Asymmetric Fetal Growth Restriction (FGR) at 32 Weeks',
    category: 'Maternal-Fetal Medicine',
    presentation: '29-year-old primigravida at 32 weeks gestation with lagging fundal height and maternal preeclampsia.',
    imagingFindings: 'Ultrasound biometry reveals preserved Head Circumference (50th percentile) but marked lag in Abdominal Circumference (<3rd percentile) with elevated umbilical artery Doppler S/D ratio.',
    diagnosticPearl: 'Asymmetric FGR results from brain-sparing physiology, redistributing cardiac output to the cerebral circulation at the expense of liver glycogen stores.',
    targetSegmentId: 'fetal-ac-plane',
    isNormal: false,
    pairedTwinCaseId: 'case-ob-normal',
    optimalSliceIndex: 50,
    calculatorType: 'FETAL_BIOMETRY',
    searchPatternChecklist: [
      {
        id: 'sp-o1',
        label: 'Biparietal Diameter & Head Circumference Plane',
        systemRegion: 'Fetal Cranium',
        targetStructureId: 'fetal-bpd-thalamus',
        pearl: 'Confirm cavum septi pellucidi (CSP) in anterior 1/3 and symmetric thalami.',
        normalFindings: 'Elliptical skull contour, CSP present, no cerebellar hemisphere in view.',
        abnormalFinding: 'Microcephaly or ventricular dilation >10mm.'
      },
      {
        id: 'sp-o2',
        label: 'Abdominal Circumference (AC) Plane',
        systemRegion: 'Fetal Abdomen',
        targetStructureId: 'fetal-ac-plane',
        pearl: 'Section must be circular; short umbilical vein segment within anterior liver.',
        normalFindings: 'Round abdominal contour, stomach bubble on left, umbilical vein J-shape.',
        abnormalFinding: 'AC <10th percentile reflecting diminished abdominal subcutaneous fat and liver glycogen.'
      },
      {
        id: 'sp-o3',
        label: 'Femur Length (FL) Diaphysis',
        systemRegion: 'Fetal Extremities',
        targetStructureId: 'fetal-femur-diaphysis',
        pearl: 'Align transducer perpendicular to long axis; avoid spur extensions.',
        normalFindings: 'Straight ossified diaphysis with blunt ends.',
        abnormalFinding: 'Shortening <5th percentile or bowing.'
      }
    ],
    explanation: 'Intensive fetal surveillance with twice-weekly umbilical artery Doppler and biophysical profile indicated.'
  },
  {
    id: 'case-ob-normal',
    system: 'obstetrics',
    title: 'Normal 20-Week Fetal Anatomy Survey',
    category: 'Normal Reference',
    presentation: '26-year-old female at 20 weeks 2 days gestation for routine anatomical survey.',
    imagingFindings: 'Concordant biometric parameters (BPD 48mm, HC 175mm, AC 152mm, FL 33mm) corresponding to 50th percentile with normal amniotic fluid index.',
    diagnosticPearl: 'Cavum septi pellucidi is visible between 16 and 37 weeks; absence indicates agenesis of the corpus callosum.',
    targetSegmentId: 'fetal-bpd-thalamus',
    isNormal: true,
    pairedTwinCaseId: 'case-ob-fgr',
    optimalSliceIndex: 50,
    calculatorType: 'FETAL_BIOMETRY',
    searchPatternChecklist: [
      {
        id: 'sp-on1',
        label: 'Fetal Biometry Planes',
        systemRegion: 'Global Biometry',
        targetStructureId: 'fetal-bpd-thalamus',
        pearl: 'All 4 biometry measurements match within 4 days of dating ultrasound.',
        normalFindings: 'Normal Hadlock estimated fetal weight and growth trajectory.',
        abnormalFinding: 'Significant discordance.'
      }
    ],
    explanation: 'Normal mid-trimester ultrasound survey showing intact fetal anatomy across all organ systems.'
  },

  // 8. OPHTHALMOLOGY & ENT CASES
  {
    id: 'case-eye-cmo',
    system: 'ophthalmology_ent',
    title: 'Cystoid Macular Edema (CME) with Loss of Foveal Depression',
    category: 'Retina & Ophthalmic Imaging',
    presentation: '71-year-old male with gradual progressive painless blurriness and metamorphopsia in right eye following cataract surgery (Irvine-Gass syndrome).',
    imagingFindings: 'Macular OCT shows cystic intraretinal hypo-reflective fluid spaces in inner nuclear and outer plexiform layers, loss of normal foveal contour, and central subfield thickness increased to 480 microns (normal <250).',
    diagnosticPearl: 'The petalloid pattern on fluorescein angiography corresponds to fluid accumulation within Henle fiber layer centered on the fovea.',
    targetSegmentId: 'foveal-pit',
    isNormal: false,
    pairedTwinCaseId: 'case-eye-normal',
    optimalSliceIndex: 50,
    searchPatternChecklist: [
      {
        id: 'sp-e1',
        label: 'Foveal Depression & Profile',
        systemRegion: 'Central Macula',
        targetStructureId: 'foveal-pit',
        pearl: 'Normal fovea exhibits an elegant smooth dip in retinal thickness.',
        normalFindings: 'Preserved concave foveal pit contour.',
        abnormalFinding: 'Blunted or dome-shaped elevated fovea from intraretinal cysts.'
      },
      {
        id: 'sp-e2',
        label: 'Intraretinal Layers & Cysts',
        systemRegion: 'Retinal Layers',
        targetStructureId: 'foveal-pit',
        pearl: 'Hyporeflective round cysts accumulate between outer plexiform and inner nuclear layers.',
        normalFindings: 'Crisp parallel horizontal retinal laminations.',
        abnormalFinding: 'Hyporeflective cystic fluid cavities with retinal thickening.'
      },
      {
        id: 'sp-e3',
        label: 'Ellipsoid Zone (EZ) & RPE Band',
        systemRegion: 'Outer Retina',
        targetStructureId: 'rpe-photoreceptors',
        pearl: 'Intact EZ correlates with visual acuity prognosis after resolution of edema.',
        normalFindings: 'Continuous sharp hyper-reflective line above RPE.',
        abnormalFinding: 'Focal EZ disruption or subretinal fluid accumulation.'
      }
    ],
    explanation: 'Treatment with topical NSAIDs and corticosteroids or intravitreal anti-VEGF / steroid implants effectively reduces cystoid macular edema.'
  },
  {
    id: 'case-eye-normal',
    system: 'ophthalmology_ent',
    title: 'Normal High-Definition Macular OCT 10-Layer Cross-Section',
    category: 'Normal Reference',
    presentation: '35-year-old female routine ophthalmology checkup, 20/20 uncorrected visual acuity.',
    imagingFindings: 'Crisp 10-layer retinal architecture, central foveal thickness 225 microns, pristine continuous ellipsoid zone and RPE layer, clear vitreomacular interface.',
    diagnosticPearl: 'The ellipsoid zone directly reflects the health of photoreceptor inner and outer segments.',
    targetSegmentId: 'foveal-pit',
    isNormal: true,
    pairedTwinCaseId: 'case-eye-cmo',
    optimalSliceIndex: 50,
    searchPatternChecklist: [
      {
        id: 'sp-en1',
        label: 'Normal Retinal Laminations',
        systemRegion: 'Macula',
        targetStructureId: 'foveal-pit',
        pearl: 'Check smooth transitions across all 10 retinal strata.',
        normalFindings: 'Normal central foveal thickness (220-250 μm) with graceful foveal contour.',
        abnormalFinding: 'Retinal thickening or fluid.'
      }
    ],
    explanation: 'Standard anatomical reference scan for ophthalmic optical coherence tomography.'
  }
];

export const SYSTEM_DEFAULT_PROJECTIONS: Record<OrganSystemId, { name: string; angles?: { primary: number; secondary: number }; slice?: number; probe?: string }> = {
  cardiovascular: { name: 'LAO Caudal ("Spider")', angles: { primary: 40, secondary: -30 } },
  neurology: { name: 'Axial Brain CT (ASPECTS Plane)', slice: 42 },
  pulmonology: { name: 'PA Chest Radiograph', slice: 55 },
  gastroenterology: { name: 'Couinaud Transverse CT', slice: 60 },
  nephrology: { name: 'Multiphasic Axial MRI', slice: 68 },
  musculoskeletal: { name: 'Knee Sagittal MRI', slice: 50 },
  obstetrics: { name: 'Transthalamic BPD Plane', slice: 50, probe: 'fetal-bpd' },
  ophthalmology_ent: { name: 'Macular Radial B-Scan', slice: 50 }
};
