import { useState } from "react";
import { Check, Clock, X, Plus, UserCheck, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ApprovalStage {
  id: string;
  role: string;
  approver: string;
  status: "pending" | "approved" | "rejected" | "waiting";
  approvedAt?: string;
  comment?: string;
}

const MOCK_STAGES: ApprovalStage[] = [
  { id: "1", role: "Procurement Manager", approver: "Sarah Chen", status: "approved", approvedAt: "2025-12-01 09:30", comment: "Approved. Pricing is competitive." },
  { id: "2", role: "Finance Director", approver: "James Wilson", status: "approved", approvedAt: "2025-12-02 14:15", comment: "Budget allocation confirmed." },
  { id: "3", role: "VP Operations", approver: "Maria Garcia", status: "pending" },
  { id: "4", role: "CEO", approver: "David Park", status: "waiting" },
];

const statusConfig: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  approved: { icon: Check, label: "Approved", className: "bg-success/10 text-success border-success/30" },
  rejected: { icon: X, label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/30" },
  pending: { icon: Clock, label: "Pending", className: "bg-warning/10 text-warning border-warning/30" },
  waiting: { icon: Clock, label: "Waiting", className: "bg-muted text-muted-foreground border-border" },
};

interface ApprovalWorkflowProps {
  rfqId?: string;
}

export function ApprovalWorkflow({ rfqId }: ApprovalWorkflowProps) {
  const [stages, setStages] = useState<ApprovalStage[]>(MOCK_STAGES);
  const [addingStage, setAddingStage] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [newApprover, setNewApprover] = useState("");

  const handleApprove = (id: string) => {
    setStages((prev) => prev.map((s) => {
      if (s.id === id) return { ...s, status: "approved" as const, approvedAt: new Date().toLocaleString(), comment: "Approved" };
      return s;
    }));
    // Unlock next waiting stage
    setStages((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx >= 0 && idx < prev.length - 1 && prev[idx + 1].status === "waiting") {
        const updated = [...prev];
        updated[idx + 1] = { ...updated[idx + 1], status: "pending" };
        return updated;
      }
      return prev;
    });
    toast.success("Stage approved");
  };

  const handleReject = (id: string) => {
    setStages((prev) => prev.map((s) => s.id === id ? { ...s, status: "rejected" as const, approvedAt: new Date().toLocaleString(), comment: "Rejected — needs revision" } : s));
    toast.error("Stage rejected");
  };

  const handleAddStage = () => {
    if (!newRole || !newApprover) return;
    setStages((prev) => [...prev, { id: `stg-${Date.now()}`, role: newRole, approver: newApprover, status: "waiting" }]);
    setNewRole("");
    setNewApprover("");
    setAddingStage(false);
  };

  const completedCount = stages.filter((s) => s.status === "approved").length;
  const progress = Math.round((completedCount / stages.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{completedCount} of {stages.length} stages completed</p>
          <div className="h-2 w-48 bg-muted rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setAddingStage(true)} className="gap-1">
          <Plus className="h-3.5 w-3.5" /> Add Stage
        </Button>
      </div>

      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const cfg = statusConfig[stage.status];
          const Icon = cfg.icon;
          return (
            <div key={stage.id} className="relative">
              {idx > 0 && <div className="absolute -top-3 left-6 w-0.5 h-3 bg-border" />}
              <Card className={cn("border", stage.status === "pending" && "ring-1 ring-primary/30")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("rounded-full p-2 border", cfg.className)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{stage.role}</p>
                        <Badge variant="outline" className="text-xs">{cfg.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <UserCheck className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{stage.approver}</p>
                        {stage.approvedAt && <span className="text-xs text-muted-foreground">• {stage.approvedAt}</span>}
                      </div>
                      {stage.comment && <p className="text-xs text-muted-foreground mt-1 italic">"{stage.comment}"</p>}
                    </div>
                    {stage.status === "pending" && (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleApprove(stage.id)}>Approve</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleReject(stage.id)}>Reject</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {addingStage && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium">Add Approval Stage</p>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Role (e.g., CFO)" value={newRole} onChange={(e) => setNewRole(e.target.value)} />
              <Input placeholder="Approver name" value={newApprover} onChange={(e) => setNewApprover(e.target.value)} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setAddingStage(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAddStage} disabled={!newRole || !newApprover}>Add</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
