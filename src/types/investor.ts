// ============================================================
// Investor Terminal Types — mirrors Firestore collections
// ============================================================

export type InvestorType = 'angel' | 'vc' | 'family_office' | 'corporate' | 'grant_provider' | 'accelerator';
export type AIMatchStatus = 'active' | 'dismissed' | 'interested';

export interface InvestorProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  linkedin_url: string | null;
  fund_name: string | null;
  fund_website: string | null;
  investor_type: InvestorType | null;
  bio: string | null;
  profile_photo_url: string | null;
  calendly_link: string | null;
  cal_link: string | null;
  quiet_mode: boolean;
  call_fee_usd: number;
  onboarding_complete: boolean;
  created_at: string;
}

export interface InvestorPreferences {
  id: string;
  investor_id: string;
  preferred_sectors: string[] | null;
  preferred_stages: string[] | null;
  min_check_size: number | null;
  max_check_size: number | null;
  geography: string | null;
  thesis_description: string | null;
}

export interface InvestorSavedStartup {
  id: string;
  investor_id: string;
  startup_id: string;
  created_at: string;
  // Joined
  startup?: import('./founder').Startup;
}

export interface AIMatch {
  id: string;
  investor_id: string;
  startup_id: string;
  founder_id: string;
  match_score: number | null;
  match_reason: string | null;
  sectors_aligned: string[] | null;
  stage_aligned: boolean | null;
  check_size_aligned: boolean | null;
  status: AIMatchStatus;
  created_at: string;
  // Joined
  startup?: import('./founder').Startup;
  founder?: import('./founder').FounderProfile;
}

export interface InvestorNote {
  id: string;
  investor_id: string;
  founder_id: string;
  startup_id?: string | null;
  note_text: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  investor_id: string;
  startup_id: string;
  founder_id: string;
  closed_at: string;
  deal_amount_usd?: number | null;
  notes?: string | null;
  // Joined startup & founder details
  startup?: import('./founder').Startup;
  founder?: import('./founder').FounderProfile;
}

export interface InvestorOnboardingData {
  // Step 1 - Identity
  full_name: string;
  linkedin_url: string;
  investor_type: InvestorType | '';
  fund_name: string;
  fund_website: string;
  bio: string;
  calendly_link: string;
  cal_link: string;
  quiet_mode: boolean;
  call_fee_usd: string;
  // Step 2 - Thesis
  preferred_sectors: string[];
  preferred_stages: string[];
  min_check_size: string;
  max_check_size: string;
  geography: string;
  thesis_description: string;
}

export type Web3InvestorCategory = 'VC Fund' | 'Angel Investor' | 'Accelerator' | 'Incubator' | 'Family Office' | 'Ecosystem Fund' | 'Other';

export interface Web3Investor {
  id: string;
  name: string;
  firm: string;
  category: string;
  role?: string;
  sectors: string[];
  stage: string;
  check_size: string;
  location?: string;
  email?: string;
  telegram?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  avatar_url?: string;
  verified?: boolean;
  know_count?: number;
  created_at?: string;
}
