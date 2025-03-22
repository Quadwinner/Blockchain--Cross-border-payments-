import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

// Mock transaction data
const mockTransactions = [
  {
    id: '1',
    date: '2023-11-12T15:30:00Z',
    type: 'send',
    recipient: 'john@example.com',
    amount: 25,
    currency: 'USD',
    status: 'completed',
    txHash: '5WmnEFdRLbucxQw3F...',
  },
  {
    id: '2',
    date: '2023-11-10T09:15:00Z',
    type: 'receive',
    sender: 'maria@example.com',
    amount: 50,
    currency: 'EUR',
    status: 'completed',
    txHash: '3UjnpQyYBX7Dwm9V...',
  },
  {
    id: '3',
    date: '2023-11-05T18:45:00Z',
    type: 'send',
    recipient: 'alice@example.com',
    amount: 15,
    currency: 'GBP',
    status: 'completed',
    txHash: '8HtqVgRxFbNmJ6L7...',
  }
];

const TransactionHistory: React.FC = () => {
  const { userPhoneOrEmail } = useAppContext();
  const [transactions] = useState(mockTransactions);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'sent') return tx.type === 'send';
    if (filter === 'received') return tx.type === 'receive';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <h3 className="text-lg font-semibold mb-3 sm:mb-0">Your Transactions</h3>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-3 py-1 rounded-md ${
                filter === 'sent' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setFilter('received')}
              className={`px-3 py-1 rounded-md ${
                filter === 'received' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Received
            </button>
          </div>
        </div>
        
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.type === 'send'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {tx.type === 'send' ? 'Sent' : 'Received'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {tx.type === 'send' 
                        ? `To: ${tx.recipient}` 
                        : `From: ${tx.sender}`}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.currency}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> This is a demo transaction history with mock data. 
          In a production environment, these would be your actual transactions on the Solana blockchain.
        </p>
      </div>
    </div>
  );
};

export default TransactionHistory; 