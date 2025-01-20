// /frontend/src/components/agents/AgentMetrics.jsx
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { formatDistance } from 'date-fns';

export function AgentMetrics({ agentId }) {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [agentId]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/agents/${agentId}/metrics`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading metrics...</div>;
  }

  if (!metrics) {
    return <div className="p-4 text-center">No metrics available</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4">
        <div className="w-20 h-20 mx-auto">
          <CircularProgressbar
            value={metrics.successRate}
            text={`${metrics.successRate}%`}
            styles={buildStyles({
              pathColor: `rgba(62, 152, 199, ${metrics.successRate / 100})`,
              textColor: '#888',
              trailColor: '#d6d6d6'
            })}
          />
        </div>
        <p className="text-center mt-2 text-sm font-medium">Success Rate</p>
      </Card>

      <Card className="p-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{metrics.tasksCompleted}</p>
          <p className="text-sm text-muted-foreground">Tasks Completed</p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-center">
          <p className="text-2xl font-bold">
            {Math.round(metrics.averageTaskDuration / 1000)}s
          </p>
          <p className="text-sm text-muted-foreground">Avg Task Duration</p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-center">
          <p className="text-sm font-medium">Last Active</p>
          <p className="text-muted-foreground">
            {formatDistance(new Date(metrics.lastActiveTime), new Date(), { addSuffix: true })}
          </p>
        </div>
      </Card>
    </div>
  );
}