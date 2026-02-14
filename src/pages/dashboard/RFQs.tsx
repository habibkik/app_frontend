import { useState, useMemo } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  MessageSquare,
  Paperclip,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/features/dashboard";
import { CreateRFQDialog } from "@/components/rfqs/CreateRFQDialog";
import { mockRFQs, RFQItem, RFQStatus, statusConfig } from "@/data/rfqs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type SortField = "createdAt" | "title" | "quantity" | "quotesReceived" | "expiresAt";
type SortDirection = "asc" | "desc";

export default function RFQsPage() {
  const { toast } = useToast();
  const [rfqs, setRfqs] = useState<RFQItem[]>(mockRFQs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RFQStatus | "all">("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter and sort RFQs
  const filteredRFQs = useMemo(() => {
    let result = [...rfqs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (rfq) =>
          rfq.id.toLowerCase().includes(query) ||
          rfq.title.toLowerCase().includes(query) ||
          rfq.category.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((rfq) => rfq.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "createdAt":
        case "expiresAt":
          comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "quantity":
        case "quotesReceived":
          comparison = a[sortField] - b[sortField];
          break;
      }
      return sortDirection === "desc" ? -comparison : comparison;
    });

    return result;
  }, [rfqs, searchQuery, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredRFQs.length / itemsPerPage);
  const paginatedRFQs = filteredRFQs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleCreateRFQ = (newRFQ: Omit<RFQItem, "id" | "createdAt" | "expiresAt" | "quotesReceived" | "attachments" | "status">) => {
    const rfq: RFQItem = {
      ...newRFQ,
      id: `RFQ-2024-${String(rfqs.length + 1).padStart(3, "0")}`,
      status: "draft",
      createdAt: format(new Date(), "yyyy-MM-dd"),
      expiresAt: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      quotesReceived: 0,
      attachments: 0,
    };

    setRfqs([rfq, ...rfqs]);
    toast({
      title: "RFQ Created",
      description: `${rfq.id} has been created as a draft.`,
    });
  };

  const handleDeleteRFQ = (rfq: RFQItem) => {
    setRfqs(rfqs.filter((r) => r.id !== rfq.id));
    toast({
      title: "RFQ Deleted",
      description: `${rfq.id} has been deleted.`,
      variant: "destructive",
    });
  };

  const handleDuplicateRFQ = (rfq: RFQItem) => {
    const duplicate: RFQItem = {
      ...rfq,
      id: `RFQ-2024-${String(rfqs.length + 1).padStart(3, "0")}`,
      title: `${rfq.title} (Copy)`,
      status: "draft",
      createdAt: format(new Date(), "yyyy-MM-dd"),
      expiresAt: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      quotesReceived: 0,
    };

    setRfqs([duplicate, ...rfqs]);
    toast({
      title: "RFQ Duplicated",
      description: `${duplicate.id} has been created as a copy.`,
    });
  };

  // Stats
  const stats = {
    total: rfqs.length,
    active: rfqs.filter((r) => ["pending", "quoted"].includes(r.status)).length,
    draft: rfqs.filter((r) => r.status === "draft").length,
    awarded: rfqs.filter((r) => r.status === "awarded").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My RFQs</h1>
            <p className="text-muted-foreground mt-1">
              Manage your requests for quotation
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = "/dashboard/rfq-campaign"}>
              New Campaign
            </Button>
            <CreateRFQDialog onCreateRFQ={handleCreateRFQ} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total RFQs", value: stats.total, color: "text-foreground" },
            { label: "Active", value: stats.active, color: "text-info" },
            { label: "Drafts", value: stats.draft, color: "text-muted-foreground" },
            { label: "Awarded", value: stats.awarded, color: "text-success" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-lg border p-4"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by ID, title, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as RFQStatus | "all")}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-4 sm:flex">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="quoted">Quoted</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* RFQ Table */}
        <div className="bg-card rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[120px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 gap-1"
                    onClick={() => handleSort("createdAt")}
                  >
                    RFQ ID
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 gap-1"
                    onClick={() => handleSort("title")}
                  >
                    Title
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 gap-1"
                    onClick={() => handleSort("quantity")}
                  >
                    Quantity
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 gap-1"
                    onClick={() => handleSort("quotesReceived")}
                  >
                    Quotes
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 gap-1"
                    onClick={() => handleSort("expiresAt")}
                  >
                    Expires
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRFQs.length > 0 ? (
                paginatedRFQs.map((rfq, index) => {
                  const config = statusConfig[rfq.status];
                  return (
                    <motion.tr
                      key={rfq.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-muted/50"
                    >
                      <TableCell className="font-medium text-primary">
                        {rfq.id}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">{rfq.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            {rfq.attachments > 0 && (
                              <span className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                {rfq.attachments}
                              </span>
                            )}
                            <span className="md:hidden">{rfq.category}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{rfq.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {rfq.quantity.toLocaleString()} {rfq.unit}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border", config.className)}>
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span>{rfq.quotesReceived}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {format(new Date(rfq.expiresAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateRFQ(rfq)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteRFQ(rfq)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No RFQs found</p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredRFQs.length)} of{" "}
                {filteredRFQs.length} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
