import { useCallback, useEffect, useMemo, useState } from "react";
import { AnchorProvider, Program} from "@coral-xyz/anchor";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "../idl/chloris_sol.json";
import { type ChlorisSol } from "../types/chloris_sol";

// ===============================
// Hook
// ===============================

export function useChlorisAdmin() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [loading, setLoading] = useState(false);
  const [globalState, setGlobalState] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ===============================
  // Provider & Program
  // ===============================

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;

    return new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program<ChlorisSol>(idl, provider);
  }, [provider]);

  // ===============================
  // PDAs
  // ===============================

  const globalStatePda = useMemo(() => {
    if (!program) return null;
    return PublicKey.findProgramAddressSync(
      [Buffer.from("global")],
      program.programId
    )[0];
  }, [program]);

  const vaultPda = useMemo(() => {
    if (!program) return null;
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId
    )[0];
  }, [program]);

  // ===============================
  // Fetch Global State
  // ===============================

  const fetchGlobalState = useCallback(async () => {
    if (!program || !globalStatePda) return null;

    try {
      const state = await program.account.globalState.fetch(globalStatePda);
      setGlobalState(state);
      console.log("Fetched global state:", state);
      return state;
    } catch {
      setGlobalState(null);
      return null;
    }
  }, [program, globalStatePda]);

  useEffect(() => {
    fetchGlobalState();
  }, [fetchGlobalState]);

  // ===============================
  // Admin Checks
  // ===============================

  const isInitialized = !!globalState;

  const isAdmin = useMemo(() => {
    if (!globalState || !wallet.publicKey) return false;

    if (globalState.admin?.equals(wallet.publicKey)) return true;

    return (
      false
    );
  }, [globalState, wallet.publicKey]);

  // ===============================
  // Initialize Protocol
  // ===============================

  const initializeProtocol = useCallback(
    async ({
      treasury,
      nctTreasury,
    }: {
      treasury: PublicKey;
      nctTreasury: PublicKey;
    }) => {
      if (!program || !globalStatePda || !vaultPda) {
        throw new Error("Program not ready");
      }
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      const admin = wallet.publicKey;

      setLoading(true);
      setError(null);

      try {
        const existing = await fetchGlobalState();
        if (existing) {
          throw new Error("Protocol already initialized");
        }

        const tx = await program.methods
          .initializeGlobal(treasury, nctTreasury)
          .accountsStrict({
            admin,
            globalState: globalStatePda,
            vault: vaultPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        await fetchGlobalState();
        return tx;
      } catch (err: any) {
        setError(err.message ?? "Initialization failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, globalStatePda, vaultPda, fetchGlobalState]
  );

  // ===============================
  // Epoch Controls
  // ===============================

  const startEpoch = useCallback(async () => {
    if (!program || !globalStatePda) throw new Error("Not ready");
    if (!wallet.publicKey) throw new Error("Wallet not connected");

    setLoading(true);

    try {
      const tx = await program.methods
        .startEpoch()
        .accountsStrict({
          admin: wallet.publicKey,
          globalState: globalStatePda,
        })
        .rpc();

      await fetchGlobalState();
      return tx;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, globalStatePda, fetchGlobalState]);

  const endEpoch = useCallback(
    async ({
      treasury,
      nctTreasury,
    }: {
      treasury: PublicKey;
      nctTreasury: PublicKey;
    }) => {
      if (!program || !globalStatePda || !vaultPda) {
        throw new Error("Not ready");
      }
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      setLoading(true);

      try {
        const tx = await program.methods
          .endEpoch()
          .accountsStrict({
            admin: wallet.publicKey,
            globalState: globalStatePda,
            vault: vaultPda,
            treasury,
            nctTreasury,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        await fetchGlobalState();
        return tx;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet.publicKey, globalStatePda, vaultPda, fetchGlobalState]
  );

  const newEpoch = useCallback(async () => {
    if (!program || !globalStatePda) throw new Error("Not ready");
    if (!wallet.publicKey) throw new Error("Wallet not connected");

    setLoading(true);

    try {
      const tx = await program.methods
        .newEpoch()
        .accountsStrict({
          admin: wallet.publicKey,
          globalState: globalStatePda,
        })
        .rpc();

      await fetchGlobalState();
      return tx;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, globalStatePda, fetchGlobalState]);

  // ===============================
  // Exposed API
  // ===============================

  return {
    loading,
    error,
    globalState,
    isInitialized,
    isAdmin,
    globalStatePda,
    vaultPda,
    initializeProtocol,
    startEpoch,
    endEpoch,
    newEpoch,
    refetch: fetchGlobalState,
  };
}
