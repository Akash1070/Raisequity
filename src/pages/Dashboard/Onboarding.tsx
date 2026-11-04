import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Linkedin,
  Twitter,
  MapPin,
  Upload,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Camera,
  Globe,
  Rocket,
  FileText
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, getDocs, query, where, setDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { processReferral } from "../../lib/referrals";
import BlurbPreview from "../../components/dashboard/BlurbPreview";
import InvestorContactForm, { ContactFormData } from "../../components/dashboard/InvestorContactForm";
import { safeStorage } from "../../lib/storage";
import { Logo } from "../../components/ui/Logo";
import OnboardingTrackSwitcher from "../../components/onboarding/OnboardingTrackSwitcher";

const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "Pre-IPO", "IPO", "Acquisition", "Other"];
const SECTORS = ["AI", "SaaS", "Fintech", "Consumer", "B2B Tech", "DeFi", "Web3 Infrastructure", "GameFi", "SocialFi", "RWA", "DeSci", "Other"];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 1: Avatar Upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Step 3: Pitch Deck Upload
  const [deckFile, setDeckFile] = useState<File | null>(null);
  const [deckProgress, setDeckProgress] = useState(0);
  const [deckUploading, setDeckUploading] = useState(false);
  const [deckUrl, setDeckUrl] = useState("");
  const [useWebsiteInstead, setUseWebsiteInstead] = useState(false);

  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();

  // Onboarding Form State
  const [form, setForm] = useState({
    profile_subtype: "founder", // "founder" | "scout"
    // Step 1
    full_name: "",
    location: "",
    linkedin_url: "",
    twitter_url: "",
    // Step 2
    company_name: "",
    company_website: "",
    what_company_does: "",
    traction_signal: "",
    opportunity_stat: "",
    why_now: "",
    team_credential: "",
    funding_goal: "",
    stage: "Seed",
    custom_stage: "",
    sector: "AI",
    custom_sector: "",
    arr: "0",
    funds_raised: "0",
    founder_background: "",
    business_model: ""
  });

  // Step 4: Investor Contacts State (at least 3)
  const [contacts, setContacts] = useState<ContactFormData[]>([
    { investor_name: "", investor_email: "", investor_linkedin: "", fund_name: "", relationship_description: "", sectors_invested_in: [], check_size_min: "", check_size_max: "" },
    { investor_name: "", investor_email: "", investor_linkedin: "", fund_name: "", relationship_description: "", sectors_invested_in: [], check_size_min: "", check_size_max: "" },
    { investor_name: "", investor_email: "", investor_linkedin: "", fund_name: "", relationship_description: "", sectors_invested_in: [], check_size_min: "", check_size_max: "" }
  ]);

  const set = (key: keyof typeof form, val: string) => {
    setForm(p => ({ ...p, [key]: val }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Redirect immediately if onboarding is already completed or if user is on wrong track
  React.useEffect(() => {
    const uid = user?.uid || (user as any)?.id;
    if (uid) {
      const userRole = profile?.role;
      const isLocalCompleted = Boolean(safeStorage.getItem(`rq_onboarding_completed_${uid}`));

      // If user is service_provider, route to agency dashboard or agency onboarding
      if (userRole === "service_provider") {
        if (profile?.onboarding_completed || isLocalCompleted) {
          navigate("/agency-dashboard/rfps", { replace: true });
        } else {
          navigate("/agency-onboarding", { replace: true });
        }
        return;
      }

      // If user is investor, route to investor dashboard or investor onboarding
      if (userRole === "investor") {
        if (profile?.onboarding_completed || isLocalCompleted) {
          navigate("/investor-dashboard/deals", { replace: true });
        } else {
          navigate("/investor-onboarding", { replace: true });
        }
        return;
      }

      if (profile?.onboarding_completed || isLocalCompleted) {
        navigate("/dashboard/feed", { replace: true });
        return;
      }
    }
  }, [user, profile, navigate]);

  // Load existing profile data from Firestore on mount if available
  React.useEffect(() => {
    async function loadExistingData() {
      const uid = user?.uid || (user as any)?.id;
      if (!uid) return;
      try {
        const userSnap = await getDoc(doc(db, "users", uid));
        const profileSnap = await getDoc(doc(db, "founder_profiles", uid));
        const startupSnap = await getDoc(doc(db, "startups", uid));

        const uData = userSnap.exists() ? userSnap.data() : {};
        const pData = profileSnap.exists() ? profileSnap.data() : {};
        const sData = startupSnap.exists() ? startupSnap.data() : {};

        // Check local storage draft fallback
        const localDraftRaw = safeStorage.getItem(`rq_onboarding_draft_${uid}`);
        let localDraft: any = null;
        if (localDraftRaw) {
          try { localDraft = JSON.parse(localDraftRaw); } catch (_) {}
        }

        setForm(prev => ({
          ...prev,
          profile_subtype: pData.profile_subtype || uData.profile_subtype || localDraft?.form?.profile_subtype || prev.profile_subtype || "founder",
          full_name: pData.full_name || uData.full_name || localDraft?.form?.full_name || user?.displayName || prev.full_name,
          location: pData.location || localDraft?.form?.location || prev.location,
          linkedin_url: pData.linkedin_url || uData.linkedin_url || localDraft?.form?.linkedin_url || prev.linkedin_url,
          twitter_url: pData.twitter_url || localDraft?.form?.twitter_url || prev.twitter_url,
          company_name: pData.company_name || sData.name || uData.company_name || localDraft?.form?.company_name || prev.company_name,
          company_website: pData.company_website || sData.website_url || localDraft?.form?.company_website || prev.company_website,
          what_company_does: pData.what_company_does || sData.tagline || localDraft?.form?.what_company_does || prev.what_company_does,
          traction_signal: pData.traction_signal || localDraft?.form?.traction_signal || prev.traction_signal,
          opportunity_stat: pData.opportunity_stat || localDraft?.form?.opportunity_stat || prev.opportunity_stat,
          why_now: pData.why_now || localDraft?.form?.why_now || prev.why_now,
          team_credential: pData.team_credential || localDraft?.form?.team_credential || prev.team_credential,
          funding_goal: pData.funding_goal || (sData.raise_amount ? `$${sData.raise_amount}` : localDraft?.form?.funding_goal) || prev.funding_goal,
          stage: pData.stage || sData.stage || localDraft?.form?.stage || prev.stage,
          sector: pData.sector || sData.sector || localDraft?.form?.sector || prev.sector,
          arr: pData.arr ? String(pData.arr) : (localDraft?.form?.arr || prev.arr),
          funds_raised: pData.funds_raised ? String(pData.funds_raised) : (localDraft?.form?.funds_raised || prev.funds_raised),
          founder_background: pData.founder_background || localDraft?.form?.founder_background || prev.founder_background,
          business_model: pData.business_model || localDraft?.form?.business_model || prev.business_model,
        }));

        const restoredStep = (pData.onboarding_step && typeof pData.onboarding_step === "number") ? pData.onboarding_step : localDraft?.step;
        if (restoredStep && typeof restoredStep === "number" && restoredStep >= 1 && restoredStep <= 5) {
          setStep(restoredStep);
        }

        if (pData.profile_photo_url) {
          setAvatarPreview(pData.profile_photo_url);
        }
        if (sData.deck_url) {
          setDeckUrl(sData.deck_url);
        }

        // Fetch existing contributed investor contacts if any
        const contactsQ = query(collection(db, "founder_investor_contacts"), where("founder_id", "==", uid));
        const contactsSnap = await getDocs(contactsQ);
        if (!contactsSnap.empty) {
          const loadedContacts: ContactFormData[] = contactsSnap.docs.map(d => {
            const data = d.data();
            return {
              investor_name: data.investor_name || "",
              investor_type: data.investor_type || "Angel Investor",
              investor_email: data.investor_email || "",
              investor_telegram: data.investor_telegram || "",
              investor_linkedin: data.investor_linkedin || "",
              fund_name: data.fund_name || "",
              relationship_description: data.relationship_description || "",
              sectors_invested_in: data.sectors_invested_in || [],
              check_size_min: data.check_size_min ? String(data.check_size_min) : "",
              check_size_max: data.check_size_max ? String(data.check_size_max) : "",
              investment_stages: data.investment_stages || []
            };
          });
          if (loadedContacts.length >= 3) {
            setContacts(loadedContacts);
          } else {
            setContacts([...loadedContacts, ...contacts.slice(loadedContacts.length)]);
          }
        } else if (localDraft?.contacts && Array.isArray(localDraft.contacts)) {
          setContacts(localDraft.contacts);
        }
      } catch (err) {
        console.error("Error loading existing onboarding profile data:", err);
      }
    }
    loadExistingData();
  }, [user]);

  // Step 3: Pitch Deck Upload (using FileReader base64 URL)
  const handleDeckChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Pitch deck exceeds maximum size of 10MB.");
      return;
    }

    setDeckFile(file);
    setDeckUploading(true);
    setDeckProgress(10);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          setDeckProgress(pct);
        }
      };
      reader.onloadend = () => {
        setDeckUrl(reader.result as string);
        setDeckProgress(100);
        setDeckUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Error uploading deck:", err);
      setError(err.message || "Failed to process pitch deck.");
      setDeckFile(null);
      setDeckUploading(false);
    }
  };

  const handleNext = () => {
    try {
      setError(null);
      if (step === 1) {
        if (!form.full_name?.trim()) { setError("Full name is required."); return; }
        if (!form.linkedin_url?.trim()) { setError("LinkedIn URL is required."); return; }
      }
      if (step === 2) {
        if (!form.company_name?.trim()) { setError("Company name is required."); return; }
        if (!form.what_company_does?.trim()) { setError("Company description is required."); return; }
      }
      if (step === 3) {
        if (!useWebsiteInstead && !deckFile) {
          setError("Please upload a pitch deck PDF or select to enter website instead.");
          return;
        }
        if (useWebsiteInstead && !form.company_website?.trim()) {
          setError("Company website is required as deck fallback.");
          return;
        }
      }
      if (step === 4) {
        const filledCount = contacts.filter(c => (c?.investor_name || "").trim()).length;
        if (filledCount < 3) {
          setError("You must contribute at least 3 investor contacts to complete onboarding.");
          return;
        }
        const missingContactMethod = contacts.some(c => (c?.investor_name || "").trim() && !c?.investor_email?.trim() && !c?.investor_telegram?.trim());
        if (missingContactMethod) {
          setError("Please provide an Email address or Telegram handle for each investor contact so we can invite them with your affiliate link.");
          return;
        }
      }
      const nextStepNum = Math.min(step + 1, 5);
      setStep(nextStepNum);

      // Auto-save draft progress safely to localStorage and Firestore
      const uid = user?.uid || (user as any)?.id;
      if (uid) {
        try {
          safeStorage.setItem(`rq_onboarding_draft_${uid}`, JSON.stringify({ form, step: nextStepNum, contacts }));
        } catch (_) {}
        try {
          const draftRef = doc(db, "founder_profiles", uid);
          setDoc(draftRef, {
            id: uid,
            user_id: uid,
            full_name: form.full_name,
            company_name: form.company_name,
            company_website: form.company_website,
            what_company_does: form.what_company_does,
            traction_signal: form.traction_signal,
            opportunity_stat: form.opportunity_stat,
            why_now: form.why_now,
            team_credential: form.team_credential,
            funding_goal: form.funding_goal,
            stage: form.stage,
            sector: form.sector,
            onboarding_step: nextStepNum,
            profile_complete: false,
            updated_at: new Date().toISOString()
          }, { merge: true }).catch(() => {});
        } catch (_) {}
      }
    } catch (err: any) {
      console.warn("handleNext step transition error:", err);
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleAddContact = () => {
    setContacts(prev => [
      ...prev,
      { investor_name: "", investor_type: "Angel Investor", investor_email: "", investor_telegram: "", investor_linkedin: "", fund_name: "", relationship_description: "", sectors_invested_in: [], check_size_min: "", check_size_max: "" }
    ]);
  };

  const handleRemoveContact = (index: number) => {
    if (contacts.length <= 3) return; // Keep at least 3 forms visible
    setContacts(prev => prev.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, updated: ContactFormData) => {
    setContacts(prev => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  };

  const assembleBlurb = () => {
    return [
      form.what_company_does || "[What Company Does]",
      form.traction_signal || "[Traction Signal]",
      form.opportunity_stat || "[Market Opportunity]",
      form.why_now || "[Why Now?]",
      form.team_credential || "[Team Credential]"
    ].join(". ") + ". I'd love a 15-minute call — would you be open to connecting?";
  };

  const handleComplete = async () => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const referralCode = `RQ-${uid.slice(0, 6).toUpperCase()}`;
      const companyBlurb = assembleBlurb();
      const refCode = safeStorage.getItem("referred_by_code") || safeStorage.getItem("rq_ref_code");

      const finalSector = form.sector === "Other" && form.custom_sector?.trim() ? form.custom_sector.trim() : form.sector;
      const finalStage = form.stage === "Other" && form.custom_stage?.trim() ? form.custom_stage.trim() : form.stage;

      // 2. Create/update founder profile in Firestore — core write, throws on
      //    failure so onboarding never falsely completes.
      const founderProfileRef = doc(db, "founder_profiles", uid);
      await setDoc(founderProfileRef, {
        id: uid,
        user_id: uid,
        profile_subtype: form.profile_subtype,
        full_name: form.full_name,
        email: user?.email || "",
        profile_photo_url: avatarPreview || null,
        linkedin_url: form.linkedin_url,
        twitter_url: form.twitter_url || null,
        location: form.location || null,
        company_name: form.company_name,
        company_website: form.company_website || null,
        company_blurb: companyBlurb,
        what_company_does: form.what_company_does || null,
        traction_signal: form.traction_signal || null,
        opportunity_stat: form.opportunity_stat || null,
        why_now: form.why_now || null,
        team_credential: form.team_credential || null,
        funding_goal: form.funding_goal || null,
        stage: finalStage,
        sector: finalSector,
        arr: parseFloat(form.arr) || 0,
        funds_raised: parseFloat(form.funds_raised) || 0,
        founder_background: form.founder_background || null,
        business_model: form.business_model || null,
        referral_code: referralCode,
        referred_by: refCode || null,
        onboarding_step: 5,
        profile_complete: true,
        updated_at: new Date().toISOString()
      }, { merge: true });

      // 3. Create/update startup record in Firestore — core write, throws on
      //    failure (deck payload is capped to avoid 1MB doc limits).
      const safeDeckUrl = useWebsiteInstead 
        ? form.company_website 
        : (deckUrl && deckUrl.length > 500000 ? form.company_website || null : deckUrl);

      const startupRef = doc(db, "startups", uid);
      await setDoc(startupRef, {
        id: uid,
        founder_id: uid,
        name: form.company_name,
        tagline: form.what_company_does,
        website_url: form.company_website || null,
        deck_url: safeDeckUrl || null,
        stage: finalStage,
        sector: finalSector,
        raise_amount: parseFloat((form.funding_goal || "").replace(/[^0-9.]/g, "")) || 0,
        description: companyBlurb,
        status: "approved",
        updated_at: new Date().toISOString()
      }, { merge: true });

      // 4. Add investor contacts contributed (Give to Get) in parallel
      const validContacts = contacts.filter(c => (c?.investor_name || "").trim());
      if (validContacts.length > 0) {
        const contactsColRef = collection(db, "founder_investor_contacts");
        const inviteUrl = `https://${window.location.host}/login?ref=${referralCode}&role=investor`;
        await Promise.allSettled(
          validContacts.map(async (c) => {
            const finalContactSectors = (c.sectors_invested_in || []).map(s => s === "Other" && c.custom_sector ? c.custom_sector : s);
            const finalContactStages = (c.investment_stages || []).map(s => s === "Other" && c.custom_stage ? c.custom_stage : s);
            return addDoc(contactsColRef, {
              founder_id: uid,
              founder_name: form.full_name,
              founder_company: form.company_name,
              investor_name: c.investor_name,
              investor_type: c.investor_type || "Angel Investor",
              investor_email: c.investor_email || null,
              investor_telegram: c.investor_telegram || null,
              investor_linkedin: c.investor_linkedin || null,
              fund_name: c.fund_name || null,
              relationship_description: c.relationship_description || null,
              sectors_invested_in: finalContactSectors,
              investment_stages: finalContactStages,
              check_size_min: parseFloat(c.check_size_min) || null,
              check_size_max: parseFloat(c.check_size_max) || null,
              affiliate_invite_url: inviteUrl,
              invite_message: `Hey ${c.investor_name},\n\n${form.full_name} from ${form.company_name} highlighted you as one of the most respected check-writers in their network and invited you to join Raisequity.\n\nOn Raisequity, verified investors get direct, zero-noise access to pre-screened Web2 & Web3 founders, deal flow metrics, and co-investment opportunities.\n\nClaim your VIP invited investor spot here:\n${inviteUrl}\n\nLooking forward to having you on board,\nThe Raisequity Team`,
              invite_status: "sent",
              verified: true,
              created_at: new Date().toISOString()
            });
          })
        );
      }

      // 5. Mark user onboarding completed in users collection
      try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
          onboarding_completed: true,
          profile_subtype: form.profile_subtype,
          full_name: form.full_name,
          company_name: form.company_name,
          linkedin_url: form.linkedin_url,
          updated_at: new Date().toISOString()
        }, { merge: true });
      } catch (e4) {
        console.warn("users collection write warning:", e4);
      }

      // 6. Process referral if stored
      if (refCode) {
        try {
          await processReferral(uid, refCode);
          safeStorage.removeItem("referred_by_code");
          safeStorage.removeItem("rq_ref_code");
        } catch (refErr) {
          console.error("Referral process error:", refErr);
        }
      }

      // Clean up completed draft to free storage
      safeStorage.removeItem(`rq_onboarding_draft_${uid}`);

      try {
        await refreshProfile();
      } catch (rErr) {
        console.warn("refreshProfile warning:", rErr);
      }

      // 7. Only now — after core Firestore writes succeeded — record local
      //    completion and proceed.
      safeStorage.setItem(`rq_onboarding_completed_${uid}`, "true");

      // Proceed to appropriate dashboard based on user role
      if (profile?.role === "service_provider") {
        navigate("/agency-dashboard/rfps", { replace: true });
      } else if (profile?.role === "investor") {
        navigate("/investor-dashboard/deals", { replace: true });
      } else {
        navigate("/dashboard/feed", { replace: true });
      }
    } catch (err: any) {
      console.error("Error launching onboarding:", err);
      // Do NOT navigate, do NOT mark complete. Surface the failure so the
      // founder can retry (their draft is preserved).
      setError(err?.message || "Failed to save your profile. Please retry — nothing was marked complete.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ["Profile Info", "Pitch blurb", "Pitch deck", "Give to Get", "Review & Launch"];
  const labelCls = "text-[10px] font-black uppercase text-gray-400 block mb-1.5 px-0.5";
  const inputCls = "w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black transition-all outline-none text-sm shadow-sm";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-start p-4 pt-8">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4 px-2">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8 rounded-lg shadow-xs" />
            <span className="font-black text-[18px] tracking-tight">Raisequity</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-bold text-gray-400">Step {step} of 5</span>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate("/login", { replace: true });
              }}
              className="text-xs text-gray-500 hover:text-black font-bold ml-2 underline underline-offset-2 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        <OnboardingTrackSwitcher currentTrack="founder" />

        {/* Progress Navigation Tracker */}
        <div className="flex items-center gap-2 mb-8 justify-center flex-wrap">
          {stepLabels.map((label, idx) => (
            <div key={label} className="flex items-center gap-2">
              <button
                onClick={() => idx + 1 < step && setStep(idx + 1)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                  step === idx + 1 ? "bg-black text-white" :
                  idx + 1 < step ? "bg-[var(--color-clay-matcha)] text-white" :
                  "bg-gray-100 text-gray-400"
                }`}
              >
                {idx + 1 < step ? <CheckCircle2 size={11} /> : <span className="w-3 text-center">{idx + 1}</span>}
                <span>{label}</span>
              </button>
              {idx < 4 && <div className={`w-4 h-0.5 rounded-full ${idx + 1 < step ? "bg-[var(--color-clay-matcha)]" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-medium">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-[32px] border border-gray-100 shadow-xl p-6 sm:p-10">

          {/* STEP 1: Personal Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-[28px] font-black text-black tracking-tight">Tell us about yourself</h1>
                <p className="text-gray-400 font-medium mt-1 text-sm">Let's set up your Raisequity Profile</p>
              </div>

              {/* Avatar placeholder */}
              <div className="flex flex-col items-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group-hover:border-black transition-all">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={28} className="text-gray-300 group-hover:text-black transition-colors" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center shadow-lg">
                    <Upload size={13} />
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
                <span className="text-[11px] text-gray-400 mt-2 font-medium">Profile Photo</span>
              </div>

              {/* Role Subtype: Founder vs Venture Scout */}
              <div>
                <label className={labelCls}>Are you raising as a Founder or submitting as a Venture Scout?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => set("profile_subtype", "founder")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      form.profile_subtype === "founder"
                        ? "border-black bg-black text-white shadow-md dark:border-white dark:bg-white dark:text-black"
                        : "border-gray-200 bg-gray-50/50 text-gray-700 hover:border-gray-300 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs">🚀 Startup Founder</span>
                      {form.profile_subtype === "founder" && <CheckCircle2 size={14} />}
                    </div>
                    <p className={`text-[11px] leading-tight ${form.profile_subtype === "founder" ? "text-gray-300 dark:text-neutral-600" : "text-gray-400"}`}>
                      Raising capital, launching product, and matching with thesis-aligned lead checks.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => set("profile_subtype", "scout")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      form.profile_subtype === "scout"
                        ? "border-black bg-black text-white shadow-md dark:border-white dark:bg-white dark:text-black"
                        : "border-gray-200 bg-gray-50/50 text-gray-700 hover:border-gray-300 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs">🔍 Venture Scout / Deal Partner</span>
                      {form.profile_subtype === "scout" && <CheckCircle2 size={14} />}
                    </div>
                    <p className={`text-[11px] leading-tight ${form.profile_subtype === "scout" ? "text-gray-300 dark:text-neutral-600" : "text-gray-400"}`}>
                      Sourcing high-conviction deals, submitting cohort tear-sheets, and earning credits.
                    </p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input className={inputCls} placeholder="Marc Andreessen" value={form.full_name} onChange={e => set("full_name", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input className={`${inputCls} pl-11`} placeholder="New York, USA" value={form.location} onChange={e => set("location", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>LinkedIn URL *</label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input className={`${inputCls} pl-11`} placeholder="linkedin.com/in/username" value={form.linkedin_url} onChange={e => set("linkedin_url", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Twitter / X (Optional)</label>
                  <div className="relative">
                    <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input className={`${inputCls} pl-11`} placeholder="@username" value={form.twitter_url} onChange={e => set("twitter_url", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={handleNext} className="group bg-black text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 hover:shadow-2xl transition-all cursor-pointer">
                  Next <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Company Details & Blurb */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h1 className="text-[28px] font-black text-black tracking-tight">Company Profile</h1>
                <p className="text-gray-400 font-medium mt-1 text-sm">Draft the blurb that gets sent to investors</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Company Name *</label>
                  <input className={inputCls} placeholder="Acme Corp" value={form.company_name} onChange={e => set("company_name", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Company Website</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input className={`${inputCls} pl-11`} placeholder="https://acme.com" value={form.company_website} onChange={e => set("company_website", e.target.value)} />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>What does your company do? * (one sentence, max 100 chars)</label>
                <input className={inputCls} maxLength={100} placeholder="e.g. We build developer tools for scaling Web3 databases" value={form.what_company_does} onChange={e => set("what_company_does", e.target.value)} />
                <span className="text-[10px] text-gray-300 float-right mt-1">{form.what_company_does.length}/100</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>One Traction Signal</label>
                  <input className={inputCls} placeholder="e.g. $10K MRR growing 20% MoM" value={form.traction_signal} onChange={e => set("traction_signal", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Market Opportunity Stat</label>
                  <input className={inputCls} placeholder="e.g. $24B market size by 2027" value={form.opportunity_stat} onChange={e => set("opportunity_stat", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Why Now?</label>
                  <input className={inputCls} placeholder="e.g. Exploding developer demand for Web3 storage" value={form.why_now} onChange={e => set("why_now", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Team Credential</label>
                  <input className={inputCls} placeholder="e.g. Ex-Google, Ex-Supabase core team" value={form.team_credential} onChange={e => set("team_credential", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelCls}>Funding Goal</label>
                  <input className={inputCls} placeholder="e.g. $500K pre-seed" value={form.funding_goal} onChange={e => set("funding_goal", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Stage</label>
                  <select className={`${inputCls} appearance-none bg-white`} value={form.stage} onChange={e => set("stage", e.target.value)}>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  {form.stage === "Other" && (
                    <input className={`${inputCls} mt-2`} placeholder="Specify stage..." value={form.custom_stage || ""} onChange={e => set("custom_stage", e.target.value)} />
                  )}
                </div>
                <div>
                  <label className={labelCls}>Sector</label>
                  <select className={`${inputCls} appearance-none bg-white`} value={form.sector} onChange={e => set("sector", e.target.value)}>
                    {SECTORS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  {form.sector === "Other" && (
                    <input className={`${inputCls} mt-2`} placeholder="Specify sector..." value={form.custom_sector || ""} onChange={e => set("custom_sector", e.target.value)} />
                  )}
                </div>
              </div>

              {/* Live Blurb Preview Box */}
              <BlurbPreview
                whatCompanyDoes={form.what_company_does}
                tractionSignal={form.traction_signal}
                opportunityStat={form.opportunity_stat}
                whyNow={form.why_now}
                teamCredential={form.team_credential}
                companyName={form.company_name}
              />

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-black transition-all cursor-pointer">
                  <ChevronLeft size={20} /> Back
                </button>
                <button onClick={handleNext} className="group bg-black text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 hover:shadow-2xl transition-all cursor-pointer">
                  Next <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Pitch Deck Upload */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-[28px] font-black text-black tracking-tight">Upload Pitch Deck</h1>
                <p className="text-gray-400 font-medium mt-1 text-sm">Share your presentation deck or website</p>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <input
                  type="checkbox"
                  id="website-instead"
                  checked={useWebsiteInstead}
                  onChange={(e) => setUseWebsiteInstead(e.target.checked)}
                  className="rounded border-gray-300 text-black focus:ring-black cursor-pointer w-4 h-4"
                />
                <label htmlFor="website-instead" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Enter company website instead of uploading PDF
                </label>
              </div>

              {!useWebsiteInstead ? (
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-10 hover:border-black cursor-pointer transition-all bg-gray-50/50">
                    <FileText size={40} className="text-gray-400 mb-3" />
                    <span className="text-xs font-black text-black">
                      {deckFile ? deckFile.name : "Choose Pitch Deck PDF"}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 font-medium">
                      PDF files only, max 10MB
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleDeckChange}
                      className="hidden"
                      disabled={deckUploading}
                    />
                  </label>

                  {/* Progress bar */}
                  {(deckUploading || deckProgress > 0) && (
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                        <span>Uploading...</span>
                        <span>{deckProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-clay-matcha)] rounded-full transition-all duration-300"
                          style={{ width: `${deckProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className={labelCls}>Company Website URL *</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input
                      className={`${inputCls} pl-11`}
                      placeholder="https://acme.com"
                      value={form.company_website}
                      onChange={(e) => set("company_website", e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-black transition-all cursor-pointer">
                  <ChevronLeft size={20} /> Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={deckUploading || (!useWebsiteInstead && !deckFile)}
                  className="group bg-black text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 hover:shadow-2xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Next <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Give to Get (Contribute Contacts) */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h1 className="text-[28px] font-black text-black tracking-tight">Give to Get</h1>
                <p className="text-gray-400 font-medium mt-1 text-sm">Contribute 3 investor contacts from your network</p>
              </div>

              <div className="bg-[var(--color-clay-matcha)]/10 border border-[var(--color-clay-matcha)]/20 rounded-2xl p-4 text-[11px] text-gray-700 leading-relaxed font-medium">
                📢 <strong>Important:</strong> You must contribute at least 3 investor contacts from your network to unlock warm introductions. These are verified by our team and shared with matched founders who can intro you to their investors in return.
              </div>

              {/* Form List */}
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {contacts.map((contact, idx) => (
                  <InvestorContactForm
                    key={idx}
                    index={idx}
                    data={contact}
                    onChange={(updated) => updateContact(idx, updated)}
                    onRemove={contacts.length > 3 ? () => handleRemoveContact(idx) : undefined}
                  />
                ))}
              </div>

              {/* Add another button */}
              <button
                type="button"
                onClick={handleAddContact}
                className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-black rounded-2xl text-xs font-bold text-gray-500 hover:text-black cursor-pointer transition-colors"
              >
                + Add Another Investor Contact
              </button>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(3)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-black transition-all cursor-pointer">
                  <ChevronLeft size={20} /> Back
                </button>
                <button onClick={handleNext} className="group bg-black text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 hover:shadow-2xl transition-all cursor-pointer">
                  Review <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Launch */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h1 className="text-[28px] font-black text-black tracking-tight">Review & Launch 🚀</h1>
                <p className="text-gray-400 font-medium mt-1 text-sm">Make sure everything is correct before launching</p>
              </div>

              {/* Summarized Card */}
              <div className="bg-[var(--color-clay-bg)] rounded-3xl border border-[var(--color-clay-border)] p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-4">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-400 font-black text-lg">{form.full_name.charAt(0)}</div>
                  )}
                  <div>
                    <div className="font-black text-lg text-black">{form.full_name}</div>
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                      Founder · {form.company_name}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-xs space-y-2">
                  <div>
                    <span className="font-bold text-gray-400">Sector / Stage:</span>{" "}
                    <span className="text-gray-700 font-medium">{form.sector} · {form.stage}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400">Company Blurb:</span>
                    <p className="text-gray-600 mt-1 italic leading-relaxed">
                      "{assembleBlurb()}"
                    </p>
                  </div>
                  {deckFile && (
                    <div>
                      <span className="font-bold text-gray-400">Pitch Deck:</span>{" "}
                      <span className="text-[var(--color-clay-matcha-dark)] font-bold">✓ PDF Uploaded</span>
                    </div>
                  )}
                  {useWebsiteInstead && (
                    <div>
                      <span className="font-bold text-gray-400">Pitch Link:</span>{" "}
                      <span className="text-[var(--color-clay-ube-dark)] font-bold">{form.company_website}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-gray-400">Investors Contributed:</span>{" "}
                    <span className="text-black font-black">{contacts.filter(c => (c?.investor_name || "").trim()).length} Contacts</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(4)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-black transition-all cursor-pointer">
                  <ChevronLeft size={20} /> Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="bg-[var(--color-clay-matcha)] hover:bg-[var(--color-clay-matcha-dark)] text-white px-12 py-4 rounded-2xl font-black flex items-center gap-3 hover:shadow-2xl transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      Launch Dashboard <Rocket size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <p className="text-center mt-8 text-[11px] text-gray-400 font-medium max-w-sm mx-auto">
          Your data is encrypted. Read our <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
