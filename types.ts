/**
 * Domain Layer Definitions for CAVA Platform
 * 
 * Defines the core entities and their relationships within the stone sales lifecycle:
 * Industry (Owner) -> Seller (Delegate) -> Client (Buyer).
 */

// RF-001: Stone Typology (The "Catalog" Template)
export interface StoneTypology {
  id: string;
  name: string;         // e.g., "Granito Preto São Gabriel"
  description: string;
  origin: string;       // e.g., "Espírito Santo, Brazil"
  hardness: string;     // e.g., "High", "Mohs 7"
  imageUrl: string;     // Added for Catalog visual
  technicalFileUrl?: string;
}

export interface Dimensions {
  width: number;
  height: number;
  thickness: number;
  unit: 'cm' | 'mm' | 'm';
}

// RF-002 & RF-003: Inventory Item (The Real Batch/Lot)
export interface StoneItem {
  id: string;
  typology: StoneTypology; // Linked to Catalog
  
  // Batch/Lot Identification
  lotId: string;       // e.g., "BLOCK-2024-X99"
  
  dimensions: Dimensions;
  imageUrl: string; // Real photo of the slab/batch
  
  /** 
   * The production or acquisition cost per unit.
   */
  baseCost: number;

  /** 
   * The absolute floor price set by the Industry per unit.
   */
  minPrice: number;
  
  // Quantitative Inventory Management
  quantity: {
    total: number;      // Initial physical entry
    available: number;  // Free to sell/delegate
    reserved: number;   // Locked in delegations or negotiations
    sold: number;       // Finalized sales
    unit: 'slabs' | 'm2';
  };
}

export type StoneStatus = 'available' | 'reserved' | 'sold';

export interface Seller {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
}

export interface SalesDelegation {
  id: string;
  stoneId: string;
  sellerId: string;
  
  /**
   * The quantity delegated to this seller.
   * This subtracts from StoneItem.quantity.available and adds to reserved.
   */
  delegatedQuantity: number; 

  agreedMinPrice: number;
  
  createdAt: string; 
}

export type OfferStatus = 'active' | 'sold' | 'expired';

export interface OfferLink {
  id: string;
  
  // RF-004 & RF-005: Dual Mode Support
  delegationId?: string; 
  stoneId: string; 
  
  clientName: string;
  
  // Offer details
  finalPrice: number;
  quantityOffered: number;
  status: OfferStatus; // Added for RF-009
  
  clientViewToken: string;
  
  createdAt: string; 
  expiresAt?: string; 
}

// RF-008: Notifications
export interface Notification {
  id: string;
  recipientId: string; // Seller ID or 'industry'
  message: string;
  type: 'info' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
  isToast?: boolean; // Control if it shows as a transient popup
}

// -- Application State --

export type UserRole = 'industry_admin' | 'seller';

export interface AppState {
  stones: StoneItem[];
  sellers: Seller[];
  delegations: SalesDelegation[];
  offers: OfferLink[];
  notifications: Notification[]; // Added for RF-008
  
  currentUserRole: UserRole;
  currentSellerId?: string; 
  
  // Navigation State (Mock Router)
  currentView: 'dashboard' | { type: 'client_view', token: string };
}