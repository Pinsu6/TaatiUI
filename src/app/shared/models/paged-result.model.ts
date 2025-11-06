export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;  // Computed on backend or here
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}