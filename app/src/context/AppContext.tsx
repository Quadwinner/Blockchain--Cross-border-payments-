import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useWallet } from '../hooks/useWallet';
import { Connection, clusterApiUrl, PublicKey, Keypair } from '@solana/web3.js';

// Define the WalletState interface 
interface WalletState {
  connected: boolean;
  publicKey: PublicKey | null;
  balance: number;
  keypair: Keypair | null;
  walletName: string | null;
}

// Transaction type definition
export interface Transaction {
  id: string;
  date: string;
  type: 'send' | 'receive';
  amount: number;
  currency: string;
  recipient?: string;
  sender?: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
}

// User information with KYC status
export interface UserInfo {
  email: string;
  phone?: string;
  name?: string;
  country: string;
  kycVerified: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
  kycSubmissionDate?: string;
  kycDocuments?: {
    idType: string;
    idNumber: string;
    idExpiry?: string;
  };
  // New fields for profile
  preferredCurrency?: string;
  bio?: string;
  avatarUrl?: string;
  walletBalance?: number;
  transactions?: Transaction[];
}

interface AppContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  userPhoneOrEmail: string;
  setUserPhoneOrEmail: React.Dispatch<React.SetStateAction<string>>;
  wallet: {
    wallet: WalletState;
    error: string | null;
    loading: boolean;
    connection: Connection | null;
    connectWallet: () => Promise<PublicKey | undefined>;
    disconnectWallet: () => Promise<void>;
    refreshBalance: () => Promise<void>;
    requestAirdrop: (amount?: number) => Promise<string | undefined>;
  };
  user: UserInfo | null;
  setUser: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  kycVerifications: UserInfo[];
  setKycVerifications: React.Dispatch<React.SetStateAction<UserInfo[]>>;
  approveKyc: (email: string) => void;
  rejectKyc: (email: string) => void;
  handleLogout: () => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}

interface AppContextProviderProps {
  children: ReactNode;
}

export function AppContextProvider({ children }: AppContextProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhoneOrEmail, setUserPhoneOrEmail] = useState('');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [kycVerifications, setKycVerifications] = useState<UserInfo[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Initialize wallet hook
  const {
    wallet,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    requestAirdrop,
    connection,
  } = useWallet();

  // Initialize mock KYC verifications for testing
  useEffect(() => {
    // Add some mock KYC verifications for demo purposes
    const mockVerifications: UserInfo[] = [
      {
        email: 'john.smith@example.com',
        phone: '+1234567890',
        name: 'John Smith',
        country: 'US',
        kycVerified: false,
        kycStatus: 'pending',
        kycSubmissionDate: '2023-11-15',
        kycDocuments: {
          idType: 'passport',
          idNumber: 'P12345678',
          idExpiry: '2027-05-23'
        }
      },
      {
        email: 'maria.garcia@example.com',
        phone: '+3498765432',
        name: 'Maria Garcia',
        country: 'ES',
        kycVerified: false,
        kycStatus: 'pending',
        kycSubmissionDate: '2023-11-14',
        kycDocuments: {
          idType: 'nationalId',
          idNumber: 'N98765432',
          idExpiry: '2025-08-12'
        }
      },
      {
        email: 'robert.johnson@example.com',
        phone: '+447890123456',
        name: 'Robert Johnson',
        country: 'GB',
        kycVerified: true,
        kycStatus: 'approved',
        kycSubmissionDate: '2023-11-13',
        kycDocuments: {
          idType: 'drivingLicense',
          idNumber: 'D67890123',
          idExpiry: '2026-03-18'
        }
      },
      {
        email: 'aisha.khan@example.com',
        phone: '+6587654321',
        name: 'Aisha Khan',
        country: 'SG',
        kycVerified: false,
        kycStatus: 'rejected',
        kycSubmissionDate: '2023-11-12',
        kycDocuments: {
          idType: 'passport',
          idNumber: 'P87654321',
          idExpiry: '2028-11-05'
        }
      }
    ];
    
    setKycVerifications(mockVerifications);
    console.log("Mock KYC verifications initialized:", mockVerifications);
  }, []);

  // Load user data from localStorage on initial mount
  useEffect(() => {
    console.log("Checking local storage for user data...");
    // Check if the user is already logged in from local storage
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    const storedPhoneOrEmail = localStorage.getItem('userPhoneOrEmail');
    const storedUser = localStorage.getItem('user');
    
    console.log("loggedInStatus:", loggedInStatus);
    console.log("storedPhoneOrEmail:", storedPhoneOrEmail);
    console.log("storedUser exists:", !!storedUser);
    
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
      
      if (storedPhoneOrEmail) {
        setUserPhoneOrEmail(storedPhoneOrEmail);
      }
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("Parsed user from localStorage:", parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
          setIsLoggedIn(false);
        }
      } else {
        console.warn("isLoggedIn is true but no user data found in localStorage");
      }
    }
    
    // Initialize mock KYC verifications if needed
    const storedVerifications = localStorage.getItem('kycVerifications');
    if (storedVerifications) {
      try {
        setKycVerifications(JSON.parse(storedVerifications));
      } catch (error) {
        console.error('Error parsing stored KYC verifications:', error);
      }
    }

    // Add demo users to KYC verifications if none exist
    if (!storedVerifications || JSON.parse(storedVerifications).length === 0) {
      const demoUsers: UserInfo[] = [
        {
          email: 'demo@example.com',
          phone: '1234567890',
          name: 'Demo User',
          country: 'USA',
          kycVerified: true,
          kycStatus: 'approved',
          preferredCurrency: 'USD',
          bio: 'Demo account for testing',
          avatarUrl: '',
          walletBalance: 1000
        },
        {
          email: 'user@example.com',
          phone: '0987654321',
          name: 'Test User',
          country: 'India',
          kycVerified: false,
          kycStatus: 'pending',
          preferredCurrency: 'INR',
          bio: '',
          avatarUrl: '',
          walletBalance: 500
        },
        {
          email: 'shubhamkush012@gmail.com',
          phone: '9876543210',
          name: 'Shubham',
          country: 'India',
          kycVerified: true,
          kycStatus: 'approved',
          preferredCurrency: 'INR',
          bio: 'Developer',
          avatarUrl: '',
          walletBalance: 2000
        }
      ];
      setKycVerifications(demoUsers);
      localStorage.setItem('kycVerifications', JSON.stringify(demoUsers));
    }
    
    // Load stored transactions
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      try {
        setTransactions(JSON.parse(storedTransactions));
      } catch (error) {
        console.error('Error parsing stored transactions:', error);
      }
    } else {
      // Initialize with demo transactions if none exist
      const demoTransactions: Transaction[] = [
        {
          id: 'tx1',
          date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          type: 'send',
          amount: 25,
          currency: 'USD',
          recipient: 'john.doe@example.com',
          status: 'completed'
        },
        {
          id: 'tx2',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          type: 'receive',
          amount: 50,
          currency: 'EUR',
          sender: 'jane.smith@example.com',
          status: 'completed'
        },
        {
          id: 'tx3',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
          type: 'send',
          amount: 75,
          currency: 'GBP',
          recipient: 'alice.johnson@example.com',
          status: 'completed'
        }
      ];
      setTransactions(demoTransactions);
      localStorage.setItem('transactions', JSON.stringify(demoTransactions));
    }
  }, []);

  // Save login state to localStorage whenever it changes
  useEffect(() => {
    console.log("Saving isLoggedIn:", isLoggedIn);
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    
    if (isLoggedIn && userPhoneOrEmail) {
      console.log("Saving userPhoneOrEmail:", userPhoneOrEmail);
      localStorage.setItem('userPhoneOrEmail', userPhoneOrEmail);
    } else if (!isLoggedIn) {
      // Clear local storage items on logout
      console.log("Clearing localStorage on logout");
      localStorage.removeItem('userPhoneOrEmail');
      localStorage.removeItem('user');
    }
  }, [isLoggedIn, userPhoneOrEmail]);
  
  // Save user data to localStorage whenever it changes
  useEffect(() => {
    console.log("User changed:", user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);
  
  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions]);
  
  // Function to handle logout
  const handleLogout = () => {
    console.log("Logging out user");
    // Disconnect wallet
    disconnectWallet();
    
    // Clear app state
    setIsLoggedIn(false);
    setUserPhoneOrEmail('');
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userPhoneOrEmail');
    localStorage.removeItem('user');
    localStorage.removeItem('walletConnected');
    
    console.log("User logged out successfully");
  };
  
  // Function to approve a KYC verification
  const approveKyc = (email: string) => {
    // Update the KYC verifications list
    setKycVerifications(prevVerifications => 
      prevVerifications.map(verification => 
        verification.email === email 
          ? { ...verification, kycStatus: 'approved', kycVerified: true } 
          : verification
      )
    );
    
    // If it's the current user, update their status too
    if (user && user.email === email) {
      setUser({ ...user, kycStatus: 'approved', kycVerified: true });
    }
  };
  
  // Function to reject a KYC verification
  const rejectKyc = (email: string) => {
    // Update the KYC verifications list
    setKycVerifications(prevVerifications => 
      prevVerifications.map(verification => 
        verification.email === email 
          ? { ...verification, kycStatus: 'rejected', kycVerified: false } 
          : verification
      )
    );
    
    // If it's the current user, update their status too
    if (user && user.email === email) {
      setUser({ ...user, kycStatus: 'rejected', kycVerified: false });
    }
  };

  // Function to add a new transaction
  const addTransaction = useCallback((transactionData: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      date: new Date().toISOString()
    };
    
    setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
    
    // Update user wallet balance if the user is the sender/recipient
    if (user && (
      (transactionData.type === 'send' && user.email === transactionData.sender) ||
      (transactionData.type === 'receive' && user.email === transactionData.recipient)
    )) {
      // Update user's wallet balance
      const newBalance = transactionData.type === 'send' 
        ? (user.walletBalance || 0) - transactionData.amount
        : (user.walletBalance || 0) + transactionData.amount;
      
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          walletBalance: newBalance
        };
      });
    }
    
    return newTransaction;
  }, [user, setUser]);

  const contextValue: AppContextType = {
    isLoggedIn,
    setIsLoggedIn,
    userPhoneOrEmail,
    setUserPhoneOrEmail,
    wallet: {
      wallet,
      error: null,
      loading: false,
      connection,
      connectWallet,
      disconnectWallet,
      refreshBalance,
      requestAirdrop
    },
    user,
    setUser,
    kycVerifications,
    setKycVerifications,
    approveKyc,
    rejectKyc,
    handleLogout,
    transactions,
    addTransaction
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
} 