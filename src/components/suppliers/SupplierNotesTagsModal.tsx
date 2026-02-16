import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Plus, Tag, StickyNote, Save } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Supplier } from "@/data/suppliers";
import { useSavedSuppliers, SupplierMetadata } from "@/contexts/SavedSuppliersContext";
import { useToast } from "@/hooks/use-toast";

interface SupplierNotesTagsModalProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function SupplierNotesTagsModal({
  supplier,
  open,
  onOpenChange,
}: SupplierNotesTagsModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { getSupplierMetadata, updateSupplierNotes, setSupplierTags, getAllTags } =
    useSavedSuppliers();

  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Load existing metadata when supplier changes
  useEffect(() => {
    if (supplier) {
      const metadata = getSupplierMetadata(supplier.id);
      setNotes(metadata?.notes || "");
      setTags(metadata?.tags || []);
    }
  }, [supplier, getSupplierMetadata]);

  if (!supplier) return null;

  const existingTags = getAllTags();
  const availableSuggestions = [...new Set([...suggestedTags, ...existingTags])].filter(
    (tag) => !tags.includes(tag)
  );

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(newTag);
    }
  };

  const handleSave = () => {
    updateSupplierNotes(supplier.id, notes);
    setSupplierTags(supplier.id, tags);
    toast({
      title: t("pages.supplierModals.changesSaved"),
      description: t("pages.supplierModals.notesAndTagsUpdated", { name: supplier.name }),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">
                {supplier.logo}
              </span>
            </div>
            {supplier.name}
          </DialogTitle>
          <DialogDescription>
            {t("pages.supplierModals.addNotesAndTags")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Notes Section */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Notes
            </Label>
            <Textarea
              placeholder="Add your notes about this supplier..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {notes.length}/500 characters
            </p>
          </div>

          {/* Tags Section */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>

            {/* Current Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add New Tag */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a new tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleAddTag(newTag)}
                disabled={!newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Suggested Tags */}
            {availableSuggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Suggested tags:</p>
                <div className="flex flex-wrap gap-1.5">
                  {availableSuggestions.slice(0, 8).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleAddTag(tag)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
