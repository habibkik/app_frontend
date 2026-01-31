import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Conversation, Message, mockConversations } from "@/data/conversations";
import { Supplier } from "@/data/suppliers";

interface NewConversationData {
  supplier: Supplier;
  subject: string;
  message: string;
  inquiryType: string;
  senderName: string;
  senderEmail: string;
  senderCompany: string;
}

interface ConversationsContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  getConversation: (id: string) => Conversation | undefined;
  getConversationBySupplier: (supplierId: string) => Conversation | undefined;
  addMessage: (conversationId: string, content: string, attachments?: Message["attachments"]) => void;
  createConversation: (data: NewConversationData) => string;
  markAsRead: (conversationId: string) => void;
  getTotalUnreadCount: () => number;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const getConversation = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations]
  );

  const getConversationBySupplier = useCallback(
    (supplierId: string) => conversations.find((c) => c.supplierId === supplierId),
    [conversations]
  );

  const addMessage = useCallback(
    (conversationId: string, content: string, attachments?: Message["attachments"]) => {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: "user",
        senderName: "You",
        senderAvatar: "ME",
        content,
        timestamp: new Date(),
        isOwn: true,
        status: "sent",
        attachments,
      };

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: content,
              lastMessageTime: new Date(),
            };
          }
          return conv;
        })
      );
    },
    []
  );

  const createConversation = useCallback((data: NewConversationData): string => {
    const { supplier, subject, message, inquiryType, senderName, senderCompany } = data;

    // Check if conversation with this supplier already exists
    const existing = conversations.find((c) => c.supplierId === supplier.id);
    if (existing) {
      // Add message to existing conversation
      const formattedMessage = `**${subject}** (${inquiryType})\n\n${message}\n\n—${senderName}, ${senderCompany}`;
      addMessage(existing.id, formattedMessage);
      return existing.id;
    }

    // Create new conversation
    const newConversationId = `conv-${Date.now()}`;
    const formattedMessage = `**${subject}** (${inquiryType})\n\n${message}\n\n—${senderName}, ${senderCompany}`;

    const newConversation: Conversation = {
      id: newConversationId,
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierLogo: supplier.logo,
      supplierIndustry: supplier.industry,
      lastMessage: message.slice(0, 100) + (message.length > 100 ? "..." : ""),
      lastMessageTime: new Date(),
      unreadCount: 0,
      isOnline: Math.random() > 0.5, // Random online status for demo
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: "user",
          senderName: "You",
          senderAvatar: "ME",
          content: formattedMessage,
          timestamp: new Date(),
          isOwn: true,
          status: "sent",
        },
      ],
    };

    setConversations((prev) => [newConversation, ...prev]);
    return newConversationId;
  }, [conversations, addMessage]);

  const markAsRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unreadCount: 0,
            messages: conv.messages.map((msg) => ({
              ...msg,
              status: "read" as const,
            })),
          };
        }
        return conv;
      })
    );
  }, []);

  const getTotalUnreadCount = useCallback(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations]
  );

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        activeConversationId,
        setActiveConversationId,
        getConversation,
        getConversationBySupplier,
        addMessage,
        createConversation,
        markAsRead,
        getTotalUnreadCount,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error("useConversations must be used within a ConversationsProvider");
  }
  return context;
}
