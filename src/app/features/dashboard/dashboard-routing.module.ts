import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductInsightsComponent } from './components/product-insights/product-insights.component';
import { SalesAnalyticsComponent } from './components/sales-analytics/sales-analytics.component';
import { RegionalPerformanceComponent } from './components/regional-performance/regional-performance.component';
import { InventoryAnalysisComponent } from './components/inventory-analysis/inventory-analysis.component';
import { WhatsappCampaignsComponent } from './components/whatsapp-campaigns/whatsapp-campaigns.component';
import { DoctorOutreachComponent } from './components/doctor-outreach/doctor-outreach.component';


const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'sales-analytics', component: SalesAnalyticsComponent },
  { path: 'product-insights', component: ProductInsightsComponent },
  { path: 'regional-performance', component: RegionalPerformanceComponent },
  { path: 'inventory-analysis', component: InventoryAnalysisComponent },
  { path: 'whatsapp-campaigns', component: WhatsappCampaignsComponent },
  { path: 'doctor-outreach', component: DoctorOutreachComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
