import { useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { registerNewUser as registerNewUserOnChain } from '../utils/solana';
import { verifyKYC, findUserByContact } from '../solana/programs/CrossBorderPayment';

interface RegistrationState {
  isRegistering: boolean;
  isVerifying: boolean;
  isRegistered: boolean;
  isVerified: boolean;
  error: string | null;
}

interface UserRegistrationData {
  fullName: string;
  contact: string;
  isKYCVerified: boolean;
}

export const useUserRegistration = () => {
  const [registrationState, setRegistrationState] = useState<RegistrationState>({
    isRegistering: false,
    isVerifying: false,
    isRegistered: false,
    isVerified: false,
    error: null,
  });

  // Register a new user with contact info and wallet address
  const registerUser = useCallback(async (
    contactInfo: string,
    walletAddress: PublicKey,
    country: string,
    currency: string
  ) => {
    setRegistrationState({
      ...registrationState,
      isRegistering: true,
      error: null,
    });

    try {
      // Check if user already exists
      const existingUser = findUserByContact(contactInfo);
      if (existingUser) {
        setRegistrationState({
          ...registrationState,
          isRegistering: false,
          isRegistered: true,
          error: null,
        });
        return;
      }

      // Register the user
      registerNewUserOnChain(contactInfo, walletAddress, country, currency);

      setRegistrationState({
        ...registrationState,
        isRegistering: false,
        isRegistered: true,
        error: null,
      });
    } catch (error) {
      console.error('Error registering user:', error);
      setRegistrationState({
        ...registrationState,
        isRegistering: false,
        isRegistered: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      throw error;
    }
  }, [registrationState]);

  // Simplified method for Register component
  const registerNewUser = useCallback(async (userData: UserRegistrationData) => {
    setRegistrationState({
      ...registrationState,
      isRegistering: true,
      error: null,
    });

    try {
      // In a real app, this would call the blockchain
      console.log('Registering user:', userData);
      
      // Mock successful registration
      setTimeout(() => {
        setRegistrationState({
          ...registrationState,
          isRegistering: false,
          isRegistered: true,
          error: null,
        });
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      setRegistrationState({
        ...registrationState,
        isRegistering: false,
        isRegistered: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      throw error;
    }
  }, [registrationState]);

  // Verify KYC for a user
  const verifyUser = useCallback(async (
    contactInfo: string
  ) => {
    setRegistrationState({
      ...registrationState,
      isVerifying: true,
      error: null,
    });

    try {
      // Find user by contact info
      const user = findUserByContact(contactInfo);
      if (!user) {
        throw new Error(`User not found with contact info: ${contactInfo}`);
      }

      // Verify KYC
      const isVerified = await verifyKYC(user);

      setRegistrationState({
        ...registrationState,
        isVerifying: false,
        isVerified,
        error: null,
      });

      return isVerified;
    } catch (error) {
      console.error('Error verifying user:', error);
      setRegistrationState({
        ...registrationState,
        isVerifying: false,
        isVerified: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      throw error;
    }
  }, [registrationState]);

  // Reset registration state
  const resetRegistrationState = useCallback(() => {
    setRegistrationState({
      isRegistering: false,
      isVerifying: false,
      isRegistered: false,
      isVerified: false,
      error: null,
    });
  }, []);

  return {
    registrationState,
    registerUser,
    registerNewUser,
    verifyUser,
    resetRegistrationState,
  };
}; 