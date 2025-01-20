// /frontend/src/components/tasks/CreateTaskDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TASK_TYPES = {
  github: {
    name: "GitHub Task",
    actions: ["createPullRequest", "clone"],
    requiredCapabilities: ["github_access"],
    fields: {
      createPullRequest: [
        { name: "repoUrl", label: "Repository URL", type: "text" },
        { name: "prTitle", label: "PR Title", type: "text" },
        { name: "prBody", label: "PR Description", type: "textarea" },
        { name: "head", label: "Source Branch", type: "text" },
        { name: "base", label: "Target Branch", type: "text" }
      ],
      clone: [
        { name: "repoUrl", label: "Repository URL", type: "text" },
        { name: "branch", label: "Branch (optional)", type: "text" }
      ]
    }
  },
  filesystem: {
    name: "Filesystem Task",
    actions: ["read", "write", "delete"],
    requiredCapabilities: ["file_access"],
    fields: {
      read: [
        { name: "path", label: "File Path", type: "text" }
      ],
      write: [
        { name: "path", label: "File Path", type: "text" },
        { name: "content", label: "Content", type: "textarea" }
      ],
      delete: [
        { name: "path", label: "File Path", type: "text" }
      ]
    }
  },
  command: {
    name: "Command Task",
    actions: ["execute"],
    requiredCapabilities: ["command_execution"],
    fields: {
      execute: [
        { name: "command", label: "Command", type: "text" },
        { name: "args", label: "Arguments (one per line)", type: "textarea" }
      ]
    }
  },
  web: {
    name: "Web Task",
    actions: ["search", "scrape", "monitor"],
    requiredCapabilities: ["web_access"],
    fields: {
      search: [
        { name: "query", label: "Search Query", type: "text" },
        { 
          name: "engine", 
          label: "Search Engine", 
          type: "select",
          options: [
            { value: "google", label: "Google" },
            { value: "duckduckgo", label: "DuckDuckGo" }
          ]
        },
        { 
          name: "numResults", 
          label: "Number of Results", 
          type: "number",
          defaultValue: 5
        }
      ],
      scrape: [
        { name: "url", label: "URL to Scrape", type: "text" },
        { 
          name: "selectors", 
          label: "CSS Selectors (JSON)", 
          type: "code",
          language: "json",
          defaultValue: JSON.stringify({
            title: "h1",
            content: ".main-content",
            links: {
              type: "list",
              selector: "a"
            }
          }, null, 2)
        }
      ],
      monitor: [
        { name: "url", label: "URL to Monitor", type: "text" },
        { 
          name: "checkInterval", 
          label: "Check Interval (seconds)", 
          type: "number",
          defaultValue: 300
        },
        { 
          name: "conditions", 
          label: "Conditions (JSON)", 
          type: "code",
          language: "json",
          defaultValue: JSON.stringify({
            price: {
              selector: ".price",
              operator: "lessThan",
              value: "100"
            },
            status: {
              selector: ".status",
              operator: "equals",
              value: "In Stock"
            }
          }, null, 2)
        }
      ]
    }
  }
};
export function CreateTaskDialog({ open, onOpenChange, onSubmit }) {
    const [currentTab, setCurrentTab] = useState("basic");
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      type: 'github',
      action: '',
      priority: 3,
      config: {},
      schedule: {
        repeat: false,
        interval: 3600000 // 1 hour default
      },
      timeout: 30000,
      maxAttempts: 3,
      tags: []
    });
    const [newTag, setNewTag] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [availableAgents, setAvailableAgents] = useState([]);
  
    useEffect(() => {
      if (open) {
        fetchAgents();
      }
    }, [open]);
  
    const fetchAgents = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/agents');
        if (response.ok) {
          const agents = await response.json();
          setAvailableAgents(agents.filter(agent => agent.status === 'available'));
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };
  
    const updateFormData = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      // Clear validation error when field is updated
      if (validationErrors[field]) {
        setValidationErrors(prev => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
    };
  
    const validateForm = () => {
      const errors = {};
      
      // Basic validation
      if (!formData.title.trim()) {
        errors.title = 'Title is required';
      }
      if (!formData.type) {
        errors.type = 'Task type is required';
      }
      if (!formData.action) {
        errors.action = 'Action is required';
      }
  
      // Validate required fields based on task type and action
      const taskType = TASK_TYPES[formData.type];
      if (taskType && formData.action) {
        const fields = taskType.fields[formData.action];
        fields?.forEach(field => {
          if (field.required && !formData.config[field.name]) {
            errors[`config.${field.name}`] = `${field.label} is required`;
          }
        });
      }
  
      // Schedule validation
      if (formData.schedule.repeat && formData.schedule.interval < 60000) {
        errors['schedule.interval'] = 'Interval must be at least 1 minute';
      }
  
      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    };
  
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
          return;
        }
      
        const taskData = {
          title: formData.title || `${TASK_TYPES[formData.type].name}: ${formData.action}`,
          description: formData.description,
          type: formData.type,
          priority: formData.priority,
          requiredCapabilities: TASK_TYPES[formData.type].requiredCapabilities,
          requiredResources: [{
            type: formData.type,
            permissions: getRequiredPermissions(formData.type, formData.action)
          }],
          config: {
            type: formData.type,
            action: formData.action,
            ...formData.config
          },
          schedule: formData.schedule.repeat ? {
            repeat: true,
            interval: formData.schedule.interval,
            nextRun: new Date(Date.now() + formData.schedule.interval)
          } : undefined,
          timeout: formData.timeout,
          maxAttempts: formData.maxAttempts,
          tags: formData.tags
        };
      
        console.log('Submitting task:', taskData); // Debug log
        onSubmit(taskData);
      };
  
    const getRequiredPermissions = (type, action) => {
      switch (type) {
        case 'github':
          return action === 'createPullRequest' ? ['write'] : ['read'];
        case 'filesystem':
          return action === 'read' ? ['read'] : ['write'];
        case 'command':
          return ['execute'];
        case 'web':
          return ['read'];
        default:
          return [];
      }
    };
  
    const addTag = () => {
      if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
        updateFormData('tags', [...formData.tags, newTag.trim()]);
        setNewTag('');
      }
    };
  
    const removeTag = (tagToRemove) => {
      updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
    };

    const renderField = (field, configData, onChange) => {
        switch (field.type) {
          case 'text':
            return (
              <Input
                value={configData[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder || field.label}
                required={field.required}
              />
            );
      
          case 'textarea':
            return (
              <Textarea
                value={configData[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder || field.label}
                required={field.required}
                rows={4}
              />
            );
      
          case 'select':
            return (
              <Select
                value={configData[field.name] || field.defaultValue}
                onValueChange={(value) => onChange(field.name, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
      
          case 'number':
            return (
              <Input
                type="number"
                value={configData[field.name] || field.defaultValue || ''}
                onChange={(e) => onChange(field.name, parseInt(e.target.value))}
                min={field.min}
                max={field.max}
                required={field.required}
              />
            );
      
          case 'code':
            return (
              <div className="relative">
                <Textarea
                  value={
                    typeof configData[field.name] === 'object'
                      ? JSON.stringify(configData[field.name], null, 2)
                      : configData[field.name] || JSON.stringify(field.defaultValue || {}, null, 2)
                  }
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      onChange(field.name, parsed);
                    } catch (error) {
                      // Allow invalid JSON while typing
                      onChange(field.name, e.target.value);
                    }
                  }}
                  className="font-mono text-sm"
                  rows={8}
                />
                <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                  {field.language}
                </div>
                {field.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {field.description}
                  </p>
                )}
              </div>
            );
      
          default:
            return (
              <Input
                value={configData[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder || field.label}
              />
            );
        }
      };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Configure your task settings and schedule
            </DialogDescription>
          </DialogHeader>
  
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
  
              {/* Basic Info Tab */}
              {/* I'll continue with each tab's content in subsequent messages */}
  {/* Basic Info Tab */}
  <TabsContent value="basic" className="space-y-4">
    <div className="grid gap-4">
      <div>
        <Label>Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          placeholder="Enter task title"
        />
        {validationErrors.title && (
          <p className="text-sm text-destructive mt-1">{validationErrors.title}</p>
        )}
      </div>
  
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Describe the task"
        />
      </div>
  
      <div>
        <Label>Priority</Label>
        <Select
          value={formData.priority.toString()}
          onValueChange={(value) => updateFormData('priority', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Low</SelectItem>
            <SelectItem value="2">Medium-Low</SelectItem>
            <SelectItem value="3">Medium</SelectItem>
            <SelectItem value="4">Medium-High</SelectItem>
            <SelectItem value="5">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
  
      <div>
        <Label>Tags</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <Badge 
              key={tag}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => removeTag(tag)}
            >
              {tag} ×
            </Badge>
          ))}
        </div>
      </div>
    </div>
  </TabsContent>
  
  {/* Configuration Tab */}
  <TabsContent value="config" className="space-y-4">
    <div className="grid gap-4">
      <div>
        <Label>Task Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => {
            updateFormData('type', value);
            updateFormData('action', '');
            updateFormData('config', {});
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TASK_TYPES).map(([type, config]) => (
              <SelectItem key={type} value={type}>
                <div className="flex flex-col">
                  <span>{config.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {config.requiredCapabilities.join(', ')}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
  
      {formData.type && (
        <div>
          <Label>Action</Label>
          <Select
            value={formData.action}
            onValueChange={(value) => {
              updateFormData('action', value);
              updateFormData('config', {});
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_TYPES[formData.type].actions.map(action => (
                <SelectItem key={action} value={action}>
                  {action.split(/(?=[A-Z])/).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
  
      {formData.type && formData.action && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
          {TASK_TYPES[formData.type].fields[formData.action].map(field => (
            <div key={field.name}>
              <Label>{field.label}</Label>
              {renderField(field, formData.config, (name, value) => {
                updateFormData('config', {
                  ...formData.config,
                  [name]: value
                });
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  </TabsContent>
  
  {/* Schedule Tab */}
  <TabsContent value="schedule" className="space-y-4">
    <div className="grid gap-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="repeat"
          checked={formData.schedule.repeat}
          onCheckedChange={(checked) => {
            updateFormData('schedule', {
              ...formData.schedule,
              repeat: checked
            });
          }}
        />
        <Label htmlFor="repeat">Repeat Task</Label>
      </div>
  
      {formData.schedule.repeat && (
        <div>
          <Label>Interval (minutes)</Label>
          <Input
            type="number"
            min="1"
            value={formData.schedule.interval / 60000}
            onChange={(e) => {
              updateFormData('schedule', {
                ...formData.schedule,
                interval: parseInt(e.target.value) * 60000
              });
            }}
          />
          {validationErrors['schedule.interval'] && (
            <p className="text-sm text-destructive mt-1">
              {validationErrors['schedule.interval']}
            </p>
          )}
        </div>
      )}
    </div>
  </TabsContent>
  
  {/* Advanced Tab */}
  <TabsContent value="advanced" className="space-y-4">
    <div className="grid gap-4">
      <div>
        <Label>Timeout (seconds)</Label>
        <Input
          type="number"
          min="1"
          value={formData.timeout / 1000}
          onChange={(e) => {
            updateFormData('timeout', parseInt(e.target.value) * 1000);
          }}
        />
      </div>
  
      <div>
        <Label>Maximum Attempts</Label>
        <Input
          type="number"
          min="1"
          max="10"
          value={formData.maxAttempts}
          onChange={(e) => {
            updateFormData('maxAttempts', parseInt(e.target.value));
          }}
        />
      </div>
  
      {availableAgents.length > 0 && (
        <div>
          <Label>Available Agents</Label>
          <div className="mt-2 space-y-2">
            {availableAgents.map(agent => (
              <div key={agent._id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <span className="font-medium">{agent.name}</span>
                  <div className="text-sm text-muted-foreground">
                    Capabilities: {agent.capabilities.join(', ')}
                  </div>
                </div>
                <Badge variant="secondary">
                  {agent.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </TabsContent>
            </Tabs>
  
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }