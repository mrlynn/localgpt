// /frontend/src/components/resources/ResourceManager.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, FileText, Terminal, Plus } from "lucide-react"; // Updated imports
import { ResourceForm } from "./ResourceForm";
import { ResourceList } from "./ResourceList";
import { AddResourceDialog } from "./AddResourceDialog";
import { Globe } from "lucide-react"; // Add Globe icon import

export function ResourceManager() {
  const [resources, setResources] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState("github");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/resources");
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  const handleCreateResource = async (resourceData) => {
    try {
      let formattedData = {
        type: resourceData.type,
        name: `${resourceData.type}-${Date.now()}`,
        config: {},
      };

      console.log('Incoming resource data:', resourceData);


      switch (resourceData.type) {
        case "github":
          formattedData.config = {
            githubToken: resourceData.token,
            repositories: resourceData.repositories
              .split("\n")
              .map((repo) => repo.trim())
              .filter(Boolean)
              .map((repo) => ({
                url: repo,
                permissions: ["read"], // Default to read access
              })),
          };
          break;

        case "filesystem":
          formattedData.config = {
            basePath: resourceData.basePath,
            allowedPaths: [
              {
                path: resourceData.basePath,
                permissions: resourceData.permissions || ["read"],
              },
            ],
          };
          break;

        case "command":
          formattedData.config = {
            allowedCommands: resourceData.allowedCommands
              .split("\n")
              .map((cmd) => cmd.trim())
              .filter(Boolean)
              .map((cmd) => ({
                command: cmd,
                arguments: [], // Default to no arguments
                description: `Allowed command: ${cmd}`,
              })),
          };
          break;

          case "web":
            formattedData.config = {
              permissions: resourceData.permissions || ["read"],
              // Only include allowedDomains if specifically restricted
              ...(resourceData.allowedDomains && {
                allowedDomains: resourceData.allowedDomains
                  .split("\n")
                  .map(domain => domain.trim())
                  .filter(Boolean)
              })
            };
            break;
      }

      console.log('Sending formatted data to server:', formattedData);


      const response = await fetch("http://localhost:3000/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);
  
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create resource');
      }

      await fetchResources();
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating resource:", error);
      // You might want to show this error to the user
      // setError(error.message);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Resource Management
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </CardTitle>
        <CardDescription>
          Manage resources that can be used by agents
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="web" onValueChange={setSelectedType}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="web" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Web
            </TabsTrigger>
            <TabsTrigger value="github" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="filesystem" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              File System
            </TabsTrigger>
            <TabsTrigger value="command" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Commands
            </TabsTrigger>
          </TabsList>
          <TabsContent value="web">
            <ResourceList
              resources={resources.filter((r) => r.type === "web")}
              onUpdate={fetchResources}
            />
          </TabsContent>
          <TabsContent value="github">
            <ResourceList
              resources={resources.filter((r) => r.type === "github")}
              onUpdate={fetchResources}
            />
          </TabsContent>

          <TabsContent value="filesystem">
            <ResourceList
              resources={resources.filter((r) => r.type === "filesystem")}
              onUpdate={fetchResources}
            />
          </TabsContent>

          <TabsContent value="command">
            <ResourceList
              resources={resources.filter((r) => r.type === "command")}
              onUpdate={fetchResources}
            />
          </TabsContent>
        </Tabs>

        {isCreating && (
          <ResourceForm
            type={selectedType}
            onSubmit={handleCreateResource}
            onCancel={() => setIsCreating(false)}
          />
        )}
      </CardContent>
      <AddResourceDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onSubmit={handleCreateResource}
      />
    </Card>
  );
}
