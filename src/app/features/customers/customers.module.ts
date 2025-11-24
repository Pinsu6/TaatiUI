import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { CustomersRoutingModule } from './customers-routing.module';
import { CustomersComponent } from './customers.component';
import { FormsModule } from '@angular/forms';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { InactiveCustomersComponent } from './inactive-customers/inactive-customers.component';


@NgModule({
  declarations: [
    CustomersComponent,
    CustomerDetailsComponent,
    InactiveCustomersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CustomersRoutingModule
  ],
  providers: [DatePipe]
})
export class CustomersModule { }
