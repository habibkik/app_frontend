/**
 * @deprecated Use `useConversations` from `@/stores` instead.
 * This file is kept for backward compatibility.
 */

export { 
  useConversations, 
  useConversationsStore,
  type NewConversationData 
} from "@/stores/conversationsStore";

// Re-export types from data for convenience
export type { Conversation, Message } from "@/data/conversations";

/**
 * @deprecated Provider no longer needed with Zustand. 
 * Kept for backward compatibility - renders children directly.
 */
export function ConversationsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
