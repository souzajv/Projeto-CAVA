
import React, { useEffect, useRef } from 'react';
import { OfferLink, StoneItem, Seller, UserRole } from '../types';
import { Ruler, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { motion } from 'framer-motion';
import { ImageWithLoader } from './ImageWithLoader';

interface ClientViewProps {
  offer: OfferLink;
  stone: StoneItem;
  seller?: Seller;
  onExit?: (durationMs: number) => void;
  onSwitchPersona?: (role: UserRole | 'client') => void;
}

export const ClientView: React.FC<ClientViewProps> = ({ offer, stone, seller, onExit, onSwitchPersona }) => {
  const { t, formatCurrency } = useLanguage();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    return () => {
      const duration = Date.now() - startTimeRef.current;
      if (onExit && duration > 1000) {
        onExit(duration);
      }
    };
  }, [onExit]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#121212] selection:bg-[#C5A059] selection:text-white">
      {/* Editorial Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100"
      >
        <div className="max-w-[1600px] mx-auto px-8 h-24 flex items-center justify-between">
          <div className="text-3xl font-serif font-bold tracking-tight">CAVA.</div>
          
          <div className="flex items-center space-x-8">
              {/* Prototyping Switcher */}
              <div className="hidden md:flex items-center bg-slate-50 rounded-sm p-1 border border-slate-200">
                  <button onClick={() => onSwitchPersona?.('industry_admin')} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#121212] transition-colors">{t('role.industry')}</button>
                  <button onClick={() => onSwitchPersona?.('seller')} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#121212] transition-colors">{t('role.seller')}</button>
                  <button className="px-3 py-1.5 bg-[#121212] text-white shadow-sm text-[10px] font-bold uppercase tracking-widest">{t('role.client')}</button>
              </div>
              
              <div className="flex items-center space-x-4">
                 <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] border border-[#C5A059] px-3 py-1 hidden lg:block">
                    {t('client.nav.secure')}
                 </div>
                 <LanguageSwitcher />
              </div>
          </div>
        </div>
      </motion.nav>

      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="max-w-[1600px] mx-auto px-8 py-12 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
            
            {/* Left: Content (Sticky) */}
            <div className="lg:col-span-5 flex flex-col space-y-16 lg:sticky lg:top-40">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, delay: 0.2 }}
               >
                 <div className="flex items-center space-x-4 mb-8">
                    <span className="h-px w-10 bg-[#121212]"></span>
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#121212]">{t('client.badge.exclusive')}</span>
                 </div>
                 
                 <h1 className="text-6xl md:text-8xl font-serif font-medium leading-[0.9] mb-10 tracking-tight text-[#121212]">
                   {stone.typology.name}
                 </h1>
                 <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-light font-serif italic max-w-lg">
                   "{stone.typology.description}"
                 </p>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ duration: 0.8, delay: 0.4 }}
                 className="space-y-12 border-t border-slate-200 pt-12"
               >
                  <div className="grid grid-cols-2 gap-12">
                    <div>
                       <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">{t('client.origin')}</p>
                       <p className="text-2xl font-serif text-[#121212]">{stone.typology.origin}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">{t('client.dimensions')}</p>
                       <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-serif text-[#121212] font-variant-numeric">{stone.dimensions.width} × {stone.dimensions.height}</span>
                          <span className="text-sm font-medium text-slate-400">{stone.dimensions.unit}</span>
                       </div>
                    </div>
                  </div>
                  
                  <div className="p-10 bg-white border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                     {/* Gold Accent Line */}
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C5A059] to-transparent" />
                     
                     <div className="flex justify-between items-end mb-8">
                        <div>
                           <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('client.price_unit')}</span>
                           <span className="text-5xl font-serif text-[#121212]">{formatCurrency(offer.finalPrice)}</span>
                        </div>
                        <div className="text-right">
                           <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('client.qty_offered')}</span>
                           <span className="text-xl font-medium text-[#121212]">{offer.quantityOffered} {t(`unit.${stone.quantity.unit}`)}</span>
                        </div>
                     </div>
                     
                     <motion.button 
                       whileHover={{ scale: 1.01 }}
                       whileTap={{ scale: 0.99 }}
                       className="w-full bg-[#121212] hover:bg-[#C5A059] text-white text-lg font-bold uppercase tracking-widest py-6 px-8 transition-all duration-300 flex items-center justify-between group"
                     >
                       <span>{t('client.btn.reserve')}</span>
                       <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                     </motion.button>
                     
                     <div className="text-center mt-6 flex items-center justify-center space-x-2">
                        <ShieldCheck className="w-4 h-4 text-slate-300" />
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                          {t('client.validity')} <span className="text-[#121212]">{offer.clientName}</span>
                        </p>
                     </div>
                  </div>
               </motion.div>
            </div>

            {/* Right: Visuals */}
            <div className="lg:col-span-7 space-y-8">
               <motion.div 
                 initial={{ scale: 1.05, opacity: 0, clipPath: 'inset(10% 0 10% 0)' }}
                 animate={{ scale: 1, opacity: 1, clipPath: 'inset(0 0 0 0)' }}
                 transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                 className="aspect-[3/4] md:aspect-[4/5] bg-slate-200 relative overflow-hidden shadow-2xl"
               >
                 <ImageWithLoader 
                    src={stone.imageUrl} 
                    alt={stone.typology.name} 
                    className="w-full h-full object-cover" 
                    containerClassName="w-full h-full"
                 />
                 
                 {/* High-End Watermark */}
                 <div className="absolute bottom-10 left-10 border-l-2 border-white pl-6 backdrop-blur-md bg-black/10 py-4 pr-10">
                   <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Lot Identification</p>
                   <p className="text-white font-mono text-xl tracking-widest">{stone.lotId}</p>
                 </div>
               </motion.div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square bg-slate-100 flex items-center justify-center text-slate-300 font-serif italic text-2xl">
                     Texture Detail
                  </div>
                  <div className="aspect-square bg-[#121212] p-8 flex flex-col justify-between text-white">
                     <Ruler className="w-8 h-8 text-[#C5A059]" />
                     <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-2">{t('modal.type.hardness')}</p>
                        <p className="text-3xl font-serif">{stone.typology.hardness}</p>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </section>
        
        {/* Debug/Return Button */}
        <div className="fixed bottom-8 right-8 z-50">
           <button onClick={() => onSwitchPersona?.('industry_admin')} className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-slate-300 hover:text-[#121212] transition-colors border border-slate-100" title="Back to Admin">
             <div className="w-2 h-2 bg-current rounded-full" />
           </button>
        </div>
      </main>
    </div>
  );
};
