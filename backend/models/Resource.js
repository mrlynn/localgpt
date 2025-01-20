// /backend/models/Resource.js
import mongoose from 'mongoose';
import { encryptFields, decryptFields } from '../utils/dbHelpers.js';

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['github', 'filesystem', 'command', 'web'], // Added 'web'
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  config: {
    // GitHub specific
    githubToken: String,
    repoUrl: String,
    repositories: [{
      url: String,
      permissions: [{
        type: String,
        enum: ['read', 'write', 'admin']
      }]
    }],
    // Filesystem specific
    basePath: String,
    allowedPaths: [{
      path: String,
      permissions: [{
        type: String,
        enum: ['read', 'write', 'execute']  // Added execute to allowed values
      }]
    }],
    // For direct permissions array if used
    permissions: [{
      type: String,
      enum: ['read', 'write', 'execute']  // Made consistent with filesystem permissions
    }],
    // Command specific
    allowedCommands: [{
      command: String,
      arguments: [String],
      description: String
    }]
  },
  credentials: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update timestamps
resourceSchema.pre('save', async function(next) {
  this.updatedAt = new Date();
  if (this.isModified('config') || this.isModified('credentials')) {
    await encryptFields(this, ['config.githubToken', 'credentials']);
  }
  next();
});

resourceSchema.post('find', async function(docs) {
    for (const doc of docs) {
      await decryptFields(doc, ['config.githubToken', 'credentials']);
    }
  });

  resourceSchema.post('findOne', async function(doc) {
    if (doc) {
      await decryptFields(doc, ['config.githubToken', 'credentials']);
    }
  });

export const Resource = mongoose.model('Resource', resourceSchema);