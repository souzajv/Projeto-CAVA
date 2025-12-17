import React, { useState, useEffect } from 'react';
import { StoneItem, StoneTypology } from '../types';
import { X, Save, Ruler, DollarSign, Layers, Tag, Image as ImageIcon, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BatchModalProps {
  typologies: StoneTypology[];
  onClose: () => void;
  onSave: (item: StoneItem) => void;
}

export const BatchModal: React.FC<BatchModalProps> = ({ typologies, onClose, onSave }) => {
  const { t } = useLanguage();
  // Form State
  const [selectedTypologyId, setSelectedTypologyId] = useState<string>('');
  const [lotId, setLotId] = useState('');
  
  // Dimensions
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [thickness, setThickness] = useState<number>(2);
  const [unit, setUnit] = useState<'cm' | 'mm' | 'm'>('cm');

  // Quantities & Financials
  const [quantity, setQuantity] = useState<number>(1);
  const [baseCost, setBaseCost] = useState<number>(0);
  const [minPrice, setMinPrice] = useState<number>(0);
  
  // Specific Batch Image (Defaults to empty, will fallback to Typology image if not provided)
  const [batchImageUrl, setBatchImageUrl] = useState('');

  // Helpers
  const selectedTypology = typologies.find(t => t.id === selectedTypologyId);

  // Automatic ID Generator
  const generateAutoId = (typeName: string) => {
    if (!typeName) return '';
    
    // 1. Name: First word, uppercase, clean special chars
    const namePart = typeName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // 2. Date: MM-YY
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString().slice(-2);
    
    // 3. Random: 3 random alphanumeric chars
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    return `${namePart}/${month}-${year}/${randomPart}`;
  };

  // Auto-generate ID when typology changes
  useEffect(() => {
    if (selectedTypology) {
      setLotId(generateAutoId(selectedTypology.name));
    } else {
      setLotId('');
    }
  }, [selectedTypologyId]);

  const handleRegenerateId = () => {
    if (selectedTypology) {
      setLotId(generateAutoId(selectedTypology.name));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypology) return;

    const newItem: StoneItem = {
      id: `inv-${Date.now()}`,
      typology: selectedTypology,
      lotId,
      dimensions: { width, height, thickness, unit },
      // Use batch specific image or fallback to catalog image
      imageUrl: batchImageUrl || selectedTypology.imageUrl,
      baseCost,
      minPrice,
      quantity: {
        total: quantity,
        available: quantity, // Initially all are available
        reserved: 0,
        sold: 0,
        unit: 'slabs' // Defaulting to slabs for this MVP
      }
    };

    onSave(newItem);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-emerald-900 text-white shrink-0">
          <div>
            <h2 className="text-xl font-bold">{t('modal.batch.title')}</h2>
            <p className="text-sm text-emerald-200">{t('modal.batch.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white transition-colors p-2 rounded-full hover:bg-emerald-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10">
          
          {/* Section 1: Product Definition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                {t('modal.batch.select_type')} <span className="text-rose-500 ml-1">*</span>
              </label>
              <select
                required
                value={selectedTypologyId}
                onChange={(e) => setSelectedTypologyId(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium focus:ring-2 focus:ring-emerald-900 outline-none transition-shadow"
              >
                <option value="">-- Select --</option>
                {typologies.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.origin})</option>
                ))}
              </select>
              
              {/* Preview Selected Typology */}
              {selectedTypology && (
                <div className="flex items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100 mt-3 shadow-sm">
                  <img src={selectedTypology.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover mr-4 shadow-sm" />
                  <div>
                    <p className="text-base font-bold text-emerald-900">{selectedTypology.name}</p>
                    <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">{selectedTypology.hardness}</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 ml-auto" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center justify-between">
                <span className="flex items-center"><Tag className="w-4 h-4 mr-2" /> {t('modal.batch.lot_id')} <span className="text-rose-500 ml-1">*</span></span>
                
                {selectedTypology && (
                  <button 
                    type="button" 
                    onClick={handleRegenerateId}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full transition-colors hover:bg-emerald-100"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> {t('modal.batch.regenerate')}
                  </button>
                )}
              </label>
              <input 
                type="text" 
                required
                value={lotId}
                onChange={e => setLotId(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-emerald-900 outline-none font-mono tracking-wide"
                placeholder="Select stone to generate ID..."
              />
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Section 2: Dimensions & Quantity */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center uppercase tracking-wider">
              <Ruler className="w-4 h-4 mr-2 text-slate-400" /> {t('modal.batch.dim_qty')}
            </h3>
            
            <div className="flex flex-col lg:flex-row gap-8">
               <div className="grid grid-cols-4 gap-4 flex-[2]">
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-bold text-slate-400">{t('modal.batch.width')}</label>
                     <input type="number" required min={0} value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-900 outline-none" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-bold text-slate-400">{t('modal.batch.height')}</label>
                     <input type="number" required min={0} value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-900 outline-none" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-bold text-slate-400">{t('modal.batch.thick')}</label>
                     <input type="number" required min={0} value={thickness} onChange={e => setThickness(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-900 outline-none" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-bold text-slate-400">{t('modal.batch.unit')}</label>
                     <select value={unit} onChange={(e) => setUnit(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-900 outline-none">
                       <option value="cm">cm</option>
                       <option value="m">m</option>
                       <option value="mm">mm</option>
                     </select>
                  </div>
               </div>

               <div className="w-full lg:w-64 space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                    <Layers className="w-4 h-4 mr-2" /> {t('modal.batch.qty')} <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-emerald-900 outline-none font-bold text-slate-900"
                    placeholder="Total slabs"
                  />
               </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Section 3: Financials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" /> {t('modal.batch.cost_unit')}
              </label>
              <input 
                type="number" 
                required
                min={0}
                value={baseCost}
                onChange={e => setBaseCost(Number(e.target.value))}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium focus:ring-2 focus:ring-emerald-900 outline-none"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" /> {t('modal.batch.min_unit')}
              </label>
              <input 
                type="number" 
                required
                min={0}
                value={minPrice}
                onChange={e => setMinPrice(Number(e.target.value))}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium focus:ring-2 focus:ring-emerald-900 outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Section 4: Batch Image */}
          <div className="space-y-3 pb-8">
            <label className="text-xs font-bold uppercase text-slate-500 flex items-center justify-between">
              <div className="flex items-center"><ImageIcon className="w-4 h-4 mr-2" /> {t('modal.batch.image_opt')}</div>
              {selectedTypology && (
                <button 
                  type="button" 
                  onClick={() => setBatchImageUrl(selectedTypology.imageUrl)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  {t('modal.batch.use_catalog')}
                </button>
              )}
            </label>
            <input 
              type="url" 
              value={batchImageUrl}
              onChange={e => setBatchImageUrl(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-900 outline-none"
              placeholder="https://... (Leave blank to use Catalog image)"
            />
          </div>

        </form>

        <div className="px-10 py-6 bg-slate-50 border-t border-slate-200 flex justify-end space-x-4 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-slate-600 hover:text-slate-900 text-sm font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedTypology}
            className="px-8 py-3 bg-emerald-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-800 flex items-center shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5 mr-2" />
            {t('modal.batch.save')}
          </button>
        </div>

      </div>
    </div>
  );
};