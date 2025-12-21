import { useState } from "react";
import {
  Play,
  Square,
  FastForward,
  Terminal,
  Cpu,
  HardDrive,
  RefreshCcw,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useChlorisAdmin } from "../solana/hooks/useChlorisAdmin";
import { AdminNavbar } from "../components/AdminNavbar";

// ===============================
// Styles & Helpers
// ===============================

const glassStyle =
  "bg-[#111216]/60 backdrop-blur-2xl border border-white/10 shadow-2xl";

const formatNum = (v?: any) =>
  v !== undefined ? Number(v).toLocaleString() : "0";

const getEpochPhase = (phase: any) =>
  phase ? Object.keys(phase)[0]?.toUpperCase() : "UNKNOWN";

const getPhaseKey = (phase: any): "deposit" | "investing" | "claiming" | "unknown" => {
  if (!phase) return "unknown";
  const key = Object.keys(phase)[0];
  if (key === "deposit" || key === "investing" || key === "claiming") {
    return key;
  }
  return "unknown";
};


// ===============================
// Page
// ===============================

const AdminDashboard = () => {
  const {
    loading,
    globalState,
    isInitialized,
    isAdmin,
    initializeProtocol,
    startEpoch,
    endEpoch,
    newEpoch,
    refetch,
  } = useChlorisAdmin();

  const [initData, setInitData] = useState({
    treasury: "",
    nctTreasury: "",
  });

  const handleAction = async (
    actionFn: () => Promise<any>,
    successMsg: string
  ) => {
    try {
      await actionFn();
      alert(successMsg);
    } catch (e: any) {
      console.error(e);
      alert(e.message ?? "Transaction failed");
    }
  };

  const phase = getPhaseKey(globalState?.epochPhase);

const canStartEpoch = phase === "deposit";
const canEndEpoch = phase === "investing";
const canNewEpoch = phase === "claiming";


  const isUnauthorized = isInitialized && !isAdmin;

  return (
    <div className="min-h-screen bg-[#050608] text-white font-sans">
      {/* NAVBAR ALWAYS VISIBLE */}
      <AdminNavbar isAdmin={isAdmin} />

     

      <main className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-24">
         {/* UNAUTHORIZED BANNER */}
      {isUnauthorized && (
        <div className="bg-red-500/10   mb-4">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-3">
            <ShieldX className="text-red-500" />
            <p className="text-sm font-mono text-red-400">
              Connected wallet is NOT authorized to manage the protocol.
            </p>
          </div>
        </div>
      )}

        {/* HEADER */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Terminal size={18} className="text-green-400" />
            <span className="text-xs font-mono text-green-400 uppercase tracking-[0.3em]">
              Command Center
            </span>
          </div>

          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-black uppercase tracking-tighter">
              Protocol Management
            </h1>

            {isAdmin ? (
              <ShieldCheck className="text-green-400" />
            ) : (
              <ShieldX className="text-red-500" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT PANEL */}
          <div className="lg:col-span-4 space-y-6">
            {/* SYSTEM STATE */}
            <section className={`${glassStyle} p-6 rounded-2xl`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                  System State
                </h3>
                <button
                  onClick={refetch}
                  className="text-gray-500 hover:text-white"
                >
                  <RefreshCcw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              </div>

              <div className="space-y-4">
                <StatusRow
                  label="Initialized"
                  value={isInitialized ? "YES" : "NO"}
                  active={isInitialized}
                />

                <StatusRow
                  label="Current Epoch"
                  value={globalState?.currentEpoch?.toString() || "0"}
                  active
                />

                <StatusRow
                  label="Epoch Phase"
                  value={getEpochPhase(globalState?.epochPhase)}
                  active={
                    getEpochPhase(globalState?.epochPhase) === "DEPOSIT"
                  }
                />

                <StatusRow
                  label="Total Users"
                  value={formatNum(globalState?.totalUsers)}
                />

                <StatusRow
                  label="Total Deposited (SOL)"
                  value={formatNum(globalState?.totalDeposited  / LAMPORTS_PER_SOL)}
                />

                {/* ADMIN + TREASURY */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <AddressBlock
                    label="ADMIN"
                    value={globalState?.admin?.toBase58()}
                    color="green"
                  />

                  <AddressBlock
                    label="TREASURY"
                    value={globalState?.treasury?.toBase58()}
                  />

                  <AddressBlock
                    label="NCT TREASURY"
                    value={globalState?.nctTreasury?.toBase58()}
                  />
                </div>
              </div>
            </section>

            {/* INITIALIZATION */}
            {!isInitialized && (
              <section
                className={`${glassStyle} p-6 rounded-2xl border-red-500/30`}
              >
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4">
                  Initialize Protocol
                </h3>

                <div className="space-y-4">
                  <AdminInput
                    label="Treasury Pubkey"
                    value={initData.treasury}
                    onChange={(v: string) =>
                      setInitData({ ...initData, treasury: v })
                    }
                  />

                  <AdminInput
                    label="NCT Treasury Pubkey"
                    value={initData.nctTreasury}
                    onChange={(v: string) =>
                      setInitData({ ...initData, nctTreasury: v })
                    }
                  />

                  <button
                    disabled={loading}
                    onClick={() =>
                      handleAction(
                        () =>
                          initializeProtocol({
                            treasury: new PublicKey(initData.treasury),
                            nctTreasury: new PublicKey(initData.nctTreasury),
                          }),
                        "Protocol Initialized"
                      )
                    }
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-black font-black uppercase text-xs rounded"
                  >
                    Deploy Global State
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-8">
            <div className={`${glassStyle} rounded-2xl p-8 h-full`}>
              <div className="flex items-center gap-4 mb-8">
                <Cpu className="text-green-400" />
                <h2 className="text-3xl font-black uppercase italic">
                  Epoch Controls
                </h2>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ControlCard
                        title="Start Epoch"
                        desc="Unlock deposits and begin yield generation."
                        phaseHint="Enabled only during DEPOSIT phase"
                        icon={Play}
                        onClick={() => handleAction(startEpoch, "Epoch Started")}
                        loading={loading}
                        disabled={!canStartEpoch}
                        variant="green"
                    />


                    <ControlCard
                        title="End Epoch"
                        desc="Lock deposits and finalize investment accounting."
                        phaseHint="Enabled only during INVESTING phase"
                        icon={Square}
                        onClick={() => {
                            const t = globalState?.treasury?.toBase58();
                            const nt = globalState?.nctTreasury?.toBase58();
                            if (t && nt) {
                                handleAction(
                                    () =>
                                        endEpoch({
                                            treasury: new PublicKey(t),
                                            nctTreasury: new PublicKey(nt),
                                        }),
                                    "Epoch Ended"
                                );
                            }
                        }}
                        loading={loading}
                        disabled={!canEndEpoch}
                        variant="red"
                    />


                    <ControlCard
                        title="New Epoch"
                        desc="Reset protocol state and increment epoch counter."
                        phaseHint="Enabled only during CLAIMING phase"
                        icon={FastForward}
                        onClick={() => handleAction(newEpoch, "New Epoch Created")}
                        loading={loading}
                        disabled={!canNewEpoch}
                        variant="blue"
                    />

                </div>


              {/* ECONOMICS */}
              <div className="mt-10 p-6 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex items-center gap-2 mb-4 text-[10px] uppercase tracking-widest text-gray-500">
                  <HardDrive size={12} />
                  Protocol Economics
                </div>

                <div className="grid grid-cols-2 gap-y-4 text-xs font-mono">
                  <span className="text-gray-500">Yield</span>
                  <span>
                    {(globalState?.yieldPerLamport / LAMPORTS_PER_SOL).toFixed(4) || "0"}
                  </span>

                  <span className="text-gray-500">
                    NCT Yield
                  </span>
                  <span>
                    {(globalState?.nctYieldPerLamport / LAMPORTS_PER_SOL).toFixed(4) || "0"}
                  </span>
                </div>
              </div>

              {/* METADATA */}
              {/* <div className="mt-6 p-6 bg-black/40 border border-white/5 rounded-xl font-mono">
                <div className="flex items-center gap-2 mb-4 text-[10px] uppercase tracking-widest text-gray-500">
                  <Database size={12} />
                  On-Chain Metadata
                </div>

                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <span className="text-gray-500">Global Bump</span>
                  <span>{globalState?.bump}</span>

                  <span className="text-gray-500">Vault Bump</span>
                  <span>{globalState?.vaultBump}</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ===============================
// Subcomponents
// ===============================

const StatusRow = ({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active?: boolean;
}) => (
  <div className="flex justify-between items-center text-xs">
    <span className="text-gray-500 uppercase font-bold">
      {label}
    </span>
    <span
      className={`font-mono font-bold ${
        active ? "text-[#00FF94]" : "text-white"
      }`}
    >
      {value}
    </span>
  </div>
);

const AddressBlock = ({
  label,
  value,
  color,
}: {
  label: string;
  value?: string;
  color?: "green" | "red";
}) => (
  <div>
    <p className="text-[10px] text-gray-500 font-mono mb-1">
      {label}
    </p>
    <p
      className={`text-xs font-mono truncate ${
        color === "green"
          ? "text-green-400"
          : "text-white"
      }`}
    >
      {value || "N/A"}
    </p>
  </div>
);

const AdminInput = ({ label, value, onChange }: any) => (
  <div>
    <label className="text-[10px] font-mono text-gray-500 uppercase mb-1 block">
      {label}
    </label>
    <input
      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs font-mono focus:border-green-400 outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Address..."
    />
  </div>
);

const ControlCard = ({
  title,
  desc,
  phaseHint,
  icon: Icon,
  onClick,
  loading,
  variant,
  disabled,
}: any) => {
  const colors = {
    green: "hover:border-[#00FF94]/50 text-[#00FF94]",
    red: "hover:border-red-500/50 text-red-500",
    blue: "hover:border-blue-500/50 text-blue-500",
  } as any;

  const disabledStyle =
    "opacity-40 cursor-not-allowed hover:border-white/10";

  return (
    <button
      disabled={disabled || loading}
      onClick={!disabled ? onClick : undefined}
      className={`${glassStyle} p-6 rounded-xl text-left transition-all group ${
        disabled ? disabledStyle : colors[variant]
      }`}
    >
      <div className="p-3 bg-white/5 rounded-lg w-fit mb-4">
        <Icon size={24} />
      </div>
      <h4 className="font-black uppercase text-sm mb-2">{title}</h4>
        <p className="text-[10px] text-gray-400 font-mono uppercase mb-2">
            {desc}
        </p>

        <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">
            {phaseHint}
        </p>

    </button>
  );
};


export default AdminDashboard;
