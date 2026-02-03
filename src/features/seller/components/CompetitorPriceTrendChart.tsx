import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompetitorMonitorStore } from "@/stores/competitorMonitorStore";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 min-w-[180px]">
        <p className="font-medium text-sm mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}</span>
              </div>
              <span className="text-sm font-medium">${entry.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function CompetitorPriceTrendChart() {
  const { priceTrendData } = useCompetitorMonitorStore();

  // Find the price drop annotation point (5 days ago)
  const priceDropIndex = priceTrendData.length - 6;
  const priceDropDate = priceTrendData[priceDropIndex]?.date;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Price Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={priceTrendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value}`}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
              />

              {/* Price range area (min to max) */}
              <Area
                type="monotone"
                dataKey="maxPrice"
                stroke="transparent"
                fill="url(#rangeGradient)"
                name="Max Price"
              />
              <Area
                type="monotone"
                dataKey="minPrice"
                stroke="transparent"
                fill="#ffffff"
                fillOpacity={1}
                name="Min Price"
              />

              {/* Market average line */}
              <Line
                type="monotone"
                dataKey="marketAvg"
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Market Avg"
              />

              {/* Your price line */}
              <Line
                type="monotone"
                dataKey="yourPrice"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
                name="Your Price"
                activeDot={{ r: 6, strokeWidth: 2 }}
              />

              {/* Annotation for price drop */}
              {priceDropDate && (
                <ReferenceLine
                  x={priceDropDate}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{
                    value: "You dropped price",
                    position: "top",
                    fill: "#ef4444",
                    fontSize: 11,
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
