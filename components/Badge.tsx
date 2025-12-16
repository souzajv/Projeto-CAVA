import React from 'react';
import { StoneStatus } from '../types';

interface BadgeProps {
  status: StoneStatus;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  const styles = {
    available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    reserved: 'bg-amber-100 text-amber-800 border-amber-200',
    sold: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {label}
    </span>
  );
};