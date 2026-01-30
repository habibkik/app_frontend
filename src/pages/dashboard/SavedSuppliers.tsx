import { useState, useMemo, useCallback } from "react";
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
  Tag,
  StickyNote,
  Edit3,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSavedSuppliers } from "@/contexts/SavedSuppliersContext";
import { ContactSupplierModal } from "@/components/suppliers/ContactSupplierModal";
import { SupplierDetailModal } from "@/components/suppliers/SupplierDetailModal";
import { SupplierNotesTagsModal } from "@/components/suppliers/SupplierNotesTagsModal";
import { BulkActionsToolbar } from "@/components/suppliers/BulkActionsToolbar";
import { BulkTagAssignModal } from "@/components/suppliers/BulkTagAssignModal";
import { Supplier, mockSuppliers } from "@/data/suppliers";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function SavedSuppliersPage() {
  const { toast } = useToast();
  const {
    savedSuppliers,
    removeSupplier,
    isSupplierSaved,
    saveSupplier,
    getSupplierMetadata,
    getAllTags,
  } = useSavedSuppliers();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "dateAdded">("dateAdded");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [contactSupplier, setContactSupplier] = useState<Supplier | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [notesTagsSupplier, setNotesTagsSupplier] = useState<Supplier | null>(null);
  const [isNotesTagsModalOpen, setIsNotesTagsModalOpen] = useState(false);
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);

  // Get all available tags
  const allTags = getAllTags();

  // Get saved suppliers from mock data (simulating persisted saves)
  const allSavedSuppliers = useMemo(() => {
    return mockSuppliers.filter((s) => isSupplierSaved(s.id));
  }, [isSupplierSaved]);

  // Filter and sort
  const filteredSuppliers = useMemo(() => {
    let result = [...allSavedSuppliers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.industry.toLowerCase().includes(query) ||
          s.location.city.toLowerCase().includes(query) ||
          s.location.country.toLowerCase().includes(query) ||
          getSupplierMetadata(s.id)?.notes?.toLowerCase().includes(query)
      );
    }

    // Tag filter
    if (selectedTag) {
      result = result.filter((s) => {
        const metadata = getSupplierMetadata(s.id);
        return metadata?.tags.includes(selectedTag);
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "rating":
          return b.rating - a.rating;
        case "dateAdded": {
          const dateA = getSupplierMetadata(a.id)?.savedAt || new Date(0);
          const dateB = getSupplierMetadata(b.id)?.savedAt || new Date(0);
          return dateB.getTime() - dateA.getTime();
        }
        default:
          return 0;
      }
    });

    return result;
  }, [allSavedSuppliers, searchQuery, sortBy, selectedTag, getSupplierMetadata]);

  const handleRemove = (supplier: Supplier) => {
    removeSupplier(supplier.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(supplier.id);
      return next;
    });
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

  const handleOpenNotesTags = (supplier: Supplier) => {
    setNotesTagsSupplier(supplier);
    setIsNotesTagsModalOpen(true);
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

  // Bulk selection handlers
  const toggleSelection = useCallback((supplierId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(supplierId)) {
        next.delete(supplierId);
      } else {
        next.add(supplierId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredSuppliers.map((s) => s.id)));
  }, [filteredSuppliers]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleBulkRemove = useCallback(() => {
    const count = selectedIds.size;
    selectedIds.forEach((id) => removeSupplier(id));
    setSelectedIds(new Set());
    toast({
      title: "Suppliers Removed",
      description: `${count} supplier(s) have been removed from your saved list.`,
    });
  }, [selectedIds, removeSupplier, toast]);

  const handleBulkTagComplete = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

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
            Manage your bookmarked suppliers with notes and tags
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bookmark className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{allSavedSuppliers.length}</p>
                  <p className="text-sm text-muted-foreground">Saved</p>
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
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{allTags.length}</p>
                  <p className="text-sm text-muted-foreground">Tags</p>
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

        {/* Tag Filter Pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter by tag:</span>
            <Badge
              variant={selectedTag === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedTag(null)}
            >
              All
            </Badge>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
                {selectedTag === tag && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search saved suppliers or notes..."
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

        {/* Bulk Actions Toolbar */}
        <AnimatePresence>
          <BulkActionsToolbar
            selectedCount={selectedIds.size}
            totalCount={filteredSuppliers.length}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onBulkTag={() => setIsBulkTagModalOpen(true)}
            onBulkRemove={handleBulkRemove}
          />
        </AnimatePresence>

        {/* Content */}
        {filteredSuppliers.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredSuppliers.map((supplier, index) => {
                  const metadata = getSupplierMetadata(supplier.id);
                  const isSelected = selectedIds.has(supplier.id);
                  return (
                    <motion.div
                      key={supplier.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <Card className={`group hover:shadow-lg transition-all duration-200 hover:border-primary/30 ${isSelected ? "ring-2 ring-primary border-primary" : ""}`}>
                        <CardContent className="p-5">
                          {/* Selection Checkbox + Header */}
                          <div className="flex items-start gap-3 mb-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelection(supplier.id)}
                              className="mt-1"
                            />
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
                                  {supplier.location.city}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-warning text-warning" />
                                  {supplier.rating}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          {metadata?.tags && metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {metadata.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {metadata.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{metadata.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Notes Preview */}
                          {metadata?.notes && (
                            <div className="mb-3 p-2 rounded-md bg-muted/50">
                              <div className="flex items-start gap-2">
                                <StickyNote className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {metadata.notes}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Industry Badge */}
                          <div className="mb-4">
                            <Badge variant="outline">{supplier.industry}</Badge>
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
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenNotesTags(supplier)}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit notes & tags</TooltipContent>
                            </Tooltip>
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
                                    suppliers? Your notes and tags will be preserved if you save
                                    them again.
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
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === filteredSuppliers.length && filteredSuppliers.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            selectAll();
                          } else {
                            clearSelection();
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredSuppliers.map((supplier) => {
                      const metadata = getSupplierMetadata(supplier.id);
                      const isSelected = selectedIds.has(supplier.id);
                      return (
                        <motion.tr
                          key={supplier.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`group ${isSelected ? "bg-primary/5" : ""}`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelection(supplier.id)}
                            />
                          </TableCell>
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
                                <span className="text-xs text-muted-foreground">
                                  {supplier.industry}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {metadata?.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {metadata?.tags && metadata.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{metadata.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {metadata?.notes ? (
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                                    {metadata.notes}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[300px]">
                                  {metadata.notes}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">
                                No notes
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-warning text-warning" />
                              <span>{supplier.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleContact(supplier)}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenNotesTags(supplier)}
                              >
                                <Edit3 className="h-4 w-4" />
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
                                      Are you sure you want to remove {supplier.name}?
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
                      );
                    })}
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
                  {searchQuery || selectedTag ? "No suppliers found" : "No saved suppliers yet"}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {searchQuery || selectedTag
                    ? "Try adjusting your search or filters to find saved suppliers."
                    : "Save suppliers from the Supplier Search to access them quickly here."}
                </p>
                {!searchQuery && !selectedTag && (
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

        {/* Notes & Tags Modal */}
        <SupplierNotesTagsModal
          supplier={notesTagsSupplier}
          open={isNotesTagsModalOpen}
          onOpenChange={setIsNotesTagsModalOpen}
        />

        {/* Bulk Tag Assignment Modal */}
        <BulkTagAssignModal
          selectedIds={Array.from(selectedIds)}
          open={isBulkTagModalOpen}
          onOpenChange={setIsBulkTagModalOpen}
          onComplete={handleBulkTagComplete}
        />
      </div>
    </DashboardLayout>
  );
}
