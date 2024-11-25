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

export function processTransactionsForGraph(transactions: any[]) {
  const nodes = new Map();
  const links = new Map();

  // Add the transactions to the graph data
  transactions.forEach((tx) => {
    if (!tx.from || !tx.to) return;

    // Add nodes if they don't exist
    if (!nodes.has(tx.from)) {
      nodes.set(tx.from, {
        id: tx.from,
        name: `${tx.from.slice(0, 4)}...${tx.from.slice(-4)}`,
        val: 1,
      });
    } else {
      const node = nodes.get(tx.from);
      node.val += 1;
      nodes.set(tx.from, node);
    }

    if (!nodes.has(tx.to)) {
      nodes.set(tx.to, {
        id: tx.to,
        name: `${tx.to.slice(0, 4)}...${tx.to.slice(-4)}`,
        val: 1,
      });
    } else {
      const node = nodes.get(tx.to);
      node.val += 1;
      nodes.set(tx.to, node);
    }

    // Add or update links
    const linkId = `${tx.from}-${tx.to}`;
    if (!links.has(linkId)) {
      links.set(linkId, {
        source: tx.from,
        target: tx.to,
        value: tx.amount || 1,
      });
    } else {
      const link = links.get(linkId);
      link.value += tx.amount || 1;
      links.set(linkId, link);
    }
  });

  return {
    nodes: Array.from(nodes.values()),
    links: Array.from(links.values()),
  };
}
