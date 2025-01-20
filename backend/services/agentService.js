// /backend/services/agentService.js
import { Agent } from '../models/Agent.js';
import { encryptCredentials, decryptCredentials } from '../utils/encryption.js';

class AgentService {
  constructor() {
    this.activeAgents = new Map();
  }

  async createAgent(agentData) {
    try {
      // Encrypt any sensitive credentials before saving
      if (agentData.resources) {
        for (const resource of agentData.resources) {
          if (resource.credentials) {
            resource.credentials = await encryptCredentials(resource.credentials);
          }
        }
      }

      const agent = new Agent(agentData);
      await agent.save();
      return agent;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }

  async getAgent(agentId) {
    try {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }
      return agent;
    } catch (error) {
      console.error('Error getting agent:', error);
      throw error;
    }
  }

  async updateAgentStatus(agentId, status) {
    try {
      const agent = await Agent.findByIdAndUpdate(
        agentId,
        { 
          status,
          lastActive: new Date()
        },
        { new: true }
      );
      return agent;
    } catch (error) {
      console.error('Error updating agent status:', error);
      throw error;
    }
  }

  async addResourceAccess(agentId, resourceData) {
    try {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Encrypt credentials if present
      if (resourceData.credentials) {
        resourceData.credentials = await encryptCredentials(resourceData.credentials);
      }

      agent.resources.push(resourceData);
      await agent.save();
      return agent;
    } catch (error) {
      console.error('Error adding resource access:', error);
      throw error;
    }
  }

  async removeResourceAccess(agentId, resourceType) {
    try {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      agent.resources = agent.resources.filter(r => r.type !== resourceType);
      await agent.save();
      return agent;
    } catch (error) {
      console.error('Error removing resource access:', error);
      throw error;
    }
  }

  async validateResourceAccess(agentId, resourceType, action, path) {
    try {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      return agent.hasResourceAccess(resourceType, action, path);
    } catch (error) {
      console.error('Error validating resource access:', error);
      throw error;
    }
  }

  async findAvailableAgentForTask(task) {
    try {
      const agents = await Agent.find({ status: 'available' });
      for (const agent of agents) {
        if (agent.canExecuteTask(task)) {
          return agent;
        }
      }
      return null;
    } catch (error) {
      console.error('Error finding available agent:', error);
      throw error;
    }
  }

  async getAgentMetrics(agentId) {
    try {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Calculate various metrics
      const metrics = {
        tasksCompleted: await this.getCompletedTaskCount(agentId),
        averageTaskDuration: await this.calculateAverageTaskDuration(agentId),
        successRate: await this.calculateSuccessRate(agentId),
        lastActiveTime: agent.lastActive
      };

      return metrics;
    } catch (error) {
      console.error('Error getting agent metrics:', error);
      throw error;
    }
  }
}

export default new AgentService();