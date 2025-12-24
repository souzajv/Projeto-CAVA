
import { useState, useMemo, useCallback } from 'react';
import { SalesDelegation, OfferLink } from '../types';
import { PLATFORM_DOMAIN } from '../constants';

export interface UseSellerOfferReturn {
  // State
  salePrice: number;
  quantity: number;
  clientName: string;
  
  // Computed
  profit: number;
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;
  generatedUrl: string | null;

  // Setters
  setSalePrice: (val: number) => void;
  setQuantity: (val: number) => void;
  setClientName: (val: string) => void;

  // Actions
  generateLink: () => Promise<OfferLink | null>;
  reset: () => void;
}

/**
 * Application Layer Hook: useSellerOffer
 * Manages the "Create Offer" use case for a Seller.
 */
export const useSellerOffer = (delegation: SalesDelegation, maxQuantity: number): UseSellerOfferReturn => {
  // Initialize price with a default margin (e.g., 15% above floor)
  const [salePrice, setSalePrice] = useState<number>(delegation.agreedMinPrice * 1.15);
  const [quantity, setQuantity] = useState<number>(1);
  const [clientName, setClientName] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  // 1. Profit Calculation (Business Logic)
  const profit = useMemo(() => {
    return (salePrice - delegation.agreedMinPrice) * quantity;
  }, [salePrice, quantity, delegation.agreedMinPrice]);

  // 2. Validation Rules (Domain Logic)
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (salePrice < delegation.agreedMinPrice) {
      errs.salePrice = `Price cannot be lower than the agreed floor price of $${delegation.agreedMinPrice.toLocaleString()}`;
    }

    if (quantity < 1) {
      errs.quantity = "Quantity must be at least 1";
    }

    // Critical: Prevent overselling
    if (quantity > maxQuantity) {
      errs.quantity = `You only have ${maxQuantity} units remaining available.`;
    }

    if (!clientName.trim()) {
      errs.clientName = "Client reference is required";
    }

    return errs;
  }, [salePrice, quantity, clientName, delegation.agreedMinPrice, maxQuantity]);

  const isValid = Object.keys(errors).length === 0;

  // 3. Action: Generate Link (Simulation)
  const generateLink = useCallback(async (): Promise<OfferLink | null> => {
    if (!isValid) return null;
    
    setIsSubmitting(true);

    // Simulate Network Latency
    await new Promise(resolve => setTimeout(resolve, 1000));

    const token = Math.random().toString(36).substring(7);
    const mockUrl = `${PLATFORM_DOMAIN}/view/${token}`;
    
    const newOffer: OfferLink = {
      id: `off-${Date.now()}`,
      delegationId: delegation.id,
      stoneId: delegation.stoneId,
      clientName: clientName,
      finalPrice: salePrice,
      quantityOffered: quantity,
      status: 'active',
      clientViewToken: token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
      viewLog: [] // Initialize empty access log
    };

    setGeneratedUrl(mockUrl);
    setIsSubmitting(false);

    return newOffer;
  }, [isValid, delegation, clientName, salePrice, quantity]);

  const reset = useCallback(() => {
    setSalePrice(delegation.agreedMinPrice * 1.15);
    setQuantity(1);
    setClientName('');
    setGeneratedUrl(null);
    setIsSubmitting(false);
  }, [delegation.agreedMinPrice]);

  return {
    salePrice,
    quantity,
    clientName,
    profit,
    errors,
    isValid,
    isSubmitting,
    generatedUrl,
    setSalePrice,
    setQuantity,
    setClientName,
    generateLink,
    reset
  };
};
