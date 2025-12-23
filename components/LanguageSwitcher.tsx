
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-1 border-l border-slate-200 pl-6 ml-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest transition-all ${
          language === 'en'
            ? 'text-[#121212] border-b-2 border-[#121212]'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('pt')}
        className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest transition-all ${
          language === 'pt'
            ? 'text-[#121212] border-b-2 border-[#121212]'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        PT
      </button>
    </div>
  );
};
