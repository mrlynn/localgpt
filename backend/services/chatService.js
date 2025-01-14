// /backend/services/chatService.js
import { Chat } from "../models/Chat.js";
import { v4 as uuidv4 } from "uuid";

class ChatService {
    constructor(config = {}) {
    this.inMemoryChats = new Map();

    this.isMongoDBEnabled = !!(config.mongodbUri || process.env.MONGODB_URI);
    this.mongodbUri = config.mongodbUri || process.env.MONGODB_URI;
    this.mongodbName = config.mongodbName || process.env.MONGODB_DB_NAME;

    this.isMongoDBEnabled = !!(config.mongodbUri || process.env.MONGODB_URI);
    this.mongodbUri = config.mongodbUri || process.env.MONGODB_URI;
    this.mongodbName = config.mongodbName || process.env.MONGODB_DB_NAME;
    console.log("ChatService initialized with MongoDB:", this.isMongoDBEnabled);
    console.log(
      "MongoDB URI:",
      process.env.MONGODB_URI
        ? process.env.MONGODB_URI.replace(
            /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
            "mongodb+srv://[username]:[password]@"
          )
        : "Not configured"
    );
    console.log("MongoDB Database:", process.env.MONGODB_DB_NAME || "default");
  }

  async initializeChat(sessionId) {
    console.log("Initializing chat for session:", sessionId);
    if (this.isMongoDBEnabled) {
      try {
        const chat = await Chat.findOne({ sessionId });
        if (!chat) {
          console.log("Creating new chat in MongoDB for session:", sessionId);
          return await Chat.create({ sessionId, messages: [] });
        }
        console.log("Found existing chat in MongoDB for session:", sessionId);
        return chat;
      } catch (error) {
        console.error("Error initializing chat in MongoDB:", error);
        throw error;
      }
    } else {
      console.log("Using in-memory storage for session:", sessionId);
      if (!this.inMemoryChats.has(sessionId)) {
        this.inMemoryChats.set(sessionId, []);
      }
      return { messages: this.inMemoryChats.get(sessionId) };
    }
  }

  async getMessages(sessionId) {
    console.log("Getting messages for session:", sessionId);
    if (this.isMongoDBEnabled) {
      try {
        const chat = await Chat.findOne({ sessionId });
        console.log(`Found ${chat?.messages?.length || 0} messages in MongoDB`);
        return chat ? chat.messages : [];
      } catch (error) {
        console.error("Error getting messages from MongoDB:", error);
        throw error;
      }
    } else {
      return this.inMemoryChats.get(sessionId) || [];
    }
  }

  async addMessages(sessionId, userMessage, assistantMessage) {
    console.log("Adding messages for session:", sessionId);
    const messages = [
      { role: "user", content: userMessage, timestamp: new Date() },
      { role: "assistant", content: assistantMessage, timestamp: new Date() },
    ];

    if (this.isMongoDBEnabled) {
      try {
        console.log("MongoDB is enabled, attempting to save messages...");
        let chat = await Chat.findOne({ sessionId });

        if (!chat) {
          console.log("No existing chat found, creating new document");
          chat = new Chat({
            sessionId,
            messages: [],
            title:
              userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : ""),
          });

          // Add validation check
          const validationError = chat.validateSync();
          if (validationError) {
            console.error("Validation error:", validationError);
            throw validationError;
          }

          console.log(
            "Created new chat document:",
            JSON.stringify(chat.toJSON(), null, 2)
          );
        } else {
          console.log("Found existing chat document");
        }

        console.log("Adding new messages to chat");
        chat.messages.push(...messages);
        chat.updatedAt = new Date();

        try {
          const savedChat = await chat.save();
          console.log("Successfully saved chat. Document ID:", savedChat._id);
          console.log("New message count:", savedChat.messages.length);
          return savedChat.messages;
        } catch (saveError) {
          console.error("Error during save operation:", saveError);
          if (saveError.code === 11000) {
            console.error("Duplicate key error - sessionId already exists");
          }
          throw saveError;
        }
      } catch (error) {
        console.error("Error saving messages to MongoDB:", error);
        console.error("Full error object:", JSON.stringify(error, null, 2));
        console.error("Error stack:", error.stack);
        throw error;
      }
    } else {
      if (!this.inMemoryChats.has(sessionId)) {
        this.inMemoryChats.set(sessionId, []);
      }
      this.inMemoryChats.get(sessionId).push(...messages);
      return this.inMemoryChats.get(sessionId);
    }
  }

  async clearChat(sessionId) {
    console.log("Clearing chat for session:", sessionId);
    if (this.isMongoDBEnabled) {
      try {
        const result = await Chat.findOneAndUpdate(
          { sessionId },
          { $set: { messages: [], updatedAt: new Date() } },
          { upsert: true, new: true }
        );
        console.log("Successfully cleared chat in MongoDB");
        return result;
      } catch (error) {
        console.error("Error clearing chat in MongoDB:", error);
        throw error;
      }
    } else {
      this.inMemoryChats.set(sessionId, []);
    }
  }

  async getAllSessions() {
    console.log("Getting all sessions");
    if (this.isMongoDBEnabled) {
      try {
        const chats = await Chat.find(
          {},
          "sessionId title createdAt updatedAt messages"
        ).sort({ updatedAt: -1 });
        console.log(`Found ${chats.length} sessions in MongoDB`);
        return chats.map((chat) => ({
          sessionId: chat.sessionId,
          title: chat.title || "New conversation",
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          messageCount: chat.messages.length,
        }));
      } catch (error) {
        console.error("Error getting sessions from MongoDB:", error);
        throw error;
      }
    } else {
      return Array.from(this.inMemoryChats.keys()).map((sessionId) => ({
        sessionId,
        title: "New conversation",
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: this.inMemoryChats.get(sessionId).length,
      }));
    }
  }
}

export default ChatService;
