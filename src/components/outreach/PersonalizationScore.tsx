import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PersonalizationScoreProps {
  message: string | null;
  supplierName: string;
  productName?: string | null;
}

function computeScore(message: string, supplierName: string, productName?: string | null) {
  const checks = [
    { label: "Recipient/Company name", pass: message.toLowerCase().includes(supplierName.toLowerCase().split(" ")[0]) },
    { label: "Product reference", pass: productName ? message.toLowerCase().includes(productName.toLowerCase().split(" ")[0]) : false },
    { label: "Industry/category reference", pass: /industry|sector|category|manufacturing|production|supply/i.test(message) },
    { label: "Specific detail", pass: /capacity|certification|ISO|expansion|region|volume|project/i.test(message) },
    { label: "Single clear CTA", pass: /\?/.test(message) && (message.match(/\?/g) || []).length <= 2 },
  ];
  const passed = checks.filter((c) => c.pass).length;
  return { score: Math.round((passed / checks.length) * 100), checks };
}

export function PersonalizationScore({ message, supplierName, productName }: PersonalizationScoreProps) {
  if (!message) return null;
  const { score, checks } = computeScore(message, supplierName, productName);

  const color = score >= 70 ? "bg-emerald-500/10 text-emerald-600" : score >= 40 ? "bg-amber-500/10 text-amber-600" : "bg-destructive/10 text-destructive";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge className={`text-[10px] h-4 px-1.5 ${color}`}>
            {score}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <p className="text-xs font-medium mb-1">Personalization Score</p>
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-1 text-xs">
              <span>{c.pass ? "✅" : "❌"}</span>
              <span>{c.label}</span>
            </div>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
