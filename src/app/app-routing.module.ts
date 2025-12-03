import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';
import { AuthGuard } from './core/services/auth.guard';
import { LoggedInGuard } from './core/services/logged-in-guard.guard';


const routes: Routes = [
  // { path: '', redirectTo: '/login', pathMatch: 'full' },
  // { path: 'login', loadChildren: () => import('./features/login/login.module').then(m => m.LoginModule), canActivate: [LoggedInGuard] },
  // { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
  // { path: 'customers', loadChildren: () => import('./features/customers/customers.module').then(m => m.CustomersModule), canActivate: [AuthGuard] },
  // { path: 'sales-analytics', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
  // { path: 'product-insights', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
  // { path: 'regional-performance', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
  // { path: 'whatsapp-campaigns', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
  // { path: 'doctor-outreach', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
  // { path: '**', redirectTo: '/login' }

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./features/login/login.module').then(m => m.LoginModule), canActivate: [LoggedInGuard] },
  { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
  { path: 'customers', loadChildren: () => import('./features/customers/customers.module').then(m => m.CustomersModule), canActivate: [AuthGuard] },
  { path: 'products', loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule), canActivate: [AuthGuard] },
  {
    path: 'message-log',
    loadChildren: () => import('./features/message-log/message-log.module').then(m => m.MessageLogModul),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
