export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  status: "sent" | "delivered" | "read";
  channel?: string; // email, linkedin, whatsapp, sms, phone, facebook, instagram, tiktok, twitter
  attachments?: {
    name: string;
    type: string;
    size: string;
  }[];
}

export interface Conversation {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierLogo: string;
  supplierIndustry: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

export const mockConversations: Conversation[] = [
  {
    id: "conv-001",
    supplierId: "sup-001",
    supplierName: "TechParts Manufacturing Co.",
    supplierLogo: "TP",
    supplierIndustry: "Electronics",
    lastMessage: "We can definitely meet that timeline. Let me send over the revised quote.",
    lastMessageTime: new Date("2026-01-30T10:30:00"),
    unreadCount: 2,
    isOnline: true,
    messages: [
      {
        id: "msg-001",
        senderId: "user",
        senderName: "You",
        senderAvatar: "ME",
        content: "Hi, I'm interested in your PCB assembly services for our IoT sensor project.",
        timestamp: new Date("2026-01-28T09:00:00"),
        isOwn: true,
        status: "read",
      },
      {
        id: "msg-002",
        senderId: "sup-001",
        senderName: "TechParts Manufacturing",
        senderAvatar: "TP",
        content: "Hello! Thank you for reaching out. We'd be happy to help with your IoT sensor project. Could you share more details about the quantity and specifications?",
        timestamp: new Date("2026-01-28T09:15:00"),
        isOwn: false,
        status: "read",
      },
      {
        id: "msg-003",
        senderId: "user",
        senderName: "You",
        senderAvatar: "ME",
        content: "We're looking at an initial order of 5,000 units. The PCB is a 4-layer design with SMT components. I've attached the BOM and Gerber files.",
        timestamp: new Date("2026-01-28T10:30:00"),
        isOwn: true,
        status: "read",
        attachments: [
          { name: "BOM_v2.xlsx", type: "spreadsheet", size: "245 KB" },
          { name: "Gerber_Files.zip", type: "archive", size: "1.2 MB" },
        ],
      },
      {
        id: "msg-004",
        senderId: "sup-001",
        senderName: "TechParts Manufacturing",
        senderAvatar: "TP",
        content: "Thank you for the files. I've reviewed the BOM and Gerber files. For 5,000 units with your specifications, we can offer $12.50 per unit with a lead time of 3-4 weeks.",
        timestamp: new Date("2026-01-29T14:00:00"),
        isOwn: false,
        status: "read",
      },
      {
        id: "msg-005",
        senderId: "user",
        senderName: "You",
        senderAvatar: "ME",
        content: "That sounds reasonable. Can we expedite the timeline to 2 weeks? We have a product launch coming up.",
        timestamp: new Date("2026-01-30T09:00:00"),
        isOwn: true,
        status: "read",
      },
      {
        id: "msg-006",
        senderId: "sup-001",
        senderName: "TechParts Manufacturing",
        senderAvatar: "TP",
        content: "We can definitely meet that timeline. Let me send over the revised quote.",
        timestamp: new Date("2026-01-30T10:30:00"),
        isOwn: false,
        status: "delivered",
      },
    ],
  },
  {
    id: "conv-002",
    supplierId: "sup-003",
    supplierName: "Precision Metal Works",
    supplierLogo: "PM",
    supplierIndustry: "Machinery",
    lastMessage: "The samples have been shipped. Tracking number: PMW2024-7834",
    lastMessageTime: new Date("2026-01-29T16:45:00"),
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: "msg-007",
        senderId: "user",
        senderName: "You",
        senderAvatar: "ME",
        content: "Hello, we need precision CNC machined aluminum housings for a medical device project.",
        timestamp: new Date("2026-01-25T11:00:00"),
        isOwn: true,
        status: "read",
      },
      {
        id: "msg-008",
        senderId: "sup-003",
        senderName: "Precision Metal Works",
        senderAvatar: "PM",
        content: "Good morning! We specialize in medical device components. What tolerances are you looking for?",
        timestamp: new Date("2026-01-25T11:30:00"),
        isOwn: false,
        status: "read",
      },
      {
        id: "msg-009",
        senderId: "user",
        senderName: "You",
        senderAvatar: "ME",
        content: "We need ±0.01mm tolerances. Can you send some samples first?",
        timestamp: new Date("2026-01-26T09:00:00"),
        isOwn: true,
        status: "read",
      },
      {
        id: "msg-010",
        senderId: "sup-003",
        senderName: "Precision Metal Works",
        senderAvatar: "PM",
        content: "The samples have been shipped. Tracking number: PMW2024-7834",
        timestamp: new Date("2026-01-29T16:45:00"),
        isOwn: false,
        status: "read",
      },
    ],
  },
  {
    id: "conv-003",
    supplierId: "sup-002",
    supplierName: "Global Textile Solutions",
    supplierLogo: "GT",
    supplierIndustry: "Textiles",
    lastMessage: "We have GOTS certified organic cotton in the colors you need.",
    lastMessageTime: new Date("2026-01-28T14:20:00"),
    unreadCount: 1,
    isOnline: true,
    messages: [
      {
        id: "msg-011",
        senderId: "user",
        senderName: "You",
        senderAvatar: "ME",
        content: "Hi, looking for organic cotton fabric for a sustainable fashion line.",
        timestamp: new Date("2026-01-27T10:00:00"),
        isOwn: true,
        status: "read",
      },
      {
        id: "msg-012",
        senderId: "sup-002",
        senderName: "Global Textile Solutions",
        senderAvatar: "GT",
        content: "We have GOTS certified organic cotton in the colors you need.",
        timestamp: new Date("2026-01-28T14:20:00"),
        isOwn: false,
        status: "delivered",
      },
    ],
  },
  {
    id: "conv-004",
    supplierId: "sup-005",
    supplierName: "MedSupply International",
    supplierLogo: "MS",
    supplierIndustry: "Medical",
    lastMessage: "Please review the attached FDA compliance documentation.",
    lastMessageTime: new Date("2026-01-27T11:00:00"),
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: "msg-013",
        senderId: "sup-005",
        senderName: "MedSupply International",
        senderAvatar: "MS",
        content: "Following up on your inquiry about surgical instruments. We have availability for your order.",
        timestamp: new Date("2026-01-26T09:00:00"),
        isOwn: false,
        status: "read",
      },
      {
        id: "msg-014",
        senderId: "user",
        senderName: "You",
        senderAvatar: "ME",
        content: "Great! Can you provide FDA compliance documentation?",
        timestamp: new Date("2026-01-26T10:30:00"),
        isOwn: true,
        status: "read",
      },
      {
        id: "msg-015",
        senderId: "sup-005",
        senderName: "MedSupply International",
        senderAvatar: "MS",
        content: "Please review the attached FDA compliance documentation.",
        timestamp: new Date("2026-01-27T11:00:00"),
        isOwn: false,
        status: "read",
        attachments: [
          { name: "FDA_Compliance_Cert.pdf", type: "document", size: "890 KB" },
        ],
      },
    ],
  },
];
