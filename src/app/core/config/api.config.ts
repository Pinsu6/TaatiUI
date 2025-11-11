import { environment } from '../../../environments/environment';

/**
 * Centralized API Configuration
 * All API endpoints are defined here for easy management
 * Change the base URL in environment files to update all API calls
 */
export class ApiConfig {
  // Base API URL from environment
  static readonly BASE_URL = environment.apiBaseUrl;

  // API Endpoints
  static readonly ENDPOINTS = {
    // Auth endpoints
    AUTH: {
      BASE: `${ApiConfig.BASE_URL}/auth`,
      LOGIN: `${ApiConfig.BASE_URL}/auth/login`
    },

    // Customer endpoints
    CUSTOMER: {
      BASE: `${ApiConfig.BASE_URL}/customer`,
      BASE_CAPITAL: `${ApiConfig.BASE_URL}/Customer`, // For PDF exports
      BY_ID: (id: number) => `${ApiConfig.BASE_URL}/customer/${id}`,
      EXPORT: (format: string, useCapital: boolean = false) => {
        const base = useCapital ? ApiConfig.ENDPOINTS.CUSTOMER.BASE_CAPITAL : ApiConfig.ENDPOINTS.CUSTOMER.BASE;
        return `${base}/export/${format}`;
      }
    },

    // Product endpoints
    PRODUCT: {
      BASE: `${ApiConfig.BASE_URL}/products`,
      BASE_CAPITAL: `${ApiConfig.BASE_URL}/Products`, // For PDF/Excel exports
      BY_ID: (id: number) => `${ApiConfig.BASE_URL}/products/${id}`,
      EXPORT: (format: string, useCapital: boolean = false) => {
        const base = useCapital ? ApiConfig.ENDPOINTS.PRODUCT.BASE_CAPITAL : ApiConfig.ENDPOINTS.PRODUCT.BASE;
        return `${base}/export/${format}`;
      }
    },

    // Analytics endpoints
    ANALYTICS: {
      BASE: `${ApiConfig.BASE_URL}/Analytics`,
      PRODUCT_INSIGHTS: `${ApiConfig.BASE_URL}/Analytics/product-insights`,
      INVENTORY: `${ApiConfig.BASE_URL}/Analytics/inventory`,
      DASHBOARD: `${ApiConfig.BASE_URL}/Analytics/dashboard`,
      EXPORT_PRODUCT_INSIGHTS: (format: string, useProductsEndpoint: boolean = false) => {
        if (useProductsEndpoint) {
          return `${ApiConfig.BASE_URL}/Products/export/${format}`;
        }
        return `${ApiConfig.BASE_URL}/Analytics/product-insights/export/${format}`;
      },
      EXPORT_INVENTORY: (format: string) => `${ApiConfig.BASE_URL}/Analytics/inventory/export/${format}`
    },

    // Helper endpoints
    HELPER: {
      BASE: `${ApiConfig.BASE_URL}/Helper`,
      PRODUCTS: `${ApiConfig.BASE_URL}/Helper/products`,
      DRUG_TYPES: `${ApiConfig.BASE_URL}/Helper/drug-types`,
      CITIES: `${ApiConfig.BASE_URL}/Helper/cities`
    }
  };
}

