import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import '@solana/wallet-adapter-react-ui/styles.css';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const wallets = [new PhantomWalletAdapter()];

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConnectionProvider endpoint="https://api.devnet.solana.com">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}


createRoot(document.getElementById('root')!).render(
    <SolanaProvider>
      <App />
    </SolanaProvider>
)
