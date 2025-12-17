import React from 'react';
import { OfferLink, StoneItem, Seller } from '../types';
import { Ruler, CheckCircle2, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface ClientViewProps {
  offer: OfferLink;
  stone: StoneItem;
  seller?: Seller;
}

export const ClientView: React.FC<ClientViewProps> = ({ offer, stone, seller }) => {
  const { t, formatDate, formatCurrency } = useLanguage();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tighter">CAVA</div>
          <div className="flex items-center space-x-4">
             <LanguageSwitcher />
             <div className="text-sm font-medium text-slate-500 hidden sm:block">{t('client.nav.secure')}</div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-2xl shadow-slate-200">
              <img src={stone.imageUrl} alt={stone.typology.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-slate-400 mb-2"><Ruler className="w-5 h-5"/></div>
                <div className="text-sm text-slate-500">{t('client.dimensions')}</div>
                <div className="font-semibold text-slate-900">
                  {stone.dimensions.width} x {stone.dimensions.height} {stone.dimensions.unit}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-slate-400 mb-2"><ShieldCheck className="w-5 h-5"/></div>
                <div className="text-sm text-slate-500">{t('client.origin')}</div>
                <div className="font-semibold text-slate-900">{stone.typology.origin}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col h-full justify-center space-y-8 lg:pl-12">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-6">
                <span>{t('client.badge.exclusive')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
                {stone.typology.name}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {stone.typology.description}
              </p>
            </div>

            <div className="border-t border-b border-slate-100 py-8 space-y-4">
              <div className="flex justify-between items-baseline">
                 <span className="text-slate-500 font-medium">{t('client.price_unit')}</span>
                 <span className="text-3xl font-bold text-slate-900">{formatCurrency(offer.finalPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-slate-500 font-medium">{t('client.qty_offered')}</span>
                 <span className="text-lg font-medium text-slate-900">{offer.quantityOffered} {stone.quantity.unit}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                 <span className="text-slate-500 font-medium">{t('client.total_value')}</span>
                 <span className="text-xl font-bold text-emerald-600">{formatCurrency(offer.finalPrice * offer.quantityOffered)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-slate-900 text-white text-lg font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 hover:scale-[1.01] transition-all flex items-center justify-center group">
                {t('client.btn.reserve')}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              {seller && (
                <div className="flex items-center justify-center space-x-2 text-slate-500 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>{t('client.contact')} {seller.name}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex items-start space-x-3 text-sm text-slate-600">
               <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
               <p>
                 {t('client.validity')} <span className="font-semibold">{offer.clientName}</span> {t('client.until')} {formatDate(offer.expiresAt || '')}. 
                 Lot: {stone.lotId}
               </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};