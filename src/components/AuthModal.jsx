import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Key, CheckCircle2, Cpu, X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, currentUser, setCurrentUser, onLogEvent }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState(currentUser?.email || 'security.user@secureshare.io');
  const [password, setPassword] = useState('••••••••••••');
  const [mfaCode, setMfaCode] = useState('849201');

  if (!isOpen) return null;

  const handleAuthenticate = (e) => {
    e.preventDefault();
    const newUser = {
      email,
      role: 'Security Admin',
      mfaVerified: true,
      publicKeyHash: '0x' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      sessionStartedAt: new Date().toLocaleTimeString()
    };
    setCurrentUser(newUser);

    onLogEvent({
      type: 'AUTH',
      title: 'User Authenticated with MFA',
      details: `Session verified for ${email}. RSA-4096 Public Key fingerprint: ${newUser.publicKeyHash.substring(0, 14)}...`
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-6 bg-slate-900">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-lg text-slate-100">
              {isLoginView ? 'User Session Login' : 'Create Zero-Trust Identity'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAuthenticate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email / Security Handle
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 pl-10"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Account Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 pl-10 font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>2FA Authenticator Passcode</span>
              <span className="text-emerald-400 text-[10px]">Verified</span>
            </label>
            <input
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono text-center tracking-widest text-base font-bold"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center space-x-1.5 font-semibold text-cyan-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>Zero-Knowledge Guarantee:</span>
            </div>
            <p>Your master encryption keys are derived on-device and never leave your local browser state.</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 cursor-pointer transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Authenticate Session</span>
          </button>
        </form>

      </div>
    </div>
  );
}
