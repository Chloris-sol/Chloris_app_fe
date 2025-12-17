// src/solana/program.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "./idl/chloris_sol.json";
import { type ChlorisSol } from "./types/chloris_sol";

export const PROGRAM_ID = new PublicKey(
  idl.address
);

export function getProgram(wallet: any, connection: any) {
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { commitment: "confirmed" }
  );

  return new Program(
    idl as any,
    provider
  ) as Program<ChlorisSol>;
}
