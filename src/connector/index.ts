import { Connector, Chain } from "wagmi";
import { providers } from "ethers";
import { getAddress } from "ethers/lib/utils";
import { connectBitkubNext } from "../bitkub-next";

declare type NetworkMode = "mainnet" | "testnet";

declare type Options = {
  /**
   * Fallback Network mode
   * @default "mainnet"
   */
  networkMode: NetworkMode;
  clientId: string;
  oauthRedirectURI: string;
};

const bitkubChains: Record<NetworkMode, Chain> = {
  mainnet: {
    id: 97,
    name: "Bitkub Chain",
    network: "bitkub",
    nativeCurrency: { name: "Kub", symbol: "KUB", decimals: 18 },
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
    network: "bitkubTestnet",
    nativeCurrency: { name: "Kub", symbol: "KUB", decimals: 18 },
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

export class BitkubNextConnector extends Connector<
  providers.JsonRpcProvider,
  Options,
  providers.JsonRpcSigner
> {
  readonly id = "bitkubnext";
  readonly name = "Bitkub Next";
  readonly ready = true;

  #provider?: providers.JsonRpcProvider;

  constructor(config: { chains?: Chain[]; options: Options }) {
    const chain = bitkubChains[config.options.networkMode];
    super({ chains: [chain], options: config.options });
  }

  async getProvider() {
    if (!this.#provider) {
      this.#provider = new providers.JsonRpcProvider(
        this.chains[0].rpcUrls.default
      );
    }
    return this.#provider;
  }

  async getSigner() {
    const provider = await this.getProvider();
    return provider.getSigner();
  }

  async connect() {
    try {
      const account = await connectBitkubNext(
        this.options.clientId,
        this.options.oauthRedirectURI
      );
      if (!account) {
        throw new Error("Failed to get account");
      }

      localStorage.setItem("bitkubnext", account);

      return {
        account: getAddress(account),
        chain: {
          id: this.chains[0].id,
          unsupported: false,
        },
        provider: await this.getProvider(),
      };
    } catch (error) {
      throw error;
    }
  }

  async disconnect() {
    if (!this.#provider) {
      return;
    }
    this.#provider = undefined;
    localStorage.removeItem("bitkubnext");
  }

  async getAccount() {
    let account: string | null = null;
    account = localStorage.getItem("bitkubnext");
    if (!account) throw new Error("Failed to get account");
    return getAddress(account);
  }

  async getChainId() {
    return this.chains[0].id;
  }

  async isAuthorized() {
    try {
      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }

  onAccountsChanged() {
    return;
  }

  onChainChanged() {
    return;
  }

  onDisconnect() {
    return this.emit("disconnect");
  }
}
