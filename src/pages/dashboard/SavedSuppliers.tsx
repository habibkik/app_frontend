import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Search,
  Trash2,
  MessageSquare,
  Star,
  MapPin,
  Clock,
  Building2,
  BadgeCheck,
  Grid3X3,
  List,
  Filter,
  ExternalLink,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSavedSuppliers } from "@/contexts/SavedSuppliersContext";
import { ContactSupplierModal } from "@/components/suppliers/ContactSupplierModal";
import { SupplierDetailModal } from "@/components/suppliers/SupplierDetailModal";
import { Supplier, mockSuppliers } from "@/data/suppliers";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function SavedSuppliersPage() {
  const { toast } = useToast();
  const { savedSuppliers, removeSupplier, isSupplierSaved, saveSupplier } = useSavedSuppliers();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "dateAdded">("dateAdded");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [contactSupplier, setContactSupplier] = useState<Supplier | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Get saved suppliers from mock data (simulating persisted saves)
  const allSavedSuppliers = useMemo(() => {
    return mockSuppliers.filter((s) => isSupplierSaved(s.id));
  }, [isSupplierSaved]);

  // Filter and sort
  const filteredSuppliers = useMemo(() => {
    let result = [...allSavedSuppliers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.industry.toLowerCase().includes(query) ||
          s.location.city.toLowerCase().includes(query) ||
          s.location.country.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [allSavedSuppliers, searchQuery, sortBy]);

  const handleRemove = (supplier: Supplier) => {
    removeSupplier(supplier.id);
    toast({
      title: "Supplier Removed",
      description: `${supplier.name} has been removed from your saved suppliers.`,
    });
  };

  const handleContact = (supplier: Supplier) => {
    setContactSupplier(supplier);
    setIsContactModalOpen(true);
  };

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailModalOpen(true);
  };

  const handleSaveFromModal = (supplier: Supplier) => {
    if (isSupplierSaved(supplier.id)) {
      removeSupplier(supplier.id);
      toast({
        title: "Supplier Removed",
        description: `${supplier.name} has been removed from your saved suppliers.`,
      });
    } else {
      saveSupplier(supplier);
      toast({
        title: "Supplier Saved",
        description: `${supplier.name} has been added to your saved suppliers.`,
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bookmark className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Saved Suppliers</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your bookmarked suppliers for quick access
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bookmark className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{allSavedSuppliers.length}</p>
                  <p className="text-sm text-muted-foreground">Saved Suppliers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <BadgeCheck className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {allSavedSuppliers.filter((s) => s.verified).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {allSavedSuppliers.length > 0
                      ? (
                          allSavedSuppliers.reduce((sum, s) => sum + s.rating, 0) /
                          allSavedSuppliers.length
                        ).toFixed(1)
                      : "0"}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg. Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search saved suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[150px] h-11">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateAdded">Date Added</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden sm:flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-none h-11 w-11"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-none h-11 w-11"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredSuppliers.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredSuppliers.map((supplier, index) => (
                  <motion.div
                    key={supplier.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/30">
                      <CardContent className="p-5">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div
                            className="h-14 w-14 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0 cursor-pointer"
                            onClick={() => handleViewDetails(supplier)}
                          >
                            <span className="text-lg font-bold text-primary-foreground">
                              {supplier.logo}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className="font-semibold text-foreground truncate cursor-pointer hover:text-primary"
                                onClick={() => handleViewDetails(supplier)}
                              >
                                {supplier.name}
                              </h3>
                              {supplier.verified && (
                                <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {supplier.location.city}, {supplier.location.country}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border mb-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                              <span className="font-semibold text-sm">{supplier.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Rating</span>
                          </div>
                          <div className="text-center border-x border-border">
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-semibold text-sm">{supplier.responseTime}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Response</span>
                          </div>
                          <div className="text-center">
                            <span className="font-semibold text-sm">
                              ${supplier.minOrderValue.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground block">Min. Order</span>
                          </div>
                        </div>

                        {/* Industry Badge */}
                        <div className="mb-4">
                          <Badge variant="secondary">{supplier.industry}</Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            size="sm"
                            onClick={() => handleContact(supplier)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Supplier</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {supplier.name} from your saved
                                  suppliers? You can always save them again from the Supplier Search.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemove(supplier)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredSuppliers.map((supplier) => (
                      <motion.tr
                        key={supplier.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary-foreground">
                                {supplier.logo}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="font-medium cursor-pointer hover:text-primary"
                                  onClick={() => handleViewDetails(supplier)}
                                >
                                  {supplier.name}
                                </span>
                                {supplier.verified && (
                                  <BadgeCheck className="h-4 w-4 text-primary" />
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{supplier.industry}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {supplier.location.city}, {supplier.location.country}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span>{supplier.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>{supplier.responseTime}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleContact(supplier)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Supplier</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {supplier.name} from your saved
                                    suppliers?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemove(supplier)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </Card>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {searchQuery ? "No suppliers found" : "No saved suppliers yet"}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {searchQuery
                    ? "Try adjusting your search to find saved suppliers."
                    : "Save suppliers from the Supplier Search to access them quickly here."}
                </p>
                {!searchQuery && (
                  <Link to="/dashboard/suppliers">
                    <Button>
                      <Search className="h-4 w-4 mr-2" />
                      Browse Suppliers
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Contact Modal */}
        <ContactSupplierModal
          supplier={contactSupplier}
          open={isContactModalOpen}
          onOpenChange={setIsContactModalOpen}
        />

        {/* Detail Modal */}
        <SupplierDetailModal
          supplier={selectedSupplier}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          onContact={handleContact}
          onSave={handleSaveFromModal}
        />
      </div>
    </DashboardLayout>
  );
}
