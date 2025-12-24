
import React, { useState, useEffect } from 'react';
import { StoneTypology } from '../types';
import { X, Save, Image as ImageIcon, MapPin, Hammer, AlignLeft, Type } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { DEFAULT_STONE_IMAGE } from '../constants';

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
    onSave({
      id: typology?.id || `type-${Date.now()}`,
      name: formData.name!,
      origin: formData.origin!,
      hardness: formData.hardness!,
      description: formData.description!,
      imageUrl: formData.imageUrl || DEFAULT_STONE_IMAGE
    });
  };

  const handleChange = (field: keyof StoneTypology, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-sm shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#222] flex justify-between items-center bg-[#121212] text-white shrink-0">
          <div>
            <h2 className="text-2xl font-serif tracking-wide">{typology ? t('modal.type.edit_title') : t('modal.type.new_title')}</h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">{t('modal.type.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#FAFAFA]">
          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row h-full">
            
            {/* Left Panel: Image & Preview */}
            <div className="w-full lg:w-5/12 bg-slate-50 p-8 border-r border-slate-200 space-y-8 flex flex-col">
               <div className="space-y-3">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center">
                   <ImageIcon className="w-3 h-3 mr-2" /> {t('modal.type.cover_image')}
                 </label>
                 <div className="aspect-[4/3] overflow-hidden border border-slate-200 bg-white flex items-center justify-center shadow-sm relative group">
                   {formData.imageUrl ? (
                     <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                   ) : (
                     <div className="text-slate-300 text-sm font-serif italic">No Image Preview</div>
                   )}
                 </div>
               </div>

               <div className="space-y-3">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('modal.type.image_url')}</label>
                 <input 
                   type="url" 
                   value={formData.imageUrl}
                   onChange={e => handleChange('imageUrl', e.target.value)}
                   className="w-full px-4 py-3 bg-white border-b border-slate-200 text-sm focus:border-[#121212] outline-none transition-colors"
                   placeholder={t('modal.type.placeholder_image')}
                 />
               </div>
            </div>

            {/* Right Panel: Data Fields */}
            <div className="flex-1 p-10 flex flex-col bg-white">
              <div className="space-y-8 flex-1">
                {/* Name */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center">
                    <Type className="w-3 h-3 mr-2" /> {t('modal.type.name')}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    className="w-full py-2 bg-white border-b border-slate-200 text-3xl font-serif text-[#121212] focus:border-[#121212] outline-none placeholder:text-slate-200"
                    placeholder={t('modal.type.placeholder_name')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                   {/* Origin */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center">
                        <MapPin className="w-3 h-3 mr-2" /> {t('modal.type.origin')}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formData.origin}
                        onChange={e => handleChange('origin', e.target.value)}
                        className="w-full py-2 bg-white border-b border-slate-200 text-base font-medium text-[#121212] focus:border-[#121212] outline-none"
                        placeholder={t('modal.type.placeholder_origin')}
                      />
                   </div>
                   {/* Hardness */}
                   <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center">
                        <Hammer className="w-3 h-3 mr-2" /> {t('modal.type.hardness')}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formData.hardness}
                        onChange={e => handleChange('hardness', e.target.value)}
                        className="w-full py-2 bg-white border-b border-slate-200 text-base font-medium text-[#121212] focus:border-[#121212] outline-none"
                        placeholder={t('modal.type.placeholder_hardness')}
                      />
                   </div>
                </div>

                {/* Description */}
                <div className="space-y-3 flex-1 flex flex-col">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center">
                    <AlignLeft className="w-3 h-3 mr-2" /> {t('modal.type.desc')}
                  </label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => handleChange('description', e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 text-sm leading-relaxed text-slate-700 focus:border-[#121212] outline-none resize-none flex-1 min-h-[150px]"
                    placeholder={t('modal.type.placeholder_desc')}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 border-t border-slate-100 flex justify-end space-x-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#121212] transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C5A059] shadow-lg transition-all flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
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
