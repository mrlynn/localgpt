// /backend/models/Project.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // Enhanced configuration for prompt control
  config: {
    // Base system prompt for all interactions in this project
    systemPrompt: {
      type: String,
      default: ""
    },
    // Style and tone settings
    style: {
      tone: {
        type: String,
        enum: ['formal', 'technical', 'casual', 'friendly'],
        default: 'formal'
      },
      languageLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'expert'],
        default: 'intermediate'
      },
      codeStyle: {
        type: String,
        enum: ['descriptive', 'concise', 'documented'],
        default: 'documented'
      }
    },
    // Context window configuration
    context: {
      includeProjectDescription: {
        type: Boolean,
        default: true
      },
      maxPreviousMessages: {
        type: Number,
        default: 5
      },
      includeInsights: {
        type: Boolean,
        default: true
      }
    },
    // Knowledge base configuration
    knowledgeBase: {
      // Key terms and their definitions
      terminology: [{
        term: String,
        definition: String,
        aliases: [String]
      }],
      // Reference documents
      references: [{
        title: String,
        content: String,
        type: {
          type: String,
          enum: ['documentation', 'code', 'requirements', 'guidelines']
        },
        priority: {
          type: Number,
          default: 1
        }
      }],
      // Code snippets or examples
      codeExamples: [{
        title: String,
        code: String,
        language: String,
        description: String
      }]
    },
    // Project-specific requirements or constraints
    requirements: {
      // Mandatory elements that must be included
      mandatoryElements: [{
        type: String,
        description: String
      }],
      // Elements to avoid or exclude
      restrictions: [{
        type: String,
        description: String
      }],
      // Specific frameworks or technologies to use
      technologies: [{
        name: String,
        version: String,
        required: Boolean
      }]
    },
    // Output formatting preferences
    outputPreferences: {
      format: {
        type: String,
        enum: ['markdown', 'plain', 'structured'],
        default: 'markdown'
      },
      includeExamples: {
        type: Boolean,
        default: true
      },
      codeBlockStyle: {
        type: String,
        enum: ['minimal', 'documented', 'verbose'],
        default: 'documented'
      }
    }
  },
  // Track important insights and decisions
  insights: [{
    content: String,
    date: {
      type: Date,
      default: Date.now
    },
    source: String,
    type: {
      type: String,
      enum: ['automatic', 'manual', 'decision'],
      default: 'automatic'
    },
    tags: [String]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update timestamps
projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Project = mongoose.model('Project', projectSchema);

// Helper function to build context string from project configuration
export const buildProjectContext = (project) => {
  const contextParts = [];

  // Add base information if configured
  if (project.config.context.includeProjectDescription && project.description) {
    contextParts.push(`Project Description: ${project.description}`);
  }

  // Add style guidance
  const { style } = project.config;
  if (style) {
    contextParts.push(`Style Guide:
- Tone: ${style.tone}
- Technical Level: ${style.languageLevel}
- Code Style: ${style.codeStyle}`);
  }

  // Add relevant terminology
  const terms = project.config.knowledgeBase.terminology;
  if (terms && terms.length > 0) {
    contextParts.push(`Key Terms:
${terms.map(t => `- ${t.term}: ${t.definition}`).join('\n')}`);
  }

  // Add mandatory requirements
  const mandatory = project.config.requirements.mandatoryElements;
  if (mandatory && mandatory.length > 0) {
    contextParts.push(`Requirements:
${mandatory.map(r => `- ${r.description}`).join('\n')}`);
  }

  // Add restrictions
  const restrictions = project.config.requirements.restrictions;
  if (restrictions && restrictions.length > 0) {
    contextParts.push(`Restrictions:
${restrictions.map(r => `- ${r.description}`).join('\n')}`);
  }

  // Add recent insights if configured
  if (project.config.context.includeInsights && project.insights?.length > 0) {
    const recentInsights = project.insights
      .sort((a, b) => b.date - a.date)
      .slice(0, 3)
      .map(i => `- ${i.content}`)
      .join('\n');
    
    contextParts.push(`Recent Insights:\n${recentInsights}`);
  }

  return contextParts.join('\n\n');
};