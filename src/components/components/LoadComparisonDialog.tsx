import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Trash2, Clock, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  getSavedComparisons,
  deleteComparison,
  SavedComparison,
} from "@/lib/comparison-storage";
import { ComparisonSelection } from "@/data/components";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";

interface LoadComparisonDialogProps {
  onLoad: (selections: ComparisonSelection[]) => void;
}

export function LoadComparisonDialog({ onLoad }: LoadComparisonDialogProps) {
  const fc = useFormatCurrency();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setComparisons(getSavedComparisons());
    }
  }, [open]);

  const handleLoad = (comparison: SavedComparison) => {
    onLoad(comparison.selections);
    setOpen(false);
    toast({
      title: "Configuration Loaded",
      description: `"${comparison.name}" has been applied`,
    });
  };

  const handleDelete = (id: string) => {
    const comparison = comparisons.find((c) => c.id === id);
    deleteComparison(id);
    setComparisons((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
    toast({
      title: "Configuration Deleted",
      description: comparison ? `"${comparison.name}" has been removed` : "Configuration removed",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="h-4 w-4 mr-2" />
            Load Config
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Saved Configurations</DialogTitle>
            <DialogDescription>
              Load a previously saved supplier comparison
            </DialogDescription>
          </DialogHeader>

          {comparisons.length === 0 ? (
            <div className="py-8 text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No saved configurations yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Save your current selections to access them later
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-2">
                <AnimatePresence>
                  {comparisons.map((comparison, index) => {
                    const selectedCount = comparison.selections.filter(
                      (s) => s.selectedQuoteId
                    ).length;
                    const totalCount = comparison.selections.length;
                    const isComplete = selectedCount === totalCount;

                    return (
                      <motion.div
                        key={comparison.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer group",
                          "bg-card"
                        )}
                        onClick={() => handleLoad(comparison)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground truncate">
                                {comparison.name}
                              </h4>
                              {isComplete ? (
                                <Badge variant="default" className="text-xs shrink-0">
                                  Complete
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  {selectedCount}/{totalCount}
                                </Badge>
                              )}
                            </div>

                            {comparison.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {comparison.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${fc(comparison.totalCost)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(comparison.updatedAt)}
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(comparison.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The saved configuration will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
