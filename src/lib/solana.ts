import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection("https://api.testnet.solana.com");

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
        
        // Extract from/to addresses and amount
        let from = publicKey;
        let to = "";
        let amount = 0;

        if (tx.transaction.message.instructions[0]?.program === "system") {
          const instruction = tx.transaction.message.instructions[0];
          if (instruction.parsed?.type === "transfer") {
            from = instruction.parsed.info.source;
            to = instruction.parsed.info.destination;
            amount = instruction.parsed.info.lamports / 1e9; // Convert lamports to SOL
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
  const nodes = new Set<string>();
  const links: Array<{ source: string; target: string; value: number }> = [];

  transactions.forEach((tx) => {
    if (tx.from && tx.to) {
      nodes.add(tx.from);
      nodes.add(tx.to);
      links.push({
        source: tx.from,
        target: tx.to,
        value: tx.amount,
      });
    }
  });

  return {
    nodes: Array.from(nodes).map((id) => ({
      id,
      name: `${id.slice(0, 4)}...${id.slice(-4)}`,
      val: 1,
    })),
    links,
  };
}