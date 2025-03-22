import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { isLoggedIn, userPhoneOrEmail, wallet, handleLogout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'font-bold' : '';
  };
  
  const isWalletConnected = wallet.wallet.connected;
  const walletPublicKey = wallet.wallet.publicKey;
  const walletName = wallet.wallet.walletName || 'Wallet';
  
  // Mock admin check (in a real app, this would be determined by the user's role)
  const isAdmin = true;
  
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Cross Border Pay</Link>
          
          <nav className="hidden md:flex space-x-6">
            {isLoggedIn && (
              <>
                <Link to="/dashboard" className={`hover:text-blue-200 ${isActive('/dashboard')}`}>Dashboard</Link>
                <Link to="/send-money" className={`hover:text-blue-200 ${isActive('/send-money')}`}>Send Money</Link>
                <Link to="/transaction-history" className={`hover:text-blue-200 ${isActive('/transaction-history')}`}>Transactions</Link>
                <Link to="/profile" className={`hover:text-blue-200 ${isActive('/profile')}`}>Profile</Link>
                {isAdmin && (
                  <Link to="/admin/kyc" className={`hover:text-blue-200 ${isActive('/admin/kyc')}`}>Admin KYC</Link>
                )}
              </>
            )}
          </nav>
          
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <div className="hidden md:flex items-center space-x-3">
                  {isWalletConnected ? (
                    <div className="flex items-center space-x-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-400"></span>
                      <span className="text-sm">{walletName}: {walletPublicKey?.toString().slice(0, 4)}...{walletPublicKey?.toString().slice(-4)}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        try {
                          console.log('Connecting wallet from Header button');
                          wallet.connectWallet().catch(err => {
                            console.error("Failed to connect wallet:", err);
                          });
                        } catch (error) {
                          console.error("Error in wallet connection:", error);
                        }
                      }}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                    >
                      Connect Wallet
                    </button>
                  )}
                  
                  <span className="text-xs md:text-sm">{userPhoneOrEmail}</span>
                  <button 
                    onClick={() => {
                      handleLogout();
                      navigate('/login');
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                  >
                    Logout
                  </button>
                </div>
                
                {/* Mobile menu button */}
                <button className="md:hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">Login</Link>
                <Link to="/register" className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 