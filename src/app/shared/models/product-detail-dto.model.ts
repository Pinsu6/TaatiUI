// shared/models/product-detail-dto.model.ts (New file)

import { DosageFormDto } from "./dosage-form-dto.model";
import { DrugTypeMasterDto } from "./drug-type-master-dto.model";
import { ManufacturerDto } from "./manufacturer-dto.model";


export interface ProductDetailDto {
  drugId: number;
  drugCode: string;
  drugQuickcode: string;
  drugName: string;
  drugShort: string;
  strength: string;
  brandName: string;
  quantityPack: string;
  maxLevel: number;
  minLevel: number;
  narcotics: boolean;
  unitCost: number;
  margin: number;
  bitIsActive: boolean;
  dateCreated: string;
  drugTypeName: string;
  dosageFormName: string;
  manufacturerName: string;
  theRapeuticclass: string;
  drugNdccode: string;
  drugType: string;
  bitIsDelete: boolean;
  drugTypeId: number;
  dosageId: number;
  manufacturerId: number;
  udiId: number;
  uomId: number;
  taxDetailsId: number;
  taxid: number;
  drugTypeMaster?: DrugTypeMasterDto;  // Optional (nested)
  dosageForm?: DosageFormDto;          // Optional (nested)
  manufacturer?: ManufacturerDto;      // Optional (nested) - Fixes NG1 errors
  stockSummary?: {                     // Optional - Fixes NG2 warnings/errors
    totalPurchased: number;
    totalSold: number;
    currentStock: number;
    minLevel: number;
    isLowStock: boolean;
    isOutOfStock: boolean;
  };
  activeBatches?: Array<{              // Optional - Fixes NG1 error in loop
    batchNo: string;
    expiryDate: string;
    remainingQty: number;
    isExpiringSoon: boolean;
  }>;
  pricing?: {                          // Optional - Fixes NG2 warnings/errors
    unitCost: number;
    marginPercent: number;
    marginAmount: number;
    salePrice: number;
  };
  isNarcotic: boolean;
  isActive: boolean;
}