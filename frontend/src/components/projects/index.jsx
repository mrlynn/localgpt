import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Folder, FolderPlus, Settings } from "lucide-react";

// Project Creation/Edit Dialog
export function ProjectDialog({ 
  open, 
  onOpenChange, 
  project = null, 
  onSubmit 
}) {
  const [name, setName] = React.useState(project?.name || '');
  const [description, setDescription] = React.useState(project?.description || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, description });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {project 
              ? 'Update your project details' 
              : 'Create a new project to organize your conversations'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="submit">
              {project ? 'Update Project' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Project Sidebar Section
export function ProjectSection({ 
  projects, 
  activeProject, 
  onProjectSelect,
  onNewProject 
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4" />
          <span className="text-sm font-semibold">Projects</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewProject}
          title="New Project"
        >
          <FolderPlus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-1">
      {projects.map((project) => (
  <div key={project._id} className="relative">
    <Button
      variant={activeProject?._id === project._id ? "secondary" : "ghost"}
      className="w-full justify-start gap-2 text-left"
      onClick={() => onProjectSelect(project)}
    >
      <div className="flex flex-col flex-1 min-w-0">
        <span className="truncate">{project.name}</span>
        {project.description && (
          <span className="text-xs text-muted-foreground truncate">
            {project.description}
          </span>
        )}
      </div>
    </Button>
    {activeProject?._id === project._id && (
      <ProjectSettingsButton 
        project={project} 
        onSettingsUpdated={fetchProjects} 
      />
    )}
  </div>
))}
      </div>
    </div>
  );
}

export default function ProjectManager() {
  const [projects, setProjects] = React.useState([]);
  const [activeProject, setActiveProject] = React.useState(null);
  const [showProjectDialog, setShowProjectDialog] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState(null);

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const newProject = await response.json();
        setProjects([...projects, newProject]);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleUpdateProject = async (projectData) => {
    try {
      const response = await fetch(`http://localhost:3000/api/projects/${editingProject._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(projects.map(p => 
          p._id === updatedProject._id ? updatedProject : p
        ));
        if (activeProject?._id === updatedProject._id) {
          setActiveProject(updatedProject);
        }
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter(p => p._id !== projectId));
        if (activeProject?._id === projectId) {
          setActiveProject(null);
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <>
      <ProjectSection
        projects={projects}
        activeProject={activeProject}
        onProjectSelect={setActiveProject}
        onNewProject={() => {
          setEditingProject(null);
          setShowProjectDialog(true);
        }}
      />

      <ProjectDialog
        open={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        project={editingProject}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
      />
    </>
  );
}