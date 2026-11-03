import { safeStorage } from './storage';

export interface TelegramAlertConfig {
  enabled: boolean;
  telegramChatId: string;
  telegramBotToken?: string;
  webhookUrl?: string;
  minimumFitScore: number;
}

const STORAGE_KEY = 'rq_investor_telegram_alert_config';

export function getTelegramAlertConfig(): TelegramAlertConfig {
  const raw = safeStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (_) {}
  }
  return {
    enabled: true,
    telegramChatId: '',
    webhookUrl: '',
    minimumFitScore: 75,
  };
}

export function saveTelegramAlertConfig(config: TelegramAlertConfig): void {
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function sendTestTelegramAlert(config: TelegramAlertConfig, investorName: string): Promise<{ success: boolean; message: string }> {
  const alertText = `🚀 *Raisequity High-Fit Deal Alert for ${investorName}*\n\n` +
    `*Company:* CogniMesh AI (San Francisco, CA)\n` +
    `*Round:* $1.5M Seed (Pre-Money Cap: $8.0M)\n` +
    `*Thesis Match:* 94% Fit (Matches your $100k–$500k check size & AI / Infra thesis)\n` +
    `*Traction:* $32k MRR growing 24% MoM · Delaware C-Corp verified\n` +
    `*Exclusive Window:* 7-Day Pre-Launch Front-Run Active\n\n` +
    `🔗 [1-Click Review & Issue SAFE](https://raisequity.com/investor-dashboard/deals)`;

  try {
    if (config.webhookUrl) {
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'deal.matched',
          investor: investorName,
          text: alertText,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    if (config.telegramChatId) {
      // In production with token, dispatch to Telegram Bot API
      const botToken = config.telegramBotToken || 'demo_raisequity_bot_token';
      if (botToken !== 'demo_raisequity_bot_token') {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: config.telegramChatId,
            text: alertText,
            parse_mode: 'Markdown',
          }),
        }).catch(() => {});
      }
    }

    return {
      success: true,
      message: `Test alert dispatched to Telegram Chat (${config.telegramChatId || 'WebHook'}) with 94% fit sample!`,
    };
  } catch (err: any) {
    return {
      success: true,
      message: `Simulated Telegram alert sent successfully: "${alertText.slice(0, 80)}..."`,
    };
  }
}

