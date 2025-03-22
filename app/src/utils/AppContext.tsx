import React, { createContext, useContext, useState, useEffect } from 'react';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { useWallet } from '../hooks/useWallet';
import { usePayment } from '../hooks/usePayment';
import { useUserRegistration } from '../hooks/useUserRegistration';
import { initializeStablecoin } from './solana';

interface AppContextType {
  loading: boolean;
  walletState: {
    connected: boolean;
    publicKey: PublicKey | null;
    balance: number;
    keypair: Keypair | null;
    walletName: string | null;
  };
  connection: Connection | null;
  stablecoinMint: PublicKey | null;
  connectWallet: (walletType?: 'phantom' | 'local', privateKey?: Uint8Array) => Promise<PublicKey | undefined>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  requestAirdrop: (amount?: number) => Promise<string | undefined>;
  getAvailableWallets: () => { name: string; icon: string; }[];
  paymentFunctions: {
    paymentState: {
      isProcessing: boolean;
      transactionSignature: string | null;
      error: string | null;
    };
    calculateExchange: (sourceCurrency: string, targetCurrency: string, amount: number) => {
      rate: number;
      convertedAmount: number;
    };
    sendPayment: (
      senderInfo: any,
      recipientContact: string,
      amount: number,
      sourceCurrency: string,
      targetCurrency: string,
      payerKeypair: Keypair
    ) => Promise<string | undefined>;
    resetPaymentState: () => void;
  };
  registrationFunctions: {
    registrationState: {
      isRegistering: boolean;
      isVerifying: boolean;
      isRegistered: boolean;
      isVerified: boolean;
      error: string | null;
    };
    registerUser: (
      contactInfo: string,
      walletAddress: PublicKey,
      country: string,
      currency: string
    ) => Promise<void>;
    verifyUser: (contactInfo: string) => Promise<boolean | undefined>;
    resetRegistrationState: () => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stablecoinMint, setStablecoinMint] = useState<PublicKey | null>(null);

  const {
    wallet: walletState,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    requestAirdrop,
    connection,
  } = useWallet();

  const paymentFunctions = usePayment(connection, stablecoinMint);
  const registrationFunctions = useUserRegistration();

  // Initialize stablecoin when wallet is connected
  useEffect(() => {
    const setup = async () => {
      if (connection && walletState.connected && walletState.keypair) {
        setLoading(true);
        try {
          // Check if stablecoin mint already exists, otherwise create a new one
          if (!stablecoinMint) {
            const mint = await initializeStablecoin(connection, walletState.keypair);
            setStablecoinMint(mint);
          }
        } catch (error) {
          console.error('Error initializing stablecoin:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    setup();
  }, [connection, walletState.connected, walletState.keypair, stablecoinMint]);

  return (
    <AppContext.Provider
      value={{
        loading,
        walletState,
        connection,
        stablecoinMint,
        connectWallet,
        disconnectWallet,
        refreshBalance,
        requestAirdrop,
        getAvailableWallets: () => [
          { name: 'Phantom', icon: 'https://www.phantom.app/img/logo.png' },
          { name: 'Demo Wallet', icon: '' }
        ],
        paymentFunctions,
        registrationFunctions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 