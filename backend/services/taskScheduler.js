// /backend/services/taskScheduler.js
import { Task } from '../models/Task.js';
import { taskExecutionService } from './taskExecutionService.js';

class TaskScheduler {
  constructor() {
    this.interval = null;
  }

  start() {
    // Check for tasks every minute
    this.interval = setInterval(() => this.checkTasks(), 60000);
    console.log('Task scheduler started');
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('Task scheduler stopped');
  }

  async checkTasks() {
    try {
      const dueTasks = await Task.findDue();
      
      for (const task of dueTasks) {
        this.executeTask(task);
      }
    } catch (error) {
      console.error('Error checking tasks:', error);
    }
  }

  async executeTask(task) {
    try {
      // Update task status
      task.status = 'running';
      task.lastRun = new Date();
      await task.save();

      // Execute the task
      const result = await taskExecutionService.executeTask(task);

      // Update task with results
      task.status = 'completed';
      task.results.push({
        timestamp: new Date(),
        output: result
      });

      // Calculate next run if scheduled
      if (task.schedule.frequency !== 'once') {
        // The pre-save middleware will calculate the next run time
        task.markModified('schedule');
      }

      await task.save();

    } catch (error) {
      console.error(`Task execution failed: ${error.message}`);
      
      task.status = 'failed';
      task.results.push({
        timestamp: new Date(),
        error: error.message
      });
      await task.save();
    }
  }
}

export const taskScheduler = new TaskScheduler();