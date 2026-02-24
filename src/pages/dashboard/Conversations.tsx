import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import {
  MessageSquare, Search, Send, Paperclip, MoreVertical,
  Phone, Video, Info, Check, CheckCheck, Clock, ArrowLeft,
  File, FileText, FileSpreadsheet, Archive, Image, Smile,
  Mail, Linkedin, MessageCircle, Facebook, Instagram, Twitter,
} from "lucide-react";
import { DashboardLayout } from "@/features/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Conversation, Message } from "@/data/conversations";
import { useConversations } from "@/contexts/ConversationsContext";
import { TypingIndicator } from "@/components/conversations/TypingIndicator";
import { useToast } from "@/hooks/use-toast";

const CHANNELS = [
  { value: "all", label: "All Channels", icon: MessageSquare },
  { value: "email", label: "Email", icon: Mail },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "sms", label: "SMS", icon: Phone },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "tiktok", label: "TikTok", icon: Send },
  { value: "twitter", label: "Twitter/X", icon: Twitter },
];

const CHANNEL_LABELS: Record<string, string> = Object.fromEntries(CHANNELS.map(c => [c.value, c.label]));

function formatMessageTime(date: Date): string {
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday " + format(date, "h:mm a");
  return format(date, "MMM d, h:mm a");
}

function formatConversationTime(date: Date): string {
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

function getFileIcon(type: string) {
  switch (type) {
    case "spreadsheet": return FileSpreadsheet;
    case "document": return FileText;
    case "image": return Image;
    case "archive": return Archive;
    default: return File;
  }
}

function MessageStatus({ status }: { status: Message["status"] }) {
  switch (status) {
    case "sent": return <Check className="h-3.5 w-3.5 text-muted-foreground" />;
    case "delivered": return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />;
    case "read": return <CheckCheck className="h-3.5 w-3.5 text-primary" />;
    default: return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function ChannelBadge({ channel }: { channel?: string }) {
  if (!channel) return null;
  return (
    <span className="text-[10px] text-muted-foreground/70 ml-1">
      via {CHANNEL_LABELS[channel] || channel}
    </span>
  );
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function ConversationList({ conversations, selectedId, onSelect, searchQuery, onSearchChange }: ConversationListProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">{t("pages.conversations.messagesHeader")}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder={t("pages.conversations.searchConversations")} value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.length > 0 ? conversations.map((conv) => (
            <button key={conv.id} onClick={() => onSelect(conv.id)} className={cn("w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors", selectedId === conv.id ? "bg-primary/10" : "hover:bg-muted/50")}>
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">{conv.supplierLogo}</span>
                </div>
                {conv.isOnline && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-sm truncate">{conv.supplierName}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{formatConversationTime(conv.lastMessageTime)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  {conv.unreadCount > 0 && <Badge className="h-5 min-w-[20px] flex items-center justify-center text-xs">{conv.unreadCount}</Badge>}
                </div>
              </div>
            </button>
          )) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("pages.conversations.noConversationsFound")}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface MessageThreadProps {
  conversation: Conversation;
  onSendMessage: (content: string, channel: string) => void;
  onBack: () => void;
  isMobile: boolean;
  isTyping: boolean;
  activeChannel: string;
  onChannelChange: (channel: string) => void;
}

function MessageThread({ conversation, onSendMessage, onBack, isMobile, isTyping, activeChannel, onChannelChange }: MessageThreadProps) {
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages, isTyping]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim(), activeChannel === "all" ? "email" : activeChannel);
      setNewMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filteredMessages = useMemo(() => {
    if (activeChannel === "all") return conversation.messages;
    return conversation.messages.filter((m) => (m.channel || "email") === activeChannel);
  }, [conversation.messages, activeChannel]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with channel dropdown */}
      <div className="flex items-center gap-3 p-4 border-b">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">{conversation.supplierLogo}</span>
          </div>
          {conversation.isOnline && <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-background" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{conversation.supplierName}</h3>
          <p className="text-xs text-muted-foreground">
            {conversation.isOnline ? <span className="text-success">{t("pages.conversations.online")}</span> : t("pages.conversations.offline")}
            {" · "}{conversation.supplierIndustry}
          </p>
        </div>
        {/* Channel dropdown */}
        <Select value={activeChannel} onValueChange={onChannelChange}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {CHANNELS.map((ch) => (
              <SelectItem key={ch.value} value={ch.value} className="text-xs">
                {ch.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>{t("pages.conversations.call")}</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon"><Video className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>{t("pages.conversations.videoCall")}</TooltipContent></Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover z-50">
              <DropdownMenuItem><Info className="h-4 w-4 mr-2" />{t("pages.conversations.viewSupplierProfile")}</DropdownMenuItem>
              <DropdownMenuItem><Archive className="h-4 w-4 mr-2" />{t("pages.conversations.archiveConversation")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {filteredMessages.map((message, index) => {
            const showDate = index === 0 || format(message.timestamp, "yyyy-MM-dd") !== format(filteredMessages[index - 1].timestamp, "yyyy-MM-dd");
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex items-center justify-center my-4">
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {isToday(message.timestamp) ? "Today" : isYesterday(message.timestamp) ? "Yesterday" : format(message.timestamp, "MMMM d, yyyy")}
                    </span>
                  </div>
                )}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-2", message.isOwn ? "justify-end" : "justify-start")}>
                  {!message.isOwn && (
                    <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-primary-foreground">{message.senderAvatar}</span>
                    </div>
                  )}
                  <div className={cn("max-w-[70%] space-y-1", message.isOwn ? "items-end" : "items-start")}>
                    <div className={cn("rounded-2xl px-4 py-2", message.isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md")}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {message.attachments.map((attachment, i) => {
                          const FileIcon = getFileIcon(attachment.type);
                          return (
                            <div key={i} className={cn("flex items-center gap-2 p-2 rounded-lg border", message.isOwn ? "bg-primary/10 border-primary/20" : "bg-muted")}>
                              <FileIcon className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{attachment.name}</p>
                                <p className="text-xs text-muted-foreground">{attachment.size}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className={cn("flex items-center gap-1 text-xs text-muted-foreground", message.isOwn ? "justify-end" : "justify-start")}>
                      <span>{formatMessageTime(message.timestamp)}</span>
                      <ChannelBadge channel={message.channel} />
                      {message.isOwn && <MessageStatus status={message.status} />}
                    </div>
                  </div>
                  {message.isOwn && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-muted-foreground">{message.senderAvatar}</span>
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}
          <AnimatePresence>
            {isTyping && <TypingIndicator supplierName={conversation.supplierName} supplierLogo={conversation.supplierLogo} />}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input with channel indicator */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            Sending via {CHANNEL_LABELS[activeChannel === "all" ? "email" : activeChannel] || "Email"}
          </Badge>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex gap-1">
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-10 w-10"><Paperclip className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent>{t("pages.conversations.attachFile")}</TooltipContent></Tooltip>
          </div>
          <div className="flex-1 relative">
            <Textarea placeholder={t("pages.conversations.typeMessage")} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown} className="min-h-[44px] max-h-[120px] resize-none pr-10" rows={1} />
            <Button variant="ghost" size="icon" className="absolute right-1 bottom-1 h-8 w-8"><Smile className="h-4 w-4" /></Button>
          </div>
          <Button onClick={handleSend} disabled={!newMessage.trim()} size="icon" className="h-10 w-10">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ConversationsPage() {
  const { toast } = useToast();
  const { conversations, activeConversationId, setActiveConversationId, addMessage, markAsRead, typingConversations } = useConversations();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [channelPerConversation, setChannelPerConversation] = useState<Record<string, string>>({});

  const isCurrentConversationTyping = activeConversationId ? typingConversations.has(activeConversationId) : false;
  const activeChannel = activeConversationId ? (channelPerConversation[activeConversationId] || "all") : "all";

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations, setActiveConversationId]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => conv.supplierName.toLowerCase().includes(query) || conv.lastMessage.toLowerCase().includes(query));
  }, [conversations, searchQuery]);

  const selectedConversation = useMemo(() => conversations.find((c) => c.id === activeConversationId) || null, [conversations, activeConversationId]);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setShowThread(true);
    markAsRead(id);
  };

  const handleSendMessage = (content: string, channel: string) => {
    if (!activeConversationId) return;
    addMessage(activeConversationId, content, undefined, channel);
    toast({ title: "Message sent", description: `Sent via ${CHANNEL_LABELS[channel] || channel}.` });
  };

  const handleChannelChange = (channel: string) => {
    if (activeConversationId) {
      setChannelPerConversation((prev) => ({ ...prev, [activeConversationId]: channel }));
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)]">
        <Card className="h-full overflow-hidden">
          <div className="flex h-full">
            <div className={cn("w-full md:w-80 lg:w-96 flex-shrink-0", isMobileView && showThread ? "hidden" : "block")}>
              <ConversationList conversations={filteredConversations} selectedId={activeConversationId} onSelect={handleSelectConversation} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            </div>
            <div className={cn("flex-1 bg-background", isMobileView && !showThread ? "hidden" : "block")}>
              {selectedConversation ? (
                <MessageThread
                  conversation={selectedConversation}
                  onSendMessage={handleSendMessage}
                  onBack={() => setShowThread(false)}
                  isMobile={isMobileView}
                  isTyping={isCurrentConversationTyping}
                  activeChannel={activeChannel}
                  onChannelChange={handleChannelChange}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-center p-8">
                  <div>
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground max-w-sm">Choose a conversation from the list to start messaging with your suppliers.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
