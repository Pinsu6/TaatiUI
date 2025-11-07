import { AnalyticsKpisDto } from './analytics-kpis-dto.model';
import { SalesTrendDto } from './sales-trend-dto.model';
import { TopProductDto } from './top-product-dto.model';
import { SalesByRegionDto } from './sales-by-region-dto.model';

export interface AnalyticsDto {
  kpis: AnalyticsKpisDto;
  salesTrend: SalesTrendDto[];
  topProducts: TopProductDto[];
  salesByRegion: SalesByRegionDto[];
}

