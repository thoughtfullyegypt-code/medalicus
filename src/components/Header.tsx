import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  Compass, 
  HelpCircle, 
  Award, 
  Maximize2, 
  Minimize2,
  Stethoscope,
  Target,
  ChevronDown,
  Radio,
  Zap,
  Calculator,
  Eye,
  RefreshCw,
  UploadCloud,
  Share2,
  Check,
  Sparkles
} from 'lucide-react';
import { OrganSystem, OrganSystemId, ViewMode, ImagingModality } from '../types';

interface HeaderProps {
  systems: OrganSystem[];
  activeSystemId: OrganSystemId;
  onSelectSystem: (id: OrganSystemId) => void;
  modality: ImagingModality;
  onSelectModality: (modality: ImagingModality) => void;
  viewMode: ViewMode;
  onSelectMode: (mode: ViewMode) => void;
  onOpenReference: () => void;
  quizScore: number;
  quizStreak: number;

  // 6 Doctor's Edge Handlers
  onOpenCalculator: () => void;
  searchPatternOpen: boolean;
  onToggleSearchPattern: () => void;
  comparisonMode: boolean;
  onToggleComparison: () => void;
  onOpenSandbox: () => void;
  presenterLaserActive: boolean;
  onTogglePresenterLaser: () => void;
  blindCaseMode: boolean;
  onToggleBlindCase: () => void;
  onShareDeepLink: () => void;
  shareCopied: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  systems,
  activeSystemId,
  onSelectSystem,
  modality,
  onSelectModality,
  viewMode,
  onSelectMode,
  onOpenReference,
  quizScore,
  quizStreak,
  onOpenCalculator,
  searchPatternOpen,
  onToggleSearchPattern,
  comparisonMode,
  onToggleComparison,
  onOpenSandbox,
  presenterLaserActive,
  onTogglePresenterLaser,
  blindCaseMode,
  onToggleBlindCase,
  onShareDeepLink,
  shareCopied
}) => {
  const [systemDropdownOpen, setSystemDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeSystem = systems.find(s => s.id === activeSystemId) || systems[0];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="h-14 bg-[#0d131c] border-b border-slate-800 flex items-center justify-between px-3 md:px-4 z-40 select-none">
      {/* Brand & Organ System Selector Dropdown */}
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.2)]">
            <Activity className="w-5 h-5 animate-pulse text-teal-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-wider text-sm text-white font-mono">MEDALICUS</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.2 bg-teal-950 text-teal-400 border border-teal-800 rounded">
                8-Systems Atlas
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">Spatial Anatomy &bull; Multi-Planar PACS</p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-1 hidden md:block" />

        {/* System Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSystemDropdownOpen(!systemDropdownOpen)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800/90 border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-200 transition shadow-sm"
          >
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: activeSystem.color || '#14b8a6' }} 
            />
            <span className="max-w-[90px] sm:max-w-none truncate">{activeSystem.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {systemDropdownOpen && (
            <div 
              className="absolute top-full left-0 mt-1 w-64 bg-[#0d131c] border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in"
              onMouseLeave={() => setSystemDropdownOpen(false)}
            >
              <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-slate-500 border-b border-slate-800/80">
                Select Organ System
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {systems.map(sys => {
                  const isSelected = sys.id === activeSystemId;
                  return (
                    <button
                      key={sys.id}
                      onClick={() => {
                        onSelectSystem(sys.id);
                        setSystemDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition ${
                        isSelected 
                          ? 'bg-teal-500/10 text-teal-300 font-bold' 
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: sys.color || '#14b8a6' }} 
                        />
                        <span>{sys.name}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {sys.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modality Selector for Cardiovascular */}
        {activeSystemId === 'cardiovascular' && (
          <div className="hidden lg:flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5">
            <button
              onClick={() => onSelectModality('fluoro')}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-semibold transition ${
                modality === 'fluoro'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>C-Arm</span>
            </button>

            <button
              onClick={() => onSelectModality('ultrasound')}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-semibold transition ${
                modality === 'ultrasound'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Echo</span>
            </button>
          </div>
        )}
      </div>

      {/* Mode Navigation Tabs */}
      <nav className="hidden md:flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
        <button
          onClick={() => onSelectMode('explore')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
            viewMode === 'explore'
              ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Explorer</span>
        </button>

        <button
          onClick={() => onSelectMode('inspect-challenge')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
            viewMode === 'inspect-challenge'
              ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>Challenge</span>
        </button>

        <button
          onClick={() => onSelectMode('quiz')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
            viewMode === 'quiz'
              ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Quiz</span>
          {quizScore > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-teal-950 text-teal-400 rounded-full text-[10px] font-mono">
              {quizScore}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectMode('cases')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
            viewMode === 'cases'
              ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Cases</span>
        </button>
      </nav>

      {/* 6 Doctor's Edge Quick Tools */}
      <div className="flex items-center space-x-1 sm:space-x-1.5">
        {/* Clinical Calculators Button */}
        <button
          onClick={onOpenCalculator}
          title="Live Clinical Calculators (SYNTAX, ASPECTS, Simpson EF, Couinaud, PI-RADS, Fetal Biometry)"
          className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Calculators</span>
        </button>

        {/* Systematic Search Pattern Toggle */}
        <button
          onClick={onToggleSearchPattern}
          title="Systematic Diagnostic Eye-Tracking Checklist"
          className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition shadow-sm ${
            searchPatternOpen
              ? 'bg-teal-500 text-slate-950 border-teal-400'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/80'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Search Pattern</span>
        </button>

        {/* Bring Your Own DICOM Sandbox Button */}
        <button
          onClick={onOpenSandbox}
          title="Bring Your Own DICOM / Cine Local Sandbox (100% In-RAM, $0 Cost)"
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold flex items-center space-x-1 transition"
        >
          <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xl:inline">Sandbox</span>
        </button>

        {/* Morning Report Presenter Laser / Blind Case Mode */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={onToggleBlindCase}
            title="Blind Case Mode (Hides diagnosis for morning report / student quiz)"
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              blindCaseMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Blind
          </button>
          <button
            onClick={onTogglePresenterLaser}
            title="Telestrator Red Laser Pointer Pen"
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              presenterLaserActive ? 'bg-rose-950/80 text-rose-300 border border-rose-600' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Laser
          </button>
        </div>

        {/* 1-Click Deep Link Share Button */}
        <button
          onClick={onShareDeepLink}
          title="Share exact case state via URL hash"
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
        >
          {shareCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-slate-400" />}
        </button>

        <button
          onClick={onOpenReference}
          title="Cath Lab & Imaging Guide"
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition hidden sm:block"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
