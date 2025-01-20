// /backend/models/Agent.js
import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  proficiency: {
    type: String,
    enum: ["beginner", "intermediate", "expert"],
    default: "intermediate",
  },
  description: String,
});

const resourceAccessSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["github", "filesystem", "command"],
    required: true,
  },
  config: {
    // GitHub specific
    repoAccess: [
      {
        repoUrl: String,
        permissions: [
          {
            type: String,
            enum: ["read", "write", "admin"],
          },
        ],
      },
    ],
    // Filesystem specific
    allowedPaths: [
      {
        path: String,
        permissions: [
          {
            type: String,
            enum: ["read", "write", "execute"],
          },
        ],
      },
    ],
    // Command specific
    allowedCommands: [
      {
        command: String,
        arguments: [String],
        description: String,
      },
    ],
  },
  // For encrypted credentials like GitHub tokens
  credentials: {
    type: Map,
    of: String,
  },
});

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["available", "busy", "offline"],
    default: "available",
  },
  type: {
    type: String,
    enum: ["task", "assistant", "system"],
    default: "task",
  },
  skills: [skillSchema],
  capabilities: [{
    type: String,
    enum: ['github_access', 'filesystem_access', 'command_execution', 'web_access']  // Added web_access
  }],
  resources: [
    {
      resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
        required: true,
      },
      type: {
        type: String,
        required: true,
        enum: ['github', 'filesystem', 'command', 'web']  // Added 'web'
      },
      permissions: {
        type: String,
        enum: ["read", "write", "admin", "full"],
        default: "read",
      },
    },
  ],
  config: {
    maxConcurrentTasks: {
      type: Number,
      default: 1,
    },
    timeout: {
      type: Number, // in milliseconds
      default: 30000,
    },
    retryAttempts: {
      type: Number,
      default: 3,
    },
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update timestamps
agentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Method to check if agent can execute a specific task
agentSchema.methods.canExecuteTask = function (task) {
  // Check if agent has required capabilities
  const hasRequiredCapabilities = task.requiredCapabilities.every((cap) =>
    this.capabilities.includes(cap)
  );

  // Check if agent has required skills at sufficient proficiency
  const hasRequiredSkills = task.requiredSkills.every((required) => {
    const agentSkill = this.skills.find((s) => s.name === required.name);
    return (
      agentSkill &&
      this.checkProficiencySufficient(
        agentSkill.proficiency,
        required.minProficiency
      )
    );
  });

  return (
    hasRequiredCapabilities && hasRequiredSkills && this.status === "available"
  );
};

// Method to validate resource access
agentSchema.methods.hasResourceAccess = function (resourceType, action, path) {
  const resource = this.resources.find((r) => r.type === resourceType);
  if (!resource) return false;

  switch (resourceType) {
    case "filesystem":
      return resource.config.allowedPaths.some(
        (p) => path.startsWith(p.path) && p.permissions.includes(action)
      );
    case "github":
      return resource.config.repoAccess.some(
        (repo) => repo.repoUrl === path && repo.permissions.includes(action)
      );
    case "command":
      return resource.config.allowedCommands.some(
        (cmd) => cmd.command === path
      );
    default:
      return false;
  }
};

// Helper for checking skill proficiency levels
agentSchema.methods.checkProficiencySufficient = function (
  agentProficiency,
  requiredProficiency
) {
  const levels = ["beginner", "intermediate", "expert"];
  const agentLevel = levels.indexOf(agentProficiency);
  const requiredLevel = levels.indexOf(requiredProficiency);
  return agentLevel >= requiredLevel;
};

export const Agent = mongoose.model("Agent", agentSchema);
