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
  { value: 'raising', label: '#raising', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { value: 'hiring', label: '#hiring', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { value: 'grant', label: '#grant', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { value: 'partnership', label: '#partnership', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { value: 'serviceneeded', label: '#serviceneeded', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  { value: 'update', label: '#update', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30' },
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
      if (file.size > 10 * 1024 * 1024) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 text-slate-900 dark:text-white shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-500">
            <Sparkles size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              New Community Broadcast
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5 font-mono">
              <Coins size={13} className="text-emerald-500" />
              Friction Cost: 1 Credit (Balance: {userCredits} Credits)
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Post Headline / Title <span className="text-emerald-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Raising $1.5M Seed for AI Infrastructure / Offering $50k Audit Credits"
              required
              className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-white/10 focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors font-sans"
            />
          </div>

          {/* Tag Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Select Tag Category <span className="text-emerald-500">*</span>
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
                      : 'bg-slate-50 dark:bg-[#18191e] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Broadcast Message &amp; Ask <span className="text-emerald-500">*</span>
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your round, traction, milestone update, or what you are looking for..."
              required
              className="w-full bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-white/10 focus:border-emerald-500 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors leading-relaxed font-sans"
            />
          </div>

          {/* Pitch Deck Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Attach Pitch Deck / One-Pager (Optional PDF)
            </label>
            <div className="bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <FileText size={18} />
                </div>
                <div className="text-xs font-mono">
                  <div className="text-slate-900 dark:text-white font-bold">{pdfFile ? pdfFile.name : 'No file selected'}</div>
                  <div className="text-slate-400 text-[11px]">PDF format up to 10MB</div>
                </div>
              </div>
              <label className="bg-black hover:bg-neutral-800 dark:bg-white dark:text-black text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs font-mono">
                <Upload size={14} /> Upload PDF
                <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2 font-mono">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || userCredits < 1}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-xs font-mono"
          >
            {isSubmitting ? (
              <span className="text-xs">Publishing Broadcast (1 Credit)...</span>
            ) : (
              <>
                <Coins size={16} className="text-black" /> Post Broadcast (1 Credit)
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
