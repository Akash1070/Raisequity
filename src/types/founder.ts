// ============================================================
// Founder Dashboard Types — mirrors Firestore collections
// ============================================================

export type FounderPlan = 'basic' | 'premium' | 'pro' | 'concierge';
export type FounderStage = 'Pre-seed' | 'Seed' | 'Series A';
export type FounderSector = 'DeFi' | 'NFT' | 'Web3 Infrastructure' | 'AI' | 'SaaS' | 'GameFi' | 'Other';
export type MatchStatus = 'pending' | 'accepted' | 'declined';
export type IntroRequestStatus = 'pending' | 'approved' | 'intro_sent' | 'accepted' | 'declined';
export type NotificationType =
  | 'match_request'
  | 'match_accepted'
  | 'new_message'
  | 'intro_approved'
  | 'intro_sent'
  | 'call_accepted'
  | 'referral_earned';

export interface FounderProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  profile_photo_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  company_name: string | null;
  company_website: string | null;
  company_blurb: string | null;
  what_company_does: string | null;
  traction_signal: string | null;
  opportunity_stat: string | null;
  why_now: string | null;
  team_credential: string | null;
  funding_goal: string | null;
  founder_background: string | null;
  business_model: string | null;
  arr: number;
  funds_raised: number;
  stage: string | null;
  sector: string | null;
  location: string | null;
  profile_complete: boolean;
  completeness_pct?: number;
  contacts_contributed_count?: number;
  onboarding_step: number;
  credits: number;
  plan: FounderPlan;
  referral_code: string | null;
  referred_by: string | null;
  promotedUntil?: string | null;
  created_at: string;
}

export interface Startup {
  id: string;
  founder_id: string;
  name: string;
  tagline: string | null;
  sector: string | null;
  stage: string | null;
  raise_amount: number | null;
  description: string | null;
  problem: string | null;
  solution: string | null;
  traction: string | null;
  team_size: number | null;
  deck_url: string | null;
  website_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  completeness_pct: number;
  promotedUntil?: string | null;
  created_at: string;
}

export interface FounderInvestorContact {
  id: string;
  founder_id: string;
  investor_name: string;
  investor_linkedin: string | null;
  fund_name: string | null;
  relationship_description: string | null;
  sectors_invested_in: string[] | null;
  check_size_min: number | null;
  check_size_max: number | null;
  verified: boolean;
  created_at: string;
}

export interface FounderMatch {
  id: string;
  founder_a_id: string;
  founder_b_id: string;
  status: MatchStatus;
  matched_at: string;
  isBlindIntro?: boolean;
  // Joined data
  founder_a?: FounderProfile;
  founder_b?: FounderProfile;
}

export interface WarmIntroRequest {
  id: string;
  requesting_founder_id: string;
  introducing_founder_id: string;
  investor_contact_id: string;
  startup_id: string | null;
  blurb_sent: string | null;
  status: IntroRequestStatus;
  credits_used: number;
  created_at: string;
  updated_at: string;
  // Joined data
  investor_contact?: FounderInvestorContact;
  requesting_founder?: FounderProfile;
  introducing_founder?: FounderProfile;
}

export interface FounderMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_founder_id: string;
  referred_founder_id: string;
  credits_awarded: number;
  awarded_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType | null;
  title: string | null;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export type CallBookingStatus = 'pending' | 'accepted' | 'declined' | 'completed';

export interface CallBooking {
  id: string;
  investor_id: string | null;
  founder_id: string;
  startup_id: string | null;
  status: CallBookingStatus;
  calendly_link: string | null;
  message_from_founder: string | null;
  blurb_sent: string | null;
  payment_status: string;
  payment_amount: number | null;
  scheduled_at: string | null;
  created_at: string;
}

