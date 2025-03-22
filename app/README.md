# CrossPay - Cross-Border Payments on Solana

A blockchain-based cross-border payment application built on Solana that allows users to send money across borders using only the recipient's email or phone number.

## Features

- Send money cross-border with just an email or phone number
- Automatic currency conversion with real-time exchange rates
- Fast transactions on Solana blockchain
- Low transaction fees
- No intermediaries required
- Secure and transparent transactions

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Blockchain**: Solana
- **Libraries**: 
  - `@solana/web3.js` - Solana JavaScript API
  - `@solana/spl-token` - For token operations
  - `@solana/wallet-adapter` - For wallet connections

## Prerequisites

- Node.js 14+ and npm installed
- Basic knowledge of Solana and blockchain
- Solana wallet (for development, we use a generated keypair)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/crosspay.git
   cd crosspay
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Development Environment

The application uses Solana's devnet for development purposes. When testing the application:

1. Connect your wallet
2. Request an airdrop (handled automatically during registration)
3. Register with your email or phone number
4. Start sending payments

## Project Structure

```
app/
├── public/              # Static files
├── solana/
│   └── programs/        # Solana programs and blockchain logic
├── src/
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── styles/          # CSS and styling files
│   ├── pages/           # Page components
│   ├── App.tsx          # Main application component
│   └── index.tsx        # Entry point
└── README.md            # This file
```

## How Cross-Border Payments Work

1. **User Registration**: Users register with their email or phone number and connect their Solana wallet.
2. **Send Money**: User enters recipient's email/phone, amount, and selects currencies for conversion.
3. **KYC Verification**: Both sender and recipient are verified (simulated in this demo).
4. **Currency Conversion**: Amount is converted using exchange rates.
5. **Blockchain Transaction**: Payment is executed on Solana blockchain using stablecoins.
6. **Recipient Notification**: Recipient is notified of the incoming payment.
7. **Transaction Confirmation**: Transaction is confirmed on the blockchain.

## Usage Example

```typescript
// Example of sending a cross-border payment
const senderInfo = {
  walletAddress: senderPublicKey,
  contactInfo: 'sender@example.com',
  country: 'US',
  currency: 'USD',
};

const payment = await sendPayment(
  senderInfo,
  'recipient@example.com',
  100, // amount
  'USD', // source currency
  'EUR', // target currency
  payerKeypair
);

console.log(`Payment completed with signature: ${payment}`);
```

## License

[MIT License](LICENSE) # Blockchain--Cross-border-payments-
# Blockchain--Cross-border-payments-
