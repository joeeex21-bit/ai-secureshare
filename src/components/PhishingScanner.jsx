import React, { useState } from 'react';
import { 
  Radar, AlertTriangle, ShieldCheck, ShieldAlert, Link, Mail, FileText, 
  Sparkles, CheckCircle2, ArrowRight, Zap, RefreshCw, Eye, Lock, Copy
} from 'lucide-react';
import { analyzePhishingThreat } from '../ai/phishingDetector';
import { SAMPLE_SCENARIOS } from '../ai/sampleScenarios';

export default function PhishingScanner({ onSendToVault, onLogEvent }) {
  const [activeInputType, setActiveInputType] = useState('text'); // 'text' | 'url' | 'attachment'
  const [contentInput, setContentInput] = useState('');
  const [senderInput, setSenderInput] = useState('');
  const [fileAttachmentInput, setFileAttachmentInput] = useState('');
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanReport, setScanReport] = useState(null);

  // Load sample test scenario
  const handleLoadScenario = (scenario) => {
    setActiveInputType(scenario.type);
    setSenderInput(scenario.sender || '');
    setFileAttachmentInput(scenario.fileName || '');
    setContentInput(scenario.content || '');
    setScanReport(null);
  };

  // Run AI Threat Scan
  const handleRunScan = () => {
    if (!contentInput && !fileAttachmentInput && activeInputType !== 'attachment') {
      alert('Please enter content or select a test scenario to scan.');
      return;
    }

    setIsScanning(true);
    setScanReport(null);

    setTimeout(() => {
      const report = analyzePhishingThreat({
        type: activeInputType,
        content: contentInput,
        senderEmail: senderInput,
        fileName: fileAttachmentInput
      });

      setScanReport(report);
      setIsScanning(false);

      onLogEvent({
        type: 'PHISHING_SCAN',
        title: `AI Threat Scan Completed (${report.severity})`,
        details: `Scanned ${activeInputType.toUpperCase()} payload. Risk Score: ${report.score}/100. ${report.indicators.length} indicators flagged.`
      });
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <Radar className="w-6 h-6 animate-spin" style={{ animationDuration: '12s' }} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Phishing & Threat Detector</h1>
                <p className="text-slate-400 text-sm">
                  Scan suspicious emails, URLs, messages, or attachments before sharing files over public channels.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Model: <strong className="text-rose-300">Threat-NLP Engine v4.2</strong></span>
          </div>
        </div>
      </div>

      {/* Preset Test Scenarios bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Test Scenarios (Click to load):</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleLoadScenario(sc)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center space-x-1.5 ${
                sc.category === 'Critical Threat' || sc.category === 'Credential Harvesting' || sc.category === 'Malicious Payload'
                  ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-500/30'
                  : sc.category === 'SMS Phishing'
                    ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/30'
              }`}
            >
              <span>{sc.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900/80 font-mono opacity-80">
                {sc.category}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Input Terminal */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            
            {/* Input Type Switcher */}
            <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveInputType('text')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeInputType === 'text'
                    ? 'bg-slate-800 text-rose-400 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email / Msg Text</span>
              </button>

              <button
                onClick={() => setActiveInputType('url')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeInputType === 'url'
                    ? 'bg-slate-800 text-rose-400 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>URL Link</span>
              </button>

              <button
                onClick={() => setActiveInputType('attachment')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeInputType === 'attachment'
                    ? 'bg-slate-800 text-rose-400 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Attachment Meta</span>
              </button>
            </div>

            {/* Sender email input (optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Sender Email / Origin (Optional)
              </label>
              <input
                type="text"
                value={senderInput}
                onChange={(e) => setSenderInput(e.target.value)}
                placeholder="e.g. security-update@chase-verify.xyz"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-400 font-mono"
              />
            </div>

            {/* File Attachment Name input (for attachment tab) */}
            {activeInputType === 'attachment' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Attachment Filename
                </label>
                <input
                  type="text"
                  value={fileAttachmentInput}
                  onChange={(e) => setFileAttachmentInput(e.target.value)}
                  placeholder="e.g. Invoice_Statement_Q3.pdf.exe"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-400 font-mono"
                />
              </div>
            )}

            {/* Main Content Text Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {activeInputType === 'url' ? 'Suspicious URL to Scan' : 'Raw Content Payload'}
              </label>
              <textarea
                rows={7}
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                placeholder={
                  activeInputType === 'url'
                    ? 'Paste suspicious website URL (e.g., https://login-microsoft365-verify.top)...'
                    : 'Paste email body, raw headers, SMS message text, or suspicious link...'
                }
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-rose-400 font-mono leading-relaxed resize-none"
              />
            </div>

            {/* Execute Scan Button */}
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white flex items-center justify-center space-x-2 shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
            >
              <Radar className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Running Neural AI Scan...' : 'Analyze Threat Payload'}</span>
            </button>

          </div>
        </div>

        {/* Right Output Diagnostic Report */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 min-h-[460px] flex flex-col justify-between">
            
            {!scanReport && !isScanning && (
              <div className="my-auto text-center py-12 text-slate-500">
                <Radar className="w-16 h-16 text-slate-700 mx-auto mb-4 animate-pulse-glow" />
                <h3 className="font-semibold text-slate-300 text-base">Ready for AI Threat Assessment</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Paste suspicious text or select a preset scenario on the left to run real-time threat evaluation.
                </p>
              </div>
            )}

            {isScanning && (
              <div className="my-auto text-center py-16 space-y-4">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-rose-500/30 border-t-rose-400 animate-spin" />
                  <Radar className="w-10 h-10 text-rose-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-base">Parsing Neural Indicators...</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Evaluating domain homographs, urgency heuristics & signature patterns
                  </p>
                </div>
              </div>
            )}

            {scanReport && !isScanning && (
              <div className="space-y-6">
                
                {/* Score & Severity Badge Header */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center space-x-4">
                    
                    {/* Animated Score Circle */}
                    <div className={`relative flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                      scanReport.score >= 75
                        ? 'border-rose-500 text-rose-400 bg-rose-950/40 glow-rose'
                        : scanReport.score >= 40
                          ? 'border-amber-500 text-amber-400 bg-amber-950/40'
                          : 'border-emerald-500 text-emerald-400 bg-emerald-950/40 glow-emerald'
                    }`}>
                      <span className="text-xl font-extrabold font-mono">{scanReport.score}</span>
                      <span className="text-[10px] absolute -bottom-1 text-slate-400 font-sans">/100</span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400 uppercase font-semibold">Threat Level:</span>
                        <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-md border ${
                          scanReport.score >= 75
                            ? 'bg-rose-950 text-rose-400 border-rose-500/50'
                            : scanReport.score >= 40
                              ? 'bg-amber-950 text-amber-400 border-amber-500/50'
                              : 'bg-emerald-950 text-emerald-400 border-emerald-500/50'
                        }`}>
                          {scanReport.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Scanned at {new Date(scanReport.scannedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions for clean vs threat */}
                  {scanReport.score < 25 && (
                    <button
                      onClick={() => onSendToVault(contentInput)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Encrypt text in Vault</span>
                    </button>
                  )}
                </div>

                {/* Flagged Indicators List */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Identified Risk Indicators ({scanReport.indicators.length})</span>
                  </h4>

                  {scanReport.indicators.length === 0 ? (
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>No malicious indicators or urgency traps detected in payload.</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {scanReport.indicators.map((ind, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{ind.category}</span>
                            <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                              ind.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400'
                            }`}>
                              +{ind.weight} PTS • {ind.severity}
                            </span>
                          </div>
                          <p className="text-slate-400">{ind.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Recommendations */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Security Recommendations</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {scanReport.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
