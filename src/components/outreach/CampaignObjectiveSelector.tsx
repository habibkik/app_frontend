import { Card } from "@/components/ui/card";
import { Search, RefreshCw, Shield, FileSearch, MessageSquare, Target } from "lucide-react";

export type CampaignObjective = "sourcing" | "renewal" | "dual" | "esg" | "rfq-followup" | "general";

const OBJECTIVES: { id: CampaignObjective; label: string; description: string; icon: React.ReactNode }[] = [
  { id: "sourcing", label: "Supplier Sourcing", description: "Find and qualify new suppliers", icon: <Search className="h-5 w-5" /> },
  { id: "renewal", label: "Contract Renewal", description: "Competitive pressure before renegotiation", icon: <RefreshCw className="h-5 w-5" /> },
  { id: "dual", label: "Dual Sourcing", description: "Find backup supplier", icon: <Shield className="h-5 w-5" /> },
  { id: "esg", label: "ESG Compliance", description: "Request updated certifications", icon: <FileSearch className="h-5 w-5" /> },
  { id: "rfq-followup", label: "RFQ Follow-up", description: "Follow up on sent RFQs", icon: <MessageSquare className="h-5 w-5" /> },
  { id: "general", label: "General Inquiry", description: "Custom outreach", icon: <Target className="h-5 w-5" /> },
];

interface CampaignObjectiveSelectorProps {
  selected: CampaignObjective;
  onSelect: (objective: CampaignObjective) => void;
}

export function CampaignObjectiveSelector({ selected, onSelect }: CampaignObjectiveSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Campaign Objective</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {OBJECTIVES.map((obj) => (
          <Card
            key={obj.id}
            className={`p-3 cursor-pointer transition-all hover:border-primary/50 ${
              selected === obj.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/50"
            }`}
            onClick={() => onSelect(obj.id)}
          >
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className={`${selected === obj.id ? "text-primary" : "text-muted-foreground"}`}>
                {obj.icon}
              </div>
              <span className="text-xs font-medium leading-tight">{obj.label}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{obj.description}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
