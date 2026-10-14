import React from 'react';
import { GantryAngles, ProjectionPreset } from '../types';
import { PROJECTION_PRESETS } from '../data/coronaryData';
import { RotateCw, Compass, Info, CheckCircle2 } from 'lucide-react';

interface GantryControlsProps {
  angles: GantryAngles;
  onChangeAngles: (newAngles: GantryAngles) => void;
  activePresetId: string | null;
  onSelectPreset: (preset: ProjectionPreset) => void;
  filterSystem: 'ALL' | 'LCA' | 'RCA';
  onFilterSystemChange: (sys: 'ALL' | 'LCA' | 'RCA') => void;
}

export const GantryControls: React.FC<GantryControlsProps> = ({
  angles,
  onChangeAngles,
  activePresetId,
  onSelectPreset,
  filterSystem,
  onFilterSystemChange
}) => {
  const activePreset = PROJECTION_PRESETS.find(p => p.id === activePresetId);

  const handlePrimaryChange = (val: number) => {
    onChangeAngles({ ...angles, primary: val });
  };

  const handleSecondaryChange = (val: number) => {
    onChangeAngles({ ...angles, secondary: val });
  };

  const filteredPresets = PROJECTION_PRESETS.filter(p => {
    if (filterSystem === 'ALL') return true;
    return p.vesselTarget === filterSystem || p.vesselTarget === 'Both';
  });

  const getPrimaryLabel = (deg: number) => {
    if (deg === 0) return 'AP 0°';
    if (deg > 0) return `LAO ${deg}°`;
    return `RAO ${Math.abs(deg)}°`;
  };

  const getSecondaryLabel = (deg: number) => {
    if (deg === 0) return '0° (Straight)';
    if (deg > 0) return `CRAN ${deg}°`;
    return `CAUD ${Math.abs(deg)}°`;
  };

  return (
    <div className="bg-[#0f1724] border border-slate-800 rounded-xl p-3.5 flex flex-col space-y-3 select-none text-xs">
      {/* Header & Filter */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
          <RotateCw className="w-4 h-4 text-teal-400" />
          <span>C-Arm Gantry Angulation</span>
        </div>

        {/* LCA / RCA Filter Buttons */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 space-x-0.5">
          {(['ALL', 'LCA', 'RCA'] as const).map(sys => (
            <button
              key={sys}
              onClick={() => onFilterSystemChange(sys)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                filterSystem === sys
                  ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sys}
            </button>
          ))}
        </div>
      </div>

      {/* Primary & Secondary Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
        {/* Primary: RAO vs LAO */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Primary (RAO / LAO):</span>
            <span className="font-mono font-bold text-teal-400 bg-teal-950/60 px-1.5 py-0.2 rounded border border-teal-800/60">
              {getPrimaryLabel(angles.primary)}
            </span>
          </div>
          <input
            type="range"
            min="-90"
            max="90"
            step="1"
            value={angles.primary}
            onChange={e => handlePrimaryChange(parseInt(e.target.value, 10))}
            className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>RAO 90°</span>
            <span>AP 0°</span>
            <span>LAO 90°</span>
          </div>
        </div>

        {/* Secondary: Caudal vs Cranial */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Secondary (Cranial / Caudal):</span>
            <span className="font-mono font-bold text-teal-400 bg-teal-950/60 px-1.5 py-0.2 rounded border border-teal-800/60">
              {getSecondaryLabel(angles.secondary)}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="1"
            value={angles.secondary}
            onChange={e => handleSecondaryChange(parseInt(e.target.value, 10))}
            className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>CAUD 50°</span>
            <span>0°</span>
            <span>CRAN 50°</span>
          </div>
        </div>
      </div>

      {/* Standard Cath Lab Preset Pills */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
          <Compass className="w-3 h-3 text-teal-400" />
          <span>Standard Clinical Views</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filteredPresets.map(preset => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`px-2.5 py-1.5 rounded-lg border text-left transition flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-teal-500/20 border-teal-500 text-teal-200 font-medium shadow-sm'
                    : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-mono font-bold text-[11px]">{preset.shorthand}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{preset.name}</div>
                </div>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Clinical Rationale Card */}
      {activePreset && (
        <div className="bg-slate-900/90 border border-teal-500/30 rounded-lg p-2.5 space-y-1.5 shadow-md">
          <div className="flex items-center space-x-1.5 text-teal-300 font-semibold text-xs">
            <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>Clinical Utility: {activePreset.bestFor}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {activePreset.clinicalRationale}
          </p>
          <div className="space-y-0.5 pt-1 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Orientation Clues:</span>
            <ul className="text-[10px] text-slate-400 list-disc list-inside space-y-0.5">
              {activePreset.keyLandmarks.map((lm, idx) => (
                <li key={idx}><span className="text-slate-300">{lm}</span></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
