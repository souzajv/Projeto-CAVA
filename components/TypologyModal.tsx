import React, { useState, useEffect } from 'react';
import { StoneTypology } from '../types';
import { X, Save, Image as ImageIcon, MapPin, Hammer, AlignLeft, Type } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TypologyModalProps {
  typology?: StoneTypology; // If provided, edit mode. If null, create mode.
  onClose: () => void;
  onSave: (data: StoneTypology) => void;
}

export const TypologyModal: React.FC<TypologyModalProps> = ({ typology, onClose, onSave }) => {
  const { t } = useLanguage();
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white shrink-0">
          <div>
            <h2 className="text-xl font-bold">{typology ? t('modal.type.edit_title') : t('modal.type.new_title')}</h2>
            <p className="text-sm text-slate-400">{t('modal.type.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row h-full">
            
            {/* Left Panel: Image & Preview */}
            <div className="w-full lg:w-5/12 bg-slate-50 p-6 border-r border-slate-200 space-y-5 flex flex-col">
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                   <ImageIcon className="w-4 h-4 mr-2" /> {t('modal.type.cover_image')}
                 </label>
                 <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center shadow-sm relative group">
                   {formData.imageUrl ? (
                     <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                   ) : (
                     <div className="text-slate-300 text-sm font-medium">No Image Preview</div>
                   )}
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-slate-500">{t('modal.type.image_url')}</label>
                 <input 
                   type="url" 
                   value={formData.imageUrl}
                   onChange={e => handleChange('imageUrl', e.target.value)}
                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                   placeholder="https://..."
                 />
               </div>
            </div>

            {/* Right Panel: Data Fields */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="space-y-5 flex-1">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                    <Type className="w-4 h-4 mr-2" /> {t('modal.type.name')}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-base font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="e.g. Granito Preto São Gabriel"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                   {/* Origin */}
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" /> {t('modal.type.origin')}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formData.origin}
                        onChange={e => handleChange('origin', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                        placeholder="e.g. Brazil"
                      />
                   </div>
                   {/* Hardness */}
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                        <Hammer className="w-4 h-4 mr-2" /> {t('modal.type.hardness')}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formData.hardness}
                        onChange={e => handleChange('hardness', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                        placeholder="e.g. Mohs 7"
                      />
                   </div>
                </div>

                {/* Description */}
                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="text-xs font-bold uppercase text-slate-500 flex items-center">
                    <AlignLeft className="w-4 h-4 mr-2" /> {t('modal.type.desc')}
                  </label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => handleChange('description', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none resize-none flex-1 min-h-[100px]"
                    placeholder="Detailed description of the stone features..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex justify-end space-x-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center shadow-lg hover:shadow-xl transition-all"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {t('modal.type.save')}
                </button>
              </div>

            </div>
          </form>
        </div>

      </div>
    </div>
  );
};