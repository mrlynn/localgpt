// /frontend/src/components/agents/AgentList.jsx
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Play, Pause, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AgentList({ agents, onSelect, selectedAgent, onUpdate }) {
  const handleStatusChange = async (agentId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/agents/${agentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/agents/${agentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
        if (selectedAgent?._id === agentId) {
          onSelect(null);
        }
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-2">
      {agents.map(agent => (
        <Card
          key={agent._id}
          className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
            selectedAgent?._id === agent._id ? 'border-primary' : ''
          }`}
          onClick={() => onSelect(agent)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
              <div>
                <h3 className="font-medium">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">{agent.type}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {agent.capabilities.map(capability => (
                  <Badge key={capability} variant="secondary" className="text-xs">
                    {capability}
                  </Badge>
                ))}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {agent.status === 'offline' ? (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(agent._id, 'available')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Agent
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(agent._id, 'offline')}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Agent
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteAgent(agent._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Agent
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {agent.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {agent.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-1">
            {agent.skills.map(skill => (
              <Badge
                key={skill.name}
                variant="outline"
                className="text-xs"
              >
                {skill.name} ({skill.proficiency})
              </Badge>
            ))}
          </div>
        </Card>
      ))}

      {agents.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          No agents created yet
        </div>
      )}
    </div>
  );
}