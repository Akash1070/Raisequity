export type MessageRole = 'founder' | 'investor' | 'service_provider' | 'admin' | 'scout';

export interface ConversationParticipant {
  id: string;
  name: string;
  email: string;
  role: MessageRole;
  avatar_url?: string;
  company_name?: string;
  headline?: string;
}

export interface ConversationDealContext {
  deal_id?: string;
  deal_name?: string;
  stage?: string;
  target_raise?: string;
  valuation_cap?: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  participants: Record<string, ConversationParticipant>;
  last_message: string;
  last_message_at: string;
  last_sender_id: string;
  unread_count: Record<string, number>;
  deal_context?: ConversationDealContext | null;
  created_at: string;
  updated_at: string;
}

export type DirectMessageType = 'text' | 'safe_offer' | 'call_request' | 'memo_share';

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_avatar?: string;
  recipient_id: string;
  content: string;
  message_type?: DirectMessageType;
  metadata?: Record<string, any>;
  created_at: string;
  read: boolean;
}
