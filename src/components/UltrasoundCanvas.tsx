import React, { useEffect, useRef, useState } from 'react';
import { ProbeOrientation } from '../types';
import { PROBE_PRESETS } from '../data/challengesData';
import { Tag, Activity, Sparkles, Sliders, Waves, Layers } from 'lucide-react';

interface UltrasoundCanvasProps {
  activePresetId: 'plax' | 'psax' | 'a4c' | 'subcostal';
  onSelectPreset: (presetId: 'plax' | 'psax' | 'a4c' | 'subcostal') => void;
  showLabels: boolean;
  onToggleLabels: () => void;
}

export const UltrasoundCanvas: React.FC<UltrasoundCanvasProps> = ({
  activePresetId,
  onSelectPreset,
  showLabels,
  onToggleLabels
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePreset = PROBE_PRESETS.find(p => p.presetId === activePresetId) || PROBE_PRESETS[0];

  // Clinical Ultrasound Controls
  const [gain, setGain] = useState(58);
  const [colorDoppler, setColorDoppler] = useState(false);
  const [showAtriaAI, setShowAtriaAI] = useState(true); // ATRIA-EchoTrace AI Contours
  const [freeze, setFreeze] = useState(false);

  // Pre-generate acoustic scatterers for authentic ultrasound Rayleigh speckle noise
  const scatterersRef = useRef<{ x: number; y: number; brightness: number; tissue: 'myo' | 'valve' | 'peri' | 'blood' }[]>([]);

  useEffect(() => {
    // Generate 6,000 tissue acoustic scatterers for genuine B-mode speckle texture
    const scatterers: { x: number; y: number; brightness: number; tissue: 'myo' | 'valve' | 'peri' | 'blood' }[] = [];
    for (let i = 0; i < 6500; i++) {
      scatterers.push({
        x: Math.random(),
        y: Math.random(),
        brightness: Math.random(),
        tissue: 'myo'
      });
    }
    scatterersRef.current = scatterers;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      if (!freeze) {
        t += 0.045; // Cardiac cycle progression (~72 bpm)
      }

      const width = canvas.width;
      const height = canvas.height;

      // Dark clinical ultrasound CRT monitor background
      ctx.fillStyle = '#030508';
      ctx.fillRect(0, 0, width, height);

      // Sector Geometry (Apex at top center)
      const apexX = width / 2;
      const apexY = height * 0.11;
      const maxRadius = height * 0.77;
      const sectorAngle = (78 * Math.PI) / 180;
      const startAngle = Math.PI / 2 - sectorAngle / 2;
      const endAngle = Math.PI / 2 + sectorAngle / 2;

      // Draw Sector Border & Clip to Ultrasound Field
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(apexX, apexY);
      ctx.arc(apexX, apexY, maxRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.clip();

      // Deep acoustic background with ultrasound radial scanlines
      const grad = ctx.createRadialGradient(apexX, apexY, 20, apexX, apexY, maxRadius);
      grad.addColorStop(0, 'rgba(10, 16, 24, 0.98)');
      grad.addColorStop(0.5, 'rgba(6, 10, 16, 0.99)');
      grad.addColorStop(1, 'rgba(2, 4, 6, 1.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Cardiac Cycle Kinematics (End-Diastole to End-Systole)
      // Wiggers cycle curve: rapid systolic contraction, rapid diastolic filling (E wave), atrial kick (A wave)
      const cycle = t % (Math.PI * 2);
      const isSystole = cycle < Math.PI * 0.8;
      const systolePhase = isSystole ? Math.sin(cycle / 0.8) : 0;
      const diastolePhase = !isSystole ? Math.sin((cycle - Math.PI * 0.8) / 1.2) : 0;

      // Left ventricular wall thickening & radial inward contraction (Normal EF ~62%)
      const lvRadialContract = 1.0 - systolePhase * 0.22; // LV shrinks 22% radially
      const myoThickening = 1.0 + systolePhase * 0.38; // Myocardium thickens 38% in systole

      // Valve Kinematics
      const avOpen = isSystole && systolePhase > 0.15; // Aortic valve opens in systole
      const mvOpen = !isSystole; // Mitral valve opens in diastole (E/A waves)

      // -------------------------------------------------------------
      // 1. DENSE ACOUSTIC B-MODE SPECKLE TEXTURE & MYOCARDIAL MORPHOLOGY
      // -------------------------------------------------------------
      const gainFactor = gain / 50;

      if (activePresetId === 'plax') {
        // =========================================================
        // PARASTERNAL LONG AXIS (PLAX)
        // =========================================================
        // 1. Posterior Hyperechoic Pericardium (bright white acoustic reflector)
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.85 * gainFactor})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(apexX + 35, apexY + 165, 115, 0.55, 1.75);
        ctx.stroke();

        // 2. Posterior LV Myocardium (Speckled intermediate echogenicity)
        ctx.fillStyle = `rgba(130, 145, 165, ${0.45 * gainFactor})`;
        ctx.beginPath();
        ctx.ellipse(apexX + 45, apexY + 205, 82, 18 * myoThickening, -0.25, 0, Math.PI * 2);
        ctx.fill();

        // 3. Left Ventricular Cavity (Anechoic black blood pool)
        ctx.fillStyle = 'rgba(2, 4, 7, 0.98)';
        ctx.beginPath();
        ctx.ellipse(apexX + 25, apexY + 158, 85 * lvRadialContract, 48 * lvRadialContract, -0.24, 0, Math.PI * 2);
        ctx.fill();

        // 4. Interventricular Septum (IVS)
        ctx.fillStyle = `rgba(135, 150, 170, ${0.48 * gainFactor})`;
        ctx.beginPath();
        ctx.ellipse(apexX + 5, apexY + 108, 90, 18 * myoThickening, -0.22, 0, Math.PI * 2);
        ctx.fill();

        // 5. Right Ventricular Outflow Tract (RVOT) - Anterior
        ctx.fillStyle = 'rgba(2, 4, 7, 0.98)';
        ctx.beginPath();
        ctx.ellipse(apexX - 35, apexY + 62, 75, 24, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // 6. Aortic Root Tubular Lumen
        ctx.fillStyle = 'rgba(2, 4, 7, 0.98)';
        ctx.beginPath();
        ctx.rect(apexX - 88, apexY + 130, 52, 46);
        ctx.fill();

        // Aortic Valve Leaflets (Bright thin reflectors)
        ctx.strokeStyle = `rgba(240, 248, 255, ${0.95 * gainFactor})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        if (avOpen) {
          // Leaflets separate to parallel walls during ejection
          ctx.moveTo(apexX - 84, apexY + 137);
          ctx.lineTo(apexX - 48, apexY + 137);
          ctx.moveTo(apexX - 84, apexY + 169);
          ctx.lineTo(apexX - 48, apexY + 169);
        } else {
          // Coaptation line in mid-lumen
          ctx.moveTo(apexX - 84, apexY + 153);
          ctx.lineTo(apexX - 48, apexY + 153);
        }
        ctx.stroke();

        // 7. Left Atrium (Posterior to aortic root)
        ctx.fillStyle = 'rgba(2, 4, 7, 0.98)';
        ctx.beginPath();
        ctx.ellipse(apexX - 60, apexY + 218, 48, 38, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // 8. Mitral Valve Leaflets (Anterior & Posterior)
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.92 * gainFactor})`;
        ctx.beginPath();
        if (mvOpen) {
          // Diastolic excursion into LV cavity (E-point opening)
          const openExt = Math.min(1.0, diastolePhase * 1.4);
          ctx.moveTo(apexX - 16, apexY + 175);
          ctx.lineTo(apexX + 22 * openExt, apexY + 150 - 15 * openExt); // AML
          ctx.moveTo(apexX - 10, apexY + 192);
          ctx.lineTo(apexX + 16 * openExt, apexY + 200 + 8 * openExt); // PML
        } else {
          // Systolic apposition line
          ctx.moveTo(apexX - 16, apexY + 175);
          ctx.lineTo(apexX - 4, apexY + 185);
        }
        ctx.stroke();

      } else if (activePresetId === 'psax') {
        // =========================================================
        // PARASTERNAL SHORT AXIS (PSAX) - DOUGHNUT VIEW
        // =========================================================
        // Pericardium
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.85 * gainFactor})`;
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.arc(apexX + 20, apexY + 160, 95, 0, Math.PI * 2);
        ctx.stroke();

        // Left Ventricle Myocardial Ring
        ctx.fillStyle = `rgba(135, 150, 170, ${0.48 * gainFactor})`;
        ctx.beginPath();
        ctx.arc(apexX + 20, apexY + 160, 92, 0, Math.PI * 2);
        ctx.fill();

        // Anechoic LV Cavity
        ctx.fillStyle = 'rgba(2, 4, 7, 0.98)';
        ctx.beginPath();
        ctx.arc(apexX + 20, apexY + 160, 54 * lvRadialContract, 0, Math.PI * 2);
        ctx.fill();

        // Papillary Muscles (PM & AL "Mushrooms")
        ctx.fillStyle = `rgba(145, 160, 180, ${0.65 * gainFactor})`;
        ctx.beginPath();
        ctx.ellipse(apexX + 52, apexY + 144, 15 * myoThickening, 13 * myoThickening, 0.4, 0, Math.PI * 2); // AL Pap
        ctx.ellipse(apexX - 12, apexY + 182, 16 * myoThickening, 14 * myoThickening, -0.4, 0, Math.PI * 2); // PM Pap
        ctx.fill();

        // Right Ventricular Crescent wrapping around septum
        ctx.fillStyle = 'rgba(2, 4, 7, 0.98)';
        ctx.beginPath();
        ctx.arc(apexX + 15, apexY + 155, 114, 2.7, 4.6);
        ctx.arc(apexX + 20, apexY + 160, 92, 4.6, 2.7, true);
        ctx.closePath();
        ctx.fill();

      } else if (activePresetId === 'a4c') {
        // =========================================================
        // APICAL 4-CHAMBER (A4C) - APEX AT TOP
        // =========================================================
        // Left Ventricle (Right of screen)
        ctx.fillStyle = 'rgba(2, 4, 7, 0.98)';
        ctx.beginPath();
        ctx.moveTo(apexX + 12, apexY + 58);
        ctx.quadraticCurveTo(apexX + 80 * lvRadialContract, apexY + 115, apexX + 60 * lvRadialContract, apexY + 195);
        ctx.lineTo(apexX + 12, apexY + 195);
        ctx.quadraticCurveTo(apexX + 12, apexY + 115, apexX + 12, apexY + 58);
        ctx.fill();

        // Right Ventricle (Left of screen)
        ctx.beginPath();
        ctx.moveTo(apexX - 12, apexY + 74);
        ctx.quadraticCurveTo(apexX - 74, apexY + 122, apexX - 48, apexY + 195);
        ctx.lineTo(apexX - 12, apexY + 195);
        ctx.quadraticCurveTo(apexX - 12, apexY + 122, apexX - 12, apexY + 74);
        ctx.fill();

        // Central Interventricular Septum (IVS)
        ctx.fillStyle = `rgba(135, 150, 170, ${0.48 * gainFactor})`;
        ctx.fillRect(apexX - 10, apexY + 62, 20 * myoThickening, 133);

        // Lateral LV Wall
        ctx.beginPath();
        ctx.moveTo(apexX + 80 * lvRadialContract, apexY + 115);
        ctx.quadraticCurveTo(apexX + 98, apexY + 150, apexX + 68, apexY + 200);
        ctx.lineTo(apexX + 58, apexY + 195);
        ctx.fill();

        // Left Atrium & Right Atrium at Base
        ctx.fillStyle = 'rgba(2, 4, 7, 0.98)';
        ctx.beginPath();
        ctx.ellipse(apexX + 42, apexY + 240, 44, 38, 0, 0, Math.PI * 2); // LA
        ctx.ellipse(apexX - 36, apexY + 240, 40, 35, 0, 0, Math.PI * 2); // RA
        ctx.fill();

        // Mitral & Tricuspid Valves
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.92 * gainFactor})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(apexX + 12, apexY + 195);
        ctx.lineTo(apexX + 48, apexY + (mvOpen ? 180 : 195)); // Mitral
        ctx.moveTo(apexX - 12, apexY + 190);
        ctx.lineTo(apexX - 42, apexY + (mvOpen ? 175 : 190)); // Tricuspid (inserts more apically)
        ctx.stroke();

      } else {
        // =========================================================
        // SUBCOSTAL 4-CHAMBER
        // =========================================================
        // Liver Parenchyma (Acoustic window at near field)
        ctx.fillStyle = `rgba(90, 105, 125, ${0.4 * gainFactor})`;
        ctx.beginPath();
        ctx.ellipse(apexX, apexY + 65, 150, 38, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cardiac Silhouette
        ctx.fillStyle = 'rgba(2, 4, 7, 0.98)';
        ctx.beginPath();
        ctx.ellipse(apexX - 15, apexY + 175, 100 * lvRadialContract, 62 * lvRadialContract, -0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // -------------------------------------------------------------
      // 2. RAYLEIGH ACOUSTIC SPECKLE NOISE PASS
      // -------------------------------------------------------------
      // Simulates actual radiofrequency ultrasound speckle distribution
      const scatterers = scatterersRef.current;
      ctx.fillStyle = `rgba(215, 225, 240, ${0.18 * gainFactor})`;
      for (let i = 0; i < scatterers.length; i += 3) {
        const sc = scatterers[i];
        const rad = sc.y * maxRadius;
        const ang = startAngle + sc.x * sectorAngle;
        const sx = apexX + rad * Math.cos(ang);
        const sy = apexY + rad * Math.sin(ang);

        // Only draw speckle outside the center of anechoic chambers
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      // -------------------------------------------------------------
      // 3. COLOR DOPPLER JET OVERLAY (When Toggled)
      // -------------------------------------------------------------
      if (colorDoppler) {
        // Sample gate over mitral / aortic outflow
        ctx.save();
        if (activePresetId === 'plax') {
          // Outflow jet into aorta in systole (Blue/Cyan: moving away from transducer)
          if (avOpen) {
            const dopplerGrad = ctx.createLinearGradient(apexX - 80, apexY + 140, apexX - 45, apexY + 160);
            dopplerGrad.addColorStop(0, 'rgba(6, 182, 212, 0.7)');
            dopplerGrad.addColorStop(1, 'rgba(59, 130, 246, 0.5)');
            ctx.fillStyle = dopplerGrad;
            ctx.beginPath();
            ctx.ellipse(apexX - 65, apexY + 150, 26, 14, 0.2, 0, Math.PI * 2);
            ctx.fill();
          }
          // Mitral inflow in diastole (Red/Orange: moving toward transducer)
          if (mvOpen) {
            const inflowGrad = ctx.createLinearGradient(apexX - 10, apexY + 175, apexX + 25, apexY + 160);
            inflowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.65)');
            inflowGrad.addColorStop(1, 'rgba(245, 158, 11, 0.5)');
            ctx.fillStyle = inflowGrad;
            ctx.beginPath();
            ctx.ellipse(apexX + 8, apexY + 168, 24, 18, -0.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 4. ATRIA-ECHOTRACE AI CARDIAC CONTOURING OVERLAY
      // Inspired by atria.theadimension.com (MedGemma 1.5 polygon contours)
      // -------------------------------------------------------------
      if (showAtriaAI && activePresetId === 'a4c') {
        ctx.save();
        // Ground Truth Reference Contour (Green polygon)
        ctx.strokeStyle = '#10b981'; // Green
        ctx.lineWidth = 2.0;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        const refPoints = [
          [apexX + 12, apexY + 58],
          [apexX + 45, apexY + 85],
          [apexX + 72 * lvRadialContract, apexY + 130],
          [apexX + 62 * lvRadialContract, apexY + 185],
          [apexX + 46, apexY + 195], // Mitral lateral annulus
          [apexX + 12, apexY + 195], // Mitral septal annulus
          [apexX + 12, apexY + 140],
          [apexX + 12, apexY + 58]
        ];
        refPoints.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p[0], p[1]);
          else ctx.lineTo(p[0], p[1]);
        });
        ctx.stroke();

        // AI Predicted Contour (Red polygon)
        ctx.strokeStyle = '#ef4444'; // Red
        ctx.setLineDash([]);
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const predPoints = [
          [apexX + 11, apexY + 60],
          [apexX + 46, apexY + 87],
          [apexX + 70 * lvRadialContract, apexY + 132],
          [apexX + 60 * lvRadialContract, apexY + 183],
          [apexX + 44, apexY + 194],
          [apexX + 12, apexY + 194],
          [apexX + 11, apexY + 142],
          [apexX + 11, apexY + 60]
        ];
        predPoints.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p[0], p[1]);
          else ctx.lineTo(p[0], p[1]);
        });
        ctx.stroke();

        // Long Axis Apical Line (Simpson's Biplane Rule)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(apexX + 12, apexY + 58);
        ctx.lineTo(apexX + 29, apexY + 195);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore(); // Restore sector clip

      // -------------------------------------------------------------
      // 5. SECTOR FRAME & DEPTH CALIBRATION TICKS (1cm intervals)
      // -------------------------------------------------------------
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(apexX, apexY);
      ctx.arc(apexX, apexY, maxRadius, startAngle, endAngle);
      ctx.lineTo(apexX, apexY);
      ctx.stroke();

      for (let d = 2; d <= 16; d += 2) {
        const r = (d / 16) * maxRadius;
        const tickAngle = endAngle + 0.02;
        const tx = apexX + r * Math.cos(tickAngle);
        const ty = apexY + r * Math.sin(tickAngle);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
        ctx.font = '10px monospace';
        ctx.fillText(`${d}cm`, tx + 4, ty + 3);
        ctx.fillRect(tx - 3, ty - 1, 6, 2);
      }

      // Synchronized Live ECG Rhythm Strip (Green lead II)
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const ecgY = height - 26;
      const ecgSpeed = t * 45;
      for (let x = 30; x < width - 30; x++) {
        const sample = (x + ecgSpeed) % 180;
        let yDelta = 0;
        if (sample > 75 && sample < 85) yDelta = -4;
        if (sample > 100 && sample < 105) yDelta = 6;
        if (sample >= 105 && sample <= 112) yDelta = -28; // R wave peak
        if (sample > 112 && sample < 118) yDelta = 8;
        if (sample > 135 && sample < 155) yDelta = -7;
        if (x === 30) ctx.moveTo(x, ecgY + yDelta);
        else ctx.lineTo(x, ecgY + yDelta);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activePresetId, gain, colorDoppler, showAtriaAI, freeze]);

  return (
    <div className="relative w-full h-full bg-[#030508] flex flex-col select-none overflow-hidden font-mono">
      {/* Top Clinical Header Bar */}
      <div className="p-3 bg-[#0d131c] border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold text-white tracking-wider">MEDALICUS CARDIAC ULTRASOUND</span>
          <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            {activePreset.name}
          </span>
        </div>

        {/* View Mode Buttons & ATRIA Toggle */}
        <div className="flex items-center space-x-1.5">
          {PROBE_PRESETS.map(p => (
            <button
              key={p.presetId}
              onClick={() => onSelectPreset(p.presetId)}
              className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                activePresetId === p.presetId
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.presetId.toUpperCase()}
            </button>
          ))}

          {/* Color Doppler Toggle */}
          <button
            onClick={() => setColorDoppler(!colorDoppler)}
            className={`px-2 py-1 rounded text-[10px] border flex items-center space-x-1 transition ${
              colorDoppler
                ? 'bg-gradient-to-r from-blue-900 to-rose-900 border-cyan-400 text-cyan-200 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Waves className="w-3 h-3" />
            <span>Doppler</span>
          </button>

          {/* ATRIA AI Cardiac Contours Toggle */}
          <button
            onClick={() => setShowAtriaAI(!showAtriaAI)}
            title="ATRIA-EchoTrace (The Adimension) AI cardiac contour overlay"
            className={`px-2 py-1 rounded text-[10px] border flex items-center space-x-1 transition ${
              showAtriaAI
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>ATRIA AI</span>
          </button>

          <button
            onClick={onToggleLabels}
            className={`px-2 py-1 rounded text-[10px] border flex items-center space-x-1 transition ${
              showLabels
                ? 'bg-teal-950 border-teal-500 text-teal-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>Labels</span>
          </button>
        </div>
      </div>

      {/* Main Ultrasound Screen */}
      <div className="flex-1 relative flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="w-full h-full object-contain max-h-[480px] rounded-lg shadow-2xl"
        />

        {/* Diagnostic Metadata HUD (Left) */}
        <div className="absolute top-4 left-4 text-[10px] text-slate-400 space-y-0.5 pointer-events-none bg-black/75 p-2.5 rounded backdrop-blur border border-slate-800 shadow-md">
          <div className="text-white font-bold tracking-wider">MEDALICUS PACS &bull; TTE CINE</div>
          <div>PROBE: S5-1 PHASED ARRAY</div>
          <div>FREQ: 3.5 MHz &bull; HARMONIC</div>
          <div>GAIN: {gain} dB &bull; DR: 60 dB</div>
          <div>DEPTH: 16 cm &bull; FPS: 52 Hz</div>
          <div>MI: 1.1 &bull; TIS: 0.7</div>
        </div>

        {/* ATRIA-EchoTrace Quantitative Telemetry Box (Right) */}
        {showAtriaAI && activePresetId === 'a4c' && (
          <div className="absolute top-4 right-4 bg-slate-950/90 border border-emerald-500/50 p-2.5 rounded-lg shadow-xl text-[10px] space-y-1 backdrop-blur pointer-events-none">
            <div className="flex items-center space-x-1 text-emerald-400 font-bold border-b border-slate-800 pb-1">
              <Sparkles className="w-3 h-3" />
              <span>ATRIA-EchoTrace (MedGemma)</span>
            </div>
            <div className="flex justify-between space-x-3 text-slate-300">
              <span>EDV (End-Diastole):</span>
              <span className="font-bold text-white">118 mL</span>
            </div>
            <div className="flex justify-between space-x-3 text-slate-300">
              <span>ESV (End-Systole):</span>
              <span className="font-bold text-white">45 mL</span>
            </div>
            <div className="flex justify-between space-x-3 text-slate-300">
              <span>Stroke Volume (SV):</span>
              <span className="font-bold text-white">73 mL</span>
            </div>
            <div className="flex justify-between space-x-3 text-emerald-300 font-bold border-t border-slate-800 pt-1">
              <span>Ejection Fraction (EF):</span>
              <span className="text-emerald-400">62% (Normal)</span>
            </div>
            <div className="text-[9px] text-slate-500 flex items-center space-x-2 pt-0.5">
              <span className="flex items-center space-x-1"><i className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /><span>Ref</span></span>
              <span className="flex items-center space-x-1"><i className="w-2 h-2 rounded-full bg-rose-500 inline-block" /><span>AI Pred</span></span>
              <span className="text-slate-400 font-mono">DICE: 0.94</span>
            </div>
          </div>
        )}

        {/* Anatomical Chamber Labels Overlay */}
        {showLabels && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center">
            {activePresetId === 'plax' && (
              <>
                <span className="absolute top-[32%] left-[45%] text-[10px] font-bold text-cyan-300 bg-cyan-950/90 px-1.5 rounded border border-cyan-700">RVOT</span>
                <span className="absolute top-[42%] left-[53%] text-[10px] font-bold text-amber-300 bg-amber-950/90 px-1.5 rounded border border-amber-700">IVS</span>
                <span className="absolute top-[52%] left-[55%] text-[10px] font-bold text-cyan-300 bg-cyan-950/90 px-1.5 rounded border border-cyan-700">LV Cavity</span>
                <span className="absolute top-[47%] left-[36%] text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-1.5 rounded border border-emerald-700">Aortic Valve</span>
                <span className="absolute top-[62%] left-[38%] text-[10px] font-bold text-cyan-300 bg-cyan-950/90 px-1.5 rounded border border-cyan-700">Left Atrium</span>
                <span className="absolute top-[55%] left-[48%] text-[10px] font-bold text-rose-300 bg-rose-950/90 px-1.5 rounded border border-rose-700">Mitral Valve</span>
              </>
            )}
            {activePresetId === 'psax' && (
              <>
                <span className="absolute top-[40%] left-[38%] text-[10px] font-bold text-cyan-300 bg-cyan-950/90 px-1.5 rounded border border-cyan-700">RV Crescent</span>
                <span className="absolute top-[50%] left-[52%] text-[10px] font-bold text-cyan-300 bg-cyan-950/90 px-1.5 rounded border border-cyan-700">LV Cavity</span>
                <span className="absolute top-[56%] left-[44%] text-[10px] font-bold text-amber-300 bg-amber-950/90 px-1.5 rounded border border-amber-700">PM Papillary</span>
                <span className="absolute top-[46%] left-[60%] text-[10px] font-bold text-amber-300 bg-amber-950/90 px-1.5 rounded border border-amber-700">AL Papillary</span>
              </>
            )}
            {activePresetId === 'a4c' && (
              <>
                <span className="absolute top-[35%] left-[56%] text-[10px] font-bold text-cyan-300 bg-cyan-950/90 px-1.5 rounded border border-cyan-700">LV Apex</span>
                <span className="absolute top-[38%] left-[40%] text-[10px] font-bold text-cyan-300 bg-cyan-950/90 px-1.5 rounded border border-cyan-700">RV Apex</span>
                <span className="absolute top-[48%] left-[48%] text-[10px] font-bold text-amber-300 bg-amber-950/90 px-1.5 rounded border border-amber-700">IVS</span>
                <span className="absolute top-[62%] left-[56%] text-[10px] font-bold text-cyan-300 bg-cyan-950/90 px-1.5 rounded border border-cyan-700">LA</span>
                <span className="absolute top-[62%] left-[40%] text-[10px] font-bold text-cyan-300 bg-cyan-950/90 px-1.5 rounded border border-cyan-700">RA</span>
              </>
            )}
          </div>
        )}

        {/* Surface Landmark Callout at Bottom */}
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 bg-slate-900/90 text-slate-300 border border-cyan-500/40 px-3.5 py-1 rounded-full text-[10px] text-center max-w-lg pointer-events-none shadow-xl flex items-center space-x-2">
          <span className="text-cyan-400 font-bold">Chest Surface Landmark:</span>
          <span>{activePreset.surfaceLandmark}</span>
        </div>
      </div>
    </div>
  );
};
