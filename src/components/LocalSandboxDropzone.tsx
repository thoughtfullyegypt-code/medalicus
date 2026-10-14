import React, { useState } from 'react';
import { LocalSandboxFile } from '../types';
import { UploadCloud, FileText, CheckCircle2, X, ShieldAlert, Play, Film } from 'lucide-react';

interface LocalSandboxDropzoneProps {
  currentFile: LocalSandboxFile | null;
  onFileLoaded: (file: LocalSandboxFile) => void;
  onClearFile: () => void;
  onClose?: () => void;
}

export const LocalSandboxDropzone: React.FC<LocalSandboxDropzoneProps> = ({
  currentFile,
  onFileLoaded,
  onClearFile,
  onClose
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['.dcm', '.nii', '.nii.gz', '.mp4', '.png', '.jpg', '.jpeg'];
    const nameLower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some(ext => nameLower.endsWith(ext));

    if (!hasValidExt && !file.type.startsWith('video/') && !file.type.startsWith('image/')) {
      setErrorMsg(`Unsupported file type. Please provide a .dcm, .nii.gz, .mp4, or image file.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onFileLoaded({
        name: file.name,
        size: file.size,
        type: file.type || 'application/dicom',
        dataUrl,
        loadedAt: Date.now()
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#0f1724] border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-[#131d2e] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-sm">Zero-Cost Client Sandbox ("Bring Your Own DICOM")</h2>
              <p className="text-[11px] text-slate-400">100% Client-Side In-RAM Processing &bull; 0 MB Bandwidth &bull; Zero Server Upload</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {currentFile ? (
            <div className="bg-slate-900 border border-teal-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{currentFile.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {(currentFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Loaded into Browser RAM
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Active Sandbox</span>
                </div>
              </div>

              {currentFile.dataUrl && currentFile.type.startsWith('video/') && (
                <div className="rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
                  <video
                    src={currentFile.dataUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {currentFile.dataUrl && currentFile.type.startsWith('image/') && (
                <div className="rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
                  <img
                    src={currentFile.dataUrl}
                    alt="Sandbox Scan"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  onClick={onClearFile}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-950/40 transition font-medium"
                >
                  Unload File
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-4 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 transition"
                  >
                    Inspect in Viewport
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-3 transition cursor-pointer ${
                isDragging
                  ? 'border-teal-400 bg-teal-950/30'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
              }`}
              onClick={() => document.getElementById('sandbox-file-input')?.click()}
            >
              <input
                id="sandbox-file-input"
                type="file"
                accept=".dcm,.nii,.nii.gz,.mp4,.png,.jpg,.jpeg,video/*,image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-slate-200 text-sm block">Drag & Drop Clinical File Here</span>
                <span className="text-[11px] text-slate-400">Supports .dcm (DICOM), .nii.gz (NIfTI), .mp4 (Cine loops), and PNG/JPEG</span>
              </div>
              <button
                type="button"
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-medium"
              >
                Browse Local Storage
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">HIPAA & Privacy Guarantee: </span>
            All dropped scans and cine loops are parsed strictly within your browser's private WebAssembly/FileReader memory. Absolutely no patient data, pixels, or headers are ever uploaded to any cloud server or network.
          </div>
        </div>

      </div>
    </div>
  );
};
