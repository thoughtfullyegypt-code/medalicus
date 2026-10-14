import { OrganSystem } from '../types';

export const ORGAN_SYSTEMS: OrganSystem[] = [
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    shortName: 'Cardio',
    icon: 'Heart',
    badge: 'C-Arm & Echo',
    color: '#ef4444',
    description: '3D Coronary arterial tree, C-arm fluoroscopy projections, and echocardiographic acoustic slicing windows.',
    defaultModality: 'fluoro',
    spatialController: 'c-arm-gantry',
    modules: [
      {
        id: 'coronary-angio',
        name: 'Virtual Coronary Angiography',
        clinicalContext: 'C-Arm fluoroscopy (RAO, LAO, Cranial, Caudal) & vessel foreshortening/overlap.',
        status: 'ready',
        calculator: 'SYNTAX'
      },
      {
        id: 'echocardiography',
        name: 'Transthoracic Echo (TTE)',
        clinicalContext: 'Parasternal & Apical acoustic windows slicing a dynamic 3D heart.',
        status: 'ready',
        calculator: 'SIMPSON_EF'
      },
      {
        id: 'cardiac-ccta',
        name: 'Coronary CT Angiography (CCTA)',
        clinicalContext: 'CAD-RADS plaque characterization and multi-planar vessel lumen reconstruction.',
        status: 'ready',
        calculator: 'CAD-RADS'
      }
    ]
  },
  {
    id: 'neurology',
    name: 'Neurology & Neurovascular',
    shortName: 'Neuro',
    icon: 'Brain',
    badge: 'Stroke & Brain CT',
    color: '#8b5cf6',
    description: 'Circle of Willis arterial ring, ischemic stroke territories, and multi-planar non-contrast CT/MRI cross-sections.',
    defaultModality: 'ct',
    spatialController: 'ct-mpr-slicer',
    modules: [
      {
        id: 'brain-stroke',
        name: 'Hyperacute Stroke CT & ASPECTS',
        clinicalContext: '10-region ASPECTS scoring on non-contrast CT for MCA ischemic stroke.',
        status: 'ready',
        calculator: 'ASPECTS'
      },
      {
        id: 'circle-of-willis',
        name: 'Circle of Willis 3D Angiography',
        clinicalContext: 'Collateral flow, saccular berry aneurysms, and basilar artery syndrome.',
        status: 'ready'
      }
    ]
  },
  {
    id: 'pulmonology',
    name: 'Pulmonology & Thorax',
    shortName: 'Pulm',
    icon: 'Wind',
    badge: 'CXR & Bronch',
    color: '#06b6d4',
    description: 'High-resolution chest radiography ray-casting, the Silhouette Sign, and 3D virtual bronchoscopic airway navigation.',
    defaultModality: 'ct',
    spatialController: 'ct-mpr-slicer',
    modules: [
      {
        id: 'chest-xray',
        name: 'Interactive Chest X-Ray (CXR)',
        clinicalContext: 'PA vs Lateral beams, Silhouette Sign, and 3D lobar opacification vectors.',
        status: 'ready'
      },
      {
        id: 'bronchoscopy',
        name: 'Virtual Bronchoscopic Tree',
        clinicalContext: 'Tracheobronchial arborization, carina bifurcations, and endobronchial biopsy sites.',
        status: 'ready'
      }
    ]
  },
  {
    id: 'gastroenterology',
    name: 'Gastroenterology & Hepatic',
    shortName: 'GI & Liver',
    icon: 'Activity',
    badge: 'Couinaud & Lap',
    color: '#10b981',
    description: 'Couinaud 8 liver segments on multiphasic CT, Laparoscopic Cholecystectomy Calot triangle, and ERCP fluoroscopy.',
    defaultModality: 'ct',
    spatialController: 'ct-mpr-slicer',
    modules: [
      {
        id: 'couinaud-liver',
        name: 'Couinaud 8 Liver Segments',
        clinicalContext: 'Portal vein and hepatic vein anatomy for anatomical surgical resections.',
        status: 'ready',
        calculator: 'COUINAUD_RESECTION'
      },
      {
        id: 'lap-cholecystectomy',
        name: 'Laparoscopic Critical View of Safety',
        clinicalContext: 'Calot triangle dissection, cystic duct, cystic artery, and aberrant right hepatic duct.',
        status: 'ready'
      },
      {
        id: 'ercp-biliary',
        name: 'Virtual ERCP & Biliary Tree',
        clinicalContext: 'Fluoroscopic duct cannulation, CBD choledocholithiasis, and pancreatic duct anomalies.',
        status: 'ready'
      }
    ]
  },
  {
    id: 'nephrology',
    name: 'Nephrology & Urology',
    shortName: 'Renal & Uro',
    icon: 'Layers',
    badge: 'PI-RADS & Urogram',
    color: '#f59e0b',
    description: 'Renal vasculature, pelvicalyceal collecting system on CT Urogram, and multiphasic Prostate MRI PI-RADS v2.1.',
    defaultModality: 'mri',
    spatialController: 'ct-mpr-slicer',
    modules: [
      {
        id: 'prostate-pirads',
        name: 'Prostate MRI (PI-RADS v2.1)',
        clinicalContext: 'Peripheral zone (DWI dominant) vs Transition zone (T2W dominant) scoring.',
        status: 'ready',
        calculator: 'PIRADS'
      },
      {
        id: 'renal-vasculature',
        name: 'Renal Vasculature & CT Urogram',
        clinicalContext: 'Nutcracker syndrome, accessory renal arteries, and hydronephrosis grading.',
        status: 'ready'
      }
    ]
  },
  {
    id: 'musculoskeletal',
    name: 'Musculoskeletal (MSK)',
    shortName: 'MSK',
    icon: 'Shield',
    badge: 'Knee & Spine MRI',
    color: '#ec4899',
    description: 'Multi-planar knee MRI cross-sections (cruciate ligaments, menisci) and vertebral column CT with exiting nerve roots.',
    defaultModality: 'mri',
    spatialController: 'ct-mpr-slicer',
    modules: [
      {
        id: 'knee-mri',
        name: 'Knee Joint Multi-Planar MRI',
        clinicalContext: 'Sagittal/Coronal evaluation of ACL/PCL tears, meniscal bucket handles, and cartilage.',
        status: 'ready'
      },
      {
        id: 'spine-verse',
        name: 'Spine VerSe & Neural Foramina',
        clinicalContext: 'Vertebral fracture classification, disc herniation vectors, and radiculopathy mapping.',
        status: 'ready'
      }
    ]
  },
  {
    id: 'obstetrics',
    name: 'Obstetrics & Gynecology',
    shortName: 'OB / GYN',
    icon: 'Baby',
    badge: 'Fetal Biometry US',
    color: '#a855f7',
    description: 'Fetal biometry ultrasound planes (BPD, HC, AC, FL) with Hadlock growth curves and female pelvic zonal MRI.',
    defaultModality: 'ultrasound',
    spatialController: 'ultrasound-probe',
    modules: [
      {
        id: 'fetal-biometry',
        name: 'Fetal Biometry US & Calipers',
        clinicalContext: 'Standardized fetal biometric scanning planes and gestational age growth percentiles.',
        status: 'ready',
        calculator: 'FETAL_BIOMETRY'
      },
      {
        id: 'pelvic-mri',
        name: 'Female Pelvic Zonal MRI',
        clinicalContext: 'Endometrial-myometrial junctional zone, adenomyosis, and ovarian dermoid differentiation.',
        status: 'ready'
      }
    ]
  },
  {
    id: 'ophthalmology_ent',
    name: 'Ophthalmology & ENT',
    shortName: 'Eye & ENT',
    icon: 'Eye',
    badge: 'Macular OCT & Sinus',
    color: '#14b8a6',
    description: 'Macular Optical Coherence Tomography (OCT) retinal laminations and Paranasal Sinus CT Ostiomeatal Complexes.',
    defaultModality: 'oct',
    spatialController: 'ct-mpr-slicer',
    modules: [
      {
        id: 'macular-oct',
        name: 'Macular OCT 10-Layer Cross-Section',
        clinicalContext: 'Retinal nerve fiber layer, foveal depression, subretinal fluid, and diabetic macular edema.',
        status: 'ready'
      },
      {
        id: 'sinus-ct',
        name: 'Paranasal Sinus CT & FESS',
        clinicalContext: 'Ostiomeatal complex obstruction, uncinate process, and sinus drainage pathways.',
        status: 'ready'
      }
    ]
  }
];
