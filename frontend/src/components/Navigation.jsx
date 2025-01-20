// /frontend/src/components/Navigation.jsx
import { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bot, Database } from "lucide-react";

export function Navigation({ activeTab, onChange }) {
  useEffect(() => {
    // Update the document title based on the active tab
    const titles = {
      chat: "Chat - LocalGPT",
      agents: "Agents - LocalGPT",
      resources: "Resources - LocalGPT"
    };
    document.title = titles[activeTab] || "LocalGPT";
  }, [activeTab]);

  return (
    <Tabs value={activeTab} onValueChange={onChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="chat" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Chat
        </TabsTrigger>
        <TabsTrigger value="agents" className="flex items-center gap-2">
          <Bot className="w-4 h-4" />
          Agents
        </TabsTrigger>
        <TabsTrigger value="resources" className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          Resources
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}