import { useState, useCallback } from 'react';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { processCrossBorderPayment } from '../utils/solana';
import { PaymentDetails, UserInfo, getExchangeRate, findUserByContact } from '../solana/programs/CrossBorderPayment';

interface PaymentState {
  isProcessing: boolean;
  transactionSignature: string | null;
  error: string | null;
}

export const usePayment = (connection: Connection | null, stablecoinMint: PublicKey | null) => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isProcessing: false,
    transactionSignature: null,
    error: null,
  });

  // Calculate exchange rate between currencies
  const calculateExchange = useCallback((sourceCurrency: string, targetCurrency: string, amount: number) => {
    const rate = getExchangeRate(sourceCurrency, targetCurrency);
    const convertedAmount = amount * rate;
    return {
      rate,
      convertedAmount,
    };
  }, []);

  // Send payment using recipient's contact info (email or phone)
  const sendPayment = useCallback(async (
    senderInfo: UserInfo,
    recipientContact: string,
    amount: number,
    sourceCurrency: string,
    targetCurrency: string,
    payerKeypair: Keypair
  ) => {
    if (!connection || !stablecoinMint) {
      setPaymentState({
        isProcessing: false,
        transactionSignature: null,
        error: 'Connection or stablecoin mint not initialized',
      });
      return;
    }

    setPaymentState({
      isProcessing: true,
      transactionSignature: null,
      error: null,
    });

    try {
      // Check if recipient exists
      const recipient = findUserByContact(recipientContact);
      if (!recipient) {
        throw new Error(`Recipient not found with contact info: ${recipientContact}`);
      }

      // Prepare payment details
      const paymentDetails: PaymentDetails = {
        sender: senderInfo,
        recipient: recipientContact,
        amount,
        sourceCurrency,
        targetCurrency,
      };

      // Process the payment
      const signature = await processCrossBorderPayment(
        connection,
        payerKeypair,
        stablecoinMint,
        paymentDetails
      );

      setPaymentState({
        isProcessing: false,
        transactionSignature: signature,
        error: null,
      });

      return signature;
    } catch (error) {
      console.error('Error sending payment:', error);
      setPaymentState({
        isProcessing: false,
        transactionSignature: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      throw error;
    }
  }, [connection, stablecoinMint]);

  // Reset payment state
  const resetPaymentState = useCallback(() => {
    setPaymentState({
      isProcessing: false,
      transactionSignature: null,
      error: null,
    });
  }, []);

  return {
    paymentState,
    calculateExchange,
    sendPayment,
    resetPaymentState,
  };
}; 