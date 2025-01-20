// /frontend/src/App.jsx
import { useState, useEffect, useRef } from "react";
import ChatMessage from "./components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "./components/Sidebar";
import { ProjectDialog } from "./components/projects/ProjectDialog";
import { Menu } from "./components/Menu";
import { ModelSelector } from "./components/ModelSelector";
import { FileUpload } from "@/components/ui/file-upload"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Trash2,
  MoreVertical,
  Copy,
  CheckCircle2,
  RotateCcw,
  Settings,
  MessageSquare,
  Moon,
  Sun,
  FolderPlus,
  Paperclip
} from "lucide-react";
import EnvironmentCheck from "./components/EnvironmentCheck";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showEnvCheck, setShowEnvCheck] = useState(false);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [editingProject, setEditingProject] = useState(null);
  const [chatFiles, setChatFiles] = useState([]);

  // Load projects
  useEffect(() => {
    fetchProjects();
  }, []);

  // Load chat sessions
  useEffect(() => {
    fetchChats();
  }, [activeProject]); // Refetch chats when active project changes

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
    }
  }, [activeChat]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        // If we have an active project, refresh its data
        if (activeProject) {
          const updatedProject = data.find((p) => p._id === activeProject._id);
          if (updatedProject) {
            setActiveProject(updatedProject);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchChats = async () => {
    try {
      let url = "http://localhost:3000/api/sessions";
      if (activeProject) {
        url = `http://localhost:3000/api/projects/${activeProject._id}/chats`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setChats(data.sessions || data);
        // Set first chat as active if none selected
        if (!activeChat && data.sessions?.length > 0) {
          setActiveChat(data.sessions[0].sessionId);
        }
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/history/${sessionId}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleNewChat = async () => {
    setActiveChat(null);
    setMessages([]);
    await fetchChats();
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
  };

  const handleProjectSettingsUpdate = async (updatedProject) => {
    try {
      // Refresh the projects list
      await fetchProjects();
      // Update active project if it's the one that was modified
      if (activeProject?._id === updatedProject._id) {
        setActiveProject(updatedProject);
      }
    } catch (error) {
      console.error("Error updating project settings:", error);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const response = await fetch("http://localhost:3000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const newProject = await response.json();
        // Refresh projects list
        await fetchProjects();
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = input.trim();
    setInput("");

    const formData = new FormData();
    formData.append("message", input.trim());
    chatFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      // Add user message immediately
      setMessages(prev => [...prev, { 
        role: "user", 
        content: input.trim(),
        files: chatFiles.map(f => f.name)
      }])
      setInput('')
      setChatFiles([])
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'X-Session-ID': activeChat || '',
          ...(activeProject && { 'X-Project-ID': activeProject._id })
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Create a new message for the assistant's response
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(5));

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.chunk) {
                // Update the last message with the new chunk
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  lastMessage.content += data.chunk;
                  return newMessages;
                });
              }

              if (data.done) {
                // The stream is complete
                await fetchChats(); // Refresh chat list
                break;
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = async () => {
    try {
      await fetch(`http://localhost:3000/api/clear/${activeChat || ""}`, {
        method: "POST",
      });
      setMessages([]);
      await fetchChats();
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  const copyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(content);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleProjectSubmit = async (projectData) => {
    try {
      if (projectData._id) {
        // Update existing project
        const response = await fetch(
          `http://localhost:3000/api/projects/${projectData._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(projectData),
          }
        );

        if (response.ok) {
          await fetchProjects();
        }
      } else {
        // Create new project
        const response = await fetch("http://localhost:3000/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectData),
        });

        if (response.ok) {
          const newProject = await response.json();
          await fetchProjects();
          setActiveProject(newProject); // Automatically select the new project
        }
      }
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const regenerateLastResponse = async () => {
    if (messages.length < 2) return;

    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === "user")?.content;

    if (lastUserMessage) {
      setInput(lastUserMessage);
      setMessages(messages.slice(0, -2));
      setTimeout(
        () => handleSubmit({ preventDefault: () => {}, target: null }),
        0
      );
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This will also delete all associated chats."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Update local state
        setProjects(projects.filter((p) => p._id !== projectId));
        if (activeProject?._id === projectId) {
          setActiveProject(null);
          setActiveChat(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleDeleteChat = async (sessionId) => {
    if (!confirm("Are you sure you want to delete this chat?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/sessions/${sessionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Update local state
        setChats(chats.filter((chat) => chat.sessionId !== sessionId));
        if (activeChat === sessionId) {
          setActiveChat(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  return (
    <div className="flex min-h-screen max-h-screen bg-background">
      <div className="w-80 flex-shrink-0">
        <div className="flex flex-col h-full">
          <Sidebar
            chats={chats}
            activeChat={activeChat}
            onChatSelect={setActiveChat}
            onDeleteChat={handleDeleteChat}
            onNewChat={handleNewChat}
            projects={projects}
            activeProject={activeProject}
            onProjectSelect={setActiveProject}
            onDeleteProject={handleDeleteProject}
            onProjectSubmit={handleProjectSubmit}
          />
        </div>
      </div>

      <main className="flex-1 flex flex-col min-w-[600px] max-w-[1200px]">
        <div className="border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Menu onNewChat={handleNewChat} />
              <ModelSelector onModelChange={setSelectedModel} />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEnvCheck(true)}
                title="Environment Status"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={showEnvCheck} onOpenChange={setShowEnvCheck}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Environment Status</DialogTitle>
            </DialogHeader>
            <EnvironmentCheck />
          </DialogContent>
        </Dialog>

        <ProjectDialog
          open={showProjectDialog}
          onOpenChange={setShowProjectDialog}
          project={editingProject} // Pass project for editing, null for new
          onSubmit={handleCreateProject}
        />

        <div className="flex-1 overflow-hidden">
          <Card className="h-full border-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="flex flex-col gap-6 p-4 max-w-[900px] mx-auto">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 ${
                      message.role === "assistant"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex flex-col w-full gap-2">
                        <div className="flex items-start gap-2 group">
                          <div className="bg-background border rounded-lg p-4 max-w-full overflow-hidden">
                            <ChatMessage
                              message={message.content}
                              isDarkMode={isDarkMode}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyMessage(message.content)}
                          >
                            {copySuccess === message.content ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                    {message.role === "user" && (
                      <div className="bg-primary text-primary-foreground rounded-lg p-4 max-w-[85%] break-words">
                        <div className="prose dark:prose-invert prose-sm max-w-none">
                          {message.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </Card>
        </div>

        <div className="p-4 border-t">
  <div className="flex flex-col gap-2">
    {chatFiles.length > 0 && (
      <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg">
        {chatFiles.map(file => (
          <div 
            key={file.name}
            className="flex items-center gap-2 p-1.5 pl-3 rounded-md bg-background border text-sm"
          >
            <File className="h-4 w-4 text-muted-foreground" />
            <span className="truncate max-w-[200px]">{file.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setChatFiles(prev => prev.filter(f => f !== file))}
              className="h-6 w-6 p-0 ml-1 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    )}
    
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative flex items-center gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
          className="flex-1"
        />
        <div className="flex-shrink-0">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setChatFiles(prev => [...prev, ...files]);
              e.target.value = ''; // Reset input
            }}
            multiple
            accept=".txt,.md,.csv,.json,.pdf,.xlsx,.xls"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => document.getElementById('file-upload').click()}
            className="h-full aspect-square"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || (!input.trim() && chatFiles.length === 0)}
          className="flex-shrink-0"
        >
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
    </form>
  </div>
</div>
      </main>
    </div>
  );
}

export default App;
