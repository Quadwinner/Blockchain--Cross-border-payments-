import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../utils/AppContext';

const ConnectWallet: React.FC = () => {
  const navigate = useNavigate();
  const context = useAppContext();
  const { connectWallet, requestAirdrop, registrationFunctions } = context;
  const getAvailableWallets = context.getAvailableWallets || (() => []);
  const { registerUser } = registrationFunctions;

  const [contactInfo, setContactInfo] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<'phantom' | 'local'>('phantom');
  const [availableWallets, setAvailableWallets] = useState<{name: string, icon: string}[]>([]);
  
  useEffect(() => {
    // Get available wallets
    try {
      setAvailableWallets(getAvailableWallets());
    } catch (error) {
      console.error('Error getting available wallets:', error);
      // Fallback to default wallets
      setAvailableWallets([
        { name: 'Phantom', icon: 'https://www.phantom.app/img/logo.png' },
        { name: 'Demo Wallet', icon: '' }
      ]);
    }
  }, [getAvailableWallets]);

  const countries = [
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'UK', name: 'United Kingdom', currency: 'GBP' },
    { code: 'EU', name: 'European Union', currency: 'EUR' },
    { code: 'JP', name: 'Japan', currency: 'JPY' },
  ];

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Connect wallet using the selected wallet type
      const publicKey = await connectWallet(walletType);
      if (!publicKey) {
        throw new Error('Failed to connect wallet');
      }

      // Request airdrop for testing on devnet
      await requestAirdrop(2);

      // Register user
      await registerUser(contactInfo, publicKey, country, currency);

      // Redirect to home page
      navigate('/');
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    
    // Set default currency based on country
    const selectedCurrencyInfo = countries.find(c => c.code === selectedCountry);
    if (selectedCurrencyInfo) {
      setCurrency(selectedCurrencyInfo.currency);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Connect Your Wallet</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <div className="text-gray-700 mb-2 font-medium">Select Wallet Type</div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setWalletType('phantom')}
            className={`p-4 border rounded-lg text-center ${
              walletType === 'phantom' 
                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <img 
                src="https://www.phantom.app/img/logo.png" 
                alt="Phantom" 
                className="h-8 w-8"
              />
            </div>
            <div className="font-medium">Phantom Wallet</div>
            <div className="text-xs text-gray-500 mt-1">
              Connect using Phantom browser extension
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setWalletType('local')}
            className={`p-4 border rounded-lg text-center ${
              walletType === 'local' 
                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <i className="fas fa-wallet text-2xl"></i>
            </div>
            <div className="font-medium">Demo Wallet</div>
            <div className="text-xs text-gray-500 mt-1">
              Use a temporary wallet for testing
            </div>
          </button>
        </div>
      </div>
      
      <form onSubmit={handleConnect}>
        <div className="mb-4">
          <label htmlFor="contactInfo" className="block text-gray-700 mb-2">
            Email or Phone Number
          </label>
          <input
            type="text"
            id="contactInfo"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email or phone number"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="country" className="block text-gray-700 mb-2">
            Country
          </label>
          <select
            id="country"
            value={country}
            onChange={handleCountryChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select your country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label htmlFor="currency" className="block text-gray-700 mb-2">
            Default Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
            <option value="JPY">Japanese Yen (JPY)</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Connecting...' : walletType === 'phantom' ? 'Connect Phantom & Register' : 'Create Demo Wallet & Register'}
        </button>
      </form>
      
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default ConnectWallet; 