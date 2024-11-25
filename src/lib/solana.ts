import { Connection, PublicKey, ParsedInstruction, PartiallyDecodedInstruction } from "@solana/web3.js";

// Using mainnet-beta for more reliable results
const connection = new Connection("https://api.mainnet-beta.solana.com", {
  commitment: "confirmed",
  wsEndpoint: "wss://api.mainnet-beta.solana.com/",
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
        };
      })
    );

    return transactions.filter((tx): tx is NonNullable<typeof tx> => tx !== null);
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw error;
  }
}

export function processTransactionsForGraph(transactions: any[]) {
  const nodes = new Map<string, number>();
  const links: Array<{ source: string; target: string; value: number }> = [];

  transactions.forEach((tx) => {
    if (tx.from && tx.to) {
      // Increment transaction count for each address
      nodes.set(tx.from, (nodes.get(tx.from) || 0) + 1);
      nodes.set(tx.to, (nodes.get(tx.to) || 0) + 1);
      
      links.push({
        source: tx.from,
        target: tx.to,
        value: tx.amount,
      });
    }
  });

  return {
    nodes: Array.from(nodes.entries()).map(([id, count]) => ({
      id,
      name: `${id.slice(0, 4)}...${id.slice(-4)} (${count} tx)`,
      val: count, // Node size based on transaction count
    })),
    links,
  };
}

export function subscribeToTransactions(publicKey: string, callback: (transaction: any) => void) {
  const subscriptionId = connection.onLogs(
    new PublicKey(publicKey),
    (logs) => {
      if (logs.err) return;
      callback({
        signature: logs.signature,
        timestamp: Date.now(),
        type: 'new-transaction'
      });
    },
    'confirmed'
  );

  return () => {
    connection.removeOnLogsListener(subscriptionId);
  };
}