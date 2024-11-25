import { Connection, PublicKey, ParsedInstruction, PartiallyDecodedInstruction, AccountInfo } from "@solana/web3.js";

// Using testnet for development
const connection = new Connection("https://api.testnet.solana.com", {
  commitment: "confirmed",
  wsEndpoint: "wss://api.testnet.solana.com/",
});

export async function getTransactionHistory(publicKey: string) {
  try {
    const signatures = await connection.getSignaturesForAddress(
      new PublicKey(publicKey),
      { limit: 20 }
    );

    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        const tx = await connection.getParsedTransaction(sig.signature);
        if (!tx?.meta) return null;

        const timestamp = sig.blockTime ? sig.blockTime * 1000 : Date.now();
        
        let from = publicKey;
        let to = "";
        let amount = 0;

        const instruction = tx.transaction.message.instructions[0];
        if ('programId' in instruction && instruction.programId.toString() === '11111111111111111111111111111111') {
          if ('parsed' in instruction) {
            const parsed = (instruction as ParsedInstruction).parsed;
            if (parsed.type === "transfer") {
              from = parsed.info.source;
              to = parsed.info.destination;
              amount = parsed.info.lamports / 1e9;
            }
          }
        }

        return {
          signature: sig.signature,
          timestamp,
          from,
          to,
          amount,
          slot: sig.slot,
          err: sig.err,
          memo: sig.memo,
          confirmationStatus: sig.confirmationStatus,
        };
      })
    );

    return transactions.filter((tx): tx is NonNullable<typeof tx> => tx !== null);
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw error;
  }
}

export async function getAccountInfo(publicKey: string) {
  try {
    const account = await connection.getAccountInfo(new PublicKey(publicKey));
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return {
      balance: balance / 1e9,
      executable: account?.executable || false,
      owner: account?.owner.toString() || '',
      space: account?.data.length || 0,
    };
  } catch (error) {
    console.error("Error fetching account info:", error);
    throw error;
  }
}

export function subscribeToTransactions(publicKey: string, callback: (transaction: any) => void) {
  const subscriptionId = connection.onLogs(
    new PublicKey(publicKey),
    (logs) => {
      if (logs.err) return;
      callback({
        signature: logs.signature,
        timestamp: Date.now(),
        type: logs.logs[0] || 'transaction',
      });
    },
    'confirmed'
  );

  return () => {
    connection.removeOnLogsListener(subscriptionId);
  };
}