export interface ProductResponseDto {
  drugId: number;
  drugCode: string;
  drugQuickcode: string;
  drugName: string;
  drugShort: string;
  strength: string;
  brandName: string;
  quantityPack: string;
  maxLevel?: number;
  minLevel?: number;
  narcotics?: boolean;
  unitCost?: number;
  margin?: number;
  bitIsActive?: boolean;
  dateCreated?: string;
  drugTypeName?: string;
  drugDescription?:string;
  dosageFormName?: string;
  manufacturerName?: string;
  currentStock?: number;          // <-- for stock KPI
  sellingPrice?: number;          // <-- price in the table
  totalSales?: number;            // <-- total units sold
  totalRevenue?: number;          // <-- total money
  turnoverRate?: string;          // <-- e.g. "4.2x / Year"
}