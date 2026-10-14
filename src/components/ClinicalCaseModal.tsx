import React, { useState } from 'react';
import { CLINICAL_CASES, PROJECTION_PRESETS } from '../data/coronaryData';
import { ClinicalCase, ProjectionPreset } from '../types';
import { Stethoscope, AlertTriangle, Activity, CheckCircle2, ChevronRight, X } from 'lucide-react';

interface ClinicalCaseModalProps {
  onClose: () => void;
  onSetPreset: (preset: ProjectionPreset) => void;
  onHighlightVessel: (vesselId: string) => void;
}

export const ClinicalCaseModal: React.FC<ClinicalCaseModalProps> = ({
  onClose,
  onSetPreset,
  onHighlightVessel
}) => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const activeCase: ClinicalCase = CLINICAL_CASES[selectedCaseIdx];

  const handleApplyCaseProjection = () => {
    const optimalPreset = PROJECTION_PRESETS.find(p => p.id === activeCase.optimalProjectionId);
    if (optimalPreset) {
      onSetPreset(optimalPreset);
      onHighlightVessel(activeCase.targetVesselId);
    }
  };

  return (
    <div className="bg-[#0f1724]/95 backdrop-blur-lg border border-rose-500/40 rounded-xl p-4 shadow-2xl text-xs space-y-3.5 max-w-lg w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Emergency STEMI Cath Lab Cases</h3>
            <p className="text-[10px] text-slate-400">Culprit Lesion Identification & Projection Optimization</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Case Tabs */}
      <div className="grid grid-cols-3 gap-1.5">
        {CLINICAL_CASES.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => setSelectedCaseIdx(idx)}
            className={`p-2 rounded-lg border text-left transition ${
              selectedCaseIdx === idx
                ? 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider font-mono">Case 0{idx + 1}</div>
            <div className="truncate text-[11px] mt-0.5">{c.targetVesselId.toUpperCase()}</div>
          </button>
        ))}
      </div>

      {/* Case Scenario Box */}
      <div className="space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
        <div className="font-bold text-slate-100 text-xs flex items-center space-x-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>{activeCase.title}</span>
        </div>

        <p className="text-slate-300 text-[11px] leading-relaxed">
          {activeCase.presentation}
        </p>

        {/* 12-Lead ECG Findings */}
        <div className="bg-rose-950/30 border border-rose-900/50 p-2 rounded flex items-start space-x-2">
          <Activity className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-300 text-[11px]">12-Lead ECG:</div>
            <div className="text-rose-200/90 text-[11px] leading-snug">{activeCase.ecgFinding}</div>
          </div>
        </div>
      </div>

      {/* Culprit Vessel & Lesion */}
      <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400">Culprit Vessel:</span>
          <span className="font-mono font-bold text-rose-400">{activeCase.lesionLocation}</span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400">Stenosis Severity:</span>
          <span className="font-mono font-bold text-amber-400">{activeCase.stenosisPercent}% Thrombotic Occlusion</span>
        </div>
      </div>

      {/* Clinical Explanation & Action Button */}
      <div className="space-y-2">
        <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded border border-slate-800/60">
          💡 <span className="font-semibold text-teal-300">Cath Lab Pearls:</span> {activeCase.explanation}
        </p>

        <button
          onClick={handleApplyCaseProjection}
          className="w-full flex items-center justify-center space-x-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold py-2 rounded-lg transition text-xs shadow-md"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Deploy Optimal Projection & Highlight Lesion</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
