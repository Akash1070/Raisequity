import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  User, CreditCard, Shield, Bell, LogOut, CheckCircle2, Users, Loader2, 
  Trash2, Plus, Save, Sparkles, Sun, Moon, Share2, Terminal, Briefcase, 
  Coins, ShieldCheck, Globe, ExternalLink, Link2, DollarSign, Upload, Camera
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useFounderProfile } from "../../hooks/useFounderProfile";
import { useInvestorContacts } from "../../hooks/useInvestorContacts";
import { scanCompanyWebsite } from "../../lib/gemini";
import PlanCard, { PLANS, PlanDetails } from "../../components/dashboard/PlanCard";
import InvestorContactForm, { ContactFormData } from "../../components/dashboard/InvestorContactForm";
import BlurbPreview from "../../components/dashboard/BlurbPreview";
import CreditPackageModal from "../../components/dashboard/CreditPackageModal";
import { db } from "../../lib/firebase";
import { collection, addDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { earnCredits } from "../../lib/credits";
import { declareInvestorConnection } from "../../lib/connections";

export default function Settings() {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState("profile");
  const { signOut, user, profile, refreshProfile } = useAuth();
  const { founderProfile, updateProfile, refetch: refetchProfile } = useFounderProfile();
  const { contacts, addContact, deleteContact } = useInvestorContacts();
  const navigate = useNavigate();

  const userRole = profile?.role || "founder";
  const [creditModalOpen, setCreditModalOpen] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [scanningWebsite, setScanningWebsite] = useState(false);

  // Founder Profile State
  const [profileForm, setProfileForm] = useState({
    profile_photo_url: "",
    full_name: "",
    linkedin_url: "",
    twitter_url: "",
    location: "",
    company_name: "",
    company_website: "",
    what_company_does: "",
    traction_signal: "",
    opportunity_stat: "",
    why_now: "",
    team_credential: "",
    funding_goal: "",
    founder_background: "",
    business_model: ""
  });

  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      setProfileForm((prev) => ({ ...prev, profile_photo_url: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  // Investor Profile State
  const investorAvatarInputRef = React.useRef<HTMLInputElement>(null);
  const [investorAvatarError, setInvestorAvatarError] = useState<string | null>(null);

  const handleInvestorAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInvestorAvatarError(null);
    if (file.size > 2 * 1024 * 1024) {
      setInvestorAvatarError("Image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      setInvestorForm((prev) => ({ ...prev, profile_photo_url: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const [investorForm, setInvestorForm] = useState({
    profile_photo_url: "",
    full_name: "",
    firm_name: "",
    role_title: "Managing Partner",
    location: "",
    linkedin_url: "",
    twitter_url: "",
    diligence_link: "",
    min_check_size: "50",
    max_check_size: "250",
    preferred_sectors: ["AI", "Web3", "SaaS"],
    preferred_stages: [],
    bio: "",
    accredited_investor: true
  });

  // Agency Profile State
  const agencyAvatarInputRef = React.useRef<HTMLInputElement>(null);
  const [agencyAvatarError, setAgencyAvatarError] = useState<string | null>(null);

  const handleAgencyAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAgencyAvatarError(null);
    if (file.size > 2 * 1024 * 1024) {
      setAgencyAvatarError("Image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      setAgencyForm((prev) => ({ ...prev, profile_photo_url: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const [agencyForm, setAgencyForm] = useState({
    profile_photo_url: "",
    agency_name: "",
    contact_name: "",
    website_url: "",
    work_email: "",
    location: "",
    linkedin_url: "",
    specialties: ["Full-Stack Dev & Smart Contracts", "Security Audits"],
    hourly_rate: "$150 / hr",
    escrow_payout_address: "",
    portfolio_url: "",
    bio: ""
  });

  // New contact form state (Founder Rolodex)
  const [newContact, setNewContact] = useState<ContactFormData>({
    investor_name: "",
    investor_email: "",
    investor_linkedin: "",
    fund_name: "",
    relationship_description: "",
    sectors_invested_in: [],
    check_size_min: "",
    check_size_max: ""
  });
  const [addingContact, setAddingContact] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Billing states
  const [billingLoading, setBillingLoading] = useState(false);

  // Handle URL Tab syncing
  useEffect(() => {
    if (urlTab === "my-investors" || urlTab === "investors") {
      setActiveTab("investors");
    } else if (urlTab === "billing") {
      setActiveTab("billing");
    } else if (urlTab === "services" || urlTab === "thesis") {
      setActiveTab("thesis");
    }
  }, [urlTab]);

  // Load profile data into form based on active role
  useEffect(() => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) return;

    if (userRole === "investor") {
      // Read both the profile store and the thesis store so edits in Settings
      // actually affect the recommendation engine (which reads investor_preferences).
      Promise.all([
        getDoc(doc(db, "investor_profiles", uid)),
        getDoc(doc(db, "investor_preferences", uid)),
      ]).then(([snap, prefSnap]) => {
        const invData = snap.exists() ? snap.data() : {};
        const prefData = prefSnap.exists() ? prefSnap.data() : {};
        const minAbs = Number(prefData.min_check_size || invData.min_check_size || 50000);
        const maxAbs = Number(prefData.max_check_size || invData.max_check_size || 250000);
        setInvestorForm({
          profile_photo_url: invData.profile_photo_url || (profile as any)?.profile_photo_url || (user as any)?.photoURL || "",
          full_name: invData.full_name || profile?.full_name || user?.displayName || "",
          firm_name: invData.fund_name || profile?.company_name || "",
          role_title: invData.investor_type || "Partner / Angel",
          location: prefData.geography || invData.geography || (profile as any)?.location || "",
          linkedin_url: invData.linkedin_url || profile?.linkedin_url || "",
          twitter_url: invData.twitter_url || "",
          diligence_link: invData.cal_link || invData.calendly_link || (profile as any)?.cal_link || "",
          min_check_size: String(Math.round((minAbs || 50000) / 1000)),
          max_check_size: String(Math.round((maxAbs || 250000) / 1000)),
          preferred_sectors: prefData.preferred_sectors || invData.preferred_sectors || ["AI", "Web3", "SaaS"],
          preferred_stages: prefData.preferred_stages || invData.preferred_stages || [],
          bio: invData.bio || prefData.thesis_description || invData.thesis_description || "",
          accredited_investor: invData.accredited_investor ?? true
        });
      }).catch(() => {});
    } else if (userRole === "service_provider") {
      getDoc(doc(db, "agency_profiles", uid)).then(async (snap) => {
        let agData = snap.exists() ? snap.data() : {};
        if (!snap.exists()) {
          const spSnap = await getDoc(doc(db, "service_providers", uid));
          if (spSnap.exists()) agData = spSnap.data();
        }
        setAgencyForm({
          profile_photo_url: agData.profile_photo_url || agData.logo_url || (profile as any)?.profile_photo_url || (user as any)?.photoURL || "",
          agency_name: agData.agency_name || profile?.company_name || "ChainCraft Labs",
          contact_name: agData.contact_name || profile?.full_name || user?.displayName || "",
          website_url: agData.website_url || "",
          work_email: agData.work_email || profile?.email || user?.email || "",
          location: agData.location || "",
          linkedin_url: agData.linkedin_url || profile?.linkedin_url || "",
          specialties: agData.selected_tracks || ["Full-Stack Dev & Smart Contracts", "Security Audits"],
          hourly_rate: agData.hourly_rate || "$150 / hr",
          escrow_payout_address: agData.payout_address || "",
          portfolio_url: agData.portfolio_url || "",
          bio: agData.bio || ""
        });
      }).catch(() => {});
    } else {
      if (founderProfile) {
        setProfileForm({
          profile_photo_url: founderProfile.profile_photo_url || profile?.profile_photo_url || (user as any)?.photoURL || "",
          full_name: founderProfile.full_name || profile?.full_name || user?.displayName || "",
          linkedin_url: founderProfile.linkedin_url || profile?.linkedin_url || "",
          twitter_url: founderProfile.twitter_url || "",
          location: founderProfile.location || "",
          company_name: founderProfile.company_name || profile?.company_name || "",
          company_website: founderProfile.company_website || "",
          what_company_does: founderProfile.what_company_does || "",
          traction_signal: founderProfile.traction_signal || "",
          opportunity_stat: founderProfile.opportunity_stat || "",
          why_now: founderProfile.why_now || "",
          team_credential: founderProfile.team_credential || "",
          funding_goal: founderProfile.funding_goal || "",
          founder_background: founderProfile.founder_background || "",
          business_model: founderProfile.business_model || ""
        });
      } else if (profile || user) {
        setProfileForm((prev) => ({
          ...prev,
          full_name: prev.full_name || profile?.full_name || user?.displayName || user?.email?.split('@')[0] || "",
          company_name: prev.company_name || profile?.company_name || "",
          linkedin_url: prev.linkedin_url || profile?.linkedin_url || ""
        }));
      }
    }
  }, [userRole, founderProfile, profile, user]);

  const handleScanWebsite = async () => {
    if (!profileForm.company_website) return;
    setScanningWebsite(true);
    try {
      const data = await scanCompanyWebsite(profileForm.company_website);
      setProfileForm((prev) => ({
        ...prev,
        what_company_does: data.what_company_does || prev.what_company_does,
        traction_signal: data.traction_signal || prev.traction_signal,
        opportunity_stat: data.opportunity_stat || prev.opportunity_stat,
        why_now: data.why_now || prev.why_now,
        team_credential: data.team_credential || prev.team_credential
      }));
    } catch (err) {
      console.error("Error scanning website:", err);
    } finally {
      setScanningWebsite(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleSaveProfile = async () => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) return;
    setSavingProfile(true);
    setSavedProfile(false);

    try {
      if (userRole === "investor") {
        const minAbs = (parseFloat(investorForm.min_check_size) || 50) * 1000;
        const maxAbs = (parseFloat(investorForm.max_check_size) || 250) * 1000;

        await setDoc(doc(db, "investor_profiles", uid), {
          id: uid,
          profile_photo_url: investorForm.profile_photo_url || "",
          full_name: investorForm.full_name,
          fund_name: investorForm.firm_name,
          investor_type: investorForm.role_title,
          geography: investorForm.location,
          linkedin_url: investorForm.linkedin_url,
          twitter_url: investorForm.twitter_url,
          cal_link: investorForm.diligence_link,
          min_check_size: minAbs,
          max_check_size: maxAbs,
          preferred_sectors: investorForm.preferred_sectors,
          thesis_description: investorForm.bio,
          accredited_investor: investorForm.accredited_investor,
          updated_at: new Date().toISOString()
        }, { merge: true });

        // Single source for the ranking engine — always keep in sync.
        await setDoc(doc(db, "investor_preferences", uid), {
          userId: uid,
          preferred_sectors: investorForm.preferred_sectors,
          preferred_stages: investorForm.preferred_stages || [],
          min_check_size: minAbs,
          max_check_size: maxAbs,
          geography: investorForm.location || "Global",
          thesis_description: investorForm.bio,
          updated_at: new Date().toISOString()
        }, { merge: true });

        await updateDoc(doc(db, "users", uid), {
          profile_photo_url: investorForm.profile_photo_url || "",
          photoURL: investorForm.profile_photo_url || "",
          avatar_url: investorForm.profile_photo_url || "",
          full_name: investorForm.full_name,
          company_name: investorForm.firm_name,
          linkedin_url: investorForm.linkedin_url,
          cal_link: investorForm.diligence_link,
          min_check_size: minAbs,
          max_check_size: maxAbs,
          sectors: investorForm.preferred_sectors,
          updated_at: new Date().toISOString()
        });
      } else if (userRole === "service_provider") {
        const agencyData = {
          id: uid,
          profile_photo_url: agencyForm.profile_photo_url || "",
          logo_url: agencyForm.profile_photo_url || "",
          agency_name: agencyForm.agency_name,
          contact_name: agencyForm.contact_name,
          website_url: agencyForm.website_url,
          work_email: agencyForm.work_email,
          location: agencyForm.location,
          linkedin_url: agencyForm.linkedin_url,
          selected_tracks: agencyForm.specialties,
          hourly_rate: agencyForm.hourly_rate,
          payout_address: agencyForm.escrow_payout_address,
          portfolio_url: agencyForm.portfolio_url,
          bio: agencyForm.bio,
          updated_at: new Date().toISOString()
        };

        await setDoc(doc(db, "agency_profiles", uid), agencyData, { merge: true });
        await setDoc(doc(db, "service_providers", uid), agencyData, { merge: true });

        await updateDoc(doc(db, "users", uid), {
          profile_photo_url: agencyForm.profile_photo_url || "",
          photoURL: agencyForm.profile_photo_url || "",
          avatar_url: agencyForm.profile_photo_url || "",
          full_name: agencyForm.contact_name,
          company_name: agencyForm.agency_name,
          linkedin_url: agencyForm.linkedin_url,
          updated_at: new Date().toISOString()
        });
      } else {
        const res = await updateProfile(profileForm);
        if (res.error) throw new Error(res.error);

        if (uid) {
          try {
            await setDoc(doc(db, "users", uid), {
              profile_photo_url: profileForm.profile_photo_url,
              photoURL: profileForm.profile_photo_url,
              avatar_url: profileForm.profile_photo_url,
              full_name: profileForm.full_name,
              location: profileForm.location,
              linkedin_url: profileForm.linkedin_url,
              twitter_url: profileForm.twitter_url,
              company_name: profileForm.company_name,
              updated_at: new Date().toISOString()
            }, { merge: true });
            await refetchProfile();
            if (refreshProfile) {
              await refreshProfile();
            }
          } catch (uErr) {
            console.warn("Error updating users doc:", uErr);
          }
        }
      }

      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddInvestor = async () => {
    if (!newContact.investor_name.trim()) return;
    setAddingContact(true);
    setContactError(null);
    try {
      const activeUid = user?.uid || (user as any)?.id || founderProfile?.id;
      if (!activeUid) {
        throw new Error("Please sign in to contribute investor contacts.");
      }

      const founderName = founderProfile?.full_name || profile?.full_name || user?.displayName || user?.email?.split('@')[0] || "Akash Kumar Jha";
      const founderCompany = founderProfile?.company_name || profile?.company_name || "Portfolio Co";
      const checkMin = parseFloat(newContact.check_size_min) || 50;
      const checkMax = parseFloat(newContact.check_size_max) || 250;
      const sectors = (newContact.sectors_invested_in?.length ? newContact.sectors_invested_in : ["AI", "Tech", "SaaS"]) as any;
      const stages = newContact.investment_stages?.length ? newContact.investment_stages : ["Pre-Seed", "Seed"];
      const ticketSize = `$${checkMin}k - $${checkMax}k`;

      // 1. Add to personal contributed contacts rolodex
      const addRes = await addContact({
        investor_name: newContact.investor_name,
        investor_email: newContact.investor_email || null,
        investor_linkedin: newContact.investor_linkedin || null,
        fund_name: newContact.fund_name || null,
        relationship_description: newContact.relationship_description || null,
        sectors_invested_in: sectors,
        check_size_min: checkMin,
        check_size_max: checkMax,
        verified: true
      });

      if (addRes?.error) {
        throw new Error(addRes.error);
      }

      // 2. Declare into the crowdsourced investor_connections graph
      // (This collection allows create if founderId == request.auth.uid)
      await declareInvestorConnection(
        activeUid,
        founderName,
        founderCompany,
        newContact.investor_name,
        newContact.fund_name || "Private Angel",
        sectors,
        stages,
        ticketSize
      );

      // 3. Clear form
      setNewContact({
        investor_name: "",
        investor_email: "",
        investor_linkedin: "",
        fund_name: "",
        relationship_description: "",
        sectors_invested_in: [],
        check_size_min: "",
        check_size_max: ""
      });

      // 4. Award 100 credits to the founder (ledger-backed)
      try {
        await earnCredits(activeUid, 'referral', 100, {
          action: 'investor_contact_contribution',
          investor: newContact.investor_name,
          fund: newContact.fund_name || "Private Angel"
        });
      } catch (earnErr) {
        console.warn("Contact reward credit error:", earnErr);
      }

      await refetchProfile?.();
    } catch (err: any) {
      setContactError(err.message || "Failed to add investor contact.");
    } finally {
      setAddingContact(false);
    }
  };

  const handleSelectPlan = async (plan: PlanDetails) => {
    if (plan.id === "credit_pack_200") {
      setCreditModalOpen(true);
      return;
    }
    if (!founderProfile) return;
    setBillingLoading(true);
    try {
      const res = await updateProfile({
        plan: "basic" as any,
      });

      if (res.error) throw new Error(res.error);
      await refetchProfile();
    } catch (err) {
      console.error("Error setting plan:", err);
    } finally {
      setBillingLoading(false);
    }
  };

  const inputCls = "w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#0070F3] outline-none transition-all shadow-xs";
  const labelCls = "text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 px-1 block mb-1.5";

  // Role-Specific Navigation Tabs
  const getTabs = () => {
    if (userRole === "investor") {
      return [
        { id: "profile", label: "Investor Profile", icon: <User size={16} /> },
        { id: "thesis", label: "Check Size & Thesis", icon: <Briefcase size={16} /> },
        { id: "billing", label: "Credits & Subscription", icon: <Coins size={16} /> },
      ];
    }
    if (userRole === "service_provider") {
      return [
        { id: "profile", label: "Agency Profile", icon: <User size={16} /> },
        { id: "thesis", label: "Services & Escrow", icon: <ShieldCheck size={16} /> },
        { id: "billing", label: "Credits & Billing", icon: <Coins size={16} /> },
      ];
    }
    return [
      { id: "profile", label: "Profile", icon: <User size={16} /> },
      { id: "investors", label: "My Investors", icon: <Users size={16} /> },
      { id: "billing", label: "Billing & SLA", icon: <CreditCard size={16} /> },
      { id: "community", label: "Community", icon: <Share2 size={16} /> },
    ];
  };

  const currentTabs = getTabs();

  return (
    <div className="space-y-8 pb-24 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
          {userRole === "investor" ? "Institutional Partner Settings" : userRole === "service_provider" ? "Vetted Agency & Partner Settings" : "Settings & SLA Controls"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-mono mt-1">
          {userRole === "investor" 
            ? "Manage verified check-writer thesis, Cal.com diligence links, and credit allocations" 
            : userRole === "service_provider"
            ? "Manage studio specialties, escrow settlement rails, and client communication credits"
            : "Manage institutional founder verification, deal tear-sheets, and 30-Day SLA status"}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-56 space-y-1.5 shrink-0">
          {currentTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-xs font-bold transition-all border cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#0070F3]/15 text-[#0070F3] border-[#0070F3]/30 shadow-xs"
                  : "bg-white dark:bg-[#111111] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#171717]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-xs font-bold text-red-600 dark:text-red-400 bg-white dark:bg-[#111111] border border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all mt-4 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>

        {/* Tab content panel */}
        <div className="flex-1 bg-white dark:bg-[#111111] rounded-[32px] border border-slate-200 dark:border-white/10 shadow-xs p-6 sm:p-8 min-h-[500px]">
          
          {/* ══════════════════════════════════════════════════════════
              PROFILE TAB: INVESTOR VIEW
             ══════════════════════════════════════════════════════════ */}
          {activeTab === "profile" && userRole === "investor" && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-mono">Institutional Investor Profile</h3>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Accredited Partner
                </span>
              </div>

              {/* Investor Avatar Upload Component */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-2xl bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-white/5">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#121316] border-2 border-dashed border-slate-300 dark:border-white/20 overflow-hidden flex items-center justify-center shadow-xs">
                    {investorForm.profile_photo_url ? (
                      <img
                        src={investorForm.profile_photo_url}
                        alt="Investor Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-500 font-mono font-black text-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                        {investorForm.full_name?.charAt(0) || "I"}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => investorAvatarInputRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all cursor-pointer"
                    title="Change Photo"
                  >
                    <Camera size={13} />
                  </button>
                </div>

                <input
                  type="file"
                  ref={investorAvatarInputRef}
                  onChange={handleInvestorAvatarChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => investorAvatarInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Upload size={13} />
                      <span>Upload Profile Picture</span>
                    </button>
                    {investorForm.profile_photo_url && (
                      <button
                        type="button"
                        onClick={() => setInvestorForm((p) => ({ ...p, profile_photo_url: "" }))}
                        className="px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-500">
                    Supports JPG, PNG, WebP up to 2MB. Displayed across check-writer network and warm introductions.
                  </p>
                  {investorAvatarError && (
                    <p className="text-xs font-mono text-rose-500 font-bold">
                      {investorAvatarError}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input
                    className={inputCls}
                    value={investorForm.full_name}
                    onChange={(e) => setInvestorForm((p) => ({ ...p, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Firm / Fund / Syndicate Name *</label>
                  <input
                    className={inputCls}
                    value={investorForm.firm_name}
                    onChange={(e) => setInvestorForm((p) => ({ ...p, firm_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Role / Title</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Managing Partner, Angel"
                    value={investorForm.role_title}
                    onChange={(e) => setInvestorForm((p) => ({ ...p, role_title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Geography / Base Location</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. New York, London, Singapore"
                    value={investorForm.location}
                    onChange={(e) => setInvestorForm((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>LinkedIn URL</label>
                  <input
                    className={inputCls}
                    placeholder="https://linkedin.com/in/username"
                    value={investorForm.linkedin_url}
                    onChange={(e) => setInvestorForm((p) => ({ ...p, linkedin_url: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Twitter / X Profile</label>
                  <input
                    className={inputCls}
                    placeholder="@handle"
                    value={investorForm.twitter_url}
                    onChange={(e) => setInvestorForm((p) => ({ ...p, twitter_url: e.target.value }))}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-8 py-3 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-2xl text-xs font-mono font-extrabold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 mt-4 active:scale-95 shadow-xs"
              >
                {savingProfile ? <Loader2 size={14} className="animate-spin" /> : savedProfile ? <CheckCircle2 size={14} /> : <Save size={14} />}
                {savingProfile ? "Saving..." : savedProfile ? "Saved!" : "Save Investor Profile"}
              </button>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              THESIS TAB: INVESTOR VIEW
             ══════════════════════════════════════════════════════════ */}
          {activeTab === "thesis" && userRole === "investor" && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-mono">Check Size &amp; Diligence Cal Link</h3>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                  Direct Intro Matching
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Min Check Size ($k USD)</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={investorForm.min_check_size}
                    onChange={(e) => setInvestorForm((p) => ({ ...p, min_check_size: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Max Check Size ($k USD)</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={investorForm.max_check_size}
                    onChange={(e) => setInvestorForm((p) => ({ ...p, max_check_size: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Cal.com or Calendly Diligence Link</label>
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className={`${inputCls} pl-11`}
                    placeholder="https://cal.com/your-name/30min"
                    value={investorForm.diligence_link}
                    onChange={(e) => setInvestorForm((p) => ({ ...p, diligence_link: e.target.value }))}
                  />
                </div>
                <p className="text-[10px] font-mono text-slate-400 mt-1">Founders can directly book 30-min diligence calls with you using credits.</p>
              </div>

              <div>
                <label className={labelCls}>Investment Thesis &amp; Scope</label>
                <textarea
                  rows={4}
                  className={`${inputCls} resize-none`}
                  placeholder="Outline what sectors, revenue milestones, and architectures catch your high-conviction interest..."
                  value={investorForm.bio}
                  onChange={(e) => setInvestorForm((p) => ({ ...p, bio: e.target.value }))}
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-8 py-3 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-2xl text-xs font-mono font-extrabold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 mt-4 active:scale-95 shadow-xs"
              >
                {savingProfile ? <Loader2 size={14} className="animate-spin" /> : savedProfile ? <CheckCircle2 size={14} /> : <Save size={14} />}
                {savingProfile ? "Saving..." : savedProfile ? "Saved!" : "Save Thesis Settings"}
              </button>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              PROFILE TAB: AGENCY VIEW
             ══════════════════════════════════════════════════════════ */}
          {activeTab === "profile" && userRole === "service_provider" && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-mono">Vetted Agency Profile</h3>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/30">
                  Escrow Verified
                </span>
              </div>

              {/* Agency Logo / Avatar Upload Component */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-2xl bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-white/5">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#121316] border-2 border-dashed border-slate-300 dark:border-white/20 overflow-hidden flex items-center justify-center shadow-xs">
                    {agencyForm.profile_photo_url ? (
                      <img
                        src={agencyForm.profile_photo_url}
                        alt="Agency Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-purple-500 font-mono font-black text-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
                        {agencyForm.agency_name?.charAt(0) || "A"}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => agencyAvatarInputRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-md transition-all cursor-pointer"
                    title="Change Logo"
                  >
                    <Camera size={13} />
                  </button>
                </div>

                <input
                  type="file"
                  ref={agencyAvatarInputRef}
                  onChange={handleAgencyAvatarChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => agencyAvatarInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Upload size={13} />
                      <span>Upload Agency Logo</span>
                    </button>
                    {agencyForm.profile_photo_url && (
                      <button
                        type="button"
                        onClick={() => setAgencyForm((p) => ({ ...p, profile_photo_url: "" }))}
                        className="px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-500">
                    Supports JPG, PNG, WebP up to 2MB. Displayed across the agency directory, RFP responses, and portfolio.
                  </p>
                  {agencyAvatarError && (
                    <p className="text-xs font-mono text-rose-500 font-bold">
                      {agencyAvatarError}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Agency / Studio Name *</label>
                  <input
                    className={inputCls}
                    value={agencyForm.agency_name}
                    onChange={(e) => setAgencyForm((p) => ({ ...p, agency_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Lead Contact Person *</label>
                  <input
                    className={inputCls}
                    value={agencyForm.contact_name}
                    onChange={(e) => setAgencyForm((p) => ({ ...p, contact_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Official Website URL</label>
                  <input
                    className={inputCls}
                    placeholder="https://agency.io"
                    value={agencyForm.website_url}
                    onChange={(e) => setAgencyForm((p) => ({ ...p, website_url: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Direct Work Email</label>
                  <input
                    className={inputCls}
                    value={agencyForm.work_email}
                    onChange={(e) => setAgencyForm((p) => ({ ...p, work_email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Berlin, San Francisco, Remote"
                    value={agencyForm.location}
                    onChange={(e) => setAgencyForm((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>LinkedIn URL</label>
                  <input
                    className={inputCls}
                    value={agencyForm.linkedin_url}
                    onChange={(e) => setAgencyForm((p) => ({ ...p, linkedin_url: e.target.value }))}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-8 py-3 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-2xl text-xs font-mono font-extrabold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 mt-4 active:scale-95 shadow-xs"
              >
                {savingProfile ? <Loader2 size={14} className="animate-spin" /> : savedProfile ? <CheckCircle2 size={14} /> : <Save size={14} />}
                {savingProfile ? "Saving..." : savedProfile ? "Saved!" : "Save Agency Profile"}
              </button>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              SERVICES TAB: AGENCY VIEW
             ══════════════════════════════════════════════════════════ */}
          {activeTab === "thesis" && userRole === "service_provider" && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-mono">Specialties &amp; Escrow Settlement</h3>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Milestone Protected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Hourly Rate / Starting Retainer</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. $150 / hr or $5,000 / month"
                    value={agencyForm.hourly_rate}
                    onChange={(e) => setAgencyForm((p) => ({ ...p, hourly_rate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Escrow Payout Address (EVM / Solana / Wire)</label>
                  <input
                    className={inputCls}
                    placeholder="0x... or bank wire IBAN"
                    value={agencyForm.escrow_payout_address}
                    onChange={(e) => setAgencyForm((p) => ({ ...p, escrow_payout_address: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Client Portfolio / Case Studies Link</label>
                <div className="relative">
                  <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className={`${inputCls} pl-11`}
                    placeholder="https://github.com/agency or https://behance.net/agency"
                    value={agencyForm.portfolio_url}
                    onChange={(e) => setAgencyForm((p) => ({ ...p, portfolio_url: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Studio Bio &amp; Technical Capabilities</label>
                <textarea
                  rows={4}
                  className={`${inputCls} resize-none`}
                  placeholder="Detail your engineering team size, security audit track record, or growth case studies..."
                  value={agencyForm.bio}
                  onChange={(e) => setAgencyForm((p) => ({ ...p, bio: e.target.value }))}
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-8 py-3 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-2xl text-xs font-mono font-extrabold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 mt-4 active:scale-95 shadow-xs"
              >
                {savingProfile ? <Loader2 size={14} className="animate-spin" /> : savedProfile ? <CheckCircle2 size={14} /> : <Save size={14} />}
                {savingProfile ? "Saving..." : savedProfile ? "Saved!" : "Save Agency Capabilities"}
              </button>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              PROFILE TAB: FOUNDER VIEW
             ══════════════════════════════════════════════════════════ */}
          {activeTab === "profile" && userRole === "founder" && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-mono">Institutional Founder Profile</h3>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Delaware C-Corp Ready
                </span>
              </div>

              {/* Profile Avatar Upload Component (Image 2 Fix) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-2xl bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-white/5">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#121316] border-2 border-dashed border-slate-300 dark:border-white/20 overflow-hidden flex items-center justify-center shadow-xs">
                    {profileForm.profile_photo_url ? (
                      <img
                        src={profileForm.profile_photo_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono font-black text-2xl bg-gradient-to-br from-[#0070F3]/10 to-purple-500/10 text-[#0070F3]">
                        {profileForm.full_name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl shadow-md transition-all cursor-pointer"
                    title="Change Photo"
                  >
                    <Camera size={13} />
                  </button>
                </div>

                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Upload size={13} />
                      <span>Upload Profile Picture</span>
                    </button>
                    {profileForm.profile_photo_url && (
                      <button
                        type="button"
                        onClick={() => setProfileForm((p) => ({ ...p, profile_photo_url: "" }))}
                        className="px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-500">
                    Supports JPG, PNG, WebP up to 2MB. Updates your avatar across peer matching and dashboard.
                  </p>
                  {avatarError && (
                    <p className="text-xs font-mono text-rose-500 font-bold">
                      {avatarError}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input
                    className={inputCls}
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input
                    className={inputCls}
                    value={profileForm.location}
                    onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>LinkedIn URL</label>
                  <input
                    className={inputCls}
                    value={profileForm.linkedin_url}
                    onChange={(e) => setProfileForm((p) => ({ ...p, linkedin_url: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Twitter / X</label>
                  <input
                    className={inputCls}
                    value={profileForm.twitter_url}
                    onChange={(e) => setProfileForm((p) => ({ ...p, twitter_url: e.target.value }))}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white tracking-wider">Company &amp; Fast-Pass Memo</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelCls}>Company Name</label>
                    <input
                      className={inputCls}
                      value={profileForm.company_name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, company_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Company Website</label>
                    <div className="flex gap-2">
                      <input
                        className={inputCls}
                        placeholder="https://acme.com"
                        value={profileForm.company_website}
                        onChange={(e) => setProfileForm((p) => ({ ...p, company_website: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={handleScanWebsite}
                        disabled={scanningWebsite || !profileForm.company_website}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer border border-emerald-500/30"
                      >
                        {scanningWebsite ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Sparkles size={12} />
                        )}
                        Scan
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Funding Goal</label>
                    <input
                      className={inputCls}
                      value={profileForm.funding_goal}
                      onChange={(e) => setProfileForm((p) => ({ ...p, funding_goal: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>What does your company do?</label>
                  <input
                    className={inputCls}
                    maxLength={100}
                    value={profileForm.what_company_does}
                    onChange={(e) => setProfileForm((p) => ({ ...p, what_company_does: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Traction Signal</label>
                    <input
                      className={inputCls}
                      value={profileForm.traction_signal}
                      onChange={(e) => setProfileForm((p) => ({ ...p, traction_signal: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Market Opportunity</label>
                    <input
                      className={inputCls}
                      value={profileForm.opportunity_stat}
                      onChange={(e) => setProfileForm((p) => ({ ...p, opportunity_stat: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Why Now?</label>
                    <input
                      className={inputCls}
                      value={profileForm.why_now}
                      onChange={(e) => setProfileForm((p) => ({ ...p, why_now: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Team Credential</label>
                    <input
                      className={inputCls}
                      value={profileForm.team_credential}
                      onChange={(e) => setProfileForm((p) => ({ ...p, team_credential: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Founder Background</label>
                  <textarea
                    rows={3}
                    className={`${inputCls} resize-none`}
                    value={profileForm.founder_background}
                    onChange={(e) => setProfileForm((p) => ({ ...p, founder_background: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Business Model</label>
                  <textarea
                    rows={3}
                    className={`${inputCls} resize-none`}
                    value={profileForm.business_model}
                    onChange={(e) => setProfileForm((p) => ({ ...p, business_model: e.target.value }))}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                <label className={labelCls}>Live Fast-Pass Memo Preview</label>
                <BlurbPreview
                  whatCompanyDoes={profileForm.what_company_does}
                  tractionSignal={profileForm.traction_signal}
                  opportunityStat={profileForm.opportunity_stat}
                  whyNow={profileForm.why_now}
                  teamCredential={profileForm.team_credential}
                  companyName={profileForm.company_name}
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-8 py-3 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-2xl text-xs font-mono font-extrabold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 mt-4 active:scale-95 shadow-xs"
              >
                {savingProfile ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : savedProfile ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <Save size={14} />
                )}
                {savingProfile ? "Saving..." : savedProfile ? "Saved!" : "Save Changes"}
              </button>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              MY INVESTORS TAB (FOUNDERS)
             ══════════════════════════════════════════════════════════ */}
          {activeTab === "investors" && userRole === "founder" && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-mono">My Investor Rolodex</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 leading-relaxed">
                  Contribute check-writers you are connected with to earn credits (+100 per contact) and unlock peer warm intros.
                </p>
              </div>

              {contactError && (
                <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-300 rounded-xl text-xs font-mono font-bold border border-red-500/30">
                  {contactError}
                </div>
              )}

              {/* Add form using modular form component */}
              <div className="bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Plus size={14} className="text-[#0070F3]" />
                  Contribute New Contact
                </h4>
                
                <InvestorContactForm
                  index={0}
                  data={newContact}
                  onChange={(updated) => setNewContact(updated)}
                />

                <button
                  onClick={handleAddInvestor}
                  disabled={addingContact || !newContact.investor_name.trim()}
                  className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2 shadow-xs"
                >
                  {addingContact ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Submit &amp; Earn 100 Credits
                </button>
              </div>

              {/* Contacts directory list */}
              <div className="space-y-3.5 pt-4">
                <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-2">
                  <span>Your Contributed Network ({contacts.length})</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                    {contacts.length >= 3 ? "Network Unlocked ✓" : `${3 - contacts.length} more needed`}
                  </span>
                </h4>

                {contacts.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs font-mono">
                    No investor contacts contributed yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contacts.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center font-mono font-black text-[#0070F3] text-sm shrink-0">
                            {c.investor_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{c.investor_name}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase truncate">
                              {c.fund_name || "Angel"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded">
                            Verified
                          </span>
                          <button
                            onClick={() => deleteContact(c.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              BILLING & CREDITS TAB (ALL ROLES)
             ══════════════════════════════════════════════════════════ */}
          {activeTab === "billing" && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              {/* Current Status Banner */}
              <div className="bg-slate-50 dark:bg-[#141414] p-6 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    Current Subscription &amp; SLA Status (Live Gateway)
                  </span>
                  <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white capitalize flex items-center gap-2.5">
                    {(profile as any)?.subscription_tier || founderProfile?.plan || (userRole === "investor" ? "Institutional Partner" : "Starter Free")}
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-lg shadow-xs border ${
                      profile?.has_active_subscription || profile?.subscription_status === 'active' || userRole === "investor"
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                    }`}>
                      {profile?.has_active_subscription || profile?.subscription_status === 'active' || userRole === "investor" ? 'Active Partner SLA ✓' : 'Free Tier (50 Credits)'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                    Gateway: <span className="font-bold text-slate-700 dark:text-slate-200">Dodo Payments (Verified Webhook)</span>
                    {profile?.trial_ends_at ? ` • Trial window ends: ${new Date(profile.trial_ends_at).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1 text-left md:text-right">
                      Spendable Credits
                    </span>
                    <div className="text-xl font-mono font-extrabold text-amber-500 dark:text-amber-400 flex items-center gap-1">
                      {founderProfile?.credits ?? profile?.credit_balance ?? 50}
                      <span className="text-xs font-mono text-slate-400">Credits</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setCreditModalOpen(true)}
                    className="px-4 py-2.5 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={13} /> Top Up Credits
                  </button>
                </div>
              </div>

              {/* Subscriptions Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white tracking-wider">
                  Platform Membership &amp; Credit Top-Up ($20 for 200 Credits)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PLANS.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isActive={plan.id === "basic" && !profile?.has_active_subscription}
                      onSelect={() => handleSelectPlan(plan)}
                      loading={billingLoading}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              COMMUNITY TAB (FOUNDER)
             ══════════════════════════════════════════════════════════ */}
          {activeTab === "community" && userRole === "founder" && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-mono">Founder Community Forum</h3>
              
              <div className="bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xs">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#0070F3]/10 border border-[#0070F3]/30 rounded-2xl flex items-center justify-center text-[#0070F3] shrink-0 shadow-xs">
                    <Share2 size={26} />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Raisequity Founder Community Feed</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-normal mt-0.5 leading-relaxed">
                      Share round launches, request peer intros, recruit co-founders, and post dealflow for 1 credit per post.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-[#1a1b20] rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-slate-300">
                    Community Channels Active: <strong>#ai-founders</strong>, <strong>#seed-syndicates</strong>, <strong>#web3-infra</strong>
                  </span>
                  <button
                    onClick={() => navigate("/dashboard/messages")}
                    className="px-4 py-2 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl font-bold cursor-pointer transition-all shadow-xs"
                  >
                    Open Messages
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>

      <CreditPackageModal
        isOpen={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        requiredCredits={100}
        actionTitle="Institutional Credit Packages"
      />
    </div>
  );
}
