// /backend/server.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from './models/Chat.js';  // Make sure we import Chat model

// Load environment variables before anything else
dotenv.config();
import ChatService from './services/chatService.js';  // Import the class, not the instance
const chatService = new ChatService({
    mongodbUri: process.env.MONGODB_URI,
    mongodbName: process.env.MONGODB_DB_NAME
});
const app = express();
const port = process.env.PORT || 3000;
const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
const modelName = process.env.MODEL_NAME || 'deepseek-coder:6.7b';

app.use(cors());
app.use(express.json());

// MongoDB Connection (if configured)
if (process.env.MONGODB_URI) {
    console.log('Attempting to connect to MongoDB...');
    
    mongoose.set('debug', true);
    
    mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || 'deepseek-chat',
      retryWrites: true,
      w: 'majority'
    })
    .then(async () => {
      console.log('MongoDB connected successfully');
      console.log('Database:', process.env.MONGODB_DB_NAME || 'deepseek-chat');
      
      // Test the connection with explicit error handling
      try {
        const testDoc = await new Chat({
          sessionId: 'test-connection',
          title: 'Test Connection',
          messages: []
        }).save();
        
        console.log('Successfully created test document:', testDoc._id);
        await Chat.deleteOne({ sessionId: 'test-connection' });
        console.log('Successfully cleaned up test document');
      } catch (error) {
        console.error('Error during connection test:', error);
        console.error('Full error:', JSON.stringify(error, null, 2));
      }
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      console.error('Full connection error:', JSON.stringify(err, null, 2));
      console.error('Stack trace:', err.stack);
    });
  } else {
    console.warn('WARNING: MONGODB_URI not found in environment variables. Running with in-memory storage.');
  }

// Middleware to ensure session ID
app.use((req, res, next) => {
  req.sessionId = req.headers['x-session-id'] || uuidv4();
  res.setHeader('X-Session-ID', req.sessionId);
  next();
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const { sessionId } = req;
    
    // Check if Ollama is running first
    try {
      const healthCheck = await fetch(`${ollamaHost}/api/version`);
      if (!healthCheck.ok) {
        throw new Error('Ollama service is not responding');
      }
    } catch (error) {
      console.error('Ollama health check failed:', error);
      throw new Error('Ollama is not running. Please start Ollama with `ollama serve`');
    }

    console.log('Sending request to Ollama...');
    console.log('Message:', message);
    
    const response = await fetch(`${ollamaHost}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          ...(await chatService.getMessages(sessionId)),
          { role: 'user', content: message }
        ],
        stream: false
      }),
    });
    
    console.log('Ollama response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama error response:', errorText);
      throw new Error(`Ollama responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Add the exchange to chat history
    await chatService.addMessages(sessionId, message, data.message.content);

    // Get updated messages
    const messages = await chatService.getMessages(sessionId);

    res.json({ 
      response: data.message.content,
      history: messages,
      sessionId
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat request', 
      details: error.message 
    });
  }
});

// Get chat history endpoint
app.get('/api/history/:sessionId?', async (req, res) => {
  try {
    const sessionId = req.params.sessionId || req.sessionId;
    const messages = await chatService.getMessages(sessionId);
    res.json({ messages, sessionId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Clear chat history endpoint
app.post('/api/clear/:sessionId?', async (req, res) => {
  try {
    const sessionId = req.params.sessionId || req.sessionId;
    await chatService.clearChat(sessionId);
    res.json({ message: 'Chat history cleared', sessionId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

// Get all chat sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await chatService.getAllSessions();
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Debug endpoint to check MongoDB contents
app.get('/api/debug/chats', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) {
      return res.json({ error: 'MongoDB not configured', inMemoryChats: chatService.inMemoryChats });
    }
    const chats = await Chat.find({});
    res.json({
      totalChats: chats.length,
      chats: chats.map(chat => ({
        sessionId: chat.sessionId,
        title: chat.title,
        messageCount: chat.messages.length,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for Ollama connectivity
app.get('/api/test-ollama', async (req, res) => {
  try {
    const response = await fetch(`${ollamaHost}/api/version`);
    const data = await response.json();
    res.json({ 
      status: 'ok', 
      version: data.version,
      storage: process.env.MONGODB_URI ? 'mongodb' : 'in-memory'
    });
  } catch (error) {
    console.error('Ollama test failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Could not connect to Ollama',
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Storage mode: ${process.env.MONGODB_URI ? 'MongoDB' : 'In-Memory'}`);
});