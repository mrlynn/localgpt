// /backend/services/executionFramework.js
import { spawn } from 'child_process';
import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';
import { webExecutionService } from './webExecutionService.js';
import { Agent } from '../models/Agent.js';
import { Resource } from '../models/Resource.js';

export class ExecutionFramework {
  constructor() {
    this.runningTasks = new Map();
  }

  async executeTask(agentId, taskConfig) {
    try {
        console.log('Executing task:', {
            agentId,
            taskType: taskConfig.type,
            action: taskConfig.action
          });
      const resources = await Resource.find({ agentId });
      
      // Validate resource permissions
      this.validateResourceAccess(taskConfig, resources);

      // Execute based on task type
      switch (taskConfig.type) {
        case 'github':
          return await this.executeGitHubTask(taskConfig, resources);
        case 'filesystem':
          return await this.executeFileSystemTask(taskConfig, resources);
        case 'command':
          return await this.executeCommandTask(taskConfig, resources);
        case 'web':
            return await webExecutionService.executeWebTask(taskConfig); 
        default:
          throw new Error(`Unsupported task type: ${taskConfig.type}`);
      }
    } catch (error) {
      console.error('Task execution failed:', error);
      throw error;
    }
  }

  async validateResourceAccess(agentId, taskConfig) {
    // Skip validation for web tasks
    if (taskConfig.type === 'web') {
      return true;
    }

    try {
      // Get agent with populated resources
      const agent = await Agent.findById(agentId).populate('resources.resourceId');
      if (!agent || !agent.resources) {
        console.log('No agent or resources found:', { agentId });
        return false;
      }

      console.log('Validating resources for agent:', {
        agentId,
        resourceCount: agent.resources.length
      });

      // Check for matching resource type
      const matchingResource = agent.resources.find(r => 
        r && r.type === taskConfig.type
      );

      if (!matchingResource) {
        console.log(`No matching resource found for type: ${taskConfig.type}`);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error validating resource access:', error);
      return false;
    }
  }

  async executeGitHubTask(taskConfig, resources) {
    const githubResource = resources.find(r => r.type === 'github');
    if (!githubResource) {
      throw new Error('GitHub resource not found');
    }

    const octokit = new Octokit({
      auth: githubResource.config.githubToken 
    });

    switch (taskConfig.action) {
      case 'createPullRequest':
        return await this.createGitHubPR(octokit, taskConfig);
      case 'clone':
        return await this.cloneRepository(taskConfig.repoUrl, githubResource);
      default:
        throw new Error(`Unsupported GitHub action: ${taskConfig.action}`);
    }
  }

  async executeFileSystemTask(taskConfig, resources) {
    const fsResource = resources.find(r => r.type === 'filesystem');
    if (!fsResource) {
      throw new Error('Filesystem resource not found');
    }

    // Validate path is within allowed paths
    const targetPath = path.resolve(taskConfig.path);
    const isAllowed = fsResource.config.allowedPaths.some(allowedPath => 
      targetPath.startsWith(path.resolve(allowedPath))
    );

    if (!isAllowed) {
      throw new Error('Path access denied');
    }

    switch (taskConfig.action) {
      case 'read':
        return await fs.readFile(targetPath, 'utf8');
      case 'write':
        return await fs.writeFile(targetPath, taskConfig.content);
      case 'delete':
        return await fs.unlink(targetPath);
      default:
        throw new Error(`Unsupported filesystem action: ${taskConfig.action}`);
    }
  }

  async executeCommandTask(taskConfig, resources) {
    const commandResource = resources.find(r => r.type === 'command');
    if (!commandResource) {
      throw new Error('Command execution resource not found');
    }

    // Validate command is whitelisted
    const isAllowed = commandResource.config.allowedCommands.some(allowed =>
      taskConfig.command.startsWith(allowed)
    );

    if (!isAllowed) {
      throw new Error('Command not in whitelist');
    }

    return new Promise((resolve, reject) => {
      const process = spawn(taskConfig.command, taskConfig.args || [], {
        shell: true,
        cwd: taskConfig.cwd || undefined
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data;
      });

      process.stderr.on('data', (data) => {
        stderr += data; 
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
    });
  }

  async executeWebTask(taskConfig) {
    try {
      return await webExecutionService.executeWebTask(taskConfig);
    } catch (error) {
      console.error('Web task execution failed:', error);
      throw error;
    }
  }

  // Helper methods for GitHub operations
  async createGitHubPR(octokit, config) {
    const [owner, repo] = config.repoUrl.split('/').slice(-2);
    
    return await octokit.pulls.create({
      owner,
      repo,
      title: config.prTitle,
      body: config.prBody,
      head: config.head,
      base: config.base
    });
  }

  async cloneRepository(repoUrl, resource) {
    const cloneDir = path.join(os.tmpdir(), 'agent-workspace', uuidv4());
    await fs.mkdir(cloneDir, { recursive: true });

    return await this.executeCommand({
      command: 'git',
      args: ['clone', repoUrl, cloneDir],
      cwd: cloneDir
    });
  }
}

// Export singleton instance
export const executionFramework = new ExecutionFramework();