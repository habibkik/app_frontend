import { useState } from "react";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveComparison, SavedComparison } from "@/lib/comparison-storage";
import { ComparisonSelection } from "@/data/components";

interface SaveComparisonDialogProps {
  selections: ComparisonSelection[];
  totalCost: number;
  completionPercent: number;
  onSave: (comparison: SavedComparison) => void;
}

export function SaveComparisonDialog({
  selections,
  totalCost,
  completionPercent,
  onSave,
}: SaveComparisonDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this configuration",
        variant: "destructive",
      });
      return;
    }

    const saved = saveComparison(name.trim(), selections, totalCost, description.trim() || undefined);
    
    toast({
      title: "Configuration Saved",
      description: `"${saved.name}" has been saved successfully`,
    });

    onSave(saved);
    setOpen(false);
    setName("");
    setDescription("");
  };

  const selectedCount = selections.filter((s) => s.selectedQuoteId).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={selectedCount === 0}>
          <Save className="h-4 w-4 mr-2" />
          Save Config
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Comparison Configuration</DialogTitle>
          <DialogDescription>
            Save your current supplier selections to load later
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Configuration Name</Label>
            <Input
              id="name"
              placeholder="e.g., Budget Option, Premium Suppliers..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Notes about this configuration..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Suppliers selected:</span>
              <span className="font-medium">{selectedCount} / {selections.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total cost:</span>
              <span className="font-medium">${totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completion:</span>
              <span className="font-medium">{completionPercent.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
