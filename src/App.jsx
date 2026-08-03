import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SecurityDashboard from './components/SecurityDashboard';
import Vault from './components/Vault';
import PhishingScanner from './components/PhishingScanner';
import ShareModal from './components/ShareModal';
import SharedFileReceiver from './components/SharedFileReceiver';
import AuthModal from './components/AuthModal';
import { encryptFile, generateRandomPassphrase } from './crypto/cryptoEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vaultFiles, setVaultFiles] = useState([]);
  const [activeShares, setActiveShares] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Modals & Recipient routing
  const [shareModalFile, setShareModalFile] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [recipientShareData, setRecipientShareData] = useState(null);

  const [currentUser, setCurrentUser] = useState({
    email: 'alex.cybersec@secureshare.io',
    role: 'Security Specialist',
    mfaVerified: true
  });

  // Calculate dynamic security score (0 - 100)
  const calculateScore = () => {
    let score = 70; // baseline
    if (vaultFiles.length > 0) score += 15;
    if (activeShares.length > 0) score += 10;
    if (auditLogs.some(l => l.type === 'PHISHING_SCAN')) score += 5;
    return Math.min(score, 100);
  };

  const securityScore = calculateScore();

  // Log Security Event
  const handleLogEvent = (event) => {
    const newLog = {
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      type: event.type,
      title: event.title,
      details: event.details,
      time: new Date().toLocaleTimeString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Seed sample initial data for immediate interactive demo
  useEffect(() => {
    const seedInitialDemo = async () => {
      try {
        const demoPassphrase = 'CyberVaultKey_2026!';
        
        // Seed 1: Confidential Financial Spec
        const sampleText = "CONFIDENTIAL PROJECT SPECIFICATION:\n- AES-256-GCM Zero-Trust Architecture\n- Client-Side PBKDF2 Key Derivation\n- Phishing NLP Threat Heuristics Enabled";
        const sampleBlob = new Blob([sampleText], { type: 'text/plain' });
        const encResult = await encryptFile(sampleBlob, demoPassphrase);

        const demoFile1 = {
          id: 'demo_file_1',
          originalName: 'Q3_Cyber_Architecture_Spec.txt',
          originalSize: sampleBlob.size,
          originalType: 'text/plain',
          checksum: encResult.checksum,
          ciphertextBase64: encResult.ciphertextBase64,
          saltBase64: encResult.saltBase64,
          ivBase64: encResult.ivBase64,
          encryptedAt: new Date(Date.now() - 3600000).toISOString(),
          usedPassphrase: demoPassphrase
        };

        setVaultFiles([demoFile1]);

        // Seed 1 Active Share
        const demoShare1 = {
          shareId: 'share_demo9928',
          fileId: 'demo_file_1',
          fileName: 'Q3_Cyber_Architecture_Spec.txt',
          fileSize: sampleBlob.size,
          fileType: 'text/plain',
          checksum: encResult.checksum,
          ciphertextBase64: encResult.ciphertextBase64,
          saltBase64: encResult.saltBase64,
          ivBase64: encResult.ivBase64,
          passphrase: demoPassphrase,
          expiration: Date.now() + 24 * 60 * 60 * 1000,
          expirationType: '24h',
          downloadLimit: 5,
          downloadsRemaining: 5,
          createdAt: new Date(Date.now() - 1800000).toISOString()
        };

        setActiveShares([demoShare1]);

        // Seed initial audit log
        setAuditLogs([
          {
            id: 'log_seed_1',
            type: 'ENCRYPT',
            title: 'Sample File Encrypted in Vault',
            details: 'Encrypted "Q3_Cyber_Architecture_Spec.txt" with AES-256-GCM.',
            time: new Date(Date.now() - 3600000).toLocaleTimeString()
          },
          {
            id: 'log_seed_2',
            type: 'SHARE',
            title: 'Created Encrypted Share Link',
            details: 'Share Link "share_demo9928" created with 24h self-destruct countdown.',
            time: new Date(Date.now() - 1800000).toLocaleTimeString()
          }
        ]);
      } catch (err) {
        console.error('Initial seed error:', err);
      }
    };

    seedInitialDemo();
  }, []);

  // Check URL hash for recipient share view
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#share=')) {
        const id = hash.replace('#share=', '');
        const targetShare = activeShares.find(s => s.shareId === id);
        if (targetShare) {
          setRecipientShareData(targetShare);
        } else {
          setRecipientShareData(null);
        }
      } else {
        setRecipientShareData(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeShares]);

  // Create new Share link handler
  const handleCreateShareLink = (shareObject) => {
    setActiveShares(prev => [shareObject, ...prev]);
    handleLogEvent({
      type: 'SHARE',
      title: 'Created Zero-Trust Share Link',
      details: `Generated share link "${shareObject.shareId}" for "${shareObject.fileName}". Expiration: ${shareObject.expirationType}`
    });
  };

  // Revoke Share link
  const handleRevokeShare = (shareId) => {
    setActiveShares(prev => prev.filter(s => s.shareId !== shareId));
    handleLogEvent({
      type: 'REVOKE',
      title: 'Share Link Access Revoked',
      details: `Revoked share token "${shareId}". Recipient can no longer decrypt payload.`
    });
  };

  // Record Download event from recipient portal
  const handleRecordDownload = (shareId) => {
    setActiveShares(prev => prev.map(s => {
      if (s.shareId === shareId) {
        const remaining = s.downloadsRemaining - 1;
        return { ...s, downloadsRemaining: Math.max(remaining, 0) };
      }
      return s;
    }));

    handleLogEvent({
      type: 'DECRYPT',
      title: 'Shared Payload Downloaded',
      details: `Recipient successfully decrypted file payload via share link "${shareId}".`
    });
  };

  // Send Scanner Clean Text to Encrypted Vault
  const handleSendTextToVault = async (textPayload) => {
    const key = generateRandomPassphrase(24);
    const blob = new Blob([textPayload], { type: 'text/plain' });
    const fileName = `Scanned_Clean_Text_${Date.now().toString().slice(-4)}.txt`;
    const result = await encryptFile(blob, key);

    const newVaultItem = {
      id: 'file_' + Math.random().toString(36).substr(2, 9),
      originalName: fileName,
      originalSize: blob.size,
      originalType: 'text/plain',
      checksum: result.checksum,
      ciphertextBase64: result.ciphertextBase64,
      saltBase64: result.saltBase64,
      ivBase64: result.ivBase64,
      encryptedAt: result.encryptedAt,
      usedPassphrase: key
    };

    setVaultFiles(prev => [newVaultItem, ...prev]);
    setActiveTab('vault');

    handleLogEvent({
      type: 'ENCRYPT',
      title: 'Scanned Content Encrypted into Vault',
      details: `Clean text verified by AI Phishing Scanner encrypted as "${fileName}".`
    });
  };

  // If viewing recipient share link
  if (recipientShareData) {
    return (
      <SharedFileReceiver
        shareData={recipientShareData}
        onBackToApp={() => {
          window.location.hash = '';
          setRecipientShareData(null);
        }}
        onRecordDownload={handleRecordDownload}
      />
    );
  }

  return (
    <div className="min-h-screen cyber-bg flex flex-col text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Cyber Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        securityScore={securityScore}
        activeSharesCount={activeShares.length}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <SecurityDashboard
            securityScore={securityScore}
            vaultFiles={vaultFiles}
            activeShares={activeShares}
            auditLogs={auditLogs}
            onRevokeShare={handleRevokeShare}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'vault' && (
          <Vault
            vaultFiles={vaultFiles}
            setVaultFiles={setVaultFiles}
            onShareFile={(file) => setShareModalFile(file)}
            onLogEvent={handleLogEvent}
          />
        )}

        {activeTab === 'scanner' && (
          <PhishingScanner
            onSendToVault={handleSendTextToVault}
            onLogEvent={handleLogEvent}
          />
        )}

        {activeTab === 'shares' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <SecurityDashboard
              securityScore={securityScore}
              vaultFiles={vaultFiles}
              activeShares={activeShares}
              auditLogs={auditLogs}
              onRevokeShare={handleRevokeShare}
              onNavigateTab={setActiveTab}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI-SecureShare • Zero-Trust File Cryptography & Phishing Defense Platform</span>
          <span className="font-mono text-cyan-400/80">AES-256-GCM • SubtleCrypto Web API</span>
        </div>
      </footer>

      {/* Share Config Modal */}
      {shareModalFile && (
        <ShareModal
          file={shareModalFile}
          onClose={() => setShareModalFile(null)}
          onCreateShareLink={handleCreateShareLink}
        />
      )}

      {/* User Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onLogEvent={handleLogEvent}
      />

    </div>
  );
}
