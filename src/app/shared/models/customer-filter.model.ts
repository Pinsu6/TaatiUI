export interface CustomerFilter {
  pageNumber: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;  // true for active, false for inactive, undefined for all
}