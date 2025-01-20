// /frontend/src/components/tasks/TaskMonitor.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { formatDistanceToNow } from "date-fns";
import { TaskAssignmentDialog } from "./TaskAssignmentDialog";

const STATUS_COLORS = {
  pending: "bg-yellow-500",
  assigned: "bg-blue-500",
  running: "bg-purple-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
};

export function TaskMonitor() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchTasks();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/tasks");
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await fetch("http://localhost:3000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create task");
      }

      await fetchTasks();
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating task:", error);
      // Add error state handling here
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {/* Task List */}
      <div className="col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Monitor and manage agent tasks</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsAssigning(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-16rem)]">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks found. Create one to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Card
                      key={task._id}
                      className={`hover:bg-accent cursor-pointer ${
                        selectedTask?._id === task._id ? "border-primary" : ""
                      }`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-2 h-2 rounded-full ${STATUS_COLORS[task.status]}`}
                            />
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {task.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              Priority {task.priority}
                            </Badge>
                            <Badge>{task.status}</Badge>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                          <span>
                            Created{" "}
                            {formatDistanceToNow(new Date(task.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          {task.completedAt && (
                            <span>
                              • Completed{" "}
                              {formatDistanceToNow(new Date(task.completedAt), {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Task Details */}
      <div className="space-y-4">
        {selectedTask ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Status</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${STATUS_COLORS[selectedTask.status]}`}
                    />
                    <span className="capitalize">{selectedTask.status}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium">Required Capabilities</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTask.requiredCapabilities.map((cap) => (
                      <Badge key={cap} variant="secondary">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium">Required Resources</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTask.requiredResources.map((resource) => (
                      <Badge key={resource.type} variant="outline">
                        {resource.type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedTask.error && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Error</span>
                    </div>
                    <p className="mt-1 text-sm">{selectedTask.error.message}</p>
                  </div>
                )}

                {selectedTask.result && (
                  <div>
                    <h4 className="text-sm font-medium">Result</h4>
                    <pre className="mt-1 p-2 bg-muted rounded-md text-xs overflow-auto">
                      {JSON.stringify(selectedTask.result, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedTask.assignedTo && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Agent</CardTitle>
                </CardHeader>
                <CardContent>{/* Add agent details here */}</CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Select a task to view details
            </CardContent>
          </Card>
        )}
      </div>

      <CreateTaskDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onSubmit={handleCreateTask}
      />
      <TaskAssignmentDialog
        open={isAssigning}
        onClose={() => setIsAssigning(false)}
        onSubmit={() => {
          setIsAssigning(false);
          fetchTasks(); // Refresh the task list
        }}
      />
    </div>
  );
}
