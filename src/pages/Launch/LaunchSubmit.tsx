import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Globe,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  MessageSquare,
  ShieldCheck,
  Zap,
  Star,
  Loader2,
  DollarSign,
  Coins,
  Check,
  Calendar as CalendarIcon,
  Lock,
  Copy,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { scrapeWebsiteMetadata, verifyBacklink } from '../../lib/metadataScraper';
import { createLaunch } from '../../lib/launches';
import { spendCredits, getCreditBalance } from '../../lib/credits';
import { LaunchTier } from '../../types/launch';
import { BorderBeam } from '../../components/ui/BorderBeam';

const CATEGORIES = [
  'Web3',
  'AI',
  'SaaS',
  'Infrastructure',
];

const LAUNCH_WEEKS = [
  { label: 'Mon 24 Aug', note: 'YOUR WEEK', status: 'selected' },
  { label: 'Mon 31 Aug', note: 'FREE ONLY', status: 'open' },
  { label: 'Mon 7 Sep', note: 'OPEN', status: 'open' },
  { label: 'Mon 14 Sep', note: 'OPEN', status: 'open' },
  { label: 'Mon 21 Sep', note: 'OPEN', status: 'open' },
  { label: 'Mon 28 Sep', note: 'OPEN', status: 'open' },
  { label: 'Mon 5 Oct', note: 'OPEN', status: 'open' },
  { label: 'Mon 12 Oct', note: 'OPEN', status: 'open' },
];

export default function LaunchSubmit() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const uid = user?.uid || (user as any)?.id;

  const [step, setStep] = useState<1 | 2>(1);
  const [autofilling, setAutofilling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credits'>('cash');

  // Backlink Verification State
  const [showBacklinkModal, setShowBacklinkModal] = useState(false);
  const [badgeTheme, setBadgeTheme] = useState<'light' | 'dark'>('dark');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isVerifyingBacklink, setIsVerifyingBacklink] = useState(false);
  const [backlinkVerified, setBacklinkVerified] = useState(false);
  const [backlinkReason, setBacklinkReason] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    website_url: '',
    company_name: '',
    tagline: '',
    description: '',
    logo_url: '',
    screenshots: ['', ''],
    category: 'Web3',
    twitter_handle: '',
    maker_comment: '',
    launch_tier: 'premium' as LaunchTier,
    scheduled_date: 'Mon 24 Aug',
    target_keywords: '',
  });

  useEffect(() => {
    async function loadUserCredits() {
      if (uid) {
        try {
          const bal = await getCreditBalance(uid);
          setUserCredits(bal);
        } catch (err) {
          console.error('Error fetching credits:', err);
        }
      }
    }
    loadUserCredits();
  }, [uid]);

  const update = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTaglineChange = (text: string) => {
    let clean = text.replace(/[.]+$/, '');
    if (clean.length > 70) clean = clean.substring(0, 70);
    update('tagline', clean);
  };

  const handleScreenshotChange = (idx: number, val: string) => {
    const arr = [...formData.screenshots];
    arr[idx] = val;
    update('screenshots', arr);
  };

  const handleAutofill = async () => {
    if (!formData.website_url) {
      setError('Please enter a website URL first.');
      return;
    }
    setError(null);
    setAutofilling(true);
    try {
      const meta = await scrapeWebsiteMetadata(formData.website_url);
      setFormData((prev) => ({
        ...prev,
        company_name: meta.name || prev.company_name,
        tagline: meta.tagline ? meta.tagline.substring(0, 68).replace(/[.]+$/, '') : prev.tagline,
        description: meta.description || prev.description,
        logo_url: meta.logo_url || meta.og_image || prev.logo_url,
      }));
    } catch (err: any) {
      setError('Could not auto-fetch metadata. Please fill manually.');
    } finally {
      setAutofilling(false);
    }
  };

  const handleNextStep = () => {
    if (!formData.website_url || !formData.company_name || !formData.tagline || !formData.description) {
      setError('Please fill in all required fields (Website, Name, Tagline, Description).');
      return;
    }
    setError(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVerifyBacklink = async () => {
    if (!formData.website_url) return;
    setIsVerifyingBacklink(true);
    setBacklinkReason(null);

    try {
      const res = await verifyBacklink(formData.website_url);
      if (res.verified) {
        setBacklinkVerified(true);
        setBacklinkReason("Backlink verified successfully! Ready to launch.");
      } else {
        setBacklinkVerified(false);
        setBacklinkReason(res.reason || "Could not detect a link to raisequity.com on your website.");
      }
    } catch (err: any) {
      setBacklinkVerified(true);
    } finally {
      setIsVerifyingBacklink(false);
    }
  };

  const getBadgeCode = () => {
    const slug = formData.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'my-project';
    return `<a href="https://raisequity.com/launch/${slug}" target="_blank" rel="noopener">\n  <img src="https://raisequity.com/badges/raisequity-badge-${badgeTheme}.svg" alt="Featured on Raisequity Directory" width="265" height="58" />\n</a>`;
  };

  const copyBadgeCode = () => {
    navigator.clipboard.writeText(getBadgeCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleStartSubmit = () => {
    if (formData.launch_tier === 'standard' && !backlinkVerified) {
      setShowBacklinkModal(true);
      return;
    }
    executeLaunchSubmission();
  };

  const executeLaunchSubmission = async () => {
    if (!uid) {
      navigate('/login?redirect=/launch/submit');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const tierCreditCosts = {
      standard: 0,
      premium: 110,
      spotlight: 390,
    };

    const requiredCredits = tierCreditCosts[formData.launch_tier];

    if (paymentMethod === 'credits' && requiredCredits > 0) {
      const creditRes = await spendCredits(
        uid,
        'warm_intro_request' as any,
        requiredCredits,
        'discretionary_addon',
        { action: `launch_${formData.launch_tier}_tier` }
      );
      if (!creditRes.success) {
        setError(creditRes.error || `Insufficient credit balance for ${formData.launch_tier} tier (Requires ${requiredCredits} credits).`);
        setIsSubmitting(false);
        return;
      }
    }

    const founderName = profile?.full_name || user?.displayName || 'Founder';
    const keywords = formData.target_keywords
      ? formData.target_keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [];

    const res = await createLaunch(uid, founderName, {
      ...formData,
      target_keywords: keywords,
      screenshots: formData.screenshots.filter((s) => s.trim() !== ''),
    });

    setIsSubmitting(false);
    setShowBacklinkModal(false);

    if (res.success && res.launch) {
      navigate(`/launch/${res.launch.slug}`, { replace: true });
    } else {
      setError(res.error || 'Failed to submit launch. Please try again.');
    }
  };

  const inputCls =
    'w-full bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-200 dark:border-[#262626] rounded-2xl px-4 py-3.5 text-xs font-mono font-bold text-[#171717] dark:text-white focus:ring-1 focus:ring-[#0070F3] focus:border-[#0070F3] outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-xs';
  const labelCls = 'block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5 tracking-wider';

  if (!uid) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#000000] flex items-center justify-center p-4">
        <div className="bg-[#FAFAFA] dark:bg-[#111111] border border-slate-200 dark:border-slate-200 dark:border-[#262626] rounded-[32px] p-8 max-w-md text-center space-y-4 shadow-xl text-[#171717] dark:text-white">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
            <Lock size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-[#171717] dark:text-white">Login Required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            You must be logged in as a founder or creator to submit a product launch.
          </p>
          <Link
            to="/login?redirect=/launch/submit"
            className="block w-full py-3.5 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-full font-bold text-xs shadow-sm transition-all font-mono"
          >
            Sign In / Register →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] py-8 px-4 sm:px-6 font-sans pb-28 text-[#171717] dark:text-[#EDEDED] relative overflow-hidden transition-colors duration-150">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/launch"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={16} /> Back to Directory
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono font-bold bg-[#111111] text-emerald-400 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#262626] shadow-md">
            <Coins size={14} className="text-[#00F5A0]" /> Your Credits: <span className="font-extrabold text-white">{userCredits}</span>
          </div>
        </div>

        {/* Header Title & Stepper */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[11px] font-mono font-bold text-[#00F5A0] uppercase tracking-widest block mb-1">
            SUBMIT A PRODUCT
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Two steps, about a minute
          </h1>

          <div className="flex items-center justify-center gap-3 mt-4">
            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                step === 1 ? 'bg-[#00F5A0] text-black' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">1</span>
              <span>Product</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                step === 2 ? 'bg-[#00F5A0] text-black' : 'bg-slate-800 text-slate-500'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">2</span>
              <span>Launch</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold rounded-2xl mb-6 flex items-center justify-between max-w-2xl mx-auto">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-200 font-black cursor-pointer">✕</button>
          </div>
        )}

        {/* ──────────────── STEP 1: Product Form ──────────────── */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto space-y-6 text-white"
          >
            <div className="border-b border-slate-200 dark:border-[#262626] pb-4">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                STEP 1 OF 2 — YOUR PRODUCT
              </h2>
            </div>

            <div>
              <label className={labelCls}>Website *</label>
              <div className="flex gap-2.5">
                <div className="relative flex-1">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    className={`${inputCls} pl-10`}
                    placeholder="https://yourproject.com"
                    value={formData.website_url}
                    onChange={(e) => update('website_url', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAutofill}
                  disabled={autofilling}
                  className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {autofilling ? <Loader2 size={14} className="animate-spin text-[#00F5A0]" /> : <Sparkles size={14} className="text-[#00F5A0]" />}
                  <span>{autofilling ? 'Fetching...' : 'Autofill from site'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className={labelCls}>Product name *</label>
              <input
                className={inputCls}
                placeholder="e.g. Raisequity"
                value={formData.company_name}
                onChange={(e) => update('company_name', e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={labelCls}>Tagline * (One sentence, no full stop)</label>
                <span className="text-[10px] font-mono text-slate-500">{formData.tagline.length}/70</span>
              </div>
              <input
                className={inputCls}
                placeholder="e.g. Institutional foundation and directory for verified Web3 startups"
                value={formData.tagline}
                onChange={(e) => handleTaglineChange(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={labelCls}>Description * (What it does and who it is for)</label>
                <span className="text-[10px] font-mono text-slate-500">{formData.description.length}/600</span>
              </div>
              <textarea
                className={`${inputCls} h-28 resize-none`}
                placeholder="What it does and who it is for..."
                value={formData.description}
                onChange={(e) => update('description', e.target.value.substring(0, 600))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Logo (512 × 512 px)</label>
                <input
                  className={inputCls}
                  placeholder="https://yourproject.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) => update('logo_url', e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Screenshots (Optional)</label>
                <input
                  className={inputCls}
                  placeholder="https://yourproject.com/screenshot.jpg"
                  value={formData.screenshots[0]}
                  onChange={(e) => handleScreenshotChange(0, e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Category *</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => update('category', cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                      formData.category === cat
                        ? 'bg-[#00F5A0] text-black border-[#00F5A0] shadow-[0_0_15px_rgba(0,245,160,0.3)]'
                        : 'bg-black/60 text-slate-300 border-slate-200 dark:border-[#262626] hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Social handle (Optional)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">@</span>
                <input
                  className={`${inputCls} pl-8`}
                  placeholder="yourhandle"
                  value={formData.twitter_handle}
                  onChange={(e) => update('twitter_handle', e.target.value.replace(/^@/, ''))}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Shown on your listing so check-writers can contact you.</p>
            </div>

            <div>
              <label className={labelCls}>Your first comment (Optional)</label>
              <textarea
                className={`${inputCls} h-24 resize-none`}
                placeholder="Tell the community why you built this, what to try first, and what feedback you want..."
                value={formData.maker_comment}
                onChange={(e) => update('maker_comment', e.target.value)}
              />
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                This becomes the first comment on your launch, pinned at the top.
              </p>
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full py-3.5 bg-[#00F5A0] hover:bg-[#00D68B] text-black rounded-xl font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(0,245,160,0.25)] cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              Choose your launch <ArrowRight size={15} />
            </button>
          </motion.div>
        )}

        {/* ──────────────── STEP 2: Plan & Launch Selection ──────────────── */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

            <div className="bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-2xl p-4 max-w-md mx-auto flex items-center justify-between shadow-xl">
              <span className="text-xs font-mono font-bold text-slate-300">Payment Option:</span>
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-slate-200 dark:border-[#262626]">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    paymentMethod === 'cash' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  💵 Direct Pay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credits')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    paymentMethod === 'credits' ? 'bg-[#00F5A0] text-black' : 'text-slate-400'
                  }`}
                >
                  🪙 Platform Credits
                </button>
              </div>
            </div>

            {/* 3 PLAN TIERS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Standard ($0 Free Forever) */}
              <div
                onClick={() => update('launch_tier', 'standard')}
                className={`bg-[#111111] rounded-3xl border-2 p-6 flex flex-col justify-between transition-all cursor-pointer shadow-xl relative ${
                  formData.launch_tier === 'standard'
                    ? 'border-[#00F5A0] ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-[#262626] hover:border-slate-700'
                }`}
              >
                <div>
                  <h3 className="text-lg font-extrabold text-white">Standard</h3>
                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-3xl font-extrabold text-white font-mono">$0</span>
                    <span className="text-xs text-slate-400 font-mono">free forever</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6 font-normal">
                    Join the queue, launch on the weekly board, and compete for the win.
                  </p>

                  <ul className="space-y-3 text-xs text-slate-300 font-normal border-t border-slate-200 dark:border-[#262626] pt-6 font-mono">
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-[#00F5A0] shrink-0 mt-0.5" />
                      <span>Launch on weekly board</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-[#00F5A0] shrink-0 mt-0.5" />
                      <span>Community votes and comments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-[#00F5A0] shrink-0 mt-0.5" />
                      <span>Can win weekly badge</span>
                    </li>
                    <li className="flex items-start gap-2 text-amber-300 font-bold bg-amber-500/10 p-2 rounded-xl border border-amber-500/30">
                      <ShieldCheck size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>Requires backlink verification</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => update('launch_tier', 'standard')}
                    className={`w-full py-3 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                      formData.launch_tier === 'standard'
                        ? 'bg-[#00F5A0] text-black border-[#00F5A0]'
                        : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Launch for free →
                  </button>
                </div>
              </div>

              {/* Premium ($11 or 110 Credits) - MOST PICKED */}
              <div
                onClick={() => update('launch_tier', 'premium')}
                className={`bg-gradient-to-b from-[#0A1813] to-[#111111] rounded-3xl border-2 p-6 flex flex-col justify-between transition-all cursor-pointer shadow-xl relative overflow-hidden ${
                  formData.launch_tier === 'premium'
                    ? 'border-[#00F5A0] ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-[#262626] hover:border-slate-700'
                }`}
              >
                <div className="absolute top-0 right-0 bg-[#00F5A0] text-black font-mono font-extrabold text-[9px] uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  MOST PICKED
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-white">Premium</h3>
                  <div className="flex items-baseline gap-1.5 my-2">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {paymentMethod === 'credits' ? '110 Credits' : '$11'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">once, per product</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6 font-normal">
                    Skip the queue, hold the top of the board, and leave with the directory list.
                  </p>

                  <ul className="space-y-3 text-xs text-slate-300 font-normal border-t border-slate-200 dark:border-[#262626] pt-6 font-mono">
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-[#00F5A0] shrink-0 mt-0.5" />
                      <span className="font-extrabold text-white">Skips queue &amp; backlink check</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-[#00F5A0] shrink-0 mt-0.5" />
                      <span>Pinned to top for multiple days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-[#00F5A0] shrink-0 mt-0.5" />
                      <span>High authority backlink</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-[#00F5A0] shrink-0 mt-0.5" />
                      <span>Permanent directory listing</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => update('launch_tier', 'premium')}
                    className="w-full py-3 rounded-xl text-xs font-mono font-bold transition-all bg-[#00F5A0] hover:bg-[#00D68B] text-black shadow-md cursor-pointer"
                  >
                    Launch with Premium →
                  </button>
                </div>
              </div>

              {/* Spotlight ($39 or 390 Credits) */}
              <div
                onClick={() => update('launch_tier', 'spotlight')}
                className={`bg-gradient-to-b from-[#140E22] to-[#111111] rounded-3xl border-2 p-6 flex flex-col justify-between transition-all cursor-pointer shadow-xl relative ${
                  formData.launch_tier === 'spotlight'
                    ? 'border-purple-500 ring-2 ring-purple-500/30'
                    : 'border-slate-200 dark:border-[#262626] hover:border-slate-700'
                }`}
              >
                <div>
                  <h3 className="text-lg font-extrabold text-white">Spotlight</h3>
                  <div className="flex items-baseline gap-1.5 my-2">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {paymentMethod === 'credits' ? '390 Credits' : '$39'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">once, per product</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6 font-normal">
                    Everything in Premium, plus a dedicated review written to rank on Google.
                  </p>

                  <ul className="space-y-3 text-xs text-slate-300 font-normal border-t border-slate-200 dark:border-[#262626] pt-6 font-mono">
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-purple-400 shrink-0 mt-0.5" />
                      <span className="font-extrabold text-white">Everything in Premium</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-purple-400 shrink-0 mt-0.5" />
                      <span>Hand-written SEO review</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-purple-400 shrink-0 mt-0.5" />
                      <span>Written around your keywords</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-purple-400 shrink-0 mt-0.5" />
                      <span>Optimized for AI &amp; Google</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => update('launch_tier', 'spotlight')}
                    className="w-full py-3 rounded-xl text-xs font-mono font-bold transition-all bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                  >
                    Launch with Spotlight →
                  </button>
                </div>
              </div>

            </div>

            {/* Target keywords input */}
            {formData.launch_tier === 'spotlight' && (
              <div className="bg-[#111111] border border-purple-500/40 rounded-3xl p-6 max-w-2xl mx-auto space-y-3">
                <label className={labelCls}>Target Keywords for SEO Review (Comma separated)</label>
                <input
                  className={inputCls}
                  placeholder="e.g. web3 launch directory, yield aggregator, dev tools"
                  value={formData.target_keywords}
                  onChange={(e) => update('target_keywords', e.target.value)}
                />
              </div>
            )}

            {/* LAUNCH WEEK DATE SELECTOR GRID */}
            <div className="bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#262626] pb-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <CalendarIcon size={14} className="text-[#00F5A0]" /> LAUNCH WEEK CALENDAR
                </h4>
                <span className="text-[11px] font-mono text-slate-400">Next 8 weeks</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {LAUNCH_WEEKS.map((w) => {
                  const isSelected = formData.scheduled_date === w.label;
                  return (
                    <button
                      key={w.label}
                      type="button"
                      onClick={() => update('scheduled_date', w.label)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-mono ${
                        isSelected
                          ? 'border-[#00F5A0] bg-emerald-500/10 text-[#00F5A0] font-bold shadow-[0_0_12px_rgba(0,245,160,0.15)]'
                          : 'border-slate-200 dark:border-[#262626] hover:border-slate-700 text-slate-300 bg-black/40'
                      }`}
                    >
                      <span className="block text-xs font-bold">{w.label}</span>
                      <span className="text-[9px] font-mono uppercase text-slate-500 mt-0.5 block">
                        {w.note}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTION FOOTER BAR */}
            <div className="bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
              <div>
                <span className="text-xs font-mono text-slate-400 block">Selected Plan:</span>
                <div className="text-sm font-extrabold text-white capitalize flex items-center gap-2">
                  <span>{formData.launch_tier} Tier</span>
                  <span className="text-xs font-mono text-slate-400">• {formData.scheduled_date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 bg-slate-800 text-slate-300 rounded-xl font-mono font-bold text-xs hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleStartSubmit}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-6 py-3.5 bg-[#00F5A0] hover:bg-[#00D68B] text-black rounded-xl font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(0,245,160,0.25)] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin text-black" />
                  ) : (
                    <Rocket size={16} />
                  )}
                  <span>
                    {isSubmitting
                      ? 'Publishing...'
                      : formData.launch_tier === 'standard'
                      ? 'Verify Backlink & Launch →'
                      : paymentMethod === 'credits'
                      ? `Redeem ${formData.launch_tier === 'premium' ? 110 : 390} Credits & launch →`
                      : `Pay ${formData.launch_tier === 'premium' ? '$11' : '$39'} and launch →`}
                  </span>
                </button>
              </div>
            </div>

          </motion.div>
        )}

        {/* ──────────────── BACKLINK VERIFICATION MODAL ──────────────── */}
        <AnimatePresence>
          {showBacklinkModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 sm:p-8 max-w-xl w-full my-8 shadow-2xl relative space-y-6 text-white"
              >
                <button
                  onClick={() => setShowBacklinkModal(false)}
                  className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>

                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 mb-3">
                    <ShieldCheck size={14} /> Backlink Verification Required
                  </div>
                  <h3 className="text-xl font-extrabold text-white">
                    Add a link to Raisequity on your website
                  </h3>
                  <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                    For free launches, you need to add a link to Raisequity Directory on your website before your project can be scheduled.
                  </p>
                </div>

                <div className="bg-black/60 border border-slate-200 dark:border-[#262626] rounded-2xl p-4 space-y-2 text-xs font-normal text-slate-300">
                  <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] mb-2 font-mono">
                    Steps:
                  </p>
                  <ol className="space-y-2 list-decimal list-inside font-mono">
                    <li>Copy the badge code below (or add any link to raisequity.com)</li>
                    <li>Add it to your website footer or home page on <span className="font-bold text-white">{formData.website_url || 'your site'}</span></li>
                    <li>Click <strong className="text-white font-extrabold">"Verify Backlink"</strong> to check if it's detected</li>
                    <li>Once verified, your launch is instantly scheduled</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">Badge Code</span>
                  </div>

                  <div className="relative">
                    <pre className="bg-black text-[#00F5A0] p-4 rounded-2xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-200 dark:border-[#262626]">
                      {getBadgeCode()}
                    </pre>
                    <button
                      type="button"
                      onClick={copyBadgeCode}
                      className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedCode ? <Check size={14} className="text-[#00F5A0]" /> : <Copy size={14} />}
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-[#262626] pt-5 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Website URL:</span>
                    <span className="text-white underline">{formData.website_url}</span>
                  </div>

                  {backlinkReason && (
                    <div className={`p-3.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 ${
                      backlinkVerified ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}>
                      {backlinkVerified ? <CheckCircle2 size={16} className="text-[#00F5A0] shrink-0" /> : <AlertCircle size={16} className="text-amber-400 shrink-0" />}
                      <span>{backlinkReason}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleVerifyBacklink}
                      disabled={isVerifyingBacklink}
                      className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-mono font-bold text-xs transition-all shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingBacklink ? <Loader2 size={16} className="animate-spin text-[#00F5A0]" /> : <ShieldCheck size={16} />}
                      <span>{isVerifyingBacklink ? 'Scanning Website...' : 'Verify Backlink'}</span>
                    </button>

                    {backlinkVerified && (
                      <button
                        type="button"
                        onClick={executeLaunchSubmission}
                        disabled={isSubmitting}
                        className="flex-1 py-3.5 bg-[#00F5A0] hover:bg-[#00D68B] text-black rounded-xl font-extrabold text-xs transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin text-black" /> : <Rocket size={16} />}
                        <span>Complete Launch →</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Skip option */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl text-center text-xs font-mono text-emerald-300">
                  <span>Want to skip backlink verification? </span>
                  <button
                    type="button"
                    onClick={() => {
                      update('launch_tier', 'premium');
                      setShowBacklinkModal(false);
                    }}
                    className="text-[#00F5A0] font-extrabold underline cursor-pointer ml-1"
                  >
                    Upgrade to Premium ($11) →
                  </button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
