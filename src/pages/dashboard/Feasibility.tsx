import { useState } from "react";
import { motion } from "framer-motion";
import {
  Factory,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Package,
  Wrench,
  Calendar,
  BarChart3,
  Sparkles,
  ChevronRight,
  FileText,
  Download,
  Plus,
} from "lucide-react";
import { DashboardLayout } from "@/features/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalysisStore } from "@/stores/analysisStore";

// Mock feasibility data
const mockProjects = [
  {
    id: "1",
    name: "Industrial Servo Motor Assembly",
    status: "feasible",
    score: 87,
    estimatedCost: 45000,
    timeline: "6-8 weeks",
    capacity: 85,
  },
  {
    id: "2",
    name: "Custom Hydraulic Pump System",
    status: "review",
    score: 62,
    estimatedCost: 125000,
    timeline: "12-16 weeks",
    capacity: 45,
  },
  {
    id: "3",
    name: "Precision CNC Controller Board",
    status: "not-feasible",
    score: 34,
    estimatedCost: 250000,
    timeline: "20+ weeks",
    capacity: 20,
  },
];

const riskFactors = [
  { name: "Material Availability", level: "low", score: 85 },
  { name: "Technical Complexity", level: "medium", score: 65 },
  { name: "Equipment Capacity", level: "low", score: 90 },
  { name: "Skilled Labor", level: "medium", score: 70 },
  { name: "Quality Standards", level: "low", score: 88 },
  { name: "Supply Chain", level: "high", score: 45 },
];

const capacityMetrics = [
  { name: "CNC Machining", available: 78, unit: "hours/week" },
  { name: "Assembly Line", available: 92, unit: "% capacity" },
  { name: "Quality Testing", available: 65, unit: "units/day" },
  { name: "Packaging", available: 88, unit: "% capacity" },
];

export default function FeasibilityPage() {
  const { producerResults } = useAnalysisStore();
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [quantity, setQuantity] = useState([1000]);
  const [timeline, setTimeline] = useState("standard");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "feasible":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "review":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "not-feasible":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "feasible":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Feasible</Badge>;
      case "review":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Needs Review</Badge>;
      case "not-feasible":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Not Feasible</Badge>;
      default:
        return null;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-emerald-500";
      case "medium":
        return "text-amber-500";
      case "high":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Production Feasibility</h1>
            <p className="text-muted-foreground mt-1">
              Analyze production capabilities, costs, and timelines
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Feasibility Score</p>
                  <p className="text-2xl font-bold text-foreground">{selectedProject.score}%</p>
                </div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  selectedProject.score >= 70 ? "bg-emerald-500/10" : 
                  selectedProject.score >= 50 ? "bg-amber-500/10" : "bg-red-500/10"
                }`}>
                  {selectedProject.score >= 70 ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  ) : selectedProject.score >= 50 ? (
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                </div>
              </div>
              <Progress value={selectedProject.score} className="h-1.5 mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Cost</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${(selectedProject.estimatedCost / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Based on {quantity[0]} units</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Timeline</p>
                  <p className="text-2xl font-bold text-foreground">{selectedProject.timeline}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Standard production schedule</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Capacity Match</p>
                  <p className="text-2xl font-bold text-foreground">{selectedProject.capacity}%</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Factory className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <Progress value={selectedProject.capacity} className="h-1.5 mt-3" />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Analysis Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Selector & Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Feasibility Analysis
                </CardTitle>
                <CardDescription>
                  Configure parameters and analyze production feasibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Selection */}
                <div className="space-y-2">
                  <Label>Select Project</Label>
                  <Select
                    value={selectedProject.id}
                    onValueChange={(v) => setSelectedProject(mockProjects.find(p => p.id === v) || mockProjects[0])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(project.status)}
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Current Status */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-foreground">{selectedProject.name}</h4>
                    {getStatusBadge(selectedProject.status)}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Score</p>
                      <p className="font-semibold text-foreground">{selectedProject.score}/100</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cost Estimate</p>
                      <p className="font-semibold text-foreground">${selectedProject.estimatedCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Lead Time</p>
                      <p className="font-semibold text-foreground">{selectedProject.timeline}</p>
                    </div>
                  </div>
                </div>

                {/* Quantity Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Production Quantity</Label>
                    <span className="text-sm font-medium text-primary">{quantity[0].toLocaleString()} units</span>
                  </div>
                  <Slider
                    value={quantity}
                    onValueChange={setQuantity}
                    max={10000}
                    min={100}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>100 units</span>
                    <span>10,000 units</span>
                  </div>
                </div>

                {/* Timeline Selection */}
                <div className="space-y-2">
                  <Label>Production Timeline</Label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { id: "rush", name: "Rush", desc: "+25% cost", icon: Clock },
                      { id: "standard", name: "Standard", desc: "Normal timeline", icon: Calendar },
                      { id: "flexible", name: "Flexible", desc: "-10% cost", icon: TrendingUp },
                    ].map((option) => (
                      <motion.button
                        key={option.id}
                        onClick={() => setTimeline(option.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          timeline === option.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <option.icon className={`h-4 w-4 mb-1 ${timeline === option.id ? "text-primary" : "text-muted-foreground"}`} />
                        <p className="font-medium text-sm text-foreground">{option.name}</p>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <Button className="w-full gap-2">
                  <Sparkles className="h-4 w-4" />
                  Run Feasibility Analysis
                </Button>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>
                  Identified risk factors and mitigation status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskFactors.map((risk) => (
                    <div key={risk.name} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{risk.name}</span>
                          <span className={`text-xs font-medium capitalize ${getRiskColor(risk.level)}`}>
                            {risk.level} risk
                          </span>
                        </div>
                        <Progress value={risk.score} className="h-2" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground w-10 text-right">
                        {risk.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Capacity Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Factory className="h-4 w-4 text-primary" />
                  Production Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {capacityMetrics.map((metric) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{metric.name}</span>
                      <span className="text-sm font-medium text-foreground">
                        {metric.available}% <span className="text-muted-foreground font-normal">avail.</span>
                      </span>
                    </div>
                    <Progress value={metric.available} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resource Requirements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  Resource Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Skilled Labor</span>
                  </div>
                  <Badge variant="secondary">12 FTE</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Raw Materials</span>
                  </div>
                  <Badge variant="secondary">$28K</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Equipment</span>
                  </div>
                  <Badge variant="secondary">3 units</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Machine Hours</span>
                  </div>
                  <Badge variant="secondary">240 hrs</Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Capacity Available</p>
                      <p className="text-xs text-muted-foreground">
                        Current workload allows for this production run
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Supply Chain Risk</p>
                      <p className="text-xs text-muted-foreground">
                        Consider alternate suppliers for component #4
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="h-3 w-3 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Cost Optimization</p>
                      <p className="text-xs text-muted-foreground">
                        Batch size of 1,500 reduces per-unit cost by 8%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Recent Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockProjects.slice(0, 3).map((project) => (
                  <button
                    key={project.id}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(project.status)}
                      <span className="text-sm text-foreground truncate max-w-[140px]">
                        {project.name}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
