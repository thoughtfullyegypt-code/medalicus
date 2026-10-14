import React from 'react';
import { CORONARY_VESSELS, PROJECTION_PRESETS } from '../data/coronaryData';
import { ALL_SYSTEM_SEGMENTS } from '../data/multiSystemsData';
import { ProjectionPreset, OrganSystemId, AnatomicalSegment } from '../types';
import { X, Heart, Eye, AlertCircle, Compass, Sparkles } from 'lucide-react';

interface VesselDetailPanelProps {
  vesselId: string;
  systemId?: OrganSystemId;
  onClose: () => void;
  onApplyPreset?: (preset: ProjectionPreset) => void;
}

export const VesselDetailPanel: React.FC<VesselDetailPanelProps> = ({
  vesselId,
  systemId = 'cardiovascular',
  onClose,
  onApplyPreset
}) => {
  // First check coronary data
  const coronaryVessel = CORONARY_VESSELS.find(v => v.id === vesselId);
  // Then check multi-system segments
  const systemSegments = ALL_SYSTEM_SEGMENTS[systemId] || [];
  const multiSegment = systemSegments.find(s => s.id === vesselId);

  const segment: AnatomicalSegment | undefined = multiSegment || (coronaryVessel ? {
    id: coronaryVessel.id,
    name: coronaryVessel.name,
    abbr: coronaryVessel.abbr,
    system: 'cardiovascular',
    meshNodeName: coronaryVessel.id,
    description: coronaryVessel.description,
    clinicalSignificance: coronaryVessel.clinicalSignificance,
    color: coronaryVessel.color
  } : undefined);

  if (!segment) return null;

  // Find recommended presets for coronary vessels if applicable
  const recommendedPresets = coronaryVessel ? PROJECTION_PRESETS.filter(p => {
    if (coronaryVessel.system === 'LCA' && p.vesselTarget === 'LCA') return true;
    if (coronaryVessel.system === 'RCA' && p.vesselTarget === 'RCA') return true;
    return false;
  }).slice(0, 3) : [];

  return (
    <div className="bg-[#0f1724]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-4 shadow-2xl text-xs space-y-3 max-w-sm select-none">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: segment.color }}
          />
          <div>
            <h3 className="font-bold text-sm text-white">{segment.name}</h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-teal-400 font-bold border border-slate-700">
              {segment.abbr || segment.id.toUpperCase()} &bull; {systemId.toUpperCase()}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Anatomical Course */}
      <div className="space-y-1">
        <div className="flex items-center space-x-1 text-slate-400 font-semibold text-[11px]">
          <Heart className="w-3 h-3 text-teal-400" />
          <span>Anatomic Structure & Relations:</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px] bg-slate-900/60 p-2 rounded border border-slate-800/80">
          {segment.description}
        </p>
      </div>

      {/* Clinical & Board Exam Significance */}
      <div className="space-y-1">
        <div className="flex items-center space-x-1 text-amber-400 font-semibold text-[11px]">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          <span>High-Yield Clinical Pearl:</span>
        </div>
        <p className="text-amber-200/90 leading-relaxed text-[11px] bg-amber-950/20 p-2 rounded border border-amber-900/30">
          {segment.clinicalSignificance}
        </p>
      </div>

      {/* Recommended Fluoroscopic Projections if available */}
      {recommendedPresets.length > 0 && onApplyPreset && (
        <div className="space-y-1.5 pt-1 border-t border-slate-800">
          <div className="flex items-center space-x-1 text-teal-300 font-semibold text-[11px]">
            <Compass className="w-3 h-3 text-teal-400" />
            <span>Optimal Cath Lab Projections:</span>
          </div>
          <div className="space-y-1">
            {recommendedPresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => onApplyPreset(preset)}
                className="w-full text-left p-1.5 rounded bg-slate-900 hover:bg-teal-950/40 border border-slate-800 hover:border-teal-700/60 transition flex items-center justify-between group"
              >
                <div>
                  <span className="font-mono font-bold text-teal-400 text-[10px]">{preset.shorthand}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">({preset.name})</span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] text-teal-400 opacity-0 group-hover:opacity-100 transition">
                  <Eye className="w-3 h-3" />
                  <span>Align</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
