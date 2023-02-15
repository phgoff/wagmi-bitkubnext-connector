import { Chain } from "@wagmi/core";
import { NetworkMode } from "./types";

export const bitkubChains: Record<NetworkMode, Chain> = {
  mainnet: {
    id: 97,
    name: "Bitkub Chain",
    network: "bitkub",
    nativeCurrency: { name: "KUB", symbol: "KUB", decimals: 18 },
    rpcUrls: {
      default: { http: ["https://rpc.bitkubchain.io"] },
      public: { http: ["https://rpc.bitkubchain.io"] },
    },
    blockExplorers: {
      default: {
        name: "Bitkub Explorer",
        url: "https://www.bkcscan.com",
      },
    },
  },
  testnet: {
    id: 25925,
    name: "Bitkub Chain Testnet",
    network: "bitkub testnet",
    nativeCurrency: { name: "KUB", symbol: "KUB", decimals: 18 },
    rpcUrls: {
      default: { http: ["https://rpc-testnet.bitkubchain.io"] },
      public: { http: ["https://rpc-testnet.bitkubchain.io"] },
    },
    blockExplorers: {
      default: {
        name: "Bitkub Testnet Explorer",
        url: "https://testnet.bkcscan.com",
      },
    },
  },
};
