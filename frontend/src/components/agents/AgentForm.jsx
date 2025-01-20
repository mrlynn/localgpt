// /frontend/src/components/agents/AgentForm.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export function AgentForm({ resources, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'task',
    skills: [],
    capabilities: [],
    config: {
      maxConcurrentTasks: 1,
      timeout: 30000,
      retryAttempts: 3
    }
  });

  const [newSkill, setNewSkill] = useState({
    name: '',
    proficiency: 'intermediate',
    description: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfigChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };

  const addSkill = () => {
    if (newSkill.name) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, { ...newSkill }]
      }));
      setNewSkill({
        name: '',
        proficiency: 'intermediate',
        description: ''
      });
    }
  };

  const removeSkill = (skillName) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.name !== skillName)
    }));
  };

  const toggleCapability = (capability) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
        }} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task Agent</SelectItem>
                  <SelectItem value="assistant">Assistant Agent</SelectItem>
                  <SelectItem value="system">System Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Skill name"
                value={newSkill.name}
                onChange={(e) => setNewSkill(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
              />
              <Select
                value={newSkill.proficiency}
                onValueChange={(value) => setNewSkill(prev => ({
                  ...prev,
                  proficiency: value
                }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={addSkill}>
                Add Skill
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <Badge
                  key={skill.name}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  {skill.name} ({skill.proficiency})
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removeSkill(skill.name)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="space-y-4">
            <Label>Capabilities</Label>
            <div className="flex flex-wrap gap-2">
              {['file_access', 'github_access', 'command_execution', 'api_access'].map(capability => (
                <Button
                  key={capability}
                  type="button"
                  variant={formData.capabilities.includes(capability) ? "default" : "outline"}
                  onClick={() => toggleCapability(capability)}
                >
                  {capability.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <Label>Configuration</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Max Concurrent Tasks</Label>
                <Input
                  type="number"
                  value={formData.config.maxConcurrentTasks}
                  onChange={(e) => handleConfigChange('maxConcurrentTasks', parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <div>
                <Label>Timeout (ms)</Label>
                <Input
                  type="number"
                  value={formData.config.timeout}
                  onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                  min="1000"
                  step="1000"
                />
              </div>
              <div>
                <Label>Retry Attempts</Label>
                <Input
                  type="number"
                  value={formData.config.retryAttempts}
                  onChange={(e) => handleConfigChange('retryAttempts', parseInt(e.target.value))}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Create Agent
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}