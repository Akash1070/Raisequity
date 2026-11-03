import React, { useRef, useState } from 'react';
import { Camera, Loader2, Upload, AlertCircle } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useCurrentUser } from '../../hooks/useCurrentUser';

export default function AvatarUpload() {
  const { profile, refetch } = useCurrentUser();
  const { uploadAvatar, isUploading, error, clearError } = useFileUpload();
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    const url = await uploadAvatar(file);
    if (url) {
      await refetch(); // Refresh profile to show new avatar
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
    <div className="flex flex-col items-center sm:items-start gap-4">
      <div 
        className={`relative group rounded-full w-24 h-24 sm:w-32 sm:h-32 border-4 overflow-hidden transition-all duration-200 cursor-pointer ${
          dragActive ? 'border-[var(--color-clay-ube)] scale-105' : 'border-white clay-shadow'
        }`}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        {/* Background Image / Placeholder */}
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-3xl sm:text-4xl text-gray-400 font-bold">
              {profile?.full_name?.charAt(0) || '?'}
            </span>
          </div>
        )}

        {/* Hover / Uploading Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
          isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          {isUploading ? (
            <Loader2 className="text-white animate-spin w-8 h-8" />
          ) : (
            <Camera className="text-white w-8 h-8" />
          )}
        </div>

        <input 
          ref={inputRef}
          type="file" 
          accept="image/jpeg, image/png, image/webp" 
          className="hidden" 
          onChange={onChange}
        />
      </div>

      <div className="text-center sm:text-left">
        <h3 className="text-sm font-bold text-black">Profile Photo</h3>
        <p className="text-xs text-gray-500 mt-1">JPEG, PNG or WebP. Max 2MB.</p>
        {error && (
          <div className="flex items-center gap-1.5 text-red-500 text-xs mt-2 justify-center sm:justify-start">
            <AlertCircle size={14} />
            <span className="font-medium">{error}</span>
            <button onClick={clearError} className="ml-1 underline text-red-400 hover:text-red-600">Dismiss</button>
          </div>
        )}
      </div>
    </div>
  );
}
