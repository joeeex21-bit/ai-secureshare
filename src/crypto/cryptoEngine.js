/**
 * Web Crypto API Engine for Client-Side AES-256-GCM File Encryption & Decryption
 * All operations occur locally in the user's browser.
 */

// Helper to convert ArrayBuffer to Base64
export function bufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
export function base64ToBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Format bytes to human readable format
export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Generate SHA-256 checksum of an ArrayBuffer
export async function calculateSHA256(arrayBuffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a random high-entropy passphrase
export function generateRandomPassphrase(length = 24) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

/**
 * Derive an AES-GCM key from a passphrase using PBKDF2
 */
async function deriveKey(passphrase, saltBuffer) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a File or ArrayBuffer using AES-256-GCM
 * @param {File|Blob|ArrayBuffer} fileData 
 * @param {string} passphrase 
 * @param {Function} onProgress 
 */
export async function encryptFile(fileData, passphrase, onProgress = null) {
  if (onProgress) onProgress({ step: 'hash', message: 'Calculating SHA-256 checksum...' });
  
  let arrayBuffer;
  let fileName = 'encrypted_data';
  let fileType = 'application/octet-stream';

  if (fileData instanceof File) {
    fileName = fileData.name;
    fileType = fileData.type || 'application/octet-stream';
    arrayBuffer = await fileData.arrayBuffer();
  } else if (fileData instanceof Blob) {
    arrayBuffer = await fileData.arrayBuffer();
  } else {
    arrayBuffer = fileData;
  }

  const fileChecksum = await calculateSHA256(arrayBuffer);

  if (onProgress) onProgress({ step: 'salt', message: 'Generating cryptographic salt & IV...' });
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM

  if (onProgress) onProgress({ step: 'derive', message: 'Deriving 256-bit key via PBKDF2...' });
  const aesKey = await deriveKey(passphrase, salt);

  if (onProgress) onProgress({ step: 'encrypt', message: 'Encrypting payload with AES-256-GCM...' });
  
  // Package metadata inside encrypted payload
  const metadata = JSON.stringify({
    name: fileName,
    type: fileType,
    size: arrayBuffer.byteLength,
    timestamp: new Date().toISOString(),
    checksum: fileChecksum
  });

  const metadataBytes = new TextEncoder().encode(metadata);
  const metadataLen = new Uint32Array([metadataBytes.byteLength]);

  // Combine metadata length + metadata + file binary into one payload
  const combinedBuffer = new Uint8Array(4 + metadataBytes.byteLength + arrayBuffer.byteLength);
  combinedBuffer.set(new Uint8Array(metadataLen.buffer), 0);
  combinedBuffer.set(metadataBytes, 4);
  combinedBuffer.set(new Uint8Array(arrayBuffer), 4 + metadataBytes.byteLength);

  // Encrypt combined payload
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    aesKey,
    combinedBuffer
  );

  if (onProgress) onProgress({ step: 'complete', message: 'Encryption complete!' });

  return {
    ciphertextBase64: bufferToBase64(ciphertextBuffer),
    saltBase64: bufferToBase64(salt.buffer),
    ivBase64: bufferToBase64(iv.buffer),
    originalName: fileName,
    originalSize: arrayBuffer.byteLength,
    originalType: fileType,
    checksum: fileChecksum,
    encryptedAt: new Date().toISOString()
  };
}

/**
 * Decrypt an AES-256-GCM encrypted payload
 */
export async function decryptFile(encryptedObject, passphrase) {
  const { ciphertextBase64, saltBase64, ivBase64 } = encryptedObject;

  const ciphertext = base64ToBuffer(ciphertextBase64);
  const salt = base64ToBuffer(saltBase64);
  const iv = base64ToBuffer(ivBase64);

  // Derive key using passphrase and salt
  const aesKey = await deriveKey(passphrase, salt);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      aesKey,
      ciphertext
    );

    const view = new DataView(decryptedBuffer);
    const metadataLen = view.getUint32(0, true);
    
    const metadataBytes = new Uint8Array(decryptedBuffer, 4, metadataLen);
    const metadataStr = new TextDecoder().decode(metadataBytes);
    const metadata = JSON.parse(metadataStr);

    const fileBytes = decryptedBuffer.slice(4 + metadataLen);
    const fileChecksum = await calculateSHA256(fileBytes);

    if (metadata.checksum && metadata.checksum !== fileChecksum) {
      throw new Error('Integrity check failed: File checksum mismatch');
    }

    const blob = new Blob([fileBytes], { type: metadata.type || 'application/octet-stream' });

    return {
      success: true,
      blob: blob,
      fileName: metadata.name,
      fileType: metadata.type,
      fileSize: metadata.size,
      checksum: fileChecksum,
      decryptedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Decryption error:', err);
    return {
      success: false,
      error: 'Decryption failed. Invalid passphrase or corrupted data.'
    };
  }
}
