import { useState, useEffect } from 'react';
import { CreditCard } from '../types/apiTypes';
import { getCreditCards, createCreditCard, getCreditCardStatement, payCreditCardStatement, CreateCreditCardRequest } from '../services/creditCardsApi';

export const useCreditCards = () => {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditCards = async () => {
    try {
      setLoading(true);
      const data = await getCreditCards();
      setCreditCards(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credit cards');
      console.error('Error in useCreditCards hook:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditCards();
  }, []);

  const createNewCreditCard = async (cardData: CreateCreditCardRequest) => {
    try {
      const newCard = await createCreditCard(cardData);
      setCreditCards(prev => [...prev, newCard]);
      return newCard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create credit card');
      throw err;
    }
  };

  const fetchStatement = async (id: string, month: string) => {
    try {
      const statement = await getCreditCardStatement(id, month);
      return statement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statement');
      throw err;
    }
  };

  const payStatement = async (id: string, paymentData: any) => {
    try {
      const result = await payCreditCardStatement(id, paymentData);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pay statement');
      throw err;
    }
  };

  return { 
    creditCards, 
    loading, 
    error, 
    fetchCreditCards,
    createNewCreditCard,
    fetchStatement,
    payStatement
  };
};