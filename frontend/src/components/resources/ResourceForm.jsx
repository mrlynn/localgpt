// /frontend/src/components/resources/ResourceForm.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const RESOURCE_CONFIGS = {
    web: {
      fields: [
        { name: 'name', label: 'Resource Name', type: 'text' },
        { name: 'permissions', label: 'Permissions', type: 'checkbox',
          options: ['read'] },
        { name: 'allowedDomains', label: 'Allowed Domains', type: 'textarea',
          description: 'Enter domains (one per line)' }
      ]
    },
    github: {
      fields: [
        { name: 'token', label: 'GitHub Token', type: 'password' },
        { name: 'repoUrl', label: 'Repository URL', type: 'text' },
        { name: 'permissions', label: 'Permissions', type: 'select', 
          options: ['read', 'write', 'admin'] }
      ]
    },
    filesystem: {
      fields: [
        { name: 'path', label: 'Base Path', type: 'text' },
        { name: 'permissions', label: 'Permissions', type: 'checkbox',
          options: ['read', 'write', 'execute'] }
      ]
    },
    command: {
      fields: [
        { name: 'command', label: 'Command', type: 'text' },
        { name: 'arguments', label: 'Allowed Arguments', type: 'textarea' },
        { name: 'description', label: 'Description', type: 'textarea' }
      ]
    }
  };

export function ResourceForm({ type, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      type,
      config: formData
    });
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
      case 'password':
        return (
          <Input
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );

      case 'select':
        return (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select...</option>
            {field.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex gap-4">
            {field.options.map(opt => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData[field.name]?.includes(opt)}
                  onChange={(e) => {
                    const current = formData[field.name] || [];
                    const updated = e.target.checked
                      ? [...current, opt]
                      : current.filter(p => p !== opt);
                    handleChange(field.name, updated);
                  }}
                />
                {opt}
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {type} Resource</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {RESOURCE_CONFIGS[type].fields.map(field => (
            <div key={field.name} className="space-y-2">
              <Label>{field.label}</Label>
              {renderField(field)}
            </div>
          ))}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Create Resource
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}