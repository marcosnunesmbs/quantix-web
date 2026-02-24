import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useI18n } from '../context/I18nContext';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { syncFromApi } = useI18n();
  const { t } = useTranslation();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    const apiKey = localStorage.getItem('QUANTIX_API_KEY');
    if (apiKey) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Tenta fazer uma requisição simples para validar a API key (senha)
      await api.get('/categories', {
        headers: {
          'x-api-key': password
        }
      });

      // Se a requisição for bem-sucedida, salva a senha como API key
      localStorage.setItem('QUANTIX_API_KEY', password);
      await syncFromApi();
      navigate('/');
    } catch (err) {
      setError(t('login_invalid_password'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 mb-2">Quantix</h1>
            <p className="text-gray-500">{t('login_welcome')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('login_password_label')}</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder={t('login_password_placeholder')}
                    required
                    disabled={isLoading}
                />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? t('verifying') : t('sign_in')}
            </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
