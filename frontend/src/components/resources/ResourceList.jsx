// /frontend/src/components/resources/ResourceList.jsx
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Trash2, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ResourceList({ resources, onUpdate }) {
  const handleDeleteResource = async (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/resources/${resourceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'github':
        return '🔗';
      case 'filesystem':
        return '📁';
      case 'command':
        return '⌨️';
      default:
        return '🔧';
    }
  };

  return (
    <div className="space-y-2">
      {resources.map(resource => (
        <Card key={resource._id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{getResourceIcon(resource.type)}</span>
              <div>
                <h3 className="font-medium">{resource.name || resource.type}</h3>
                <p className="text-sm text-muted-foreground">{resource.type}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {resource.config && (
                <Badge variant="secondary" className="text-xs">
                  {Object.keys(resource.config).length} configurations
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteResource(resource._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Resource
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {resource.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {resource.description}
            </p>
          )}

          {resource.config && (
            <div className="mt-2">
              <div className="text-sm text-muted-foreground">
                Configuration:
              </div>
              <pre className="mt-1 text-xs bg-muted p-2 rounded-md overflow-x-auto">
                {JSON.stringify(resource.config, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      ))}

      {resources.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          No resources created yet
        </div>
      )}
    </div>
  );
}