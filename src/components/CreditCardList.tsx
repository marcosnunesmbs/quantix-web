import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, FileText } from 'lucide-react';
import { CreditCard } from '../types/apiTypes';
import ConfirmationModal from './ConfirmationModal';

interface CreditCardListProps {
  creditCards: CreditCard[];
  onEdit?: (card: CreditCard) => void;
  onDelete?: (id: string) => void;
}

const CreditCardList: React.FC<CreditCardListProps> = ({ creditCards, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; cardId: string | null; cardName: string }>({
    isOpen: false,
    cardId: null,
    cardName: ''
  });

  const handleViewStatements = (cardId: string) => {
    navigate(`/credit-cards/${cardId}/statements`);
  };

  const handleDeleteClick = (card: CreditCard) => {
    setDeleteModal({
      isOpen: true,
      cardId: card.id,
      cardName: card.name
    });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.cardId && onDelete) {
      onDelete(deleteModal.cardId);
    }
    setDeleteModal({ isOpen: false, cardId: null, cardName: '' });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, cardId: null, cardName: '' });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getCardGradient = (brand?: string) => {
    const b = brand?.toLowerCase() || '';
    if (b.includes('nubank')) return 'bg-gradient-to-br from-[#820AD1] to-[#400566]'; // Nubank purple
    if (b.includes('itau') || b.includes('itaú')) return 'bg-gradient-to-br from-[#FF6200] to-[#F59000]'; // Itau orange
    if (b.includes('inter')) return 'bg-gradient-to-br from-[#FF7A00] to-[#FF9000]'; // Inter orange
    if (b.includes('c6')) return 'bg-gradient-to-br from-[#242424] to-[#000000]'; // Carbon
    if (b.includes('elo')) return 'bg-gradient-to-br from-[#fbbf24] to-[#d97706]'; // Yellowish
    return 'bg-gradient-to-br from-blue-900 to-blue-700'; // Default Blue
  };

  if (!creditCards || creditCards.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center text-gray-500 dark:text-gray-400">
        No credit cards found
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {creditCards.map((card) => (
          <div key={card.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            {/* Valid Card Visual */}
            <div className={`relative w-full aspect-[1.586/1] rounded-xl p-5 text-white shadow-md ${getCardGradient(card.brand)} flex flex-col justify-between overflow-hidden`}>
              
              {/* Decorative Curves overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/2 pointer-events-none"></div>

              {/* Card Header */}
              <div className="flex justify-between items-start z-10">
                <div>
                  <h3 className="font-bold text-lg tracking-wide truncate max-w-[140px]" title={card.name}>
                    {card.name}
                  </h3>
                  <div className="flex gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
                    <span className="text-sm font-mono opacity-80 ml-1">1234</span>
                  </div>
                </div>
                {card.brand && (
                  <span className="font-bold italic opacity-90 text-right">
                    {card.brand}
                  </span>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-end z-10">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs opacity-75 font-medium uppercase tracking-wider">Limit</span>
                    <span className="text-lg font-bold tracking-tight">{formatCurrency(card.limitAmount)}</span>
                  </div>
                  <div className="text-[11px] opacity-90 font-medium">
                    Close: {card.closingDay} • Due: {card.dueDay}
                  </div>
                </div>

                {/* Generic Network Logo Circles */}
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/10"></div>
                  <div className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm border border-white/10"></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => handleViewStatements(card.id)}
                className="p-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40 rounded-lg transition-colors flex items-center gap-2"
              >
                <FileText size={16} />
                Faturas
              </button>
               {onEdit && (
                <button
                  onClick={() => onEdit(card)}
                  className="p-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Pencil size={16} />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => handleDeleteClick(card)}
                  className="p-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Excluir Cartão de Crédito"
        message={`Tem certeza que deseja excluir o cartão "${deleteModal.cardName}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default CreditCardList;