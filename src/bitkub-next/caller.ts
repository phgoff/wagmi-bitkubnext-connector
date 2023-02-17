import {
  ApprovalResponse,
  BitkubNextCallerOptions,
  BitkubNextTXResponse,
  BitkubNextTXStatus,
  ContractCall,
  NetworkMode,
} from "./types";
import { storageKey } from "./constants";
import { requestWindow } from "./utils/request-window";

// BitkubNextCaller is a class that handles the communication with Bitkub Next Wallet.
export class BitkubNextCaller {
  clientId: string;
  networkMode: NetworkMode;
  private readonly walletBaseURL = "https://api.bitkubnext.io/wallets";
  private readonly accountsBaseURL = "https://api.bitkubnext.io/accounts";

  constructor({ clientId, networkMode }: BitkubNextCallerOptions) {
    this.clientId = clientId;
    this.networkMode = networkMode;
  }

  public async send({
    contractAddr,
    methodName,
    methodParams,
  }: ContractCall): Promise<BitkubNextTXResponse> {
    try {
      const accessToken = localStorage.getItem(storageKey.ACCESS_TOKEN);
      if (!accessToken) {
        throw new Error("No access token");
      }

      const queueId = await this.requestApproval(
        accessToken,
        contractAddr,
        methodName,
        methodParams,
      );

      await this.waitBKTx(accessToken, queueId);
      const receipt = await (await this.wrapTx(accessToken, queueId)).wait();

      // wait for 15 seconds to make sure the transaction is confirmed
      await new Promise((resolve) => setTimeout(resolve, 1000 * 15));

      return { ...receipt, transactionHash: receipt.tx };
    } catch (e) {
      console.error("send transaction:", e);
      throw e;
    }
  }

  public async createTxQueueApproval({
    accessToken,
    approvalToken,
  }: {
    accessToken: string;
    approvalToken: string;
  }): Promise<{ queue_id: string }> {
    const url = `${this.walletBaseURL}/transactions/queue/approval`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "x-next-client-id": this.clientId ? this.clientId : "",
    };

    const body = {
      approve_token: approvalToken,
    };

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      return resp.json();
    } catch (error) {
      throw error;
    }
  }

  private async createApprovalURL(
    accessToken: string,
    callbackUrl: string,
    contractAddress: string,
    methodName: string,
    methodParams: string[],
  ): Promise<ApprovalResponse> {
    const url = `${this.accountsBaseURL}/approvals`;

    const rawDescription = `send ${methodName}(${methodParams.join(", ")})`;
    const description =
      rawDescription.length > 128
        ? rawDescription.substring(0, 125) + "..."
        : rawDescription;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "x-next-client-id": this.clientId ? this.clientId : "",
    };

    const network =
      this.networkMode === "testnet" ? "BKC_TESTNET" : "BKC_MAINNET";

    const body = {
      chain: network,
      type: "CONTRACT_CALL",
      description: description,
      callback_url: callbackUrl,
      contract_address: contractAddress,
      contract_method_name: methodName,
      contract_method_params: methodParams,
    };

    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    return resp.json();
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
        `${window.origin}/callback/loading`,
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
    let url = `${this.walletBaseURL}/transactions/queue/${id}`;

    const resp = await fetch(url, { headers });
    const data = await resp.json();
    return data as BitkubNextTXResponse;
  }
}
