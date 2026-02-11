import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate hardcoded credentials for demo
    if (email && password) {
       navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-600 mb-2">Quixotic</h1>
            <p className="text-gray-500">Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Enter your email"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="••••••••"
                    required
                />
            </div>

            <div className="flex items-center justify-between text-sm">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-gray-600">Remember me</span>
                 </label>
                 <a href="#" className="text-emerald-600 font-medium hover:underline">Forgot password?</a>
            </div>

            <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                Sign In
            </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
            Don't have an account? <a href="#" className="text-emerald-600 font-semibold hover:underline">Sign up for free</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
