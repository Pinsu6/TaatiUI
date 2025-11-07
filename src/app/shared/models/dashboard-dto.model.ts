import { DashboardKpisDto } from './dashboard-kpis-dto.model';
import { RevenuePerformanceDto } from './revenue-performance-dto.model';
import { ProductCategoryDto } from './product-category-dto.model';
import { RegionalPerformanceDto } from './regional-performance-dto.model';
import { TopPharmacyDto } from './top-pharmacy-dto.model';

export interface DashboardDto {
  kpis: DashboardKpisDto;
  revenuePerformance: RevenuePerformanceDto[];
  productCategories: ProductCategoryDto[];
  regionalPerformance: RegionalPerformanceDto[];
  topPharmacies: TopPharmacyDto[];
}

