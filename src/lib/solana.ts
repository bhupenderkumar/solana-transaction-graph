import { Connection, PublicKey, ParsedInstruction, PartiallyDecodedInstruction, AccountInfo } from "@solana/web3.js";

// Create connections for both networks
const MAINNET_URL = "https://api.mainnet-beta.solana.com";
const TESTNET_URL = "https://api.testnet.solana.com";

const createConnection = (network: "mainnet" | "testnet") => {
  const url = network === "mainnet" ? MAINNET_URL : TESTNET_URL;
  return new Connection(url, {
    commitment: "confirmed",
    wsEndpoint: url.replace("https", "wss"),
    confirmTransactionInitialTimeout: 60000,
  });
};

let connection = createConnection("testnet");

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

export const setNetwork = (network: "mainnet" | "testnet") => {
  connection = createConnection(network);
};

export async function getTransactionHistory(publicKey: string) {
  try {
    await waitForRateLimit();
    const signatures = await connection.getSignaturesForAddress(
      new PublicKey(publicKey),
      { limit: 10 }
    );

    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        await waitForRateLimit();
        const tx = await connection.getParsedTransaction(sig.signature, {
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

        // Better instruction parsing
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
      isRentExempt: balance >= rentExemption,
      programData: account?.data || null,
      lamportsPerSignature: await connection.getRecentBlockhash().then(res => res.feeCalculator.lamportsPerSignature)
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

    // Add nodes with improved visual properties
    if (!nodes.has(tx.from)) {
      nodes.set(tx.from, {
        id: tx.from,
        name: `${tx.from.slice(0, 4)}...${tx.from.slice(-4)}`,
        val: 3, // Increased node size
        color: "#9945FF"
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
        val: 3, // Increased node size
        color: "#14F195"
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