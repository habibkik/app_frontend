import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  PieChart, Pie, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Calculator, Package, Users, Cpu, Wrench, Building2, TrendingUp,
  RotateCcw, Copy, CheckCircle2, Sparkles,
} from "lucide-react";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { useAnalysisStore } from "@/stores/analysisStore";
import { BOMSelector } from "@/components/shared/BOMSelector";
import { toast } from "sonner";

// CostInputs interface and DEFAULT_INPUTS
interface CostInputs {
  productName: string;
  volume: number;
  materialCostPerUnit: number;
  materialWeight: number;
  materialPricePerKg: number;
  laborHoursPerUnit: number;
  laborRatePerHour: number;
  machineCycleMinutes: number;
  machineHourlyRate: number;
  toolingCost: number;
  toolingLifeUnits: number;
  overheadPercent: number;
  marginPercent: number;
  scrapPercent: number;
  packagingPerUnit: number;
  logisticsPerUnit: number;
}

const DEFAULT_INPUTS: CostInputs = {
  productName: "",
  volume: 1000,
  materialCostPerUnit: 0,
  materialWeight: 0.5,
  materialPricePerKg: 3.5,
  laborHoursPerUnit: 0.25,
  laborRatePerHour: 15,
  machineCycleMinutes: 10,
  machineHourlyRate: 45,
  toolingCost: 5000,
  toolingLifeUnits: 50000,
  overheadPercent: 15,
  marginPercent: 12,
  scrapPercent: 3,
  packagingPerUnit: 0.5,
  logisticsPerUnit: 1.2,
};

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
];

function InputRow({
  label, icon: Icon, suffix, value, onChange, min = 0, step = 0.01,
}: {
  label: string; icon: React.ElementType; suffix?: string; value: number; onChange: (v: number) => void; min?: number; step?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <Label className="text-sm min-w-[140px] shrink-0">{label}</Label>
      <div className="flex items-center gap-1.5 flex-1">
        <Input type="number" min={min} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="h-8 text-sm" />
        {suffix && <span className="text-xs text-muted-foreground whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  );
}

export default function ShouldCostPage() {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState<CostInputs>(DEFAULT_INPUTS);
  const fc = useFormatCurrency();
  const producerResults = useAnalysisStore((s) => s.producerResults);

  const hasBOMData = !!(producerResults?.components?.length);
  const bomApplied = hasBOMData && inputs.productName === producerResults?.productName;

  const handleBOMSelected = () => {
    // Auto-fill inputs when a BOM is selected via the shared selector
    const results = useAnalysisStore.getState().producerResults;
    if (results?.components?.length) {
      const totalCost = results.components.reduce((s, c) => s + (c.estimatedUnitCost || 0) * (c.quantity || 1), 0);
      setInputs(prev => ({
        ...prev,
        productName: results.productName,
        materialCostPerUnit: Math.round(totalCost * 100) / 100,
        materialWeight: 0,
        materialPricePerKg: 0,
      }));
      toast.success("BOM data applied", { description: `Loaded ${results.components.length} components from ${results.productName}` });
    }
  };

  const set = <K extends keyof CostInputs>(key: K, val: CostInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleAutoFillFromBOM = () => {
    if (!producerResults) return;
    const totalMaterialCost = producerResults.components.reduce(
      (s, c) => s + c.estimatedUnitCost * c.quantity, 0
    );
    setInputs((prev) => ({
      ...prev,
      productName: producerResults.productName,
      materialCostPerUnit: Math.round(totalMaterialCost * 100) / 100,
      materialWeight: 0,
      materialPricePerKg: 0,
    }));
    toast.success("BOM data applied", { description: `Loaded ${producerResults.components.length} components from ${producerResults.productName}` });
  };

  const costs = useMemo(() => {
    const material = inputs.materialWeight > 0 && inputs.materialPricePerKg > 0
      ? inputs.materialWeight * inputs.materialPricePerKg
      : inputs.materialCostPerUnit;
    const labor = inputs.laborHoursPerUnit * inputs.laborRatePerHour;
    const machine = (inputs.machineCycleMinutes / 60) * inputs.machineHourlyRate;
    const tooling = inputs.toolingLifeUnits > 0 ? inputs.toolingCost / inputs.toolingLifeUnits : 0;
    const subtotal = material + labor + machine + tooling;
    const scrap = subtotal * (inputs.scrapPercent / 100);
    const overhead = (subtotal + scrap) * (inputs.overheadPercent / 100);
    const packaging = inputs.packagingPerUnit;
    const logistics = inputs.logisticsPerUnit;
    const totalCost = subtotal + scrap + overhead + packaging + logistics;
    const margin = totalCost * (inputs.marginPercent / 100);
    const shouldCost = totalCost + margin;
    const totalForVolume = shouldCost * inputs.volume;
    return {
      material: Math.round(material * 100) / 100,
      labor: Math.round(labor * 100) / 100,
      machine: Math.round(machine * 100) / 100,
      tooling: Math.round(tooling * 100) / 100,
      scrap: Math.round(scrap * 100) / 100,
      overhead: Math.round(overhead * 100) / 100,
      packaging: Math.round(packaging * 100) / 100,
      logistics: Math.round(logistics * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      shouldCost: Math.round(shouldCost * 100) / 100,
      totalForVolume: Math.round(totalForVolume * 100) / 100,
    };
  }, [inputs]);

  const breakdownData = [
    { name: "Material", value: costs.material },
    { name: "Labor", value: costs.labor },
    { name: "Machine", value: costs.machine },
    { name: "Tooling", value: costs.tooling },
    { name: "Scrap", value: costs.scrap },
    { name: "Overhead", value: costs.overhead },
    { name: "Packaging", value: costs.packaging },
    { name: "Logistics", value: costs.logistics },
  ].filter((d) => d.value > 0);

  const pieData = breakdownData.map((d) => ({
    ...d,
    percent: costs.totalCost > 0 ? Math.round((d.value / costs.totalCost) * 1000) / 10 : 0,
  }));

  const handleReset = () => setInputs(DEFAULT_INPUTS);

  const handleCopy = () => {
    const lines = [
      `Should-Cost Model${inputs.productName ? ` — ${inputs.productName}` : ""}`,
      `Volume: ${inputs.volume.toLocaleString()} units`,
      "", "Cost Breakdown (per unit):",
      ...breakdownData.map((d) => `  ${d.name}: ${fc(d.value)}`),
      "", `Total Production Cost: ${fc(costs.totalCost)}`,
      `Margin (${inputs.marginPercent}%): ${fc(costs.margin)}`,
      `Should-Cost per Unit: ${fc(costs.shouldCost)}`,
      `Total for Volume: ${fc(costs.totalForVolume)}`,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Copied to clipboard");
  };

  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

  return (
    <DashboardLayout>
      <motion.div className="space-y-6 p-4 md:p-6" variants={container} initial="hidden" animate="show">
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Should-Cost Model Calculator
            </h1>
            <p className="text-sm text-muted-foreground">Estimate expected production cost to benchmark supplier quotes</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <BOMSelector fallbackLabel="No BOM (manual input)" onBOMSelected={handleBOMSelected} />
            {hasBOMData && !bomApplied && (
              <Button variant="default" size="sm" onClick={handleAutoFillFromBOM} className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Auto-fill from BOM
              </Button>
            )}
            {bomApplied && (
              <Badge variant="outline" className="gap-1"><Sparkles className="h-3 w-3" /> BOM Applied</Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset</Button>
            <Button variant="outline" size="sm" onClick={handleCopy}><Copy className="h-3.5 w-3.5 mr-1" /> Copy</Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Inputs */}
          <motion.div variants={item} className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">General</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Label className="text-sm min-w-[140px] shrink-0">Product Name</Label>
                  <Input value={inputs.productName} onChange={(e) => set("productName", e.target.value as any)} placeholder="e.g. Aluminum Housing" className="h-8 text-sm" />
                </div>
                <InputRow label="Production Volume" icon={Package} suffix="units" value={inputs.volume} onChange={(v) => set("volume", v)} min={1} step={100} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[0] }} />Material</CardTitle>
                <CardDescription className="text-xs">Enter weight × price/kg or direct unit cost</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <InputRow label="Weight per Unit" icon={Package} suffix="kg" value={inputs.materialWeight} onChange={(v) => set("materialWeight", v)} />
                <InputRow label="Price per Kg" icon={TrendingUp} suffix="$/kg" value={inputs.materialPricePerKg} onChange={(v) => set("materialPricePerKg", v)} />
                <Separator />
                <InputRow label="Or Direct Unit Cost" icon={Package} suffix="$/unit" value={inputs.materialCostPerUnit} onChange={(v) => set("materialCostPerUnit", v)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[1] }} />Labor</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <InputRow label="Hours per Unit" icon={Users} suffix="hrs" value={inputs.laborHoursPerUnit} onChange={(v) => set("laborHoursPerUnit", v)} />
                <InputRow label="Rate per Hour" icon={Users} suffix="$/hr" value={inputs.laborRatePerHour} onChange={(v) => set("laborRatePerHour", v)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[2] }} />Machine</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <InputRow label="Cycle Time" icon={Cpu} suffix="min" value={inputs.machineCycleMinutes} onChange={(v) => set("machineCycleMinutes", v)} />
                <InputRow label="Hourly Rate" icon={Cpu} suffix="$/hr" value={inputs.machineHourlyRate} onChange={(v) => set("machineHourlyRate", v)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[3] }} />Tooling</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <InputRow label="Total Tooling Cost" icon={Wrench} suffix="$" value={inputs.toolingCost} onChange={(v) => set("toolingCost", v)} />
                <InputRow label="Tooling Life" icon={Wrench} suffix="units" value={inputs.toolingLifeUnits} onChange={(v) => set("toolingLifeUnits", v)} min={1} step={1000} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Overhead, Scrap & Extras</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label className="text-sm">Overhead</Label><Badge variant="secondary">{inputs.overheadPercent}%</Badge></div>
                  <Slider value={[inputs.overheadPercent]} onValueChange={([v]) => set("overheadPercent", v)} min={0} max={50} step={1} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label className="text-sm">Scrap Rate</Label><Badge variant="secondary">{inputs.scrapPercent}%</Badge></div>
                  <Slider value={[inputs.scrapPercent]} onValueChange={([v]) => set("scrapPercent", v)} min={0} max={20} step={0.5} />
                </div>
                <Separator />
                <InputRow label="Packaging" icon={Package} suffix="$/unit" value={inputs.packagingPerUnit} onChange={(v) => set("packagingPerUnit", v)} />
                <InputRow label="Logistics" icon={Building2} suffix="$/unit" value={inputs.logisticsPerUnit} onChange={(v) => set("logisticsPerUnit", v)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Supplier Margin</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label className="text-sm">Target Margin</Label><Badge variant="secondary">{inputs.marginPercent}%</Badge></div>
                  <Slider value={[inputs.marginPercent]} onValueChange={([v]) => set("marginPercent", v)} min={0} max={40} step={1} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Results */}
          <motion.div variants={item} className="space-y-4">
            <Card className="border-primary/30 bg-primary/5 sticky top-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />Should-Cost Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Per Unit</p>
                  <p className="text-3xl font-bold text-primary">{fc(costs.shouldCost)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Production: {fc(costs.totalCost)} + Margin: {fc(costs.margin)}</p>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  {breakdownData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-medium">{fc(d.value)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-medium"><span>Production Cost</span><span>{fc(costs.totalCost)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Margin ({inputs.marginPercent}%)</span><span>{fc(costs.margin)}</span></div>
                  <div className="flex justify-between font-bold text-primary"><span>Should-Cost</span><span>{fc(costs.shouldCost)}</span></div>
                </div>
                <Separator />
                <div className="bg-muted/50 rounded-md p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total for {inputs.volume.toLocaleString()} units</p>
                  <p className="text-lg font-bold">{fc(costs.totalForVolume)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Cost Distribution</CardTitle></CardHeader>
              <CardContent className="h-[240px]">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${percent}%`}>
                        {pieData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                      </Pie>
                      <Tooltip formatter={(val: number) => fc(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Enter cost inputs to see distribution</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
