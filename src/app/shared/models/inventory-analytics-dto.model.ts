import { InventoryAnalyticsKpisDto } from './inventory-analytics-kpis-dto.model';
import { StockByCategoryDto } from './stock-by-category-dto.model';
import { TurnoverRatioDto } from './turnover-ratio-dto.model';
import { StockAlert } from './stock-alert.model';

export interface InventoryAnalyticsDto {
  kpis: InventoryAnalyticsKpisDto;
  stockByCategory: StockByCategoryDto[];
  turnoverRatio: TurnoverRatioDto[];
  stockAlerts: StockAlert[];
}

