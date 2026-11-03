import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { safeStorage } from '../lib/storage';

// Function to calculate profile completeness based on the dashboard logic
function calculateCompleteness(profile: any, contactsCount: number) {
  const requiredFields = [
    profile?.full_name,
    profile?.linkedin_url,
    profile?.company_name,
    profile?.what_company_does,
    profile?.traction_signal,
    profile?.opportunity_stat,
    profile?.why_now,
    profile?.team_credential,
    profile?.funding_goal,
    profile?.stage,
    profile?.sector
  ];

  const requiredFieldsFilled = requiredFields.filter(Boolean).length;
  const contactsFilled = contactsCount >= 3 ? 1 : 0;
  
  const totalRequired = requiredFields.length + 1; // +1 for the 3 contacts
  return Math.round(((requiredFieldsFilled + contactsFilled) / totalRequired) * 100);
}

// Function to calculate credits after a referral
function calculateReferralCredits(currentCredits: number, isReferred: boolean) {
  const REFERRAL_BONUS = 300;
  return isReferred ? currentCredits + REFERRAL_BONUS : currentCredits;
}

describe('Founder Dashboard Business Logic Tests', () => {
  
  describe('Profile Completeness Scoring', () => {
    it('should return 100% when all profile fields are filled and contacts >= 3', () => {
      const mockProfile = {
        full_name: 'Jane Doe',
        linkedin_url: 'https://linkedin.com/in/janedoe',
        company_name: 'Web3 Innovators',
        what_company_does: 'Decentralized identity protocols.',
        traction_signal: '$50k MRR and 10k MAU.',
        opportunity_stat: 'TAM of $50B growing 30% YoY.',
        why_now: 'Regulatory shifts and mainstream L2 readiness.',
        team_credential: 'Ex-Google DeepMind engineers.',
        funding_goal: '$1.5M Seed',
        stage: 'Seed',
        sector: 'Web3 Infrastructure'
      };
      
      const score = calculateCompleteness(mockProfile, 3);
      expect(score).toBe(100);
    });

    it('should return 0% when profile is empty and contacts are 0', () => {
      const mockProfile = {};
      const score = calculateCompleteness(mockProfile, 0);
      expect(score).toBe(0);
    });

    it('should calculate partial completeness correctly', () => {
      const mockProfile = {
        full_name: 'Jane Doe',
        linkedin_url: 'https://linkedin.com/in/janedoe',
        company_name: 'Web3 Innovators',
        what_company_does: 'Decentralized identity protocols.',
        traction_signal: '$50k MRR and 10k MAU.'
      };
      
      const score = calculateCompleteness(mockProfile, 0);
      expect(score).toBe(42);
    });

    it('should count contacts as 0 if less than 3', () => {
      const mockProfile = {
        full_name: 'Jane Doe',
        linkedin_url: 'https://linkedin.com/in/janedoe',
        company_name: 'Web3 Innovators',
        what_company_does: 'Decentralized identity protocols.',
        traction_signal: '$50k MRR and 10k MAU.',
        opportunity_stat: 'TAM of $50B growing 30% YoY.',
        why_now: 'Regulatory shifts and mainstream L2 readiness.',
        team_credential: 'Ex-Google DeepMind engineers.',
        funding_goal: '$1.5M Seed',
        stage: 'Seed',
        sector: 'Web3 Infrastructure'
      };
      
      const score = calculateCompleteness(mockProfile, 2);
      expect(score).toBe(92);
    });
  });

  describe('Credits Allocation math', () => {
    it('should add 300 credits for referred users', () => {
      const credits = calculateReferralCredits(100, true);
      expect(credits).toBe(400);
    });

    it('should not add credits if user was not referred', () => {
      const credits = calculateReferralCredits(100, false);
      expect(credits).toBe(100);
    });
  });

  describe('Safe Storage QuotaExceeded Protection', () => {
    let mockStorage: Record<string, string> = {};

    beforeEach(() => {
      mockStorage = {};
      (global as any).window = {
        localStorage: {
          getItem: (k: string) => mockStorage[k] ?? null,
          setItem: (k: string, v: string) => { mockStorage[k] = v; },
          removeItem: (k: string) => { delete mockStorage[k]; },
          length: 0,
          key: (_: number) => null,
        },
        sessionStorage: {
          getItem: (k: string) => mockStorage[k] ?? null,
          setItem: (k: string, v: string) => { mockStorage[k] = v; },
          removeItem: (k: string) => { delete mockStorage[k]; },
        }
      };
    });

    afterEach(() => {
      delete (global as any).window;
    });

    it('stores and retrieves items safely', () => {
      safeStorage.setItem('test_key_1', 'hello world');
      expect(safeStorage.getItem('test_key_1')).toBe('hello world');
      safeStorage.removeItem('test_key_1');
      expect(safeStorage.getItem('test_key_1')).toBe(null);
    });

    it('gracefully handles QuotaExceededError in localStorage without throwing', () => {
      window.localStorage.setItem = vi.fn().mockImplementation(() => {
        const err = new Error('Setting the value exceeded the quota.');
        err.name = 'QuotaExceededError';
        throw err;
      });

      expect(() => {
        const success = safeStorage.setItem('rq_onboarding_draft_test', JSON.stringify({ step: 2 }));
        expect(success).toBe(true);
      }).not.toThrow();

      expect(safeStorage.getItem('rq_onboarding_draft_test')).toBe(JSON.stringify({ step: 2 }));
      safeStorage.removeItem('rq_onboarding_draft_test');
    });

    it('falls back to in-memory store when all Web Storage throws', () => {
      window.localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      window.sessionStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('QuotaExceededError in sessionStorage');
      });

      expect(() => {
        const result = safeStorage.setItem('rq_onboarding_completed_test_user', 'true');
        expect(result).toBe(true);
      }).not.toThrow();

      expect(safeStorage.getItem('rq_onboarding_completed_test_user')).toBe('true');
      safeStorage.removeItem('rq_onboarding_completed_test_user');
    });
  });
});
