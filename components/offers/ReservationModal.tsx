import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { OfferLink } from '../../types';
import { X, Send, CheckCircle2, XCircle } from 'lucide-react';

interface ReservationModalProps {
    mode: 'request' | 'approve' | 'reject';
    offer: OfferLink;
    onConfirm: (note?: string) => void;
    onCancel: () => void;
}

const modeCopy: Record<ReservationModalProps['mode'], { title: string; action: string; cta: string; tone: string; Icon: any }> = {
    request: {
        title: 'Solicitar reserva',
        action: 'Envie uma observação (opcional) para a indústria aprovar.',
        cta: 'Enviar solicitação',
        tone: 'text-purple-700',
        Icon: Send
    },
    approve: {
        title: 'Aprovar reserva',
        action: 'Confirme a reserva e adicione uma observação (opcional).',
        cta: 'Aprovar e travar estoque',
        tone: 'text-emerald-700',
        Icon: CheckCircle2
    },
    reject: {
        title: 'Rejeitar reserva',
        action: 'Explique brevemente o motivo da recusa (opcional).',
        cta: 'Rejeitar e reabrir',
        tone: 'text-rose-700',
        Icon: XCircle
    }
};

export const ReservationModal: React.FC<ReservationModalProps> = ({ mode, offer, onConfirm, onCancel }) => {
    const { t } = useLanguage();
    const [note, setNote] = useState('');

    const copy = modeCopy[mode];
    const Icon = copy.Icon;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onCancel}>
            <div
                className="bg-white rounded-sm shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">{t('dash.table.client')}</p>
                        <h3 className="text-lg font-serif text-[#121212]">{offer.clientName}</h3>
                        <p className="text-sm text-slate-500">{offer.quantityOffered} • {t('dash.table.value')} {offer.finalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    </div>
                    <button onClick={onCancel} className="p-2 text-slate-400 hover:text-[#121212] transition-colors" aria-label="Close">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-3">
                    <div className={`flex items-center gap-2 ${copy.tone}`}>
                        <Icon className="w-4 h-4" />
                        <p className="text-sm font-bold uppercase tracking-[0.18em]">{copy.title}</p>
                    </div>
                    <p className="text-sm text-slate-600">{copy.action}</p>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={4}
                        className="w-full border border-slate-200 rounded-sm p-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#121212] focus:border-[#121212] resize-none"
                        placeholder="Observação (opcional)"
                    />
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 bg-white border border-slate-200 rounded-sm hover:text-[#121212] hover:border-slate-300 transition-colors"
                    >
                        {t('common.cancel') || 'Cancelar'}
                    </button>
                    <button
                        onClick={() => onConfirm(note || undefined)}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white bg-[#121212] rounded-sm hover:bg-[#C2410C] transition-colors"
                    >
                        {copy.cta}
                    </button>
                </div>
            </div>
        </div>
    );
};
