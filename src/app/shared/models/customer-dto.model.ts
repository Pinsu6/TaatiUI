export interface CustomerDto {
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
  dateCreated?: string;  // DateTime as string for simplicity
  bitIsDelete?: boolean;
  storeAmtremain?: number;
  storeAmtused?: number;
  region: string;
  pbsllicense: string;
  licenseType: string;
  licenseExpiry?: string;
  cusTypeId?: number;
  creditlim?: number;
  creditdays?: number;
}