import React, { useState, useEffect } from 'react';
import { StoneTypology } from '../types';
import { X, Save, Image as ImageIcon, MapPin, Hammer, AlignLeft, Type } from 'lucide-react';

interface TypologyModalProps {
  typology?: StoneTypology; // If provided, edit mode. If null, create mode.
  onClose: () => void;
  onSave: (data: StoneTypology) => void;
}

export const TypologyModal: React.FC<TypologyModalProps> = ({ typology, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<StoneTypology>>({
    name: '',
    origin: '',
    hardness: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (typology) {
      setFormData(typology);
    }
  }, [typology]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, validation would happen here
    onSave({
      id: typology?.id || `type-${Date.now()}`,
      name: formData.name!,
      origin: formData.origin!,
      hardness: formData.hardness!,
      description: formData.description!,
      imageUrl: formData.imageUrl || 'https://picsum.photos/800/600' // Fallback image
    });
  };

  const handleChange = (field: keyof StoneTypology, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <div>
            <h2 className="text-lg font-bold">{typology ? 'Edit Stone Typology' : 'New Stone Typology'}</h2>
            <p className="text-xs text-slate-400">Define the catalog template for this stone.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
              <Type className="w-3 h-3 mr-1" /> Name
            </label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="e.g. Granito Preto São Gabriel"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Origin */}
             <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" /> Origin
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.origin}
                  onChange={e => handleChange('origin', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder="e.g. Brazil"
                />
             </div>
             {/* Hardness */}
             <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                  <Hammer className="w-3 h-3 mr-1" /> Hardness
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.hardness}
                  onChange={e => handleChange('hardness', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder="e.g. Mohs 7"
                />
             </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
              <ImageIcon className="w-3 h-3 mr-1" /> Image URL
            </label>
            <input 
              type="url" 
              value={formData.imageUrl}
              onChange={e => handleChange('imageUrl', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="https://..."
            />
            {formData.imageUrl && (
              <div className="mt-2 h-32 w-full rounded-lg overflow-hidden border border-slate-200">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
              <AlignLeft className="w-3 h-3 mr-1" /> Description
            </label>
            <textarea 
              rows={4}
              required
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none resize-none"
              placeholder="Detailed description of the stone features..."
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
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center shadow-md"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Typology
          </button>
        </div>

      </div>
    </div>
  );
};