// /frontend/src/components/Sidebar.jsx
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlusCircle,
  MessageSquare,
  FolderPlus,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ProjectSettingsButton } from "./projects/ProjectSettings";
import { ProjectDialog } from "./projects/ProjectDialog";
import { useState } from "react";
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
  onDeleteProject,
  onDeleteChat,
}) {
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  return (
    <aside className="flex flex-none w-64 border-r bg-muted/10">
      <div className="flex flex-col w-full h-full">
        <div className="flex flex-col gap-2 p-4">
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

            <ScrollArea className="flex-shrink-0" style={{ maxHeight: "30vh" }}>
              <div className="space-y-1">
                {projects.map((project) => (
                  <div key={project._id} className="relative group">
                    <Button
                      variant={activeProject?._id === project._id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left pl-2 pr-14"
                      onClick={() => onProjectSelect(project)}
                    >
                      <div className="min-w-0 w-full flex flex-col">
                        <span className="truncate text-sm">{project.name}</span>
                        {project.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {project.description}
                          </span>
                        )}
                      </div>
                    </Button>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      {activeProject?._id === project._id && (
                        <ProjectSettingsButton
                          project={project}
                          onSettingsUpdated={onProjectSelect}
                        />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
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
              <div className="space-y-1">
                {chats.map((chat) => (
                  <div key={chat.sessionId} className="relative group">
                    <Button
                      variant={activeChat === chat.sessionId ? "secondary" : "ghost"}
                      className="w-full justify-start text-left pl-2 pr-14"
                      onClick={() => onChatSelect(chat.sessionId)}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0 mr-2" />
                      <div className="min-w-0 w-full flex flex-col">
                        <span className="truncate text-sm">
                          {chat.title || "New conversation"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </Button>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
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
    </aside>
  );
}