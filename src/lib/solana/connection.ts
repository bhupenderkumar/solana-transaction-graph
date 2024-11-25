import { Connection } from "@solana/web3.js";

// Create connections for both networks
const MAINNET_URL = "https://api.mainnet-beta.solana.com";
const TESTNET_URL = "https://api.testnet.solana.com";

let currentConnection: Connection;
let currentNetwork: "mainnet" | "testnet" = "testnet";

export const setNetwork = (network: "mainnet" | "testnet") => {
  currentNetwork = network;
  const url = network === "mainnet" ? MAINNET_URL : TESTNET_URL;
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

// Initialize with testnet by default
setNetwork("testnet");