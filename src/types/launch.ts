export type LaunchTier = 'standard' | 'premium' | 'spotlight';

export interface LaunchItem {
  id: string;
  slug: string;
  founder_id: string;
  founder_name?: string;
  company_name: string;
  tagline: string; // Max 70 chars, no trailing period
  description: string; // Max 600 chars
  website_url: string;
  logo_url: string; // 512x512
  screenshots: string[]; // up to 4, 16:10 ratio
  category: string; // e.g. DeFi, AI, Infrastructure, Gaming, RWA, Mobile, Tooling
  twitter_handle?: string;
  maker_comment?: string; // Pinned maker comment: "tell the community why you built this..."
  launch_tier: LaunchTier;
  scheduled_date: string;
  status: 'queue' | 'launched';
  badgeVerified: boolean;
  votes_count: number;
  created_at: string;
  is_winner?: boolean; // Launch of the week badge
  target_keywords?: string[]; // For Spotlight tier SEO optimization
  raising_status?: string;
  target_raise?: string;
  valuation_cap?: string;
  demo_url?: string;
  github_url?: string;
  telegram_url?: string;
  traction_metric?: string;
  problem_solved?: string;
  target_audience?: string;
  ecosystem_chain?: string[];
  token_status?: string;
  product_stage?: string;
  deck_url?: string;
}

export interface LaunchSubmissionData {
  website_url: string;
  company_name: string;
  tagline: string;
  description: string;
  logo_url: string;
  screenshots: string[];
  category: string;
  twitter_handle?: string;
  maker_comment?: string;
  launch_tier: LaunchTier;
  scheduled_date?: string;
  target_keywords?: string[];
  raising_status?: string;
  target_raise?: string;
  valuation_cap?: string;
  demo_url?: string;
  github_url?: string;
  telegram_url?: string;
  traction_metric?: string;
  problem_solved?: string;
  target_audience?: string;
  ecosystem_chain?: string[];
  token_status?: string;
  product_stage?: string;
  deck_url?: string;
}

export interface LaunchVote {
  id: string;
  launch_id: string;
  user_id: string;
  created_at: string;
}

export interface LaunchComment {
  id: string;
  launch_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  comment_text: string;
  is_maker?: boolean;
  created_at: string;
}

export interface SponsorItem {
  id: string;
  company_name: string;
  tagline: string;
  url: string;
  logo_url?: string;
  banner_cta?: string;
  active: boolean;
  starts_at: string;
  expires_at: string;
  created_at: string;
}
