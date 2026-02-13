import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTransactionModal } from '../context/TransactionModalContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import GlobalTransactionModal from '../components/GlobalTransactionModal';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { openModal } = useTransactionModal();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
            {/* Sidebar with mobile toggle state */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />
            
            <div className="flex-1 md:ml-20 transition-all duration-300">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="pt-24 px-4 md:px-8 pb-28 md:pb-8 max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>

            {/* Desktop FAB */}
            <button
                onClick={openModal}
                className="hidden md:flex fixed bottom-8 right-8 z-40 items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
                aria-label="Adicionar transação"
            >
                <Plus size={28} />
            </button>

            <BottomNavigation />
            <GlobalTransactionModal />
        </div>
    );
};

export default Layout;
