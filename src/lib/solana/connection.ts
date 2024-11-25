import { Connection } from "@solana/web3.js";

// Using public RPC endpoints
const MAINNET_URL = "https://api.mainnet-beta.solana.com";
const TESTNET_URL = "https://api.testnet.solana.com";
const DEVNET_URL = "https://api.devnet.solana.com";

let currentConnection: Connection;
let currentNetwork: "mainnet" | "testnet" | "devnet" = "devnet";

export const setNetwork = (network: "mainnet" | "testnet" | "devnet") => {
  currentNetwork = network;
  const url = network === "mainnet" 
    ? MAINNET_URL 
    : network === "testnet"
    ? TESTNET_URL
    : DEVNET_URL;

  currentConnection = new Connection(url, {
    commitment: "confirmed",
    wsEndpoint: url.replace("https", "wss"),
    confirmTransactionInitialTimeout: 60000,
  });
  return currentConnection;
};

export const getCurrentConnection = () => {
  if (!currentConnection) {
    return setNetwork(currentNetwork);
  }
  return currentConnection;
};

// Initialize with devnet by default since it's more permissive
setNetwork("devnet");