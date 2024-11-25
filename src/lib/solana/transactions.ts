import { ParsedInstruction, PartiallyDecodedInstruction, PublicKey } from "@solana/web3.js";
import { getCurrentConnection } from "./connection";

// Rate limiting variables
let lastCallTime = 0;
const MIN_CALL_INTERVAL = 2000;

const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;
  if (timeSinceLastCall < MIN_CALL_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_CALL_INTERVAL - timeSinceLastCall));
  }
  lastCallTime = Date.now();
};

export async function getTransactionHistory(publicKey: string) {
  try {
    await waitForRateLimit();
    const signatures = await getCurrentConnection().getSignaturesForAddress(
      new PublicKey(publicKey),
      { limit: 10 }
    );

    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        await waitForRateLimit();
        const tx = await getCurrentConnection().getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
        });
        
        if (!tx?.meta) return null;

        const timestamp = sig.blockTime ? sig.blockTime * 1000 : Date.now();
        
        let from = publicKey;
        let to = "";
        let amount = 0;
        let programId = "";
        let status = tx.meta.err ? "Failed" : "Success";
        let fee = tx.meta.fee / 1e9;

        const instruction = tx.transaction.message.instructions[0];
        if ('programId' in instruction) {
          programId = instruction.programId.toString();
          if (programId === '11111111111111111111111111111111') {
            if ('parsed' in instruction) {
              const parsed = (instruction as ParsedInstruction).parsed;
              if (parsed.type === "transfer") {
                from = parsed.info.source;
                to = parsed.info.destination;
                amount = parsed.info.lamports / 1e9;
              }
            }
          }
        }

        return {
          signature: sig.signature,
          timestamp,
          from,
          to,
          amount,
          programId,
          status,
          fee
        };
      })
    );

    return transactions.filter((tx): tx is NonNullable<typeof tx> => tx !== null);
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw error;
  }
}

export async function getRecentNetworkTransactions(limit: number = 10) {
  try {
    await waitForRateLimit();
    const signatures = await getCurrentConnection().getSignaturesForAddress(
      new PublicKey('11111111111111111111111111111111'), // System program
      { limit }
    );

    return signatures.map(sig => ({
      signature: sig.signature,
      timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
      status: sig.err ? "Failed" : "Success"
    }));
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    throw error;
  }
}