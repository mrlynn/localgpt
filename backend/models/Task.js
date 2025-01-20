// /backend/models/Task.js
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: [
      'analyze',      // Analyze data, code, text
      'monitor',      // Monitor websites, APIs, systems
      'summarize',    // Summarize content
      'report',       // Generate reports
      'alert'         // Send alerts based on conditions
    ],
    required: true
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['once', 'hourly', 'daily', 'weekly'],
      default: 'once'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    timeOfDay: String,    // For daily/weekly tasks (HH:mm format)
    daysOfWeek: [Number]  // 0-6 for weekly tasks
  },
  input: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['scheduled', 'running', 'completed', 'failed'],
    default: 'scheduled'
  },
  lastRun: Date,
  nextRun: Date,
  results: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    output: mongoose.Schema.Types.Mixed,
    error: String
  }],
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps and calculate next run on save
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate next run based on schedule
  if (this.schedule && this.schedule.frequency !== 'once') {
    const now = new Date();
    
    switch (this.schedule.frequency) {
      case 'hourly':
        this.nextRun = new Date(now.setHours(now.getHours() + 1));
        break;
      case 'daily':
        if (this.schedule.timeOfDay) {
          const [hours, minutes] = this.schedule.timeOfDay.split(':');
          const next = new Date();
          next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          if (next <= now) next.setDate(next.getDate() + 1);
          this.nextRun = next;
        }
        break;
      case 'weekly':
        if (this.schedule.daysOfWeek?.length && this.schedule.timeOfDay) {
          const [hours, minutes] = this.schedule.timeOfDay.split(':');
          const next = new Date();
          next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          // Find next scheduled day
          while (!this.schedule.daysOfWeek.includes(next.getDay())) {
            next.setDate(next.getDate() + 1);
          }
          
          if (next <= now) next.setDate(next.getDate() + 7);
          this.nextRun = next;
        }
        break;
    }
  }
  
  next();
});

// Find tasks that need to be run
taskSchema.statics.findDue = function() {
  return this.find({
    status: 'scheduled',
    nextRun: { $lte: new Date() }
  }).sort('nextRun');
};

// Basic indexes for performance
taskSchema.index({ status: 1, nextRun: 1 });
taskSchema.index({ projectId: 1 });
taskSchema.index({ type: 1 });
taskSchema.index({ createdAt: -1 });

export const Task = mongoose.model('Task', taskSchema);