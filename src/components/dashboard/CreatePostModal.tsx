import React, { useState } from 'react';
import { X, Upload, Coins, Tag, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { createFeedPost, uploadPitchDeckPdf, PostTag } from '../../lib/posts';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorRole: string;
  userCredits: number;
}

const TAG_OPTIONS: { value: PostTag; label: string; color: string }[] = [
  { value: 'raising', label: '#raising', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'hiring', label: '#hiring', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'grant', label: '#grant', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'partnership', label: '#partnership', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'serviceneeded', label: '#serviceneeded', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: 'update', label: '#update', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export default function CreatePostModal({
  isOpen,
  onClose,
  onSuccess,
  authorId,
  authorName,
  authorEmail,
  authorRole,
  userCredits,
}: CreatePostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<PostTag>('update');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setErrorMsg('Only PDF pitch deck files are supported.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrorMsg('Pitch deck file size must be under 10MB.');
        return;
      }
      setPdfFile(file);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Post title is required.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('Post content is required.');
      return;
    }
    if (userCredits < 1) {
      setErrorMsg('Posting costs 1 credit. Your current balance is 0. Please earn or top up credits.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let pitchDeckUrl: string | undefined = undefined;
      let pitchDeckName: string | undefined = undefined;

      if (pdfFile) {
        pitchDeckUrl = await uploadPitchDeckPdf(pdfFile, authorId);
        pitchDeckName = pdfFile.name;
      }

      const res = await createFeedPost(
        authorId,
        authorName,
        authorEmail,
        authorRole,
        title.trim(),
        content.trim(),
        selectedTag,
        pitchDeckUrl,
        pitchDeckName
      );

      setIsSubmitting(false);

      if (res.success) {
        onSuccess();
        onClose();
        // Reset form
        setTitle('');
        setContent('');
        setSelectedTag('update');
        setPdfFile(null);
      } else {
        setErrorMsg(res.error || 'Failed to create post.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl max-w-xl w-full p-6 sm:p-8 text-slate-900 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center justify-center text-emerald-600">
            <Sparkles size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Create Community Post</h2>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
              <Coins size={13} className="text-emerald-600" />
              Friction Cost: 1 Credit (Balance: {userCredits} Credits)
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Post Headline / Title <span className="text-emerald-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Raising $500k Seed for AI DePIN Protocol"
              required
              className="w-full bg-slate-50 border border-slate-200/80 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none transition-colors"
            />
          </div>

          {/* Tag Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Tag Category <span className="text-emerald-600">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button
                  type="button"
                  key={tag.value}
                  onClick={() => setSelectedTag(tag.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
                    selectedTag === tag.value
                      ? `${tag.color} ring-2 ring-emerald-500/30`
                      : 'bg-slate-50 border-slate-200/80 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Post Content & Details <span className="text-emerald-600">*</span>
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your traction, ask, hiring needs, or partnership details..."
              required
              className="w-full bg-slate-50 border border-slate-200/80 focus:border-emerald-500 rounded-xl p-4 text-sm text-slate-900 focus:outline-none transition-colors leading-relaxed"
            />
          </div>

          {/* Pitch Deck Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Attach Pitch Deck (Optional PDF)
            </label>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200/60 flex items-center justify-center text-slate-600">
                  <FileText size={18} />
                </div>
                <div className="text-xs">
                  <div className="text-slate-900 font-bold">{pdfFile ? pdfFile.name : 'No file selected'}</div>
                  <div className="text-slate-400 text-[11px]">PDF format up to 10MB</div>
                </div>
              </div>
              <label className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs">
                <Upload size={14} /> Upload PDF
                <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || userCredits < 1}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-xs"
          >
            {isSubmitting ? (
              <span className="text-xs">Publishing Post & Deducting 1 Credit...</span>
            ) : (
              <>
                <Coins size={16} className="text-amber-400" /> Post Update (Cost: 1 Credit)
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
