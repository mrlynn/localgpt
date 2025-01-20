// /frontend/src/components/agents/AgentManager.jsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Plus, Bot } from "lucide-react";
import { AgentList } from './AgentList';
import { AgentMetrics } from './AgentMetrics';
import { AddAgentDialog } from './AddAgentDialog';

export function AgentManager() {
  const [agents, setAgents] = useState([]);
  const [resources, setResources] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch both agents and resources on component mount
  useEffect(() => {
    Promise.all([
      fetchAgents(),
      fetchResources()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to load agents');
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/resources');
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to load resources');
    }
  };

  const handleCreateAgent = async (agentData) => {
    try {
      // Get the resource details for each selected resource
      const selectedResources = resources.filter(r => 
        agentData.selectedResources.includes(r._id)
      );
  
      // Format the agent data for the API
      const formattedData = {
        name: agentData.name,
        description: agentData.description,
        type: agentData.type,
        skills: agentData.skills,
        capabilities: agentData.capabilities,
        resources: selectedResources.map(resource => ({
          resourceId: resource._id,
          type: resource.type, // Include the resource type
          permissions: 'full'  // Or use a more granular permission system
        })),
        status: 'available',
        config: {
          maxConcurrentTasks: 1,
          timeout: 30000,
          retryAttempts: 3
        }
      };
  
      const response = await fetch('http://localhost:3000/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create agent');
      }
  
      await fetchAgents(); // Refresh the agents list
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating agent:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Create and manage AI agents with specific capabilities
          </p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Agent
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Main Agent List - Takes up 2 columns */}
        <div className="col-span-2">
          <Card>
            <CardContent className="p-6">
              <AgentList 
                agents={agents}
                onSelect={setSelectedAgent}
                selectedAgent={selectedAgent}
                onUpdate={fetchAgents}
              />
            </CardContent>
          </Card>
        </div>

        {/* Agent Details & Metrics - Takes up 1 column */}
        <div className="space-y-4">
          {selectedAgent ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Agent Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Name:</span>
                      <span className="ml-2">{selectedAgent.name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Type:</span>
                      <span className="ml-2">{selectedAgent.type}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Status:</span>
                      <span className="ml-2">{selectedAgent.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <AgentMetrics agentId={selectedAgent._id} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Select an agent to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AddAgentDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onSubmit={handleCreateAgent}
        availableResources={resources}
      />
    </div>
  );
}