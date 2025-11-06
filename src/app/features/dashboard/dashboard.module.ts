import { NgModule } from '@angular/core';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { LayoutModule } from '../../layout/layout.module';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductInsightsComponent } from './components/product-insights/product-insights.component';
import { SalesAnalyticsComponent } from './components/sales-analytics/sales-analytics.component';
import { RegionalPerformanceComponent } from './components/regional-performance/regional-performance.component';
import { InventoryAnalysisComponent } from './components/inventory-analysis/inventory-analysis.component';
import { WhatsappCampaignsComponent } from './components/whatsapp-campaigns/whatsapp-campaigns.component';
import { FormsModule } from '@angular/forms';
import { DoctorOutreachComponent } from './components/doctor-outreach/doctor-outreach.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ProductInsightsComponent,
    SalesAnalyticsComponent,
    RegionalPerformanceComponent,
    InventoryAnalysisComponent,
    WhatsappCampaignsComponent,
    DoctorOutreachComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    LayoutModule,
    FormsModule
  ]
})
export class DashboardModule { }
