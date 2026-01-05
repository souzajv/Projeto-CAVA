
import React, { useState, useEffect } from 'react';
import { StoneItem, StoneTypology } from '../../types';
import { X, Save, Ruler, DollarSign, Layers, Tag, Image as ImageIcon, CheckCircle2, RefreshCw, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DEFAULT_STONE_IMAGE } from '../../constants';

interface BatchModalProps {
  typologies: StoneTypology[];
  tenantId: string;
  onClose: () => void;
  onSave: (item: StoneItem) => void;
}

export const BatchModal: React.FC<BatchModalProps> = ({ typologies, tenantId, onClose, onSave }) => {
  const { t } = useLanguage();
  const [selectedTypologyId, setSelectedTypologyId] = useState<string>('');
  const [lotId, setLotId] = useState('');

  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [thickness, setThickness] = useState<number>(2);
  const [unit, setUnit] = useState<'cm' | 'mm' | 'm'>('cm');

  const [quantity, setQuantity] = useState<number>(1);
  const [baseCost, setBaseCost] = useState<number>(0);
  const [minPrice, setMinPrice] = useState<number>(0);

  const [batchImageUrl, setBatchImageUrl] = useState('');

  const selectedTypology = typologies.find(t => t.id === selectedTypologyId);

  const generateAutoId = (typeName: string) => {
    if (!typeName) return '';
    const namePart = typeName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString().slice(-2);
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${namePart}/${month}-${year}/${randomPart}`;
  };

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
      tenantId,
      typology: selectedTypology,
      lotId,
      dimensions: { width, height, thickness, unit },
      // Use batch image if provided, else typology image, else default constant
      imageUrl: batchImageUrl || selectedTypology.imageUrl || DEFAULT_STONE_IMAGE,
      baseCost,
      minPrice,
      quantity: {
        total: quantity,
        available: quantity,
        reserved: 0,
        sold: 0,
        unit: unit === 'm' ? 'm2' : 'slabs'
      }
    };

    onSave(newItem);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm shadow-2xl w-full max-w-6xl h-[95vh] overflow-hidden flex flex-col border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="px-8 py-6 border-b border-[#222] flex justify-between items-center bg-[#121212] text-white shrink-0">
          <div>
            <h2 className="text-2xl font-serif tracking-wide">{t('modal.batch.title')}</h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">{t('modal.batch.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12">

          {/* Section 1: Product Definition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center">
                {t('modal.batch.select_type')} <span className="text-[#C2410C] ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={selectedTypologyId}
                  onChange={(e) => setSelectedTypologyId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-b border-slate-200 text-base font-medium focus:border-[#121212] outline-none appearance-none rounded-none"
                >
                  <option value="">{t('common.select_placeholder')}</option>
                  {typologies.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.origin})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Preview Selected Typology */}
              {selectedTypology && (
                <div className="flex items-center p-4 bg-slate-50 border border-slate-100 mt-4">
                  <img src={selectedTypology.imageUrl} alt="" className="w-16 h-16 object-cover mr-6 grayscale" />
                  <div>
                    <p className="text-lg font-serif text-[#121212]">{selectedTypology.name}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedTypology.hardness}</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 ml-auto" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
                <span className="flex items-center"><Tag className="w-3 h-3 mr-2" /> {t('modal.batch.lot_id')} <span className="text-[#C2410C] ml-1">*</span></span>

                {selectedTypology && (
                  <button
                    type="button"
                    onClick={handleRegenerateId}
                    className="text-[10px] font-bold text-[#121212] hover:text-[#C2410C] flex items-center transition-colors uppercase tracking-wider"
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
                className="w-full px-4 py-3 bg-white border-b border-slate-200 text-2xl font-serif text-[#121212] focus:border-[#121212] outline-none font-medium tracking-wide placeholder:text-slate-200"
                placeholder={t('modal.batch.placeholder_lot')}
              />
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Section 2: Dimensions & Quantity */}
          <div>
            <h3 className="text-sm font-bold text-[#121212] mb-8 flex items-center uppercase tracking-[0.2em]">
              <Ruler className="w-4 h-4 mr-3 text-slate-400" /> {t('modal.batch.dim_qty')}
            </h3>

            <div className="flex flex-col lg:flex-row gap-12">
              <div className="grid grid-cols-4 gap-6 flex-[2]">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{t('modal.batch.width')}</label>
                  <input type="number" required min={0} value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full py-2 bg-white border-b border-slate-200 text-lg font-medium focus:border-[#121212] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{t('modal.batch.height')}</label>
                  <input type="number" required min={0} value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full py-2 bg-white border-b border-slate-200 text-lg font-medium focus:border-[#121212] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{t('modal.batch.thick')}</label>
                  <input type="number" required min={0} value={thickness} onChange={e => setThickness(Number(e.target.value))} className="w-full py-2 bg-white border-b border-slate-200 text-lg font-medium focus:border-[#121212] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{t('modal.batch.unit')}</label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value as any)} className="w-full py-2.5 bg-white border-b border-slate-200 text-lg font-medium focus:border-[#121212] outline-none appearance-none rounded-none">
                    <option value="cm">cm</option>
                    <option value="m">m</option>
                    <option value="mm">mm</option>
                  </select>
                </div>
              </div>

              <div className="w-full lg:w-64 space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center">
                  <Layers className="w-4 h-4 mr-2" /> {t('modal.batch.qty')} <span className="text-[#C2410C] ml-1">*</span>
                </label>
                <div className="flex items-baseline border-b border-slate-200">
                  <input
                    type="number"
                    required
                    min={1}
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full py-2 bg-white text-3xl font-serif text-[#121212] focus:outline-none"
                    placeholder={t('modal.batch.placeholder_qty')}
                  />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2 pb-3 whitespace-nowrap">
                    {t(`unit.${unit === 'm' ? 'm2' : 'slabs'}`)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Section 3: Financials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center">
                <DollarSign className="w-3 h-3 mr-1" /> {t('modal.batch.cost_unit')}
              </label>
              <input
                type="number"
                required
                min={0}
                value={baseCost}
                onChange={e => setBaseCost(Number(e.target.value))}
                className="w-full py-3 bg-white border-b border-slate-200 text-xl font-medium focus:border-[#121212] outline-none"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center">
                <DollarSign className="w-3 h-3 mr-1" /> {t('modal.batch.min_unit')}
              </label>
              <input
                type="number"
                required
                min={0}
                value={minPrice}
                onChange={e => setMinPrice(Number(e.target.value))}
                className="w-full py-3 bg-white border-b border-slate-200 text-xl font-medium focus:border-[#121212] outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Section 4: Batch Image */}
          <div className="space-y-3 pb-8">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
              <div className="flex items-center"><ImageIcon className="w-3 h-3 mr-2" /> {t('modal.batch.image_opt')}</div>
              {selectedTypology && (
                <button
                  type="button"
                  onClick={() => setBatchImageUrl(selectedTypology.imageUrl)}
                  className="text-[10px] font-bold text-[#121212] hover:text-[#C2410C] uppercase tracking-wider transition-colors"
                >
                  {t('modal.batch.use_catalog')}
                </button>
              )}
            </label>
            <input
              type="url"
              value={batchImageUrl}
              onChange={e => setBatchImageUrl(e.target.value)}
              className="w-full py-3 bg-white border-b border-slate-200 text-sm focus:border-[#121212] outline-none"
              placeholder={t('modal.batch.placeholder_image')}
            />
          </div>

        </form>

        <div className="px-10 py-6 bg-[#FAFAFA] border-t border-slate-200 flex justify-end space-x-4 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#121212] transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedTypology}
            className="px-8 py-3 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C2410C] flex items-center shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {t('modal.batch.save')}
          </button>
        </div>

      </div>
    </div>
  );
};
