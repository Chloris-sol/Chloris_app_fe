import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./program";

export const getGlobalStatePda = () =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("global")],
    PROGRAM_ID
  )[0];

export const getVaultPda = () =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    PROGRAM_ID
  )[0];

export const getUserStatePda = (user: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("user"), user.toBuffer()],
    PROGRAM_ID
  )[0];
