export interface Bot {
  id: string;
  token: string;
  name: string;
  username: string;
}

export interface GroupTemplate {
  id: string;
  name: string;
  chats: string[]; // List of links, usernames, or IDs
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

export interface DeliveryTargetLog {
  chat: string;
  resolvedChat: string;
  success: boolean;
  error?: string;
  chatTitle?: string;
}

export interface DeliveryLog {
  id: string;
  botName: string;
  botUsername: string;
  timestamp: string;
  message: string;
  targetsCount: {
    total: number;
    success: number;
    failed: number;
  };
  targets: DeliveryTargetLog[];
}
