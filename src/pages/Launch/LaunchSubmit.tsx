import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Video,
  Github,
  Send,
  TrendingUp,
  Trash2,
  Plus,
  FileText,
  Layers,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePageMeta } from '../../hooks/usePageMeta';
import { scrapeWebsiteMetadata, verifyBacklink } from '../../lib/metadataScraper';
import { createLaunch } from '../../lib/launches';
import { spendCredits, getCreditBalance } from '../../lib/credits';
import { LaunchTier } from '../../types/launch';

const CATEGORIES = [
  'Web3',
  'AI & Agents',
  'SaaS',
  'Infrastructure',
  'DeFi',
  'Developer Tools',
  'Fintech',
  'Consumer Tech',
  'B2B Enterprise',
  'SocialFi',
  'Gaming & Metaverse',
  'Security & Privacy',
  'Data & Analytics',
  'Open Source',
];

const ECOSYSTEM_CHAINS = [
  'Solana',
  'Ethereum',
  'Base',
  'Arbitrum',
  'Polygon',
  'Bitcoin / L2',
  'Sui & Aptos',
  'AI / LLM Agents',
  'Cross-Chain / Multi-Chain',
  'Web2 Cloud / SaaS'
];

const PRODUCT_STAGES = [
  { id: 'mainnet_live', label: '🟢 Mainnet Live (Production)' },
  { id: 'public_beta', label: '🚀 Public Beta / Open App' },
  { id: 'testnet_alpha', label: '🧪 Testnet / Devnet Alpha' },
  { id: 'waitlist_open', label: '⏳ Waitlist / Private Access' },
];

const TOKEN_STATUSES = [
  { id: 'no_token', label: '🛡️ Equity Only (No Token)' },
  { id: 'token_live', label: '🪙 Token Live (Tradable)' },
  { id: 'planning_tge', label: '📅 Planning TGE Soon' },
  { id: 'saft_open', label: '📝 SAFT / Seed Allocation Open' },
];

const RAISING_STAGES = [
  { id: 'raising_pre_seed', label: '🌱 Raising Pre-Seed', isRaising: true },
  { id: 'raising_seed', label: '🚀 Raising Seed', isRaising: true },
  { id: 'raising_series_a', label: '📈 Raising Series A+', isRaising: true },
  { id: 'token_saft', label: '🪙 Token / SAFT Round', isRaising: true },
  { id: 'bootstrapped', label: '💰 Bootstrapped & Profitable', isRaising: false },
  { id: 'not_raising', label: '🛠️ Product Launch Only (Not Raising)', isRaising: false },
];

function getUpcomingWeeks(count = 8) {
  const weeks = [];
  const now = new Date();
  const currentDay = now.getDay();
  const distanceToMonday = (8 - currentDay) % 7;
  const firstMonday = new Date(now);
  firstMonday.setDate(now.getDate() + distanceToMonday);

  for (let i = 0; i < count; i++) {
    const m = new Date(firstMonday);
    m.setDate(firstMonday.getDate() + i * 7);
    const label = m.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    weeks.push({
      label,
      note: i === 0 ? 'THIS WEEK (LIVE)' : i === 1 ? 'FAST-PASS' : 'OPEN',
      status: i === 0 ? 'selected' : 'open',
    });
  }
  return weeks;
}

export default function LaunchSubmit() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  usePageMeta({
    title: "Submit Your Launch - Raisequity Directory",
    description: "Get your Web3 or SaaS product in front of 6,000+ readers, check-writers, and ecosystem scouts. Standard launch free, Premium $11, Spotlight $39.",
    aiSummary: "Raisequity's launch submission page for Web3/SaaS products: free standard tier with backlink verification, paid Premium and Spotlight tiers, and weekly cohort scheduling.",
    canonicalPath: "/launch/submit",
    mdAlternate: "/launch/submit.md",
  });

  const uid = user?.uid || (user as any)?.id;

  const [step, setStep] = useState<1 | 2>(1);
  const [autofilling, setAutofilling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credits'>('cash');

  // File upload refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  // Dynamic upcoming weeks
  const [launchWeeks] = useState(() => getUpcomingWeeks(8));

  // Backlink Verification State
  const [showBacklinkModal, setShowBacklinkModal] = useState(false);
  const [badgeTheme, setBadgeTheme] = useState<'light' | 'dark'>('dark');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isVerifyingBacklink, setIsVerifyingBacklink] = useState(false);
  const [backlinkVerified, setBacklinkVerified] = useState(false);
  const [launchedViaDodo, setLaunchedViaDodo] = useState(false);
  const [backlinkReason, setBacklinkReason] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    website_url: '',
    company_name: '',
    tagline: '',
    description: '',
    problem_solved: '',
    target_audience: '',
    ecosystem_chain: ['Solana', 'Ethereum'],
    token_status: 'no_token',
    product_stage: 'mainnet_live',
    deck_url: '',
    logo_url: '',
    screenshots: [] as string[],
    category: 'Web3',
    twitter_handle: '',
    telegram_url: '',
    github_url: '',
    demo_url: '',
    raising_status: 'raising_seed',
    target_raise: '',
    valuation_cap: '',
    traction_metric: '',
    maker_comment: '',
    launch_tier: 'premium' as LaunchTier,
    scheduled_date: launchWeeks[0]?.label || 'Mon 9 Nov',
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

  const toggleEcosystemChain = (chain: string) => {
    setFormData((prev) => {
      const exists = prev.ecosystem_chain.includes(chain);
      return {
        ...prev,
        ecosystem_chain: exists
          ? prev.ecosystem_chain.filter((c) => c !== chain)
          : [...prev.ecosystem_chain, chain],
      };
    });
  };

  const handleTaglineChange = (text: string) => {
    let clean = text.replace(/[.]+$/, '');
    if (clean.length > 70) clean = clean.substring(0, 70);
    update('tagline', clean);
  };

  // Image Upload Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      update('logo_url', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 4 - formData.screenshots.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (file.size > 3 * 1024 * 1024) {
        setError('Screenshots should be under 3MB each.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          screenshots: [...prev.screenshots, dataUrl].slice(0, 4),
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index),
    }));
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

  const handleVerifyBacklink = async (forceAttest = false) => {
    if (!formData.website_url) return;
    setIsVerifyingBacklink(true);
    setBacklinkReason(null);

    if (forceAttest) {
      setBacklinkVerified(true);
      setBacklinkReason("Self-attestation confirmed: You declared that the Raisequity badge is added to your website. Verified!");
      setIsVerifyingBacklink(false);
      return;
    }

    try {
      const res = await verifyBacklink(formData.website_url);
      if (res.verified) {
        setBacklinkVerified(true);
        setBacklinkReason(res.reason || "Backlink verified successfully! Ready to launch.");
      } else {
        setBacklinkVerified(false);
        setBacklinkReason(res.reason || "Could not detect a link to raisequity.com on your website.");
      }
    } catch (err: any) {
      setBacklinkVerified(false);
      setBacklinkReason("Could not scan website HTML source. Click 'Self-Verify' to confirm manual placement, or upgrade to Premium to skip.");
    } finally {
      setIsVerifyingBacklink(false);
    }
  };

  const getBadgeCode = () => {
    const slug = formData.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'my-project';
    const badgeFile = badgeTheme === 'dark' ? 'featured-dark.svg' : 'featured.svg';
    return `<a href="https://raisequity.com/launch/${slug}" target="_blank" rel="noopener">
  <img src="https://raisequity.com/badges/${badgeFile}" alt="Featured on Raisequity Directory" width="220" height="54" />
</a>`;
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

  // Final creation step (shared by credit payments and post-checkout returns).
  const finishLaunchSubmission = async (requiredCredits: number) => {
    if (!uid) return;

    if (paymentMethod === 'credits' && requiredCredits > 0) {
      const creditRes = await spendCredits(
        uid,
        'launch_tier',
        requiredCredits,
        'discretionary_addon',
        { action: `launch_${formData.launch_tier}_tier` }
      );
      if (!creditRes.success) {
        setError(creditRes.error || `Insufficient credit balance for ${formData.launch_tier} tier (Requires ${requiredCredits} credits).`);
        setIsSubmitting(false);
        return false;
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
      try { localStorage.removeItem('rq_pending_launch'); } catch (_) {}
      navigate(`/launch/${res.launch.slug}`, { replace: true });
      return true;
    }
    setError(res.error || 'Failed to submit launch. Please try again.');
    return false;
  };

  // After a Dodo checkout return, complete the saved launch intent.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') !== 'return') return;
    let pending: any = null;
    try { pending = JSON.parse(localStorage.getItem('rq_pending_launch') || 'null'); } catch (_) {}
    if (!pending) return;
    // Restore the stored submission state.
    setFormData(pending.formData || formData);
    setPaymentMethod(pending.paymentMethod || 'credits');
    const tierCreditCosts = { standard: 0, premium: 110, spotlight: 390 };
    const requiredCredits = tierCreditCosts[pending.tier] || 0;
    // Dodo checkout completed → record the marker and finish the launch.
    // (The webhook also activates the subscription/credits on the server.)
    setLaunchedViaDodo(true);
    // Defer until the restored state is applied.
    setTimeout(async () => {
      if (uid) await finishLaunchSubmission(requiredCredits);
    }, 150);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // Cash (Direct Pay) tiers must be paid via Dodo checkout — never free.
    if (paymentMethod !== 'credits' && requiredCredits > 0) {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            packageId: `launch_${formData.launch_tier}`,
            amountUsd: formData.launch_tier === 'spotlight' ? 39 : 20,
            credits: requiredCredits,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.checkout_url) {
          throw new Error(data?.error || 'Payment gateway unavailable');
        }
        // Persist the intent, then send the user to Dodo to pay.
        try {
          localStorage.setItem('rq_pending_launch', JSON.stringify({
            formData,
            paymentMethod,
            tier: formData.launch_tier,
          }));
        } catch (_) {}
        window.location.href = data.checkout_url;
        return; // resumes via checkout=return handler
      } catch (err: any) {
        setError(err?.message || 'Payment processing unavailable — your launch was NOT submitted and nothing was charged.');
        setIsSubmitting(false);
        return;
      }
    }

    await finishLaunchSubmission(requiredCredits);
  };

  const inputCls =
    'w-full bg-white dark:bg-[#0D0E11] border border-slate-300 dark:border-white/10 rounded-2xl px-4 py-3.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 shadow-xs';
  const labelCls = 'block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1.5 tracking-wider';

  if (!uid) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0B0D] flex items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-white/10 rounded-[32px] p-8 max-w-md text-center space-y-4 shadow-2xl text-slate-900 dark:text-white">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
            <Lock size={24} />
          </div>
          <h2 className="text-xl font-extrabold">Founder Login Required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            You must be logged in as a founder or creator to submit a product launch.
          </p>
          <Link
            to="/login?redirect=/launch/submit"
            className="block w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full font-bold text-xs shadow-md transition-all font-mono"
          >
            Sign In / Register →
          </Link>
        </div>
      </div>
    );
  }

  const isCurrentRaising = RAISING_STAGES.find((s) => s.id === formData.raising_status)?.isRaising;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0B0E] py-8 px-4 sm:px-6 font-sans pb-28 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-150">
      {/* Background radial gradient accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/launch"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Directory
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono font-bold bg-white dark:bg-[#141519] text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-xs">
            <Coins size={14} className="text-emerald-500" /> Your Credits: <span className="font-extrabold text-slate-900 dark:text-white">{userCredits}</span>
          </div>
        </div>

        {/* Header Title & Stepper */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">
            SUBMIT A PRODUCT &amp; DEALFLOW
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
            Launch your product in two steps
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-normal mt-1">
            Publish on the weekly leaderboard, earn do-follow backlinks, and surface to 180+ verified venture funds.
          </p>

          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                step === 1 ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">1</span>
              <span>Product &amp; Pitch</span>
            </button>
            <button
              type="button"
              onClick={() => handleNextStep()}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                step === 2 ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">2</span>
              <span>Launch &amp; Placement</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold rounded-2xl mb-6 flex items-center justify-between max-w-2xl mx-auto shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-600 dark:text-rose-200 font-black cursor-pointer hover:text-black dark:hover:text-white">✕</button>
          </div>
        )}

        {/* ──────────────── STEP 1: Product Form ──────────────── */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#121317] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-xl max-w-2xl mx-auto space-y-7 text-slate-900 dark:text-white transition-colors duration-150"
          >
            {/* Step Subheader */}
            <div className="border-b border-slate-200 dark:border-white/10 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  STEP 1 OF 2 — PRODUCT &amp; DEAL PROFILE
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tell investors and users what you built</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Live preview active</span>
            </div>

            {/* Website URL with Autofill */}
            <div>
              <label className={labelCls}>Website *</label>
              <div className="flex gap-2.5">
                <div className="relative flex-1">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
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
                  className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {autofilling ? <Loader2 size={14} className="animate-spin text-emerald-500" /> : <Sparkles size={14} className="text-emerald-500" />}
                  <span>{autofilling ? 'Scanning...' : 'Autofill from site'}</span>
                </button>
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label className={labelCls}>Product Name *</label>
              <input
                className={inputCls}
                placeholder="e.g. Raisequity"
                value={formData.company_name}
                onChange={(e) => update('company_name', e.target.value)}
              />
            </div>

            {/* Tagline */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={labelCls}>Tagline * (One sentence, no full stop)</label>
                <span className="text-[10px] font-mono text-slate-400">{formData.tagline.length}/70</span>
              </div>
              <input
                className={inputCls}
                placeholder="e.g. Institutional foundation and directory for verified Web3 startups"
                value={formData.tagline}
                onChange={(e) => handleTaglineChange(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={labelCls}>Description * (What it does, who it is for &amp; unique advantage)</label>
                <span className="text-[10px] font-mono text-slate-400">{formData.description.length}/600</span>
              </div>
              <textarea
                className={`${inputCls} h-28 resize-none`}
                placeholder="Explain what problem your product solves, target audience, and why it wins..."
                value={formData.description}
                onChange={(e) => update('description', e.target.value.substring(0, 600))}
              />
            </div>

            {/* ── EXPANDED PRODUCT INFORMATION SECTION (Fixing user feedback on product info) ── */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0D0E11] border border-slate-200 dark:border-white/5 space-y-5 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-2">
                  <Layers size={14} className="text-emerald-500" /> Deep Product Specs &amp; Architecture
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Institutional Deal Info</span>
              </div>

              {/* Core Problem Solved */}
              <div>
                <label className={labelCls}>Core Problem Solved &amp; Competitive Moat *</label>
                <textarea
                  className={`${inputCls} h-20 resize-none`}
                  placeholder="What friction exists in the market today that this product eliminates? (e.g. Eliminates cold outreach spam by requiring 1-credit double-blind intros)"
                  value={formData.problem_solved}
                  onChange={(e) => update('problem_solved', e.target.value)}
                />
              </div>

              {/* Target Audience / ICP */}
              <div>
                <label className={labelCls}>Target Audience / Ideal Customer Profile (ICP)</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Web3 Founders, Angel Syndicates, DeFi Protocols, Seed-stage VCs"
                  value={formData.target_audience}
                  onChange={(e) => update('target_audience', e.target.value)}
                />
              </div>

              {/* Ecosystem & Supported Chains */}
              <div>
                <label className={labelCls}>Supported Chains &amp; Ecosystems</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ECOSYSTEM_CHAINS.map((chain) => {
                    const isSelected = formData.ecosystem_chain.includes(chain);
                    return (
                      <button
                        key={chain}
                        type="button"
                        onClick={() => toggleEcosystemChain(chain)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-500 text-black border-emerald-500 shadow-xs'
                            : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/25'
                        }`}
                      >
                        {chain}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product Stage & Token Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Product Stage</label>
                  <div className="space-y-1.5">
                    {PRODUCT_STAGES.map((stg) => (
                      <button
                        key={stg.id}
                        type="button"
                        onClick={() => update('product_stage', stg.id)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs font-mono font-bold transition-all cursor-pointer ${
                          formData.product_stage === stg.id
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        {stg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Token / Tokenomics Status</label>
                  <div className="space-y-1.5">
                    {TOKEN_STATUSES.map((tok) => (
                      <button
                        key={tok.id}
                        type="button"
                        onClick={() => update('token_status', tok.id)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs font-mono font-bold transition-all cursor-pointer ${
                          formData.token_status === tok.id
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        {tok.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pitch Deck / Whitepaper Link */}
              <div>
                <label className={labelCls}>Pitch Deck / Whitepaper Link (Optional)</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className={`${inputCls} pl-10`}
                    placeholder="https://docsend.com/... or Google Drive URL"
                    value={formData.deck_url}
                    onChange={(e) => update('deck_url', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ── IMAGE SECTION: Real Logo & Screenshot Uploaders ── */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0D0E11] border border-slate-200 dark:border-white/5 space-y-5 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-2">
                  <ImageIcon size={14} className="text-emerald-500" /> Visual Assets &amp; Media
                </span>
                <span className="text-[10px] font-mono text-slate-400">PNG, JPG, SVG, WebP</span>
              </div>

              {/* Logo Uploader */}
              <div>
                <label className={labelCls}>Project Logo (512 × 512 px)</label>
                <div className="flex items-center gap-4">
                  {formData.logo_url ? (
                    <div className="relative w-16 h-16 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white/5 shrink-0 group">
                      <img src={formData.logo_url} alt="Logo preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => update('logo_url', '')}
                        className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 cursor-pointer"
                        title="Remove logo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-emerald-500 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-500 transition-all cursor-pointer bg-white dark:bg-white/5 shrink-0"
                    >
                      <Upload size={18} />
                      <span className="text-[9px] font-mono mt-1 font-bold">Upload</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-xs font-mono font-bold text-slate-800 dark:text-white transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload size={13} />
                        <span>Upload File</span>
                      </button>
                      <input
                        className={`${inputCls} py-2 text-[11px]`}
                        placeholder="Or paste direct image URL (https://...)"
                        value={formData.logo_url}
                        onChange={(e) => update('logo_url', e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-slate-400">Square 1:1 image displayed on leaderboard &amp; backlinks.</p>
                  </div>
                </div>
              </div>

              {/* Screenshots Gallery Uploader (Up to 4 images) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelCls}>Product Screenshots / Gallery (Up to 4)</label>
                  <span className="text-[10px] font-mono text-slate-400">{formData.screenshots.length}/4 uploaded</span>
                </div>

                <input
                  type="file"
                  ref={screenshotInputRef}
                  onChange={handleScreenshotUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.screenshots.map((shot, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-black/40 group">
                      <img src={shot} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-rose-500 rounded-lg text-white transition-colors cursor-pointer"
                        title="Delete screenshot"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}

                  {formData.screenshots.length < 4 && (
                    <div
                      onClick={() => screenshotInputRef.current?.click()}
                      className="aspect-video rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-emerald-500 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-500 transition-all cursor-pointer bg-white dark:bg-white/5 p-2 text-center"
                    >
                      <Plus size={18} />
                      <span className="text-[10px] font-mono font-bold mt-1">Add Image</span>
                      <span className="text-[9px] font-mono text-slate-400">16:10 or 16:9</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls}>Category *</label>
                <span className="text-[10px] font-mono text-slate-400">Pick the best fit</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => update('category', cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                      formData.category === cat
                        ? 'bg-emerald-500 text-black border-emerald-500 shadow-sm'
                        : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Founder Stage & Capital Intent */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0D0E11] border border-slate-200 dark:border-white/5 space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-500" /> Capital &amp; Stage Intent
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Surfaced to VCs</span>
              </div>

              <div>
                <label className={labelCls}>Are you raising capital for this project?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {RAISING_STAGES.map((stg) => (
                    <button
                      key={stg.id}
                      type="button"
                      onClick={() => update('raising_status', stg.id)}
                      className={`p-3 rounded-xl border text-left text-xs font-mono font-bold transition-all cursor-pointer ${
                        formData.raising_status === stg.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      {stg.label}
                    </button>
                  ))}
                </div>
              </div>

              {isCurrentRaising && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className={labelCls}>Target Raise (USD)</label>
                    <input
                      className={inputCls}
                      placeholder="e.g. $1,500,000"
                      value={formData.target_raise}
                      onChange={(e) => update('target_raise', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Valuation Cap (USD)</label>
                    <input
                      className={inputCls}
                      placeholder="e.g. $8.0M Cap"
                      value={formData.valuation_cap}
                      onChange={(e) => update('valuation_cap', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={labelCls}>Key Traction Metric / Highlight (Optional)</label>
                <input
                  className={inputCls}
                  placeholder="e.g. $42k MRR (+28% MoM) · 12,000 MAU · Ex-Google &amp; MIT team"
                  value={formData.traction_metric}
                  onChange={(e) => update('traction_metric', e.target.value)}
                />
              </div>
            </div>

            {/* Socials & Video */}
            <div className="space-y-4">
              <label className={labelCls}>Demo &amp; Community Channels</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                  <input
                    className={`${inputCls} pl-8`}
                    placeholder="twitter_handle"
                    value={formData.twitter_handle}
                    onChange={(e) => update('twitter_handle', e.target.value.replace(/^@/, ''))}
                  />
                </div>
                <div className="relative">
                  <Send className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    className={`${inputCls} pl-9`}
                    placeholder="Telegram / Discord URL"
                    value={formData.telegram_url}
                    onChange={(e) => update('telegram_url', e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    className={`${inputCls} pl-9`}
                    placeholder="GitHub Repo URL"
                    value={formData.github_url}
                    onChange={(e) => update('github_url', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Product Demo Video (Optional)</label>
                <div className="relative">
                  <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className={`${inputCls} pl-10`}
                    placeholder="https://loom.com/share/... or YouTube link"
                    value={formData.demo_url}
                    onChange={(e) => update('demo_url', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Pinned Maker Comment */}
            <div>
              <label className={labelCls}>Your First Comment (Optional)</label>
              <textarea
                className={`${inputCls} h-24 resize-none`}
                placeholder="Tell the community why you built this, what to try first, and what feedback you want..."
                value={formData.maker_comment}
                onChange={(e) => update('maker_comment', e.target.value)}
              />
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                This becomes the first comment on your launch page, pinned at the top.
              </p>
            </div>

            {/* Next Step Action Button */}
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black text-xs transition-all shadow-xl shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 active:scale-98 font-mono uppercase tracking-wider"
            >
              <span>Proceed to Launch Plan &amp; Scheduling</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}

        {/* ──────────────── STEP 2: Plan & Launch Selection ──────────────── */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Payment Method Switcher */}
            <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-white/10 rounded-2xl p-4 max-w-md mx-auto flex items-center justify-between shadow-xl">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Checkout Currency:</span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/60 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    paymentMethod === 'cash' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  💵 Direct Pay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credits')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    paymentMethod === 'credits' ? 'bg-emerald-500 text-black font-extrabold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
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
                className={`bg-white dark:bg-[#121317] rounded-3xl border-2 p-6 flex flex-col justify-between transition-all cursor-pointer shadow-xl relative ${
                  formData.launch_tier === 'standard'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">Standard</h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                      COMMUNITY
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">$0</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">free forever</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-normal">
                    Join the cohort queue, launch on the weekly board, and compete for community upvotes.
                  </p>

                  <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-normal border-t border-slate-200 dark:border-white/10 pt-5 font-mono">
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Launch on weekly cohort board</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Community upvotes &amp; feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Eligible for Launch of the Week</span>
                    </li>
                    <li className="flex items-start gap-2 text-amber-700 dark:text-amber-300 font-bold bg-amber-500/10 p-2 rounded-xl border border-amber-500/30">
                      <ShieldCheck size={16} className="text-amber-500 shrink-0 mt-0.5" />
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
                        ? 'bg-emerald-500 text-black border-emerald-500'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    Select Free Cohort →
                  </button>
                </div>
              </div>

              {/* Premium ($11 or 110 Credits) - MOST PICKED */}
              <div
                onClick={() => update('launch_tier', 'premium')}
                className={`bg-gradient-to-b from-emerald-50/40 to-white dark:from-[#0F1E19] dark:to-[#121317] rounded-3xl border-2 p-6 flex flex-col justify-between transition-all cursor-pointer shadow-xl relative overflow-hidden ${
                  formData.launch_tier === 'premium'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25'
                }`}
              >
                <div className="absolute top-0 right-0 bg-emerald-500 text-black font-mono font-extrabold text-[9px] uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  MOST PICKED
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">Premium</h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      HIGH VISIBILITY
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 my-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {paymentMethod === 'credits' ? '200 Credits' : '$20'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">once, per product</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-normal">
                    Skip the queue, hold the top of the board, and claim a permanent do-follow authority backlink.
                  </p>

                  <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-normal border-t border-slate-200 dark:border-white/10 pt-5 font-mono">
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-extrabold text-slate-900 dark:text-white">Skips queue &amp; backlink check</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Pinned to top for multiple days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>High authority do-follow backlink</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Permanent directory listing &amp; SEO index</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => update('launch_tier', 'premium')}
                    className="w-full py-3 rounded-xl text-xs font-mono font-extrabold transition-all bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Select Premium Plan →
                  </button>
                </div>
              </div>

              {/* Spotlight ($39 or 390 Credits) */}
              <div
                onClick={() => update('launch_tier', 'spotlight')}
                className={`bg-gradient-to-b from-purple-50/40 to-white dark:from-[#1E122A] dark:to-[#121317] rounded-3xl border-2 p-6 flex flex-col justify-between transition-all cursor-pointer shadow-xl relative ${
                  formData.launch_tier === 'spotlight'
                    ? 'border-purple-500 ring-2 ring-purple-500/30'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">Spotlight</h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                      EDITORIAL + VCs
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 my-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {paymentMethod === 'credits' ? '390 Credits' : '$39'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">once, per product</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-normal">
                    Everything in Premium, plus a dedicated review written to rank on Google &amp; investor blast.
                  </p>

                  <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-normal border-t border-slate-200 dark:border-white/10 pt-5 font-mono">
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-purple-500 shrink-0 mt-0.5" />
                      <span className="font-extrabold text-slate-900 dark:text-white">Everything in Premium</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-purple-500 shrink-0 mt-0.5" />
                      <span>Hand-written SEO review article</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-purple-500 shrink-0 mt-0.5" />
                      <span>Curated blast to 180+ verified VCs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} className="text-purple-500 shrink-0 mt-0.5" />
                      <span>Optimized for AI Search &amp; Google GEO</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => update('launch_tier', 'spotlight')}
                    className="w-full py-3 rounded-xl text-xs font-mono font-extrabold transition-all bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-lg shadow-purple-500/20"
                  >
                    Select Spotlight Plan →
                  </button>
                </div>
              </div>
            </div>

            {/* Target keywords input (for spotlight) */}
            {formData.launch_tier === 'spotlight' && (
              <div className="bg-white dark:bg-[#121316] border border-purple-500/40 rounded-3xl p-6 max-w-2xl mx-auto space-y-3 shadow-xl">
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
            <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-2">
                  <CalendarIcon size={14} className="text-emerald-500" /> SCHEDULED LAUNCH COHORT
                </h4>
                <span className="text-[11px] font-mono text-slate-400">Next 8 upcoming cohorts</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {launchWeeks.map((w) => {
                  const isSelected = formData.scheduled_date === w.label;
                  return (
                    <button
                      key={w.label}
                      type="button"
                      onClick={() => update('scheduled_date', w.label)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer font-mono ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5'
                      }`}
                    >
                      <span className="block text-xs font-bold">{w.label}</span>
                      <span className="text-[9px] font-mono uppercase text-slate-400 mt-0.5 block">
                        {w.note}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-white/10 rounded-2xl p-5 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-[11px] font-mono text-slate-400 block">Selected Placement:</span>
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">{formData.launch_tier} Tier</strong>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formData.scheduled_date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleStartSubmit}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs font-mono rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                      ? `Redeem ${formData.launch_tier === 'premium' ? 110 : 390} Credits & Launch →`
                      : `Pay ${formData.launch_tier === 'premium' ? '$11' : '$39'} and Launch →`}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ──────────────── BACKLINK VERIFICATION MODAL VIA PORTAL ──────────────── */}
        {showBacklinkModal && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full my-8 shadow-2xl relative space-y-6 text-slate-900 dark:text-white"
            >
              <button
                onClick={() => setShowBacklinkModal(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-black dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 mb-3">
                  <ShieldCheck size={14} /> Backlink Verification Required
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                  Add a link to Raisequity on your website
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-normal mt-1 leading-relaxed">
                  For free launches, you need to add a link or embed the Raisequity Launch badge on your website before your project can be scheduled.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 space-y-2 text-xs font-normal text-slate-700 dark:text-slate-300">
                <p className="font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] mb-2 font-mono">
                  Steps:
                </p>
                <ol className="space-y-2 list-decimal list-inside font-mono text-[11px]">
                  <li>Copy the badge snippet below (or add any link to raisequity.com)</li>
                  <li>Add it to your website footer or home page on <span className="font-bold text-slate-900 dark:text-white">{formData.website_url || 'your site'}</span></li>
                  <li>Click <strong className="text-slate-900 dark:text-white font-extrabold">"Verify Backlink"</strong> to check if it's detected</li>
                  <li>Once verified, your launch is instantly scheduled</li>
                </ol>
              </div>

              {/* Badge Visual Preview */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center gap-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Preview (Official Raisequity Brand Badge)</span>
                  <div className="flex items-center gap-1 bg-white dark:bg-white/5 p-1 rounded-xl text-[10px] font-mono border border-slate-200 dark:border-transparent">
                    <button
                      type="button"
                      onClick={() => setBadgeTheme('light')}
                      className={`px-2 py-0.5 rounded-lg ${badgeTheme === 'light' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setBadgeTheme('dark')}
                      className={`px-2 py-0.5 rounded-lg ${badgeTheme === 'dark' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
                <img
                  src={badgeTheme === 'dark' ? '/badges/featured-dark.svg' : '/badges/featured.svg'}
                  alt="Featured on Raisequity Launch"
                  width={220}
                  height={54}
                  className="rounded-2xl shadow-md border border-slate-200 dark:border-white/10"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">Badge HTML Snippet</span>
                </div>

                <div className="relative">
                  <pre className="bg-slate-900 text-emerald-300 dark:bg-black/60 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-700 dark:border-white/10">
                    {getBadgeCode()}
                  </pre>
                  <button
                    type="button"
                    onClick={copyBadgeCode}
                    className="absolute top-3 right-3 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-white/10 pt-5 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span>Target Website:</span>
                  <span className="text-slate-900 dark:text-white font-bold underline truncate max-w-xs">{formData.website_url}</span>
                </div>

                {backlinkReason && (
                  <div className={`p-3.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 ${
                    backlinkVerified ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}>
                    {backlinkVerified ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <AlertCircle size={16} className="text-amber-500 shrink-0" />}
                    <span>{backlinkReason}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => handleVerifyBacklink(false)}
                    disabled={isVerifyingBacklink}
                    className="flex-1 py-3.5 bg-slate-900 text-white dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/15 rounded-xl font-mono font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isVerifyingBacklink ? <Loader2 size={16} className="animate-spin text-emerald-400" /> : <ShieldCheck size={16} />}
                    <span>{isVerifyingBacklink ? 'Scanning Website...' : 'Verify Backlink'}</span>
                  </button>

                  {!backlinkVerified && (
                    <button
                      type="button"
                      onClick={() => handleVerifyBacklink(true)}
                      disabled={isVerifyingBacklink}
                      title="Self-attest if your site is protected by Cloudflare or localhost"
                      className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-mono font-bold text-xs transition-all cursor-pointer border border-slate-200 dark:border-transparent"
                    >
                      Self-Verify
                    </button>
                  )}

                  {backlinkVerified && (
                    <button
                      type="button"
                      onClick={executeLaunchSubmission}
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin text-black" /> : <Rocket size={16} />}
                      <span>Complete Launch →</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Skip option */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl text-center text-xs font-mono text-emerald-700 dark:text-emerald-300">
                <span>Want to skip backlink verification? </span>
                <button
                  type="button"
                  onClick={() => {
                    update('launch_tier', 'premium');
                    setShowBacklinkModal(false);
                  }}
                  className="text-emerald-600 dark:text-emerald-400 font-extrabold underline cursor-pointer ml-1"
                >
                  Upgrade to Premium ($20) →
                </button>
              </div>

            </motion.div>
          </div>,
          document.body
        )}

      </div>
    </div>
  );
}
