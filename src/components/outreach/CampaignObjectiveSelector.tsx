import { Card } from "@/components/ui/card";
import { Search, RefreshCw, Shield, FileSearch, MessageSquare, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

export type CampaignObjective = "sourcing" | "renewal" | "dual" | "esg" | "rfq-followup" | "general";

const OBJECTIVE_ICONS: Record<CampaignObjective, React.ReactNode> = {
  sourcing: <Search className="h-5 w-5" />,
  renewal: <RefreshCw className="h-5 w-5" />,
  dual: <Shield className="h-5 w-5" />,
  esg: <FileSearch className="h-5 w-5" />,
  "rfq-followup": <MessageSquare className="h-5 w-5" />,
  general: <Target className="h-5 w-5" />,
};

interface CampaignObjectiveSelectorProps {
  selected: CampaignObjective;
  onSelect: (objective: CampaignObjective) => void;
}

const OBJECTIVE_KEYS: Record<CampaignObjective, { labelKey: string; descKey: string }> = {
  sourcing: { labelKey: "outreach.supplierSourcing", descKey: "outreach.supplierSourcingDesc" },
  renewal: { labelKey: "outreach.contractRenewal", descKey: "outreach.contractRenewalDesc" },
  dual: { labelKey: "outreach.dualSourcing", descKey: "outreach.dualSourcingDesc" },
  esg: { labelKey: "outreach.esgCompliance", descKey: "outreach.esgComplianceDesc" },
  "rfq-followup": { labelKey: "outreach.rfqFollowupLabel", descKey: "outreach.rfqFollowupDesc" },
  general: { labelKey: "outreach.generalInquiry", descKey: "outreach.generalInquiryDesc" },
};

export function CampaignObjectiveSelector({ selected, onSelect }: CampaignObjectiveSelectorProps) {
  const { t } = useTranslation();
  const objectives = (Object.keys(OBJECTIVE_ICONS) as CampaignObjective[]);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{t("outreach.campaignObjective")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {objectives.map((id) => (
          <Card
            key={id}
            className={`p-3 cursor-pointer transition-all hover:border-primary/50 ${
              selected === id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/50"
            }`}
            onClick={() => onSelect(id)}
          >
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className={`${selected === id ? "text-primary" : "text-muted-foreground"}`}>
                {OBJECTIVE_ICONS[id]}
              </div>
              <span className="text-xs font-medium leading-tight">{t(OBJECTIVE_KEYS[id].labelKey)}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{t(OBJECTIVE_KEYS[id].descKey)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
