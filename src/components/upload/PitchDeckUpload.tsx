import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useFounderCompany } from '../../hooks/useFounderCompany';
import PitchDeckViewer from '../PitchDeckViewer';

export default function PitchDeckUpload() {
  const { company, refetch } = useFounderCompany();
  const { uploadPitchDeck, isUploading, progress, error, clearError } = useFileUpload();
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    const path = await uploadPitchDeck(file);
    if (path) {
      await refetch();
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[16px] font-black text-black">Pitch Deck</h3>
          <p className="text-xs text-gray-500 font-medium">Upload your latest PDF deck. Max 20MB.</p>
        </div>
        {(company as any)?.pitch_deck_url && !isUploading && (
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-clay-matcha-dark)] bg-[var(--color-clay-matcha)]/10 px-3 py-1 rounded-full border border-[var(--color-clay-matcha)]/20 flex items-center gap-1">
            <CheckCircle2 size={12} /> Uploaded
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">{error}</p>
          </div>
          <button onClick={clearError} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      {(company as any)?.pitch_deck_url && !isUploading ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
              <FileText className="text-blue-500" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-black truncate">Pitch Deck Uploaded</p>
              <PitchDeckViewer companyId={company.id} className="text-xs font-bold text-[var(--color-clay-ube)] hover:underline flex items-center gap-1 mt-0.5" />
            </div>
          </div>
          
          <button 
            onClick={() => inputRef.current?.click()}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm"
          >
            Replace Deck
          </button>
        </div>
      ) : (
        <div 
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
            dragActive 
              ? 'border-[var(--color-clay-ube)] bg-[var(--color-clay-ube)]/5' 
              : isUploading 
                ? 'border-gray-200 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
          }`}
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => !isUploading && inputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="animate-spin text-[var(--color-clay-ube)]" size={32} />
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>Uploading securely...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-[var(--color-clay-ube)] h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-2">
                <UploadCloud className="text-gray-400" size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-black">
                  Click to upload <span className="font-medium text-gray-500">or drag and drop</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF ONLY</p>
              </div>
            </div>
          )}
          
          <input 
            ref={inputRef}
            type="file" 
            accept="application/pdf" 
            className="hidden" 
            onChange={onChange}
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  );
}
