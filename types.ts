
/**
 * Domain Layer Definitions for CAVA Platform
 */

export interface StoneTypology {
  id: string;
  name: string;
  description: string;
  origin: string;
  hardness: string;
  imageUrl: string;
  technicalFileUrl?: string;
}

export interface Dimensions {
  width: number;
  height: number;
  thickness: number;
  unit: 'cm' | 'mm' | 'm';
}

export interface StoneItem {
  id: string;
  typology: StoneTypology;
  lotId: string;
  dimensions: Dimensions;
  imageUrl: string;
  baseCost: number;
  minPrice: number;
  quantity: {
    total: number;
    available: number;
    reserved: number;
    sold: number;
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
  delegatedQuantity: number; 
  agreedMinPrice: number;
  createdAt: string; 
}

export type OfferStatus = 'active' | 'sold' | 'expired';

export interface OfferLink {
  id: string;
  delegationId?: string; 
  stoneId: string; 
  clientName: string;
  finalPrice: number;
  quantityOffered: number;
  status: OfferStatus;
  clientViewToken: string;
  createdAt: string; 
  expiresAt?: string; 
  // RF-008: Track access and duration
  viewLog: { 
    timestamp: string; 
    durationMs?: number; // How long they stayed
  }[];
}

export interface Notification {
  id: string;
  recipientId: string;
  message: string;
  type: 'info' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
  isToast?: boolean;
}

export type UserRole = 'industry_admin' | 'seller';

export interface AppState {
  stones: StoneItem[];
  sellers: Seller[];
  delegations: SalesDelegation[];
  offers: OfferLink[];
  notifications: Notification[];
  currentUserRole: UserRole;
  currentSellerId?: string; 
  currentView: 'dashboard' | { type: 'client_view', token: string };
}
