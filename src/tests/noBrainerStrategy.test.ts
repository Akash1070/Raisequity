import { describe, it, expect } from 'vitest';
import { buildInstitutionalMemo } from '../lib/institutionalMemo';
import { issueStandardSafeAgreement } from '../lib/opensign';
import { 
  getTelegramAlertConfig, 
  saveTelegramAlertConfig, 
  sendTestTelegramAlert 
} from '../lib/telegramAlerts';

describe('Product Owner Strategy: No-Brainer Features Test Suite', () => {
  describe('Founder Due Diligence Fast-Pass Institutional Memo', () => {
    it('builds a compliant 1-page institutional tear sheet from founder profile and startup data', () => {
      const mockProfile = {
        company_name: 'AetherScale AI',
        what_company_does: 'Distributed GPU orchestration for deep learning workloads.',
        sector: 'AI',
        stage: 'Seed',
        funding_goal: '$1,500,000',
        location: 'San Francisco, CA',
        traction_signal: '$45,000 MRR growing 25% MoM',
        team_credential: 'Ex-Google DeepMind core infra team',
        arr: 540000,
      };

      const mockStartup = {
        name: 'AetherScale AI',
        raise_amount: 1500000,
        sector: 'AI',
        stage: 'Seed',
        website_url: 'https://aetherscale.ai',
      };

      const memo = buildInstitutionalMemo(mockProfile, mockStartup);

      expect(memo.companyName).toBe('AetherScale AI');
      expect(memo.raiseAmountFormatted).toBe('$1.5M');
      expect(memo.valuationCap).toBe('$7.5M Cap');
      expect(memo.instrument).toBe('Post-Money SAFE');
      expect(memo.verificationBadges.delawareEntity).toBe(true);
      expect(memo.verificationBadges.githubVerified).toBe(true);
      expect(memo.raiseReadinessScore).toBe(92);
      expect(memo.tractionMetrics.length).toBeGreaterThanOrEqual(3);
    });

    it('selects Token SAFT for Web3 / DeFi sectors', () => {
      const mockProfile = {
        company_name: 'Solara Labs',
        sector: 'DeFi',
        stage: 'Seed',
        funding_goal: '$2,000,000',
      };

      const memo = buildInstitutionalMemo(mockProfile, null);
      expect(memo.instrument).toBe('Token SAFT');
    });
  });

  describe('Investor 1-Click OpenSign Standardized SAFE Execution', () => {
    it('creates a standardized SAFE agreement receipt and signing URL without legal fees', async () => {
      const payload = {
        companyId: 'comp_123',
        companyName: 'AetherScale AI',
        founderName: 'Alex Founder',
        founderEmail: 'alex@aetherscale.ai',
        investorId: 'inv_456',
        investorName: 'Horizon Ventures Partner',
        investorEmail: 'partner@horizonvc.com',
        checkAmountUsd: 100000,
        valuationCapUsd: 8000000,
        discountPct: 20,
        instrumentType: 'Post-Money SAFE' as const,
      };

      const result = await issueStandardSafeAgreement(payload);
      expect(result.status).toBe('pending');
      expect(result.documentId).toBeDefined();
      expect(result.signingUrl).toContain('opensign');
    });
  });

  describe('Investor Telegram Alert Bot & Webhook Configuration', () => {
    it('saves and reads investor alert settings safely', () => {
      saveTelegramAlertConfig({
        enabled: true,
        telegramChatId: '@vc_alpha_deals',
        webhookUrl: 'https://hooks.slack.com/services/test',
        minimumFitScore: 85,
      });

      const config = getTelegramAlertConfig();
      expect(config.telegramChatId).toBe('@vc_alpha_deals');
      expect(config.minimumFitScore).toBe(85);
      expect(config.enabled).toBe(true);
    });

    it('dispatches a simulated instant thesis match alert to Telegram', async () => {
      const config = {
        enabled: true,
        telegramChatId: '@vc_test_channel',
        minimumFitScore: 80,
      };

      const res = await sendTestTelegramAlert(config, 'General Partner John');
      expect(res.success).toBe(true);
      expect(res.message).toBeDefined();
    });
  });
});

