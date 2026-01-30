import { useState } from "react";
import { Plus, Tag, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSavedSuppliers } from "@/contexts/SavedSuppliersContext";
import { useToast } from "@/hooks/use-toast";

interface BulkTagAssignModalProps {
  selectedIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const suggestedTags = [
  "Preferred",
  "Premium",
  "Budget-Friendly",
  "Fast Delivery",
  "Local",
  "International",
  "Verified",
  "New",
  "Review Needed",
];

type TagAction = "add" | "remove" | "replace";

export function BulkTagAssignModal({
  selectedIds,
  open,
  onOpenChange,
  onComplete,
}: BulkTagAssignModalProps) {
  const { toast } = useToast();
  const { getAllTags, getSupplierMetadata, setSupplierTags } = useSavedSuppliers();
  
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [action, setAction] = useState<TagAction>("add");

  const existingTags = getAllTags();
  const allAvailableTags = [...new Set([...suggestedTags, ...existingTags])];

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddNewTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
    }
    setNewTag("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddNewTag();
    }
  };

  const handleApply = () => {
    if (selectedTags.length === 0) {
      toast({
        title: "No tags selected",
        description: "Please select at least one tag to apply.",
        variant: "destructive",
      });
      return;
    }

    selectedIds.forEach((id) => {
      const metadata = getSupplierMetadata(id);
      const currentTags = metadata?.tags || [];

      let newTags: string[];
      switch (action) {
        case "add":
          newTags = [...new Set([...currentTags, ...selectedTags])];
          break;
        case "remove":
          newTags = currentTags.filter((t) => !selectedTags.includes(t));
          break;
        case "replace":
          newTags = [...selectedTags];
          break;
        default:
          newTags = currentTags;
      }

      setSupplierTags(id, newTags);
    });

    const actionText = action === "add" ? "added to" : action === "remove" ? "removed from" : "set for";
    toast({
      title: "Tags Updated",
      description: `${selectedTags.length} tag(s) ${actionText} ${selectedIds.length} supplier(s).`,
    });

    setSelectedTags([]);
    setAction("add");
    onComplete();
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedTags([]);
    setAction("add");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Bulk Tag Assignment
          </DialogTitle>
          <DialogDescription>
            Apply tags to {selectedIds.length} selected supplier(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Action Selection */}
          <div className="space-y-2">
            <Label>Action</Label>
            <div className="flex gap-2">
              {[
                { value: "add" as TagAction, label: "Add tags" },
                { value: "remove" as TagAction, label: "Remove tags" },
                { value: "replace" as TagAction, label: "Replace all tags" },
              ].map((opt) => (
                <Button
                  key={opt.value}
                  variant={action === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAction(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Selected Tags */}
          <div className="space-y-2">
            <Label>Selected Tags ({selectedTags.length})</Label>
            {selectedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 rounded-md border bg-muted/30 min-h-[48px]">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      onClick={() => handleToggleTag(tag)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-md border bg-muted/30 text-sm text-muted-foreground text-center">
                No tags selected
              </div>
            )}
          </div>

          {/* Add New Tag */}
          <div className="space-y-2">
            <Label>Add Custom Tag</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter a new tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddNewTag}
                disabled={!newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Available Tags */}
          <div className="space-y-2">
            <Label>Available Tags</Label>
            <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-2 rounded-md border">
              {allAvailableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Badge
                    key={tag}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => handleToggleTag(tag)}
                  >
                    {isSelected && <Check className="h-3 w-3 mr-1" />}
                    {tag}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={selectedTags.length === 0}>
            Apply to {selectedIds.length} Suppliers
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
