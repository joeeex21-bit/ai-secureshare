import React from 'react';
import { 
  ShieldCheck, Lock, Radar, Share2, AlertTriangle, Activity, CheckCircle2, 
  Trash2, RefreshCw, Flame, ExternalLink, Zap, Clock, ShieldAlert, Cpu
} from 'lucide-react';
import { formatBytes } from '../crypto/cryptoEngine';

export default function SecurityDashboard({ 
  securityScore, 
  vaultFiles, 
  activeShares, 
  auditLogs, 
  onRevokeShare, 
  onNavigateTab 
}) {
  // Calculate total vault size
  const totalVaultBytes = vaultFiles.reduce((acc, f) => acc + (f.originalSize || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner & Security Score Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Score Card */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Overall Security Rating</span>
            </h2>

            <div className="flex items-center space-x-5 my-4">
              <div className={`relative flex items-center justify-center w-24 h-24 rounded-full border-4 ${
                securityScore >= 80 
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-950/30 glow-emerald' 
                  : securityScore >= 50 
                    ? 'border-amber-400 text-amber-400 bg-amber-950/30' 
                    : 'border-rose-500 text-rose-400 bg-rose-950/30 glow-rose'
              }`}>
                <span className="text-3xl font-extrabold font-mono">{securityScore}</span>
                <span className="text-[10px] absolute -bottom-1 text-slate-400">/100</span>
              </div>

              <div className="space-y-1">
                <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-md border ${
                  securityScore >= 80 
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' 
                    : 'bg-amber-950 text-amber-400 border-amber-500/40'
                }`}>
                  {securityScore >= 80 ? 'EXCELLENT DEFENSE' : 'MODERATE RISK'}
                </span>
                <p className="text-xs text-slate-400">
                  Zero-trust encryption active. {vaultFiles.length} file(s) protected.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Client AES-256 Encryption:</span>
              <span className="text-emerald-400 font-semibold">100% Active</span>
            </div>
            <div className="flex justify-between">
              <span>Key Derivation:</span>
              <span className="text-cyan-400 font-semibold">PBKDF2 SHA-256</span>
            </div>
          </div>
        </div>

        {/* Right Stats Quick Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div 
            onClick={() => onNavigateTab('vault')}
            className="glass-panel p-5 rounded-2xl border border-slate-800 glass-card-hover cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Encrypted Vault</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-100">{vaultFiles.length} Files</p>
              <p className="text-xs text-cyan-400 font-mono mt-1">{formatBytes(totalVaultBytes)} Secured</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('scanner')}
            className="glass-panel p-5 rounded-2xl border border-slate-800 glass-card-hover cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">AI Threat Scanner</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <Radar className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-100">AI Engine</p>
              <p className="text-xs text-rose-400 font-mono mt-1">Phishing Defense Ready</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigateTab('shares')}
            className="glass-panel p-5 rounded-2xl border border-slate-800 glass-card-hover cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Active Shares</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Share2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-100">{activeShares.length} Links</p>
              <p className="text-xs text-emerald-400 font-mono mt-1">Self-Destruct Enabled</p>
            </div>
          </div>

        </div>

      </div>

      {/* Active Shares Manager */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <span>Active Shared Links ({activeShares.length})</span>
          </h3>
          <button
            onClick={() => onNavigateTab('vault')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>Share New File</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeShares.length === 0 ? (
          <div className="text-center py-8 border border-slate-800/80 rounded-xl bg-slate-950/40 text-xs text-slate-400">
            No active share links. Select an encrypted file from your vault to share.
          </div>
        ) : (
          <div className="space-y-3">
            {activeShares.map((share) => (
              <div
                key={share.shareId}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-200 text-sm">{share.fileName}</span>
                    {share.expirationType === '1view' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 rounded flex items-center space-x-1">
                        <Flame className="w-3 h-3" />
                        <span>Self-Destruct</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-400 font-mono">
                    <span>ID: {share.shareId}</span>
                    <span>•</span>
                    <span>Downloads: {share.downloadsRemaining} left</span>
                    <span>•</span>
                    <span>Created: {new Date(share.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => onRevokeShare(share.shareId)}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold flex items-center space-x-1 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke Access</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Audit Log Feed */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span>Real-time Access Audit Trail</span>
        </h3>

        {auditLogs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No event logs recorded yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between text-xs font-mono"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2 font-sans font-semibold text-slate-200">
                    <span className={`px-2 py-0.5 text-[10px] rounded ${
                      log.type === 'ENCRYPT' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                      log.type === 'DECRYPT' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      log.type === 'PHISHING_SCAN' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {log.type}
                    </span>
                    <span>{log.title}</span>
                  </div>
                  <p className="text-slate-400 font-mono text-[11px]">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">{log.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
