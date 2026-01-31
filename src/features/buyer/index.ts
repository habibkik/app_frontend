// Buyer feature barrel export

// Components
export { SupplierCard } from "@/components/suppliers/SupplierCard";
export { SupplierDetailModal } from "@/components/suppliers/SupplierDetailModal";
export { SupplierFiltersPanel, type SupplierFilters, defaultFilters } from "@/components/suppliers/SupplierFilters";
export { ContactSupplierModal } from "@/components/suppliers/ContactSupplierModal";
export { SupplierNotesTagsModal } from "@/components/suppliers/SupplierNotesTagsModal";
export { BulkActionsToolbar } from "@/components/suppliers/BulkActionsToolbar";
export { BulkTagAssignModal } from "@/components/suppliers/BulkTagAssignModal";
export { CreateRFQDialog } from "@/components/rfqs/CreateRFQDialog";
export { TypingIndicator } from "@/components/conversations/TypingIndicator";

// Pages
export { default as SearchResultsPage } from "@/pages/dashboard/Suppliers";
export { default as RFQBuilderPage } from "@/pages/dashboard/RFQs";
export { default as ConversationsPage } from "@/pages/dashboard/Conversations";
export { default as SavedSuppliersPage } from "@/pages/dashboard/SavedSuppliers";

// Context (will be migrated to Zustand)
export { SavedSuppliersProvider, useSavedSuppliers } from "@/contexts/SavedSuppliersContext";
export { ConversationsProvider, useConversations } from "@/contexts/ConversationsContext";

// Data/API
export { mockSuppliers, type Supplier } from "@/data/suppliers";
export { mockRFQs, type RFQItem, type RFQStatus, statusConfig } from "@/data/rfqs";
export { type Conversation, type Message } from "@/data/conversations";
