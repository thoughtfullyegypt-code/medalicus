import React, { useEffect, useState } from 'react';
import { InspectionChallenge, GantryAngles, ImagingModality } from '../types';
import { INSPECTION_CHALLENGES } from '../data/challengesData';
import confetti from 'canvas-confetti';
import { 
  Crosshair, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  X,
  Target,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

interface InspectionChallengeModalProps {
  currentAngles: GantryAngles;
  currentModality: ImagingModality;
  activeProbePreset: 'plax' | 'psax' | 'a4c' | 'subcostal';
  onSelectModality: (modality: ImagingModality) => void;
  onSelectProbePreset: (presetId: 'plax' | 'psax' | 'a4c' | 'subcostal') => void;
  onHighlightVessel: (vesselId: string) => void;
  onClose: () => void;
}

export const InspectionChallengeModal: React.FC<InspectionChallengeModalProps> = ({
  currentAngles,
  currentModality,
  activeProbePreset,
  onSelectModality,
  onSelectProbePreset,
  onHighlightVessel,
  onClose
}) => {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showClue, setShowClue] = useState(false);

  const challenge: InspectionChallenge = INSPECTION_CHALLENGES[challengeIdx % INSPECTION_CHALLENGES.length];

  // Switch modality and highlight vessel when challenge changes
  useEffect(() => {
    setIsUnlocked(false);
    setShowClue(false);

    if (challenge.modality !== currentModality) {
      onSelectModality(challenge.modality);
    }
    if (challenge.highlightVesselId) {
      onHighlightVessel(challenge.highlightVesselId);
    }
  }, [challengeIdx]);

  // Calculate live angular error / distance to target
  let angularError = 0;
  let isMatched = false;

  if (challenge.modality === 'fluoro') {
    const dPrim = currentAngles.primary - challenge.targetAngles.primary;
    const dSec = currentAngles.secondary - challenge.targetAngles.secondary;
    angularError = Math.round(Math.sqrt(dPrim * dPrim + dSec * dSec));
    isMatched = angularError <= challenge.toleranceDeg;
  } else {
    // Ultrasound probe preset match
    isMatched = activeProbePreset === challenge.targetProbePreset;
    angularError = isMatched ? 0 : 25;
  }

  // Trigger celebration sign when target angle is reached!
  useEffect(() => {
    if (isMatched && !isUnlocked) {
      setIsUnlocked(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isMatched, isUnlocked]);

  const handleNext = () => {
    setChallengeIdx(prev => prev + 1);
  };

  return (
    <div className="relative select-none">
      {/* ------------------------------------------------------------- */}
      {/* 1. THE CELEBRATORY SIGN WHEN PERFECT ANGLE IS ACHIEVED!        */}
      {/* ------------------------------------------------------------- */}
      {isUnlocked && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce pointer-events-none">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 p-[2px] rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.8)]">
            <div className="bg-slate-950/95 backdrop-blur-xl px-6 py-3.5 rounded-2xl flex items-center space-x-3 text-white border border-emerald-400/50">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300">
                <CheckCircle2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="font-extrabold text-sm md:text-base tracking-wider text-emerald-300 uppercase flex items-center space-x-1.5 font-mono">
                  <span>★ PERFECT ANGLE ACHIEVED! ★</span>
                </div>
                <div className="text-xs text-slate-200 font-medium">
                  {challenge.keyFeatureUnlocked}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. CHALLENGE INSPECTION CARD PANEL                            */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0f1724]/95 backdrop-blur-xl border border-teal-500/40 rounded-2xl p-4 shadow-2xl text-xs space-y-3.5 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Target className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-white text-sm">Target Angle Challenge</span>
                <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-1.5 py-0.2 rounded border border-teal-800">
                  Target {challengeIdx + 1}/{INSPECTION_CHALLENGES.length}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Rotate Gantry / Probe to Find the Perfect Projection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mission Objective */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1.5">
          <div className="font-bold text-teal-300 text-xs flex items-center space-x-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
            <span>Mission: {challenge.title}</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {challenge.prompt}
          </p>
        </div>

        {/* Live Target Reticle & Proximity Gauge */}
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400 flex items-center space-x-1">
              <Crosshair className="w-3.5 h-3.5 text-teal-400" />
              <span>Alignment Accuracy:</span>
            </span>
            {isMatched ? (
              <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700 animate-pulse flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>TARGET LOCKED (0° Error)</span>
              </span>
            ) : (
              <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                angularError <= 12 
                  ? 'text-amber-400 bg-amber-950/60 border-amber-800' 
                  : 'text-rose-400 bg-rose-950/60 border-rose-800'
              }`}>
                Angular Error: {angularError}°
              </span>
            )}
          </div>

          {/* Progress Bar / Proximity Meter */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-[1px]">
            <div 
              className={`h-full rounded-full transition-all duration-200 ${
                isMatched ? 'bg-emerald-400' : angularError <= 15 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(5, Math.min(100, 100 - angularError * 2.2))}%` }}
            />
          </div>

          {/* Target Angles Readout */}
          {challenge.modality === 'fluoro' && (
            <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
              <span>Current: {currentAngles.primary > 0 ? `LAO ${currentAngles.primary}°` : `RAO ${Math.abs(currentAngles.primary)}°`} / {currentAngles.secondary > 0 ? `CRAN ${currentAngles.secondary}°` : `CAUD ${Math.abs(currentAngles.secondary)}°`}</span>
              <span className="text-teal-400 font-bold">Goal: {challenge.targetAngles.primary > 0 ? `LAO ${challenge.targetAngles.primary}°` : `RAO ${Math.abs(challenge.targetAngles.primary)}°`} / {challenge.targetAngles.secondary > 0 ? `CRAN ${challenge.targetAngles.secondary}°` : `CAUD ${Math.abs(challenge.targetAngles.secondary)}°`}</span>
            </div>
          )}
        </div>

        {/* Clue Accordion */}
        {!isUnlocked && (
          <div>
            <button
              onClick={() => setShowClue(!showClue)}
              className="flex items-center space-x-1 text-[11px] text-teal-400 hover:text-teal-300 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showClue ? 'Hide Alignment Clue' : 'Need help reaching the angle? (Show clue)'}</span>
            </button>
            {showClue && (
              <p className="mt-1.5 p-2.5 bg-teal-950/40 border border-teal-800/60 rounded-lg text-teal-200 text-[11px] leading-relaxed">
                💡 {challenge.clue}
              </p>
            )}
          </div>
        )}

        {/* Revealed Anatomical Insight (Unlocked on perfect angle!) */}
        {isUnlocked && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-600/60 rounded-xl space-y-1.5 animate-fadeIn">
            <div className="flex items-center space-x-1.5 text-emerald-300 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clinical Finding Revealed:</span>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              {challenge.revealedInsight}
            </p>
          </div>
        )}

        {/* Next Target Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 rounded hover:bg-slate-800 transition"
          >
            Exit Challenge Mode
          </button>

          {isUnlocked && (
            <button
              onClick={handleNext}
              className="flex items-center space-x-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3.5 py-2 rounded-lg transition text-xs shadow-lg"
            >
              <span>Next Inspection Target</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
