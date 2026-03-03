import { useState } from "react";
import { FileText, Plus, Trash2, Copy, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export interface RFQTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: Record<string, unknown>;
  createdAt: string;
  usageCount: number;
}

const MOCK_TEMPLATES: RFQTemplate[] = [
  {
    id: "tpl-1", name: "Electronics PCB Order", category: "Electronics",
    description: "Standard PCB assembly RFQ with quality and compliance requirements",
    fields: { quantity: 5000, unit: "units", qualityStandards: ["ISO 9001", "IPC-A-610"], sampleRequired: true },
    createdAt: "2025-12-01", usageCount: 12,
  },
  {
    id: "tpl-2", name: "Raw Materials Bulk", category: "Raw Materials",
    description: "Bulk raw material sourcing with volume pricing and delivery terms",
    fields: { quantity: 50000, unit: "kg", incoterm: "CIF", paymentTerms: "Net 60" },
    createdAt: "2025-11-15", usageCount: 8,
  },
  {
    id: "tpl-3", name: "Packaging Supplies", category: "Packaging",
    description: "Custom packaging with labelling and compliance requirements",
    fields: { quantity: 10000, unit: "units", packagingRequirements: "Eco-friendly, recyclable" },
    createdAt: "2025-10-20", usageCount: 5,
  },
];

interface RFQTemplatesLibraryProps {
  onLoadTemplate?: (template: RFQTemplate) => void;
}

export function RFQTemplatesLibrary({ onLoadTemplate }: RFQTemplatesLibraryProps) {
  const [templates, setTemplates] = useState<RFQTemplate[]>(MOCK_TEMPLATES);
  const [search, setSearch] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template deleted");
  };

  const handleDuplicate = (tpl: RFQTemplate) => {
    const dup: RFQTemplate = { ...tpl, id: `tpl-${Date.now()}`, name: `${tpl.name} (Copy)`, usageCount: 0, createdAt: new Date().toISOString().slice(0, 10) };
    setTemplates((prev) => [dup, ...prev]);
    toast.success("Template duplicated");
  };

  const handleSave = () => {
    if (!newName.trim()) return;
    const tpl: RFQTemplate = {
      id: `tpl-${Date.now()}`, name: newName, category: "Custom", description: "Custom saved template",
      fields: {}, createdAt: new Date().toISOString().slice(0, 10), usageCount: 0,
    };
    setTemplates((prev) => [tpl, ...prev]);
    setSaveOpen(false);
    setNewName("");
    toast.success("Template saved");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => setSaveOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Save Current as Template</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tpl) => (
          <Card key={tpl.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{tpl.name}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">{tpl.category}</Badge>
              </div>
              <CardDescription className="text-xs">{tpl.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Used {tpl.usageCount} times</span>
                <span>{tpl.createdAt}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="default" className="flex-1 text-xs" onClick={() => { onLoadTemplate?.(tpl); toast.success(`Loaded: ${tpl.name}`); }}>
                  Load
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDuplicate(tpl)}><Copy className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(tpl.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No templates found</p>
        </div>
      )}

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Save as Template</DialogTitle></DialogHeader>
          <Input placeholder="Template name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!newName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
