
import React, { useState } from 'react';
import { Client, UserRole } from '../../types';
import { X, Save, User, Building2, Mail, Phone, AlignLeft, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ClientFormModalProps {
  currentUserId: string;
  currentUserRole: UserRole;
  onClose: () => void;
  onSave: (client: Client) => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  currentUserId,
  currentUserRole,
  onClose,
  onSave
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: `cli-${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
      createdById: currentUserId,
      createdByRole: currentUserRole
    };
    onSave(newClient);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121212]/90 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-white/10" onClick={(e) => e.stopPropagation()}>

        <div className="px-6 sm:px-8 py-6 bg-[#121212] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#222]">
          <div>
            <h2 className="font-serif text-xl tracking-wide">{t('cli.modal.new')}</h2>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-3 h-3 text-[#C2410C]" />
              <p className="text-[9px] text-slate-400 uppercase tracking-widest">
                Registrando como: {currentUserRole === 'industry_admin' ? 'Admin Indústria' : 'Vendedor Parceiro'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors self-end sm:self-auto">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center">
                <User className="w-3 h-3 mr-2" /> {t('cli.label.name')}
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full py-2 bg-transparent border-b border-slate-200 focus:border-[#C2410C] outline-none text-sm font-medium"
                placeholder="Nome do cliente final"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center">
                  <Building2 className="w-3 h-3 mr-2" /> {t('cli.label.company')}
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full py-2 bg-transparent border-b border-slate-200 focus:border-[#C2410C] outline-none text-sm font-medium"
                  placeholder="Empresa ou Escritório"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center">
                  <Mail className="w-3 h-3 mr-2" /> {t('cli.label.email')}
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full py-2 bg-transparent border-b border-slate-200 focus:border-[#C2410C] outline-none text-sm font-medium"
                  placeholder="email@cliente.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center">
                <Phone className="w-3 h-3 mr-2" /> {t('cli.label.phone')}
              </label>
              <input
                required
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full py-2 bg-transparent border-b border-slate-200 focus:border-[#C2410C] outline-none text-sm font-medium"
                placeholder="+55 11 9...."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center">
                <AlignLeft className="w-3 h-3 mr-2" /> {t('cli.label.notes')}
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-100 focus:border-[#C2410C] outline-none text-sm font-medium resize-none"
                placeholder="Informações adicionais sobre o cliente..."
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              type="submit"
              className="px-6 sm:px-8 py-4 bg-[#121212] hover:bg-[#C2410C] text-white text-xs font-bold uppercase tracking-widest shadow-xl transition-all flex items-center justify-center w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
