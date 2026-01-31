/**
 * Conversations Store
 * Manages messaging conversations with suppliers using Zustand
 */

import { create } from "zustand";
import { Conversation, Message, mockConversations } from "@/data/conversations";
import { Supplier } from "@/data/suppliers";
import { playNotificationSound, initializeAudioContext } from "@/lib/notification-sound";

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

export interface NewConversationData {
  supplier: Supplier;
  subject: string;
  message: string;
  inquiryType: string;
  senderName: string;
  senderEmail: string;
  senderCompany: string;
}

interface ConversationsState {
  conversations: Conversation[];
  activeConversationId: string | null;
  typingConversations: Set<string>;
  _typingTimeouts: Map<string, NodeJS.Timeout>;
  _audioInitialized: boolean;
}

interface ConversationsActions {
  setActiveConversationId: (id: string | null) => void;
  getConversation: (id: string) => Conversation | undefined;
  getConversationBySupplier: (supplierId: string) => Conversation | undefined;
  addMessage: (conversationId: string, content: string, attachments?: Message["attachments"]) => void;
  createConversation: (data: NewConversationData) => string;
  markAsRead: (conversationId: string) => void;
  getTotalUnreadCount: () => number;
  simulateSupplierResponse: (conversationId: string) => void;
  initializeAudio: () => void;
}

type ConversationsStore = ConversationsState & ConversationsActions;

export const useConversationsStore = create<ConversationsStore>((set, get) => ({
  // State
  conversations: mockConversations,
  activeConversationId: null,
  typingConversations: new Set<string>(),
  _typingTimeouts: new Map<string, NodeJS.Timeout>(),
  _audioInitialized: false,

  // Actions
  setActiveConversationId: (id) => set({ activeConversationId: id }),

  getConversation: (id) => {
    return get().conversations.find((c) => c.id === id);
  },

  getConversationBySupplier: (supplierId) => {
    return get().conversations.find((c) => c.supplierId === supplierId);
  },

  initializeAudio: () => {
    if (!get()._audioInitialized) {
      initializeAudioContext();
      set({ _audioInitialized: true });
    }
  },

  addMessage: (conversationId, content, attachments) => {
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

    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: content.slice(0, 100) + (content.length > 100 ? "..." : ""),
            lastMessageTime: new Date(),
          };
        }
        return conv;
      }),
    }));

    // Play sent sound
    playNotificationSound("sent");

    // Update message status to delivered after a short delay
    setTimeout(() => {
      set((state) => ({
        conversations: state.conversations.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === newMessage.id ? { ...msg, status: "delivered" as const } : msg
              ),
            };
          }
          return conv;
        }),
      }));
    }, 800);

    // Simulate supplier response (70% chance)
    if (Math.random() > 0.3) {
      get().simulateSupplierResponse(conversationId);
    }
  },

  createConversation: (data) => {
    const { supplier, subject, message, inquiryType, senderName, senderCompany } = data;
    const state = get();

    // Check if conversation with this supplier already exists
    const existing = state.conversations.find((c) => c.supplierId === supplier.id);
    if (existing) {
      const formattedMessage = `**${subject}** (${inquiryType})\n\n${message}\n\n—${senderName}, ${senderCompany}`;
      get().addMessage(existing.id, formattedMessage);
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

    set((state) => ({
      conversations: [newConversation, ...state.conversations],
    }));

    // Simulate supplier response for new conversation
    setTimeout(() => {
      get().simulateSupplierResponse(newConversationId);
    }, 500);

    return newConversationId;
  },

  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((conv) => {
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
      }),
    }));
  },

  getTotalUnreadCount: () => {
    return get().conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  },

  simulateSupplierResponse: (conversationId) => {
    const state = get();
    const timeouts = state._typingTimeouts;

    // Clear any existing timeout for this conversation
    const existingTimeout = timeouts.get(conversationId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Random delay before typing starts (1-3 seconds)
    const typingDelay = 1000 + Math.random() * 2000;

    const startTypingTimeout = setTimeout(() => {
      set((state) => ({
        typingConversations: new Set(state.typingConversations).add(conversationId),
      }));

      // Typing duration (2-4 seconds)
      const typingDuration = 2000 + Math.random() * 2000;

      const sendMessageTimeout = setTimeout(() => {
        // Stop typing
        set((state) => {
          const next = new Set(state.typingConversations);
          next.delete(conversationId);
          return { typingConversations: next };
        });

        // Get conversation and add supplier message
        const conversation = get().conversations.find((c) => c.id === conversationId);
        if (!conversation) return;

        const randomResponse = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];

        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          senderId: conversation.supplierId,
          senderName: conversation.supplierName,
          senderAvatar: conversation.supplierLogo,
          content: randomResponse,
          timestamp: new Date(),
          isOwn: false,
          status: "delivered",
        };

        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              const isActive = conversationId === state.activeConversationId;
              return {
                ...conv,
                messages: [...conv.messages, newMessage],
                lastMessage: randomResponse.slice(0, 100) + (randomResponse.length > 100 ? "..." : ""),
                lastMessageTime: new Date(),
                unreadCount: isActive ? 0 : conv.unreadCount + 1,
              };
            }
            return conv;
          }),
        }));

        // Play notification sound
        playNotificationSound("message");

        timeouts.delete(conversationId);
      }, typingDuration);

      timeouts.set(conversationId, sendMessageTimeout);
    }, typingDelay);

    timeouts.set(conversationId + "-start", startTypingTimeout);
  },
}));

// Hook alias for backward compatibility
export const useConversations = useConversationsStore;
