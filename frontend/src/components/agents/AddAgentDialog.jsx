// /frontend/src/components/agents/AddAgentDialog.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bot, Trash2, Plus, ShieldCheck } from "lucide-react";

const AGENT_TYPES = {
  task: {
    name: "Task Agent",
    description: "Executes specific tasks with defined resources",
    capabilities: ["file_access", "github_access", "command_execution", "web_access"]  // Added web_access
  },
  assistant: {
    name: "Assistant Agent",
    description: "Provides conversational assistance and guidance",
    capabilities: ["file_access", "github_access"]
  },
  system: {
    name: "System Agent",
    description: "Manages system-level operations and monitoring",
    capabilities: ["command_execution", "system_monitoring"]
  }
};

export function AddAgentDialog({ open, onOpenChange, onSubmit, availableResources = [] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "task",
    skills: [],
    capabilities: [],
    selectedResources: [],
    config: {
      maxConcurrentTasks: 1,
      timeout: 30000,
      retryAttempts: 3
    }
  });

  const [newSkill, setNewSkill] = useState({
    name: "",
    proficiency: "intermediate"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateForm = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.name) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, { ...newSkill }]
      }));
      setNewSkill({ name: "", proficiency: "intermediate" });
    }
  };

  const removeSkill = (skillName) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.name !== skillName)
    }));
  };

  const toggleResource = (resourceId) => {
    setFormData(prev => ({
      ...prev,
      selectedResources: prev.selectedResources.includes(resourceId)
        ? prev.selectedResources.filter(id => id !== resourceId)
        : [...prev.selectedResources, resourceId]
    }));
  };

  const steps = [
    {
      title: "Basic Information",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Agent Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => updateForm("name", e.target.value)}
              placeholder="Enter agent name"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => updateForm("description", e.target.value)}
              placeholder="Describe the agent's purpose"
            />
          </div>

          <div>
            <Label>Agent Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => updateForm("type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AGENT_TYPES).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex flex-col">
                      <span>{config.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {config.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Skills & Capabilities",
      content: (
        <div className="space-y-6">
          {/* Skills Section */}
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
                <Plus className="h-4 w-4" />
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
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Capabilities Section */}
          <div className="space-y-4">
            <Label>Capabilities</Label>
            <div className="flex flex-wrap gap-2">
              {AGENT_TYPES[formData.type].capabilities.map(capability => (
                <Button
                  key={capability}
                  variant={formData.capabilities.includes(capability) ? "default" : "outline"}
                  onClick={() => {
                    updateForm("capabilities", 
                      formData.capabilities.includes(capability)
                        ? formData.capabilities.filter(c => c !== capability)
                        : [...formData.capabilities, capability]
                    );
                  }}
                >
                  {capability.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Resource Access",
      content: (
        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4" />
              Select resources this agent can access
            </div>
          </div>

          {availableResources.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No resources available. Create resources first.
            </div>
          ) : (
            <div className="space-y-4">
              {availableResources.map(resource => (
                <div
                  key={resource._id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => toggleResource(resource._id)}
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedResources.includes(resource._id)}
                    onChange={() => toggleResource(resource._id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{resource.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {resource.type}
                    </div>
                  </div>
                  <Badge>
                    {Object.keys(resource.config || {}).length} configurations
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Create New Agent
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 text-center ${
                  index < steps.length - 1 ? 'border-r border-border' : ''
                }`}
              >
                <div
                  className={`text-sm font-medium ${
                    currentStep === index
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  Step {index + 1}
                </div>
                <div
                  className={`text-xs ${
                    currentStep === index
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </div>
              </div>
            ))}
          </div>

          {steps[currentStep].content}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => currentStep > 0 && setCurrentStep(current => current - 1)}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(current => current + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit}>
                  Create Agent
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}