import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersComponent } from './customers.component';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { InactiveCustomersComponent } from './inactive-customers/inactive-customers.component';
import { WhatsappOrderSummaryComponent } from './whatsapp-order-summary/whatsapp-order-summary.component';
import { PaymentReminderComponent } from './payment-reminder/payment-reminder.component';

const routes: Routes = [
  { path: '', component: CustomersComponent },
  { path: 'inactive/list', component: InactiveCustomersComponent },
  { path: 'order-summary', component: WhatsappOrderSummaryComponent },
  { path: 'payment-reminder', component: PaymentReminderComponent },
  { path: ':id', component: CustomerDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }
