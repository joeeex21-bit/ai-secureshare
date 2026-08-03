import React, { useState, useEffect } from 'react';
import { 
  Share2, Clock, Lock, Copy, Check, QrCode, ShieldAlert, Sparkles, X, Flame
} from 'lucide-react';
import QRCode from 'qrcode';

export default function ShareModal({ file, onClose, onCreateShareLink }) {
  const [expiration, setExpiration] = useState('24h'); // '15m' | '1h' | '24h' | '7d' | '1view'
  const [customPassword, setCustomPassword] = useState(file.usedPassphrase || '');
  const [downloadLimit, setDownloadLimit] = useState(3);
  const [recipientEmail, setRecipientEmail] = useState('');
  
  const [generatedLink, setGeneratedLink] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate share link & QR code
  const handleGenerateLink = async () => {
    const shareId = 'share_' + Math.random().toString(36).substr(2, 12);

    // Calculate expiration timestamp
    let expTime = null;
    const now = Date.now();
    if (expiration === '15m') expTime = now + 15 * 60 * 1000;
    else if (expiration === '1h') expTime = now + 60 * 60 * 1000;
    else if (expiration === '24h') expTime = now + 24 * 60 * 60 * 1000;
    else if (expiration === '7d') expTime = now + 7 * 24 * 60 * 60 * 1000;
    else if (expiration === '1view') expTime = now + 24 * 60 * 60 * 1000; // max 24h for 1view

    const shareObject = {
      shareId,
      fileId: file.id,
      fileName: file.originalName,
      fileSize: file.originalSize,
      fileType: file.originalType,
      checksum: file.checksum,
      ciphertextBase64: file.ciphertextBase64,
      saltBase64: file.saltBase64,
      ivBase64: file.ivBase64,
      passphrase: customPassword,
      expiration: expTime,
      expirationType: expiration,
      downloadLimit: expiration === '1view' ? 1 : downloadLimit,
      downloadsRemaining: expiration === '1view' ? 1 : downloadLimit,
      recipientEmail,
      createdAt: new Date().toISOString()
    };

    onCreateShareLink(shareObject);

    // Build URL (simulated web share link hash)
    const fullUrl = `${window.location.origin}/#share=${shareId}`;
    setGeneratedLink(fullUrl);

    try {
      const qr = await QRCode.toDataURL(fullUrl, {
        color: { dark: '#38bdf8', light: '#090d16' },
        width: 200,
        margin: 1
      });
      setQrCodeDataUrl(qr);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl p-6 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-6 bg-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-lg text-slate-100">Create Encrypted Share Link</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target File summary */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Payload File:</p>
            <p className="font-semibold text-sm text-slate-200">{file.originalName}</p>
          </div>
          <span className="px-2 py-1 text-[11px] font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 rounded">
            AES-256-GCM
          </span>
        </div>

        {!generatedLink ? (
          <div className="space-y-4">
            
            {/* Expiration Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Link Expiration Policy</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: '15m', label: '15 Mins' },
                  { id: '1h', label: '1 Hour' },
                  { id: '24h', label: '24 Hours' },
                  { id: '7d', label: '7 Days' },
                  { id: '1view', label: 'Self-Destruct (1 View)', icon: Flame }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setExpiration(opt.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                      expiration === opt.id
                        ? opt.id === '1view'
                          ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-sm'
                          : 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Passphrase */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Decryption Passphrase</span>
              </label>
              <input
                type="text"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="Passphrase required by recipient..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {/* Download Limit */}
            {expiration !== '1view' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Max Allowed Downloads
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={downloadLimit}
                  onChange={(e) => setDownloadLimit(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            )}

            {/* Submit Generate Button */}
            <button
              onClick={handleGenerateLink}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Generate Zero-Trust Share Link</span>
            </button>

          </div>
        ) : (
          /* Generated Link & QR View */
          <div className="space-y-5 text-center">
            
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3">
              <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Encrypted Share Link Active
              </p>
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* QR Code preview */}
            {qrCodeDataUrl && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 inline-block mx-auto">
                <img src={qrCodeDataUrl} alt="QR Code" className="w-36 h-36 mx-auto rounded" />
                <p className="text-[11px] text-slate-400 mt-2 font-mono">Scan on mobile to receive payload</p>
              </div>
            )}

            <div className="border-t border-slate-800 pt-4 flex justify-between">
              <button
                onClick={() => setGeneratedLink('')}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Configure New Share
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Done
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
