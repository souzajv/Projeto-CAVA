
import React from 'react';
import { StoneStatus, OfferStatus } from '../types';

interface BadgeProps {
  status: StoneStatus | OfferStatus;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    // Stone Status
    available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    reserved: 'bg-amber-100 text-amber-800 border-amber-200', // Used for soft reserved in StoneCard
    sold: 'bg-slate-100 text-slate-800 border-slate-200',
    
    // Offer Status
    active: 'bg-blue-50 text-blue-700 border-blue-100',
    expired: 'bg-slate-100 text-slate-500 border-slate-200',
    reservation_pending: 'bg-purple-50 text-purple-700 border-purple-100 animate-pulse',
    // Offer Status 'reserved' overrides Stone Status 'reserved' contextually
    'reserved_offer': 'bg-[#C2410C]/10 text-[#C2410C] border-[#C2410C]/20', 
  };

  let styleKey: string = status;
  let label = status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1);

  if (status === 'reserved') {
      styleKey = 'reserved_offer'; // Distinguish Offer 'Reserved' (Gold) from Inventory 'Reserved' (Amber)
      label = 'Reserved';
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[styleKey] || styles.active}`}>
      {label}
    </span>
  );
};
