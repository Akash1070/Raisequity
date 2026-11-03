import React, { useState } from 'react';
import { ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { db, storage } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';

interface PitchDeckViewerProps {
  companyId: string;
  className?: string;
  children?: React.ReactNode;
}

export default function PitchDeckViewer({ companyId, className = "", children }: PitchDeckViewerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleView = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get the company document to find pitch_deck_url
      const snap = await getDoc(doc(db, 'companies', companyId));
      if (!snap.exists()) throw new Error('Company not found');

      const companyData = snap.data();
      const pitchDeckUrl = companyData?.pitch_deck_url;

      if (!pitchDeckUrl) throw new Error('Pitch deck not found');

      let targetUrl = pitchDeckUrl;

      // If it's a storage path (not already an absolute URL)
      if (!pitchDeckUrl.startsWith('http://') && !pitchDeckUrl.startsWith('https://')) {
        targetUrl = await getDownloadURL(storageRef(storage, pitchDeckUrl));
      }

      // 2. Open in new tab
      const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer');
      if (newWindow) newWindow.opener = null;

    } catch (err: any) {
      console.error('[PitchDeckViewer] Error opening deck:', err);
      setError(err?.message || 'Failed to open pitch deck');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <span className="flex items-center gap-1 text-red-500 text-xs font-bold">
        <AlertCircle size={12} /> {error}
      </span>
    );
  }

  return (
    <button 
      onClick={handleView}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 focus:outline-none cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {isLoading ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
      {children || 'View secure pitch deck'}
    </button>
  );
}
