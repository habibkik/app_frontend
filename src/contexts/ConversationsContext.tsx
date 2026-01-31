import { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from "react";
import { Conversation, Message, mockConversations } from "@/data/conversations";
import { Supplier } from "@/data/suppliers";
import { playNotificationSound, initializeAudioContext } from "@/lib/notification-sound";

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
  typingConversations: Set<string>;
  simulateSupplierResponse: (conversationId: string) => void;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

// Simulated response templates
const responseTemplates = [
  "Thank you for your message! I'll review this and get back to you shortly.",
  "Got it! Let me check our inventory and I'll send you the details within the hour.",
  "Thanks for reaching out. Our team is reviewing your requirements and we'll have a quote ready for you soon.",
  "Understood! I'll prepare the technical specifications and send them over.",
  "Perfect, I've noted your requirements. We can definitely help with this project.",
  "Thanks for the clarification. I'll discuss this with our production team and update you.",
  "Great question! Let me gather the relevant information and get back to you.",
  "I appreciate your patience. We're working on this and will have an answer shortly.",
];

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [typingConversations, setTypingConversations] = useState<Set<string>>(new Set());
  const typingTimeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Initialize audio context on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      initializeAudioContext();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const getConversation = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations]
  );

  const getConversationBySupplier = useCallback(
    (supplierId: string) => conversations.find((c) => c.supplierId === supplierId),
    [conversations]
  );

  const addSupplierMessage = useCallback(
    (conversationId: string, content: string) => {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (!conversation) return;

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: conversation.supplierId,
        senderName: conversation.supplierName,
        senderAvatar: conversation.supplierLogo,
        content,
        timestamp: new Date(),
        isOwn: false,
        status: "delivered",
      };

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === conversationId) {
            const isActive = conversationId === activeConversationId;
            return {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: content.slice(0, 100) + (content.length > 100 ? "..." : ""),
              lastMessageTime: new Date(),
              unreadCount: isActive ? 0 : conv.unreadCount + 1,
            };
          }
          return conv;
        })
      );

      // Play notification sound for incoming message
      playNotificationSound('message');
    },
    [conversations, activeConversationId]
  );

  const simulateSupplierResponse = useCallback(
    (conversationId: string) => {
      // Clear any existing timeout for this conversation
      const existingTimeout = typingTimeoutRefs.current.get(conversationId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Random delay before typing starts (1-3 seconds)
      const typingDelay = 1000 + Math.random() * 2000;
      
      // Start typing after delay
      const startTypingTimeout = setTimeout(() => {
        setTypingConversations((prev) => new Set(prev).add(conversationId));
        
        // Typing duration (2-4 seconds)
        const typingDuration = 2000 + Math.random() * 2000;
        
        const sendMessageTimeout = setTimeout(() => {
          // Stop typing
          setTypingConversations((prev) => {
            const next = new Set(prev);
            next.delete(conversationId);
            return next;
          });
          
          // Send response
          const randomResponse = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
          addSupplierMessage(conversationId, randomResponse);
          
          typingTimeoutRefs.current.delete(conversationId);
        }, typingDuration);
        
        typingTimeoutRefs.current.set(conversationId, sendMessageTimeout);
      }, typingDelay);
      
      typingTimeoutRefs.current.set(conversationId + "-start", startTypingTimeout);
    },
    [addSupplierMessage]
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
              lastMessage: content.slice(0, 100) + (content.length > 100 ? "..." : ""),
              lastMessageTime: new Date(),
            };
          }
          return conv;
        })
      );

      // Play sent sound
      playNotificationSound('sent');

      // Update message status to delivered after a short delay
      setTimeout(() => {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === newMessage.id ? { ...msg, status: "delivered" as const } : msg
                ),
              };
            }
            return conv;
          })
        );
      }, 800);

      // Simulate supplier response (70% chance)
      if (Math.random() > 0.3) {
        simulateSupplierResponse(conversationId);
      }
    },
    [simulateSupplierResponse]
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
      isOnline: Math.random() > 0.5,
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
    
    // Simulate supplier response for new conversation
    setTimeout(() => {
      simulateSupplierResponse(newConversationId);
    }, 500);
    
    return newConversationId;
  }, [conversations, addMessage, simulateSupplierResponse]);

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
        typingConversations,
        simulateSupplierResponse,
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
