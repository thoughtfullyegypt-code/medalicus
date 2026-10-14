import React, { useEffect, useRef, useState } from 'react';
import { OrganSystemId, AnatomicalSegment, ClinicalCase, LocalSandboxFile, TelestratorStroke } from '../types';
import { ALL_SYSTEM_SEGMENTS } from '../data/multiSystemsData';
import { Eye, Download, Sparkles, RefreshCw, Layers, Edit3, ZoomIn, Scissors } from 'lucide-react';

interface Procedural2DCanvasProps {
  systemId: OrganSystemId;
  activeCase: ClinicalCase;
  sliceIndex: number;
  onSliceIndexChange: (slice: number) => void;
  selectedSegmentId: string | null;
  onSelectSegment: (id: string | null) => void;
  comparisonMode: boolean; // Twin-Sync
  onToggleComparison: () => void;
  presenterLaserActive: boolean;
  blindCaseMode: boolean;
  localFile: LocalSandboxFile | null;
  onExportAnki: (frontBlob: Blob, backBlob: Blob) => void;
}

export const Procedural2DCanvas: React.FC<Procedural2DCanvasProps> = ({
  systemId,
  activeCase,
  sliceIndex,
  onSliceIndexChange,
  selectedSegmentId,
  onSelectSegment,
  comparisonMode,
  onToggleComparison,
  presenterLaserActive,
  blindCaseMode,
  localFile,
  onExportAnki
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Telestrator / Laser pointer state
  const [telestratorStrokes, setTelestratorStrokes] = useState<TelestratorStroke[]>([]);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);

  // Caliper measurement state
  const [caliperStart, setCaliperStart] = useState<{ x: number; y: number } | null>(null);
  const [caliperEnd, setCaliperEnd] = useState<{ x: number; y: number } | null>(null);
  const [caliperMode, setCaliperMode] = useState(false);

  // Hovered segment
  const [hoveredSegment, setHoveredSegment] = useState<AnatomicalSegment | null>(null);

  // Available segments for this system
  const segments = ALL_SYSTEM_SEGMENTS[systemId] || [];

  // Handle Canvas Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // If local sandbox video/image is loaded, render it
      if (localFile?.dataUrl && localFile.type.startsWith('image/')) {
        const img = new Image();
        img.src = localFile.dataUrl;
        if (img.complete) {
          ctx.drawImage(img, 0, 0, w, h);
        }
      } else {
        // Draw Procedural Medical Image according to system
        drawProceduralScan(ctx, w, h, systemId, activeCase, sliceIndex, t, comparisonMode, selectedSegmentId);
      }

      // Draw Telestrator Strokes
      if (telestratorStrokes.length > 0) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        telestratorStrokes.forEach(stroke => {
          if (stroke.points.length < 2) return;
          ctx.beginPath();
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = 4;
          ctx.shadowColor = stroke.color;
          ctx.shadowBlur = 8;
          ctx.moveTo(stroke.points[0].x * w, stroke.points[0].y * h);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x * w, stroke.points[i].y * h);
          }
          ctx.stroke();
        });
        ctx.restore();
      }

      // Draw Presenter Laser Pointer dot
      if (presenterLaserActive && laserPos) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(laserPos.x * w, laserPos.y * h, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 14;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(laserPos.x * w, laserPos.y * h, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      }

      // Draw Caliper Line
      if (caliperStart && caliperEnd) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(caliperStart.x * w, caliperStart.y * h);
        ctx.lineTo(caliperEnd.x * w, caliperEnd.y * h);
        ctx.stroke();

        // Draw crosshair ends
        const drawCross = (x: number, y: number) => {
          ctx.beginPath();
          ctx.setLineDash([]);
          ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y);
          ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6);
          ctx.stroke();
        };
        drawCross(caliperStart.x * w, caliperStart.y * h);
        drawCross(caliperEnd.x * w, caliperEnd.y * h);

        // Distance text
        const distPx = Math.hypot((caliperEnd.x - caliperStart.x) * w, (caliperEnd.y - caliperStart.y) * h);
        const distMm = (distPx * 0.18).toFixed(1);
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`${distMm} mm`, (caliperStart.x + caliperEnd.x) * w / 2 + 10, (caliperStart.y + caliperEnd.y) * h / 2 - 10);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [systemId, activeCase, sliceIndex, comparisonMode, telestratorStrokes, presenterLaserActive, laserPos, caliperStart, caliperEnd, localFile, selectedSegmentId]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = containerRef.current.clientHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse / Pointer Handlers for Telestrator & Caliper
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (caliperMode) {
      setCaliperStart({ x, y });
      setCaliperEnd({ x, y });
      return;
    }

    if (presenterLaserActive) {
      isDrawingRef.current = true;
      currentStrokeRef.current = [{ x, y }];
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (presenterLaserActive) {
      setLaserPos({ x, y });
      if (isDrawingRef.current) {
        currentStrokeRef.current.push({ x, y });
        setTelestratorStrokes(prev => [
          ...prev.slice(-12),
          {
            id: String(Date.now()),
            points: [...currentStrokeRef.current],
            color: '#ef4444',
            timestamp: Date.now()
          }
        ]);
      }
    }

    if (caliperMode && caliperStart) {
      setCaliperEnd({ x, y });
    }
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  // 1-Click Export to Anki
  const handleExportToAnki = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // 1. Generate Back Card (Normal full scan with label)
    canvas.toBlob(backBlob => {
      if (!backBlob) return;

      // 2. Generate Front Card with Occlusion Box
      const frontCanvas = document.createElement('canvas');
      frontCanvas.width = canvas.width;
      frontCanvas.height = canvas.height;
      const fCtx = frontCanvas.getContext('2d');
      if (!fCtx) return;

      fCtx.drawImage(canvas, 0, 0);

      // Draw Occlusion Box over target
      const targetW = 200;
      const targetH = 80;
      const cx = frontCanvas.width / 2 - targetW / 2;
      const cy = frontCanvas.height / 2 - targetH / 2;

      fCtx.fillStyle = '#dc2626';
      fCtx.fillRect(cx, cy, targetW, targetH);
      fCtx.strokeStyle = '#ffffff';
      fCtx.lineWidth = 2;
      fCtx.strokeRect(cx, cy, targetW, targetH);

      fCtx.fillStyle = '#ffffff';
      fCtx.font = 'bold 14px sans-serif';
      fCtx.textAlign = 'center';
      fCtx.fillText('? [Identify Structure]', cx + targetW / 2, cy + targetH / 2 + 5);

      frontCanvas.toBlob(frontBlob => {
        if (!frontBlob) return;
        onExportAnki(frontBlob, backBlob);
      });
    }, 'image/png');
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#05080f] select-none overflow-hidden">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Top Floating PACS Status HUD */}
      <div className="absolute top-3 left-3 z-20 flex flex-col space-y-1.5 pointer-events-none">
        <div className="bg-[#0b121e]/90 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs flex items-center space-x-2 shadow-lg">
          <span className="font-mono text-teal-400 font-bold uppercase">{systemId}</span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-[11px] text-slate-300 font-medium">
            {blindCaseMode ? 'Blind Case Mode [Presenting]' : (activeCase?.title || 'Case Viewer')}
          </span>
          {comparisonMode && (
            <span className="px-1.5 py-0.2 bg-purple-950 text-purple-300 border border-purple-800 rounded text-[9px] font-mono">
              Twin-Sync: Normal vs Path
            </span>
          )}
        </div>

        {/* Slice Index Pill for Cross-Sectional Systems */}
        <div className="bg-[#0b121e]/90 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-400 font-mono flex items-center space-x-2">
          <span>Slice {sliceIndex} / 100</span>
          <span>&bull;</span>
          <span>100% Client-Side In-RAM</span>
        </div>
      </div>

      {/* Floating Interactive Controls (Twin-Sync, Calipers, Anki, Clear Telestrator) */}
      <div className="absolute top-3 right-3 z-20 flex items-center space-x-1.5">
        <button
          onClick={onToggleComparison}
          title="Twin-Sync Mode: Lock / Compare Normal reference vs Pathology (Hold Spacebar)"
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center space-x-1 transition shadow-lg ${
            comparisonMode
              ? 'bg-purple-950/80 border-purple-400 text-purple-200'
              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${comparisonMode ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Twin-Sync</span>
        </button>

        <button
          onClick={() => {
            setCaliperMode(!caliperMode);
            setCaliperStart(null);
            setCaliperEnd(null);
          }}
          title="Digital Caliper Tool for anatomic measurements"
          className={`p-1.5 rounded-lg border text-xs transition shadow-lg ${
            caliperMode
              ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scissors className="w-4 h-4" />
        </button>

        <button
          onClick={handleExportToAnki}
          title="1-Click Export to Anki / Image Occlusion Flashcard"
          className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 transition shadow-lg"
        >
          <Download className="w-4 h-4" />
        </button>

        {telestratorStrokes.length > 0 && (
          <button
            onClick={() => setTelestratorStrokes([])}
            title="Clear Laser Annotations"
            className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10px] font-mono"
          >
            Clear Pen
          </button>
        )}
      </div>

      {/* Floating Anatomical Segment Badges Overlay (clickable) */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-1.5 max-w-md">
        {segments.map(seg => {
          const isSelected = selectedSegmentId === seg.id;
          return (
            <button
              key={seg.id}
              onClick={() => onSelectSegment(isSelected ? null : seg.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition border ${
                isSelected
                  ? 'bg-teal-500 text-slate-950 font-bold border-teal-400 shadow-lg'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              {seg.abbr || seg.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Procedural Medical Imaging Rendering Engine (HTML5 Canvas pure JS Math)
function drawProceduralScan(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  systemId: OrganSystemId,
  activeCase: ClinicalCase,
  slice: number,
  t: number,
  comparisonMode: boolean,
  selectedSegmentId: string | null
) {
  const cx = w / 2;
  const cy = h / 2;

  switch (systemId) {
    case 'cardiovascular': {
      // 1. Authentically Shaded Fluoroscopy Background with Circular Image Intensifier Vignette
      const grad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(w, h) * 0.7);
      grad.addColorStop(0, '#dbe4ed');
      grad.addColorStop(0.7, '#cbd5e1');
      grad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle X-Ray Phosphor Quantum Mottle Noise
      ctx.fillStyle = 'rgba(15, 23, 42, 0.035)';
      for (let i = 0; i < 400; i++) {
        const nx = (Math.sin(i * 99 + t) * 0.5 + 0.5) * w;
        const ny = (Math.cos(i * 33 + t) * 0.5 + 0.5) * h;
        ctx.fillRect(nx, ny, 2, 2);
      }

      // 2. Anatomical Thoracic Bone Shadows (Spine with Pedicle Eyes & Rib Arcs)
      ctx.save();
      ctx.fillStyle = 'rgba(100, 116, 139, 0.22)';
      ctx.fillRect(cx - 55, 0, 110, h); // Thoracic vertebral column

      // Paired vertebral pedicle "eyes"
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
      ctx.lineWidth = 3;
      for (let y = 60; y < h; y += 80) {
        ctx.strokeRect(cx - 45, y, 16, 24);
        ctx.strokeRect(cx + 29, y, 16, 24);
      }

      // Rib arcs crossing the fluoroscopic field
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.16)';
      ctx.lineWidth = 18;
      for (let y = -40; y < h + 100; y += 95) {
        ctx.beginPath();
        ctx.moveTo(cx - 260, y + 80);
        ctx.quadraticCurveTo(cx, y + 30, cx + 280, y + 70);
        ctx.stroke();
      }

      // Diaphragm Dome in lower field
      ctx.fillStyle = 'rgba(71, 85, 105, 0.28)';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.quadraticCurveTo(cx + 80, h - 140, w, h - 70);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Pulsating Left Ventricular Cardiac Shadow (Beating Myocardial Mass)
      const cardiacCycle = Math.sin(t * 3.8); // ~72 bpm
      const heartScale = 1.0 + cardiacCycle * 0.045;
      ctx.fillStyle = 'rgba(71, 85, 105, 0.15)';
      ctx.beginPath();
      ctx.ellipse(cx - 20, cy + 30, 140 * heartScale, 170 * heartScale, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Dynamic Invasive Coronary Arterial Arborization (Full Clinical Cath Lab Runoff)
      ctx.save();
      // Cardiac contraction translation & systolic twist
      const twistX = cardiacCycle * 5;
      const twistY = Math.cos(t * 3.8) * 3;
      ctx.translate(twistX, twistY);

      // Contrast Bolus Pulse wave
      const contrastPulse = Math.sin(t * 3.8) * 0.15 + 0.85;

      // Diagnostic Judkins Left (JL4) Catheter
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + 120, -20);
      ctx.quadraticCurveTo(cx + 70, cy - 140, cx - 20, cy - 110);
      ctx.stroke();

      // Radiopaque metallic catheter tip ring
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx - 20, cy - 110, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // A) Left Main Coronary Artery (LMCA)
      const isLmcaSelected = selectedSegmentId === 'lmca';
      ctx.strokeStyle = isLmcaSelected ? '#14b8a6' : `rgba(15, 23, 42, ${0.92 * contrastPulse})`;
      ctx.lineWidth = isLmcaSelected ? 14 : 11;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 110);
      ctx.quadraticCurveTo(cx - 10, cy - 90, cx, cy - 70);
      ctx.stroke();

      // B) Left Circumflex Artery (LCx) & Obtuse Marginals
      const isLcxSelected = selectedSegmentId === 'lcx';
      ctx.strokeStyle = isLcxSelected ? '#14b8a6' : `rgba(15, 23, 42, ${0.90 * contrastPulse})`;
      ctx.lineWidth = isLcxSelected ? 10 : 7.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 70);
      ctx.quadraticCurveTo(cx + 65, cy - 45, cx + 115, cy + 20);
      ctx.quadraticCurveTo(cx + 130, cy + 80, cx + 145, cy + 140);
      ctx.stroke();

      // First Obtuse Marginal (OM1)
      ctx.lineWidth = isLcxSelected ? 6 : 4.5;
      ctx.beginPath();
      ctx.moveTo(cx + 75, cy - 30);
      ctx.quadraticCurveTo(cx + 115, cy + 10, cx + 130, cy + 50);
      ctx.stroke();

      // Second Obtuse Marginal (OM2) & Posterolateral twigs
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx + 115, cy + 20);
      ctx.quadraticCurveTo(cx + 145, cy + 55, cx + 160, cy + 90);
      ctx.moveTo(cx + 130, cy + 80);
      ctx.lineTo(cx + 148, cy + 105);
      ctx.stroke();

      // C) Left Anterior Descending (LAD) & Branches
      const isLadProxSelected = selectedSegmentId === 'lad-prox';
      const isLadMidSelected = selectedSegmentId === 'lad-mid';
      const isStemi = !comparisonMode && (activeCase?.stenosisPercent ?? 0) > 80;

      // Proximal LAD
      ctx.strokeStyle = isLadProxSelected ? '#14b8a6' : `rgba(15, 23, 42, ${0.94 * contrastPulse})`;
      ctx.lineWidth = isLadProxSelected ? 11 : 8.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 70);
      ctx.quadraticCurveTo(cx - 20, cy - 40, cx - 35, cy - 10);
      ctx.stroke();

      // First Septal Perforator (S1) - sharp perpendicular branch
      ctx.strokeStyle = `rgba(15, 23, 42, ${0.85 * contrastPulse})`;
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 40);
      ctx.quadraticCurveTo(cx + 10, cy - 20, cx + 25, cy + 15);
      ctx.stroke();

      // S2 & S3 Septals
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 38, cy + 25);
      ctx.lineTo(cx - 15, cy + 55);
      ctx.moveTo(cx - 52, cy + 80);
      ctx.lineTo(cx - 30, cy + 105);
      ctx.stroke();

      // First Major Diagonal Branch (D1)
      ctx.strokeStyle = `rgba(15, 23, 42, ${0.88 * contrastPulse})`;
      ctx.lineWidth = 5.2;
      ctx.beginPath();
      ctx.moveTo(cx - 28, cy - 25);
      ctx.quadraticCurveTo(cx - 85, cy + 15, cx - 110, cy + 65);
      // D1 bifurcations (D1a & D1b)
      ctx.lineWidth = 3.2;
      ctx.lineTo(cx - 130, cy + 105);
      ctx.moveTo(cx - 110, cy + 65);
      ctx.lineTo(cx - 95, cy + 115);
      ctx.stroke();

      // Second Diagonal Branch (D2)
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(cx - 45, cy + 40);
      ctx.quadraticCurveTo(cx - 85, cy + 75, cx - 105, cy + 120);
      ctx.stroke();

      // Mid & Distal LAD
      if (isStemi) {
        // --- 99% ACUTE STEMI CULPRIT LESION ---
        // Severe concentric/eccentric plaque narrowing at proximal LAD
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(cx - 35, cy - 10, 8, 0, Math.PI * 2);
        ctx.fill();

        // High-yield text badge
        ctx.fillStyle = '#991b1b';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('99% Culprit Stenosis (S1 Takeoff)', cx - 215, cy - 10);
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 45, cy - 10);
        ctx.lineTo(cx - 37, cy - 10);
        ctx.stroke();

        // Distal LAD fills only with faint sluggish contrast (TIMI 1 trickle)
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.28)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 35, cy - 10);
        ctx.quadraticCurveTo(cx - 50, cy + 45, cx - 68, cy + 110);
        ctx.quadraticCurveTo(cx - 75, cy + 155, cx - 82, cy + 195);
        ctx.stroke();

        // Absent apical blush badge
        ctx.fillStyle = '#b91c1c';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('TIMI-1 Sluggish Runoff', cx - 75, cy + 215);
      } else {
        // --- NORMAL BRISK TIMI-3 FLOW ---
        ctx.strokeStyle = isLadMidSelected ? '#14b8a6' : `rgba(15, 23, 42, ${0.92 * contrastPulse})`;
        ctx.lineWidth = isLadMidSelected ? 9 : 7;
        ctx.beginPath();
        ctx.moveTo(cx - 35, cy - 10);
        ctx.quadraticCurveTo(cx - 50, cy + 45, cx - 68, cy + 110);
        ctx.stroke();

        // Distal LAD & Apical wrap-around hairpin turn
        ctx.lineWidth = 4.8;
        ctx.beginPath();
        ctx.moveTo(cx - 68, cy + 110);
        ctx.quadraticCurveTo(cx - 75, cy + 155, cx - 82, cy + 195);
        ctx.quadraticCurveTo(cx - 84, cy + 215, cx - 72, cy + 225);
        ctx.stroke();

        // Normal apical capillary blush
        ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
        ctx.beginPath();
        ctx.ellipse(cx - 75, cy + 215, 25, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#059669';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('TIMI-3 Normal Runoff', cx - 75, cy + 245);
      }
      ctx.restore();
      break;
    }

    case 'neurology': {
      // Non-Contrast Brain CT Axial Slice (ASPECTS Plane)
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      // Skull Calvarium with Diploe
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 150, 180, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Cortex Table
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 142, 172, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Brain Parenchyma (Cerebral Soft Tissue Gray)
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 138, 168, 0, 0, Math.PI * 2);
      ctx.fill();

      // White Matter Centrum Semiovale
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(cx - 45, cy - 20, 48, 75, -0.15, 0, Math.PI * 2);
      ctx.ellipse(cx + 45, cy - 20, 48, 75, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Frontal Horns & Bodies of Lateral Ventricles (CSF Dark)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(cx - 22, cy - 15, 12, 38, -0.25, 0, Math.PI * 2);
      ctx.ellipse(cx + 22, cy - 15, 12, 38, 0.25, 0, Math.PI * 2);
      ctx.ellipse(cx - 30, cy + 55, 16, 28, 0.35, 0, Math.PI * 2);
      ctx.ellipse(cx + 30, cy + 55, 16, 28, -0.35, 0, Math.PI * 2);
      ctx.fill();

      // Septum Pellucidum
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 50);
      ctx.lineTo(cx, cy + 20);
      ctx.stroke();

      // Deep Gray Matter: Caudate & Lentiform Nucleus (ASPECTS C & L)
      ctx.fillStyle = '#64748b';
      // Caudate Heads
      ctx.beginPath();
      ctx.arc(cx - 32, cy - 25, 9, 0, Math.PI * 2);
      ctx.arc(cx + 32, cy - 25, 9, 0, Math.PI * 2);
      ctx.fill();

      // Lentiform Nuclei (Putamen & Globus Pallidus)
      ctx.beginPath();
      ctx.ellipse(cx - 55, cy + 2, 16, 22, -0.3, 0, Math.PI * 2);
      ctx.ellipse(cx + 55, cy + 2, 16, 22, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Insular Ribbon Cortex
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx - 78, cy + 5, 24, -1.2, 1.2);
      ctx.stroke();

      // Stroke Pathology: Loss of Right Insular Ribbon & Lentiform Hypoattenuation
      if (!comparisonMode && !activeCase?.isNormal) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.beginPath();
        ctx.ellipse(cx + 65, cy + 10, 48, 65, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Hyperdense MCA Sign (Bright acute clot in horizontal M1 trunk)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx + 42, cy - 8, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('Hyperdense MCA Sign', cx + 55, cy - 12);
        ctx.fillText('Loss of Insular Ribbon', cx + 55, cy + 30);
      }
      break;
    }

    case 'pulmonology': {
      // High-Definition Chest Radiograph (CXR)
      ctx.fillStyle = '#05080f';
      ctx.fillRect(0, 0, w, h);

      // Thoracic Rib Cage & Vertebral Spine Shadows
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 24, 0, 48, h);

      // Tracheal Air Column (Midline radiolucent tube)
      ctx.fillStyle = '#020617';
      ctx.fillRect(cx - 8, cy - 190, 16, 95);
      // Carina bifurcation (T4/T5)
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 95);
      ctx.lineTo(cx + 25, cy - 65);
      ctx.moveTo(cx, cy - 95);
      ctx.lineTo(cx - 30, cy - 60);
      ctx.stroke();

      // Bilateral Lung Fields
      ctx.fillStyle = '#090d16';
      // Right Lung
      ctx.beginPath();
      ctx.ellipse(cx - 95, cy, 75, 150, 0, 0, Math.PI * 2);
      ctx.fill();
      // Left Lung
      ctx.beginPath();
      ctx.ellipse(cx + 95, cy, 75, 150, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rib Arcs
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 14;
      for (let y = -140; y < 180; y += 45) {
        ctx.beginPath();
        ctx.moveTo(cx - 160, cy + y + 25);
        ctx.quadraticCurveTo(cx, cy + y, cx + 160, cy + y + 25);
        ctx.stroke();
      }

      // Cardiac Silhouette & Aortic Knob
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy - 110);
      ctx.quadraticCurveTo(cx - 50, cy - 70, cx - 24, cy - 30); // Aortic Knob
      ctx.lineTo(cx - 24, cy + 90); // Lower border
      ctx.lineTo(cx + 110, cy + 90); // Apex
      ctx.quadraticCurveTo(cx + 120, cy + 40, cx + 50, cy - 30); // Left ventricle
      ctx.quadraticCurveTo(cx + 30, cy - 80, cx + 15, cy - 110);
      ctx.closePath();
      ctx.fill();

      // Sharp Diaphragm Domes & Knife-Edge Costophrenic Sulci
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(cx - 170, cy + 140); // Right Costophrenic angle
      ctx.quadraticCurveTo(cx - 90, cy + 85, cx - 10, cy + 110);
      ctx.lineTo(cx - 10, h);
      ctx.lineTo(cx - 170, h);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 170, cy + 140); // Left Costophrenic angle
      ctx.quadraticCurveTo(cx + 90, cy + 95, cx + 10, cy + 110);
      ctx.lineTo(cx + 10, h);
      ctx.lineTo(cx + 170, h);
      ctx.closePath();
      ctx.fill();

      // Community-Acquired Pneumonia (RML Consolidation + Silhouette Sign)
      if (!comparisonMode && !activeCase?.isNormal) {
        ctx.fillStyle = 'rgba(241, 245, 249, 0.88)';
        ctx.beginPath();
        ctx.moveTo(cx - 50, cy - 10);
        ctx.lineTo(cx - 150, cy + 65);
        ctx.lineTo(cx - 25, cy + 85);
        ctx.closePath();
        ctx.fill();

        // Branching tubular Air Bronchograms
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 50, cy);
        ctx.lineTo(cx - 110, cy + 45);
        ctx.moveTo(cx - 80, cy + 25);
        ctx.lineTo(cx - 95, cy + 65);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Silhouette Sign (+) & Air Bronchograms', cx - 220, cy + 30);
      }
      break;
    }

    case 'gastroenterology': {
      // Laparoscopic Cholecystectomy & Critical View of Safety
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);

      // Liver Segments IVb & V with Glisson's Capsule
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, cy - 20);
      ctx.quadraticCurveTo(cx + 60, cy + 40, 0, cy - 30);
      ctx.closePath();
      ctx.fill();

      // Gallbladder Infundibulum & Body Retracted Cephalad
      ctx.fillStyle = '#65a30d';
      ctx.beginPath();
      ctx.ellipse(cx + 80, cy - 25, 45, 95, 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Hepatocystic Triangle (Calot's Triangle) Dissected Bare
      ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cx + 40, cy + 35);
      ctx.lineTo(cx - 20, cy + 95);
      ctx.lineTo(cx + 5, cy + 15);
      ctx.closePath();
      ctx.fill();

      // Cystic Duct (Spiral Valves of Heister)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(cx + 45, cy + 30);
      ctx.quadraticCurveTo(cx + 20, cy + 70, cx - 15, cy + 95);
      ctx.stroke();

      // Cystic Artery
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(cx + 25, cy + 15);
      ctx.lineTo(cx - 5, cy + 65);
      ctx.stroke();

      // Common Bile Duct (CBD)
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(cx - 25, cy - 10);
      ctx.lineTo(cx - 15, cy + 95);
      ctx.lineTo(cx - 5, cy + 190);
      ctx.stroke();

      // Laparoscopic Grasper & Dissector
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(w + 20, cy - 120);
      ctx.lineTo(cx + 115, cy - 70);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Critical View of Safety Achieved', cx - 180, cy + 140);
      break;
    }

    case 'nephrology': {
      // Prostate T2W MRI & PI-RADS v2.1
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      // Pelvic Musculature & Pubic Bones
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 155, 125, 0, 0, Math.PI * 2);
      ctx.fill();

      // Prostate Capsule
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Peripheral Zone (PZ - Bright T2 Crescent Halo)
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 25, 142, 90, 0, 0, Math.PI);
      ctx.fill();

      // Transition Zone (TZ - Heterogeneous BPH Stromal Nodules)
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 18, 75, 58, 0, 0, Math.PI * 2);
      ctx.fill();

      // Prostatic Urethra
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 5, 0, Math.PI * 2);
      ctx.fill();

      // PI-RADS 5 Lesion: 17mm Spicular Hypointense Mass in Right PZ
      if (!comparisonMode && !activeCase?.isNormal) {
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(cx + 62, cy + 42, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('PI-RADS 5: Marked DWI Restriction & EPE', cx - 120, cy + 140);
      }
      break;
    }

    case 'musculoskeletal': {
      // Sagittal Knee Joint Multi-Planar MRI
      ctx.fillStyle = '#040711';
      ctx.fillRect(0, 0, w, h);

      // Distal Femur Condyle
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(cx - 25, cy - 95, 95, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Proximal Tibia Plateau
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(cx - 15, cy + 120, 115, 80, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Patella & Patellar Tendon
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(cx + 105, cy - 85, 28, 48, 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx + 105, cy - 40);
      ctx.lineTo(cx + 70, cy + 85);
      ctx.stroke();

      // Posterior Cruciate Ligament (PCL - Intact Smooth Black Curve)
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy - 35);
      ctx.quadraticCurveTo(cx - 5, cy + 15, cx + 30, cy + 55);
      ctx.stroke();

      // Menisci (Black Fibrocartilage Triangles)
      ctx.fillStyle = '#020617';
      // Anterior Horn
      ctx.beginPath();
      ctx.moveTo(cx + 45, cy + 30);
      ctx.lineTo(cx + 75, cy + 55);
      ctx.lineTo(cx + 45, cy + 55);
      ctx.closePath();
      ctx.fill();

      // Posterior Horn
      ctx.beginPath();
      ctx.moveTo(cx - 85, cy + 25);
      ctx.lineTo(cx - 50, cy + 55);
      ctx.lineTo(cx - 85, cy + 55);
      ctx.closePath();
      ctx.fill();

      // Anterior Cruciate Ligament (ACL)
      const isAclTear = !comparisonMode && !activeCase?.isNormal;
      if (isAclTear) {
        // Disrupted fibers & kissing bone contusion
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(cx + 15, cy - 45);
        ctx.lineTo(cx - 5, cy - 25);
        ctx.stroke();

        // Bone marrow edema hyperintensity (Kissing Bruise)
        ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.beginPath();
        ctx.ellipse(cx - 35, cy - 65, 35, 25, 0.4, 0, Math.PI * 2);
        ctx.ellipse(cx - 45, cy + 95, 35, 25, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Complete ACL Tear with Kissing Bone Bruise', cx - 140, cy + 175);
      } else {
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(cx + 25, cy - 45);
        ctx.lineTo(cx - 40, cy + 40);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Intact Striated ACL Fibers', cx - 80, cy + 175);
      }
      break;
    }

    case 'obstetrics': {
      // Fetal Ultrasound B-Mode Transthalamic Head (BPD & HC Plane)
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Acoustic Speckle Texture
      ctx.fillStyle = 'rgba(30, 41, 59, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy - 150, 310, 0.35, Math.PI - 0.35);
      ctx.fill();

      // Elliptical Calvarium (Continuous Bone Echo)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 145, 115, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Midline Falx Cerebri
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 140, cy);
      ctx.lineTo(cx + 140, cy);
      ctx.stroke();

      // Cavum Septi Pellucidi (CSP - Box in anterior 1/3)
      ctx.strokeRect(cx - 20, cy - 14, 40, 28);

      // Paired Thalami Butterflies
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(cx - 18, cy + 14, 18, 14, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 18, cy + 14, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Standard Transthalamic BPD/HC Plane', cx - 110, cy + 140);
      break;
    }

    case 'ophthalmology_ent': {
      // 10-Layer Macular OCT Cross-Section
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Retinal Nerve Fiber Layer (RNFL) with Central Foveal Pit
      const foveaDip = !comparisonMode && !activeCase?.isNormal ? -35 : 30;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, cy - 45);
      ctx.quadraticCurveTo(cx, cy - 45 + foveaDip, w, cy - 45);
      ctx.stroke();

      // Inner & Outer Nuclear Layers
      ctx.fillStyle = 'rgba(14, 165, 233, 0.18)';
      ctx.beginPath();
      ctx.moveTo(0, cy - 45);
      ctx.quadraticCurveTo(cx, cy - 45 + foveaDip, w, cy - 45);
      ctx.lineTo(w, cy + 40);
      ctx.lineTo(0, cy + 40);
      ctx.closePath();
      ctx.fill();

      // Ellipsoid Zone (EZ / Photoreceptors IS/OS)
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, cy + 40);
      ctx.lineTo(w, cy + 40);
      ctx.stroke();

      // Retinal Pigment Epithelium (RPE Hyper-Reflective Band)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(0, cy + 54);
      ctx.lineTo(w, cy + 54);
      ctx.stroke();

      // Choroid with Large Vascular Lumens
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, cy + 58, w, h - (cy + 58));

      // Cystoid Macular Edema (CME Intraretinal Fluid Cavities)
      if (!comparisonMode && !activeCase?.isNormal) {
        ctx.fillStyle = '#020617';
        for (let i = -3; i <= 3; i++) {
          ctx.beginPath();
          ctx.ellipse(cx + i * 32, cy - 10, 14, 18, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Cystoid Macular Edema: Loss of Foveal Depression', cx - 140, cy + 115);
      } else {
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Normal Foveal Contour (CFT 225 μm)', cx - 110, cy + 115);
      }
      break;
    }
  }
}
