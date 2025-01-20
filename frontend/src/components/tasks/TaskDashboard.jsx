// /frontend/src/components/tasks/TaskDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, RefreshCw } from "lucide-react";
import { CreateTask } from './CreateTask';

export function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [showCreateTask, setShowCreateTask] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Helper function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Schedule and monitor automated tasks</p>
        </div>
        <Button onClick={() => setShowCreateTask(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map(task => (
          <Card key={task._id} className="p-4 hover:border-primary transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-muted-foreground">{task.type}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
            
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>

            {task.schedule?.frequency !== 'once' && (
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {task.schedule.frequency}
              </div>
            )}

            {task.lastRun && (
              <div className="mt-1 text-xs text-muted-foreground">
                Last run: {formatDate(task.lastRun)}
              </div>
            )}
            {task.nextRun && (
              <div className="text-xs text-muted-foreground">
                Next run: {formatDate(task.nextRun)}
              </div>
            )}
          </Card>
        ))}

        {tasks.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No tasks yet. Create one to get started.
          </div>
        )}
      </div>

      {showCreateTask && (
        <CreateTask 
          open={showCreateTask} 
          onClose={() => setShowCreateTask(false)}
          onCreated={() => {
            fetchTasks();
            setShowCreateTask(false);
          }}
        />
      )}
    </div>
  );
}