// /frontend/src/components/Sidebar.jsx
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  FolderPlus,
  MoreVertical,
  Trash2,
  ChevronDown,
  Plus,
  Folder
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

const trimTitle = (title, maxLength = 40) => {
    return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
  };
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
  const processProjectTitle = (title) => {
    return trimTitle(title, 15); // Shorter limit for projects
  };
  const processChatTitle = (title) => {
    if (!title || title === "New conversation") return title;
    return trimTitle(title, 20);
  };
  return (
    <aside className="flex flex-none w-64 border-r bg-muted/5 h-screen">
      <div className="flex flex-col h-full">
        {/* Fixed Projects Header */}
        <div className="flex items-center justify-between p-2 border-b">
          <h2 className="text-sm font-medium text-muted-foreground">Projects</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingProject(null);
              setShowProjectDialog(true);
            }}
            className="h-6 w-6"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Projects List */}
            <div className="space-y-1 mb-4">
              {projects.map((project) => (
                <div key={project._id} className="group relative">
                  <Button
                    variant={activeProject?._id === project._id ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm h-7 px-2"
                    onClick={() => onProjectSelect(project)}
                    title={project.name} // Show full title on hover
                  >
                    <div className="flex items-center w-full">
                      <Folder className="h-3 w-3 mr-1 shrink-0" />
                      <span className="truncate flex-1">
                        {processProjectTitle(project.name)}
                      </span>
                    </div>
                  </Button>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => onDeleteProject?.(project._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-2" />

            {/* Chats Header */}
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="text-sm font-medium text-muted-foreground">Chats</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onProjectSelect(null);
                  onNewChat();
                }}
                className="h-6 w-6"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Chats List */}
            <div className="space-y-1">
              {chats.map((chat) => (
                <div key={chat.sessionId} className="group relative">
                  <Button
                    variant={activeChat === chat.sessionId ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm h-7 px-2"
                    onClick={() => onChatSelect(chat.sessionId)}
                    title={chat.title} // Show full title on hover
                  >
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <MessageSquare className="h-3 w-3 shrink-0" />
                      <div className="flex flex-col items-start min-w-0">
                        <span className="truncate w-full">
                          {processChatTitle(chat.title || "New conversation")}
                        </span>
                        <span className="text-xs text-muted-foreground truncate w-full">
                          {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </Button>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDeleteChat?.(chat.sessionId)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

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