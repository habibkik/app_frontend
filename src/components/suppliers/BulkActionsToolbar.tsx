import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { X, Tag, Trash2, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkTag: () => void;
  onBulkRemove: () => void;
}

export function BulkActionsToolbar({ selectedCount, totalCount, onSelectAll, onClearSelection, onBulkTag, onBulkRemove }: BulkActionsToolbarProps) {
  const { t } = useTranslation();
  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span>{t("rfqCampaign.selectedCount", { count: selectedCount })}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <Button variant="ghost" size="sm" onClick={allSelected ? onClearSelection : onSelectAll} className="h-7 text-xs">
          {allSelected ? t("common.none") : t("common.all")}
        </Button>
        <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-7 text-xs">
          <X className="h-3 w-3 mr-1" />{t("bomComponents.clearAll")}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBulkTag} className="h-8">
          <Tag className="h-4 w-4 mr-2" />{t("common.edit")}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />{t("common.delete")} ({selectedCount})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("common.confirm")}</AlertDialogTitle>
              <AlertDialogDescription>{t("common.delete")}?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={onBulkRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("common.delete")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}
