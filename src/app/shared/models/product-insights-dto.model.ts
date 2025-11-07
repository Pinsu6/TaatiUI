import { ProductInsightsKpisDto } from './product-insights-kpis-dto.model';
import { TopSkuDto } from './top-sku-dto.model';
import { LifecycleStageDto } from './lifecycle-stage-dto.model';
import { ProductInsightDto } from './product-insight-dto.model';
import { AIRecommendation } from './ai-recommendation.model';

export interface ProductInsightsDto {
  kpis: ProductInsightsKpisDto;
  topSkus: TopSkuDto[];
  lifecycleStages: LifecycleStageDto[];
  products: ProductInsightDto[];
  aiRecommendations: AIRecommendation[];
}

