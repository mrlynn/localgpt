// /frontend/src/components/Header.jsx
import { Button } from "@/components/ui/button";
import { Moon, Sun, Settings } from "lucide-react";
import { Menu } from "./Menu";
import { ModelSelector } from "./ModelSelector";
import EnvironmentCheck from "./EnvironmentCheck";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export function Header({ isDarkMode, onDarkModeToggle, onModelChange }) {
  const [showEnvCheck, setShowEnvCheck] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <Menu />
        <ModelSelector onModelChange={onModelChange} />
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
        <Button variant="ghost" size="icon" onClick={onDarkModeToggle}>
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
      </div>

      <Dialog open={showEnvCheck} onOpenChange={setShowEnvCheck}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Environment Status</DialogTitle>
          </DialogHeader>
          <EnvironmentCheck />
        </DialogContent>
      </Dialog>
    </div>
  );
}