import { useState, useEffect, useCallback } from 'react';
import { PublicKey, Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';

// Define the window with Phantom extension
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAllTransactions: (transactions: any[]) => Promise<any[]>;
      request: (request: any) => Promise<any>;
    };
  }
}

interface WalletState {
  connected: boolean;
  publicKey: PublicKey | null;
  balance: number;
  keypair: Keypair | null;
  walletName: string | null;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    publicKey: null,
    balance: 0,
    keypair: null,
    walletName: null,
  });

  const [connection, setConnection] = useState<Connection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize connection to Solana network
  useEffect(() => {
    try {
      const conn = new Connection(clusterApiUrl('devnet'), 'confirmed');
      setConnection(conn);
    } catch (err) {
      console.error('Failed to connect to Solana network:', err);
      setError('Failed to connect to Solana network');
    }
  }, []);

  // Get balance for a public key
  const getBalanceForPubKey = useCallback(async (pubKey: PublicKey): Promise<number> => {
    if (!connection) return 0;
    try {
      const balance = await connection.getBalance(pubKey);
      return balance;
    } catch (err) {
      console.error('Failed to get balance:', err);
      return 0;
    }
  }, [connection]);

  // Connect to wallet (with Phantom as primary option)
  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Phantom is available
      const isPhantomInstalled = window.solana && window.solana.isPhantom;
      
      if (isPhantomInstalled && window.solana) {
        console.log("Connecting to Phantom wallet...");
        try {
          // Connect to Phantom
          const { publicKey } = await window.solana.connect();
          console.log("Connected to Phantom wallet:", publicKey.toString());
          
          // Get balance
          const balance = await getBalanceForPubKey(publicKey);
          
          // Update wallet state
          setWallet({
            connected: true,
            publicKey: publicKey,
            balance: balance / LAMPORTS_PER_SOL,
            keypair: null,
            walletName: 'Phantom Wallet'
          });
          
          localStorage.setItem('walletConnected', 'true');
          
          return publicKey;
        } catch (phantomError) {
          console.error("Error connecting to Phantom:", phantomError);
          // Fall back to demo wallet if Phantom connection fails
          console.log("Falling back to demo wallet");
          return connectDemoWallet();
        }
      } else {
        console.log("Phantom wallet not installed, using demo wallet");
        return connectDemoWallet();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet');
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [connection, getBalanceForPubKey]);

  // Connect to a demo wallet
  const connectDemoWallet = useCallback(async () => {
    try {
      // Create a demo wallet with a deterministic key 
      const demoWalletKey = new Uint8Array(32).fill(0);
      demoWalletKey[0] = 1; // Make it deterministic but not all zeros
      
      const pubKey = new PublicKey(demoWalletKey);
      const balance = await getBalanceForPubKey(pubKey);
      
      setWallet({
        connected: true,
        publicKey: pubKey,
        balance: balance / LAMPORTS_PER_SOL, // Convert lamports to SOL
        keypair: null,
        walletName: 'Demo Wallet'
      });
      
      localStorage.setItem('walletConnected', 'true');
      
      return pubKey;
    } catch (error) {
      console.error('Error connecting demo wallet:', error);
      throw error;
    }
  }, [getBalanceForPubKey]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      // If connected to Phantom, disconnect from it
      if (wallet.walletName === 'Phantom Wallet' && window.solana) {
        await window.solana.disconnect();
      }
      
      setWallet({
        connected: false,
        publicKey: null,
        balance: 0,
        keypair: null,
        walletName: null,
      });
      
      localStorage.removeItem('walletConnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }, [wallet.walletName]);

  // Refresh wallet balance
  const refreshBalance = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey || !connection) return;
    
    try {
      setLoading(true);
      const balance = await connection.getBalance(wallet.publicKey);
      
      setWallet(prev => ({
        ...prev,
        balance: balance / LAMPORTS_PER_SOL, // Convert lamports to SOL
      }));
    } catch (error) {
      console.error('Error refreshing balance:', error);
      setError('Failed to refresh balance');
    } finally {
      setLoading(false);
    }
  }, [wallet.connected, wallet.publicKey, connection]);

  // Airdrop SOL to wallet for testing on devnet
  const requestAirdrop = useCallback(async (amount = 1): Promise<string | undefined> => {
    if (!wallet.connected || !wallet.publicKey || !connection) {
      setError('Wallet not connected');
      return undefined;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const signature = await connection.requestAirdrop(
        wallet.publicKey,
        amount * LAMPORTS_PER_SOL
      );
      
      await connection.confirmTransaction(signature, 'confirmed');
      await refreshBalance();
      
      return signature;
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      setError('Airdrop failed. Try again later.');
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [wallet.connected, wallet.publicKey, connection, refreshBalance]);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const isConnected = localStorage.getItem('walletConnected') === 'true';
    if (isConnected) {
      connectWallet();
    }
  }, [connectWallet]);

  return {
    wallet,
    error,
    loading,
    connection,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    requestAirdrop
  };
}; 