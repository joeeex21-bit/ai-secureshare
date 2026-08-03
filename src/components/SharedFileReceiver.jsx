import React, { useState, useEffect } from 'react';
import { 
  Lock, Key, Download, CheckCircle2, AlertTriangle, ShieldCheck, Clock, Flame, ArrowLeft
} from 'lucide-react';
import { decryptFile, formatBytes } from '../crypto/cryptoEngine';

export default function SharedFileReceiver({ shareData, onBackToApp, onRecordDownload }) {
  const [passphrase, setPassphrase] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptResult, setDecryptResult] = useState(null);
  const [timeLeftStr, setTimeLeftStr] = useState('');

  // Live timer for link expiration
  useEffect(() => {
    if (!shareData || !shareData.expiration) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = shareData.expiration - now;

      if (diff <= 0) {
        setTimeLeftStr('Expired');
        clearInterval(timer);
      } else {
        const mins = Math.floor(diff / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        const hrs = Math.floor(mins / 60);
        
        if (hrs > 0) {
          setTimeLeftStr(`${hrs}h ${mins % 60}m remaining`);
        } else {
          setTimeLeftStr(`${mins}m ${secs}s remaining`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [shareData]);

  if (!shareData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 cyber-bg text-slate-100">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center border border-rose-500/30 space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold">Invalid or Expired Share Link</h2>
          <p className="text-xs text-slate-400">
            This share link does not exist, has expired, or reached its maximum download limit.
          </p>
          <button
            onClick={onBackToApp}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
          >
            Return to AI-SecureShare App
          </button>
        </div>
      </div>
    );
  }

  // Handle Decryption
  const handleDecrypt = async () => {
    if (!passphrase) return;

    setIsDecrypting(true);
    setDecryptResult(null);

    try {
      const res = await decryptFile(shareData, passphrase);
      setDecryptResult(res);

      if (res.success) {
        onRecordDownload(shareData.shareId);
      }
    } catch (err) {
      setDecryptResult({ success: false, error: err.message });
    } finally {
      setIsDecrypting(false);
    }
  };

  // Download Blob
  const handleDownloadBlob = () => {
    if (!decryptResult || !decryptResult.blob) return;
    const url = URL.createObjectURL(decryptResult.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = decryptResult.fileName || shareData.fileName || 'decrypted_shared_file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isExpired = shareData.expiration && Date.now() > shareData.expiration;

  return (
    <div className="min-h-screen cyber-bg py-12 px-4 flex items-center justify-center">
      <div className="glass-panel w-full max-w-xl p-8 rounded-3xl border border-cyan-500/30 shadow-2xl space-y-6 bg-slate-950/90">
        
        {/* Back navigation button */}
        <button
          onClick={onBackToApp}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Launch AI-SecureShare Workspace</span>
        </button>

        {/* Portal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Zero-Trust Encrypted File Sharing</h1>
          <p className="text-xs text-slate-400">
            Client-side AES-256-GCM encrypted payload. Decrypted directly in your browser.
          </p>
        </div>

        {/* Share Policy Badges */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Target File:</span>
            <span className="font-semibold text-slate-100 text-sm">{shareData.fileName}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Encrypted Size:</span>
            <span className="text-cyan-300">{formatBytes(shareData.fileSize)}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Link Expiration:</span>
            <span className="text-amber-400 font-bold flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeftStr || '24 Hours'}</span>
            </span>
          </div>

          {shareData.expirationType === '1view' && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <Flame className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Self-Destruct Active: Link will self-destruct after this download.</span>
            </div>
          )}
        </div>

        {isExpired ? (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-center space-y-1 text-sm">
            <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
            <p className="font-bold">This link has expired</p>
            <p className="text-xs text-slate-400">Request a new share link from the sender.</p>
          </div>
        ) : (
          /* Passphrase Form & Decrypt */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                <span>Enter Decryption Passphrase</span>
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Required passphrase provided by sender..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {decryptResult && (
              <div className={`p-4 rounded-xl border text-sm space-y-2 ${
                decryptResult.success 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <div className="flex items-center space-x-2 font-semibold">
                  {decryptResult.success ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Decryption & Checksum Passed!</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      <span>Decryption Error</span>
                    </>
                  )}
                </div>
                <p className="text-xs">{decryptResult.success ? 'AES-256-GCM authentication tag verified.' : decryptResult.error}</p>

                {decryptResult.success && (
                  <button
                    onClick={handleDownloadBlob}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Restored Binary</span>
                  </button>
                )}
              </div>
            )}

            {!decryptResult?.success && (
              <button
                onClick={handleDecrypt}
                disabled={!passphrase || isDecrypting}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 cursor-pointer transition-all"
              >
                <Key className="w-4 h-4" />
                <span>{isDecrypting ? 'Verifying & Decrypting...' : 'Decrypt File Payload'}</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
