import React from 'react';
import { SearchChecklistStep } from '../types';
import { CheckSquare, Square, ChevronRight, ChevronLeft, Eye, ShieldCheck, Sparkles, X } from 'lucide-react';

interface SearchPatternBarProps {
  steps: SearchChecklistStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
  onToggleStepCheck: (index: number) => void;
  checkedMap: Record<string, boolean>;
  onClose?: () => void;
}

export const SearchPatternBar: React.FC<SearchPatternBarProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
  onToggleStepCheck,
  checkedMap,
  onClose
}) => {
  if (!steps || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex] || steps[0];
  const completedCount = steps.filter(s => checkedMap[s.id]).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-[#0b121e]/95 backdrop-blur-md border border-teal-500/30 rounded-xl p-3 shadow-2xl flex flex-col space-y-2.5 max-w-xl w-full select-none text-xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-teal-500/10 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Eye className="w-3 h-3" />
          </div>
          <div>
            <div className="font-bold text-slate-100 flex items-center space-x-1.5">
              <span>Systematic Clinical Search Pattern</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-teal-950 text-teal-300 border border-teal-800 rounded font-mono">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Diagnostic Residency Eye-Tracking Protocol</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-[10px] font-mono text-teal-400 font-semibold">
            {progressPercent}% Complete
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Checklist Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-teal-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(20,184,166,0.5)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Buttons Quick Row */}
      <div className="flex items-center space-x-1 overflow-x-auto py-1">
        {steps.map((step, idx) => {
          const isSelected = idx === currentStepIndex;
          const isChecked = !!checkedMap[step.id];
          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(idx)}
              className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition flex items-center space-x-1 border ${
                isSelected
                  ? 'bg-teal-500/20 border-teal-400 text-teal-200 font-bold shadow'
                  : isChecked
                    ? 'bg-slate-800/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <span>{idx + 1}.</span>
              <span className="truncate max-w-[110px]">{step.label}</span>
              {isChecked && <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Active Checkpoint Detail Box */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => onToggleStepCheck(currentStepIndex)}
              className="text-slate-400 hover:text-teal-400 transition"
              title="Mark checkpoint as completed"
            >
              {checkedMap[currentStep.id] ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
            </button>
            <span className="font-bold text-slate-200 text-xs">{currentStep.label}</span>
            <span className="text-[10px] text-teal-400 font-mono bg-slate-800 px-1.5 py-0.2 rounded">
              {currentStep.systemRegion}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              disabled={currentStepIndex === 0}
              onClick={() => onSelectStep(currentStepIndex - 1)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={currentStepIndex === steps.length - 1}
              onClick={() => onSelectStep(currentStepIndex + 1)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Residency Clinical Pearl */}
        <div className="text-[11px] text-teal-300/90 bg-teal-950/30 border border-teal-800/40 p-2 rounded flex items-start space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-semibold text-teal-300">Residency Pearl: </span>
            <span>{currentStep.pearl}</span>
          </div>
        </div>

        {/* Normal vs Abnormal Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pt-1">
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-0.5">✓ Normal Finding:</span>
            <span className="text-slate-300 leading-snug">{currentStep.normalFindings}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
            <span className="text-rose-400 font-bold block mb-0.5">⚠ Pathological Sign:</span>
            <span className="text-slate-300 leading-snug">{currentStep.abnormalFinding}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
