export interface SalesByRegionDto {
  region?: string;
  name?: string;
  revenue?: number;
  orders?: number;
  growth?: number;
  [key: string]: any; // Allow for flexible structure since API may return different fields
}

