import React, { useState, useRef } from 'react';
import { 
  Lock, Key, Upload, FileText, CheckCircle2, AlertTriangle, Download, 
  Share2, ShieldCheck, Eye, EyeOff, RefreshCw, Trash2, Cpu, FileCheck
} from 'lucide-react';
import { encryptFile, decryptFile, formatBytes, generateRandomPassphrase } from '../crypto/cryptoEngine';

export default function Vault({ vaultFiles, setVaultFiles, onShareFile, onLogEvent }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState(null);

  // Decryption state
  const [decryptModalFile, setDecryptModalFile] = useState(null);
  const [decryptPassphrase, setDecryptPassphrase] = useState('');
  const [decryptResult, setDecryptResult] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const fileInputRef = useRef(null);

  // Generate strong passphrase helper
  const handleGeneratePassphrase = () => {
    const key = generateRandomPassphrase(24);
    setPassphrase(key);
  };

  // Handle Drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle Drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Handle File Input Change
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Execute Encryption
  const handleEncrypt = async () => {
    if (!selectedFile) return;
    if (!passphrase) {
      alert('Please enter or generate a decryption passphrase.');
      return;
    }

    setIsEncrypting(true);

    try {
      const result = await encryptFile(selectedFile, passphrase, (prog) => {
        setEncryptionProgress(prog);
      });

      const newVaultItem = {
        id: 'file_' + Math.random().toString(36).substr(2, 9),
        originalName: result.originalName,
        originalSize: result.originalSize,
        originalType: result.originalType,
        checksum: result.checksum,
        ciphertextBase64: result.ciphertextBase64,
        saltBase64: result.saltBase64,
        ivBase64: result.ivBase64,
        encryptedAt: result.encryptedAt,
        usedPassphrase: passphrase // Stored in state for demo quick-decrypt convenience
      };

      setVaultFiles(prev => [newVaultItem, ...prev]);

      onLogEvent({
        type: 'ENCRYPT',
        title: 'File Encrypted in Vault',
        details: `Encrypted "${result.originalName}" (${formatBytes(result.originalSize)}) with AES-256-GCM. SHA-256: ${result.checksum.substring(0, 12)}...`
      });

      // Reset form
      setSelectedFile(null);
      setPassphrase('');
      setEncryptionProgress(null);

    } catch (err) {
      console.error(err);
      alert('Encryption failed: ' + err.message);
    } finally {
      setIsEncrypting(false);
    }
  };

  // Execute Decryption
  const handleDecrypt = async () => {
    if (!decryptModalFile || !decryptPassphrase) return;

    setIsDecrypting(true);
    setDecryptResult(null);

    try {
      const res = await decryptFile(decryptModalFile, decryptPassphrase);
      setDecryptResult(res);

      if (res.success) {
        onLogEvent({
          type: 'DECRYPT',
          title: 'File Decrypted',
          details: `Successfully decrypted "${res.fileName}" (${formatBytes(res.fileSize)}). Integrity verified.`
        });
      }
    } catch (err) {
      setDecryptResult({ success: false, error: err.message });
    } finally {
      setIsDecrypting(false);
    }
  };

  // Download Decrypted File
  const handleDownloadDecrypted = () => {
    if (!decryptResult || !decryptResult.blob) return;
    const url = URL.createObjectURL(decryptResult.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = decryptResult.fileName || 'decrypted_file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Delete Vault File
  const handleDeleteFile = (id, name) => {
    if (confirm(`Are you sure you want to remove "${name}" from your vault?`)) {
      setVaultFiles(prev => prev.filter(f => f.id !== id));
      onLogEvent({
        type: 'DELETE',
        title: 'File Removed from Vault',
        details: `Deleted "${name}" from local encrypted storage.`
      });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Zero-Trust Encrypted Vault</h1>
                <p className="text-slate-400 text-sm">
                  Encrypt files using client-side Web Crypto API (AES-256-GCM + PBKDF2) before sharing or storing.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Algorithm: <strong className="text-cyan-300">AES-256-GCM</strong> (100k PBKDF2 iterations)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: File Encryption Dropzone */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center space-x-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              <span>Encrypt New File</span>
            </h2>

            {/* Drag & Drop File Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/20' 
                  : selectedFile 
                    ? 'border-emerald-500/50 bg-emerald-950/10' 
                    : 'border-slate-700/80 hover:border-slate-500 hover:bg-slate-900/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <FileCheck className="w-12 h-12 text-emerald-400 mx-auto" />
                  <p className="font-semibold text-slate-200 text-sm truncate max-w-xs mx-auto">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-emerald-400 font-mono">
                    {formatBytes(selectedFile.size)} • {selectedFile.type || 'Binary File'}
                  </p>
                  <span className="inline-block text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Click or drag to replace
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto animate-bounce" />
                  <div>
                    <p className="font-medium text-slate-200 text-sm">
                      Drag & Drop your file here, or <span className="text-cyan-400 font-semibold underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports images, PDFs, ZIP, documents & code files up to 100MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Passphrase Configuration */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Encryption Passphrase</span>
                  <button
                    onClick={handleGeneratePassphrase}
                    className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center space-x-1 font-normal"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Generate Key</span>
                  </button>
                </label>
                
                <div className="relative">
                  <input
                    type={showPassphrase ? 'text' : 'password'}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter secret passphrase or click Auto-Generate..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                  >
                    {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Decryption will require this exact passphrase or key. We never store this key on any server.
                </p>
              </div>

              {/* Progress Bar during Encryption */}
              {encryptionProgress && (
                <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs text-cyan-300 font-medium">
                    <span>{encryptionProgress.message}</span>
                    <span className="font-mono text-cyan-400">Processing...</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full animate-pulse w-full" />
                  </div>
                </div>
              )}

              {/* Encrypt Submit Button */}
              <button
                onClick={handleEncrypt}
                disabled={!selectedFile || isEncrypting}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                  selectedFile && !isEncrypting
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{isEncrypting ? 'Encrypting Payload...' : 'Encrypt & Store in Vault'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Encrypted Vault File Explorer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Vault Storage ({vaultFiles.length})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Files encrypted locally and saved in your secure session state.
                </p>
              </div>
            </div>

            {vaultFiles.length === 0 ? (
              <div className="text-center py-12 border border-slate-800 rounded-xl bg-slate-950/40">
                <Lock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-semibold text-sm">Your Encrypted Vault is Empty</p>
                <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1">
                  Upload a file using the form on the left to encrypt it with AES-256-GCM.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {vaultFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 rounded-xl glass-card-hover border border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3 overflow-hidden">
                      <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex-shrink-0 mt-0.5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-sm text-slate-100 truncate">{file.originalName}</p>
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 rounded">
                            AES-256-GCM
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
                          <span>{formatBytes(file.originalSize)}</span>
                          <span>•</span>
                          <span title={file.checksum}>SHA-256: {file.checksum.substring(0, 10)}...</span>
                          <span>•</span>
                          <span>{new Date(file.encryptedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center space-x-2 flex-shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                      <button
                        onClick={() => {
                          setDecryptModalFile(file);
                          setDecryptPassphrase(file.usedPassphrase || '');
                          setDecryptResult(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center space-x-1 transition-all"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Decrypt</span>
                      </button>

                      <button
                        onClick={() => onShareFile(file)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1 transition-all"
                      >
                        <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Share</span>
                      </button>

                      <button
                        onClick={() => handleDeleteFile(file.id, file.originalName)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 text-xs transition-all"
                        title="Delete File"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Decryption Modal */}
      {decryptModalFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-5 bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg text-slate-100">Decrypt File</h3>
              </div>
              <button
                onClick={() => setDecryptModalFile(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400">File Payload:</p>
              <p className="font-semibold text-slate-200 text-sm mt-0.5">{decryptModalFile.originalName}</p>
              <p className="text-xs font-mono text-cyan-400 mt-0.5">
                Size: {formatBytes(decryptModalFile.originalSize)} • SHA-256: {decryptModalFile.checksum.substring(0, 16)}...
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Enter Decryption Passphrase
              </label>
              <input
                type="password"
                value={decryptPassphrase}
                onChange={(e) => setDecryptPassphrase(e.target.value)}
                placeholder="Passphrase used during encryption..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {decryptResult && (
              <div className={`p-4 rounded-xl border text-sm space-y-2 ${
                decryptResult.success 
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}>
                <div className="flex items-center space-x-2 font-semibold">
                  {decryptResult.success ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Decryption & Integrity Check Passed!</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      <span>Decryption Failed</span>
                    </>
                  )}
                </div>
                <p className="text-xs">{decryptResult.success ? 'AES-256-GCM authentication tag verified. Binary file restored.' : decryptResult.error}</p>
                
                {decryptResult.success && (
                  <button
                    onClick={handleDownloadDecrypted}
                    className="w-full mt-2 py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Save Restored File</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setDecryptModalFile(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={handleDecrypt}
                disabled={!decryptPassphrase || isDecrypting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md"
              >
                <Key className="w-4 h-4" />
                <span>{isDecrypting ? 'Decrypting...' : 'Verify & Decrypt'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
