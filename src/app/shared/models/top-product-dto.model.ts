export interface TopProductDto {
  productId?: number;
  productName?: string;
  revenue?: number;
  quantity?: number;
  [key: string]: any; // Allow for flexible structure since API may return different fields
}

