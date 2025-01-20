// /frontend/src/components/tasks/CreateTask.jsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label"; // Add this import

export function CreateTask({ open, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    schedule: {
      frequency: 'once',
      timeOfDay: '09:00',
      daysOfWeek: []
    }
  });

  const taskTypes = [
    { value: 'analyze', label: 'Analyze', description: 'Analyze data, code, or text' },
    { value: 'monitor', label: 'Monitor', description: 'Monitor websites or systems' },
    { value: 'summarize', label: 'Summarize', description: 'Create content summaries' },
    { value: 'report', label: 'Report', description: 'Generate reports' },
    { value: 'alert', label: 'Alert', description: 'Send alerts based on conditions' }
  ];

  const frequencies = [
    { value: 'once', label: 'Once' },
    { value: 'hourly', label: 'Every Hour' },
    { value: 'daily', label: 'Every Day' },
    { value: 'weekly', label: 'Every Week' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onCreated();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Task Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this task will do"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Schedule</Label>
            <Select
              value={formData.schedule.frequency}
              onValueChange={(value) => 
                setFormData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, frequency: value }
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {frequencies.map(freq => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.schedule.frequency !== 'once' && formData.schedule.frequency !== 'hourly' && (
            <div className="space-y-2">
              <Label>Time of Day</Label>
              <Input
                type="time"
                value={formData.schedule.timeOfDay}
                onChange={(e) => 
                  setFormData(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, timeOfDay: e.target.value }
                  }))
                }
              />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}