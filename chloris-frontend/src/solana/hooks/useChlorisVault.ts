import { useCallback, useEffect, useMemo, useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { getProgram } from "../program";
import {
  getGlobalStatePda,
  getUserStatePda,
  getVaultPda,
} from "../pda";

type EpochPhase = "deposit" | "investing" | "claiming";

export function useChlorisVault() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [globalState, setGlobalState] = useState<any | null>(null);
  const [userState, setUserState] = useState<any | null>(null);

  const program = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    return getProgram(wallet, connection);
  }, [wallet, connection]);

  const globalStatePda = useMemo(getGlobalStatePda, []);
  const vaultPda = useMemo(getVaultPda, []);
  const userStatePda = useMemo(() => {
    if (!wallet.publicKey) return null;
    return getUserStatePda(wallet.publicKey);
  }, [wallet.publicKey]);

  /* -----------------------------
     READS
  ------------------------------*/

  const fetchGlobalState = useCallback(async () => {
    if (!program) return;

    const state = await program.account.globalState.fetch(globalStatePda);
    setGlobalState(state);
  }, [program, globalStatePda]);

  const fetchUserState = useCallback(async () => {
    if (!program || !userStatePda) return;

    try {
      const state = await program.account.userState.fetch(userStatePda);
      setUserState(state);
    } catch {
      setUserState(null);
    }
  }, [program, userStatePda]);

  useEffect(() => {
    if (!program) return;
    fetchGlobalState();
    fetchUserState();
  }, [program, fetchGlobalState, fetchUserState]);

  /* -----------------------------
     DERIVED STATE
  ------------------------------*/

  const phase: EpochPhase | null = useMemo(() => {
    if (!globalState) return null;
    return Object.keys(globalState.epochPhase)[0] as EpochPhase;
  }, [globalState]);

  const depositedSol = useMemo(() => {
    if (!userState) return 0;
    return userState.depositedAmount.toNumber() / LAMPORTS_PER_SOL;
  }, [userState]);

  const estimatedYieldSol = useMemo(() => {
    if (!userState || !globalState) return 0;

    const deposited = userState.depositedAmount.toNumber();
    const yieldPerLamport = globalState.yieldPerLamport.toNumber();
    const precision = 1_000_000_000;

    return Math.floor((deposited * yieldPerLamport) / precision) / LAMPORTS_PER_SOL;
  }, [userState, globalState]);

  /* -----------------------------
     WRITE ACTIONS
  ------------------------------*/

  const initializeUser = useCallback(async () => {
    if (!program || !wallet.publicKey || !userStatePda) return;

    setLoading(true);
    setError(null);

    try {
      await program.methods
        .initializeUser()
        .accountsStrict({
          user: wallet.publicKey,
          userState: userStatePda,
          globalState: globalStatePda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await fetchUserState();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    program,
    wallet.publicKey,
    userStatePda,
    globalStatePda,
    fetchUserState,
  ]);

  const deposit = useCallback(
    async (amountSol: number) => {
      if (!program || !wallet.publicKey || !userStatePda) return;

      setLoading(true);
      setError(null);

      try {
        const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

        await program.methods
          .deposit(new BN(lamports))
          .accountsStrict({
            user: wallet.publicKey,
            userState: userStatePda,
            globalState: globalStatePda,
            vault: vaultPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        await Promise.all([fetchGlobalState(), fetchUserState()]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [
      program,
      wallet.publicKey,
      userStatePda,
      globalStatePda,
      vaultPda,
      fetchGlobalState,
      fetchUserState,
    ]
  );

  const claim = useCallback(async () => {
    if (!program || !wallet.publicKey || !userStatePda) return;

    setLoading(true);
    setError(null);

    try {
      await program.methods
        .claim()
        .accountsStrict({
          user: wallet.publicKey,
          userState: userStatePda,
          globalState: globalStatePda,
          vault: vaultPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await Promise.all([fetchGlobalState(), fetchUserState()]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    program,
    wallet.publicKey,
    userStatePda,
    globalStatePda,
    vaultPda,
    fetchGlobalState,
    fetchUserState,
  ]);

  /* -----------------------------
     RETURN API (wagmi-like)
  ------------------------------*/

  return {
    /* connection */
    connected: wallet.connected,
    publicKey: wallet.publicKey,

    /* state */
    loading,
    error,
    phase,
    globalState,
    userState,

    /* balances */
    depositedSol,
    estimatedYieldSol,

    /* actions */
    initializeUser,
    deposit,
    claim,

    /* refresh */
    refetch: () => {
      fetchGlobalState();
      fetchUserState();
    },
  };
}
