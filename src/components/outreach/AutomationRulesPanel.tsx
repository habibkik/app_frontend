import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import type { AutomationRule } from "@/stores/outreachCampaignStore";

const ALL_CHANNELS = [
  "email", "linkedin", "whatsapp", "sms", "phone_call",
  "facebook", "instagram", "tiktok", "twitter",
];

interface AutomationRulesPanelProps {
  rules: AutomationRule[];
  onAddRule: (rule: Omit<AutomationRule, "id" | "created_at" | "updated_at">) => void;
  onUpdateRule: (id: string, updates: Partial<AutomationRule>) => void;
  onDeleteRule: (id: string) => void;
  userId: string;
}

export function AutomationRulesPanel({ rules, onAddRule, onUpdateRule, onDeleteRule, userId }: AutomationRulesPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newChannel, setNewChannel] = useState("email");
  const [newMaxRuns, setNewMaxRuns] = useState(3);
  const [newInterval, setNewInterval] = useState(24);

  const handleAdd = () => {
    if (!newProductName.trim()) return;
    onAddRule({
      user_id: userId,
      product_name: newProductName.trim(),
      channel: newChannel,
      enabled: true,
      max_runs: newMaxRuns,
      interval_hours: newInterval,
    });
    setNewProductName("");
    setDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Automation Rules</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Automation Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Product Name</Label>
                <Input value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="e.g. Wireless Earbuds" />
              </div>
              <div>
                <Label>Channel</Label>
                <Select value={newChannel} onValueChange={setNewChannel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_CHANNELS.map((c) => (
                      <SelectItem key={c} value={c}>{c.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Max Runs: {newMaxRuns}</Label>
                <Slider value={[newMaxRuns]} onValueChange={([v]) => setNewMaxRuns(v)} min={1} max={20} step={1} />
              </div>
              <div>
                <Label>Interval: Every {newInterval} hours</Label>
                <Slider value={[newInterval]} onValueChange={([v]) => setNewInterval(v)} min={1} max={168} step={1} />
              </div>
              <Button onClick={handleAdd} className="w-full">Add Rule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No automation rules configured yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Max Runs</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.product_name}</TableCell>
                  <TableCell>{rule.channel.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</TableCell>
                  <TableCell>{rule.max_runs}</TableCell>
                  <TableCell>{rule.interval_hours}h</TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => onUpdateRule(rule.id, { enabled: checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDeleteRule(rule.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
