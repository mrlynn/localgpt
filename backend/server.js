// /backend/server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { Chat } from "./models/Chat.js"; // Make sure we import Chat model
import ProjectService from './services/projectService.js';
import { Project } from './models/Project.js';  // Add this line

// Load environment variables before anything else
dotenv.config();
import ChatService from "./services/chatService.js"; // Import the class, not the instance
const chatService = new ChatService({
  mongodbUri: process.env.MONGODB_URI,
  mongodbName: process.env.MONGODB_DB_NAME,
});

const projectService = new ProjectService({
    mongodbUri: process.env.MONGODB_URI,
    mongodbName: process.env.MONGODB_DB_NAME
  });

const app = express();
const port = process.env.PORT || 3000;
const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
const modelName = process.env.MODEL_NAME || "deepseek-coder:6.7b";

app.use(cors());
app.use(express.json());

// MongoDB Connection (if configured)
if (process.env.MONGODB_URI) {
  console.log("Attempting to connect to MongoDB...");

  mongoose.set("debug", true);

  mongoose
    .connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || "deepseek-chat",
      retryWrites: true,
      w: "majority",
    })
    .then(async () => {
      console.log("MongoDB connected successfully");
      console.log("Database:", process.env.MONGODB_DB_NAME || "deepseek-chat");

      // Test the connection with explicit error handling
      try {
        const testDoc = await new Chat({
          sessionId: "test-connection",
          title: "Test Connection",
          messages: [],
        }).save();

        console.log("Successfully created test document:", testDoc._id);
        await Chat.deleteOne({ sessionId: "test-connection" });
        console.log("Successfully cleaned up test document");
      } catch (error) {
        console.error("Error during connection test:", error);
        console.error("Full error:", JSON.stringify(error, null, 2));
      }
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      console.error("Full connection error:", JSON.stringify(err, null, 2));
      console.error("Stack trace:", err.stack);
    });
} else {
  console.warn(
    "WARNING: MONGODB_URI not found in environment variables. Running with in-memory storage."
  );
}

// Middleware to ensure session ID
app.use((req, res, next) => {
  req.sessionId = req.headers["x-session-id"] || uuidv4();
  res.setHeader("X-Session-ID", req.sessionId);
  next();
});

app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      const { sessionId } = req;
      const projectId = req.headers['x-project-id'];
  
      // Check if Ollama is running first
      try {
        const healthCheck = await fetch(`${ollamaHost}/api/version`);
        if (!healthCheck.ok) {
          throw new Error("Ollama service is not responding");
        }
      } catch (error) {
        console.error("Ollama health check failed:", error);
        throw new Error("Ollama is not running. Please start Ollama with `ollama serve`");
      }
  
      // Set headers for SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
  
      let fullResponse = "";
      let contextualPrompt = message;
      let systemInstructions = [];
  
      // If within a project, build enhanced context
      if (projectId) {
        try {
          // Update chat with project association
          await Chat.findOneAndUpdate(
            { sessionId },
            { projectId },
            { upsert: true }
          );
  
          // Get project details
          const project = await Project.findById(projectId);
          if (project) {
            // Build base project context
            const contextParts = [
              `Project: ${project.name}`,
              project.description ? `Description: ${project.description}` : null,
            ].filter(Boolean);
  
            // Add style guidance if configured
            if (project.config?.style) {
              systemInstructions.push(
                `Use a ${project.config.style.tone} tone and assume ${project.config.style.languageLevel} technical level.`,
                `Write code in a ${project.config.style.codeStyle} style.`
              );
            }
  
            // Add terminology if available
            if (project.config?.knowledgeBase?.terminology?.length > 0) {
              contextParts.push(
                "Project Terminology:",
                ...project.config.knowledgeBase.terminology
                  .map(t => `- ${t.term}: ${t.definition}`)
              );
            }
  
            // Add relevant code examples based on the query
            if (project.config?.knowledgeBase?.codeExamples) {
              const relevantExamples = project.config.knowledgeBase.codeExamples
                .filter(example => 
                  example.title.toLowerCase().includes(message.toLowerCase()) ||
                  example.description.toLowerCase().includes(message.toLowerCase())
                )
                .slice(0, 2);  // Limit to 2 most relevant examples
  
              if (relevantExamples.length > 0) {
                contextParts.push(
                  "Relevant Code Examples:",
                  ...relevantExamples.map(ex => (
                    `${ex.title}:\n\`\`\`${ex.language}\n${ex.code}\n\`\`\`\n${ex.description}`
                  ))
                );
              }
            }
  
            // Add project requirements if configured
            if (project.config?.requirements) {
              const { requirements } = project.config;
              
              if (requirements.mandatoryElements?.length > 0) {
                systemInstructions.push(
                  "Required elements:",
                  ...requirements.mandatoryElements.map(r => `- ${r.description}`)
                );
              }
  
              if (requirements.restrictions?.length > 0) {
                systemInstructions.push(
                  "Restrictions:",
                  ...requirements.restrictions.map(r => `- ${r.description}`)
                );
              }
  
              if (requirements.technologies?.length > 0) {
                const requiredTech = requirements.technologies
                  .filter(t => t.required)
                  .map(t => `${t.name}${t.version ? ` v${t.version}` : ''}`);
                
                if (requiredTech.length > 0) {
                  systemInstructions.push(
                    `Use the following technologies: ${requiredTech.join(', ')}`
                  );
                }
              }
            }
  
            // Add output preferences if configured
            if (project.config?.outputPreferences) {
              const { outputPreferences } = project.config;
              systemInstructions.push(
                `Format output in ${outputPreferences.format} style.`,
                outputPreferences.includeExamples ? 'Include practical examples when relevant.' : 'Focus on concise explanations.',
                `Provide code blocks in ${outputPreferences.codeBlockStyle} style.`
              );
            }
  
            // Add recent insights if configured and available
            if (project.config?.context?.includeInsights && project.insights?.length > 0) {
              const recentInsights = project.insights
                .sort((a, b) => b.date - a.date)
                .slice(0, 3)
                .map(i => `- ${i.content}`)
                .join('\n');
              
              contextParts.push("Recent Project Insights:", recentInsights);
            }
  
            // Build the final contextual prompt
            contextualPrompt = [
              "[Project Context]",
              contextParts.join('\n'),
              "",
              "[User Query]",
              message
            ].join('\n');
          }
        } catch (error) {
          console.error("Error building project context:", error);
          // Continue with original message if project context fails
          contextualPrompt = message;
        }
      }
  
      // Prepare messages array with system instructions if available
      const messagesArray = [...(await chatService.getMessages(sessionId))];
      
      if (systemInstructions.length > 0) {
        messagesArray.unshift({
          role: "system",
          content: systemInstructions.join('\n')
        });
      }
  
      messagesArray.push({
        role: "user",
        content: contextualPrompt
      });
  
      const response = await fetch(`${ollamaHost}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages: messagesArray,
          stream: true,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Ollama responded with status ${response.status}`);
      }
  
      // Create a readable stream from the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
  
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());
  
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              fullResponse += data.message.content;
              // Send the chunk to the client
              res.write(`data: ${JSON.stringify({ chunk: data.message.content })}\n\n`);
            }
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      }
  
      // Save the complete conversation to the database
      await chatService.addMessages(sessionId, message, fullResponse);
  
      // Automated insight detection for project chats
      if (projectId && fullResponse.length > 0) {
        try {
          // Enhanced insight detection with more sophisticated patterns
          const insightPatterns = [
            { pattern: /important to note|key insight|crucial finding|significantly/i, weight: 1 },
            { pattern: /best practice|recommended approach|common pitfall/i, weight: 1.2 },
            { pattern: /must remember|critical consideration|essential factor/i, weight: 1.5 },
            { pattern: /discovered that|realized that|found that|concluded that/i, weight: 0.8 }
          ];
  
          let insightScore = 0;
          for (const { pattern, weight } of insightPatterns) {
            if (pattern.test(fullResponse)) {
              insightScore += weight;
            }
          }
  
          // If the cumulative score exceeds threshold, save as insight
          if (insightScore >= 1.5) {
            const insightContent = fullResponse.length > 500 
              ? fullResponse.substring(0, 500) + '...' // Truncate long insights
              : fullResponse;
  
            await Project.findByIdAndUpdate(projectId, {
              $push: {
                insights: {
                  content: insightContent,
                  date: new Date(),
                  source: sessionId,
                  type: 'automatic',
                  tags: ['auto-detected']
                }
              }
            });
          }
        } catch (error) {
          console.error("Error saving project insight:", error);
          // Don't fail the response if insight saving fails
        }
      }
  
      // Send the end message
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error:", error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  });

// Get chat history endpoint
app.get("/api/history/:sessionId?", async (req, res) => {
  try {
    const sessionId = req.params.sessionId || req.sessionId;
    const messages = await chatService.getMessages(sessionId);
    res.json({ messages, sessionId });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Clear chat history endpoint
app.post("/api/clear/:sessionId?", async (req, res) => {
  try {
    const sessionId = req.params.sessionId || req.sessionId;
    await chatService.clearChat(sessionId);
    res.json({ message: "Chat history cleared", sessionId });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear chat history" });
  }
});

// Get all chat sessions
app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = await chatService.getAllSessions();
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// Debug endpoint to check MongoDB contents
app.get("/api/debug/chats", async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) {
      return res.json({
        error: "MongoDB not configured",
        inMemoryChats: chatService.inMemoryChats,
      });
    }
    const chats = await Chat.find({});
    res.json({
      totalChats: chats.length,
      chats: chats.map((chat) => ({
        sessionId: chat.sessionId,
        title: chat.title,
        messageCount: chat.messages.length,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for Ollama connectivity
app.get("/api/test-ollama", async (req, res) => {
  try {
    const response = await fetch(`${ollamaHost}/api/version`);
    const data = await response.json();
    res.json({
      status: "ok",
      version: data.version,
      storage: process.env.MONGODB_URI ? "mongodb" : "in-memory",
    });
  } catch (error) {
    console.error("Ollama test failed:", error);
    res.status(500).json({
      status: "error",
      message: "Could not connect to Ollama",
      error: error.message,
    });
  }
});

app.post('/api/projects', async (req, res) => {
    try {
      const { name, description } = req.body;
      const project = new Project({ name, description });
      await project.save();
      res.json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await Project.find().sort({ updatedAt: -1 });
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/projects/:projectId', async (req, res) => {
    try {
      const project = await Project.findById(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/projects/:projectId', async (req, res) => {
    try {
      const project = await Project.findByIdAndUpdate(
        req.params.projectId,
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      res.json(project);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/projects/:projectId/config', async (req, res) => {
    try {
      const project = await Project.findById(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      project.config = {
        ...project.config,
        ...req.body
      };
      await project.save();
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/projects/:projectId/insights', async (req, res) => {
    try {
      const { content } = req.body;
      const project = await Project.findById(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      project.insights.push({
        content,
        date: new Date(),
        source: req.body.source || 'manual'
      });
      await project.save();
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/projects/:projectId', async (req, res) => {
    try {
      await Project.findByIdAndDelete(req.params.projectId);
      // Also delete associated chats
      await Chat.deleteMany({ projectId: req.params.projectId });
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/projects/:projectId/chats', async (req, res) => {
    try {
      const chats = await Chat.find({ projectId: req.params.projectId })
        .sort({ updatedAt: -1 });
      res.json({ sessions: chats }); // Match the format expected by frontend
    } catch (error) {
      console.error('Error fetching project chats:', error);
      res.status(500).json({ error: error.message });
    }
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(
    `Storage mode: ${process.env.MONGODB_URI ? "MongoDB" : "In-Memory"}`
  );
});
