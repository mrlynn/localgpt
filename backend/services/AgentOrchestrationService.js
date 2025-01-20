// /backend/services/AgentOrchestrationService.js
import EventEmitter from "events";
import { Agent } from "../models/Agent.js";
import { Task } from "../models/Task.js";
import { Resource } from "../models/Resource.js";
import { executionFramework } from "./executionFramework.js";

// /backend/services/AgentOrchestrationService.js

class AgentOrchestrationService extends EventEmitter {
  constructor() {
    super();
    this.runningAgents = new Map();
    this.executionFramework = executionFramework;
    this.pollingInterval = 5000;
    this.taskCheckInterval = null;
    this.initialized = false;
  }

  async start() {
    if (this.initialized) {
      return;
    }

    console.log("Starting Agent Orchestration Service...");

    try {
      // Find all agents that should be available
      const agents = await Agent.find({}).populate("resources.resourceId");
      console.log(`Found ${agents.length} agents to initialize`);

      // Start each agent
      for (const agent of agents) {
        const agentContext = {
          id: agent._id,
          name: agent.name,
          capabilities: agent.capabilities,
          resources: agent.resources,
          tasks: new Set(),
          status: "available",
        };

        this.runningAgents.set(agent._id.toString(), agentContext);

        // Update agent status
        await Agent.findByIdAndUpdate(agent._id, {
          status: "available",
          lastActive: new Date(),
        });

        console.log(`Started agent: ${agent.name} (${agent._id})`);
      }

      // Start task polling
      this.taskCheckInterval = setInterval(
        () => this.checkForTasks(),
        this.pollingInterval
      );

      console.log("Agent Orchestration Service started with agents:", {
        count: this.runningAgents.size,
        agents: Array.from(this.runningAgents.values()).map((a) => ({
          id: a.id,
          name: a.name,
          capabilities: a.capabilities,
        })),
      });

      this.initialized = true;
      this.emit("started");
    } catch (error) {
      console.error("Failed to start Agent Orchestration Service:", error);
      this.emit("error", error);
    }
  }

  async checkForTasks() {
    try {
      // Find pending tasks
      const pendingTasks = await Task.find({
        status: "pending",
        nextAttempt: { $lte: new Date() },
      }).sort({ priority: -1, createdAt: 1 });

      console.log(
        `Checking ${pendingTasks.length} pending tasks against ${this.runningAgents.size} agents`
      );

      for (const task of pendingTasks) {
        await this.matchTaskToAgent(task);
      }
    } catch (error) {
      console.error("Error checking for tasks:", error);
    }
  }

  async matchTaskToAgent(task) {
    console.log(`Matching task ${task._id}:`, {
      type: task.type,
      capabilities: task.requiredCapabilities,
    });

    // Find an agent with matching capabilities
    for (const [agentId, agent] of this.runningAgents.entries()) {
      const hasCapabilities = task.requiredCapabilities.every((cap) =>
        agent.capabilities.includes(cap)
      );

      if (hasCapabilities) {
        console.log(`Found matching agent ${agent.name} for task ${task._id}`);

        // Assign task to agent
        task.status = "assigned";
        task.assignedTo = agentId;
        await task.save();

        // Add to agent's tasks
        agent.tasks.add(task._id.toString());

        // Execute the task
        this.executeTask(agentId, task._id);
        return true;
      }
    }

    console.log(`No matching agent found for task ${task._id}`);
    return false;
  }

  async executeTask(agentId, task) {
    const agent = this.runningAgents.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }
  
    try {
      console.log(`Executing task ${task._id} with agent ${agent.name}:`, {
        taskType: task.type,
        taskConfig: task.config
      });
  
      // Execute task with full task config
      const result = await this.executionFramework.executeTask(agentId, {
        type: task.type,
        ...task.config
      });
  
      // Update task
      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date();
      await task.save();
  
      // Remove from agent's tasks
      agent.tasks.delete(task._id.toString());
  
      console.log(`Task ${task._id} completed successfully`);
  
    } catch (error) {
      console.error(`Error executing task ${task._id}:`, error);
      
      // Update task status
      task.status = 'failed';
      task.error = { 
        message: error.message,
        stack: error.stack
      };
      await task.save();
  
      agent.tasks.delete(task._id.toString());
    }
  }
}

const agentOrchestrationService = new AgentOrchestrationService();
export default agentOrchestrationService;
