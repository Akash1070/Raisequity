import { GlobalConfig } from '../types';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  platform_fee_pct: 5,            // 5% flat fee on closed deals
  subscription_monthly_usd: 20,   // $20/month subscription
  subscription_reward_credits: 200, // 200 credits earned per $20 subscription renewal
  investor_referral_credits: 30,  // 30 credits per verified investor referral
  referral_reward_credits: 30,    // Alias
  success_fee_credit_cap_pct: 30, // Max 30% of success fee can be offset with credits
  free_monthly_intros: 5,         // Free monthly intro requests
  monthly_intro_free_cap: 5,
  trial_days: 15,                 // 15-day free trial on signup
  trial_starter_credits: 150,     // 150 starter credits on signup
  first_deal_discount_pct: 50,    // 50% discount on 1st closed deal success fee
  first_deal_waived: true,
  credit_costs: {
    feed_post: 1,                 // 1 credit per founder feed post
    extra_intro: 5,               // 5 credits per extra intro request beyond monthly cap
    boosted_bid: 10,              // 10 credits per boosted service bid
    promoted_dealflow: 20,        // 20 credits per week for dealflow promotion
    directory_featured: 50,       // 50 credits per week for homepage directory spot
  },
};

let cachedConfig: GlobalConfig | null = null;

/**
 * Fetch active platform fee configuration from Firestore config/fees doc
 */
export async function getGlobalConfig(): Promise<GlobalConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const configRef = doc(db, 'config', 'fees');
    const snap = await getDoc(configRef);

    if (snap.exists()) {
      const data = snap.data() as Partial<GlobalConfig>;
      cachedConfig = {
        ...DEFAULT_GLOBAL_CONFIG,
        ...data,
        credit_costs: {
          ...DEFAULT_GLOBAL_CONFIG.credit_costs,
          ...(data.credit_costs || {}),
        },
      };
      return cachedConfig;
    } else {
      // Seed default config if missing
      await setDoc(configRef, DEFAULT_GLOBAL_CONFIG);
      cachedConfig = DEFAULT_GLOBAL_CONFIG;
      return DEFAULT_GLOBAL_CONFIG;
    }
  } catch (err) {
    console.warn('[Config] Firestore read error, utilizing default config:', err);
    return DEFAULT_GLOBAL_CONFIG;
  }
}

/**
 * Update global platform fees and credit costs (Admin operation)
 */
export async function updateGlobalConfig(newConfig: Partial<GlobalConfig>): Promise<GlobalConfig> {
  try {
    const current = await getGlobalConfig();
    const updated: GlobalConfig = {
      ...current,
      ...newConfig,
      credit_costs: {
        ...current.credit_costs,
        ...(newConfig.credit_costs || {}),
      },
    };

    const configRef = doc(db, 'config', 'fees');
    await setDoc(configRef, updated);
    cachedConfig = updated;
    return updated;
  } catch (err) {
    console.error('[Config] Failed to update global config:', err);
    throw err;
  }
}

/**
 * Clear configuration cache
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}
