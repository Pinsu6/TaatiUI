import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersComponent } from './customers.component';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { InactiveCustomersComponent } from './inactive-customers/inactive-customers.component';

const routes: Routes = [
  { path: '', component: CustomersComponent },
  { path: ':id', component: CustomerDetailsComponent },
  { path: 'inactive/list', component: InactiveCustomersComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }
