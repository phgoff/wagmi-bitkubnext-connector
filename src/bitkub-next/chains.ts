import { Chain } from "wagmi";
import { NetworkMode } from "./types";

export const chains: Record<NetworkMode, Chain> = {
  mainnet: {
    id: 97,
    name: "Bitkub Chain",
    network: "bitkub",
    nativeCurrency: { name: "KUB", symbol: "KUB", decimals: 18 },
    rpcUrls: {
      default: "https://rpc.bitkubchain.io",
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
      default: "https://rpc-testnet.bitkubchain.io",
    },
    blockExplorers: {
      default: {
        name: "Bitkub Testnet Explorer",
        url: "https://testnet.bkcscan.com",
      },
    },
  },
};
