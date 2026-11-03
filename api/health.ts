export default function handler(_req: any, res: any) {
  res.status(200).json({
    ok: true,
    ts: new Date().toISOString(),
    services: {
      email: Boolean(process.env.RESEND_API_KEY),
      payments: Boolean(process.env.DODO_PAYMENTS_API_KEY && process.env.DODO_SUBSCRIPTION_PRODUCT_ID),
      esign: Boolean(process.env.OPENSIGN_API_KEY),
      ai: Boolean(process.env.GEMINI_API_KEY),
      webhookActivation: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON && process.env.DODO_WEBHOOK_SECRET),
    },
  });
}
