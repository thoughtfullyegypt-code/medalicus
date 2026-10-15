import React from 'react';
import { Layers, Eye, RefreshCw, Crosshair, User, Compass } from 'lucide-react';
import { OrganSystemId } from '../types';

export interface LayerVisibility {
  bodySkin: boolean;
  bodySkinOpacity: number;
  surfaceLandmarks: boolean;
  heartChambers: boolean;
  heartOpacity: number;
  aorta: boolean;
  ribsAndSpine: boolean;
  beamCone: boolean;
  vesselLabels: boolean;
  catheter: boolean;
}

interface LayerControlsProps {
  systemId?: OrganSystemId;
  layers: LayerVisibility;
  onChangeLayers: (newLayers: LayerVisibility) => void;
  systemLayers?: Record<string, boolean>;
  onToggleSystemLayer?: (layerKey: string) => void;
  organOpacity?: number;
  onChangeOrganOpacity?: (val: number) => void;
  bodySkinOpacity?: number;
  onChangeBodySkinOpacity?: (val: number) => void;
  onSetCameraPreset?: (preset: 'axial' | 'coronal' | 'sagittal' | '3d') => void;
  onResetObserver: () => void;
  onAlignToBeamAxis: () => void;
}

interface SystemConfig {
  title: string;
  bodyLabel: string;
  organLabel: string;
  layers: Array<{ key: string; label: string; defaultOn: boolean }>;
  presets: Array<{ label: string; preset: 'axial' | 'coronal' | 'sagittal' | '3d' }>;
}

const SYSTEM_CONFIGS: Record<OrganSystemId, SystemConfig> = {
  cardiovascular: {
    title: 'Cardiovascular Anatomy & C-Arm Controls',
    bodyLabel: 'Patient Body (Skin Envelope)',
    organLabel: 'Heart Opacity',
    layers: [
      { key: 'surfaceLandmarks', label: 'Surface ICS Marks', defaultOn: true },
      { key: 'heartChambers', label: 'Heart Mass', defaultOn: true },
      { key: 'aorta', label: 'Aorta & Pulm', defaultOn: true },
      { key: 'ribsAndSpine', label: 'Spine & Ribs', defaultOn: false },
      { key: 'beamCone', label: 'X-Ray Beam', defaultOn: true },
      { key: 'catheter', label: 'Catheter', defaultOn: true }
    ],
    presets: [
      { label: '3D Angio', preset: '3d' },
      { label: 'AP 0°', preset: 'coronal' },
      { label: 'Lateral 90°', preset: 'sagittal' }
    ]
  },
  neurology: {
    title: 'Brain & Cranial Skeleton Atlas',
    bodyLabel: 'Body Skin Envelope',
    organLabel: 'Brain Tissue Opacity',
    layers: [
      { key: 'cortex', label: 'Brain (Real Atlas)', defaultOn: true },
      { key: 'skull', label: 'Skull & Cranial Bones', defaultOn: true }
    ],
    presets: [
      { label: 'Axial View', preset: 'axial' },
      { label: 'Coronal View', preset: 'coronal' },
      { label: 'Sagittal View', preset: 'sagittal' },
      { label: '3D Brain', preset: '3d' }
    ]
  },
  pulmonology: {
    title: 'Lung & Thoracic Skeleton Atlas',
    bodyLabel: 'Body Skin Envelope',
    organLabel: 'Lung Tissue Opacity',
    layers: [
      { key: 'lungs', label: 'Lungs (Real Atlas)', defaultOn: true },
      { key: 'skeleton', label: 'Ribs & Thoracic Spine', defaultOn: true }
    ],
    presets: [
      { label: 'Axial View', preset: 'axial' },
      { label: 'Coronal View', preset: 'coronal' },
      { label: 'Sagittal View', preset: 'sagittal' },
      { label: '3D Lungs', preset: '3d' }
    ]
  },
  gastroenterology: {
    title: 'Digestive Organ Atlas',
    bodyLabel: 'Body Skin Envelope',
    organLabel: 'Digestive Organ Opacity',
    layers: [
      { key: 'liver', label: 'Liver, Stomach & Intestines', defaultOn: true },
      { key: 'skeleton', label: 'Ribs & Spine', defaultOn: true }
    ],
    presets: [
      { label: '3D Digestive Organs', preset: '3d' },
      { label: 'Coronal View', preset: 'coronal' },
      { label: 'Axial View', preset: 'axial' },
      { label: 'Side View', preset: 'sagittal' }
    ]
  },
  nephrology: {
    title: 'Renal Organ & Pelvic Bone Atlas',
    bodyLabel: 'Body Skin Envelope',
    organLabel: 'Kidney Tissue Opacity',
    layers: [
      { key: 'kidneys', label: 'Kidneys (Real Atlas)', defaultOn: true },
      { key: 'skeleton', label: 'Lumbar Spine & Pelvis', defaultOn: true }
    ],
    presets: [
      { label: 'Front View', preset: 'coronal' },
      { label: 'Axial View', preset: 'axial' },
      { label: 'Side View', preset: 'sagittal' },
      { label: '3D Kidneys', preset: '3d' }
    ]
  },
  musculoskeletal: {
    title: 'Full Skeleton Anatomy Atlas',
    bodyLabel: 'Body Skin Envelope',
    organLabel: 'Skeleton Opacity',
    layers: [
      { key: 'bones', label: 'Detailed Skeleton (Real Mesh)', defaultOn: true }
    ],
    presets: [
      { label: 'Side View', preset: 'sagittal' },
      { label: 'Front View', preset: 'coronal' },
      { label: 'Axial View', preset: 'axial' },
      { label: '3D Skeleton', preset: '3d' }
    ]
  },
  obstetrics: {
    title: 'Fetal Ultrasound & Gravid Controls',
    bodyLabel: 'Maternal Abdominal Wall',
    organLabel: 'Fetal Phantom Opacity',
    layers: [
      { key: 'primary', label: 'Fetal Skull & Spine', defaultOn: true },
      { key: 'uterus', label: 'Gravid Uterus Wall', defaultOn: true },
      { key: 'slicingPlane', label: 'Ultrasound Plane', defaultOn: true }
    ],
    presets: [
      { label: 'BPD Caliper', preset: 'axial' },
      { label: 'Femur Length', preset: 'coronal' },
      { label: 'Profile', preset: 'sagittal' },
      { label: '3D Gravid', preset: '3d' }
    ]
  },
  ophthalmology_ent: {
    title: 'Ocular Anatomy & OCT Scan Controls',
    bodyLabel: 'Orbital Soft Tissue Envelope',
    organLabel: 'Globe / Sclera Opacity',
    layers: [
      { key: 'primary', label: 'Eyeball, Lens & Retina', defaultOn: true },
      { key: 'orbit', label: 'Bony Orbital Rim', defaultOn: true },
      { key: 'slicingPlane', label: 'OCT Linear Scan Plane', defaultOn: true }
    ],
    presets: [
      { label: 'En-Face Fundus', preset: 'coronal' },
      { label: 'Axial OCT', preset: 'axial' },
      { label: 'Sagittal Globe', preset: 'sagittal' },
      { label: '3D Orbit', preset: '3d' }
    ]
  }
};

export const LayerControls: React.FC<LayerControlsProps> = ({
  systemId = 'cardiovascular',
  layers,
  onChangeLayers,
  systemLayers = {},
  onToggleSystemLayer,
  organOpacity = 42,
  onChangeOrganOpacity,
  bodySkinOpacity,
  onChangeBodySkinOpacity,
  onSetCameraPreset,
  onResetObserver,
  onAlignToBeamAxis
}) => {
  const isCardio = systemId === 'cardiovascular';
  const config = SYSTEM_CONFIGS[systemId] || SYSTEM_CONFIGS.cardiovascular;

  const currentSkinOpacity = bodySkinOpacity !== undefined 
    ? bodySkinOpacity 
    : (layers.bodySkin ? layers.bodySkinOpacity : 0);

  const handleSkinOpacity = (val: number) => {
    if (onChangeBodySkinOpacity) {
      onChangeBodySkinOpacity(val);
    }
    onChangeLayers({
      ...layers,
      bodySkinOpacity: val,
      bodySkin: val > 0
    });
  };

  const handleOrganOpacity = (val: number) => {
    if (onChangeOrganOpacity) {
      onChangeOrganOpacity(val);
    }
    onChangeLayers({
      ...layers,
      heartOpacity: val
    });
  };

  const handleToggleLayer = (key: string) => {
    if (isCardio) {
      const cardioKey = key as keyof Omit<LayerVisibility, 'heartOpacity' | 'bodySkinOpacity'>;
      onChangeLayers({
        ...layers,
        [cardioKey]: !layers[cardioKey]
      });
    } else if (onToggleSystemLayer) {
      onToggleSystemLayer(key);
    }
  };

  const isLayerActive = (key: string, defaultOn: boolean) => {
    if (isCardio) {
      const cardioKey = key as keyof LayerVisibility;
      return Boolean(layers[cardioKey]);
    }
    return systemLayers[key] !== undefined ? systemLayers[key] : defaultOn;
  };

  return (
    <div className="bg-[#0f1724] border border-slate-800 rounded-xl p-3 flex flex-col space-y-2.5 select-none text-xs">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
        <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
          <Layers className="w-3.5 h-3.5 text-teal-400" />
          <span className="truncate max-w-[190px]">{config.title}</span>
        </div>

        {/* 3D Anatomical View Presets */}
        <div className="flex items-center space-x-1">
          {config.presets.map((p) => (
            <button
              key={p.label}
              onClick={() => onSetCameraPreset?.(p.preset)}
              title={`Switch 3D Viewport to ${p.label}`}
              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-teal-300 font-mono transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Surface Anatomy (Body Skin) Slider */}
      <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800 space-y-1.5">
        <div className="flex justify-between items-center text-[11px]">
          <span className="flex items-center space-x-1 text-slate-300 font-medium truncate">
            <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{config.bodyLabel}:</span>
          </span>
          <span className="font-mono text-cyan-300 font-bold bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800 shrink-0 ml-1">
            {currentSkinOpacity > 0 ? `${currentSkinOpacity}%` : 'OFF'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="95"
          step="1"
          value={currentSkinOpacity}
          onChange={e => handleSkinOpacity(parseInt(e.target.value, 10))}
          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0% (Internal)</span>
          <span>Translucent</span>
          <span>95% (Opaque Skin)</span>
        </div>
      </div>

      {/* Dynamic Layer Toggles for the active system */}
      <div className="grid grid-cols-2 gap-1.5">
        {config.layers.map((layer) => {
          const active = isLayerActive(layer.key, layer.defaultOn);
          return (
            <label
              key={layer.key}
              className={`flex items-center space-x-1.5 px-2 py-1 rounded border cursor-pointer transition ${
                active 
                  ? 'bg-teal-950/40 border-teal-800/60 text-teal-300 font-semibold' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => handleToggleLayer(layer.key)}
                className="rounded accent-teal-400 w-3 h-3 shrink-0"
              />
              <span className="text-[11px] truncate">{layer.label}</span>
            </label>
          );
        })}
      </div>

      {/* Primary Organ Tissue Opacity Slider */}
      <div className="flex items-center space-x-2 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
        <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-[11px] text-slate-400 shrink-0 truncate max-w-[140px]">
          {config.organLabel}:
        </span>
        <input
          type="range"
          min="5"
          max="95"
          step="1"
          value={isCardio ? layers.heartOpacity : organOpacity}
          onChange={e => handleOrganOpacity(parseInt(e.target.value, 10))}
          className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded cursor-pointer"
        />
        <span className="text-[11px] font-mono text-slate-300 w-8 text-right shrink-0">
          {isCardio ? layers.heartOpacity : organOpacity}%
        </span>
      </div>

      {/* Observer Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
        <button
          onClick={onResetObserver}
          className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px]"
        >
          <RefreshCw className="w-3 h-3 text-slate-400" />
          <span>Reset 3D View</span>
        </button>

        <button
          onClick={isCardio ? onAlignToBeamAxis : () => onSetCameraPreset?.('axial')}
          className="flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-200 font-medium transition text-[11px]"
        >
          {isCardio ? (
            <>
              <Crosshair className="w-3 h-3 text-teal-400" />
              <span>Align to Beam</span>
            </>
          ) : (
            <>
              <Compass className="w-3 h-3 text-teal-400" />
              <span>Align Axial CT</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
