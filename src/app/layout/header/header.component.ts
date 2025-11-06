import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ModalService } from '../../core/services/modal.service';
import { RefreshService } from '../../core/services/refresh.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  pageTitle: string = 'Business Intelligence Dashboard';
  lastUpdate: string = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  showExportModal: boolean = false;
  showQuickActionModal: boolean = false;

  constructor(
    private router: Router,
    private modalService: ModalService,
    private refreshService: RefreshService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateTitle(event.urlAfterRedirects);
      }
    });
    this.modalService.exportModalState$.subscribe(state => this.showExportModal = state);
    this.modalService.quickActionModalState$.subscribe(state => this.showQuickActionModal = state);
  }

  ngOnInit() { }

  updateTitle(url: string) {
    const titles: { [key: string]: string } = {
      '/dashboard': 'Business Intelligence Dashboard',
      '/dashboard/sales-analytics': 'Sales Analytics',
      '/dashboard/product-insights': 'Product Insights',
      '/dashboard/regional-performance': 'Regional Performance',
      '/dashboard/inventory-analysis': 'Inventory Analysis',
      '/dashboard/whatsapp-campaigns': 'WhatsApp Campaigns',
      '/dashboard/doctor-outreach': 'Doctor Outreach',
      '/customers': 'Customer List',
      '/products': 'Product List',
    };
    if (url.startsWith('/customers/')) {
      this.pageTitle = 'Customer Details';
    } else if (url.startsWith('/products/')) {
      this.pageTitle = 'Product Details';
    } else {
      this.pageTitle = titles[url] || 'Dashboard';
    }
  }

  doRefresh() {
    this.lastUpdate = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    this.refreshService.triggerRefresh();
  }

  openExportModal() { this.modalService.openExportModal(); }
  closeExportModal() { this.modalService.closeExportModal(); }
  openQuickActionModal() { this.modalService.openQuickActionModal(); }
  closeQuickActionModal() { this.modalService.closeQuickActionModal(); }
}
