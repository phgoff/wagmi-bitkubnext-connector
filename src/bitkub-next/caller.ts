import {
  ApprovalResponse,
  BitkubNextTXResponse,
  BitkubNextTXStatus,
  NetworkMode,
} from "./types";
import { storageKey } from "./constants";
import { requestWindow } from "./utils/request-window";

// BitkubNextCaller is a class that handles the communication with Bitkub Next Wallet.
export class BitkubNextCaller {
  clientId: string;
  network: NetworkMode;
  readonly walletBaseURL = "https://api.bitkubnext.io/wallets";
  readonly accountsBaseURL = "https://api.bitkubnext.io/accounts";
  constructor(clientId: string, network: NetworkMode) {
    this.clientId = clientId;
    this.network = network;
  }

  public async callContract(
    accessToken: string,
    contractAddr: string,
    methodName: string,
    methodParams: string[],
  ): Promise<BitkubNextTXResponse> {
    try {
      if (!accessToken) return Promise.reject("No access token");
      const queueId = await this.requestApproval(
        accessToken,
        contractAddr,
        methodName,
        methodParams,
      );
      const tx = await this.waitBKTx(accessToken, queueId);
      const receipt = await (await this.wrapTx(accessToken, queueId)).wait();

      // wait for 15 seconds to make sure the transaction is confirmed
      await new Promise((resolve) => setTimeout(resolve, 1000 * 15));

      return { ...receipt, transactionHash: receipt.tx };
    } catch (e: any) {
      console.error("call contract error:", e);
      throw new Error(e?.error?.message ?? e);
    }
  }

  private async requestApproval(
    accessToken: string,
    contractAddr: string,
    methodName: string,
    methodParams: string[],
  ) {
    try {
      const callbackUrl = `${window.origin}/callback`;
      const newWindow = window.open(
        `${window.origin}/callback-loading`,
        "_blank",
        `toolbar=no,
            location=no,
            status=no,
            menubar=no,
            scrollbars=yes,
            resizable=yes,
            width=400px,
            height=600px`,
      );
      const res = await this.createApprovalURL(
        accessToken,
        callbackUrl,
        contractAddr,
        methodName,
        methodParams,
      );

      const queueId = await requestWindow(
        newWindow!,
        res.data.approve_url,
        storageKey.TX_QUEUE_ID,
        storageKey.TX_ERROR,
      );

      localStorage.removeItem(storageKey.TX_QUEUE_ID);
      localStorage.removeItem(storageKey.TX_ERROR);

      return queueId as unknown as string;
    } catch (e) {
      throw e;
    }
  }

  private async createApprovalURL(
    accessToken: string,
    callbackUrl: string,
    contractAddress: string,
    methodName: string,
    methodParams: string[],
  ) {
    const url = `${this.accountsBaseURL}/approvals`;

    const rawDescription = `send ${methodName}(${methodParams.join(", ")})`;
    const description =
      rawDescription.length > 128
        ? rawDescription.substring(0, 125) + "..."
        : rawDescription;

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "x-next-client-id": this.clientId ? String(this.clientId) : "",
    };

    const body = {
      chain: this.network,
      type: "CONTRACT_CALL",
      description: description,
      callback_url: callbackUrl,
      contract_address: contractAddress,
      contract_method_name: methodName,
      contract_method_params: methodParams,
    };

    const data = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    return data.json() as Promise<ApprovalResponse>;
  }

  private async waitBKTx(
    accessToken: string,
    queueId: string,
    ...targetStatus: BitkubNextTXStatus[]
  ) {
    return new Promise<BitkubNextTXResponse>(async (resolve, reject) => {
      const res = await this.checkTxQueue(accessToken, queueId);

      const sucessStatus =
        targetStatus.length > 0
          ? targetStatus
          : [BitkubNextTXStatus.BROADCASTED, BitkubNextTXStatus.SUCCESS];
      const failStatus = [] as BitkubNextTXStatus[];

      if (sucessStatus.includes(res.status as BitkubNextTXStatus)) {
        resolve(res);
      } else if (failStatus.includes(res.status as BitkubNextTXStatus)) {
        reject(res);
      } else {
        const iv = setInterval(async () => {
          const res = await this.checkTxQueue(accessToken, queueId);
          if (sucessStatus.includes(res.status as BitkubNextTXStatus)) {
            clearInterval(iv);
            resolve(res);
          } else if (failStatus.includes(res.status as BitkubNextTXStatus)) {
            clearInterval(iv);
            reject(res);
          }
        }, 1000);
      }
    });
  }

  private async wrapTx(accessToken: string, queueId: string) {
    return {
      wait: () =>
        this.waitBKTx(accessToken, queueId, BitkubNextTXStatus.SUCCESS),
    };
  }

  private async checkTxQueue(accessToken: string, id: string) {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "x-next-client-id": this.clientId ? String(this.clientId) : "",
    };
    const IdNoQuote = id.replace(/"/g, "");
    let url = `${this.walletBaseURL}/transactions/queue/${IdNoQuote}`;
    const data = (await (
      await fetch(url, { headers })
    ).json()) as BitkubNextTXResponse;
    return data;
  }
}
