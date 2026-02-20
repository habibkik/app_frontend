import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useWebsiteBuilderStore } from "@/stores/websiteBuilderStore";
import { BLOCK_META, createDefaultBlock } from "./blocks";
import type { BlockType, SiteBlock } from "./types";

export const BlockPalette: React.FC = () => {
  const { blocks, addBlock, removeBlock, toggleBlock, moveBlock, setSelectedBlockId, selectedBlockId } = useWebsiteBuilderStore();
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const availableTypes = (Object.keys(BLOCK_META) as BlockType[]).filter(
    (t) => !blocks.some((b) => b.type === t)
  );

  const handleDragStart = (idx: number) => { dragIdx.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDrop = (idx: number) => {
    if (dragIdx.current !== null && dragIdx.current !== idx) moveBlock(dragIdx.current, idx);
    dragIdx.current = null;
    setDragOverIdx(null);
  };
  const handleDragEnd = () => { dragIdx.current = null; setDragOverIdx(null); };

  return (
    <div className="space-y-3 h-full overflow-y-auto p-3">
      <h3 className="text-sm font-semibold text-foreground">Blocks</h3>

      {/* Active blocks */}
      <div className="space-y-1.5">
        {blocks.map((block, idx) => {
          const meta = BLOCK_META[block.type];
          const Icon = meta.icon;
          return (
            <div
              key={block.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              onClick={() => setSelectedBlockId(block.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md border cursor-pointer text-xs transition-all select-none ${
                selectedBlockId === block.id ? "border-primary bg-primary/10" : dragOverIdx === idx ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/40"
              }`}
            >
              <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab shrink-0" />
              <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate font-medium">{meta.label}</span>
              <Switch checked={block.enabled} onCheckedChange={() => toggleBlock(block.id)} className="scale-75" />
              <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add blocks */}
      {availableTypes.length > 0 && (
        <>
          <div className="border-t pt-2">
            <p className="text-xs text-muted-foreground mb-1.5">Add Section</p>
            <div className="space-y-1">
              {availableTypes.map((type) => {
                const meta = BLOCK_META[type];
                const Icon = meta.icon;
                return (
                  <button
                    key={type}
                    onClick={() => addBlock(createDefaultBlock(type))}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs hover:bg-accent transition-colors text-left"
                  >
                    <Plus className="h-3 w-3 text-primary shrink-0" />
                    <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium block truncate">{meta.label}</span>
                      <span className="text-muted-foreground block truncate">{meta.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
