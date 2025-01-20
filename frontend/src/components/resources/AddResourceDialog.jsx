// /frontend/src/components/resources/AddResourceDialog.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Github, FileText, Terminal, Globe } from "lucide-react";

const RESOURCE_TYPES = {
    
  github: {
    icon: Github,
    title: "GitHub Access",
    description: "Enable agent to interact with GitHub repositories",
    fields: [
      {
        name: "token",
        label: "Personal Access Token",
        type: "password",
        description: "GitHub personal access token with required permissions"
      },
      {
        name: "repositories",
        label: "Repository Access",
        type: "multiInput",
        description: "Enter repository URLs (one per line)",
        placeholder: "owner/repo"
      }
    ]
  },
  web: {  
    icon: Globe,
    title: "Web Access",
    description: "Enable agent to perform web searches and access web content",
    fields: [
      {
        name: "permissions",
        label: "Permissions",
        type: "checkboxGroup",
        options: ["read"],
        description: "Select allowed operations"
      },
      {
        name: "allowedDomains",
        label: "Allowed Domains",
        type: "multiInput",
        description: "Enter allowed domains (optional, one per line)",
        placeholder: "example.com"
      }
    ]
  },
  filesystem: {
    icon: FileText,
    title: "File System Access",
    description: "Enable agent to read/write local files",
    fields: [
      {
        name: "basePath",
        label: "Base Path",
        type: "text",
        description: "Root directory for file system access"
      },
      {
        name: "permissions",
        label: "Permissions",
        type: "checkboxGroup",
        options: ["read", "write", "execute"],
        description: "Select allowed operations"
      }
    ]
  },
  command: {
    icon: Terminal,
    title: "Command Execution",
    description: "Enable agent to execute system commands",
    warning: "⚠️ Grant command execution carefully",
    fields: [
      {
        name: "allowedCommands",
        label: "Allowed Commands",
        type: "multiInput",
        description: "Enter allowed commands (one per line)",
        placeholder: "command [args...]"
      }
    ]
  }
};

export function AddResourceDialog({ open, onOpenChange, onSubmit }) {
  const [selectedType, setSelectedType] = useState('github');
  const [formData, setFormData] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      type: selectedType,
      ...formData
    });
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
      case 'password':
        return (
          <div className="space-y-2" key={field.name}>
            <Label>{field.label}</Label>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'multiInput':
        return (
          <div className="space-y-2" key={field.name}>
            <Label>{field.label}</Label>
            <textarea
              className="w-full h-24 p-2 border rounded-md resize-none"
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'checkboxGroup':
        return (
          <div className="space-y-2" key={field.name}>
            <Label>{field.label}</Label>
            <div className="flex gap-4">
              {field.options.map(option => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData[field.name]?.includes(option)}
                    onChange={(e) => {
                      const current = formData[field.name] || [];
                      const updated = e.target.checked
                        ? [...current, option]
                        : current.filter(p => p !== option);
                      handleInputChange(field.name, updated);
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const ResourceIcon = RESOURCE_TYPES[selectedType]?.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Resource</DialogTitle>
        </DialogHeader>

        <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="grid w-full grid-cols-4 gap-4">  {/* Added gap-4 */}
  {Object.entries(RESOURCE_TYPES).map(([type, config]) => {
    const Icon = config.icon;
    return (
      <TabsTrigger 
        key={type} 
        value={type} 
        className="flex items-center justify-center gap-2 px-3" // Added justify-center and px-3
      >
        <Icon className="h-4 w-4" />
        <span className="truncate">{config.title}</span>  {/* Added truncate */}
      </TabsTrigger>
    );
  })}
</TabsList>

          {Object.entries(RESOURCE_TYPES).map(([type, config]) => (
            <TabsContent key={type} value={type}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <config.icon className="h-5 w-5" />
                  {config.title}
                </div>
                <p className="text-sm text-muted-foreground">{config.description}</p>
                
                {config.warning && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-3 rounded-md text-sm">
                    {config.warning}
                  </div>
                )}

                <div className="space-y-4">
                  {config.fields.map(field => renderField(field))}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Resource</Button>
                </DialogFooter>
              </form>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}