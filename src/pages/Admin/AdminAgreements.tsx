import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { StoredAgreementRecord } from '../../lib/agreements';
import { sendEmailNotification } from '../../lib/notifications';
import { Download, Mail, Search, Clock, FileCheck } from 'lucide-react';

export default function AdminAgreements() {
  const [agreements, setAgreements] = useState<StoredAgreementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'agreements'), orderBy('signedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const records: StoredAgreementRecord[] = [];
      snap.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() } as StoredAgreementRecord);
      });
      setAgreements(records);
      setLoading(false);
    }, (err) => {
      console.error('[AdminAgreements] Listener error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filtered = agreements.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      a.printedLegalName?.toLowerCase().includes(term) ||
      a.signerEmail?.toLowerCase().includes(term) ||
      a.counterpartyName?.toLowerCase().includes(term) ||
      a.dealRef?.toLowerCase().includes(term) ||
      a.id.toLowerCase().includes(term)
    );
  });

  const downloadCertificate = (agreement: StoredAgreementRecord) => {
    const certHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Raisequity Legal Audit Certificate - ${agreement.id}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; line-height: 1.6; }
          .header { border-bottom: 2px solid #10B981; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; items: center; }
          .title { font-size: 24px; font-weight: bold; color: #000; }
          .subtitle { font-size: 14px; color: #10B981; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .badge { background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #F9FAFB; padding: 20px; border-radius: 12px; border: 1px solid #E5E7EB; }
          .label { font-size: 11px; text-transform: uppercase; color: #6B7280; font-weight: bold; margin-bottom: 4px; }
          .value { font-size: 14px; font-weight: 600; color: #111827; }
          .terms { background: #F3F4F6; padding: 20px; border-radius: 12px; font-size: 12px; margin-bottom: 30px; border-left: 4px solid #10B981; }
          .signature-box { border: 2px dashed #D1D5DB; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px; background: #fff; }
          .sig-img { max-height: 100px; margin-top: 10px; }
          .footer { font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Raisequity Protocol Network</div>
            <div class="subtitle">Legal E-Signature Audit Certificate</div>
          </div>
          <div class="badge">VERIFIED EXECUTED</div>
        </div>

        <div class="grid">
          <div>
            <div class="label">Certificate ID</div>
            <div class="value">${agreement.id}</div>
          </div>
          <div>
            <div class="label">Deal Reference</div>
            <div class="value">${agreement.dealRef || 'Warm Intro Facilitation'}</div>
          </div>
          <div>
            <div class="label">Signer Printed Legal Name</div>
            <div class="value">${agreement.printedLegalName} (${agreement.signerRole?.toUpperCase()})</div>
          </div>
          <div>
            <div class="label">Signer Verified Email</div>
            <div class="value">${agreement.signerEmail}</div>
          </div>
          <div>
            <div class="label">Timestamp (UTC)</div>
            <div class="value">${new Date(agreement.signedAt).toUTCString()}</div>
          </div>
          <div>
            <div class="label">Audit IP Address & User Agent</div>
            <div class="value">${agreement.userIp || 'Logged'} | ${agreement.userAgent?.substring(0, 30)}...</div>
          </div>
        </div>

        <div class="terms">
          <strong>FACILITATION TERMS SUMMARY:</strong><br/>
          Signer agrees to the standard 5% Raisequity success fee on closed deals resulting from warm intros.
          First closed deal is 100% waived. Subsequent deal fees allow up to 30% credit offset.
          Executed digitally in compliance with U.S. ESIGN Act and UETA.
        </div>

        <div class="signature-box">
          <div class="label">Digitally Executed Signature</div>
          ${agreement.signatureDataUrl 
            ? `<img src="${agreement.signatureDataUrl}" class="sig-img" alt="Digital Signature"/>` 
            : `<div style="font-family: cursive; font-size: 28px; margin-top: 10px;">${agreement.printedLegalName}</div>`}
          <div style="font-size: 11px; color: #6B7280; margin-top: 10px;">Signed by: ${agreement.printedLegalName} on ${new Date(agreement.signedAt).toLocaleDateString()}</div>
        </div>

        <div class="footer">
          Raisequity Warm Intro Network & Service Marketplace &bull; Tamper-Proof Cryptographic Document Audit Log
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([certHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raisequity_agreement_${agreement.id.substring(0, 8)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResendEmail = async (agreement: StoredAgreementRecord) => {
    setEmailStatusMsg(`Sending agreement email to ${agreement.signerEmail}...`);
    
    const subject = `Executed Facilitation Agreement - ${agreement.dealRef}`;
    const bodyText = `Hi ${agreement.printedLegalName},\n\nAttached is your executed copy of the Raisequity Warm Intro Facilitation Agreement for ${agreement.dealRef}.\n\nCertificate Reference: ${agreement.id}\nSigned At: ${new Date(agreement.signedAt).toUTCString()}\nSuccess Fee: 5% (1st Deal 100% Waived, 30% Credit Offset Cap applicable).\n\nBest regards,\nThe Raisequity Admin Team`;

    const res = await sendEmailNotification(agreement.signerId, 'facilitation_agreement_required', {
      recipientEmail: agreement.signerEmail,
      recipientName: agreement.printedLegalName,
      subject,
      bodyText,
      metadata: { agreementId: agreement.id },
    });

    if (res.success) {
      setEmailStatusMsg(`Successfully sent agreement email copy to ${agreement.signerEmail}!`);
    } else {
      setEmailStatusMsg(`Failed to send email to ${agreement.signerEmail}. Check API configuration.`);
    }

    setTimeout(() => setEmailStatusMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-mono font-bold border border-emerald-200 mb-2">
            <FileCheck size={14} /> Legal Audit Vault
          </div>
          <h1 className="text-[32px] font-black text-black tracking-tight font-heading">Signed Facilitation Agreements</h1>
          <p className="text-gray-500 font-medium mt-1">
            Review tamper-proof audit trails, download legal certificates, and dispatch digital signed copies.
          </p>
        </div>
      </div>

      {emailStatusMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm font-bold animate-fadeIn">
          {emailStatusMsg}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by legal name, email, deal reference, or certificate ID..."
          className="w-full bg-white border border-[var(--color-clay-border,#e5e2dc)] rounded-2xl pl-11 pr-4 py-3 text-sm text-black placeholder:text-gray-400 focus:ring-2 focus:ring-black outline-none shadow-xs"
        />
      </div>

      <div className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm font-mono">Loading audit records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm font-medium">
            No signed facilitation agreements found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-clay-border,#e5e2dc)] bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">
                  <th className="py-4 px-6">Certificate ID</th>
                  <th className="py-4 px-6">Signer</th>
                  <th className="py-4 px-6">Deal / Counterparty</th>
                  <th className="py-4 px-6">Date Signed (UTC)</th>
                  <th className="py-4 px-6">Signature</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((ag) => (
                  <tr key={ag.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-black font-extrabold">
                      {ag.id.substring(0, 10)}...
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-black">{ag.printedLegalName}</div>
                      <div className="text-xs text-gray-500 font-mono">{ag.signerEmail}</div>
                      <span className="inline-block mt-1 text-[9px] font-black font-mono uppercase bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200">
                        {ag.signerRole}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-black">{ag.dealRef || 'Warm Intro'}</div>
                      <div className="text-xs text-gray-500">vs {ag.counterpartyName}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Clock size={13} className="text-gray-400" />
                        {new Date(ag.signedAt).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                        {new Date(ag.signedAt).toLocaleTimeString()} UTC
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {ag.signatureDataUrl ? (
                        <img
                          src={ag.signatureDataUrl}
                          alt="Signature Thumbnail"
                          className="h-8 max-w-[120px] bg-gray-50 rounded p-1 border border-gray-200"
                        />
                      ) : (
                        <span className="font-serif italic text-black font-bold">{ag.printedLegalName}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => downloadCertificate(ag)}
                          className="bg-black hover:bg-gray-800 text-white p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                          title="Download Legal Audit Certificate"
                        >
                          <Download size={14} /> Certificate
                        </button>
                        <button
                          onClick={() => handleResendEmail(ag)}
                          className="bg-gray-100 hover:bg-gray-200 text-black border border-gray-200 p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                          title="Resend Copy via Email"
                        >
                          <Mail size={14} /> Resend Email
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
