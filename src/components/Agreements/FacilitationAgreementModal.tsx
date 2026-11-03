import React, { useState, useRef } from 'react';
import { ShieldCheck, FileText, CheckCircle2, Lock, X } from 'lucide-react';
import { signNativeFacilitationAgreement } from '../../lib/agreements';

interface FacilitationAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  introRequestId: string;
  signerId: string;
  signerName: string;
  signerEmail: string;
  signerRole: 'founder' | 'investor';
  counterpartyName: string;
  dealRef: string;
}

export default function FacilitationAgreementModal({
  isOpen,
  onClose,
  onSuccess,
  introRequestId,
  signerId,
  signerName,
  signerEmail,
  signerRole,
  counterpartyName,
  dealRef,
}: FacilitationAgreementModalProps) {
  const [legalName, setLegalName] = useState(signerName || '');
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  if (!isOpen) return null;

  // Canvas signature handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#10B981'; // Emerald 500

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHasDrawn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!isChecked) {
      setErrorMsg('You must check the box to confirm agreement.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    let signatureDataUrl: string | undefined = undefined;
    if (canvasRef.current && hasDrawn) {
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    }

    const res = await signNativeFacilitationAgreement({
      introRequestId,
      signerId,
      signerName,
      signerEmail,
      signerRole,
      counterpartyName,
      dealRef,
      printedLegalName: legalName,
      signatureDataUrl,
    });

    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg('Failed to record signature. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#161920] border border-gray-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-white shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Warm Intro Facilitation Agreement</h2>
            <p className="text-xs text-gray-400 font-mono">Reference: {dealRef}</p>
          </div>
        </div>

        {/* Agreement Legal Text Box */}
        <div className="bg-[#0D0F12] border border-gray-800 rounded-2xl p-5 mb-6 max-h-56 overflow-y-auto text-xs text-gray-300 space-y-3 font-sans leading-relaxed">
          <p className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
            Raisequity Facilitation Terms & Condition Agreement
          </p>
          <p>
            This Facilitation Agreement ("Agreement") is made between <strong>{signerName}</strong> ("{signerRole.toUpperCase()}") and <strong>Raisequity Protocol Network</strong> regarding the warm intro facilitation to <strong>{counterpartyName}</strong> ("{dealRef}").
          </p>
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl space-y-1 text-emerald-200">
            <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 size={14} /> Key Financial Summary:
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] pl-1">
              <li><strong>Success Fee</strong>: 5% fee on closed deal capital/grants.</li>
              <li><strong>1st Deal Waiver</strong>: 100% waived for your first closed deal!</li>
              <li><strong>Credit Offset Cap</strong>: Up to 30% of fees can be offset with earned platform credits.</li>
              <li><strong>Zero Upfront Fee</strong>: Direct contact details unlocked immediately upon signature.</li>
            </ul>
          </div>
          <p>
            By executing this agreement, you acknowledge that Raisequity acts strictly as a facilitator connecting verified founders with institutional investors and service experts.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Legal Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Full Legal Name <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="e.g. Jane Doe"
              required
              className="w-full bg-[#0D0F12] border border-gray-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          {/* Signature Canvas */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Digital Signature (Draw below or Type Name above)
              </label>
              {hasDrawn && (
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[11px] text-gray-400 hover:text-red-400 underline"
                >
                  Clear Signature
                </button>
              )}
            </div>
            <div className="bg-[#0D0F12] border border-gray-800 rounded-xl p-2 flex justify-center">
              <canvas
                ref={canvasRef}
                width={500}
                height={100}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className="w-full h-24 cursor-crosshair rounded-lg bg-[#161920]/50"
              />
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-start gap-3 bg-[#0D0F12] border border-gray-800/80 p-4 rounded-xl">
            <input
              type="checkbox"
              id="agree-check"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
            />
            <label htmlFor="agree-check" className="text-xs text-gray-300 leading-relaxed cursor-pointer">
              I certify that I am authorized to sign this agreement. I agree to the <span className="text-emerald-400 font-semibold">Raisequity 5% Facilitation Terms</span> and consent to electronic signature under the U.S. ESIGN Act.
            </label>
          </div>

          {errorMsg && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isChecked}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {isSubmitting ? (
              <span className="text-sm">Recording Legal E-Signature...</span>
            ) : (
              <>
                <Lock size={16} /> Sign & Reveal Contact Details
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
