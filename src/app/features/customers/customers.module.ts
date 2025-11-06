import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { CustomersRoutingModule } from './customers-routing.module';
import { CustomersComponent } from './customers.component';
import { FormsModule } from '@angular/forms';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';


@NgModule({
  declarations: [
    CustomersComponent,
    CustomerDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CustomersRoutingModule
  ],
  providers: [DatePipe]
})
export class CustomersModule { }
