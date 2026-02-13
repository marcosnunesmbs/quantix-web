import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import GlobalTransactionModal from '../components/GlobalTransactionModal';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

            <BottomNavigation />
            <GlobalTransactionModal />
        </div>
    );
};

export default Layout;
