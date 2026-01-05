
/**
 * Domain Layer Definitions for CAVA Platform
 */

export type StoneStatus = 'available' | 'reserved' | 'sold';

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
  additionalImages?: string[]; 
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

export interface Client {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  createdAt: string;
  notes?: string;
  // Auditoria de Origem do Lead
  createdById: string; // ID do Vendedor ou "admin"
  createdByRole: UserRole; 
}

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

export type OfferStatus = 'active' | 'sold' | 'expired' | 'reservation_pending' | 'reserved';

export interface OfferLink {
  id: string;
  delegationId?: string; 
  stoneId: string; 
  clientId: string; 
  clientName: string; // Denormalização para performance
  finalPrice: number;
  quantityOffered: number;
  status: OfferStatus;
  clientViewToken: string;
  createdAt: string; 
  expiresAt?: string; 
  viewLog: { 
    timestamp: string; 
    durationMs?: number; 
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

export type InterestLevel = 'cold' | 'warm' | 'hot';

export interface AppState {
  stones: StoneItem[];
  sellers: Seller[];
  clients: Client[];
  delegations: SalesDelegation[];
  offers: OfferLink[];
  notifications: Notification[];
  currentUserRole: UserRole;
  currentSellerId?: string; 
  currentView: 'dashboard' | { type: 'client_view', token: string };
}
