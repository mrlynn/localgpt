// /frontend/src/components/Sidebar.jsx
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, MessageSquare, FolderPlus, MoreVertical, Trash2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ProjectSettingsButton } from './projects/ProjectSettings';
import { ProjectDialog } from './projects/ProjectDialog';
import { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar({ 
  chats, 
  activeChat, 
  onChatSelect, 
  onNewChat,
  projects = [],
  activeProject,
  onProjectSelect,
  onProjectSubmit,
  onDeleteProject, // Add this prop
  onDeleteChat     // Add this prop
}) {
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  return (
    <div className="w-80 border-r bg-muted/10 p-4 flex flex-col gap-4 h-full">
      {/* Projects Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Projects</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingProject(null);
              setShowProjectDialog(true);
            }}
            title="New Project"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-shrink-0" style={{ maxHeight: '30vh' }}>
          <div className="space-y-1">
            {projects.map((project) => (
              <div key={project._id} className="relative group">
                <Button
                  variant={activeProject?._id === project._id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left pr-12"
                  onClick={() => onProjectSelect(project)}
                >
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate">{project.name}</div>
                    {project.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {project.description}
                      </div>
                    )}
                  </div>
                </Button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {activeProject?._id === project._id && (
                    <ProjectSettingsButton
                      project={project}
                      onSettingsUpdated={(updatedProject) => {
                        onProjectSelect(updatedProject);
                      }}
                    />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDeleteProject?.(project._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Chats Section */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Chats</h2>
          <Button 
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            title="New Chat"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {chats.map((chat) => (
              <div key={chat.sessionId} className="group relative">
                <Button
                  variant={activeChat === chat.sessionId ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 text-left overflow-hidden pr-12"
                  onClick={() => onChatSelect(chat.sessionId)}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate">
                      {chat.title || 'New conversation'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                    </div>
                  </div>
                </Button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDeleteChat?.(chat.sessionId)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <ProjectDialog
        open={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        project={editingProject}
        onSubmit={(projectData) => {
          onProjectSubmit(projectData);
          setShowProjectDialog(false);
        }}
      />
    </div>
  );
}