import React from 'react';
import { X, BookOpen, Compass, CheckCircle2 } from 'lucide-react';

interface ReferenceModalProps {
  onClose: () => void;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#0f1724] border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cath Lab Fluoroscopy & C-Arm Primer</h2>
              <p className="text-[11px] text-slate-400">The 3D-to-2D Projection Rules Every Medical Student Must Know</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Golden Rule of Spine Orientation */}
        <div className="bg-gradient-to-r from-teal-950/40 to-slate-900 border border-teal-500/40 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-teal-300 text-sm">
            <Compass className="w-4 h-4 text-teal-400" />
            <span>The #1 Cath Lab Orientation Rule: "Find the Spine"</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            When you first look at an angiogram monitor, you do not know the projection until you locate the vertebral spine in the background:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
              <div className="text-teal-400 font-bold">Spine on the RIGHT of screen:</div>
              <div className="text-slate-200 mt-0.5">LAO (Left Anterior Oblique)</div>
              <div className="text-[10px] text-slate-400 mt-1">Detector is on patient's left side looking back across the chest.</div>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
              <div className="text-teal-400 font-bold">Spine on the LEFT of screen:</div>
              <div className="text-slate-200 mt-0.5">RAO (Right Anterior Oblique)</div>
              <div className="text-[10px] text-slate-400 mt-1">Detector is on patient's right side looking across the chest.</div>
            </div>
          </div>
        </div>

        {/* Cranial vs Caudal Rule */}
        <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          <h3 className="font-bold text-slate-200 text-xs">Cranial vs. Caudal Angulation</h3>
          <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="text-teal-400 font-bold font-mono">CRANIAL:</span>
              <span>Detector tilts toward the patient's head. The heart apex projects <strong>downward</strong>. The LAD and diagonal branches are <strong>elongated</strong>.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-teal-400 font-bold font-mono">CAUDAL:</span>
              <span>Detector tilts toward the patient's feet. The diaphragm rises up into view. The circumflex (LCx) and its obtuse marginals (OM) swing <strong>downward and open</strong>.</span>
            </li>
          </ul>
        </div>

        {/* High-Yield Standard Views Cheat-Sheet */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-200 text-xs">Essential Standard Projections Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2 px-2.5">Projection</th>
                  <th className="py-2 px-2.5">Common Name</th>
                  <th className="py-2 px-2.5">Best Visualizes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2 px-2.5 font-mono font-bold text-teal-400">LAO 40° / CAUD 30°</td>
                  <td className="py-2 px-2.5 font-semibold text-white">"Spider View"</td>
                  <td className="py-2 px-2.5">LMCA Bifurcation into LAD & LCx</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-mono font-bold text-teal-400">RAO 30° / CRAN 30°</td>
                  <td className="py-2 px-2.5">RAO Cranial</td>
                  <td className="py-2 px-2.5">Mid & Distal LAD, Diagonal takeoffs</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-mono font-bold text-teal-400">RAO 30° / CAUD 20°</td>
                  <td className="py-2 px-2.5">RAO Caudal</td>
                  <td className="py-2 px-2.5">LCx Trunk and Obtuse Marginals (OM)</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-mono font-bold text-teal-400">LAO 30° / 0°</td>
                  <td className="py-2 px-2.5">LAO Straight</td>
                  <td className="py-2 px-2.5">RCA Classic "C-Shape" Profile & Mid RCA</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-mono font-bold text-teal-400">RAO 30° / 0°</td>
                  <td className="py-2 px-2.5">RAO Straight</td>
                  <td className="py-2 px-2.5">RCA "L-Shape" Profile & PDA length</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg transition text-xs shadow-md"
          >
            Got it, Back to Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
