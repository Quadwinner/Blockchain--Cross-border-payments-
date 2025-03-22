import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Transaction } from '../context/AppContext';

const TransactionHistory: React.FC = () => {
  const { isLoggedIn, user, transactions } = useAppContext();
  const navigate = useNavigate();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState('all'); // 'all', 'sent', 'received'
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user is logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Apply filters to transactions
  useEffect(() => {
    if (!transactions) return;

    let result = [...transactions];
    
    // Apply type filter
    if (filter === 'sent') {
      result = result.filter(tx => tx.type === 'send');
    } else if (filter === 'received') {
      result = result.filter(tx => tx.type === 'receive');
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(tx => 
        (tx.recipient && tx.recipient.toLowerCase().includes(term)) ||
        (tx.sender && tx.sender.toLowerCase().includes(term)) ||
        tx.currency.toLowerCase().includes(term) ||
        (tx.description && tx.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredTransactions(result);
  }, [transactions, filter, searchTerm]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('sent')}
                className={`px-4 py-2 rounded ${filter === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Sent
              </button>
              <button
                onClick={() => setFilter('received')}
                className={`px-4 py-2 rounded ${filter === 'received' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Received
              </button>
            </div>
          </div>
          
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by contact, currency..."
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          {filteredTransactions.length > 0 ? (
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
                {filteredTransactions.map((tx: Transaction) => (
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
                      {tx.description && (
                        <p className="text-xs text-gray-500 mt-1">{tx.description}</p>
                      )}
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
              {transactions.length > 0 
                ? 'No transactions match your filters.' 
                : 'No transactions yet. Start sending money to see your transaction history.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
