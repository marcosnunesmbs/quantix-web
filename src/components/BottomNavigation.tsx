import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, ArrowLeftRight, Plus, CreditCard, BarChart } from 'lucide-react';
import { useTransactionModal } from '../context/TransactionModalContext';
import { cn } from '../lib/utils';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { openModal } = useTransactionModal();

  const navItems = [
    { icon: Home, path: '/dashboard', label: 'Home' },
    { icon: ArrowLeftRight, path: '/transactions', label: 'Transactions' },
    // Center item is skipped in map to handle manually
    { icon: CreditCard, path: '/credit-cards', label: 'Cards' },
    { icon: BarChart, path: '/reports', label: 'Reports' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe md:hidden shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between px-6 py-2 pb-4">
        
        {/* Left Side */}
        <div className="flex items-center gap-8">
          <Link 
            to="/dashboard" 
            className={cn(
              "p-2 rounded-xl transition-colors",
              isActive('/dashboard') 
                ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" 
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <Home size={24} />
          </Link>
          <Link 
            to="/transactions" 
            className={cn(
              "p-2 rounded-xl transition-colors",
              isActive('/transactions') 
                ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" 
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <ArrowLeftRight size={24} />
          </Link>
        </div>

        {/* Center Floating Button */}
        <div className="relative -top-6">
          <button
            onClick={openModal}
            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-8">
          <Link 
            to="/credit-cards" 
            className={cn(
              "p-2 rounded-xl transition-colors",
              isActive('/credit-cards') 
                ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" 
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <CreditCard size={24} />
          </Link>
          <Link 
            to="/reports" 
            className={cn(
              "p-2 rounded-xl transition-colors",
              isActive('/reports') 
                ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" 
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <BarChart size={24} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
