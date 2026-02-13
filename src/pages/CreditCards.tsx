import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import CreditCardForm from '../components/CreditCardForm';
import CreditCardList from '../components/CreditCardList';
import { useCreditCards } from '../hooks/useCreditCards';
import { CreateCreditCardRequest } from '../services/creditCardsApi';

const CreditCardsPage: React.FC = () => {
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
    if (window.confirm('Are you sure you want to delete this credit card? This action cannot be undone.')) {
      try {
        await deleteCreditCard(id);
      } catch (err) {
        console.error('Error deleting credit card:', err);
        alert('Failed to delete credit card. Please try again.');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Credit Cards</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your credit cards</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Credit Card
        </button>
      </div>

      {loading && <div className="text-center py-8">Loading credit cards...</div>}
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