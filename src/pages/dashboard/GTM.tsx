import { useState } from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  Target,
  Users,
  Globe,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  Megaphone,
  FileText,
  Lightbulb,
  BarChart3,
  ArrowRight,
  Sparkles,
  MapPin,
  DollarSign,
  Package,
  ChevronRight,
  Plus,
  Play,
  Pause,
} from "lucide-react";
import { DashboardLayout } from "@/features/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Mock GTM data
const gtmPhases = [
  {
    id: "research",
    name: "Market Research",
    status: "completed",
    progress: 100,
    tasks: [
      { name: "Identify target market segments", completed: true },
      { name: "Analyze competitor positioning", completed: true },
      { name: "Survey potential customers", completed: true },
      { name: "Define buyer personas", completed: true },
    ],
  },
  {
    id: "strategy",
    name: "Strategy Development",
    status: "in-progress",
    progress: 65,
    tasks: [
      { name: "Define value proposition", completed: true },
      { name: "Set pricing strategy", completed: true },
      { name: "Choose distribution channels", completed: false },
      { name: "Create messaging framework", completed: false },
    ],
  },
  {
    id: "preparation",
    name: "Launch Preparation",
    status: "pending",
    progress: 0,
    tasks: [
      { name: "Develop marketing materials", completed: false },
      { name: "Set up sales enablement", completed: false },
      { name: "Configure analytics tracking", completed: false },
      { name: "Train sales team", completed: false },
    ],
  },
  {
    id: "launch",
    name: "Market Launch",
    status: "pending",
    progress: 0,
    tasks: [
      { name: "Execute launch campaign", completed: false },
      { name: "Activate PR strategy", completed: false },
      { name: "Monitor initial metrics", completed: false },
      { name: "Gather early feedback", completed: false },
    ],
  },
];

const targetMarkets = [
  { name: "North America", penetration: 45, revenue: "$2.4M", status: "active" },
  { name: "Europe", penetration: 28, revenue: "$1.2M", status: "active" },
  { name: "Asia Pacific", penetration: 12, revenue: "$450K", status: "expanding" },
  { name: "Latin America", penetration: 0, revenue: "$0", status: "planned" },
];

const channelStrategy = [
  { name: "Direct Sales", allocation: 40, leads: 234, conversion: 12 },
  { name: "Partner Network", allocation: 25, leads: 156, conversion: 8 },
  { name: "Digital Marketing", allocation: 20, leads: 892, conversion: 3 },
  { name: "Trade Shows", allocation: 15, leads: 67, conversion: 18 },
];

const milestones = [
  { date: "Jan 15", title: "Market Research Complete", status: "completed" },
  { date: "Feb 1", title: "Pricing Strategy Finalized", status: "completed" },
  { date: "Feb 15", title: "Channel Partners Signed", status: "current" },
  { date: "Mar 1", title: "Marketing Launch", status: "upcoming" },
  { date: "Mar 15", title: "First 100 Customers", status: "upcoming" },
  { date: "Apr 1", title: "APAC Expansion", status: "upcoming" },
];

export default function GTMPage() {
  const [activePhase, setActivePhase] = useState("strategy");
  
  const overallProgress = Math.round(
    gtmPhases.reduce((acc, phase) => acc + phase.progress, 0) / gtmPhases.length
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-500";
      case "in-progress":
        return "text-primary";
      case "pending":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-primary/10 text-primary border-primary/20">In Progress</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "active":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge>;
      case "expanding":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Expanding</Badge>;
      case "planned":
        return <Badge variant="secondary">Planned</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Go-To-Market</h1>
            <p className="text-muted-foreground mt-1">
              Plan and execute your product launch strategy
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Export Plan
            </Button>
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Strategy
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold text-foreground">{overallProgress}%</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
              </div>
              <Progress value={overallProgress} className="h-1.5 mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Target Markets</p>
                  <p className="text-2xl font-bold text-foreground">{targetMarkets.filter(m => m.status !== "planned").length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {targetMarkets.length} total planned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Days to Launch</p>
                  <p className="text-2xl font-bold text-foreground">28</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                March 1, 2025
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projected Revenue</p>
                  <p className="text-2xl font-bold text-foreground">$4.1M</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                First year estimate
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* GTM Phases */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Launch Phases
                </CardTitle>
                <CardDescription>
                  Track progress across all go-to-market phases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {gtmPhases.map((phase, index) => (
                  <motion.div
                    key={phase.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActivePhase(phase.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      activePhase === phase.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          phase.status === "completed" ? "bg-emerald-500/10" :
                          phase.status === "in-progress" ? "bg-primary/10" : "bg-muted"
                        }`}>
                          {phase.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : phase.status === "in-progress" ? (
                            <Play className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{phase.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {phase.tasks.filter(t => t.completed).length}/{phase.tasks.length} tasks completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(phase.status)}
                        <span className="text-sm font-medium text-foreground">{phase.progress}%</span>
                      </div>
                    </div>
                    <Progress value={phase.progress} className="h-1.5" />
                    
                    {activePhase === phase.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-border/50"
                      >
                        <div className="space-y-2">
                          {phase.tasks.map((task, taskIndex) => (
                            <div key={taskIndex} className="flex items-center gap-2">
                              {task.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className={`text-sm ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                {task.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Channel Strategy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  Channel Strategy
                </CardTitle>
                <CardDescription>
                  Distribution and marketing channel performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelStrategy.map((channel) => (
                    <div key={channel.name} className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-foreground">{channel.name}</h4>
                          <p className="text-xs text-muted-foreground">{channel.allocation}% budget allocation</p>
                        </div>
                        <Badge variant="secondary">{channel.leads} leads</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Progress value={channel.allocation} className="h-2" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{channel.conversion}%</p>
                          <p className="text-xs text-muted-foreground">conversion</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Target Markets */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Target Markets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {targetMarkets.map((market) => (
                  <div key={market.name} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground text-sm">{market.name}</span>
                      </div>
                      {getStatusBadge(market.status)}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {market.penetration}% penetration
                      </span>
                      <span className="font-medium text-foreground">{market.revenue}</span>
                    </div>
                    {market.penetration > 0 && (
                      <Progress value={market.penetration} className="h-1 mt-2" />
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Add Market
                </Button>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Key Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div key={index} className="relative pl-8">
                        <div className={`absolute left-0 top-1 h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                          milestone.status === "completed" 
                            ? "bg-emerald-500 border-emerald-500" 
                            : milestone.status === "current"
                            ? "bg-primary border-primary"
                            : "bg-background border-border"
                        }`}>
                          {milestone.status === "completed" && (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          )}
                          {milestone.status === "current" && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{milestone.date}</p>
                          <p className={`text-sm font-medium ${
                            milestone.status === "completed" ? "text-muted-foreground" : "text-foreground"
                          }`}>
                            {milestone.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lightbulb className="h-3 w-3 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Accelerate APAC Entry</p>
                      <p className="text-xs text-muted-foreground">
                        Market data suggests high demand in Japan & Singapore
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="h-3 w-3 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Partner Channel Focus</p>
                      <p className="text-xs text-muted-foreground">
                        18% conversion rate—consider increasing budget allocation
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background/80 border border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <DollarSign className="h-3 w-3 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Pricing Opportunity</p>
                      <p className="text-xs text-muted-foreground">
                        Competitors priced 15% higher—room to increase margins
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-between" size="sm">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    View Analytics
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between" size="sm">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Product Roadmap
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between" size="sm">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Assignments
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
