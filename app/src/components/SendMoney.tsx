import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { findUserByContact } from '../solana/programs/CrossBorderPayment';
import { useAppContext } from '../context/AppContext';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Mock functions for payment
const mockCalculateExchange = (from: string, to: string, amount: number) => {
  // Mock exchange rates
  const rates: Record<string, Record<string, number>> = {
    'USD': { 'EUR': 0.85, 'GBP': 0.74, 'JPY': 110.2, 'USD': 1 },
    'EUR': { 'USD': 1.18, 'GBP': 0.87, 'JPY': 129.7, 'EUR': 1 },
    'GBP': { 'USD': 1.35, 'EUR': 1.15, 'JPY': 149.2, 'GBP': 1 },
    'JPY': { 'USD': 0.0091, 'EUR': 0.0077, 'GBP': 0.0067, 'JPY': 1 }
  };

  // Ensure these currencies exist in our mock data
  if (!rates[from] || !rates[from][to]) {
    return { rate: 1, convertedAmount: amount };
  }

  const rate = rates[from][to];
  const convertedAmount = amount * rate;
  
  return {
    rate,
    convertedAmount
  };
};

const getMockPublicKeyForRecipient = (contact: string): PublicKey => {
  // Create deterministic public key based on contact info
  // In a real app, this would come from a database
  const buffer = new Uint8Array(32).fill(0);
  
  // Use contact string to seed the buffer
  for (let i = 0; i < Math.min(contact.length, 32); i++) {
    buffer[i] = contact.charCodeAt(i);
  }
  
  return new PublicKey(buffer);
};

const mockVerifyKYC = (userEmail?: string): boolean => {
  // For demo, just return true if email exists
  return !!userEmail;
};

const SendMoney: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, addTransaction } = useAppContext();
  const { wallet } = useAppContext();

  const [recipientContact, setRecipientContact] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'details' | 'confirmation' | 'complete'>('details');
  const [signature, setSignature] = useState<string | null>(null);
  const [recipientData, setRecipientData] = useState<{ contactInfo: string; walletAddress?: PublicKey; country?: string; currency?: string } | null>(null);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Check if wallet is connected
  useEffect(() => {
    if (!wallet.wallet.connected) {
      console.log('Connecting to wallet automatically');
      wallet.connectWallet();
    }
  }, [wallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset state
    setError(null);
    setStatusMessage(null);
    
    // Basic form validation
    if (!recipientContact || !amount) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Verify KYC status before proceeding
    if (!mockVerifyKYC(user?.email)) {
      setError('KYC verification required before sending money');
      return;
    }
    
    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    
    try {
      // Find recipient by email, phone, etc.
      const recipient = findUserByContact(recipientContact);
      
      // Set recipient data (in a real app, this would come from a database)
      setRecipientData({
        contactInfo: recipientContact,
        walletAddress: getMockPublicKeyForRecipient(recipientContact),
        country: 'France', // Mock country
        currency: targetCurrency
      });
      
      // Calculate exchange rate
      const { rate, convertedAmount } = mockCalculateExchange(
        sourceCurrency, 
        targetCurrency, 
        amountNum
      );
      
      setExchangeRate(rate);
      setConvertedAmount(convertedAmount);
      
      // Move to confirmation step
      setStep('confirmation');
    } catch (err) {
      console.error('Error preparing transaction:', err);
      setError('Failed to prepare transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendWithPhantomWallet = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom wallet not installed');
    }

    setStatusMessage('Requesting approval from Phantom wallet...');

    try {
      // Create a simple transaction to demonstrate Phantom integration
      // In a real app, this would be a token transfer or program call
      const recipientPublicKey = recipientData?.walletAddress || 
                             getMockPublicKeyForRecipient(recipientContact);
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.wallet.publicKey!,
          toPubkey: recipientPublicKey,
          lamports: LAMPORTS_PER_SOL * 0.001 // Small amount for demo
        })
      );
      
      // Get latest blockhash to include in the transaction
      const { blockhash } = await wallet.connection!.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.wallet.publicKey!;
      
      // Have the user sign the transaction
      const signedTransaction = await window.solana.signTransaction(transaction);
      
      // Send the transaction
      const txSignature = await wallet.connection!.sendRawTransaction(
        signedTransaction.serialize()
      );
      
      console.log('Transaction sent with signature:', txSignature);
      
      // Notify of success
      setSignature(txSignature);
      setStatusMessage(`Payment sent successfully! Transaction: ${txSignature}`);
      setStep('complete');
      
      // Add transaction to history
      if (recipientData && amount) {
        addTransaction({
          type: 'send',
          amount: parseFloat(amount),
          currency: sourceCurrency,
          recipient: recipientContact,
          sender: user?.email || '',
          status: 'completed',
          description: `Payment to ${recipientData.contactInfo || recipientContact}`
        });
      }
      
      return txSignature;
    } catch (error) {
      console.error('Transaction error:', error);
      throw new Error('Failed to send transaction with Phantom wallet');
    }
  };

  const sendWithDemoWallet = async () => {
    setStatusMessage('Processing mock transaction...');
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a mock transaction signature
    const mockSignature = `demo_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    // Set success state
    setSignature(mockSignature);
    setStatusMessage(`Payment sent successfully! Transaction: ${mockSignature}`);
    setStep('complete');
    
    // Add transaction to history
    if (recipientData && amount) {
      addTransaction({
        type: 'send',
        amount: parseFloat(amount),
        currency: sourceCurrency,
        recipient: recipientContact,
        sender: user?.email || '',
        status: 'completed',
        description: `Payment to ${recipientData.contactInfo || recipientContact}`
      });
    }
    
    return mockSignature;
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    setStatusMessage('Processing payment...');

    try {
      // Try to use Phantom wallet if available, otherwise use demo
      if (wallet.wallet.walletName === 'Phantom Wallet' && window.solana && window.solana.isPhantom) {
        console.log('Using Phantom wallet for transaction');
        await sendWithPhantomWallet();
      } else {
        console.log('Phantom wallet not detected, using demo wallet');
        await sendWithDemoWallet();
      }
    } catch (err) {
      console.error('Error sending payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to send payment');
      setStep('details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('details');
    setError(null);
    setStatusMessage(null);
  };

  const handleReset = () => {
    setStep('details');
    setAmount('');
    setRecipientContact('');
    setError(null);
    setStatusMessage(null);
    setSignature(null);
  };

  if (!isLoggedIn) {
    return <p>Please log in to send money</p>;
  }

  return (
    <div className="px-4 py-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Send Money</h1>
      
      {/* Step 1: Enter Details */}
      {step === 'details' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Recipient Email or Phone</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={recipientContact}
              onChange={(e) => setRecipientContact(e.target.value)}
              placeholder="Enter email or phone number"
            />
          </div>
          
          <div>
            <label className="block mb-1">Amount</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to send"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Source Currency</label>
              <select
                className="w-full p-2 border rounded"
                value={sourceCurrency}
                onChange={(e) => setSourceCurrency(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1">Target Currency</label>
              <select
                className="w-full p-2 border rounded"
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>
          
          {error && (
            <div className="p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Processing...' : 'Continue'}
          </button>
        </form>
      )}
      
      {/* Step 2: Confirmation */}
      {step === 'confirmation' && (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Transaction Details</h2>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="font-medium">Recipient:</div>
              <div>{recipientData?.contactInfo || recipientContact}</div>
              
              <div className="font-medium">Amount:</div>
              <div>{parseFloat(amount).toFixed(2)} {sourceCurrency}</div>
              
              <div className="font-medium">Exchange Rate:</div>
              <div>1 {sourceCurrency} = {exchangeRate?.toFixed(5)} {targetCurrency}</div>
              
              <div className="font-medium">Recipient Gets:</div>
              <div>{convertedAmount?.toFixed(2)} {targetCurrency}</div>
              
              <div className="font-medium">Fee:</div>
              <div>0.00 {sourceCurrency} (waived for demo)</div>
              
              <div className="font-medium">Total:</div>
              <div>{parseFloat(amount).toFixed(2)} {sourceCurrency}</div>
            </div>
          </div>
          
          {error && (
            <div className="p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {statusMessage && (
            <div className="p-2 bg-blue-100 text-blue-700 rounded">
              {statusMessage}
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex-1 p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Back
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
            >
              {loading ? 'Processing...' : wallet.wallet.walletName === 'Phantom Wallet' ? 'Confirm & Pay with Phantom' : 'Confirm & Pay'}
            </button>
          </div>
        </div>
      )}
      
      {/* Step 3: Complete */}
      {step === 'complete' && (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-green-50">
            <div className="flex items-center justify-center mb-4">
              <span className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full">
                ✓
              </span>
            </div>
            
            <h2 className="text-center font-semibold mb-4">Payment Completed</h2>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="font-medium">Recipient:</div>
              <div>{recipientData?.contactInfo || recipientContact}</div>
              
              <div className="font-medium">Amount Sent:</div>
              <div>{parseFloat(amount).toFixed(2)} {sourceCurrency}</div>
              
              <div className="font-medium">Amount Received:</div>
              <div>{convertedAmount?.toFixed(2)} {targetCurrency}</div>
              
              <div className="font-medium">Transaction ID:</div>
              <div className="truncate">{signature}</div>
            </div>
          </div>
          
          <p className="mt-3 text-xs text-green-700">
            {wallet.wallet.walletName === 'Phantom Wallet' 
              ? 'Transaction confirmed by Phantom wallet' 
              : 'Transaction processed with demo wallet'}
          </p>
          
          <button
            onClick={handleReset}
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Send Another Payment
          </button>
        </div>
      )}
    </div>
  );
};

export default SendMoney; 