import React from 'react';
import TransactionList from './TransactionList';
import { Transaction } from '../types/apiTypes';

// Exemplo de dados para demonstrar a separação de transações
const exampleTransactions: Transaction[] = [
  {
    id: '1',
    name: 'Salário',
    amount: 3000,
    date: '2026-02-10',
    type: 'INCOME',
    paid: false,
    category: { id: '1', name: 'Salário', color: '#10B981' },
    account: { id: '1', name: 'Conta Corrente', type: 'CHECKING' }
  },
  {
    id: '2',
    name: 'Aluguel',
    amount: 1200,
    date: '2026-02-05',
    type: 'EXPENSE',
    paid: true,
    category: { id: '2', name: 'Moradia', color: '#3B82F6' },
    account: { id: '1', name: 'Conta Corrente', type: 'CHECKING' }
  },
  {
    id: '3',
    name: 'Supermercado',
    amount: 350,
    date: '2026-02-08',
    type: 'EXPENSE',
    paid: false,
    category: { id: '3', name: 'Alimentação', color: '#EF4444' },
    account: { id: '1', name: 'Conta Corrente', type: 'CHECKING' }
  },
  {
    id: '4',
    name: 'Freelance',
    amount: 500,
    date: '2026-02-01',
    type: 'INCOME',
    paid: true,
    category: { id: '4', name: 'Freelance', color: '#8B5CF6' },
    account: { id: '2', name: 'Conta Poupança', type: 'SAVINGS' }
  },
  {
    id: '5',
    name: 'Compra no Cartão',
    amount: 150,
    date: '2026-02-07',
    type: 'EXPENSE',
    paid: false,
    category: { id: '5', name: 'Compras', color: '#F59E0B' },
    creditCard: { id: '1', name: 'Nubank', closingDay: 5, dueDay: 15 }
  }
];

const TransactionListExample: React.FC = () => {
  const handleEdit = (transaction: Transaction) => {
    console.log('Edit transaction:', transaction);
  };

  const handleDelete = (id: string) => {
    console.log('Delete transaction:', id);
  };

  const handlePay = (id: string) => {
    console.log('Pay transaction:', id);
  };

  const handleUnpay = (id: string) => {
    console.log('Unpay transaction:', id);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Exemplo de Listagem de Transações
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Esta demonstração mostra como as transações são separadas em dois blocos:
        <strong className="text-yellow-600 dark:text-yellow-400"> Pendentes</strong> e 
        <strong className="text-green-600 dark:text-green-400"> Pagas</strong>.
        Cada bloco tem um header com linha divisória.
      </p>
      
      <TransactionList
        transactions={exampleTransactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPay={handlePay}
        onUnpay={handleUnpay}
      />
      
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Como funciona:
        </h2>
        <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
          <li>Transações <span className="font-semibold text-yellow-600 dark:text-yellow-400">pendentes</span> aparecem primeiro</li>
          <li>Transações <span className="font-semibold text-green-600 dark:text-green-400">pagas</span> aparecem depois</li>
          <li>Cada seção tem um header com título e linha divisória</li>
          <li>Dentro de cada seção, as transações são ordenadas por data (mais recente primeiro)</li>
          <li>Botões de ação funcionam normalmente em ambas as seções</li>
        </ul>
      </div>
    </div>
  );
};

export default TransactionListExample;