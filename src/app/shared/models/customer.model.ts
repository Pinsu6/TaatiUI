import { EngagementDto, OrderSummaryDto } from "./customer-detail-dto.model";
import { CustomerType } from "./customer-type.model";
import { Employee } from "./employee.model";
import { Engagement } from "./Engagement.model";
import { Order } from "./order.model";

export interface Customer {
  id: number;
  cusCode: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  company: string;
  address: string;
  cusMobileno: string;
  cusPhonenoO: string;
  cusPhonenoR: string;
  city: string;
  district: string;
  country: string;
  pin: string;
  region: string;
  pbsllicense: string;
  licenseType: string;
  licenseExpiry: string | null;
  creditlim: number;
  creditdays: number;
  dateCreated: string;
  bitIsActive?: boolean;
  storeAmtremain: number;
  storeAmtused: number;
  customerType: CustomerType | null | undefined;
employee: Employee | null | undefined;
  // totalOrders: number;
  // lifetimeValue: number;
  // lastPurchase: string;
  // activePolicies: number;
  // orderHistory: Order[];
  // engagement: Engagement[];
  totalOrders: number;
lifetimeValue: number;
lastPurchase: string;
activePolicies: number;
orderHistory: OrderSummaryDto[];
engagement: EngagementDto[];
purchaseTrendData?: { month: number; total: number }[];
}

