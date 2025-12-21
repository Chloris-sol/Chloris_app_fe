import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Leaf, Wallet, Trophy, type LucideIcon,
  Wind, Activity, Zap, Globe, Trees, Cpu, Lock, X,  CheckCircle, ExternalLink, Info,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useChlorisVault } from '../solana/hooks/useChlorisVault';
import { useNCTPriceInSOL } from '../solana/hooks/prices';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import solanaLogo from "../assets/solana-logo.png"

type ToastType = "success" | "info" | "error";

interface Toast {
  id: number;
  title: string;
  message: string;
  type: ToastType;
}

type WalletAddress = string | null;

type MilestoneType = "DEPOSIT" | "CARBON";

interface Milestone {
  id: number;
  title: string;
  type: MilestoneType;
  value?: number;
  threshold: string;
  locked: boolean;
}

// --- THEME & UTILITIES ---
const glassStyle = "bg-[#111216]/60 backdrop-blur-2xl border border-white/10 shadow-2xl";

// --- COMPONENTS ---

// 1. TOAST NOTIFICATION SYSTEM
const ToastContainer: React.FC<{ toasts: Toast[] }> = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.9 }}
          className="pointer-events-auto bg-[#1A1B20] border-l-4 border-[#00FF94] text-white p-4 rounded shadow-2xl flex items-center gap-3 min-w-[300px]"
        >
          {toast.type === 'success' && <CheckCircle size={20} className="text-[#00FF94]" />}
          {toast.type === 'info' && <Activity size={20} className="text-blue-400" />}
          {toast.type === 'error' && <X size={20} className="text-red-500" />}
          <div>
            <h4 className="font-bold text-sm">{toast.title}</h4>
            <p className="text-xs text-gray-400">{toast.message}</p>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// 2. NAVBAR
const Navbar: React.FC = () => {
    const { publicKey, connected } = useWallet();
  return (
  <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-8 py-5 transition-all duration-300">
    <div className="absolute inset-0 bg-[#050608]/80 backdrop-blur-md border-b border-white/5 shadow-lg"></div>

    <div className="relative z-10 flex justify-between items-center max-w-[1400px] mx-auto w-full">
      <div className="flex items-center gap-3">
        <div className="relative group cursor-pointer">
        <div className="absolute inset-0 bg-[#00FF94] blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <img src="/chloris-logo.png" alt="" className='h-6'/>
        </div>
        <div className="flex flex-col">
          <img src="/chloris-text.png" alt="" className='h-3'/>
          <span className="text-[9px] text-[#00FF94] font-mono tracking-widest uppercase opacity-80">Beta v1.0.4</span>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        {/* <div className="hidden md:flex gap-8 text-[10px] font-mono tracking-widest text-gray-400 uppercase">
          {['Dashboard', 'Mechanism', 'Docs', 'Governance'].map((item) => (
            <span key={item} className="hover:text-[#00FF94] cursor-pointer transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(0,255,148,0.5)]">
              {item}
            </span>
          ))}
        </div> */}
        
         <WalletMultiButton 
  className="!bg-transparent !border-none !p-0 !h-auto !rounded-none"
  style={{
    background: 'transparent',
    border: 'none',
    padding: 0,
    height: 'auto'
  }}
  startIcon={undefined} 
>
  <div className="group relative px-5 py-2.5 bg-[#00FF94] hover:bg-[#00cc76] transition-all duration-300 clip-path-slant overflow-hidden">
    <div className="absolute inset-0 border border-[#00FF94] translate-x-0.5 translate-y-0.5 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
    <div className="relative flex items-center gap-2 text-black font-black text-xs tracking-widest uppercase">
      <Wallet size={14} strokeWidth={3} />
       <span>
            {connected && publicKey 
              ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` 
              : 'Connect Wallet'}
          </span>
    </div>
  </div>
</WalletMultiButton>
      </div>
    </div>
  </nav>
)};

// 3. DEPOSIT VAULT
const DepositVault: React.FC<{
  addToast: (title: string, message: string, type?: ToastType) => void;
  walletAddress: WalletAddress;
  userSolBalance: number;
  phase: string | null;
  depositedSol: number;
  estimatedYieldSol: number;
  onDeposit: (amount: number) => Promise<void>;
  onClaim: () => Promise<void>;
  refresh: () => void;
  loading: boolean;
  userState: any;
  apy?: number;
}> = ({ addToast, walletAddress, userSolBalance, phase, depositedSol, estimatedYieldSol, onDeposit, onClaim, refresh, loading, apy }) => {
  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  const handleDeposit = async () => {
    if (!walletAddress) {
      addToast('Error', 'Please connect your wallet first.', 'error');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      addToast('Invalid Amount', 'Please enter a value greater than 0.', 'error');
      return;
    }
    if (parseFloat(amount) > userSolBalance) {
      addToast('Insufficient Balance', 'You do not have enough SOL.', 'error');
      return;
    }
    
    setIsDepositing(true);
    try {
      await onDeposit(parseFloat(amount));
      setAmount('');
      addToast('Deposit Successful', `You have staked ${amount} SOL.`, 'success');
    } catch (error: any) {
      addToast('Deposit Failed', error.message || 'Transaction failed', 'error');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleClaim = async () => {
    try {
      await onClaim();
      addToast('Claim Successful', 'Your rewards have been claimed!', 'success');
    } catch (error: any) {
      addToast('Claim Failed', error.message || 'Transaction failed', 'error');
    }
  };

  const setMax = () => setAmount(Math.max(0, userSolBalance - 0.01).toFixed(4));

  const isDepositPhase = phase === 'deposit';
  const isClaimingPhase = phase === 'claiming';

  return (
    <div className={`${glassStyle} h-full rounded-2xl p-8 md:p-10 flex flex-col relative group hover:border-[#00FF94]/30 transition-all duration-500`}>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-[#9945FF] to-[#14F195] opacity-0 group-hover:opacity-5 transition-opacity duration-1000 pointer-events-none rounded-2xl`}></div>

      <div className="relative z-10 mb-8 flex justify-between items-start">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00FF94]/10 text-[#00FF94] border border-[#00FF94]/20 text-[10px] font-mono uppercase tracking-widest rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse"></div> 
                {phase === 'deposit' ? 'Deposit Phase' : phase === 'investing' ? 'Investing' : 'Claim Phase'}
              </span>
              <span className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">V2 Pool</span>
           </div>
           <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-1">
            Solana <span className={`text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#14F195]`}>Vault</span>
           </h2>
        </div>
        <button className="p-3 text-gray-500 hover:text-white transition rounded-full hover:bg-white/5" onClick={refresh}>
            <RefreshCcw
                size={22}
            />
        </button>
      </div>

        <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
            <div className="bg-[#0A0A0A]/40 backdrop-blur-md p-4 rounded-xl border border-white/5 flex flex-col justify-between h-24">
                <div className="flex justify-between items-start">
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">Net APY</p>
                    <Info size={12} className="text-gray-600" />
                </div>
                <p className="text-3xl font-black text-white">{apy ? apy : '14'}%</p>
            </div>
            <div className="bg-[#0A0A0A]/40 backdrop-blur-md p-4 rounded-xl border border-white/5 flex flex-col justify-between h-24">
                <div className="flex justify-between items-start">
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">Your Deposit</p>
                    <Wallet size={12} className="text-gray-600" />
                </div>
                <p className="text-3xl font-black text-[#00FF94]">{depositedSol.toFixed(2)} SOL</p>
            </div>
            {!isDepositPhase && (
                <div className="bg-[#0A0A0A]/40 backdrop-blur-md p-4 col-span-2 rounded-xl border border-white/5 flex flex-col justify-between h-24">
                    <div className="flex justify-between items-start">
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest">Est. Rewards</p>
                        <Leaf size={12} className="text-[#00FF94]" />
                    </div>
                    <p className="text-3xl font-black text-[#00FF94]">{estimatedYieldSol.toFixed(2)} SOL</p>
                </div>
            )}
        </div>
      {/* <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        <div className="bg-[#0A0A0A]/40 backdrop-blur-md p-4 rounded-xl border border-white/5 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
             <p className="text-gray-500 text-[10px] uppercase tracking-widest">Your Deposit</p>
             <Wallet size={12} className="text-gray-600" />
          </div>
          <p className="text-3xl font-black text-white">{depositedSol.toFixed(2)} SOL</p>
        </div>
        <div className="bg-[#0A0A0A]/40 backdrop-blur-md p-4 rounded-xl border border-white/5 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
               <p className="text-gray-500 text-[10px] uppercase tracking-widest">Est. Rewards</p>
               <Leaf size={12} className="text-[#00FF94]" />
            </div>
            <p className="text-3xl font-black text-[#00FF94]">{estimatedYieldSol.toFixed(2)} SOL</p>
        </div>
      </div> */}

      {isDepositPhase ? (
        <div className="mt-auto bg-[#050608]/80 backdrop-blur-md rounded-xl p-1 border border-white/10 relative z-10 shadow-inner">
          <div className="bg-[#111216] rounded-lg p-5 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wide">You Deposit</label>
                  <div className="flex items-center gap-2">
                      <Wallet size={12} className="text-gray-500"/>
                      <span className="text-xs text-gray-400 font-mono">{userSolBalance.toFixed(4)} SOL</span>
                      <button onClick={setMax} className="text-[10px] bg-[#00FF94]/10 text-[#00FF94] px-2 py-0.5 rounded border border-[#00FF94]/30 hover:bg-[#00FF94] hover:text-black transition uppercase font-bold">Max</button>
                  </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                 <div className="flex items-center justify-center gap-1.5 bg-[#2A2B30] px-4 py-2 rounded-full font-bold border border-white/10 shadow-lg">
                      <div className={`flex items-center justify-center`}>
                          <img src={solanaLogo} alt="Solana Logo" className='w-4'/>
                      </div>
                      <span className="text-lg">SOL</span>
                  </div>
                 <div className="flex-1 text-right">
                     <input 
                       type="text" 
                       value={amount}
                       onChange={(e) => { const val = e.target.value; if (/^\d*\.?\d*$/.test(val)) setAmount(val); }}
                       placeholder="0.00" 
                       className="w-full bg-transparent text-right text-4xl font-bold text-white outline-none placeholder-gray-700"
                     />
                     <div className="text-xs text-gray-500 font-mono mt-1">≈ ${(amount ? parseFloat(amount) * 145 : 0).toFixed(2)} USD</div>
                 </div>
              </div>
          </div>
          <button 
            onClick={handleDeposit} 
            disabled={isDepositing || loading || !walletAddress} 
            className={`w-full mt-2 font-black uppercase tracking-[0.2em] py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              isDepositing || loading ? 'bg-gray-700 text-gray-400 cursor-wait' : 
              !walletAddress ? 'bg-gray-700 text-gray-400 cursor-not-allowed' :
              'bg-[#00FF94] hover:bg-[#00cc76] text-black hover:shadow-[0_0_20px_rgba(0,255,148,0.4)]'
            }`}
          >
            {isDepositing || loading ? <><Activity size={18} className="animate-spin" /> Processing...</> : <>Deposit SOL</>}
          </button>
        </div>
      ) : (
        <div className="mt-auto bg-[#050608]/80 backdrop-blur-md rounded-xl p-6 border border-white/10 relative z-10 shadow-inner">
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm mb-2">
              {phase === 'investing' ? 'Your funds are being invested...' : 'Your rewards are ready to claim!'}
            </p>
            <div className="flex items-center justify-center gap-2 text-[#00FF94] font-mono text-xs">
              <Activity size={14} className={phase === 'investing' ? 'animate-spin' : ''} />
              <span className="uppercase tracking-widest">
                {phase === 'investing' ? 'Generating Yield' : 'Claim Available'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleClaim} 
            disabled={!isClaimingPhase || loading}
            className={`w-full font-black uppercase tracking-[0.2em] py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              !isClaimingPhase || loading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' :
              'bg-[#00FF94] hover:bg-[#00cc76] text-black hover:shadow-[0_0_20px_rgba(0,255,148,0.4)]'
            }`}
          >
            {loading ? <><Activity size={18} className="animate-spin" /> Processing...</> : 
             !isClaimingPhase ? <>Claim Unavailable</> : <>Claim Rewards</>}
          </button>
        </div>
      )}
    </div>
  );
};

// 4. STAT CARD
const StatCard: React.FC<{
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  highlight?: boolean;
}> = ({ label, value, sub, icon: Icon, highlight = false }) => (
  <div className={`
    ${glassStyle} p-6 rounded-xl flex flex-col justify-between group transition-all duration-300
    ${highlight ? 'border-[#00FF94]/50 shadow-[0_0_20px_rgba(0,255,148,0.1)]' : 'hover:border-white/20'}
  `}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${highlight ? 'bg-[#00FF94]/20 text-[#00FF94]' : 'bg-white/5 text-gray-400'} group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      {highlight && <div className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse shadow-[0_0_10px_#00FF94]"></div>}
    </div>
    <div>
      <div className="text-3xl font-black uppercase tracking-tighter mb-1 text-white">{value}</div>
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="text-[10px] font-mono text-[#00FF94] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">{sub}</span>
      </div>
    </div>
  </div>
);

// 5. SYNAPSE TERMINAL
const SynapseTerminal = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState([
    { id: 1, text: "INITIALIZING_SYNAPSE_PROTOCOL..." },
    { id: 2, text: "CONNECTED_TO_MAINNET_BETA..." }
  ]);

  const steps = [
    { id: 0, label: "User Injection", code: "DEPOSIT_SOL", icon: Wallet },
    { id: 1, label: "Neural Routing", code: "AI_AGENT", icon: Cpu },
    { id: 2, label: "Yield Synthesis", code: "VALIDATOR", icon: Zap },
    { id: 3, label: "Carbon Burn", code: "OFFSET_TX", icon: Leaf },
  ];

  const randHex = () => Math.random().toString(16).substr(2, 6).toUpperCase();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        const next = (prev + 1) % 4;

        let newMsg = "";
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }) + "." + Math.floor(Math.random() * 999);
        
        switch(next) {
            case 0: newMsg = `[${time}] DETECTED_INJECTION // SOL_AMT: ${Math.floor(Math.random() * 500)}.${Math.floor(Math.random() * 99)}`; break;
            case 1: newMsg = `[${time}] AI_ROUTE_OPTIMIZE // PATH: 0x${randHex()}`; break;
            case 2: newMsg = `[${time}] YIELD_HARVEST // APY_CALC: 8.5%`; break;
            case 3: newMsg = `[${time}] OFFSET_EXECUTE // BURN_HASH: 0x${randHex()}...`; break;
            default: newMsg = `[${time}] SYSTEM_IDLE...`;
        }

        setLogs(prevLogs => {
            const newLogs = [...prevLogs, { id: Date.now(), text: newMsg }];
            return newLogs.slice(-6);
        });

        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${glassStyle} rounded-2xl p-6 h-full flex flex-col relative overflow-hidden group hover:border-[#00FF94]/30 transition-all duration-500`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF94] opacity-[0.03] blur-[100px] pointer-events-none"></div>

      <div className="mb-6 relative z-10 flex justify-between items-start">
        <div>
           <h3 className="text-[#00FF94] font-mono text-xs tracking-widest uppercase mb-2">&gt;&gt; Live Execution</h3>
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-lg">
             Synapse <br/> Flow
           </h2>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse"></div>
            <span className="text-[9px] font-mono text-[#00FF94] uppercase tracking-wider">Online</span>
        </div>
      </div>

      <div className="relative flex-1 pl-2 mb-4 min-h-[220px]">
        <div className="absolute left-[1.25rem] top-5 bottom-5 w-[2px] bg-[#1A1B20] -translate-x-1/2 z-0">
            <motion.div 
                className="w-full bg-[#00FF94] shadow-[0_0_15px_#00FF94]"
                initial={{ height: "0%" }}
                animate={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>

        <div className="flex flex-col justify-between h-full relative z-10">
          {steps.map((step, idx) => {
            const isActive = idx === activeStep;
            const isCompleted = idx < activeStep;
            return (
              <div key={idx} className="flex items-center gap-6 group/item">
                <div className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10
                  ${isActive ? 'bg-black border-[#00FF94] shadow-[0_0_20px_rgba(0,255,148,0.6)] scale-110' : ''}
                  ${isCompleted ? 'bg-[#00FF94] border-[#00FF94] text-black scale-100' : ''}
                  ${!isActive && !isCompleted ? 'bg-[#0A0A0A] border-white/10 text-gray-700' : ''}
                `}>
                  <step.icon size={16} className={`transition-colors duration-300 ${isActive ? 'text-[#00FF94]' : isCompleted ? 'text-black' : 'text-gray-600'}`} />
                  {isActive && <div className="absolute inset-0 rounded-full border border-[#00FF94] animate-ping opacity-50"></div>}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold uppercase tracking-wide transition-colors duration-300 ${isActive || isCompleted ? 'text-white' : 'text-gray-600'}`}>
                    {step.label}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 bg-black/50 border border-white/10 rounded-lg p-3 h-32 overflow-hidden relative shadow-inner">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#00FF94]/20"></div>
          <div className="font-mono text-[10px] leading-relaxed">
             <AnimatePresence>
                 {logs.map((log) => (
                     <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[#00FF94]"
                     >
                        <span className="opacity-50 mr-2">&gt;</span>
                        {log.text}
                     </motion.div>
                 ))}
             </AnimatePresence>
             <motion.div 
                animate={{ opacity: [0, 1, 0] }} 
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-3 bg-[#00FF94] ml-1 align-middle"
             />
          </div>
      </div>

    </div>
  );
};

// 6. IMPACT CARDS
const ImpactCard: React.FC<{
  item: Milestone;
  onClick: (item: Milestone) => void;
}> = ({ item, onClick }) => (
  <motion.div 
    layoutId={`card-${item.id}`} 
    onClick={() => !item.locked && onClick(item)}
    whileHover={!item.locked ? { y: -5 } : {}}
    className={`
      ${glassStyle} rounded-xl aspect-[3/4] flex flex-col items-center justify-center p-6 text-center cursor-pointer group relative overflow-hidden
      ${item.locked ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:border-[#00FF94]/50 hover:shadow-[0_0_30px_rgba(0,255,148,0.15)]'}
    `}
  >
    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
    <div className="relative z-10 pointer-events-none flex flex-col items-center">
        <Trophy size={40} className={`mb-4 drop-shadow-md ${item.locked ? 'text-gray-600' : 'text-[#00FF94]'}`} />
        <h4 className="text-white font-bold uppercase tracking-wide text-sm mb-2">{item.title}</h4>
        <div className="inline-block px-2 py-1 bg-black/40 border border-white/10 text-[10px] font-mono text-gray-400 backdrop-blur-sm rounded">
            {item.threshold}
        </div>
    </div>
    {item.locked && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px] rounded-xl z-10">
            <Lock size={30} className="text-gray-300" />
        </div>
    )}
  </motion.div>
);



const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-500 uppercase tracking-wider text-[10px]">
      {label}
    </span>
    <span className="text-white font-bold text-sm">{value}</span>
  </div>
);
const CardModal: React.FC<{
  item: Milestone;
  userState: any;
  userNctContribution: number;
  depositedSol: number; 
  onClose: () => void;
  autoFlip?: boolean;
}> = ({ item,  userNctContribution,depositedSol,  onClose, autoFlip = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { priceInSOL: nctPriceInSOL, loading: nctLoading } = useNCTPriceInSOL();
  const [canFlip, setCanFlip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanFlip(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (autoFlip && canFlip && !isFlipped) {
      const timer = setTimeout(() => setIsFlipped(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [autoFlip, canFlip, isFlipped]);

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canFlip) {
      setIsFlipped(prev => !prev);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#050608]/90 backdrop-blur-2xl"
      />
      <motion.div
        className="relative w-full max-w-sm aspect-[3/4] perspective-1000 z-10"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          onClick={handleFlip}
          className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-1000 cursor-pointer"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* FRONT FACE */}
          <div className="absolute inset-0 [backface-visibility:hidden] bg-[#111216]/80 backdrop-blur-xl border border-[#00FF94]/50 rounded-2xl flex flex-col items-center justify-center p-8 shadow-[0_0_100px_rgba(0,255,148,0.15)]">
            <Trophy size={80} className="text-[#00FF94] mb-8 drop-shadow-[0_0_20px_#00FF94]" />
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{item.title}</h2>
            <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mt-4">
              {autoFlip ? 'Achievement Unlocked!' : 'Tap to flip'}
            </p>
          </div>

          {/* BACK FACE */}
          <div
            className="absolute inset-0 [backface-visibility:hidden] bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/20 rounded-2xl p-8 flex flex-col justify-between shadow-2xl"
            style={{ transform: 'rotateY(180deg)' }}
          >
            {/* HEADER */}
            <div className="mb-6 border-b border-white/10 pb-4">
              <h3 className="text-[#00FF94] font-black uppercase tracking-widest text-sm">Proof of Impact</h3>
              <p className="text-gray-500 text-xs font-mono mt-1">Verifiable on Solana</p>
            </div>

            {/* ACTION DATA */}
            <div className="space-y-4 font-mono text-xs">
              {item.type === "DEPOSIT" && (
                <>
                  <Row label="Action" value="First Deposit" />
                  <Row label="Deposit Amount" value={`${depositedSol.toFixed(4)} SOL`} />
                  
                </>
              )}
              {item.type === "CARBON" && (
                <>
                  <Row label="SOL Burned" value={`${userNctContribution.toFixed(2)} SOL`} />
                  <Row label="CO₂ Offset" value={`${(userNctContribution * 0.036).toFixed(2)} tCO₂`} />
                  
                </>
              )}
            </div>

            {/* REAL WORLD IMPACT */}
            <div className="mt-6 space-y-3 font-mono text-xs border-t border-white/10 pt-4">
              <h4 className="text-[#00FF94] uppercase tracking-widest">Real-World Impact</h4>
              <Row label="Trees Equivalent" value={
  nctLoading || !nctPriceInSOL
    ? ''
    : `${Math.floor((userNctContribution / nctPriceInSOL) * 31).toLocaleString()} Trees`
} />
              <Row label="Clean Energy" value={`${Math.floor(userNctContribution * 120)} kWh`} />
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-6 flex gap-3">
              {/*<a
                href={
                  item.type === "DEPOSIT"
                    ? `https://explorer.solana.com/tx/${userState?.lastDepositTx || ''}`
                    : `https://explorer.solana.com/tx/${userState?.lastBurnTx || ''}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-white/5 border border-white/10 rounded text-center text-xs font-mono uppercase tracking-widest hover:bg-[#00FF94] hover:text-black transition"
              >
                View Tx
              </a>*/}
              <button className="flex-1 py-3 bg-[#00FF94] text-black rounded text-xs font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,148,0.4)] transition">
                Share Proof
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-8 right-8 text-white hover:text-[#00FF94] transition-colors z-50 p-2 bg-white/5 rounded-full backdrop-blur-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <X size={24} />
      </motion.button>
    </div>
  );
};
// 7. FOOTER
const Footer = () => (
  <footer className="relative z-10 py-12 md:py-16 border-t border-white/10 bg-black">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-3 mb-6">
           <img src="/chloris-logo.png" alt="" className='h-6'/>
            <img src="/chloris-text.png" alt="" className='h-3'/>
        </div>

        <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
         Generating compounded returns on Solana while automatically offsetting carbon with AI-driven RWA strategies.
        </p>
      </div>

      <div>
        <h4 className="text-white font-bold mb-4 md:mb-6 font-mono text-sm uppercase">
          Built With
        </h4>
        <ul className="space-y-3 md:space-y-4 text-sm text-gray-500">
          <li className="flex items-center gap-2">
            <img
              alt="Avalanche Logo"
              className="w-5 h-5"
              src="/solana-logo.png"
            />
            Solana
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-bold mb-4 md:mb-6 font-mono text-sm uppercase">
          Community
        </h4>
        <ul className="space-y-3 md:space-y-4 text-sm text-gray-500 mb-4">
          <li className="hover:text-[#00FF94] cursor-pointer transition-colors">
            <a href="#" className="transition-colors">
              Documentation
            </a>
          </li>
          <li className="hover:text-[#00FF94] cursor-pointer transition-colors">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className=" transition-colors"
            >
              GitHub
            </a>
          </li>
          <li className="hover:text-[#00FF94] cursor-pointer transition-colors">
            <a
              href="mailto:chloris@gmail.com"
              className="transition-colors"
            >
              chloris@gmail.com
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs text-gray-600 font-mono uppercase tracking-wider text-center md:text-left">
      <div>© 2025 CHLORIS PROTOCOL. DECENTRALIZED ECO-FINANCE.</div>
      <div className="flex gap-6 md:gap-8">
        <span>Privacy Policy</span>
        <span>Terms of Service</span>
      </div>
    </div>
  </div>
</footer>
);


 //MAIN APP
 function Dashboard() {
  const { userState, globalState, phase, depositedSol, estimatedYieldSol, deposit, claim, initializeUser, loading, publicKey, refetch } = useChlorisVault();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [walletAddress, setWalletAddress] = useState<WalletAddress>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [autoFlip, setAutoFlip] = useState(false);
  const { priceInSOL: nctPriceInSOL, loading: nctLoading } = useNCTPriceInSOL();
  const { connection } = useConnection();
  const wallet = useWallet();

  
  const triggeredMilestones = useRef<Set<number>>(
    new Set(JSON.parse(localStorage.getItem("shownMilestones") || "[]"))
  );

  
  
  useEffect(() => {
    if (wallet.publicKey) {
      setWalletAddress(wallet.publicKey.toBase58());
    } else {
      setWalletAddress(null);
    }
  }, [wallet.publicKey]);

  const [nctTreasuryBalance, setNctTreasuryBalance] = useState(0);
  const [userSolBalance, setUserSolBalance] = useState(0);
  const apy = globalState?.lastEpochApyBps / 100;
 
 

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const balance = await connection.getBalance(new PublicKey("4kmZJX3QvYqyP2sSepmJ72pU7NNs21hjdPxZRMV3H3zV"));
        setNctTreasuryBalance(balance / LAMPORTS_PER_SOL);

        if (publicKey) {
          const balance = await connection.getBalance(publicKey);
          setUserSolBalance(balance / LAMPORTS_PER_SOL);
        }
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };
    fetchBalances();
    
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [globalState, publicKey, connection]);

  const userNctContribution = userState ? userState.totalNctContributed.toNumber() / LAMPORTS_PER_SOL : 0.00;

  const addToast = (
    title: string,
    message: string,
    type: ToastType = "success"
  ) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleDeposit = async (amount: number) => {
    if (!userState) {
      try {
        addToast('Initializing', 'Setting up your account...', 'info');
        await initializeUser();
        addToast('Account Ready', 'Now processing your deposit...', 'success');
      } catch (error: any) {
        throw new Error('Failed to initialize account: ' + error.message);
      }
    }
    
    await deposit(amount);
  };

  const handleClaim = async () => {
    try {
      await claim();
      addToast('Claim Successful', 'Your rewards have been claimed!', 'success');
    } catch (error: any) {
      addToast('Claim Failed', error.message || 'Transaction failed', 'error');
    }
  };
  const currentUnlocked = useMemo(() => {
    const unlocked = new Set<number>();

    if (depositedSol > 0) unlocked.add(1);
    if (userNctContribution >= 200) unlocked.add(2);
    if (userNctContribution >= 500) unlocked.add(3);
    if (userNctContribution >= 1000) unlocked.add(4);
    if (userNctContribution >= 2000) unlocked.add(5);

    return unlocked;
  }, [depositedSol, userNctContribution]);

  // Detect newly unlocked milestones and trigger popup
  useEffect(() => {
    const newUnlocks = [...currentUnlocked].filter(
      id => !triggeredMilestones.current.has(id)
    );
  
    if (newUnlocks.length === 0) return;
  
    // FIRST unlock only (lowest id)
    const firstUnlockId = Math.min(...newUnlocks);
    const template = milestoneTemplates.find(t => t.id === firstUnlockId);
    if (!template) return;
  
    const milestone: Milestone = {
      id: template.id,
      title: template.title,
      type: template.type,
      threshold: template.threshold,
      locked: false,
      ...(template.value !== undefined && { value: template.value }),
    };
  
    setSelectedMilestone(milestone);
    setAutoFlip(true);
  
    addToast('Milestone Unlocked!', `${template.title} achieved!`, 'success');
  
    // 🔒 Persist forever
    triggeredMilestones.current.add(firstUnlockId);
    localStorage.setItem(
      "shownMilestones",
      JSON.stringify([...triggeredMilestones.current])
    );
  }, [currentUnlocked]);


  const milestoneTemplates = [
    { id: 1, title: "First Contribution", type: "DEPOSIT" as const, threshold: "Make your first deposit" },
    { id: 2, title: "Carbon Reducer I", type: "CARBON" as const, threshold: "200 SOL Burned", value: 200 },
    { id: 3, title: "Carbon Reducer II", type: "CARBON" as const, threshold: "500 SOL Burned", value: 500 },
    { id: 4, title: "Carbon Reducer III", type: "CARBON" as const, threshold: "1,000 SOL Burned", value: 1000 },
    { id: 5, title: "Carbon Reducer IV", type: "CARBON" as const, threshold: "2,000 SOL Burned", value: 2000 },
  ];

  return (
    <div className="min-h-screen bg-[#050608] text-white font-sans selection:bg-[#00FF94] selection:text-black overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-[#00FF94] opacity-[0.04] blur-[200px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500 opacity-[0.03] blur-[200px] rounded-full"></div>
      </div>

      <Navbar />
      <ToastContainer toasts={toasts} />
      
      <main className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-32">
        {/* Hero section */}
        <div className="mb-16 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-6 leading-[0.9]">
              Regenerative <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF94] to-emerald-700">
                Finance Engine
              </span>
            </h1>
            <div className="h-1.5 w-32 bg-[#00FF94] mb-8 shadow-[0_0_20px_#00FF94]"></div>
            <p className="max-w-2xl text-gray-400 font-mono text-sm leading-relaxed border-l-2 border-white/10 pl-6">
              Generate compounded returns on Solana while automatically offsetting carbon with AI-driven RWA strategies.
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
         <StatCard 
           icon={Wind} 
           label="Your Burn"
           value={
             nctLoading || !nctPriceInSOL
             ? ''
             : `${((userNctContribution ) / nctPriceInSOL).toFixed(2)} NCT`
            } 
            sub="Connect Wallet"
            highlight={true} 
        />
  <StatCard 
    icon={Globe} 
    label="Protocol Total"
    value={
      nctLoading || !nctPriceInSOL
        ? ''
        : `${((nctTreasuryBalance ) / nctPriceInSOL).toFixed(2)} NCT`
    } 
    sub="Global"
    highlight={false} 
  />
  
  <StatCard icon={Activity} label="Efficiency" value="99.9%" sub="vs TradFi" />
  <StatCard 
  icon={Trees} 
  label="Real Impact" 
  value={
    nctLoading || !nctPriceInSOL
      ? ''
      : `${(((nctTreasuryBalance ) / nctPriceInSOL) * 31).toFixed(0)} Trees`
  } 
  sub="Equivalence" 
/>
</div>
        
        {/* Vault + Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[650px] mb-20">
          <div className="lg:col-span-7 h-full">
            <DepositVault 
              addToast={addToast} 
              walletAddress={walletAddress} 
              userSolBalance={userSolBalance}
              phase={phase}
              depositedSol={depositedSol}
              estimatedYieldSol={estimatedYieldSol}
              onDeposit={handleDeposit}
              onClaim={handleClaim}
              loading={loading}
              userState={userState}
              refresh={refetch}
              apy={apy}
            />
          </div>
          <div className="lg:col-span-5 h-full">
            <SynapseTerminal />
          </div>
        </div>

        {/* Milestones */}
        <div className="border-t border-white/10 pt-16">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-1">Impact Milestones</h3>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Collect to Unlock Rewards</p>
            </div>
            <button className="flex items-center gap-2 text-xs font-mono text-[#00FF94] uppercase tracking-widest hover:underline">
              View Collection <ExternalLink size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {milestoneTemplates.map((template) => {
              const locked = template.type === "DEPOSIT"
                ? depositedSol === 0
                : userNctContribution < (template.value ?? 0);

              const milestone: Milestone = {
                id: template.id,
                title: template.title,
                type: template.type,
                threshold: template.threshold,
                locked,
                ...(template.value !== undefined && { value: template.value }),
              };

              return (
                <ImpactCard
                  key={template.id}
                  item={milestone}
                  onClick={() => {
                    if (!milestone.locked) {
                      setSelectedMilestone(milestone);
                      setAutoFlip(false);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {selectedMilestone && (
          <CardModal
          item={selectedMilestone}
          userState={userState}
          userNctContribution={userNctContribution}
          depositedSol={depositedSol}   
          onClose={() => setSelectedMilestone(null)}
          autoFlip={autoFlip}
        />
        )}
      </AnimatePresence>

      <style >{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .cursor-wait { cursor: wait; }
      `}</style>
    </div>
  );
}

export default Dashboard;