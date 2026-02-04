import { useState, useMemo } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Package,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCompetitorMonitorStore } from "@/stores/competitorMonitorStore";
import { formatDistanceToNow } from "date-fns";
import type { CompetitorTableRow, Platform } from "@/features/seller/types/competitorMonitor";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
} from "recharts";

const ITEMS_PER_PAGE = 20;
const PLATFORMS: Platform[] = ["Facebook", "Amazon", "OLX", "Ouedkniss", "Website", "Instagram", "WhatsApp", "Telegram", "Viber", "TikTok", "LinkedIn", "Other"];

const platformIcons: Record<Platform, string> = {
  Facebook: "📘",
  Instagram: "📸",
  Amazon: "🛒",
  OLX: "🟡",
  Ouedkniss: "🟢",
  Website: "🌐",
  WhatsApp: "💬",
  Telegram: "✈️",
  Viber: "💜",
  TikTok: "🎵",
  LinkedIn: "💼",
  Other: "📦",
};

type SortKey = keyof Pick<CompetitorTableRow, "rank" | "name" | "currentPrice" | "priceChange7d" | "lastUpdated" | "avgRating">;

interface SortConfig {
  key: SortKey;
  direction: "asc" | "desc";
}

interface CompetitorTableProps {
  onViewCompetitor?: (competitor: CompetitorTableRow) => void;
}

export function CompetitorTable({ onViewCompetitor }: CompetitorTableProps) {
  const { competitors, selectedPlatforms, setSelectedPlatforms, metrics } = useCompetitorMonitorStore();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "rank", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filter by platform
  const filteredCompetitors = useMemo(() => {
    return competitors.filter(c => selectedPlatforms.includes(c.platform));
  }, [competitors, selectedPlatforms]);

  // Sort
  const sortedCompetitors = useMemo(() => {
    return [...filteredCompetitors].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortConfig.direction === "asc" 
          ? aVal.getTime() - bVal.getTime() 
          : bVal.getTime() - aVal.getTime();
      }
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      const numA = Number(aVal);
      const numB = Number(bVal);
      return sortConfig.direction === "asc" ? numA - numB : numB - numA;
    });
  }, [filteredCompetitors, sortConfig]);

  // Paginate
  const totalPages = Math.ceil(sortedCompetitors.length / ITEMS_PER_PAGE);
  const paginatedCompetitors = sortedCompetitors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />;
  };

  const getPriceColor = (isAboveYourPrice: boolean) => {
    return isAboveYourPrice 
      ? "text-emerald-600 dark:text-emerald-400" 
      : "text-destructive";
  };

  const getStockBadge = (status: CompetitorTableRow["stockStatus"]) => {
    switch (status) {
      case "in_stock":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200">In Stock</Badge>;
      case "limited":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200">Limited</Badge>;
      case "out_of_stock":
        return <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200">Out of Stock</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Competitor List</CardTitle>
        
        {/* Platform filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Platform ({selectedPlatforms.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="end">
            <div className="space-y-2">
              {PLATFORMS.map(platform => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform}
                    checked={selectedPlatforms.includes(platform)}
                    onCheckedChange={() => togglePlatform(platform)}
                  />
                  <label htmlFor={platform} className="text-sm cursor-pointer flex items-center gap-2">
                    <span>{platformIcons[platform]}</span>
                    {platform}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">
                  <Button variant="ghost" size="sm" onClick={() => handleSort("rank")}>
                    Rank <SortIcon columnKey="rank" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort("name")}>
                    Competitor <SortIcon columnKey="name" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Platform</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort("currentPrice")}>
                    Price <SortIcon columnKey="currentPrice" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort("priceChange7d")}>
                    7d Change <SortIcon columnKey="priceChange7d" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort("lastUpdated")}>
                    Updated <SortIcon columnKey="lastUpdated" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => handleSort("avgRating")}>
                    Reviews <SortIcon columnKey="avgRating" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCompetitors.map((competitor) => (
                <Collapsible key={competitor.id} asChild open={expandedRows.has(competitor.id)}>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleRow(competitor.id)}
                      >
                        <TableCell className="font-medium">{competitor.rank}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                              {competitor.logo}
                            </div>
                            <span className="font-medium">{competitor.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span title={competitor.platform}>
                            {platformIcons[competitor.platform]}
                          </span>
                        </TableCell>
                        <TableCell className={getPriceColor(competitor.isAboveYourPrice)}>
                          <span className="font-semibold">${competitor.currentPrice.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {competitor.priceChange7d > 0 ? (
                              <TrendingUp className="h-4 w-4 text-destructive" />
                            ) : competitor.priceChange7d < 0 ? (
                              <TrendingDown className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Minus className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={
                              competitor.priceChange7d > 0 ? "text-destructive" :
                              competitor.priceChange7d < 0 ? "text-emerald-600 dark:text-emerald-400" :
                              "text-muted-foreground"
                            }>
                              {competitor.priceChange7d > 0 ? "+" : ""}{competitor.priceChange7d.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDistanceToNow(competitor.lastUpdated, { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStockBadge(competitor.stockStatus)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{competitor.avgRating}</span>
                            <span className="text-muted-foreground text-sm">({competitor.reviewCount})</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent asChild>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={8} className="p-4">
                          <div className="flex gap-6">
                            {/* Mini price history chart */}
                            <div className="w-64 h-20">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={competitor.priceHistory.slice(-14)}>
                                  <YAxis hide domain={['auto', 'auto']} />
                                  <Line 
                                    type="monotone" 
                                    dataKey="price" 
                                    stroke="#2563eb" 
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                              <p className="text-xs text-center text-muted-foreground mt-1">14-day price trend</p>
                            </div>
                            
                            {/* Competitor details */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-muted-foreground">Location:</span>
                                <span>{competitor.location || "Unknown"}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-muted-foreground">Your price:</span>
                                <span className="font-medium">${metrics.yourPrice.toFixed(2)}</span>
                                <span className={competitor.isAboveYourPrice ? "text-emerald-600" : "text-destructive"}>
                                  ({competitor.isAboveYourPrice ? "They're higher" : "They're lower"})
                                </span>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewCompetitor?.(competitor);
                                }}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedCompetitors.length)} of {sortedCompetitors.length} competitors
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, index, arr) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && arr[index - 1] !== page - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </div>
                ))
              }
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
