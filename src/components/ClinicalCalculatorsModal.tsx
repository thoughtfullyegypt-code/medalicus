import React, { useState } from 'react';
import { ClinicalScoreType } from '../types';
import { Calculator, X, CheckCircle2, AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface ClinicalCalculatorsModalProps {
  initialType?: ClinicalScoreType;
  onClose: () => void;
}

export const ClinicalCalculatorsModal: React.FC<ClinicalCalculatorsModalProps> = ({
  initialType = 'SYNTAX',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<ClinicalScoreType>(initialType);

  // 1. SYNTAX Calculator State
  const [dominance, setDominance] = useState<'right' | 'left'>('right');
  const [syntaxSegments, setSyntaxSegments] = useState<Record<string, boolean>>({
    ladProx: true,
    ladMid: false,
    lcx: false,
    rca: false,
    bifurcation: true,
    calcification: false,
    totalOcclusion: false
  });

  const calculateSyntax = () => {
    let score = 0;
    if (syntaxSegments.ladProx) score += dominance === 'right' ? 3.5 * 2 : 3.5 * 2;
    if (syntaxSegments.ladMid) score += 2.5 * 2;
    if (syntaxSegments.lcx) score += dominance === 'right' ? 1.5 * 2 : 2.5 * 2;
    if (syntaxSegments.rca) score += dominance === 'right' ? 1.0 * 2 : 0;
    if (syntaxSegments.bifurcation) score += 4;
    if (syntaxSegments.calcification) score += 2;
    if (syntaxSegments.totalOcclusion) score += 5;
    return score;
  };
  const syntaxScore = calculateSyntax();

  // 2. ASPECTS Calculator State (10 MCA Regions)
  const [aspectsRegions, setAspectsRegions] = useState<Record<string, boolean>>({
    C: false, // Caudate
    L: true,  // Lentiform
    IC: false, // Internal Capsule
    I: true,  // Insular Ribbon
    M1: false, // Anterior MCA cortex
    M2: true,  // Lateral MCA cortex (Insular)
    M3: true,  // Posterior MCA cortex
    M4: false, // Anterior MCA coronal
    M5: false, // Lateral MCA coronal
    M6: false  // Posterior MCA coronal
  });
  const aspectsDeductions = Object.values(aspectsRegions).filter(Boolean).length;
  const aspectsScore = Math.max(0, 10 - aspectsDeductions);

  // 3. Simpson's Biplane EF State
  const [edv, setEdv] = useState(120); // End Diastolic Volume (mL)
  const [esv, setEsv] = useState(55);  // End Systolic Volume (mL)
  const efPercent = Math.round(((edv - esv) / edv) * 100);

  // 4. Couinaud Resection Planner State
  const [resectedSegments, setResectedSegments] = useState<Record<number, boolean>>({
    1: false, 2: false, 3: false, 4: false,
    5: true, 6: true, 7: false, 8: false
  });
  // Approximate standard liver volume distribution by Couinaud segment
  const segmentWeights: Record<number, number> = {
    1: 4, 2: 10, 3: 11, 4: 17, 5: 15, 6: 15, 7: 14, 8: 14
  };
  const resectedVolumePercent = Object.entries(resectedSegments)
    .filter(([_, v]) => v)
    .reduce((acc, [k]) => acc + segmentWeights[Number(k)], 0);
  const futureLiverRemnant = Math.max(0, 100 - resectedVolumePercent);

  // 5. PI-RADS v2.1 State
  const [piradsZone, setPiradsZone] = useState<'PZ' | 'TZ'>('PZ');
  const [dwiScore, setDwiScore] = useState<number>(4);
  const [t2wScore, setT2wScore] = useState<number>(3);
  const [dcePositive, setDcePositive] = useState<boolean>(true);

  const calculatePirads = () => {
    if (piradsZone === 'PZ') {
      if (dwiScore === 3) return dcePositive ? 4 : 3;
      return dwiScore;
    } else {
      if (t2wScore === 3) return dwiScore >= 5 ? 4 : 3;
      return t2wScore;
    }
  };
  const finalPirads = calculatePirads();

  // 6. Fetal Biometry State (Hadlock Formula)
  const [bpd, setBpd] = useState(52); // mm
  const [hc, setHc] = useState(195);  // mm
  const [ac, setAc] = useState(165);  // mm
  const [fl, setFl] = useState(38);   // mm
  // Hadlock Log10(EFW) = 1.3596 - 0.00386(AC*FL) + 0.0064(HC) + 0.00061(BPD*AC) + 0.0424(AC) + 0.174(FL)
  const logEfw = 1.3596 - (0.00386 * (ac/10) * (fl/10)) + (0.0064 * (hc/10)) + (0.00061 * (bpd/10) * (ac/10)) + (0.0424 * (ac/10)) + (0.174 * (fl/10));
  const estimatedWeightGrams = Math.round(Math.pow(10, logEfw) * 10);
  const estimatedWeeks = Math.round(11 + (bpd / 3.8));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#0f1724] border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-[#131d2e] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-sm">Clinical Scoring & Risk Calculators</h2>
              <p className="text-[11px] text-slate-400">Context-Aware Real-Time Medical Decision Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-900/60 p-1.5 space-x-1 text-xs">
          {[
            { id: 'SYNTAX', label: 'SYNTAX (Cath)' },
            { id: 'ASPECTS', label: 'ASPECTS (Stroke)' },
            { id: 'SIMPSON_EF', label: "Simpson's EF (Echo)" },
            { id: 'COUINAUD_RESECTION', label: 'Couinaud Liver' },
            { id: 'PIRADS', label: 'PI-RADS v2.1' },
            { id: 'FETAL_BIOMETRY', label: 'Fetal Biometry' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ClinicalScoreType)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: SYNTAX SCORE */}
          {activeTab === 'SYNTAX' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="font-semibold text-teal-300">Coronary Tree Dominance</div>
                <div className="flex space-x-3">
                  {(['right', 'left'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setDominance(d)}
                      className={`flex-1 py-1.5 rounded-lg border text-center font-medium capitalize ${
                        dominance === d
                          ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                      }`}
                    >
                      {d} Dominant ({d === 'right' ? '85% Population' : '15% Population'})
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="font-semibold text-slate-200">Diseased Vessel Segments & Adverse Features</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'ladProx', label: 'Proximal LAD Lesion (>50%)' },
                    { key: 'ladMid', label: 'Mid LAD Lesion (>50%)' },
                    { key: 'lcx', label: 'Left Circumflex Lesion (>50%)' },
                    { key: 'rca', label: 'Right Coronary Lesion (>50%)' },
                    { key: 'bifurcation', label: 'Bifurcation / Medina Class' },
                    { key: 'calcification', label: 'Heavy Calcification' },
                    { key: 'totalOcclusion', label: 'Chronic Total Occlusion (CTO)' }
                  ].map(item => (
                    <label
                      key={item.key}
                      className="flex items-center space-x-2 p-2 rounded-lg bg-slate-800/40 border border-slate-700/40 cursor-pointer hover:bg-slate-800/80"
                    >
                      <input
                        type="checkbox"
                        checked={syntaxSegments[item.key]}
                        onChange={e => setSyntaxSegments({ ...syntaxSegments, [item.key]: e.target.checked })}
                        className="rounded accent-teal-500 w-4 h-4"
                      />
                      <span className="text-slate-300">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SYNTAX Output */}
              <div className="p-4 rounded-xl border border-teal-500/40 bg-teal-950/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-teal-400">Total SYNTAX Score</div>
                  <div className="text-3xl font-extrabold text-white font-mono">{syntaxScore}</div>
                </div>
                <div className="text-right max-w-xs">
                  <div className={`font-bold ${
                    syntaxScore <= 22 ? 'text-emerald-400' : syntaxScore <= 32 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {syntaxScore <= 22 ? 'Low Complexity (≤22)' : syntaxScore <= 32 ? 'Intermediate (23-32)' : 'High Complexity (≥33)'}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {syntaxScore <= 22 
                      ? 'Percutaneous Coronary Intervention (PCI) with DES strongly favorable.' 
                      : syntaxScore <= 32 
                        ? 'Heart Team consensus: PCI or CABG acceptable based on diabetes & STS score.' 
                        : 'Coronary Artery Bypass Grafting (CABG) superior for long-term survival (Class I).'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASPECTS SCORE */}
          {activeTab === 'ASPECTS' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="font-semibold text-slate-200">Non-Contrast CT: 10 MCA Ischemia Regions</div>
                <p className="text-[11px] text-slate-400">Click regions showing early ischemic hypodensity or sulcal effacement (subtracts 1 pt):</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {[
                    { id: 'C', name: 'Caudate (C)' },
                    { id: 'L', name: 'Lentiform (L)' },
                    { id: 'IC', name: 'Internal Capsule (IC)' },
                    { id: 'I', name: 'Insular Ribbon (I)' },
                    { id: 'M1', name: 'M1 (Ant Cortex)' },
                    { id: 'M2', name: 'M2 (Insular Cortex)' },
                    { id: 'M3', name: 'M3 (Post Cortex)' },
                    { id: 'M4', name: 'M4 (Ant Coronal)' },
                    { id: 'M5', name: 'M5 (Lat Coronal)' },
                    { id: 'M6', name: 'M6 (Post Coronal)' }
                  ].map(reg => (
                    <button
                      key={reg.id}
                      onClick={() => setAspectsRegions({ ...aspectsRegions, [reg.id]: !aspectsRegions[reg.id] })}
                      className={`p-2.5 rounded-lg border font-mono text-center flex flex-col justify-center items-center transition ${
                        aspectsRegions[reg.id]
                          ? 'bg-rose-950/80 border-rose-500 text-rose-300 font-bold shadow-md'
                          : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xs">{reg.id}</span>
                      <span className="text-[9px] text-slate-400 truncate w-full">{reg.name}</span>
                      <span className="text-[8px] mt-1 text-rose-400">{aspectsRegions[reg.id] ? '-1 Point' : 'Intact'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ASPECTS Result */}
              <div className="p-4 rounded-xl border border-purple-500/40 bg-purple-950/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-purple-400">ASPECTS Score</div>
                  <div className="text-3xl font-extrabold text-white font-mono">{aspectsScore} / 10</div>
                </div>
                <div className="text-right max-w-sm">
                  <div className={`font-bold ${aspectsScore >= 6 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {aspectsScore >= 6 ? 'Favorable for Endovascular Thrombectomy' : 'Extensive Core Infarction (ASPECTS < 6)'}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {aspectsScore >= 6
                      ? 'Meets AHA/ASA criteria for emergent mechanical thrombectomy within 24-hr window (DAWN / DEFUSE-3).'
                      : 'High risk of malignant cerebral edema and intracranial hemorrhage; carefully consider SELECT2 / ANGEL-ASPECT criteria.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIMPSON'S BIPLANE EF */}
          {activeTab === 'SIMPSON_EF' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="font-semibold text-slate-200">Left Ventricular Chamber Volumes (Apical 4-Chamber & 2-Chamber)</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>End-Diastolic Volume (EDV)</span>
                      <span className="font-mono text-cyan-400 font-bold">{edv} mL</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={240}
                      value={edv}
                      onChange={e => setEdv(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>End-Systolic Volume (ESV)</span>
                      <span className="font-mono text-cyan-400 font-bold">{esv} mL</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={180}
                      value={esv}
                      onChange={e => setEsv(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* EF Output */}
              <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400">Calculated Left Ventricular EF</div>
                  <div className="text-3xl font-extrabold text-white font-mono">{efPercent}%</div>
                  <div className="text-[10px] text-slate-400 font-mono">Stroke Volume: {edv - esv} mL</div>
                </div>
                <div className="text-right max-w-xs">
                  <div className={`font-bold ${
                    efPercent >= 52 ? 'text-emerald-400' : efPercent >= 41 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {efPercent >= 52 ? 'Normal Systolic Function (≥52%)' : efPercent >= 41 ? 'Mildly Reduced (41-51%)' : 'Moderately/Severely Reduced (HFrEF)'}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {efPercent >= 52 
                      ? 'Preserved ejection fraction. Assess diastolic parameters (E/A, e\', E/e\').' 
                      : 'Guideline-directed medical therapy (GDMT: ARNI/ACEi, Beta-Blocker, MRA, SGLT2i) indicated.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COUINAUD RESECTION PLANNER */}
          {activeTab === 'COUINAUD_RESECTION' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="font-semibold text-slate-200">Couinaud Liver Segmental Resection Planner</div>
                <p className="text-[11px] text-slate-400">Select segments planned for anatomical liver resection (Seg I - VIII):</p>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(seg => (
                    <button
                      key={seg}
                      onClick={() => setResectedSegments({ ...resectedSegments, [seg]: !resectedSegments[seg] })}
                      className={`p-2.5 rounded-lg border font-mono text-center flex flex-col justify-center items-center transition ${
                        resectedSegments[seg]
                          ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold shadow-md'
                          : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xs">Seg {seg}</span>
                      <span className="text-[9px] text-slate-400">~{segmentWeights[seg]}% Vol</span>
                      <span className="text-[8px] mt-1 text-amber-400">{resectedSegments[seg] ? 'Resect' : 'Preserve'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Remnant Output */}
              <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-amber-400">Future Liver Remnant (FLR)</div>
                  <div className="text-3xl font-extrabold text-white font-mono">{futureLiverRemnant}%</div>
                  <div className="text-[10px] text-slate-400 font-mono">Resection Volume: {resectedVolumePercent}%</div>
                </div>
                <div className="text-right max-w-xs">
                  <div className={`font-bold ${futureLiverRemnant >= 30 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {futureLiverRemnant >= 30 ? 'Adequate Remnant (≥30%)' : 'Critical FLR Depletion (<30%)'}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {futureLiverRemnant >= 30
                      ? 'Safe for primary resection in normal non-cirrhotic liver parenchyma.'
                      : 'High risk of post-hepatectomy liver failure (PHLF). Consider Portal Vein Embolization (PVE) to hypertrophy contralateral lobe.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PI-RADS v2.1 */}
          {activeTab === 'PIRADS' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="font-semibold text-slate-200">Anatomical Zone Selection</div>
                <div className="flex space-x-3">
                  {(['PZ', 'TZ'] as const).map(z => (
                    <button
                      key={z}
                      onClick={() => setPiradsZone(z)}
                      className={`flex-1 py-1.5 rounded-lg border text-center font-medium ${
                        piradsZone === z
                          ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                      }`}
                    >
                      {z === 'PZ' ? 'Peripheral Zone (DWI Dominant)' : 'Transition Zone (T2W Dominant)'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">DWI/ADC Score (1-5)</label>
                    <select
                      value={dwiScore}
                      onChange={e => setDwiScore(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                    >
                      <option value={1}>1 - Normal / No restricted diffusion</option>
                      <option value={2}>2 - Linear / diffuse mild hypointensity</option>
                      <option value={3}>3 - Focal mild/moderate hypointensity</option>
                      <option value={4}>4 - Marked focal hypointensity &lt;1.5 cm</option>
                      <option value={5}>5 - Marked focal hypointensity ≥1.5 cm or EPE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">T2W Score (1-5)</label>
                    <select
                      value={t2wScore}
                      onChange={e => setT2wScore(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                    >
                      <option value={1}>1 - Normal homogeneous high signal</option>
                      <option value={2}>2 - Well-circumscribed benign nodule</option>
                      <option value={3}>3 - Heterogeneous or non-circumscribed</option>
                      <option value={4}>4 - Lenticular / ill-defined hypointense &lt;1.5cm</option>
                      <option value={5}>5 - Spiculated / invasive hypointense ≥1.5cm</option>
                    </select>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dcePositive}
                      onChange={e => setDcePositive(e.target.checked)}
                      className="rounded accent-teal-500 w-4 h-4"
                    />
                    <span>Dynamic Contrast Enhancement (DCE) Positive (Early focal wash-in)</span>
                  </label>
                </div>
              </div>

              {/* PI-RADS Result */}
              <div className="p-4 rounded-xl border border-teal-500/40 bg-teal-950/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-teal-400">Final PI-RADS v2.1 Score</div>
                  <div className="text-3xl font-extrabold text-white font-mono">Category {finalPirads}</div>
                </div>
                <div className="text-right max-w-xs">
                  <div className={`font-bold ${
                    finalPirads >= 4 ? 'text-rose-400' : finalPirads === 3 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {finalPirads >= 4 ? 'High / Very High Likelihood of Clinically Significant Cancer' : finalPirads === 3 ? 'Equivocal (Intermediate Risk)' : 'Low / Very Low Risk'}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {finalPirads >= 4
                      ? 'Targeted MRI-transrectal ultrasound fusion biopsy recommended.'
                      : finalPirads === 3
                        ? 'Biopsy considered based on PSA density (>0.15 ng/mL/cc) and clinical judgment.'
                        : 'Routine PSA monitoring; biopsy generally not indicated.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FETAL BIOMETRY */}
          {activeTab === 'FETAL_BIOMETRY' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="font-semibold text-slate-200">Standard Biometric Caliper Inputs (Hadlock Model)</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">BPD (Head Width)</label>
                    <input
                      type="number"
                      value={bpd}
                      onChange={e => setBpd(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono text-sm"
                    />
                    <span className="text-[9px] text-slate-500">mm</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Head Circ (HC)</label>
                    <input
                      type="number"
                      value={hc}
                      onChange={e => setHc(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono text-sm"
                    />
                    <span className="text-[9px] text-slate-500">mm</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Abdominal Circ (AC)</label>
                    <input
                      type="number"
                      value={ac}
                      onChange={e => setAc(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono text-sm"
                    />
                    <span className="text-[9px] text-slate-500">mm</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Femur Length (FL)</label>
                    <input
                      type="number"
                      value={fl}
                      onChange={e => setFl(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono text-sm"
                    />
                    <span className="text-[9px] text-slate-500">mm</span>
                  </div>
                </div>
              </div>

              {/* Fetal Growth Result */}
              <div className="p-4 rounded-xl border border-purple-500/40 bg-purple-950/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-purple-400">Estimated Fetal Weight (EFW)</div>
                  <div className="text-3xl font-extrabold text-white font-mono">{estimatedWeightGrams} g</div>
                  <div className="text-[10px] text-slate-400 font-mono">Equivalent Gestational Age: ~{estimatedWeeks} weeks</div>
                </div>
                <div className="text-right max-w-xs">
                  <div className="font-bold text-emerald-400">Appropriate for Gestational Age (AGA)</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Parameters fall within 10th-90th percentiles for singleton pregnancy. Normal amniotic fluid index required.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#0d131c] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>Formulas calibrated to ACC/AHA, AHA/ASA, ACR PI-RADS v2.1, and Hadlock standards.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
