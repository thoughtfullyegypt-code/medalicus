export type OrganSystemId = 
  | 'cardiovascular' 
  | 'neurology' 
  | 'pulmonology' 
  | 'gastroenterology' 
  | 'nephrology' 
  | 'musculoskeletal' 
  | 'obstetrics' 
  | 'ophthalmology_ent';

export type SystemCategory = OrganSystemId;

export type SubModuleId = 
  | 'coronary-angio' 
  | 'echocardiography' 
  | 'cardiac-ccta'
  | 'brain-stroke' 
  | 'circle-of-willis'
  | 'chest-xray' 
  | 'bronchoscopy'
  | 'couinaud-liver'
  | 'lap-cholecystectomy'
  | 'ercp-biliary'
  | 'renal-vasculature'
  | 'prostate-pirads'
  | 'knee-mri'
  | 'spine-verse'
  | 'fetal-biometry'
  | 'pelvic-mri'
  | 'macular-oct'
  | 'sinus-ct';

export type ImagingModality = 'fluoro' | 'ultrasound' | 'ct' | 'mri' | 'endoscopy' | 'oct';

export type SpatialControllerType = 'c-arm-gantry' | 'ultrasound-probe' | 'ct-mpr-slicer' | 'endoscope-camera';

export type ClinicalScoreType = 
  | 'SYNTAX' 
  | 'CAD-RADS' 
  | 'ASPECTS' 
  | 'COUINAUD_RESECTION' 
  | 'PIRADS' 
  | 'SIMPSON_EF' 
  | 'FETAL_BIOMETRY';

export interface OrganSystem {
  id: OrganSystemId;
  name: string;
  shortName: string;
  icon: string;
  badge: string;
  color: string;
  description: string;
  defaultModality: ImagingModality;
  spatialController: SpatialControllerType;
  modules: {
    id: SubModuleId;
    name: string;
    clinicalContext: string;
    status: 'ready' | 'preview';
    calculator?: ClinicalScoreType;
  }[];
}

export type ViewMode = 'explore' | 'inspect-challenge' | 'quiz' | 'cases' | 'equipment';

export interface GantryAngles {
  primary: number; // RAO (-) to LAO (+) in degrees, -90 to +90
  secondary: number; // Caudal (-) to Cranial (+) in degrees, -50 to +50
}

export interface ProbeOrientation {
  presetId: string;
  name: string;
  description: string;
  surfaceLandmark: string; // e.g. "4th Left Intercostal Space Parasternal"
  chestPosition: [number, number, number]; // 3D coordinates on thorax
  rotation: [number, number, number]; // Euler angles
  visibleChambers: string[];
}

export interface ProjectionPreset {
  id: string;
  name: string;
  shorthand: string;
  angles: GantryAngles;
  vesselTarget: 'LCA' | 'RCA' | 'Both' | 'Circ' | 'Whole';
  bestFor: string;
  clinicalRationale: string;
  keyLandmarks: string[];
}

export interface SearchChecklistStep {
  id: string;
  label: string;
  systemRegion: string;
  targetStructureId: string;
  pearl: string;
  normalFindings: string;
  abnormalFinding: string;
  isChecked?: boolean;
}

export interface AnatomicalSegment {
  id: string;
  name: string;
  system: OrganSystemId;
  meshNodeName: string;
  abbr?: string;
  description: string;
  clinicalSignificance: string;
  color: string;
  defaultProjectionOrView?: string;
  points?: [number, number, number][];
  radius?: number;
  hasStenosis?: boolean;
  // System-specific fields
  syntaxWeight?: number;
  aspectsRegion?: string;
  couinaudSegment?: number;
  piradsZone?: string;
  fetalStructure?: string;
  octLayer?: string;
}

export type VesselDefinition = AnatomicalSegment & {
  abbr: string;
  system: 'LCA' | 'RCA';
  points: [number, number, number][];
  radius: number;
};

export interface QuizQuestion {
  id: string;
  system: OrganSystemId;
  segmentId: string;
  preset?: ProjectionPreset;
  prompt: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
}

export interface ClinicalCase {
  id: string;
  system: OrganSystemId;
  title: string;
  category: string;
  presentation: string;
  history?: string;
  ecgFinding?: string;
  imagingFindings: string;
  diagnosticPearl: string;
  targetVesselId?: string;
  targetSegmentId: string;
  lesionLocation?: string;
  stenosisPercent?: number;
  isNormal?: boolean;
  pairedTwinCaseId?: string; // Links Normal <-> Pathology for Twin-Sync
  optimalProjectionId?: string;
  optimalViewAngles?: GantryAngles;
  optimalSliceIndex?: number;
  optimalProbePreset?: string;
  calculatorType?: ClinicalScoreType;
  searchPatternChecklist: SearchChecklistStep[];
  explanation: string;
}

export interface InspectionChallenge {
  id: string;
  title: string;
  system?: OrganSystemId;
  modality: ImagingModality;
  prompt: string;
  clinicalContext: string;
  targetAngles: GantryAngles;
  toleranceDeg: number;
  targetProbePreset?: string;
  highlightVesselId?: string;
  targetSliceIndex?: number;
  clue: string;
  revealedInsight: string;
  keyFeatureUnlocked: string;
}

export interface TelestratorStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  timestamp: number;
}

export interface LocalSandboxFile {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  loadedAt: number;
}
