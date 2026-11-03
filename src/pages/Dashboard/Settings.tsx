import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, CreditCard, Shield, Bell, LogOut, CheckCircle2, Users, Loader2, Trash2, Plus, Save, Sparkles, Sun, Moon, Share2, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useFounderProfile } from "../../hooks/useFounderProfile";
import { useInvestorContacts } from "../../hooks/useInvestorContacts";
import { scanCompanyWebsite } from "../../lib/gemini";
import PlanCard, { PLANS, PlanDetails } from "../../components/dashboard/PlanCard";
import InvestorContactForm, { ContactFormData } from "../../components/dashboard/InvestorContactForm";
import BlurbPreview from "../../components/dashboard/BlurbPreview";
import { safeStorage } from "../../lib/storage";

export default function Settings() {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState("profile");
  const { signOut, user } = useAuth();
  const { founderProfile, updateProfile, refetch: refetchProfile } = useFounderProfile();
  const { contacts, addContact, deleteContact } = useInvestorContacts();
  const navigate = useNavigate();

  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  
  const [scanningWebsite, setScanningWebsite] = useState(false);
  const [theme, setTheme] = useState(() => safeStorage.getItem("theme") || "dark");

  // Apply dark theme to document root by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
    safeStorage.setItem("theme", "dark");
  }, []);

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
  
  // New contact form state
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

  // Profile form state
  const [profileForm, setProfileForm] = useState({
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

  // Keep tab in sync with url query parameters
  useEffect(() => {
    if (urlTab === "my-investors" || urlTab === "investors") {
      setActiveTab("investors");
    } else if (urlTab === "billing") {
      setActiveTab("billing");
    }
  }, [urlTab]);

  // Sync profile form when profile loads
  useEffect(() => {
    if (founderProfile) {
      setProfileForm({
        full_name: founderProfile.full_name || "",
        linkedin_url: founderProfile.linkedin_url || "",
        twitter_url: founderProfile.twitter_url || "",
        location: founderProfile.location || "",
        company_name: founderProfile.company_name || "",
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
    }
  }, [founderProfile]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setSavedProfile(false);
    try {
      const res = await updateProfile(profileForm);
      if (res.error) throw new Error(res.error);
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
      await addContact({
        investor_name: newContact.investor_name,
        investor_linkedin: newContact.investor_linkedin || null,
        fund_name: newContact.fund_name || null,
        relationship_description: newContact.relationship_description || null,
        sectors_invested_in: newContact.sectors_invested_in,
        check_size_min: parseFloat(newContact.check_size_min) || null,
        check_size_max: parseFloat(newContact.check_size_max) || null,
        verified: true
      });

      // Clear form
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

      // Award referral credits on new contact additions (100 credits per contact)
      if (founderProfile) {
        await updateProfile({ credits: (founderProfile.credits || 0) + 100 });
        await refetchProfile();
      }
    } catch (err: any) {
      setContactError(err.message || "Failed to add contact.");
    } finally {
      setAddingContact(false);
    }
  };

  // Handle Plan selection upgrades
  const handleSelectPlan = async (plan: PlanDetails) => {
    if (!founderProfile) return;
    setBillingLoading(true);
    try {
      let creditsReward = 50;
      if (plan.id === "premium") creditsReward = 500;
      if (plan.id === "pro") creditsReward = 1500;
      if (plan.id === "concierge") creditsReward = 10000;

      const res = await updateProfile({
        plan: plan.id as any,
        credits: (founderProfile.credits || 0) + creditsReward
      });

      if (res.error) throw new Error(res.error);
      await refetchProfile();
    } catch (err) {
      console.error("Error upgrading plan:", err);
    } finally {
      setBillingLoading(false);
    }
  };

  const inputCls = "w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-2xl px-5 py-3 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#0070F3] outline-none transition-all shadow-xs";
  const labelCls = "text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 px-1 block mb-1.5";

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={16} /> },
    { id: "investors", label: "My Investors", icon: <Users size={16} /> },
    { id: "billing", label: "Billing & SLA", icon: <CreditCard size={16} /> },
    { id: "community", label: "Community", icon: <Share2 size={16} /> },
  ];

  return (
    <div className="space-y-8 pb-24 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">Settings &amp; SLA Controls</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-mono mt-1">Manage institutional founder verification, deal tear-sheets, and 30-Day SLA status</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-56 space-y-1.5 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-xs font-bold transition-all border cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#0070F3]/15 text-[#0070F3] border-[#0070F3]/30 shadow-xs"
                  : "bg-white dark:bg-[#111111] border-slate-200 dark:border-[#262626] text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#171717]"
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
        <div className="flex-1 bg-white dark:bg-[#111111] rounded-[32px] border border-slate-200 dark:border-[#262626] shadow-xs p-6 sm:p-8 min-h-[500px]">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-base font-extrabold text-white font-mono">Institutional Founder Profile</h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Delaware C-Corp Ready
                </span>
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

              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider">Company &amp; Fast-Pass Memo</h4>
                
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
                        className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer border border-emerald-500/40"
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

              <div className="pt-4 border-t border-slate-800">
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
                className="px-8 py-3 bg-[#00F5A0] hover:bg-[#00D68B] text-black rounded-2xl text-xs font-mono font-extrabold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(0,245,160,0.3)] mt-4 active:scale-95"
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

          {/* MY INVESTORS TAB */}
          {activeTab === "investors" && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-white font-mono">My Investor Rolodex</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5 leading-relaxed">
                  Contribute check-writers you are connected with to earn credits (+100 per contact) and unlock peer warm intros.
                </p>
              </div>

              {contactError && (
                <div className="p-3 bg-red-500/10 text-red-300 rounded-xl text-xs font-mono font-bold border border-red-500/30">
                  {contactError}
                </div>
              )}

              {/* Add form using modular form component */}
              <div className="bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-2xl p-5 space-y-4">
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
                  className="px-6 py-2.5 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2 shadow-xs font-mono"
                >
                  {addingContact ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Submit &amp; Earn 100 Credits
                </button>
              </div>

              {/* Contacts directory list */}
              <div className="space-y-3.5 pt-4">
                <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex justify-between items-center border-b border-slate-200 dark:border-[#262626] pb-2">
                  <span>Your Contributed Network ({contacts.length})</span>
                  <span className="text-[10px] text-emerald-600 dark:text-[#00F5A0] font-bold uppercase">
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
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-2xl shadow-xs"
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
                          <span className="bg-emerald-500/10 text-emerald-700 dark:text-[#00F5A0] border border-emerald-500/30 text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded">
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

          {/* BILLING & SLA TAB */}
          {activeTab === "billing" && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              {/* Current Status Banner */}
              <div className="bg-slate-50 dark:bg-[#141414] p-6 rounded-3xl border border-slate-200 dark:border-[#262626] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    Current Subscription &amp; SLA Status
                  </span>
                  <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white capitalize flex items-center gap-2.5">
                    {founderProfile?.plan || "Basic"} Plan
                    <span className="bg-emerald-500/15 text-emerald-700 dark:text-[#00F5A0] border border-emerald-500/30 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-lg shadow-xs">
                      30-Day SLA Active
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1 text-left md:text-right">
                    Available Credits
                  </span>
                  <div className="text-xl font-mono font-extrabold text-[#00F5A0] flex items-center gap-1">
                    {founderProfile?.credits || 0}
                    <span className="text-xs font-mono text-slate-400">Credits</span>
                  </div>
                </div>
              </div>

              {/* Subscriptions Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                  Available Institutional Membership Plans
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PLANS.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isActive={founderProfile?.plan === plan.id}
                      onSelect={() => handleSelectPlan(plan)}
                      loading={billingLoading}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* COMMUNITY TAB */}
          {activeTab === "community" && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h3 className="text-base font-extrabold text-white font-mono">Founder Community Forum</h3>
              
              <div className="bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-3xl p-8 shadow-xs">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <div className="bg-white dark:bg-[#111111] p-4 rounded-2xl border border-slate-200 dark:border-[#262626]">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1">Post Cost</span>
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">1 Credit / Post</span>
                  </div>
                  <div className="bg-white dark:bg-[#111111] p-4 rounded-2xl border border-slate-200 dark:border-[#262626]">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1">Starter Quota</span>
                    <span className="text-sm font-mono font-bold text-emerald-600 dark:text-[#00F5A0]">150 Free Credits</span>
                  </div>
                  <div className="bg-white dark:bg-[#111111] p-4 rounded-2xl border border-slate-200 dark:border-[#262626]">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1">Ecosystem Access</span>
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">Verified Founders Only</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/dashboard/feed')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-2xl font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 font-mono"
                >
                  Go to Community Feed
                  <Share2 size={14} />
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
