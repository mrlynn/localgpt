// /backend/utils/encryption.js
import crypto from 'crypto';

// In a production environment, these should be secure environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-32-chars-!!'; // 32 bytes
const IV_LENGTH = 16; // For AES-256-CBC

export const encryptCredentials = async (data) => {
  try {
    if (!data) return null;

    // Convert object to string if necessary
    const text = typeof data === 'object' ? JSON.stringify(data) : data.toString();
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

export const decryptCredentials = async (text) => {
  try {
    if (!text) return null;

    const parts = text.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted data format');

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    const result = decrypted.toString();

    // Try to parse as JSON if possible
    try {
      return JSON.parse(result);
    } catch {
      return result;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Helper to test if data needs encryption (contains sensitive information)
export const shouldEncrypt = (data) => {
  const sensitiveKeys = ['token', 'key', 'password', 'secret', 'credential'];
  if (typeof data === 'object') {
    return Object.keys(data).some(key => 
      sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
    );
  }
  return false;
};