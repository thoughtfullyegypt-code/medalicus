import React, { useState, useEffect } from 'react';
import { 
  OrganSystemId, 
  ViewMode, 
  GantryAngles, 
  ProjectionPreset, 
  ImagingModality, 
  ClinicalScoreType, 
  LocalSandboxFile 
} from './types';
import { ORGAN_SYSTEMS } from './data/systemsData';
import { PROJECTION_PRESETS } from './data/coronaryData';
import { PROBE_PRESETS } from './data/challengesData';
import { CLINICAL_CASES, ALL_SYSTEM_SEGMENTS, SYSTEM_DEFAULT_PROJECTIONS } from './data/multiSystemsData';

import { Header } from './components/Header';
import { DualViewport } from './components/DualViewport';
import { GantryControls } from './components/GantryControls';
import { LayerControls, LayerVisibility } from './components/LayerControls';
import { ReferenceModal } from './components/ReferenceModal';
import { ClinicalCalculatorsModal } from './components/ClinicalCalculatorsModal';
import { LocalSandboxDropzone } from './components/LocalSandboxDropzone';

import { 
  ChevronUp, 
  ChevronDown, 
  Sliders, 
  Radio, 
  Compass, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  RefreshCw,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export function App() {
  // 1. Organ System state
  const [activeSystemId, setActiveSystemId] = useState<OrganSystemId>('cardiovascular');

  // 2. Imaging Modality & Cross-Sectional Slice
  const [modality, setModality] = useState<ImagingModality>('fluoro');
  const [activeProbePreset, setActiveProbePreset] = useState<'plax' | 'psax' | 'a4c' | 'subcostal' | string>('plax');
  const [sliceIndex, setSliceIndex] = useState(50); // MPR cross-sectional slice 0-100

  // 3. C-Arm Angles state (defaults to Spider View for cardiovascular)
  const [angles, setAngles] = useState<GantryAngles>({ primary: 40, secondary: -30 });
  const [activePresetId, setActivePresetId] = useState<string | null>('lao-caudal-spider');
  const [filterSystem, setFilterSystem] = useState<'ALL' | 'LCA' | 'RCA'>('ALL');

  // 4. Layer visibility state
  const [layers, setLayers] = useState<LayerVisibility>({
    bodySkin: true,
    bodySkinOpacity: 25,
    surfaceLandmarks: true,
    heartChambers: true,
    heartOpacity: 38,
    aorta: true,
    ribsAndSpine: false,
    beamCone: true,
    vesselLabels: true,
    catheter: true
  });

  // 4b. Multi-system layers & 3D camera controls
  const [systemLayers, setSystemLayers] = useState<Record<string, boolean>>({});
  const [organOpacity, setOrganOpacity] = useState(45);
  const [bodySkinOpacity, setBodySkinOpacity] = useState(22);
  const [cameraPresetTrigger, setCameraPresetTrigger] = useState<{ preset: 'axial' | 'coronal' | 'sagittal' | '3d'; timestamp: number } | null>(null);

  const handleToggleSystemLayer = (layerKey: string) => {
    setSystemLayers(prev => ({
      ...prev,
      [layerKey]: prev[layerKey] === undefined ? false : !prev[layerKey]
    }));
  };

  // 5. Selected vessel / segment & view mode
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [alignTrigger, setAlignTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('explore');

  // 6. Clinical Cases & Active Case
  const systemCases = CLINICAL_CASES.filter(c => c.system === activeSystemId);
  const [activeCaseId, setActiveCaseId] = useState<string>(systemCases[0]?.id || 'case-cardio-stemi');
  const activeCase = CLINICAL_CASES.find(c => c.id === activeCaseId) || systemCases[0] || CLINICAL_CASES[0];

  // 7. Doctor's Edge 6 Modules State
  // Feature 1: Twin-Sync Mode (Normal vs. Pathology)
  const [comparisonMode, setComparisonMode] = useState(false);

  // Feature 2: Systematic Search Pattern Checklist
  const [searchPatternOpen, setSearchPatternOpen] = useState(false);

  // Feature 3: Clinical Calculators
  const [activeCalculator, setActiveCalculator] = useState<ClinicalScoreType | null>(null);

  // Feature 4: Local Sandbox File ("Bring Your Own DICOM/Cine")
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);
  const [localSandboxFile, setLocalSandboxFile] = useState<LocalSandboxFile | null>(null);

  // Feature 5: Presenter Mode & Blind Case
  const [presenterLaserActive, setPresenterLaserActive] = useState(false);
  const [blindCaseMode, setBlindCaseMode] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Quiz progress
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);

  // Modals & Drawers
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [controlsDrawerOpen, setControlsDrawerOpen] = useState(true);

  // Handle System Change
  const handleSelectSystem = (newSystemId: OrganSystemId) => {
    setActiveSystemId(newSystemId);
    setSelectedVesselId(null);

    // Auto-select first case for this system
    const newSystemCases = CLINICAL_CASES.filter(c => c.system === newSystemId);
    if (newSystemCases.length > 0) {
      setActiveCaseId(newSystemCases[0].id);
      if (newSystemCases[0].optimalSliceIndex !== undefined) {
        setSliceIndex(newSystemCases[0].optimalSliceIndex);
      }
    }

    // Auto-align default projection / slice
    const defaultProj = SYSTEM_DEFAULT_PROJECTIONS[newSystemId];
    if (defaultProj?.angles) {
      setAngles(defaultProj.angles);
    }
    if (defaultProj?.slice !== undefined) {
      setSliceIndex(defaultProj.slice);
    }
  };

  // Handle Preset selection
  const handleSelectPreset = (preset: ProjectionPreset) => {
    setAngles(preset.angles);
    setActivePresetId(preset.id);
  };

  const handleAngleChange = (newAngles: GantryAngles) => {
    setAngles(newAngles);
    const matched = PROJECTION_PRESETS.find(
      p => p.angles.primary === newAngles.primary && p.angles.secondary === newAngles.secondary
    );
    setActivePresetId(matched ? matched.id : null);
  };

  // Spacebar Keybind for Twin-Sync Mode (Doctor's Edge Feature 1)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user presses Spacebar while not typing in an input
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        setComparisonMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // URL Hash Deep-Link State Serialization (Doctor's Edge Feature 5)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const sys = params.get('system') as OrganSystemId | null;
    const cId = params.get('case');
    const prim = params.get('lao');
    const sec = params.get('cran');
    const sl = params.get('slice');

    if (sys && ORGAN_SYSTEMS.some(s => s.id === sys)) {
      setActiveSystemId(sys);
    }
    if (cId && CLINICAL_CASES.some(c => c.id === cId)) {
      setActiveCaseId(cId);
    }
    if (prim !== null && sec !== null) {
      setAngles({ primary: Number(prim), secondary: Number(sec) });
    }
    if (sl !== null) {
      setSliceIndex(Number(sl));
    }
  }, []);

  const handleShareDeepLink = () => {
    const hash = `#system=${activeSystemId}&case=${activeCaseId}&lao=${angles.primary}&cran=${angles.secondary}&slice=${sliceIndex}`;
    window.location.hash = hash;
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  // 1-Click Anki Export Download Handler (Doctor's Edge Feature 6)
  const handleExportAnki = (frontBlob: Blob, backBlob: Blob) => {
    const downloadBlob = (blob: Blob, filename: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    downloadBlob(frontBlob, `Medalicus_${activeSystemId}_Anki_Front.png`);
    setTimeout(() => {
      downloadBlob(backBlob, `Medalicus_${activeSystemId}_Anki_Back.png`);
    }, 400);
  };

  const currentProbe = PROBE_PRESETS.find(p => p.presetId === activeProbePreset) || PROBE_PRESETS[0];

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080c14] text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation */}
      <Header
        systems={ORGAN_SYSTEMS}
        activeSystemId={activeSystemId}
        onSelectSystem={handleSelectSystem}
        modality={modality}
        onSelectModality={setModality}
        viewMode={viewMode}
        onSelectMode={setViewMode}
        onOpenReference={() => setReferenceOpen(true)}
        quizScore={quizScore}
        quizStreak={quizStreak}
        onOpenCalculator={() => setActiveCalculator(activeCase.calculatorType || 'SYNTAX')}
        searchPatternOpen={searchPatternOpen}
        onToggleSearchPattern={() => setSearchPatternOpen(!searchPatternOpen)}
        comparisonMode={comparisonMode}
        onToggleComparison={() => setComparisonMode(!comparisonMode)}
        onOpenSandbox={() => setSandboxModalOpen(true)}
        presenterLaserActive={presenterLaserActive}
        onTogglePresenterLaser={() => setPresenterLaserActive(!presenterLaserActive)}
        blindCaseMode={blindCaseMode}
        onToggleBlindCase={() => setBlindCaseMode(!blindCaseMode)}
        onShareDeepLink={handleShareDeepLink}
        shareCopied={shareCopied}
      />

      {/* Main Workspace */}
      <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
        {/* Dual 3D & 2D Projection Viewport */}
        <div className="flex-1 w-full h-full min-h-0">
          <DualViewport
            systemId={activeSystemId}
            angles={angles}
            layers={layers}
            systemLayers={systemLayers}
            organOpacity={organOpacity}
            bodySkinOpacity={bodySkinOpacity}
            cameraPresetTrigger={cameraPresetTrigger}
            modality={modality}
            onSelectModality={setModality}
            activeProbePreset={activeProbePreset}
            onSelectProbePreset={setActiveProbePreset}
            selectedVesselId={selectedVesselId}
            onSelectVessel={setSelectedVesselId}
            alignTrigger={alignTrigger}
            viewMode={viewMode}
            onCloseOverlayMode={() => setViewMode('explore')}
            onSetPreset={handleSelectPreset}
            quizScore={quizScore}
            quizStreak={quizStreak}
            onUpdateScore={(s, str) => {
              setQuizScore(s);
              setQuizStreak(str);
            }}
            activeCase={activeCase}
            comparisonMode={comparisonMode}
            onToggleComparison={() => setComparisonMode(!comparisonMode)}
            presenterLaserActive={presenterLaserActive}
            blindCaseMode={blindCaseMode}
            sliceIndex={sliceIndex}
            onSliceIndexChange={setSliceIndex}
            localFile={localSandboxFile}
            onExportAnki={handleExportAnki}
            searchPatternOpen={searchPatternOpen}
            onToggleSearchPattern={() => setSearchPatternOpen(!searchPatternOpen)}
          />
        </div>

        {/* Collapsible Bottom Controls Drawer */}
        <div className={`transition-all duration-300 ease-in-out border-t border-slate-800 bg-[#0d131c]/95 backdrop-blur-md z-20 ${
          controlsDrawerOpen ? 'max-h-80' : 'max-h-9'
        }`}>
          {/* Drawer Handle */}
          <div 
            onClick={() => setControlsDrawerOpen(!controlsDrawerOpen)}
            className="h-9 px-4 flex items-center justify-between cursor-pointer border-b border-slate-800/60 hover:bg-slate-800/40 select-none text-xs"
          >
            <div className="flex items-center space-x-2">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-semibold text-slate-200">
                {activeSystemId === 'cardiovascular'
                  ? (modality === 'fluoro' ? 'C-Arm Gantry & Anatomy Controls' : 'Ultrasound Probe Position & Echo Windows')
                  : `${activeSystemId.toUpperCase()} Multi-Planar Controls & Slice Scrubber`}
              </span>
              <span className="text-[10px] text-teal-400 font-mono bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                {activeSystemId === 'cardiovascular'
                  ? (modality === 'fluoro' 
                      ? `${angles.primary === 0 ? 'AP 0°' : angles.primary > 0 ? `LAO ${angles.primary}°` : `RAO ${Math.abs(angles.primary)}°`} • ${angles.secondary === 0 ? '0°' : angles.secondary > 0 ? `CRAN ${angles.secondary}°` : `CAUD ${Math.abs(angles.secondary)}°`}`
                      : `PROBE WINDOW: ${currentProbe.name.toUpperCase()}`)
                  : `MPR SLICE: ${sliceIndex} / 100`}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-slate-400 hover:text-slate-200">
              <span className="text-[10px] hidden sm:inline">{controlsDrawerOpen ? 'Collapse' : 'Expand Controls'}</span>
              {controlsDrawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </div>

          {/* Drawer Content */}
          {controlsDrawerOpen && (
            <div className="p-3 max-h-72 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2">
                {activeSystemId === 'cardiovascular' ? (
                  modality === 'fluoro' ? (
                    <GantryControls
                      angles={angles}
                      onChangeAngles={handleAngleChange}
                      activePresetId={activePresetId}
                      onSelectPreset={handleSelectPreset}
                      filterSystem={filterSystem}
                      onFilterSystemChange={setFilterSystem}
                    />
                  ) : (
                    /* Ultrasound Probe Window Presets */
                    <div className="bg-[#0f1724] border border-slate-800 rounded-xl p-3.5 flex flex-col space-y-3 select-none text-xs">
                      <div className="flex items-center space-x-1.5 font-semibold text-slate-200 border-b border-slate-800/80 pb-2">
                        <Radio className="w-4 h-4 text-cyan-400" />
                        <span>Transthoracic Echocardiogram (TTE) Acoustic Windows</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PROBE_PRESETS.map(p => {
                          const isSelected = activeProbePreset === p.presetId;
                          return (
                            <button
                              key={p.presetId}
                              onClick={() => setActiveProbePreset(p.presetId)}
                              className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-bold shadow-md'
                                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs">{p.presetId.toUpperCase()}</span>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1 leading-snug">{p.name}</div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-lg p-2.5 space-y-1">
                        <div className="font-semibold text-cyan-300 text-xs">Acoustic Window: {currentProbe.name}</div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{currentProbe.description}</p>
                      </div>
                    </div>
                  )
                ) : (
                  /* Multi-Planar Reconstruction (MPR) Slice Scrubber for other 7 systems */
                  <div className="bg-[#0f1724] border border-slate-800 rounded-xl p-3.5 flex flex-col space-y-3 select-none text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
                        <SlidersHorizontal className="w-4 h-4 text-teal-400" />
                        <span>Multi-Planar Reconstruction (MPR) Cross-Sectional Scrubber</span>
                      </div>
                      <span className="font-mono text-teal-400 font-bold bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                        Slice {sliceIndex} / 100
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Inferior / Caudal</span>
                        <span>Axial Slicing Plane</span>
                        <span>Superior / Cranial</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={sliceIndex}
                        onChange={e => setSliceIndex(Number(e.target.value))}
                        className="w-full accent-teal-400"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-1 text-[11px]">
                      <span className="text-slate-400">System Cases:</span>
                      {systemCases.map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setActiveCaseId(c.id);
                            if (c.optimalSliceIndex !== undefined) setSliceIndex(c.optimalSliceIndex);
                          }}
                          className={`px-2.5 py-1 rounded border transition ${
                            activeCaseId === c.id
                              ? 'bg-teal-500/20 border-teal-400 text-teal-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {c.isNormal ? '✓ Normal Reference' : `⚠ ${c.title}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <LayerControls
                  systemId={activeSystemId}
                  layers={layers}
                  onChangeLayers={setLayers}
                  systemLayers={systemLayers}
                  onToggleSystemLayer={handleToggleSystemLayer}
                  organOpacity={organOpacity}
                  onChangeOrganOpacity={setOrganOpacity}
                  bodySkinOpacity={bodySkinOpacity}
                  onChangeBodySkinOpacity={setBodySkinOpacity}
                  onSetCameraPreset={preset => setCameraPresetTrigger({ preset, timestamp: Date.now() })}
                  onResetObserver={() => setAlignTrigger(prev => prev + 1)}
                  onAlignToBeamAxis={() => setAlignTrigger(prev => prev + 1)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Calculators Modal */}
      {activeCalculator && (
        <ClinicalCalculatorsModal
          initialType={activeCalculator}
          onClose={() => setActiveCalculator(null)}
        />
      )}

      {/* Local Sandbox Dropzone Modal */}
      {sandboxModalOpen && (
        <LocalSandboxDropzone
          currentFile={localSandboxFile}
          onFileLoaded={file => {
            setLocalSandboxFile(file);
          }}
          onClearFile={() => setLocalSandboxFile(null)}
          onClose={() => setSandboxModalOpen(false)}
        />
      )}

      {/* Cath Lab Reference & Physics Modal */}
      {referenceOpen && <ReferenceModal onClose={() => setReferenceOpen(false)} />}
    </div>
  );
}

export default App;
