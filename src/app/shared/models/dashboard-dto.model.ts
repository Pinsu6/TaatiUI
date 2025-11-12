import { DashboardKpisDto } from './dashboard-kpis-dto.model';
import { RevenuePerformanceDto } from './revenue-performance-dto.model';
import { ProductCategoryDto } from './product-category-dto.model';
import { RegionalPerformanceDto } from './regional-performance-dto.model';
import { TopPharmacyDto } from './top-pharmacy-dto.model';
import { HelperProductDto } from './helper-product-dto.model';
import { HelperCityDto } from './helper-city-dto.model';
import { HelperDrugTypeDto } from './helper-drug-type-dto.model';

export interface DashboardDto {
  kpis: DashboardKpisDto;
  revenuePerformance: RevenuePerformanceDto[];
  productCategories: ProductCategoryDto[];
  regionalPerformance: RegionalPerformanceDto[];
  topPharmacies: TopPharmacyDto[];
  cities?: HelperCityDto[];
  products?: HelperProductDto[];
  drugTypes?: HelperDrugTypeDto[];
}

