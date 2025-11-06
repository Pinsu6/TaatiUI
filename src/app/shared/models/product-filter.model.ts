export interface ProductFilter {
  pageNumber: number;
  pageSize: number;
  search?: string;
  drugTypeId?: number;  // For category filter
}