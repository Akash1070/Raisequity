export type Sector = 
  | "DeFi" 
  | "Infrastructure" 
  | "Gaming" 
  | "SocialFi" 
  | "NFT" 
  | "AI" 
  | "RWA" 
  | "Fintech" 
  | "DeSci" 
  | "Real Estate" 
  | "Energy"
  | "SaaS"
  | "Marketplace"
  | "Consumer";

export type UserRole = 'founder' | 'investor' | 'service_provider' | 'scout_admin' | 'scout' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  linkedin_url: string | null;
  company_name?: string | null;
  onboarding_completed: boolean;
  is_approved: boolean; // Required for investors before transacting
  first_deal_fee_waived: boolean; // Track if 1st closed deal 5% fee gets 50% discount
  subscription_status?: 'trial' | 'active' | 'expired' | 'canceled';
  trial_ends_at?: string;
  has_active_subscription?: boolean;
  credit_balance: number;
  credits?: number; // Alias for credit_balance
  referral_code?: string;
  referred_by?: string | null;
  facilitationAgreementRef?: string | null;
  created_at: string;
}

export type TransactionType = 'subscription' | 'success_fee' | 'mentorship' | 'service';
export type CollectionMethod = 'dodo' | 'usdt_manual' | 'credits';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  platform_fee_pct: number;
  status: 'pending' | 'pending_invoice' | 'completed' | 'paid' | 'failed' | 'waived';
  collectionMethod: CollectionMethod;
  dodoPaymentId?: string;
  usdtTxHash?: string;
  dealRef?: string;
  createdAt: string;
}

export type CreditTxType = 'earn' | 'spend';
export type CreditTxSource = 
  | 'subscription_reward' 
  | 'referral' 
  | 'success_fee_offset' 
  | 'placement_purchase' 
  | 'quota_purchase'
  | 'feed_post'
  | 'extra_intro'
  | 'boosted_bid'
  | 'promoted_dealflow'
  | 'directory_featured'
  | 'trial_starter';

export interface CreditTransaction {
  id: string;
  userId: string;
  type: CreditTxType;
  source: CreditTxSource;
  amount: number;
  balanceAfter: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CreditCostsConfig {
  feed_post: number;          // Default: 1 credit
  extra_intro: number;        // Default: 5 credits
  boosted_bid: number;        // Default: 10 credits
  promoted_dealflow: number;  // Default: 20 credits
  directory_featured: number; // Default: 50 credits
}

export interface GlobalConfig {
  platform_fee_pct: number;           // Default: 5%
  subscription_monthly_usd: number;   // Default: $20
  subscription_reward_credits: number;// Default: 200 credits
  investor_referral_credits: number;  // Default: 30 credits
  referral_reward_credits?: number;   // Alias for investor_referral_credits
  success_fee_credit_cap_pct: number; // Default: 30% max offset
  free_monthly_intros: number;        // Default: 5 intros/month
  monthly_intro_free_cap?: number;    // Alias for free_monthly_intros
  trial_days: number;                 // Default: 15 days
  trial_starter_credits: number;      // Default: 100 credits
  first_deal_discount_pct: number;    // Default: 50% discount on 1st deal fee
  first_deal_waived?: boolean;        // Helper flag
  credit_costs: CreditCostsConfig;
}

export type ReferralStatus = 'invited' | 'joined' | 'verified' | 'rewarded';

export interface ReferralRecord {
  id: string;
  referrerUid: string;
  referrerName?: string;
  inviteeEmail: string;
  inviteeRole: UserRole;
  status: ReferralStatus;
  createdAt: string;
  joinedAt?: string;
  verifiedAt?: string;
  rewardedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  sector: Sector;
  stage: string;
  raiseRange: string;
  oneLiner: string;
  fullDescription: string;
  traction: string;
  problemSolution?: string; 
  teamBackground?: string; 
  keyFeatures?: string[];
  partners?: string[];
  location?: string;
  arr?: string;
  businessModel?: string;
  founderBackground?: string;
  links?: {
    website?: string;
    twitter?: string;
    deck?: string;
    dataRoom?: string; 
    telegram?: string;
    discord?: string;
    linkedin?: string;
    docs?: string;
    whitepaper?: string;
    youtube?: string;
    medium?: string;
    calendly?: string;
  };
  fundingDetails?: {
    raised?: string;
    raising?: string;
    valuation?: string;
    tge?: string;
    minTicket?: string;
    tokenomics?: string;
  };
  matchingData?: {
    raiseAmount?: string;
    instrument?: "Equity" | "SAFE" | "SAFT" | "Token" | "Mixed";
    targetValuation?: string;
    runway?: string;
    revenueStreams?: string;
    expectedRevenueDate?: string;
    targetInvestorTypes?: string[];
    geographies?: string[];
    supportNeeded?: string[];
  };
  featured?: boolean;
}

export interface Investor {
  id: string;
  name: string;
  firm: string;
  role: string;
  image: string;
  sectors: Sector[];
  stage: string[];
  ticketSize: string;
  location: string;
  introFee: number;
  callFee: number;
  bio: string;
  rating: number;
  reviews?: number;
  is_approved?: boolean;
}

export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  servicesOffered: string[];
  pricingRange: string;
  bio: string;
  rating: number;
  verified: boolean;
}

export interface InvestorConnection {
  id: string;
  founderId: string;
  founderName: string;
  founderCompany?: string;
  investorName: string;
  investorFirm: string;
  sectors: Sector[];
  stage: string[];
  ticketSize: string;
  createdAt: string;
}

export interface IntroRequest {
  id: string;
  requestingFounderId: string;
  requestingFounderName: string;
  requestingFounderEmail: string;
  connectingFounderId: string;
  connectingFounderName: string;
  connectingFounderEmail: string;
  investorRef: string;
  investorName: string;
  investorFirm: string;
  status: 'pending' | 'accepted' | 'declined' | 'closed';
  facilitationAgreementRef?: string | null;
  createdAt: string;
  lastActivityAt?: string;
}

export interface IntroMessage {
  id: string;
  introRequestId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export type CRMStage = 'researching' | 'contacted' | 'in_conversation' | 'term_sheet' | 'closed' | 'passed';

export interface PipelineEntry {
  id: string;
  founderId: string;
  investorName: string;
  investorFirm: string;
  stage: CRMStage;
  targetAmount?: number;
  committedAmount?: number;
  notes?: string;
  updatedAt: string;
  isPlatformConnection?: boolean;
}

export interface DealOutcome {
  id: string;
  introRequestId: string;
  founderId: string;
  investorName: string;
  raiseClosed: boolean;
  amount: number;
  reportedBy: string;
  confirmedAt: string;
}

export interface DealReview {
  id: string;
  dealOutcomeId: string;
  raterUid: string;
  raterName: string;
  rating: number; // 1 to 5 stars
  comment: string;
  createdAt: string;
}
