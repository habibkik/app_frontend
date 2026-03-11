import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Image, Plus, Maximize } from "lucide-react";

export type RemixMode = "change-background" | "add-prop" | "expand-canvas";

interface RemixMenuProps {
  disabled?: boolean;
  onRemix: (mode: RemixMode, context?: string) => void;
}

const BG_PRESETS = ["Beach sunset", "Marble table", "Forest", "Studio gradient", "Kitchen counter"];
const PROP_PRESETS = ["Coffee cup", "Flowers", "Laptop", "Books", "Sunglasses"];

export const RemixMenu: React.FC<RemixMenuProps> = ({ disabled, onRemix }) => {
  const [dialogMode, setDialogMode] = useState<RemixMode | null>(null);
  const [contextInput, setContextInput] = useState("");

  const handleSubmit = () => {
    if (!dialogMode) return;
    onRemix(dialogMode, contextInput || undefined);
    setDialogMode(null);
    setContextInput("");
  };

  const presets = dialogMode === "change-background" ? BG_PRESETS : PROP_PRESETS;
  const dialogTitle = dialogMode === "change-background" ? "Change Background" : "Add Prop";
  const placeholder = dialogMode === "change-background"
    ? "e.g. tropical beach, dark studio..."
    : "e.g. coffee cup, plant, headphones...";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs px-1" disabled={disabled}>
            <Sparkles className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuLabel className="text-xs">Remix Variation</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialogMode("change-background")}>
            <Image className="h-3.5 w-3.5 mr-2" />
            Change Background
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialogMode("add-prop")}>
            <Plus className="h-3.5 w-3.5 mr-2" />
            Add Prop
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRemix("expand-canvas")}>
            <Maximize className="h-3.5 w-3.5 mr-2" />
            Expand Canvas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogMode === "change-background" || dialogMode === "add-prop"} onOpenChange={(open) => { if (!open) { setDialogMode(null); setContextInput(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder={placeholder}
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <Badge
                  key={p}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent transition-colors text-xs"
                  onClick={() => { setContextInput(p); }}
                >
                  {p}
                </Badge>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogMode(null); setContextInput(""); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Remix
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
