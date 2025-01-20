// /frontend/src/components/monitor/SystemMonitor.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

export function SystemMonitor() {
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, tasksRes] = await Promise.all([
          fetch('http://localhost:3000/api/agents'),
          fetch('http://localhost:3000/api/tasks')
        ]);

        const [agentsData, tasksData] = await Promise.all([
          agentsRes.json(),
          tasksRes.json()
        ]);

        setAgents(agentsData);
        setTasks(tasksData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {/* Active Agents */}
      <Card>
        <CardHeader>
          <CardTitle>Active Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map(agent => (
              <div key={agent._id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <h3 className="font-medium">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{agent.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{agent.status}</Badge>
                  <div className="text-xs text-muted-foreground">
                    Tasks: {agent.metrics?.tasksCompleted || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task._id} className="p-2 border rounded">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{task.title}</h3>
                  <Badge>{task.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                {task.assignedTo && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Assigned to: {task.assignedTo.name}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}