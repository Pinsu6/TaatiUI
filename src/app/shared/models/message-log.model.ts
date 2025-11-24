export interface MessageLog {
  id: number;
  customerId: number;
  customerName: string;
  recipient: string;
  messageContent: string;
  apiEndpoint: string;
  status: string;
  gatewayResponse: string;
  retryAttempts: number;
  createdAtUtc: string;
  sentAtUtc: string;
}