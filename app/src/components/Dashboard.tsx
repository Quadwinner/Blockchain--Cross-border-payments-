import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Transaction, UserInfo } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const { isLoggedIn, user, transactions, setUser, setIsLoggedIn } = useAppContext();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Format transaction date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    console.log("Dashboard mounted. isLoggedIn:", isLoggedIn, "user:", user);
    
    // Check localStorage directly as a fallback
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    const storedUser = localStorage.getItem('user');
    console.log("localStorage check: isLoggedIn:", storedIsLoggedIn, "user exists:", !!storedUser);
    
    // If user is not in context but exists in localStorage, restore it
    if ((!isLoggedIn || !user) && storedIsLoggedIn === 'true' && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Restoring user from localStorage:", parsedUser);
        if (!isLoggedIn) setIsLoggedIn(true);
        if (!user) setUser(parsedUser);
        setIsLoading(false);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        setError("Invalid user data in storage. Please log in again.");
        setIsLoading(false);
        
        // Clear invalid data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } else if (!isLoggedIn || !user) {
      // No user in context or localStorage, redirect to login
      setIsLoading(false);
      navigate('/login');
    } else {
      // User data is available in context
      setIsLoading(false);
    }
  }, [isLoggedIn, user, navigate, setIsLoggedIn, setUser]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
          <button 
            className="mt-2 ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user.name || 'User'}!</h2>
        <div className="flex flex-wrap -mx-4">
          <div className="w-full md:w-1/2 px-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Wallet Balance</h3>
              <p className="text-2xl font-bold">{user.walletBalance?.toFixed(2) || '0.00'} {user.preferredCurrency || 'USD'}</p>
            </div>
          </div>
          <div className="w-full md:w-1/2 px-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">KYC Status</h3>
              <p className="flex items-center">
                {user.kycVerified ? (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Verified
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    {user.kycStatus ? user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1) : 'Not Verified'}
                  </span>
                )}
                {!user.kycVerified && (
                  <button
                    onClick={() => navigate('/verify-kyc')}
                    className="ml-3 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Complete KYC
                  </button>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/send-money')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Send Money
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded"
            >
              Update Profile
            </button>
            {!user.kycVerified && (
              <button
                onClick={() => navigate('/verify-kyc')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded"
              >
                Complete KYC Verification
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {user.name || 'Not provided'}</p>
            <p><span className="font-medium">Email:</span> {user.email || 'Not provided'}</p>
            <p><span className="font-medium">Phone:</span> {user.phone || 'Not provided'}</p>
            <p><span className="font-medium">Country:</span> {user.country || 'Not provided'}</p>
            <p><span className="font-medium">Preferred Currency:</span> {user.preferredCurrency || 'Not set'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          {transactions.length > 3 && (
            <button
              onClick={() => navigate('/transaction-history')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          {transactions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.slice(0, 5).map((tx: Transaction) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tx.type === 'send' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {tx.type === 'send' ? 'Sent' : 'Received'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={tx.type === 'send' ? 'text-red-600' : 'text-green-600'}>
                        {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {tx.type === 'send' 
                        ? `To: ${tx.recipient}` 
                        : `From: ${tx.sender}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tx.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : tx.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions yet. Start sending money to see your transaction history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 