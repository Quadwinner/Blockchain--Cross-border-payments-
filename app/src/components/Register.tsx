import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useUserRegistration } from '../hooks/useUserRegistration';

const Register: React.FC = () => {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { setIsLoggedIn, setUserPhoneOrEmail, wallet } = useAppContext();
  const { registerNewUser } = useUserRegistration();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!phoneOrEmail || !password || !confirmPassword || !fullName) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Ensure wallet is connected
    if (!wallet.wallet.connected) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Register user on the blockchain
      await registerNewUser({
        fullName,
        contact: phoneOrEmail,
        isKYCVerified: false
      });
      
      // Set as logged in locally
      setIsLoggedIn(true);
      setUserPhoneOrEmail(phoneOrEmail);
      
      // Navigate to KYC verification
      navigate('/verify-kyc');
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="phoneOrEmail" className="block text-gray-700 font-medium mb-2">
            Phone Number or Email
          </label>
          <input
            type="text"
            id="phoneOrEmail"
            value={phoneOrEmail}
            onChange={(e) => setPhoneOrEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your phone or email"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Create a password"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm your password"
          />
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <div className="w-full">
              {!wallet.wallet.connected ? (
                <button
                  type="button"
                  onClick={() => wallet.connectWallet()}
                  className="w-full bg-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-800">
                    Wallet Connected: {wallet.wallet.publicKey?.toString().slice(0, 6)}...{wallet.wallet.publicKey?.toString().slice(-4)}
                  </span>
                  <button
                    type="button"
                    onClick={() => wallet.disconnectWallet()}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !wallet.wallet.connected}
          className={`w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ${
            isLoading || !wallet.wallet.connected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register; 