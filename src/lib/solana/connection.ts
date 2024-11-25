import { Connection } from "@solana/web3.js";

// Create connections for both networks
const MAINNET_URL = "https://api.mainnet-beta.solana.com";
const TESTNET_URL = "https://api.testnet.solana.com";

let currentConnection: Connection;

export const createConnection = (network: "mainnet" | "testnet") => {
  const url = network === "mainnet" ? MAINNET_URL : TESTNET_URL;
  currentConnection = new Connection(url, {
    commitment: "confirmed",
    wsEndpoint: url.replace("https", "wss"),
    confirmTransactionInitialTimeout: 60000,
  });
  return currentConnection;
};

export const getCurrentConnection = () => currentConnection;

// Initialize with testnet by default
createConnection("testnet");