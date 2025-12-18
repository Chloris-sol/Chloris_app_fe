// components/AdminNavbar.tsx
import React from 'react';
import { Leaf, Wallet, ShieldAlert } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export const AdminNavbar: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
  const { publicKey, connected } = useWallet();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-8 py-5">
      <div className="absolute inset-0 bg-[#050608]/80 backdrop-blur-md border-b border-white/5 shadow-lg"></div>
      <div className="relative z-10 flex justify-between items-center max-w-[1400px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className={`absolute inset-0 ${isAdmin ? 'bg-[#00FF94]' : 'bg-red-500' } blur-lg opacity-20 transition-opacity`}></div>
            
            <img src="/chloris-logo.png" alt="" className='h-6'/>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-[0.2em] text-white uppercase leading-none">
              Chloris <span className={isAdmin ? "text-[#00FF94]" : "text-red-500"}>Admin</span>
            </h1>
            <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase opacity-80">Terminal Access v1.0.4</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {isAdmin && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#00FF94]/10 border border-[#00FF94]/20 rounded-md">
              <ShieldAlert size={12} className="text-[#00FF94]" />
              <span className="text-[10px] font-mono text-[#00FF94]0 uppercase tracking-tighter">Authorized Session</span>
            </div>
          )}
          
          <WalletMultiButton className="!bg-transparent !border-none !p-0 !h-auto" 
          style={{
    background: 'transparent',
    border: 'none',
    padding: 0,
    height: 'auto'
  }}
  startIcon={undefined} >
            <div className={`px-5 py-2.5 ${isAdmin ?'bg-[#00FF94]' : 'bg-red-500' } clip-path-slant overflow-hidden`}>
              <div className="relative flex items-center gap-2 text-black font-black text-xs tracking-widest uppercase">
                <Wallet size={14} strokeWidth={3} />
                <span>{connected && publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : 'Connect'}</span>
              </div>
            </div>
          </WalletMultiButton>
        </div>
      </div>
    </nav>
  );
};