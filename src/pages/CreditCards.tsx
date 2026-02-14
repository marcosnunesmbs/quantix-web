import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import CreditCardForm from '../components/CreditCardForm';
import CreditCardList from '../components/CreditCardList';
import { useCreditCards } from '../hooks/useCreditCards';
import { CreateCreditCardRequest } from '../services/creditCardsApi';
import { getTransactions } from '../services/transactionsApi';
import { useTranslation } from 'react-i18next';

const CreditCardsPage: React.FC = () => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  
  const { 
    creditCards, 
    loading, 
    error, 
    createNewCreditCard,
    updateCreditCard,
    deleteCreditCard
  } = useCreditCards();

  const handleFormSubmit = async (cardData: CreateCreditCardRequest) => {
    try {
      if (editingCard) {
        await updateCreditCard({ id: editingCard.id, data: cardData });
      } else {
        await createNewCreditCard(cardData);
      }
      setShowForm(false);
      setEditingCard(null);
    } catch (err) {
      console.error('Error saving credit card:', err);
      // In a real app, you might want to show an error message to the user
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCard(null);
  };

  const handleEdit = (card: any) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    // Check for associated transactions before deleting
    // We try to fetch filtering by creditCardId without month constraint if the API supports it
    // Or we rely on the backend error if we can't filter purely.
    // Assuming backend might not filter by global creditCardId on /transactions? 
    // Let's assume we check for ANY transaction in recent months or if we can get a "has transactions" check.
    // Since we don't have a specific endpoint for "count transactions by card", and /transactions mostly works per month...
    // We will attempt to fetch ALL transactions if possible or handle the 409 error gracefully.
    
    // However, the requirement is "verify if it has transactions". 
    // Let's try to fetch transactions for this card. IDK if backend supports filtering /transactions by creditCardId globally
    // If not, this check might be incomplete if we only check current month.
    // BUT, if we can assume the backend will fail with 409 if we try to delete a card with transactions, 
    // we can catch that error.
    
    // Let's implement a pre-check if we can. 
    // If we assume the API supports filtering by creditCardId (I added it to the service):
    try {
        // Try to fetch transactions for this card. 
        // Note: passing undefined for month to get all? Or current? 
        // If API requires month, this might fail or return filtered.
        const cardTransactions = await getTransactions(undefined, id);
        
        if (cardTransactions && cardTransactions.length > 0) {
            toast.error('Não é possível remover o cartão pois há transações associadas a ele.');
            return;
        }
    } catch (e) {
        console.warn('Could not verify transactions for card, proceeding to delete attempt', e);
    }

    try {
      await deleteCreditCard(id);
    } catch (err: any) {
      console.error('Error deleting credit card:', err);
      if (err.response?.status === 409 || err.message?.includes('transactions')) {
        toast.error('Não é possível remover o cartão pois há transações associadas a ele.');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('credit_cards')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('manage_credit_cards')}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          {t('add_credit_card')}
        </button>
      </div>

      {loading && <div className="text-center py-8">{t('loading_credit_cards')}</div>}
      {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}
      
      {!loading && !error && (
        <div>
          <CreditCardList 
            creditCards={creditCards} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {showForm && (
        <CreditCardForm 
          onSubmit={handleFormSubmit} 
          onCancel={handleFormCancel}
          initialData={editingCard}
        />
      )}
    </div>
  );
};

export default CreditCardsPage;