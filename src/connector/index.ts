import { providers } from "ethers";
import { getAddress } from "ethers/lib/utils";
import { Chain, Connector } from "wagmi";
import { connectBitkubNext, NetworkMode } from "../bitkub-next";
import { bitkubChains } from "../bitkub-next/chains";

type Options = {
  networkMode: NetworkMode;
  clientId: string;
  oauthRedirectURI: string;
};

export class BitkubNextConnector extends Connector<
  providers.JsonRpcProvider,
  Options,
  providers.JsonRpcSigner
> {
  readonly id = "bitkubNext";
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
        this.chains[0].rpcUrls.default,
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
        this.options.oauthRedirectURI,
      );

      if (!account) {
        throw new Error("Failed to get bitkubnext account");
      }

      localStorage.setItem(this.id, account);

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
    localStorage.removeItem(this.id);
  }

  async getAccount() {
    let account: string | null = null;
    account = localStorage.getItem(this.id);
    if (!account) throw new Error("Failed to get bitkubnext account");
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
