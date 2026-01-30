// RFQ Trends - Monthly data for the past 12 months
export const rfqTrendsData = [
  { month: "Feb", created: 12, quoted: 8, awarded: 5 },
  { month: "Mar", created: 18, quoted: 14, awarded: 9 },
  { month: "Apr", created: 15, quoted: 12, awarded: 8 },
  { month: "May", created: 22, quoted: 18, awarded: 12 },
  { month: "Jun", created: 28, quoted: 22, awarded: 15 },
  { month: "Jul", created: 25, quoted: 20, awarded: 14 },
  { month: "Aug", created: 32, quoted: 26, awarded: 18 },
  { month: "Sep", created: 30, quoted: 24, awarded: 16 },
  { month: "Oct", created: 35, quoted: 28, awarded: 20 },
  { month: "Nov", created: 38, quoted: 32, awarded: 22 },
  { month: "Dec", created: 42, quoted: 35, awarded: 25 },
  { month: "Jan", created: 45, quoted: 38, awarded: 28 },
];

// Supplier Response Times - Average days to respond by category
export const responseTimesData = [
  { category: "Electronics", avgDays: 2.3, suppliers: 45 },
  { category: "Textiles", avgDays: 3.1, suppliers: 32 },
  { category: "Machinery", avgDays: 4.2, suppliers: 28 },
  { category: "Packaging", avgDays: 1.8, suppliers: 56 },
  { category: "Medical", avgDays: 3.8, suppliers: 18 },
  { category: "Automotive", avgDays: 2.9, suppliers: 24 },
];

// Cost Savings - Monthly savings vs target price
export const costSavingsData = [
  { month: "Feb", targetSpend: 45000, actualSpend: 42000, savings: 3000 },
  { month: "Mar", targetSpend: 62000, actualSpend: 56000, savings: 6000 },
  { month: "Apr", targetSpend: 58000, actualSpend: 51000, savings: 7000 },
  { month: "May", targetSpend: 75000, actualSpend: 65000, savings: 10000 },
  { month: "Jun", targetSpend: 82000, actualSpend: 70000, savings: 12000 },
  { month: "Jul", targetSpend: 78000, actualSpend: 68000, savings: 10000 },
  { month: "Aug", targetSpend: 95000, actualSpend: 82000, savings: 13000 },
  { month: "Sep", targetSpend: 88000, actualSpend: 76000, savings: 12000 },
  { month: "Oct", targetSpend: 105000, actualSpend: 89000, savings: 16000 },
  { month: "Nov", targetSpend: 115000, actualSpend: 96000, savings: 19000 },
  { month: "Dec", targetSpend: 125000, actualSpend: 102000, savings: 23000 },
  { month: "Jan", targetSpend: 135000, actualSpend: 110000, savings: 25000 },
];

// Quote Success Rate by Supplier Rating
export const quoteSuccessData = [
  { rating: "5 Stars", successRate: 78, count: 124 },
  { rating: "4 Stars", successRate: 65, count: 256 },
  { rating: "3 Stars", successRate: 48, count: 189 },
  { rating: "2 Stars", successRate: 32, count: 67 },
  { rating: "1 Star", successRate: 15, count: 23 },
];

// Category Distribution
export const categoryDistributionData = [
  { name: "Electronics", value: 28, fill: "hsl(var(--chart-1))" },
  { name: "Textiles", value: 18, fill: "hsl(var(--chart-2))" },
  { name: "Machinery", value: 15, fill: "hsl(var(--chart-3))" },
  { name: "Packaging", value: 22, fill: "hsl(var(--chart-4))" },
  { name: "Medical", value: 10, fill: "hsl(var(--chart-5))" },
  { name: "Other", value: 7, fill: "hsl(var(--muted-foreground))" },
];

// Summary Stats
export const analyticsStats = {
  totalRFQs: 342,
  rfqGrowth: 18.5,
  avgResponseTime: 2.8,
  responseImprovement: -12.3,
  totalSavings: 156000,
  savingsGrowth: 24.2,
  awardRate: 68.4,
  awardGrowth: 5.2,
};
