import { Connection, PublicKey, ParsedInstruction, PartiallyDecodedInstruction, AccountInfo } from "@solana/web3.js";

// Using testnet with increased commitment level and longer timeout
const connection = new Connection("https://api.testnet.solana.com", {
  commitment: "confirmed",
  wsEndpoint: "wss://api.testnet.solana.com/",
  confirmTransactionInitialTimeout: 60000, // Increased timeout
});

// Rate limiting variables
let lastCallTime = 0;
const MIN_CALL_INTERVAL = 2000; // 2 seconds between calls

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
    const signatures = await connection.getSignaturesForAddress(
      new PublicKey(publicKey),
      { limit: 10 } // Reduced from 20 to 10 to minimize rate limiting issues
    );

    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        await waitForRateLimit();
        const tx = await connection.getParsedTransaction(sig.signature);
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
          slot: sig.slot,
          err: sig.err,
          memo: sig.memo,
          confirmationStatus: sig.confirmationStatus,
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

export async function getAccountInfo(publicKey: string) {
  try {
    await waitForRateLimit();
    const account = await connection.getAccountInfo(new PublicKey(publicKey));
    const balance = await connection.getBalance(new PublicKey(publicKey));
    
    await waitForRateLimit();
    const rentExemption = await connection.getMinimumBalanceForRentExemption(0);
    
    return {
      balance: balance / 1e9,
      executable: account?.executable || false,
      owner: account?.owner.toString() || '',
      space: account?.data.length || 0,
      rentExemption: rentExemption / 1e9,
      isRentExempt: balance >= rentExemption
    };
  } catch (error) {
    console.error("Error fetching account info:", error);
    throw error;
  }
}

let currentSubscription: number | null = null;

export function subscribeToTransactions(publicKey: string, callback: (transaction: any) => void) {
  if (currentSubscription) {
    connection.removeOnLogsListener(currentSubscription);
  }

  currentSubscription = connection.onLogs(
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
    if (currentSubscription) {
      connection.removeOnLogsListener(currentSubscription);
      currentSubscription = null;
    }
  };
}

export function processTransactionsForGraph(transactions: any[]) {
  const nodes = new Map();
  const links = new Map();

  transactions.forEach((tx) => {
    if (!tx.from || !tx.to) return;

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