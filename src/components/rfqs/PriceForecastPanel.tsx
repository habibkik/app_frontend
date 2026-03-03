import { TrendingDown, TrendingUp, Minus, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface PriceForecastPanelProps {
  category: string;
  currentPrice?: number;
}

const MOCK_FORECAST = [
  { month: "Jan", actual: 4.2, forecast: null },
  { month: "Feb", actual: 4.15, forecast: null },
  { month: "Mar", actual: 4.3, forecast: null },
  { month: "Apr", actual: 4.1, forecast: null },
  { month: "May", actual: 4.05, forecast: null },
  { month: "Jun", actual: 3.95, forecast: null },
  { month: "Jul", actual: null, forecast: 3.9 },
  { month: "Aug", actual: null, forecast: 3.82 },
  { month: "Sep", actual: null, forecast: 3.78 },
  { month: "Oct", actual: null, forecast: 3.7 },
  { month: "Nov", actual: null, forecast: 3.65 },
  { month: "Dec", actual: null, forecast: 3.6 },
];

const INSIGHTS = [
  { label: "6-Month Trend", value: "-8.5%", icon: TrendingDown, color: "text-success" },
  { label: "Predicted Low", value: "$3.60", icon: TrendingDown, color: "text-success" },
  { label: "Volatility", value: "Low", icon: Minus, color: "text-warning" },
  { label: "Best Buy Window", value: "Q4 2026", icon: TrendingUp, color: "text-primary" },
];

const FACTORS = [
  { factor: "Raw material prices declining globally", impact: "positive" },
  { factor: "Increased supplier competition in region", impact: "positive" },
  { factor: "Seasonal demand expected to drop in Q3", impact: "positive" },
  { factor: "Currency fluctuation risk (USD/CNY)", impact: "neutral" },
  { factor: "New tariff regulations pending review", impact: "negative" },
];

export function PriceForecastPanel({ category, currentPrice }: PriceForecastPanelProps) {
  return (
    <div className="space-y-4">
      {/* Insight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {INSIGHTS.map((ins) => (
          <Card key={ins.label}>
            <CardContent className="p-3 text-center">
              <ins.icon className={`h-5 w-5 mx-auto mb-1 ${ins.color}`} />
              <p className="text-lg font-bold">{ins.value}</p>
              <p className="text-xs text-muted-foreground">{ins.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Price Forecast — {category || "Category"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_FORECAST}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} className="text-muted-foreground" />
                <Tooltip />
                <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} name="Forecast" />
                {currentPrice && <ReferenceLine y={currentPrice} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label={{ value: "Current", fontSize: 10 }} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Influencing Factors */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Price Influencing Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {FACTORS.map((f, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className={`text-[10px] ${f.impact === "positive" ? "border-success/50 text-success" : f.impact === "negative" ? "border-destructive/50 text-destructive" : "border-warning/50 text-warning"}`}>
                  {f.impact === "positive" ? "↓" : f.impact === "negative" ? "↑" : "~"} {f.impact}
                </Badge>
                <span className="text-muted-foreground">{f.factor}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
