import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../utils/AppContext';

const Home: React.FC = () => {
  const { walletState } = useAppContext();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Fast, Secure Cross-Border Payments on Solana
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Send money globally using just an email or phone number. 
          Our blockchain-based solution eliminates intermediaries, 
          reduces fees, and delivers funds in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-blue-500 text-4xl mb-4">
            <i className="fas fa-bolt"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
          <p className="text-gray-600">
            Send money across borders in seconds, not days. 
            Our Solana-powered solution processes transactions instantly.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-blue-500 text-4xl mb-4">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Secure & Transparent</h3>
          <p className="text-gray-600">
            Every transaction is recorded on the blockchain, 
            providing immutable proof and complete transparency.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-blue-500 text-4xl mb-4">
            <i className="fas fa-coins"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Low Fees</h3>
          <p className="text-gray-600">
            By eliminating intermediaries, we drastically reduce 
            transaction fees compared to traditional banks and remittance services.
          </p>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-8 mb-12">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li className="text-gray-700">
                <span className="font-medium">Connect your wallet</span> - Create an account and connect your Solana wallet
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Enter recipient details</span> - Just provide their email or phone number
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Specify amount and currency</span> - Choose how much to send and in what currency
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Confirm and send</span> - Review the details and complete your transaction
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Track your payment</span> - Monitor the status of your transaction in real-time
              </li>
            </ol>
          </div>
          <div className="md:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-lg">Sample Transaction</div>
                <div className="text-green-600 text-sm">Completed</div>
              </div>
              <div className="mb-4">
                <div className="text-sm text-gray-500">From</div>
                <div className="font-medium">Ankit (USA)</div>
              </div>
              <div className="mb-4">
                <div className="text-sm text-gray-500">To</div>
                <div className="font-medium">Jennifer (UK)</div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500">Amount Sent</div>
                  <div className="font-medium">1,000 USD</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Amount Received</div>
                  <div className="font-medium">770 GBP</div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200 text-xs text-gray-500">
                Transaction ID: 3Kvb...7Ypq
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-12">
        {walletState.connected ? (
          <Link
            to="/send"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md"
          >
            Send Money Now
          </Link>
        ) : (
          <Link
            to="/connect"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md"
          >
            Get Started
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home; 