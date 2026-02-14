import { LayoutGrid, PieChart, Wallet, LogOut, ArrowLeftRight, CreditCard, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { t } from 'i18next';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('QUANTIX_API_KEY');
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutGrid, path: '/', label: t('dashboard') },
    { icon: Wallet, path: '/accounts', label: t('accounts') },
    { icon: ArrowLeftRight, path: '/transactions', label: t('transactions') },
    { icon: CreditCard, path: '/credit-cards', label: t('credit_cards') },
    { icon: PieChart, path: '/reports', label: t('reports') },
    { icon: LayoutGrid, path: '/categories', label: t('categories') },
    { icon: Settings, path: '/settings', label: t('settings') },
  ];

  return (
    <>
        {/* Mobile Backdrop */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                onClick={onClose}
            />
        )}

        {/* Sidebar */}
        <aside className={cn(
            "fixed inset-y-0 left-0 z-50 w-20 flex flex-col items-center py-6 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out md:translate-x-0 h-screen",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                 {/* Logo placeholder */}
                 <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
            </div>
            
            {/* Close button for mobile inside sidebar */}
            {/* <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 md:hidden"
            >
                <X size={20} />
            </button> */}
          </div>
    
          <nav className="flex-1 flex flex-col gap-6 w-full px-2">
            {navItems.map((item, index) => {
               const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/dashboard');
               return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => onClose()} // Close sidebar on navigate (mobile)
                  className={cn(
                    "group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900/50"
                      : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
                  )}
                >
                  <item.icon size={20} strokeWidth={2} />
                  
                  {/* Tooltip */}
                  <span className="absolute left-14 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-md">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
    
          <div className="flex flex-col gap-6 mt-auto px-2 pb-4">
            <button 
              onClick={handleLogout}
              className="group relative w-12 h-12 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
              <span className="absolute left-14 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-md">
                Logout
              </span>
            </button>
          </div>
        </aside>
    </>
  );
};

export default Sidebar;
