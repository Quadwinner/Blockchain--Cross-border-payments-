import { Connection, clusterApiUrl, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { CrossBorderPayment, PaymentDetails, UserInfo, registerUser } from '../solana/programs/CrossBorderPayment';

// Connection to Solana network - using devnet for development
export const getConnection = (): Connection => {
  return new Connection(clusterApiUrl('devnet'), 'confirmed');
};

// Initialize a stablecoin mint for the application
export const initializeStablecoin = async (
  connection: Connection,
  payerKeypair: Keypair
): Promise<PublicKey> => {
  try {
    const mintAuthority = payerKeypair.publicKey;
    return await CrossBorderPayment.createStablecoin(
      connection,
      payerKeypair,
      mintAuthority
    );
  } catch (error) {
    console.error('Error initializing stablecoin:', error);
    throw error;
  }
};

// Process a cross-border payment
export const processCrossBorderPayment = async (
  connection: Connection,
  payerKeypair: Keypair,
  stablecoinMint: PublicKey,
  paymentDetails: PaymentDetails
): Promise<string> => {
  try {
    const payment = new CrossBorderPayment(connection, stablecoinMint);
    return await payment.processPayment(payerKeypair, paymentDetails);
  } catch (error) {
    console.error('Error processing cross-border payment:', error);
    throw error;
  }
};

// Generate a keypair from a private key if available, or create a new one
export const getOrCreateKeypair = (privateKey?: Uint8Array): Keypair => {
  if (privateKey) {
    return Keypair.fromSecretKey(privateKey);
  }
  return Keypair.generate();
};

// Register a user with their contact information
export const registerNewUser = (
  contactInfo: string,
  walletAddress: PublicKey,
  country: string,
  currency: string
): void => {
  const userInfo: UserInfo = {
    walletAddress,
    contactInfo,
    country,
    currency
  };
  registerUser(contactInfo, userInfo);
  console.log(`User registered with contact: ${contactInfo}`);
}; 