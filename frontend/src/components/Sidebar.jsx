import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export function Sidebar({ 
  chats, 
  activeChat, 
  onChatSelect, 
  onNewChat 
}) {
  return (
    <div className="w-80 border-r bg-muted/10 p-4 flex flex-col gap-4">
      <Button 
        onClick={onNewChat}
        className="w-full gap-2"
      >
        <PlusCircle className="w-4 h-4" />
        New Chat
      </Button>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {chats.map((chat) => (
            <Button
              key={chat.sessionId}
              variant={activeChat === chat.sessionId ? "secondary" : "ghost"}
              className="w-full justify-start gap-2 text-left overflow-hidden"
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
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}