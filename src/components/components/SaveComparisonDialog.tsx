import { useState } from "react";
import { Save } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveComparison, SavedComparison } from "@/lib/comparison-storage";
import { ComparisonSelection } from "@/data/components";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { useTranslation } from "react-i18next";

interface SaveComparisonDialogProps {
  selections: ComparisonSelection[];
  totalCost: number;
  completionPercent: number;
  onSave: (comparison: SavedComparison) => void;
}

export function SaveComparisonDialog({ selections, totalCost, completionPercent, onSave }: SaveComparisonDialogProps) {
  const { t } = useTranslation();
  const fc = useFormatCurrency();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: t("componentSupply.nameRequired"), description: t("componentSupply.enterConfigName"), variant: "destructive" });
      return;
    }
    const saved = saveComparison(name.trim(), selections, totalCost, description.trim() || undefined);
    toast({ title: t("componentSupply.configSaved"), description: t("componentSupply.configSavedDesc", { name: saved.name }) });
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
          {t("componentSupply.saveConfig")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("componentSupply.saveComparisonConfig")}</DialogTitle>
          <DialogDescription>{t("componentSupply.saveComparisonDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("componentSupply.configName")}</Label>
            <Input id="name" placeholder={t("componentSupply.configNamePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("componentSupply.descriptionOptional")}</Label>
            <Textarea id="description" placeholder={t("componentSupply.notesPlaceholder")} value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("componentSupply.suppliersSelected")}:</span>
              <span className="font-medium">{selectedCount} / {selections.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("componentSupply.totalCost")}:</span>
              <span className="font-medium">{fc(totalCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("componentSupply.completion")}:</span>
              <span className="font-medium">{completionPercent.toFixed(0)}%</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {t("componentSupply.saveConfiguration")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
