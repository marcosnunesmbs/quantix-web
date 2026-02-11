import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Transactions from './pages/Transactions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          {/* Placeholders for other routes */}
          <Route path="/reports" element={<div className="text-center py-20 text-gray-400">Reports Page</div>} />
          <Route path="/account" element={<div className="text-center py-20 text-gray-400">Account Page</div>} />
          <Route path="/cards" element={<div className="text-center py-20 text-gray-400">Cards Page</div>} />
          <Route path="/contacts" element={<div className="text-center py-20 text-gray-400">Contacts Page</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
