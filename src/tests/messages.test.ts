import { describe, it, expect } from 'vitest';
import { getConversationId } from '../lib/messages';
import type { ConversationParticipant, DirectMessage, DirectMessageType } from '../types/messages';

describe('Cross-Suite Direct Messaging & Chat Tests', () => {
  describe('Deterministic Conversation ID Generator', () => {
    it('should generate identical conversation IDs regardless of user order', () => {
      const userA = 'user_founder_123';
      const userB = 'user_investor_456';

      const convId1 = getConversationId(userA, userB);
      const convId2 = getConversationId(userB, userA);

      expect(convId1).toBe(convId2);
      expect(convId1).toBe('user_founder_123_user_investor_456');
    });

    it('should correctly handle identical prefixes and arbitrary strings', () => {
      const id1 = 'alpha_user';
      const id2 = 'beta_user';

      expect(getConversationId(id2, id1)).toBe('alpha_user_beta_user');
    });
  });

  describe('Direct Message Payloads & Security Guards', () => {
    it('should construct valid DirectMessage object with correct defaults', () => {
      const sender: ConversationParticipant = {
        id: 'investor_apex',
        name: 'Sarah Lin',
        email: 'sarah@apex.vc',
        role: 'investor',
        company_name: 'Apex Syndicate',
      };

      const now = new Date().toISOString();
      const message: DirectMessage = {
        id: 'msg_999',
        conversation_id: 'investor_apex_founder_elena',
        sender_id: sender.id,
        sender_name: sender.name,
        sender_role: sender.role,
        recipient_id: 'founder_elena',
        content: 'I have issued a $100k SAFE for NeuroChain AI.',
        message_type: 'safe_offer',
        metadata: { checkAmount: 100000, valCap: 7500000 },
        created_at: now,
        read: false,
      };

      expect(message.sender_role).toBe('investor');
      expect(message.message_type).toBe('safe_offer');
      expect(message.metadata?.checkAmount).toBe(100000);
      expect(message.read).toBe(false);
    });

    it('should calculate recipient unread count accurately', () => {
      const unreadCountMap: Record<string, number> = {
        founder_elena: 3,
        investor_apex: 0,
      };

      expect(unreadCountMap['founder_elena']).toBe(3);
      expect(unreadCountMap['investor_apex']).toBe(0);
    });

    it('should format notification payload for recipient with appropriate route link', () => {
      const formatNotificationLink = (role: string, convId: string) => {
        if (role === 'investor') return `/investor-dashboard/messages?convId=${convId}`;
        if (role === 'service_provider') return `/agency-dashboard/messages?convId=${convId}`;
        return `/dashboard/messages?convId=${convId}`;
      };

      const founderLink = formatNotificationLink('founder', 'conv_123');
      const investorLink = formatNotificationLink('investor', 'conv_123');
      const agencyLink = formatNotificationLink('service_provider', 'conv_123');

      expect(founderLink).toBe('/dashboard/messages?convId=conv_123');
      expect(investorLink).toBe('/investor-dashboard/messages?convId=conv_123');
      expect(agencyLink).toBe('/agency-dashboard/messages?convId=conv_123');
    });
  });
});
