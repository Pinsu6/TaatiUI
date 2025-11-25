export interface WhatsAppBroadcastResponse {
  totalSent: number;
  totalFailed: number;
  successMessages: string[];
  failedMessages: string[];
}

