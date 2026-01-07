
import React, { useEffect, useRef, useState } from 'react';
import { OfferLink, StoneItem, Seller, UserRole, StoneTypology } from '../../types';
import { Ruler, ShieldCheck, Maximize2, X, ChevronRight, ChevronLeft, Grid, ArrowLeft, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

interface ClientViewProps {
   offer: OfferLink;
   stone: StoneItem;
   seller?: Seller;
   allTypologies?: StoneTypology[];
   onExit?: (durationMs: number) => void;
   onSwitchPersona?: (role: UserRole | 'client') => void;
   currentUserRole?: UserRole | 'client';
}

export const ClientView: React.FC<ClientViewProps> = ({
   offer,
   stone,
   seller,
   allTypologies = [],
   onExit,
   onSwitchPersona,
   currentUserRole = 'client'
}) => {
   const { t, formatCurrency } = useLanguage();
   const startTimeRef = useRef<number>(Date.now());

   // --- CAROUSEL STATE ---
   const images = [stone.imageUrl, ...(stone.additionalImages || [])];
   const [currentImageIndex, setCurrentImageIndex] = useState(0);
   const [isLightboxOpen, setIsLightboxOpen] = useState(false);

   // --- CATALOG STATE ---
   const [isCatalogOpen, setIsCatalogOpen] = useState(false);

   // --- SCROLL INDICATOR STATE ---
   const [isScrollIndicatorVisible, setIsScrollIndicatorVisible] = useState(true);
   const [hasUserScrolled, setHasUserScrolled] = useState(false);
   const scrollIndicatorRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      return () => {
         const duration = Date.now() - startTimeRef.current;
         if (onExit && duration > 1000) {
            onExit(duration);
         }
      };
   }, [onExit]);

   // Intersection Observer para controlar visibilidade da seta de scroll
   useEffect(() => {
      if (!scrollIndicatorRef.current) return;

      const observer = new IntersectionObserver(
         (entries) => {
            entries.forEach((entry) => {
               setIsScrollIndicatorVisible(entry.isIntersecting);
            });
         },
         { threshold: 0.5 }
      );

      observer.observe(scrollIndicatorRef.current);

      return () => {
         if (scrollIndicatorRef.current) {
            observer.unobserve(scrollIndicatorRef.current);
         }
      };
   }, []);

   // Detectar scroll do usuário
   useEffect(() => {
      const handleScroll = () => {
         setHasUserScrolled(true);
      };

      window.addEventListener('scroll', handleScroll, { once: true });

      return () => {
         window.removeEventListener('scroll', handleScroll);
      };
   }, []);

   const handleNextImage = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
   };

   const handlePrevImage = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
   };

   const isReserved = offer.status === 'reserved';

   return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#121212] selection:bg-[#C2410C] selection:text-white relative">

         {/* --- LIGHTBOX MODAL --- */}
         <AnimatePresence>
            {isLightboxOpen && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
                  onClick={() => setIsLightboxOpen(false)}
               >
                  <button
                     className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]"
                     onClick={() => setIsLightboxOpen(false)}
                  >
                     <X className="w-8 h-8" />
                  </button>

                  <motion.img
                     src={images[currentImageIndex]}
                     alt="Zoomed Detail"
                     initial={{ scale: 0.9 }}
                     animate={{ scale: 1 }}
                     className="max-h-full max-w-full object-contain shadow-2xl rounded-sm"
                     onClick={(e) => e.stopPropagation()}
                  />

                  {/* Lightbox Navigation */}
                  {images.length > 1 && (
                     <>
                        <button
                           onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                           className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors"
                        >
                           <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button
                           onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                           className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors"
                        >
                           <ChevronRight className="w-8 h-8" />
                        </button>
                     </>
                  )}
               </motion.div>
            )}
         </AnimatePresence>

         {/* --- INDUSTRY CATALOG MODAL --- */}
         <AnimatePresence>
            {isCatalogOpen && (
               <motion.div
                  initial={{ opacity: 0, y: '100%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '100%' }}
                  transition={{ type: "spring", damping: 25, stiffness: 100 }}
                  className="fixed inset-0 z-[80] bg-[#121212] text-white flex flex-col"
               >
                  {/* Catalog Header */}
                  <div className="h-24 px-8 border-b border-white/10 flex items-center justify-between shrink-0">
                     <div>
                        <h2 className="text-2xl font-serif font-bold tracking-tight">{t('client.industry_name')}</h2>
                        <p className="text-[#C2410C] text-[10px] font-bold uppercase tracking-[0.3em] mt-1">{t('client.catalog_title')}</p>
                     </div>
                     <button
                        onClick={() => setIsCatalogOpen(false)}
                        className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors"
                     >
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  {/* Catalog Grid */}
                  <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-[1800px] mx-auto">
                        {allTypologies.map((item, idx) => (
                           <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="group cursor-default"
                           >
                              <div className="aspect-[3/4] overflow-hidden bg-[#1a1a1a] relative mb-6 rounded-sm">
                                 <img src={item.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                 <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                                    {item.origin}
                                 </div>
                              </div>
                              <h3 className="text-xl font-serif text-white mb-2 group-hover:text-[#C2410C] transition-colors">{item.name}</h3>
                              <p className="text-sm text-slate-400 font-light leading-relaxed line-clamp-2">{item.description}</p>
                              <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                                 <Ruler className="w-3 h-3 mr-2" strokeWidth={0.8} /> {item.hardness}
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  </div>

                  {/* Catalog Footer */}
                  <div className="h-16 border-t border-white/10 flex items-center justify-center text-slate-500 text-xs uppercase tracking-widest shrink-0">
                     {t('client.industry_name')}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>


         {/* Editorial Navigation */}
         <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100"
         >
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between gap-4">

               {/* Logo & Industry Identity */}
               <div className="flex items-center">
                  <div className="text-2xl md:text-3xl font-serif font-bold tracking-tight">CAVA.</div>

                  <div className="h-8 w-px bg-slate-200 mx-6 hidden md:block"></div>

                  {/* Industry Header Container */}
                  <div className="hidden md:flex items-center gap-6">
                     <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">{t('client.produced_by')}</span>
                        <span className="font-serif font-bold text-[#121212] text-sm">{t('client.industry_name')}</span>
                     </div>

                     <button
                        onClick={() => setIsCatalogOpen(true)}
                        className="group flex items-center px-4 py-2 bg-slate-50 hover:bg-[#121212] border border-slate-200 hover:border-[#121212] transition-all duration-300 rounded-sm"
                     >
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#121212] group-hover:text-white transition-colors">
                           {t('client.view_catalog')}
                        </span>
                     </button>
                  </div>
               </div>

               <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-8">
                  {/* Prototyping Switcher */}
                  <div className="hidden md:flex items-center bg-slate-50 rounded-sm p-1 border border-slate-200">
                     <button onClick={() => onSwitchPersona?.('industry_admin')} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#121212] transition-colors">{t('role.industry')}</button>
                     <button onClick={() => onSwitchPersona?.('seller')} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#121212] transition-colors">{t('role.seller')}</button>
                     <button className="px-3 py-1.5 bg-[#121212] text-white shadow-sm text-[10px] font-bold uppercase tracking-widest">{t('role.client')}</button>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-3">
                     <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#C2410C] border border-[#C2410C] px-2 sm:px-3 py-1 hidden lg:block">
                        {t('client.nav.secure')}
                     </div>
                     <LanguageSwitcher />
                  </div>
               </div>
            </div>
         </motion.nav>

         <main className="pt-24 pb-20">
            {/* Hero Section */}
            <section className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-8 pb-0 lg:py-14 relative">


               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 lg:gap-20 items-start">

                  {/* Left: Content (Sticky) */}
                  <div className="lg:col-span-5 flex flex-col space-y-8 md:space-y-14 lg:space-y-16 lg:sticky lg:top-40 order-1">
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                     >
                        <div className="flex items-center space-x-4 mb-6 md:mb-8">
                           <span className="h-px w-10 bg-[#121212]"></span>
                           <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#121212]">{t('client.badge.exclusive')}</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-[0.95] mb-6 md:mb-10 tracking-tight text-[#121212]">
                           {stone.typology.name}
                        </h1>
                        <div className=""></div>
                        <p className="text-lg sm:text-xl md:text-2xl text-slate-500 leading-relaxed font-light font-serif italic max-w-xl">
                           "{stone.typology.description}"
                        </p>
                     </motion.div>

                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="space-y-12 border-t border-slate-200 pt-4 md:pt-12"
                     >
                        {/* Specifications */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-12 relative">
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
                           <motion.div
                              ref={scrollIndicatorRef}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: isScrollIndicatorVisible && !hasUserScrolled ? 1 : 0, y: isScrollIndicatorVisible && !hasUserScrolled ? 0 : 10 }}
                              transition={{ duration: 0.3 }}
                              className="hidden sm:flex absolute -bottom-28 left-0 z-[1000000] pointer-events-none"
                           >
                              <motion.div
                                 animate={{ y: [0, 12, 0] }}
                                 transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                 className="flex flex-col items-center gap-2"
                              >
                                 <ChevronDown className="size-14 text-slate-900" strokeWidth={0.5} />
                              </motion.div>
                           </motion.div>
                        </div>
                     </motion.div>
                  </div>



                  {/* Right: Visuals (Carousel) */}
                  <div className="lg:col-span-7 space-y-8 order-2 min-w-0">
                     <motion.div
                        initial={{ scale: 1.05, opacity: 0, clipPath: 'inset(10% 0 10% 0)' }}
                        animate={{ scale: 1, opacity: 1, clipPath: 'inset(0 0 0 0)' }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="relative shadow-2xl group"
                     >
                        {/* Main Image Container */}
                        <div className="aspect-[4/5] sm:aspect-square md:aspect-[4/3] bg-slate-200 relative overflow-hidden cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
                           <AnimatePresence mode="wait">
                              <motion.img
                                 key={currentImageIndex}
                                 src={images[currentImageIndex]}
                                 alt={stone.typology.name}
                                 initial={{ opacity: 0, scale: 1.05 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0 }}
                                 transition={{ duration: 0.5 }}
                                 className="w-full h-full object-cover"
                              />
                           </AnimatePresence>

                           {/* High-End Watermark */}
                           <div className="absolute bottom-10 left-10 border-l-2 border-white pl-6 backdrop-blur-md bg-black/10 py-4 pr-10 z-10 pointer-events-none">
                              <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Lot Identification</p>
                              <p className="text-white font-mono text-xl tracking-widest">{stone.lotId}</p>
                           </div>

                           {/* Zoom Hint */}
                           <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                              <Maximize2 className="w-5 h-5" />
                           </div>

                           {/* Carousel Arrows (On Hover) */}
                           {images.length > 1 && (
                              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                 <button onClick={handlePrevImage} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-colors"><ChevronLeft className="w-6 h-6" /></button>
                                 <button onClick={handleNextImage} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-colors"><ChevronRight className="w-6 h-6" /></button>
                              </div>
                           )}
                        </div>

                        {/* Thumbnails Row */}
                        {images.length > 1 && (
                           <div className="flex gap-4 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                              {images.map((img, idx) => (
                                 <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative w-20 h-20 shrink-0 overflow-hidden transition-all duration-300 ${currentImageIndex === idx ? 'ring-2 ring-[#C2410C] opacity-100' : 'opacity-50 hover:opacity-100'
                                       }`}
                                 >
                                    <img src={img} className="w-full h-full object-cover" />
                                 </button>
                              ))}
                           </div>
                        )}
                     </motion.div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="aspect-[3/2] sm:aspect-square md:aspect-[2/1] bg-slate-100 flex items-center justify-center text-slate-300 font-serif italic text-2xl border border-slate-200/50">
                           <Grid className="w-8 h-8 mr-3 opacity-30" strokeWidth={0.8} />
                           <span>Texture Detail</span>
                        </div>
                        <div className="aspect-[3/2] sm:aspect-square md:aspect-[2/1] bg-[#121212] p-8 flex flex-col justify-between text-white">
                           <Ruler className="w-8 h-8 text-[#C2410C]" strokeWidth={0.8} />
                           <div>
                              <p className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-2">{t('modal.type.hardness')}</p>
                              <p className="text-3xl font-serif">{stone.typology.hardness}</p>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>

               {/* Price Block - Full Width Luxury Design */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mt-10 md:mt-16 lg:mt-20"
               >
                  {isReserved ? (
                     <div className="relative bg-gradient-to-br from-[#C2410C]/5 via-white to-[#C2410C]/5 border-2 border-[#C2410C]/30 shadow-2xl overflow-hidden">
                        {/* Decorative corners */}
                        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#C2410C]" />
                        <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#C2410C]" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#C2410C]" />
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#C2410C]" />

                        <div className="relative z-10 text-center py-16 px-8">
                           <div className="inline-flex items-center justify-center w-20 h-20 bg-[#C2410C] rounded-full mb-8 shadow-xl">
                              <Lock className="w-10 h-10 text-white" />
                           </div>
                           <div className="max-w-2xl mx-auto space-y-6">
                              <div className="space-y-3">
                                 <div className="flex items-center justify-center gap-3 mb-4">
                                    <span className="h-px w-12 bg-[#C2410C]" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C2410C]">{t('client.reserved_badge')}</span>
                                    <span className="h-px w-12 bg-[#C2410C]" />
                                 </div>
                                 <h3 className="text-3xl md:text-4xl font-serif text-[#121212] tracking-tight leading-tight">
                                    {t('client.reserved_for')}<br /><span className="text-[#C2410C]">{offer.clientName}</span>
                                 </h3>
                                 <p className="text-sm text-slate-500 font-light max-w-lg mx-auto leading-relaxed">
                                    {t('client.reserved_msg')}
                                 </p>
                              </div>

                              <div className="pt-8 border-t border-[#C2410C]/20">
                                 <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-3">{t('client.investment_value')}</p>
                                 <p className="text-5xl md:text-6xl font-serif text-[#C2410C] tracking-tight">{formatCurrency(offer.finalPrice * offer.quantityOffered)}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="relative bg-white border border-slate-200 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
                        {/* Top accent bar */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-[#C2410C] to-transparent" />
                        <div className="relative z-10 p-8 pt-12">
                           {/* Main pricing grid */}
                           <div className="mx-auto">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
                                 {/* Unit Price */}
                                 <div className="text-center md:text-left space-y-3 border-b md:border-b-0 md:border-r border-slate-200">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 flex items-center justify-center md:justify-start gap-2">
                                       <span className="w-1.5 h-1.5 bg-[#C2410C] rounded-full" />
                                       {t('client.price_unit')}
                                    </p>
                                    <p className="text-3xl md:text-5xl font-serif text-[#121212] tracking-tight">{formatCurrency(offer.finalPrice)}</p>
                                    <p className="text-xs text-slate-500 font-medium pb-8 md:pb-0">{t('client.per_unit')} {t(`unit.${stone.quantity.unit}`)}</p>
                                 </div>

                                 {/* Quantity */}
                                 <div className="text-center space-y-3 border-b md:border-b-0 md:border-r border-slate-200">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 flex items-center justify-center gap-2">
                                       <span className="w-1.5 h-1.5 bg-[#C2410C] rounded-full" />
                                       {t('client.qty_offered')}
                                    </p>
                                    <p className="text-3xl md:text-5xl font-serif text-[#121212] tracking-tight">{offer.quantityOffered}</p>
                                    <p className="text-xs text-slate-500 font-medium pb-8 md:pb-0">{t(`unit.${stone.quantity.unit}`)} {t('client.available')}</p>
                                 </div>

                                 {/* Total Investment */}
                                 <div className="text-center md:text-right space-y-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C2410C] flex items-center justify-center md:justify-end gap-2">
                                       <span className="w-1.5 h-1.5 bg-[#C2410C] rounded-full" />
                                       {t('client.total_investment')}
                                    </p>
                                    <p className="text-3xl md:text-6xl font-serif text-[#121212] tracking-tight leading-none">
                                       {formatCurrency(offer.finalPrice * offer.quantityOffered)}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium pb-4 md:pb-0">{t('client.final_value')}</p>
                                 </div>
                              </div>

                              {/* Footer badge */}
                              <div className="pt-4 border-t border-slate-200">
                                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                       <div className="flex items-center justify-center w-10 h-10 md:bg-slate-100">
                                          <ShieldCheck className="w-5 h-5 text-slate-400" />
                                       </div>
                                       <div className="text-left">
                                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t('client.secured_proposal')}</p>
                                          <p className="text-sm font-medium text-[#121212]">{t('client.valid_for')} {offer.clientName}</p>
                                       </div>
                                    </div>

                                    <div className={`flex items-center gap-2 px-4 py-2 border rounded-sm ${offer.status === 'active' ? 'bg-emerald-50 border-emerald-200' :
                                       offer.status === 'sold' ? 'bg-blue-50 border-blue-200' :
                                          offer.status === 'expired' ? 'bg-slate-50 border-slate-200' :
                                             offer.status === 'reservation_pending' ? 'bg-amber-50 border-amber-200' :
                                                'bg-slate-50 border-slate-200'
                                       }`}>
                                       <span className={`w-2 h-2 rounded-full ${offer.status === 'active' ? 'bg-emerald-500 animate-pulse' :
                                          offer.status === 'sold' ? 'bg-blue-500' :
                                             offer.status === 'expired' ? 'bg-slate-400' :
                                                offer.status === 'reservation_pending' ? 'bg-amber-500 animate-pulse' :
                                                   'bg-slate-400'
                                          }`} />
                                       <span className={`text-[10px] font-bold uppercase tracking-wider ${offer.status === 'active' ? 'text-emerald-700' :
                                          offer.status === 'sold' ? 'text-blue-700' :
                                             offer.status === 'expired' ? 'text-slate-600' :
                                                offer.status === 'reservation_pending' ? 'text-amber-700' :
                                                   'text-slate-600'
                                          }`}>{t(`client.status.${offer.status}`)}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
               </motion.div>
            </section>

            {/* Return Button */}
            {currentUserRole !== 'client' && (
               <div className="fixed bottom-8 right-8 z-50">
                  <button
                     onClick={() => onSwitchPersona?.('industry_admin')}
                     className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#121212] font-bold uppercase text-xs tracking-widest hover:bg-[#121212] hover:text-white transition-all duration-300 border border-slate-200 hover:border-[#121212] shadow-lg"
                     title={t('client.btn.back')}
                  >
                     <ArrowLeft className="w-4 h-4" />
                     {t('client.btn.back')}
                  </button>
               </div>
            )}
         </main>
      </div>
   );
};
