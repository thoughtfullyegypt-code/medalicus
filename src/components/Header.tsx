import React, { useState } from 'react';
import {
  Activity,
  Award,
  Calculator,
  Check,
  ChevronDown,
  Compass,
  Eye,
  HelpCircle,
  Maximize2,
  Minimize2,
  Radio,
  Share2,
  Sparkles,
  Stethoscope,
  Target,
  UploadCloud,
  Zap
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
  const [toolsOpen, setToolsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const activeSystem = systems.find(s => s.id === activeSystemId) || systems[0];

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
  };

  const modes: Array<{ id: ViewMode; label: string; icon: React.ReactNode }> = [
    { id: 'explore', label: 'Explore', icon: <Compass className="h-4 w-4" /> },
    { id: 'inspect-challenge', label: 'Challenge', icon: <Target className="h-4 w-4" /> },
    { id: 'quiz', label: 'Quiz', icon: <Award className="h-4 w-4" /> },
    { id: 'cases', label: 'Cases', icon: <Stethoscope className="h-4 w-4" /> }
  ];

  return (
    <header className="relative z-40 flex h-[68px] shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3 md:gap-5">
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-[0.12em] text-slate-900">MEDALICUS</div>
            <div className="mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.17em] text-slate-400 sm:block">Anatomy · Imaging · Learning</div>
          </div>
        </div>

        <span className="hidden h-8 w-px bg-slate-200 lg:block" />

        <div className="relative min-w-0">
          <button
            onClick={() => setSystemDropdownOpen(v => !v)}
            aria-expanded={systemDropdownOpen}
            className="flex max-w-[180px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white hover:border-slate-300"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: activeSystem.color || '#0f766e' }} />
            <span className="truncate">{activeSystem.name}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          </button>
          {systemDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
              <div className="px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">Choose a system</div>
              {systems.map(sys => (
                <button
                  key={sys.id}
                  onClick={() => { onSelectSystem(sys.id); setSystemDropdownOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-left text-xs transition ${sys.id === activeSystemId ? 'bg-teal-50 font-semibold text-teal-800' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: sys.color || '#0f766e' }} />
                    <span className="truncate">{sys.name}</span>
                  </span>
                  <span className="ml-3 text-[9px] font-semibold uppercase tracking-wide text-slate-400">{sys.badge}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {activeSystemId === 'cardiovascular' && (
          <div className="hidden items-center rounded-xl border border-slate-200 bg-slate-50 p-1 lg:flex">
            <button
              onClick={() => onSelectModality('fluoro')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${modality === 'fluoro' ? 'bg-white text-teal-800 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Zap className="h-3.5 w-3.5" /> C-arm
            </button>
            <button
              onClick={() => onSelectModality('ultrasound')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${modality === 'ultrasound' ? 'bg-white text-teal-800 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Radio className="h-3.5 w-3.5" /> Echo
            </button>
          </div>
        )}
      </div>

      <nav className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 md:flex">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${viewMode === mode.id ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
          >
            {mode.icon}
            <span>{mode.label}</span>
            {mode.id === 'quiz' && quizScore > 0 && (
              <span className="rounded-full bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-800">{quizScore}</span>
            )}
            {mode.id === 'quiz' && quizStreak > 1 && (
              <span className="hidden xl:inline text-[10px] font-medium text-slate-400">{quizStreak} streak</span>
            )}
          </button>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-1.5">
        <div className="relative">
          <button
            onClick={() => setToolsOpen(v => !v)}
            aria-expanded={toolsOpen}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${toolsOpen ? 'border-teal-200 bg-teal-50 text-teal-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Tools</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
          {toolsOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">Study & presentation tools</div>
              <button onClick={() => { onOpenCalculator(); setToolsOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                <Calculator className="h-4 w-4 text-teal-700" /><span>Clinical calculators</span>
              </button>
              <button onClick={() => { onToggleSearchPattern(); setToolsOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-xs font-medium transition ${searchPatternOpen ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'}`}>
                <Eye className="h-4 w-4 text-teal-700" /><span>Systematic search pattern</span>
                {searchPatternOpen && <Check className="ml-auto h-3.5 w-3.5" />}
              </button>
              <button onClick={() => { onOpenSandbox(); setToolsOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                <UploadCloud className="h-4 w-4 text-teal-700" /><span>Open local DICOM sandbox</span>
              </button>
              <button onClick={onToggleComparison} className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-xs font-medium transition ${comparisonMode ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'}`}>
                <Activity className="h-4 w-4 text-teal-700" /><span>Normal / pathology comparison</span>
                {comparisonMode && <Check className="ml-auto h-3.5 w-3.5" />}
              </button>
              <div className="my-1.5 border-t border-slate-100" />
              <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                <span className="text-xs text-slate-600">Blind case</span>
                <button onClick={onToggleBlindCase} className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${blindCaseMode ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{blindCaseMode ? 'On' : 'Off'}</button>
              </div>
              <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                <span className="text-xs text-slate-600">Presenter laser</span>
                <button onClick={onTogglePresenterLaser} className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${presenterLaserActive ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{presenterLaserActive ? 'On' : 'Off'}</button>
              </div>
              <div className="my-1.5 border-t border-slate-100" />
              <button onClick={() => { onShareDeepLink(); setToolsOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                {shareCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4 text-slate-500" />}
                <span>{shareCopied ? 'Link copied' : 'Share current view'}</span>
              </button>
              <button onClick={() => { onOpenReference(); setToolsOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                <HelpCircle className="h-4 w-4 text-teal-700" /><span>References & guide</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
};
