import { MessageLog } from "./message-log.model";

export interface PagedMessageLog {
  data: MessageLog[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}