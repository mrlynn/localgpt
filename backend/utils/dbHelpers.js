// /backend/utils/dbHelpers.js
import { encryptCredentials, decryptCredentials, shouldEncrypt } from './encryption.js';

export const encryptFields = async (doc, fields) => {
  for (const field of fields) {
    const value = doc[field];
    if (value && shouldEncrypt(value)) {
      doc[field] = await encryptCredentials(value);
    }
  }
  return doc;
};

export const decryptFields = async (doc, fields) => {
  for (const field of fields) {
    const value = doc[field];
    if (value) {
      try {
        doc[field] = await decryptCredentials(value);
      } catch (error) {
        console.warn(`Failed to decrypt field ${field}:`, error);
      }
    }
  }
  return doc;
};