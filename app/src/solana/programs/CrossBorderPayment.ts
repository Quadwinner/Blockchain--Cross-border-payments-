import {
  Keypair,
  PublicKey,
  Transaction,
  Connection,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getMint,
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from '@solana/spl-token';

export interface UserInfo {
  walletAddress: PublicKey;
  contactInfo: string; // email or phone number
  country: string;
  currency: string;
}

export interface PaymentDetails {
  sender: UserInfo;
  recipient: string; // email or phone number
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
}

// Mock function to get exchange rates
export const getExchangeRate = (sourceCurrency: string, targetCurrency: string): number => {
  // In a production app, this would call an external API for real-time exchange rates
  const mockRates: Record<string, Record<string, number>> = {
    'USD': { 'EUR': 0.91, 'GBP': 0.77, 'JPY': 149.5 },
    'EUR': { 'USD': 1.10, 'GBP': 0.85, 'JPY': 164.3 },
    'GBP': { 'USD': 1.30, 'EUR': 1.18, 'JPY': 193.6 },
    'JPY': { 'USD': 0.0067, 'EUR': 0.0061, 'GBP': 0.0052 }
  };
  
  return mockRates[sourceCurrency]?.[targetCurrency] || 1;
};

// Mock function to simulate KYC verification
export const verifyKYC = async (userInfo: UserInfo): Promise<boolean> => {
  // In a production app, this would call an actual KYC service
  console.log(`Verifying KYC for user from ${userInfo.country}`);
  return true;
};

// User registry to look up wallet addresses by contact info
const userRegistry: Record<string, UserInfo> = {};

// Add a demo user for shubhamkush012@gmail.com
const demoRecipientKeyPair = Keypair.generate();
userRegistry['shubhamkush012@gmail.com'] = {
  walletAddress: demoRecipientKeyPair.publicKey,
  contactInfo: 'shubhamkush012@gmail.com',
  country: 'IN',
  currency: 'INR',
};

export const registerUser = (contactInfo: string, userInfo: UserInfo): void => {
  userRegistry[contactInfo] = userInfo;
};

export const findUserByContact = (contactInfo: string): UserInfo | null => {
  if (!contactInfo) return null;
  return userRegistry[contactInfo] || null;
};

export class CrossBorderPayment {
  private connection: Connection;
  private stablecoinMint: PublicKey;

  constructor(connection: Connection, stablecoinMint: PublicKey) {
    this.connection = connection;
    this.stablecoinMint = stablecoinMint;
  }

  // Create a new stablecoin mint (for demo purposes)
  static async createStablecoin(
    connection: Connection,
    payer: Keypair,
    mintAuthority: PublicKey,
    decimals = 6
  ): Promise<PublicKey> {
    const mint = await createMint(
      connection,
      payer,
      mintAuthority,
      mintAuthority, // freeze authority
      decimals,
      undefined,
      { commitment: 'confirmed' },
      TOKEN_PROGRAM_ID
    );
    console.log(`Created new stablecoin mint: ${mint.toBase58()}`);
    return mint;
  }

  // Process a cross-border payment
  async processPayment(
    payer: Keypair,
    paymentDetails: PaymentDetails
  ): Promise<string> {
    try {
      // Step 1: Verify KYC for both parties
      const senderVerified = await verifyKYC(paymentDetails.sender);
      if (!senderVerified) {
        throw new Error('Sender KYC verification failed');
      }

      // Step 2: Find recipient by contact info
      const recipient = findUserByContact(paymentDetails.recipient);
      if (!recipient) {
        throw new Error(`Recipient not found with contact info: ${paymentDetails.recipient}`);
      }

      const recipientVerified = await verifyKYC(recipient);
      if (!recipientVerified) {
        throw new Error('Recipient KYC verification failed');
      }

      // Step 3: Calculate exchange rate and converted amount
      const exchangeRate = getExchangeRate(
        paymentDetails.sourceCurrency,
        paymentDetails.targetCurrency
      );
      const convertedAmount = paymentDetails.amount * exchangeRate;

      console.log(`Converting ${paymentDetails.amount} ${paymentDetails.sourceCurrency} to ${convertedAmount} ${paymentDetails.targetCurrency} at rate ${exchangeRate}`);

      // Step 4: Get or create token accounts for sender and recipient
      const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        payer,
        this.stablecoinMint,
        paymentDetails.sender.walletAddress
      );

      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        payer,
        this.stablecoinMint,
        recipient.walletAddress
      );

      // Step 5: Create and send the transaction
      const transaction = new Transaction().add(
        createTransferInstruction(
          senderTokenAccount.address,
          recipientTokenAccount.address,
          paymentDetails.sender.walletAddress,
          convertedAmount * Math.pow(10, 6), // Convert to token units with 6 decimal places
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Add a memo to store payment details on-chain
      const memoData = `Payment: ${paymentDetails.amount} ${paymentDetails.sourceCurrency} to ${paymentDetails.targetCurrency} | Recipient: ${paymentDetails.recipient}`;
      
      // Send the transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [payer],
        { commitment: 'confirmed' }
      );

      console.log(`Payment completed with signature: ${signature}`);
      return signature;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
} 