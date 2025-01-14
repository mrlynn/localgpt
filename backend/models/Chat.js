// /backend/models/Chat.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant']
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: 'New conversation'
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add debug logging to the pre-save middleware
chatSchema.pre('save', async function(next) {
  console.log('Pre-save middleware triggered for Chat document');
  console.log('Document contents:', JSON.stringify(this.toJSON(), null, 2));
  this.updatedAt = new Date();
  next();
});

// Add error handling to catch save failures
chatSchema.post('save', function(doc, next) {
  console.log('Document saved successfully:', doc.sessionId);
  next();
});

chatSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error('Error saving Chat document:', error);
    console.error('Failed document:', JSON.stringify(doc, null, 2));
  }
  next(error);
});

export const Chat = mongoose.model('Chat', chatSchema);