
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
  tenantId: string; // Indústria dona do lote
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
  tenantId: string; // Indústria de origem
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

export type InviteStatus = 'pending' | 'accepted' | 'expired';

export interface Seller {
  id: string;
  tenantId: string; // Indústria que convidou
  name: string;
  phone: string;
  avatarUrl?: string;
  inviteStatus: InviteStatus;
  invitedById?: string; // Admin que enviou o convite
  invitedAt?: string;
  acceptedAt?: string;
}

export interface SalesDelegation {
  id: string;
  tenantId: string;
  stoneId: string;
  sellerId: string;
  delegatedQuantity: number;
  agreedMinPrice: number;
  createdAt: string;
}

export type OfferStatus = 'active' | 'sold' | 'expired' | 'reservation_pending' | 'reserved';

export interface OfferLink {
  id: string;
  tenantId: string;
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
  // Metadados de reserva para trilha de auditoria
  reservation?: {
    requestedByRole: UserRole;
    requestedById?: string;
    requestedAt: string;
    note?: string;
    reviewedAt?: string;
    reviewerId?: string;
    reviewerRole?: UserRole;
    reviewNote?: string;
  };
  viewLog: {
    timestamp: string;
    durationMs?: number;
  }[];
}

export interface Notification {
  id: string;
  tenantId: string;
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
  currentTenantId: string;
  currentUserRole: UserRole;
  currentSellerId?: string;
  currentView: 'dashboard' | { type: 'client_view', token: string };
}
