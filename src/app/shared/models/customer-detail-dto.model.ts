import { CustomerTypeDto } from "./customer-type-dto.model";
import { EmployeeDto } from "./employee-dto.model";

export interface CustomerDetailDto {
  customerId: number;
  cusCode: string;
  cusFirstname: string;
  cusLastname: string;
  cusMobileno: string;
  cusPhonenoO: string;
  cusPhonenoR: string;
  cusEmail: string;
  city: string;
  address: string;
  pin: string;
  district: string;
  country: string;
  employeeId?: number;
  bitIsActive?: boolean;
  dateCreated?: string;
  bitIsDelete?: boolean;
  storeAmtremain?: number;
  storeAmtused?: number;
  region: string;
  pbsllicense: string;
  licenseType: string;
  licenseExpiry?: string | null;
  cusTypeId?: number;
  creditlim?: number | null;
  creditdays?: number;
  customerType?: CustomerTypeDto | null;
  employee?: EmployeeDto | null;
  totalOrders?: number;
  lifetimeValue?: number;
  lastPurchase?: string;
  activePolicies?: number;
  orderHistory?: OrderSummaryDto[];
  paymentHistory?: PaymentSummaryDto[];
  engagement?: EngagementDto[];
  purchaseTrend?: Array<{
    month: string;
    amount: number;
  }>;
  categorySplit?: Array<{
    category: string;
    amount: number;
  }>;
}
export interface OrderSummaryDto {
  orderId: number;
  date: string;
  items: number;
  total: number;
  status: string;
}

export interface PaymentSummaryDto {
  paymentId: number;
  date: string;
  amount: number;
  method: string;
  status: string;
}

export interface EngagementDto {
  type: string;
  date: string;
  status: string;
}