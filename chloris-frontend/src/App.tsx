import React, { useState, useEffect } from 'react';
import { 
  Leaf, Wallet, ArrowRight, ShieldCheck, Trophy, type LucideIcon,
  Wind, Activity, Zap, Globe, Trees, Cpu, Lock, X, Share2, Hash, ChevronRight, ChevronDown, Coins, Settings, Copy, CheckCircle, ExternalLink, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';


type ToastType = "success" | "info" | "error";

interface Toast {
  id: number;
  title: string;
  message: string;
  type: ToastType;
}

type WalletAddress = string | null;

type AssetKey = "SOL" | "USDC";

interface Asset {
  ticker: AssetKey;
  name: string;
  apy: string;
  offset: string;
  balance: string;
  price: number;
  gradient: string;
}

interface Milestone {
  id: number;
  title: string;
  threshold: string;
  locked: boolean;
}

const assets: Record<AssetKey, Asset> = {
  SOL: {
    ticker: "SOL",
    name: "Solana",
    apy: "8.5%",
    offset: "+2%",
    balance: "145.20",
    price: 145,
    gradient: "from-[#9945FF] to-[#14F195]",
  },
  USDC: {
    ticker: "USDC",
    name: "USD Coin",
    apy: "12.4%",
    offset: "+1.5%",
    balance: "2,450.00",
    price: 1,
    gradient: "from-blue-500 to-cyan-400",
  },
};


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
          <Leaf className="text-[#00FF94] relative z-10" size={28} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-[0.2em] text-white uppercase font-sans leading-none">
            Chloris
          </h1>
          <span className="text-[9px] text-[#00FF94] font-mono tracking-widest uppercase opacity-80">Beta v1.0.4</span>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="hidden md:flex gap-8 text-[10px] font-mono tracking-widest text-gray-400 uppercase">
          {['Dashboard', 'Mechanism', 'Docs', 'Governance'].map((item) => (
            <span key={item} className="hover:text-[#00FF94] cursor-pointer transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(0,255,148,0.5)]">
              {item}
            </span>
          ))}
        </div>
        
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

// 3. DEPOSIT VAULT (Jupiter Style)
const DepositVault: React.FC<{
  addToast: (title: string, message: string, type?: ToastType) => void;
  walletAddress: WalletAddress;
}> = ({ addToast, walletAddress }) => {
  const [selectedAsset, setSelectedAsset] = useState<AssetKey>("SOL");
  const [amount, setAmount] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);

  const current = assets[selectedAsset];

  const handleDeposit = () => {
    if (!walletAddress) {
      addToast('Error', 'Please connect your wallet first.', 'error');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      addToast('Invalid Amount', 'Please enter a value greater than 0.', 'error');
      return;
    }
    setIsDepositing(true);
    setTimeout(() => {
      setIsDepositing(false);
      setAmount('');
      addToast('Deposit Successful', `You have staked ${amount} ${current.ticker}.`, 'success');
    }, 2000);
  };

  const setMax = () => setAmount(current.balance);

  return (
    <div className={`${glassStyle} h-full rounded-2xl p-8 md:p-10 flex flex-col relative group hover:border-[#00FF94]/30 transition-all duration-500`}>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b ${current.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-1000 pointer-events-none rounded-2xl`}></div>

      <div className="relative z-10 mb-8 flex justify-between items-start">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00FF94]/10 text-[#00FF94] border border-[#00FF94]/20 text-[10px] font-mono uppercase tracking-widest rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse"></div> Active
              </span>
              <span className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">V2 Pool</span>
           </div>
           <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-1">
            {current.name} <span className={`text-transparent bg-clip-text bg-gradient-to-r ${current.gradient}`}>Vault</span>
           </h2>
        </div>
        <button className="p-2 text-gray-500 hover:text-white transition rounded-full hover:bg-white/5">
            <Settings size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        <div className="bg-[#0A0A0A]/40 backdrop-blur-md p-4 rounded-xl border border-white/5 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
             <p className="text-gray-500 text-[10px] uppercase tracking-widest">Net APY</p>
             <Info size={12} className="text-gray-600" />
          </div>
          <p className="text-3xl font-black text-white">{current.apy}</p>
        </div>
        <div className="bg-[#0A0A0A]/40 backdrop-blur-md p-4 rounded-xl border border-white/5 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
               <p className="text-gray-500 text-[10px] uppercase tracking-widest">Offset Impact</p>
               <Leaf size={12} className="text-[#00FF94]" />
            </div>
            <p className="text-3xl font-black text-[#00FF94]">{current.offset}</p>
        </div>
      </div>

      <div className="mt-auto bg-[#050608]/80 backdrop-blur-md rounded-xl p-1 border border-white/10 relative z-10 shadow-inner">
        <div className="bg-[#111216] rounded-lg p-5 border border-white/5">
            <div className="flex justify-between items-center mb-4">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wide">You Deposit</label>
                <div className="flex items-center gap-2">
                    <Wallet size={12} className="text-gray-500"/>
                    <span className="text-xs text-gray-400 font-mono">{current.balance} {current.ticker}</span>
                    <button onClick={setMax} className="text-[10px] bg-[#00FF94]/10 text-[#00FF94] px-2 py-0.5 rounded border border-[#00FF94]/30 hover:bg-[#00FF94] hover:text-black transition uppercase font-bold">Max</button>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
               <div className="relative">
                  <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 bg-[#2A2B30] hover:bg-[#323339] transition px-3 py-2 rounded-full font-bold min-w-[140px] border border-white/10 shadow-lg">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br ${current.gradient}`}>
                        {selectedAsset === 'SOL' ? <Zap size={14} className="text-white" /> : <Coins size={14} className="text-white"/>}
                    </div>
                    <span className="text-lg">{selectedAsset}</span>
                    <ChevronDown size={16} className={`ml-auto text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full left-0 mt-2 w-[180px] bg-[#1A1B20] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 p-1">
                        {Object.values(assets).map((a) => (
                          <div key={a.ticker} onClick={() => { setSelectedAsset(a.ticker); setIsOpen(false); }} className={`px-3 py-3 hover:bg-white/5 rounded-lg cursor-pointer flex items-center gap-3 ${selectedAsset === a.ticker ? 'bg-white/5' : ''}`}>
                             <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${a.gradient}`}></div>
                             <div>
                                 <div className="text-sm font-bold text-white leading-none">{a.ticker}</div>
                                 <div className="text-[10px] text-gray-500 font-mono mt-0.5">{a.name}</div>
                             </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
               <div className="flex-1 text-right">
                   <input 
                     type="text" 
                     value={amount}
                     onChange={(e) => { const val = e.target.value; if (/^\d*\.?\d*$/.test(val)) setAmount(val); }}
                     placeholder="0.00" 
                     className="w-full bg-transparent text-right text-4xl font-bold text-white outline-none placeholder-gray-700"
                   />
                   <div className="text-xs text-gray-500 font-mono mt-1">≈ ${(amount ? parseFloat(amount) * current.price : 0).toFixed(2)} USD</div>
               </div>
            </div>
        </div>
        <button onClick={handleDeposit} disabled={isDepositing} className={`w-full mt-2 font-black uppercase tracking-[0.2em] py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${isDepositing ? 'bg-gray-700 text-gray-400 cursor-wait' : 'bg-[#00FF94] hover:bg-[#00cc76] text-black hover:shadow-[0_0_20px_rgba(0,255,148,0.4)]'}`}>
          {isDepositing ? <><Activity size={18} className="animate-spin" /> Processing...</> : <>Deposit {current.ticker}</>}
        </button>
      </div>
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

// 5. SYNAPSE TERMINAL (UPDATED WITH LOGS)
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

  // Random Hex Helper
  const randHex = () => Math.random().toString(16).substr(2, 6).toUpperCase();

  useEffect(() => {
    // Progress Loop
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        const next = (prev + 1) % 4;

        // Generate relevant log based on current step
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
            return newLogs.slice(-6); // Keep last 6 logs to prevent overflow
        });

        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${glassStyle} rounded-2xl p-6 h-full flex flex-col relative overflow-hidden group hover:border-[#00FF94]/30 transition-all duration-500`}>
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF94] opacity-[0.03] blur-[100px] pointer-events-none"></div>

      {/* Header */}
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

      {/* 1. VISUAL FLOW (Top Section) */}
      <div className="relative flex-1 pl-2 mb-4 min-h-[220px]">
        {/* Connecting Line */}
        <div className="absolute left-[1.25rem] top-5 bottom-5 w-[2px] bg-[#1A1B20] -translate-x-1/2 z-0">
            <motion.div 
                className="w-full bg-[#00FF94] shadow-[0_0_15px_#00FF94]"
                initial={{ height: "0%" }}
                animate={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>

        {/* Nodes */}
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

      {/* 2. TERMINAL LOG WINDOW (Bottom Section) */}
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
                        {/* FIXED: Using HTML entity for greater than sign */}
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
    <div className="relative z-10 pointer-events-none">
        <Trophy size={40} className={`mb-4 drop-shadow-md ${item.locked ? 'text-gray-600' : 'text-[#00FF94]'}`} />
        <h4 className="text-white font-bold uppercase tracking-wide text-sm mb-2">{item.title}</h4>
        <div className="inline-block px-2 py-1 bg-black/40 border border-white/10 text-[10px] font-mono text-gray-400 backdrop-blur-sm rounded">
            {item.threshold}
        </div>
    </div>
    {item.locked && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] rounded-xl">
            <Lock size={20} className="text-gray-500" />
        </div>
    )}
  </motion.div>
);

const CardModal: React.FC<{
  item: Milestone;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        className="absolute inset-0 bg-[#050608]/90 backdrop-blur-2xl cursor-pointer"
      />
      <div className="relative w-full max-w-sm aspect-[3/4] perspective-1000 z-10">
        <motion.div
          layoutId={`card-${item.id}`}
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full h-full relative preserve-3d transition-transform duration-700 cursor-pointer"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-[#111216]/80 backdrop-blur-xl border border-[#00FF94]/50 rounded-2xl flex flex-col items-center justify-center p-8 shadow-[0_0_100px_rgba(0,255,148,0.15)]">
            <div className="absolute top-4 right-4 text-[#00FF94] animate-pulse"><Activity size={20} /></div>
            <Trophy size={80} className="text-[#00FF94] mb-8 drop-shadow-[0_0_20px_#00FF94]" />
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{item.title}</h2>
            <div className="flex items-center gap-2 text-gray-400 font-mono text-xs uppercase tracking-widest mt-4"><span>Flip Card</span><ChevronRight size={12} /></div>
          </div>
          {/* Back */}
          <div className="absolute inset-0 backface-hidden bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/20 rounded-2xl p-8 rotate-y-180 flex flex-col justify-between shadow-2xl">
            <div>
               <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                 <h3 className="text-[#00FF94] font-black uppercase text-xl">Asset Data</h3>
                 <Hash size={16} className="text-gray-500"/>
               </div>
               <div className="space-y-6 font-mono text-sm">
                 <div className="flex justify-between"><span className="text-gray-500 uppercase tracking-wider text-xs">Rarity</span><span className="text-white font-bold">Legendary</span></div>
                 <div className="flex justify-between"><span className="text-gray-500 uppercase tracking-wider text-xs">Mint Date</span><span className="text-white font-bold">2025-12-17</span></div>
                 <div className="flex justify-between items-center p-3 bg-[#00FF94]/10 rounded border border-[#00FF94]/20">
                   <span className="text-gray-400 text-xs">Carbon Burned</span><span className="text-[#00FF94] font-bold">50.0 tCO2</span>
                 </div>
               </div>
            </div>
            <button className="w-full py-4 bg-[#00FF94] text-black font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors rounded">
               <Share2 size={16} /> Share Proof
            </button>
          </div>
        </motion.div>
      </div>
      <button onClick={onClose} className="absolute top-8 right-8 text-white hover:text-[#00FF94] transition-colors z-50 p-2 bg-white/5 rounded-full backdrop-blur-md"><X size={24} /></button>
    </div>
  );
};

// 7. FOOTER
const Footer = () => (
    <footer className="border-t border-white/5 bg-[#020202] py-16 px-8 relative z-10 mt-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                    <Leaf size={20} className="text-[#00FF94]" />
                    <span className="font-black text-xl text-white uppercase tracking-widest">Chloris</span>
                </div>
                <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                    The first decentralized Eco-DeFi Aggregator on Solana. 
                    Merging high-frequency trading yield with verifiable on-chain carbon retirement.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-white uppercase tracking-widest mb-6 text-xs">Protocol</h4>
                <ul className="space-y-4 text-sm text-gray-500 font-mono uppercase tracking-wide">
                    <li className="hover:text-[#00FF94] cursor-pointer">Vault Strategies</li>
                    <li className="hover:text-[#00FF94] cursor-pointer">Tokenomics</li>
                    <li className="hover:text-[#00FF94] cursor-pointer">Impact Verify</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-white uppercase tracking-widest mb-6 text-xs">Social</h4>
                <ul className="space-y-4 text-sm text-gray-500 font-mono uppercase tracking-wide">
                    <li className="hover:text-[#00FF94] cursor-pointer">Twitter / X</li>
                    <li className="hover:text-[#00FF94] cursor-pointer">Discord</li>
                    <li className="hover:text-[#00FF94] cursor-pointer">GitHub</li>
                </ul>
            </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-16 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600 uppercase font-mono tracking-widest">
            <span>© 2025 Chloris Protocol. All Rights Reserved.</span>
            <div className="flex gap-4">
                <span>Terms</span>
                <span>Privacy</span>
            </div>
        </div>
    </footer>
);


// --- MAIN APP ---
function App() {
const [toasts, setToasts] = useState<Toast[]>([]);
const [walletAddress, setWalletAddress] = useState<WalletAddress>(null);
const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Toast Helper
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

  // Mock Wallet Connect
  const handleConnect = () => {
    if (walletAddress) {
        setWalletAddress(null);
        addToast('Disconnected', 'Wallet disconnected successfully.', 'info');
    } else {
        // Simulate connecting delay
        const loadingId = Date.now();
        setToasts(prev => [...prev, { id: loadingId, title: 'Connecting...', message: 'Requesting wallet signature', type: 'info' }]);
        
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== loadingId));
            setWalletAddress('7xKr...9a21');
            addToast('Connected', 'Wallet connected successfully.', 'success');
        }, 1500);
    }
  };

  const milestones = [
    { id: 1, title: "Genesis Sprout", threshold: "First Tx", locked: false },
    { id: 2, title: "Carbon Guardian", threshold: "1 Tonne Burn", locked: true },
    { id: 3, title: "Forest Titan", threshold: "100 Tonnes", locked: true },
    { id: 4, title: "Gaia's Hand", threshold: "Top 1% User", locked: true },
  ];

  return (
    <div className="min-h-screen bg-[#050608] text-white font-sans selection:bg-[#00FF94] selection:text-black overflow-x-hidden">
      
      {/* Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-[#00FF94] opacity-[0.04] blur-[200px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500 opacity-[0.03] blur-[200px] rounded-full"></div>
      </div>

      <Navbar  />
      <ToastContainer toasts={toasts} />
      
      <main className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-32">
        
        {/* HERO */}
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

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
            <StatCard icon={Wind} label="Your Burn" value="0.00 t" sub="Connect Wallet" highlight={true} />
            <StatCard icon={Globe} label="Protocol Total" value="1,240 t" sub="Global" />
            <StatCard icon={Activity} label="Efficiency" value="99.9%" sub="vs TradFi" />
            <StatCard icon={Trees} label="Real Impact" value="28 Trees" sub="Equivalence" />
        </div>

        {/* DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[650px] mb-20">
            <div className="lg:col-span-7 h-full">
               <DepositVault addToast={addToast} walletAddress={walletAddress} />
            </div>
            <div className="lg:col-span-5 h-full">
                <SynapseTerminal />
            </div>
        </div>

        {/* NFTS */}
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
                {milestones.map((m) => (
                  <ImpactCard key={m.id} item={m} onClick={setSelectedMilestone} />
                ))}
            </div>
        </div>

      </main>

      <Footer />

      <AnimatePresence>
        {selectedMilestone && (
          <CardModal 
            item={selectedMilestone} 
            onClose={() => setSelectedMilestone(null)} 
          />
        )}
      </AnimatePresence>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .clip-path-slant { clip-path: polygon(10% 0, 100% 0, 100% 100%, 0% 100%); }
        .cursor-wait { cursor: wait; }
      `}</style>
    </div>
  );
}

export default App;