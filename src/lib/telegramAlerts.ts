import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface TelegramAlertConfig {
  enabled: boolean;
  telegramChatId: string;
  telegramBotToken?: string;
  webhookUrl?: string;
  minimumFitScore: number;
}

const DEFAULT_CONFIG: TelegramAlertConfig = {
  enabled: true,
  telegramChatId: '',
  webhookUrl: '',
  minimumFitScore: 75,
};

/** Config is persisted per-user in Firestore (users/{uid}.telegram_alert_config). */
export async function getTelegramAlertConfig(uid: string): Promise<TelegramAlertConfig> {
  if (!uid) return { ...DEFAULT_CONFIG };
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    const cfg = snap.data()?.telegram_alert_config;
    if (cfg && typeof cfg === 'object') {
      return { ...DEFAULT_CONFIG, ...cfg };
    }
  } catch (_) {}
  return { ...DEFAULT_CONFIG };
}

export async function saveTelegramAlertConfig(uid: string, config: TelegramAlertConfig): Promise<boolean> {
  if (!uid) return false;
  try {
    await setDoc(doc(db, 'users', uid), { telegram_alert_config: { ...config } }, { merge: true });
    return true;
  } catch (_) {
    return false;
  }
}

export async function sendTestTelegramAlert(config: TelegramAlertConfig, investorName: string): Promise<{ success: boolean; message: string }> {
  const alertText = `🚀 *Raisequity High-Fit Deal Alert for ${investorName}*\n\n` +
    `*Company:* Test deal (fit alert)\n` +
    `*Round:* Seed\n` +
    `*Thesis Match:* ≥${config.minimumFitScore}% fit parameters matched\n` +
    `*Traction:* See platform for verified signals\n\n` +
    `🔗 [Open Deal Flow](https://raisequity.com/investor-dashboard/deals)`;

  // No chat id, no webhook, no real bot token → nothing can be delivered.
  if (!config.telegramChatId && !config.webhookUrl) {
    return { success: false, message: 'Add a Telegram chat ID (or webhook URL) before sending test alerts.' };
  }

  const botToken = (config.telegramBotToken || '').trim();
  if (config.telegramChatId && !botToken) {
    return { success: false, message: 'Telegram bot token is not configured. Alerts cannot be sent.' };
  }

  let delivered = false;
  const failures: string[] = [];

  if (config.telegramChatId && botToken) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text: alertText,
          parse_mode: 'Markdown',
        }),
      });
      if (r.ok) delivered = true;
      else failures.push(`Telegram API ${r.status}`);
    } catch (_) {
      failures.push('Telegram API unreachable');
    }
  }

  if (config.webhookUrl) {
    try {
      const r = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'deal.matched', investor: investorName, text: alertText, timestamp: new Date().toISOString() }),
      });
      if (r.ok) delivered = true;
      else failures.push(`Webhook ${r.status}`);
    } catch (_) {
      failures.push('Webhook unreachable');
    }
  }

  if (delivered) {
    return { success: true, message: 'Test alert delivered successfully.' };
  }
  return { success: false, message: `Alert could not be delivered: ${failures.join(', ') || 'unknown error'}` };
}
