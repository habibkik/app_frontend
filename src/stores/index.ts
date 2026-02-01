// Global stores barrel export
export { useModeStore, type DashboardMode } from "./modeStore";
export { useUiStore } from "./uiStore";
export { useAuthStore } from "./authStore";
export { 
  useConversationsStore, 
  useConversations,
  type NewConversationData 
} from "./conversationsStore";
export { 
  useSavedSuppliersStore, 
  useSavedSuppliers,
  type SupplierMetadata 
} from "./savedSuppliersStore";
export {
  useAnalysisStore,
  type SupplierMatch,
  type SupplierDiscoveryResult,
  type BOMAnalysisResult,
  type CompetitorInfo,
  type MarketAnalysisResult,
  type AnalysisHistoryItem,
} from "./analysisStore";
export {
  useDiscoveredSuppliersStore,
  useDiscoveredSuppliers,
  type SupplierSourceInfo,
} from "./discoveredSuppliersStore";
