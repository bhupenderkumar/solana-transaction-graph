import { PublicKey } from "@solana/web3.js";
import { getCurrentConnection } from "./connection";

export async function getAccountInfo(publicKey: string) {
  try {
    const account = await getCurrentConnection().getAccountInfo(new PublicKey(publicKey));
    const balance = await getCurrentConnection().getBalance(new PublicKey(publicKey));
    const rentExemption = await getCurrentConnection().getMinimumBalanceForRentExemption(0);
    
    return {
      balance: balance / 1e9,
      executable: account?.executable || false,
      owner: account?.owner.toString() || '',
      space: account?.data.length || 0,
      rentExemption: rentExemption / 1e9,
      isRentExempt: balance >= rentExemption,
      programData: account?.data || null,
      lamportsPerSignature: await getCurrentConnection().getRecentBlockhash().then(res => res.feeCalculator.lamportsPerSignature)
    };
  } catch (error) {
    console.error("Error fetching account info:", error);
    throw error;
  }
}