import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  FileText,
  Award,
  Download,
  GitCompare,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  rfqTrendsData,
  responseTimesData,
  costSavingsData,
  quoteSuccessData,
  categoryDistributionData,
  analyticsStats,
  filterDataByDateRange,
  calculateFilteredStats,
} from "@/data/analytics";

const rfqChartConfig = {
  created: { label: "Created", color: "hsl(var(--chart-1))" },
  quoted: { label: "Quoted", color: "hsl(var(--chart-2))" },
  awarded: { label: "Awarded", color: "hsl(var(--chart-3))" },
};

const savingsChartConfig = {
  targetSpend: { label: "Target Spend", color: "hsl(var(--muted-foreground))" },
  actualSpend: { label: "Actual Spend", color: "hsl(var(--chart-1))" },
  savings: { label: "Savings", color: "hsl(var(--chart-3))" },
};

const responseChartConfig = {
  avgDays: { label: "Avg. Days", color: "hsl(var(--chart-2))" },
};

const successChartConfig = {
  successRate: { label: "Success Rate", color: "hsl(var(--chart-4))" },
};

interface ComparisonStatCardProps {
  title: string;
  currentValue: number;
  compareValue: number;
  icon: React.ElementType;
  prefix?: string;
  suffix?: string;
}

function ComparisonStatCard({
  title,
  currentValue,
  compareValue,
  icon: Icon,
  prefix = "",
  suffix = "",
}: ComparisonStatCardProps) {
  const percentChange = compareValue !== 0 
    ? (((currentValue - compareValue) / compareValue) * 100).toFixed(1) 
    : "0";
  const isPositive = currentValue >= compareValue;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current</p>
              <p className="text-xl font-bold text-primary">
                {prefix}{currentValue.toLocaleString()}{suffix}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Compare</p>
              <p className="text-xl font-bold text-muted-foreground">
                {prefix}{compareValue.toLocaleString()}{suffix}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 mt-3 pt-3 border-t text-sm">
            <TrendIcon
              className={`h-4 w-4 ${isPositive ? "text-success" : "text-destructive"}`}
            />
            <span className={isPositive ? "text-success" : "text-destructive"}>
              {isPositive ? "+" : ""}{percentChange}%
            </span>
            <span className="text-muted-foreground">vs comparison period</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  prefix?: string;
  suffix?: string;
}

function StatCard({ title, value, change, icon: Icon, prefix = "", suffix = "" }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">
                {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
              </p>
              {change !== undefined && (
                <div className="flex items-center gap-1 text-sm">
                  <TrendIcon
                    className={`h-4 w-4 ${
                      isPositive ? "text-success" : "text-destructive"
                    }`}
                  />
                  <span className={isPositive ? "text-success" : "text-destructive"}>
                    {isPositive ? "+" : ""}{change}%
                  </span>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
              )}
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);
  
  // Default to last 6 months for current range
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });
  
  // Default to previous 6 months for comparison
  const [compareDateRange, setCompareDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 12),
    to: subMonths(new Date(), 6),
  });

  // Filter data based on date range
  const filteredRfqData = useMemo(() => {
    return filterDataByDateRange(rfqTrendsData, dateRange?.from, dateRange?.to);
  }, [dateRange]);

  const filteredSavingsData = useMemo(() => {
    return filterDataByDateRange(costSavingsData, dateRange?.from, dateRange?.to);
  }, [dateRange]);

  // Filter comparison data
  const compareRfqData = useMemo(() => {
    return filterDataByDateRange(rfqTrendsData, compareDateRange?.from, compareDateRange?.to);
  }, [compareDateRange]);

  const compareSavingsData = useMemo(() => {
    return filterDataByDateRange(costSavingsData, compareDateRange?.from, compareDateRange?.to);
  }, [compareDateRange]);

  // Calculate dynamic stats
  const dynamicStats = useMemo(() => {
    return calculateFilteredStats(filteredRfqData, filteredSavingsData);
  }, [filteredRfqData, filteredSavingsData]);

  // Calculate comparison stats
  const compareStats = useMemo(() => {
    return calculateFilteredStats(compareRfqData, compareSavingsData);
  }, [compareRfqData, compareSavingsData]);

  const dataPointsCount = filteredRfqData.length;
  const compareDataPointsCount = compareRfqData.length;

  // Merge data for comparison charts
  const mergedRfqData = useMemo(() => {
    if (!comparisonMode) return filteredRfqData;
    
    // Create a merged dataset with both periods
    const maxLength = Math.max(filteredRfqData.length, compareRfqData.length);
    const merged = [];
    
    for (let i = 0; i < maxLength; i++) {
      const current = filteredRfqData[i];
      const compare = compareRfqData[i];
      
      merged.push({
        month: current?.month || compare?.month || `Point ${i + 1}`,
        created: current?.created || 0,
        quoted: current?.quoted || 0,
        awarded: current?.awarded || 0,
        createdCompare: compare?.created || 0,
        quotedCompare: compare?.quoted || 0,
        awardedCompare: compare?.awarded || 0,
      });
    }
    
    return merged;
  }, [comparisonMode, filteredRfqData, compareRfqData]);

  const mergedSavingsData = useMemo(() => {
    if (!comparisonMode) return filteredSavingsData;
    
    const maxLength = Math.max(filteredSavingsData.length, compareSavingsData.length);
    const merged = [];
    
    for (let i = 0; i < maxLength; i++) {
      const current = filteredSavingsData[i];
      const compare = compareSavingsData[i];
      
      merged.push({
        month: current?.month || compare?.month || `Point ${i + 1}`,
        savings: current?.savings || 0,
        savingsCompare: compare?.savings || 0,
        actualSpend: current?.actualSpend || 0,
        actualSpendCompare: compare?.actualSpend || 0,
      });
    }
    
    return merged;
  }, [comparisonMode, filteredSavingsData, compareSavingsData]);

  const rfqComparisonConfig = {
    ...rfqChartConfig,
    createdCompare: { label: "Created (Compare)", color: "hsl(var(--chart-1) / 0.4)" },
    quotedCompare: { label: "Quoted (Compare)", color: "hsl(var(--chart-2) / 0.4)" },
    awardedCompare: { label: "Awarded (Compare)", color: "hsl(var(--chart-3) / 0.4)" },
  };

  const savingsComparisonConfig = {
    savings: { label: "Savings (Current)", color: "hsl(var(--chart-3))" },
    savingsCompare: { label: "Savings (Compare)", color: "hsl(var(--chart-4))" },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
              </div>
              <p className="text-muted-foreground">
                Insights and performance metrics for your sourcing activities
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Comparison Mode Toggle & Date Pickers */}
          <Card className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCompare className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="comparison-mode" className="font-medium">
                    Comparison Mode
                  </Label>
                </div>
                <Switch
                  id="comparison-mode"
                  checked={comparisonMode}
                  onCheckedChange={setComparisonMode}
                />
              </div>
              
              <div className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center ${comparisonMode ? "" : ""}`}>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">
                    {comparisonMode ? "Current Period" : "Date Range"}
                  </Label>
                  <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                  />
                </div>
                
                {comparisonMode && (
                  <>
                    <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block mt-5" />
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">Compare To</Label>
                      <DateRangePicker
                        dateRange={compareDateRange}
                        onDateRangeChange={setCompareDateRange}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Date Range Info */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {comparisonMode ? "Current: " : ""}{dataPointsCount} data point{dataPointsCount !== 1 ? "s" : ""}
          </Badge>
          {comparisonMode && (
            <Badge variant="outline" className="text-xs">
              Compare: {compareDataPointsCount} data point{compareDataPointsCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        {comparisonMode ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ComparisonStatCard
              title="Total RFQs"
              currentValue={dynamicStats.totalRFQs}
              compareValue={compareStats.totalRFQs}
              icon={FileText}
            />
            <ComparisonStatCard
              title="Total Savings"
              currentValue={dynamicStats.totalSavings}
              compareValue={compareStats.totalSavings}
              icon={DollarSign}
              prefix="$"
            />
            <ComparisonStatCard
              title="Award Rate"
              currentValue={dynamicStats.awardRate}
              compareValue={compareStats.awardRate}
              icon={Award}
              suffix="%"
            />
            <ComparisonStatCard
              title="Avg. Savings/Month"
              currentValue={dataPointsCount > 0 ? Math.round(dynamicStats.totalSavings / dataPointsCount) : 0}
              compareValue={compareDataPointsCount > 0 ? Math.round(compareStats.totalSavings / compareDataPointsCount) : 0}
              icon={Clock}
              prefix="$"
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total RFQs"
              value={dynamicStats.totalRFQs}
              change={analyticsStats.rfqGrowth}
              icon={FileText}
            />
            <StatCard
              title="Avg. Response Time"
              value={analyticsStats.avgResponseTime}
              change={analyticsStats.responseImprovement}
              icon={Clock}
              suffix=" days"
            />
            <StatCard
              title="Total Savings"
              value={dynamicStats.totalSavings}
              change={analyticsStats.savingsGrowth}
              icon={DollarSign}
              prefix="$"
            />
            <StatCard
              title="Award Rate"
              value={dynamicStats.awardRate}
              change={analyticsStats.awardGrowth}
              icon={Award}
              suffix="%"
            />
          </div>
        )}

        {/* Charts Tabs */}
        <Tabs defaultValue="rfq-trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rfq-trends">RFQ Trends</TabsTrigger>
            <TabsTrigger value="cost-savings">Cost Savings</TabsTrigger>
            <TabsTrigger value="response-times">Response Times</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* RFQ Trends Tab */}
          <TabsContent value="rfq-trends">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {comparisonMode ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary">Current Period</Badge>
                      </div>
                      <CardTitle className="text-lg">RFQ Activity</CardTitle>
                      <CardDescription>
                        {dateRange?.from && dateRange?.to && (
                          <>
                            {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                          </>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {filteredRfqData.length > 0 ? (
                        <ChartContainer config={rfqChartConfig} className="h-[300px] w-full">
                          <BarChart data={filteredRfqData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="month" className="text-muted-foreground" />
                            <YAxis className="text-muted-foreground" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="created" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="quoted" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="awarded" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          No data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Comparison Period</Badge>
                      </div>
                      <CardTitle className="text-lg">RFQ Activity</CardTitle>
                      <CardDescription>
                        {compareDateRange?.from && compareDateRange?.to && (
                          <>
                            {format(compareDateRange.from, "MMM d, yyyy")} - {format(compareDateRange.to, "MMM d, yyyy")}
                          </>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {compareRfqData.length > 0 ? (
                        <ChartContainer config={rfqChartConfig} className="h-[300px] w-full">
                          <BarChart data={compareRfqData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="month" className="text-muted-foreground" />
                            <YAxis className="text-muted-foreground" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="created" fill="hsl(var(--chart-1) / 0.5)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="quoted" fill="hsl(var(--chart-2) / 0.5)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="awarded" fill="hsl(var(--chart-3) / 0.5)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          No data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>RFQ Activity Over Time</CardTitle>
                    <CardDescription>
                      Track the lifecycle of your RFQs from creation to award
                      {filteredRfqData.length < rfqTrendsData.length && (
                        <span className="ml-2 text-primary">
                          (Showing {filteredRfqData.length} of {rfqTrendsData.length} months)
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredRfqData.length > 0 ? (
                      <ChartContainer config={rfqChartConfig} className="h-[400px] w-full">
                        <AreaChart data={filteredRfqData}>
                          <defs>
                            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorQuoted" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorAwarded" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" className="text-muted-foreground" />
                          <YAxis className="text-muted-foreground" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="created"
                            stroke="hsl(var(--chart-1))"
                            fillOpacity={1}
                            fill="url(#colorCreated)"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="quoted"
                            stroke="hsl(var(--chart-2))"
                            fillOpacity={1}
                            fill="url(#colorQuoted)"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="awarded"
                            stroke="hsl(var(--chart-3))"
                            fillOpacity={1}
                            fill="url(#colorAwarded)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ChartContainer>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                        No data available for the selected date range
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Cost Savings Tab */}
          <TabsContent value="cost-savings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {comparisonMode ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary">Current Period</Badge>
                      </div>
                      <CardTitle className="text-lg">Cost Savings</CardTitle>
                      <CardDescription>
                        Total: ${dynamicStats.totalSavings.toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {filteredSavingsData.length > 0 ? (
                        <ChartContainer config={savingsChartConfig} className="h-[300px] w-full">
                          <BarChart data={filteredSavingsData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="month" className="text-muted-foreground" />
                            <YAxis
                              className="text-muted-foreground"
                              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <ChartTooltip
                              content={<ChartTooltipContent />}
                              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                            />
                            <Bar dataKey="savings" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          No data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Comparison Period</Badge>
                      </div>
                      <CardTitle className="text-lg">Cost Savings</CardTitle>
                      <CardDescription>
                        Total: ${compareStats.totalSavings.toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {compareSavingsData.length > 0 ? (
                        <ChartContainer config={savingsChartConfig} className="h-[300px] w-full">
                          <BarChart data={compareSavingsData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="month" className="text-muted-foreground" />
                            <YAxis
                              className="text-muted-foreground"
                              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <ChartTooltip
                              content={<ChartTooltipContent />}
                              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                            />
                            <Bar dataKey="savings" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          No data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Savings Analysis</CardTitle>
                    <CardDescription>
                      Compare target spend vs actual spend and track your savings
                      {filteredSavingsData.length < costSavingsData.length && (
                        <span className="ml-2 text-primary">
                          (Showing {filteredSavingsData.length} of {costSavingsData.length} months)
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredSavingsData.length > 0 ? (
                      <ChartContainer config={savingsChartConfig} className="h-[400px] w-full">
                        <AreaChart data={filteredSavingsData}>
                          <defs>
                            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" className="text-muted-foreground" />
                          <YAxis
                            className="text-muted-foreground"
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="targetSpend"
                            stroke="hsl(var(--muted-foreground))"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="actualSpend"
                            stroke="hsl(var(--chart-1))"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Area
                            type="monotone"
                            dataKey="savings"
                            stroke="hsl(var(--chart-3))"
                            fillOpacity={1}
                            fill="url(#colorSavings)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ChartContainer>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                        No data available for the selected date range
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Response Times Tab */}
          <TabsContent value="response-times">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Response Times by Category</CardTitle>
                  <CardDescription>
                    Average number of days suppliers take to respond to RFQs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={responseChartConfig} className="h-[400px] w-full">
                    <BarChart data={responseTimesData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-muted-foreground" />
                      <YAxis
                        dataKey="category"
                        type="category"
                        width={100}
                        className="text-muted-foreground"
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value, name) => [`${value} days`, "Avg. Response"]}
                      />
                      <Bar
                        dataKey="avgDays"
                        fill="hsl(var(--chart-2))"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4 md:grid-cols-2"
            >
              {/* Quote Success Rate */}
              <Card>
                <CardHeader>
                  <CardTitle>Quote Success by Supplier Rating</CardTitle>
                  <CardDescription>
                    Correlation between supplier ratings and successful quotes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={successChartConfig} className="h-[300px] w-full">
                    <BarChart data={quoteSuccessData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="rating" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" unit="%" />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`${value}%`, "Success Rate"]}
                      />
                      <Bar dataKey="successRate" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>RFQ Category Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of RFQs by product category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                          labelLine={false}
                        >
                          {categoryDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${value}%`, "Share"]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {categoryDistributionData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.name}: {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
