// /frontend/src/components/agents/AgentResources.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Github, FileText, Terminal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AgentResources({ agent, resources, onUpdate }) {
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  const getResourceIcon = (type) => {
    switch (type) {
      case 'github':
        return <Github className="h-4 w-4" />;
      case 'filesystem':
        return <FileText className="h-4 w-4" />;
      case 'command':
        return <Terminal className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleAddResource = async () => {
    if (!selectedResource) return;

    try {
      const response = await fetch(`http://localhost:3000/api/agents/${agent._id}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId: selectedResource
        }),
      });

      if (response.ok) {
        onUpdate();
        setIsAddingResource(false);
        setSelectedResource(null);
      }
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  const handleRemoveResource = async (resourceId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/agents/${agent._id}/resources/${resourceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error removing resource:', error);
    }
  };

  // Filter out resources that are already assigned to the agent
  const availableResources = resources.filter(resource => 
    !agent.resources.some(r => r._id === resource._id)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Assigned Resources</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAddingResource(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </Button>
      </div>

      <div className="space-y-2">
        {agent.resources.map(resource => (
          <Card key={resource._id} className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getResourceIcon(resource.type)}
              <div>
                <p className="text-sm font-medium">{resource.name}</p>
                <p className="text-xs text-muted-foreground">{resource.type}</p>
                // /frontend/src/components/agents/AgentResources.jsx (continued)
              </div>
            </div>
            <div className="flex items-center gap-2">
              {resource.config && (
                <Badge variant="secondary" className="text-xs">
                  {Object.keys(resource.config).length} configurations
                </Badge>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveResource(resource._id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}

        {agent.resources.length === 0 && (
          <div className="text-center p-4 text-sm text-muted-foreground">
            No resources assigned
          </div>
        )}
      </div>

      {/* Resource Assignment Dialog */}
      <Dialog open={isAddingResource} onOpenChange={setIsAddingResource}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Select
              value={selectedResource}
              onValueChange={setSelectedResource}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a resource" />
              </SelectTrigger>
              <SelectContent>
                {availableResources.map(resource => (
                  <SelectItem key={resource._id} value={resource._id}>
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      <span>{resource.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingResource(false);
                  setSelectedResource(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddResource}>
                Add Resource
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}