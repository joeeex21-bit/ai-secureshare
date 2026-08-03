import React from 'react';
import { ShieldCheck, Lock, Radar, Share2, LayoutDashboard, UserCheck, Bell, ShieldAlert } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, securityScore, activeSharesCount, onOpenAuth }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-emerald-400">
                  AI-SecureShare
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-950/60 border border-cyan-500/30 rounded-full">
                  v2.5 Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Zero-Trust Encryption & Phishing Defense Platform
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'vault'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Encrypted Vault</span>
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'scanner'
                  ? 'bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Radar className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>AI Phishing Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('shares')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'shares'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Shared Links</span>
              {activeSharesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold bg-cyan-500/30 text-cyan-300 rounded-full border border-cyan-400/40">
                  {activeSharesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Header Status Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Security Health Rating Badge */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className={`w-2.5 h-2.5 rounded-full ${securityScore >= 80 ? 'bg-emerald-400 shadow-emerald-400/50 glow-emerald' : securityScore >= 50 ? 'bg-amber-400 shadow-amber-400/50' : 'bg-rose-500 shadow-rose-500/50'}`} />
              <div className="text-xs">
                <span className="text-slate-400 hidden lg:inline">Security Rating: </span>
                <span className="font-bold text-slate-200">{securityScore}/100</span>
              </div>
            </div>

            {/* Account / Session Button */}
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-500/40 hover:to-blue-500/40 text-cyan-300 border border-cyan-500/30 font-medium text-xs sm:text-sm transition-all shadow-md"
            >
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">User Session</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
