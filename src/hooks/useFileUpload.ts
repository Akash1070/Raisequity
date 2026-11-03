import { useState } from 'react';
import { storage, db } from '../lib/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { validateFile } from '../lib/fileValidation';
import { useCurrentUser } from './useCurrentUser';
import { useFounderCompany } from './useFounderCompany';

export function useFileUpload() {
  const { profile } = useCurrentUser();
  const { company } = useFounderCompany();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!profile?.id) {
      setError('You must be logged in to upload an avatar');
      return null;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const validation = await validateFile(file, 'avatar');
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const fileExt = file.name.split('.').pop();
      const path = `avatars/${profile.id}/avatar_${Date.now()}.${fileExt}`;
      const fileRef = storageRef(storage, path);

      const uploadTask = uploadBytesResumable(fileRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(Math.round(p));
          },
          (err) => reject(err),
          () => resolve()
        );
      });

      const publicUrl = await getDownloadURL(fileRef);

      // Update user doc in Firestore
      await updateDoc(doc(db, 'users', profile.id), { avatar_url: publicUrl });

      setProgress(100);
      return publicUrl;
    } catch (err: any) {
      console.error('[useFileUpload] Avatar upload error:', err);
      setError(err?.message || 'Failed to upload avatar');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadPitchDeck = async (file: File): Promise<string | null> => {
    if (!profile?.id) {
      setError('You must be logged in');
      return null;
    }
    
    if (!company?.id) {
      setError('You must create a company profile first');
      return null;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const validation = await validateFile(file, 'pitchdeck');
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const path = `pitch_decks/${profile.id}/deck_${Date.now()}.pdf`;
      const fileRef = storageRef(storage, path);

      const uploadTask = uploadBytesResumable(fileRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(Math.round(p));
          },
          (err) => reject(err),
          () => resolve()
        );
      });

      const downloadUrl = await getDownloadURL(fileRef);

      await updateDoc(doc(db, 'companies', company.id), { pitch_deck_url: downloadUrl });

      setProgress(100);
      return downloadUrl;
    } catch (err: any) {
      console.error('[useFileUpload] Pitch deck upload error:', err);
      setError(err?.message || 'Failed to upload pitch deck');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAvatar,
    uploadPitchDeck,
    isUploading,
    progress,
    error,
    clearError: () => setError(null)
  };
}
