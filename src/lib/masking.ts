import { checkAgreementStatus } from './opensign';

export interface MaskedIntroDetails {
  introRequestId: string;
  maskedAliasEmail: string;
  isAgreementSigned: boolean;
  unlockedInvestorEmail?: string | null;
}

/**
 * Generate contact alias for founder->investor warm intro routing
 */
export function getMaskedContactAlias(introRequestId: string): string {
  const adminEmail = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_EMAIL) || 
                     (typeof process !== 'undefined' && process.env?.VITE_ADMIN_EMAIL) || 
                     '8093akash@gmail.com';
  
  // Gmail plus-addressing format: 8093akash+intro-{introRequestId}@gmail.com
  const cleanId = introRequestId.replace(/[^a-zA-Z0-9]/g, '');
  return `8093akash+intro-${cleanId}@gmail.com`;
}

/**
 * Check if direct investor contact details can be revealed to founder
 */
export async function getIntroContactDetails(
  introRequestId: string,
  rawInvestorEmail: string
): Promise<MaskedIntroDetails> {
  const isAgreementSigned = await checkAgreementStatus(introRequestId);
  const maskedAliasEmail = getMaskedContactAlias(introRequestId);

  if (!isAgreementSigned) {
    return {
      introRequestId,
      maskedAliasEmail,
      isAgreementSigned: false,
      unlockedInvestorEmail: null, // Masked prior to agreement completion
    };
  }

  return {
    introRequestId,
    maskedAliasEmail,
    isAgreementSigned: true,
    unlockedInvestorEmail: rawInvestorEmail,
  };
}
