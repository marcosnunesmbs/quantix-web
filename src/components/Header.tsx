import { Search, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
    const location = useLocation();
    const links = [
        { name: 'Dashboard', path: '/' },
        { name: 'Wallet', path: '/accounts' },
        { name: 'Transactions', path: '/transactions' },
        { name: 'Cards', path: '/credit-cards' },
        { name: 'Reports', path: '/reports' },
    ];

    return (
        <header className="fixed top-0 left-0 md:left-20 right-0 h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 px-4 md:px-8 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
            <div className="flex items-center gap-2">
               <button 
                onClick={onMenuClick}
                className="p-2 -ml-2 mr-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg md:hidden"
               >
                 <Menu size={24} />
               </button>
               <h1 className="text-xl md:text-2xl font-bold text-emerald-600 flex items-center gap-2">
                <span className="text-2xl md:text-3xl">Q</span>uantix
               </h1>
            </div>

             {/* Centered Navigation */}
             <nav className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1">
                {links.map((link) => {
                     const isActive = location.pathname === link.path || (link.path === '/' && location.pathname === '/dashboard');
                     return (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-full transition-all",
                                isActive 
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            {link.name}
                        </Link>
                     )
                })}
             </nav>


            <div className="flex items-center gap-4">
                <ThemeToggle />
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Search size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
