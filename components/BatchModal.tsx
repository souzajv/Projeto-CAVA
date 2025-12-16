import React, { useState, useEffect } from 'react';
import { StoneItem, StoneTypology } from '../types';
import { X, Save, Ruler, DollarSign, Layers, Tag, Image as ImageIcon, CheckCircle2, RefreshCw } from 'lucide-react';

interface BatchModalProps {
  typologies: StoneTypology[];
  onClose: () => void;
  onSave: (item: StoneItem) => void;
}

export const BatchModal: React.FC<BatchModalProps> = ({ typologies, onClose, onSave }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-emerald-900 text-white">
          <div>
            <h2 className="text-lg font-bold">New Inventory Entry</h2>
            <p className="text-xs text-emerald-200">Register physical material arrival (Batch/Block).</p>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Product Definition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                Select Catalog Item (Typology) <span className="text-rose-500 ml-1">*</span>
              </label>
              <select
                required
                value={selectedTypologyId}
                onChange={(e) => setSelectedTypologyId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-900 outline-none"
              >
                <option value="">-- Select Stone Type --</option>
                {typologies.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.origin})</option>
                ))}
              </select>
              
              {/* Preview Selected Typology */}
              {selectedTypology && (
                <div className="flex items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100 mt-2">
                  <img src={selectedTypology.imageUrl} alt="" className="w-10 h-10 rounded object-cover mr-3" />
                  <div>
                    <p className="text-sm font-bold text-emerald-900">{selectedTypology.name}</p>
                    <p className="text-xs text-emerald-700">{selectedTypology.hardness}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center justify-between">
                <span className="flex items-center"><Tag className="w-3.5 h-3.5 mr-1" /> Lot / Block ID <span className="text-rose-500 ml-1">*</span></span>
                
                {selectedTypology && (
                  <button 
                    type="button" 
                    onClick={handleRegenerateId}
                    className="text-[10px] text-emerald-600 hover:text-emerald-800 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
                  </button>
                )}
              </label>
              <input 
                type="text" 
                required
                value={lotId}
                onChange={e => setLotId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-900 outline-none font-mono tracking-wide"
                placeholder="Select stone to generate ID..."
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Dimensions & Quantity */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
              <Ruler className="w-4 h-4 mr-2 text-slate-400" /> Dimensions & Quantity
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] uppercase font-bold text-slate-400">Width</label>
                 <input type="number" required min={0} value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-900 outline-none" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] uppercase font-bold text-slate-400">Height</label>
                 <input type="number" required min={0} value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-900 outline-none" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] uppercase font-bold text-slate-400">Thickness</label>
                 <input type="number" required min={0} value={thickness} onChange={e => setThickness(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-900 outline-none" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] uppercase font-bold text-slate-400">Unit</label>
                 <select value={unit} onChange={(e) => setUnit(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-900 outline-none">
                   <option value="cm">cm</option>
                   <option value="m">m</option>
                   <option value="mm">mm</option>
                 </select>
              </div>
            </div>

            <div className="mt-4 space-y-1">
               <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                 <Layers className="w-3.5 h-3.5 mr-1" /> Total Slabs (Quantity) <span className="text-rose-500 ml-1">*</span>
               </label>
               <input 
                 type="number" 
                 required
                 min={1}
                 value={quantity}
                 onChange={e => setQuantity(Number(e.target.value))}
                 className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-900 outline-none font-medium"
                 placeholder="Total slabs in this bundle"
               />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Financials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-1" /> Base Cost (Per Unit)
              </label>
              <input 
                type="number" 
                required
                min={0}
                value={baseCost}
                onChange={e => setBaseCost(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-900 outline-none"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-1" /> Min/Floor Price (Per Unit)
              </label>
              <input 
                type="number" 
                required
                min={0}
                value={minPrice}
                onChange={e => setMinPrice(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-900 outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Section 4: Batch Image */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 flex items-center justify-between">
              <div className="flex items-center"><ImageIcon className="w-3.5 h-3.5 mr-1" /> Batch Image URL (Optional)</div>
              {selectedTypology && (
                <button 
                  type="button" 
                  onClick={() => setBatchImageUrl(selectedTypology.imageUrl)}
                  className="text-[10px] text-emerald-600 hover:underline cursor-pointer"
                >
                  Use Catalog Image
                </button>
              )}
            </label>
            <input 
              type="url" 
              value={batchImageUrl}
              onChange={e => setBatchImageUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-900 outline-none"
              placeholder="https://... (Leave blank to use Catalog image)"
            />
          </div>

        </form>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedTypology}
            className="px-4 py-2 bg-emerald-900 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 flex items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Batch
          </button>
        </div>

      </div>
    </div>
  );
};