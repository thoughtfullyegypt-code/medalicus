import React, { useState } from 'react';
import { GantryAngles, ProjectionPreset, ViewMode, ImagingModality, OrganSystemId, ClinicalCase, LocalSandboxFile } from '../types';
import { LayerVisibility } from './LayerControls';
import { AnatomyCanvas } from './AnatomyCanvas';
import { ClinicalCanvas } from './ClinicalCanvas';
import { UltrasoundCanvas } from './UltrasoundCanvas';
import { Procedural2DCanvas } from './Procedural2DCanvas';
import { VesselDetailPanel } from './VesselDetailPanel';
import { SearchPatternBar } from './SearchPatternBar';
import { QuizModal } from './QuizModal';
import { ClinicalCaseModal } from './ClinicalCaseModal';
import { InspectionChallengeModal } from './InspectionChallengeModal';
import { Maximize2, SplitSquareVertical, Eye, FileText, CheckCircle2 } from 'lucide-react';

interface DualViewportProps {
  systemId: OrganSystemId;
  angles: GantryAngles;
  layers: LayerVisibility;
  systemLayers?: Record<string, boolean>;
  organOpacity?: number;
  bodySkinOpacity?: number;
  cameraPresetTrigger?: { preset: 'axial' | 'coronal' | 'sagittal' | '3d'; timestamp: number } | null;
  modality: ImagingModality;
  onSelectModality: (modality: ImagingModality) => void;
  activeProbePreset: 'plax' | 'psax' | 'a4c' | 'subcostal' | string;
  onSelectProbePreset: (presetId: 'plax' | 'psax' | 'a4c' | 'subcostal' | string) => void;
  selectedVesselId: string | null;
  onSelectVessel: (id: string | null) => void;
  alignTrigger: number;
  viewMode: ViewMode;
  onCloseOverlayMode: () => void;
  onSetPreset: (preset: ProjectionPreset) => void;
  quizScore: number;
  quizStreak: number;
  onUpdateScore: (score: number, streak: number) => void;
  
  // Doctor's Edge props
  activeCase: ClinicalCase;
  comparisonMode: boolean;
  onToggleComparison: () => void;
  presenterLaserActive: boolean;
  blindCaseMode: boolean;
  sliceIndex: number;
  onSliceIndexChange: (slice: number) => void;
  localFile: LocalSandboxFile | null;
  onExportAnki: (frontBlob: Blob, backBlob: Blob) => void;
  searchPatternOpen: boolean;
  onToggleSearchPattern: () => void;
}

export const DualViewport: React.FC<DualViewportProps> = ({
  systemId,
  angles,
  layers,
  systemLayers,
  organOpacity,
  bodySkinOpacity,
  cameraPresetTrigger,
  modality,
  onSelectModality,
  activeProbePreset,
  onSelectProbePreset,
  selectedVesselId,
  onSelectVessel,
  alignTrigger,
  viewMode,
  onCloseOverlayMode,
  onSetPreset,
  quizScore,
  quizStreak,
  onUpdateScore,
  activeCase,
  comparisonMode,
  onToggleComparison,
  presenterLaserActive,
  blindCaseMode,
  sliceIndex,
  onSliceIndexChange,
  localFile,
  onExportAnki,
  searchPatternOpen,
  onToggleSearchPattern
}) => {
  const [layoutMode, setLayoutMode] = useState<'both' | 'anatomy' | 'clinical'>('anatomy');
  const [showEchoLabels, setShowEchoLabels] = useState(true);
  
  // Search Pattern checklist state
  const [currentSearchStepIndex, setCurrentSearchStepIndex] = useState(0);
  const [checkedSearchSteps, setCheckedSearchSteps] = useState<Record<string, boolean>>({});

  const handleSelectSearchStep = (index: number) => {
    setCurrentSearchStepIndex(index);
    const step = activeCase?.searchPatternChecklist?.[index];
    if (step && step.targetStructureId) {
      onSelectVessel(step.targetStructureId);
    }
  };

  const handleToggleSearchStepCheck = (index: number) => {
    const step = activeCase?.searchPatternChecklist?.[index];
    if (step) {
      setCheckedSearchSteps(prev => ({
        ...prev,
        [step.id]: !prev[step.id]
      }));
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row gap-3 md:gap-4 p-2 md:p-4 bg-[#f4f6f8] overflow-hidden">
      {/* Persistent view switcher: one clean choice, without hiding core tools */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-lg backdrop-blur-md">
        {([
          { id: 'anatomy', label: '3D anatomy' },
          { id: 'both', label: 'Compare' },
          { id: 'clinical', label: 'Projection' }
        ] as const).map(option => (
          <button
            key={option.id}
            onClick={() => setLayoutMode(option.id)}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] sm:text-xs font-medium transition ${layoutMode === option.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {/* Viewport 1: 3D Patient, C-Arm / Probe / Multi-System 3D Observer */}
      {(layoutMode === 'both' || layoutMode === 'anatomy') && (
        <div className={`relative ${layoutMode === 'both' ? 'w-full flex-1 min-h-0 md:flex-[1.55] md:min-w-0 border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm' : 'w-full flex-1 min-h-0 border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm'}`}>
          <AnatomyCanvas
            systemId={systemId}
            angles={angles}
            layers={layers}
            systemLayers={systemLayers}
            organOpacity={organOpacity}
            bodySkinOpacity={bodySkinOpacity}
            cameraPresetTrigger={cameraPresetTrigger}
            modality={modality}
            activeProbePreset={activeProbePreset}
            selectedVesselId={selectedVesselId}
            onSelectVessel={onSelectVessel}
            alignTrigger={alignTrigger}
            sliceIndex={sliceIndex}
          />
          <div className="pointer-events-none absolute top-4 left-4 z-20 max-w-[250px] rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-teal-700">SPATIAL ANATOMY</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{systemId === 'cardiovascular' ? 'Explore the heart' : 'Explore the anatomy'}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Drag to rotate · scroll to zoom · select a structure</p>
          </div>
          <button
            onClick={() => setLayoutMode(layoutMode === 'anatomy' ? 'both' : 'anatomy')}
            title={layoutMode === 'anatomy' ? 'Split View' : 'Maximize 3D Anatomy'}
            className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-white/95 hover:bg-slate-50 text-slate-600 border border-slate-200 transition shadow-lg"
          >
            {layoutMode === 'anatomy' ? <SplitSquareVertical className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* Viewport 2: Real-Time Diagnostic Output (Procedural 2D Multi-System PACS / Fluoro / Echo) */}
      {(layoutMode === 'both' || layoutMode === 'clinical') && (
        <div className={`relative ${layoutMode === 'both' ? 'w-full flex-1 min-h-0 md:flex-1 md:min-w-0 border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm' : 'w-full flex-1 min-h-0 border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm'}`}>
          {systemId === 'cardiovascular' && modality === 'ultrasound' && !comparisonMode && !presenterLaserActive ? (
            <UltrasoundCanvas
              activePresetId={activeProbePreset as any}
              onSelectPreset={onSelectProbePreset as any}
              showLabels={showEchoLabels}
              onToggleLabels={() => setShowEchoLabels(!showEchoLabels)}
            />
          ) : (
            <Procedural2DCanvas
              systemId={systemId}
              activeCase={activeCase}
              sliceIndex={sliceIndex}
              onSliceIndexChange={onSliceIndexChange}
              selectedSegmentId={selectedVesselId}
              onSelectSegment={onSelectVessel}
              comparisonMode={comparisonMode}
              onToggleComparison={onToggleComparison}
              presenterLaserActive={presenterLaserActive}
              blindCaseMode={blindCaseMode}
              localFile={localFile}
              onExportAnki={onExportAnki}
            />
          )}

          <button
            onClick={() => setLayoutMode(layoutMode === 'clinical' ? 'both' : 'clinical')}
            title={layoutMode === 'clinical' ? 'Split View' : 'Maximize Clinical View'}
            className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition shadow-lg z-10"
          >
            {layoutMode === 'clinical' ? <SplitSquareVertical className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* Floating Anatomical Detail Card */}
      {selectedVesselId && viewMode === 'explore' && (
        <div className="absolute top-4 left-4 z-30">
          <VesselDetailPanel
            vesselId={selectedVesselId}
            systemId={systemId}
            onClose={() => onSelectVessel(null)}
            onApplyPreset={onSetPreset}
          />
        </div>
      )}

      {/* Floating Systematic Clinical Search Pattern Bar */}
      {searchPatternOpen && (activeCase?.searchPatternChecklist?.length ?? 0) > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 px-3 w-full max-w-xl">
          <SearchPatternBar
            steps={activeCase?.searchPatternChecklist || []}
            currentStepIndex={currentSearchStepIndex}
            onSelectStep={handleSelectSearchStep}
            onToggleStepCheck={handleToggleSearchStepCheck}
            checkedMap={checkedSearchSteps}
            onClose={onToggleSearchPattern}
          />
        </div>
      )}

      {/* Floating Target Angle Inspection Challenge Panel */}
      {viewMode === 'inspect-challenge' && (
        <div className="absolute top-4 right-4 z-40 max-w-sm sm:max-w-md w-full">
          <InspectionChallengeModal
            currentAngles={angles}
            currentModality={modality}
            activeProbePreset={activeProbePreset as any}
            onSelectModality={onSelectModality}
            onSelectProbePreset={onSelectProbePreset as any}
            onHighlightVessel={onSelectVessel}
            onClose={onCloseOverlayMode}
          />
        </div>
      )}

      {/* Floating Quiz Mode Panel */}
      {viewMode === 'quiz' && (
        <div className="absolute top-4 right-4 z-40 max-w-sm sm:max-w-md w-full">
          <QuizModal
            onClose={onCloseOverlayMode}
            onSetPreset={onSetPreset}
            onHighlightVessel={id => onSelectVessel(id)}
            onUpdateScore={onUpdateScore}
            currentScore={quizScore}
            currentStreak={quizStreak}
          />
        </div>
      )}

      {/* Floating Clinical Cases Panel */}
      {viewMode === 'cases' && (
        <div className="absolute top-4 right-4 z-40 max-w-sm sm:max-w-lg w-full">
          <ClinicalCaseModal
            onClose={onCloseOverlayMode}
            onSetPreset={onSetPreset}
            onHighlightVessel={id => onSelectVessel(id)}
          />
        </div>
      )}
    </div>
  );
};
