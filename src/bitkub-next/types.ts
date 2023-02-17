export type NetworkMode = "mainnet" | "testnet";

export type AccessTokenType = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: Array<unknown> | null;
  token_type: string;
};

export type RefreshTokenType = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: Array<unknown> | null;
  token_type: string;
};

export type AccountInformationType = {
  data: {
    accepted_term_and_condition: string;
    aud: string;
    client_id: string;
    email: string;
    exp: string;
    has_email: boolean;
    has_migrade: boolean;
    has_password: boolean;
    has_pincode: boolean;
    iat: string;
    id: string;
    iss: string;
    kyc_level: number;
    lang: string;
    latest_term_and_condition: string;
    phone: string;
    scope: string;
    status: string;
    sub: string;
    username: string;
    wallet_address: string;
  };
  ok: boolean;
};

export type BitkubNextTXResponse = {
  abi: string;
  confirmations: number;
  contract_address: string;
  created_time: string;
  error_message: string;
  input: [];
  network: string;
  queue_id: string;
  status: string;
  tx: string;
  transactionHash: string;
};

export enum BitkubNextTXStatus {
  BROADCASTED = "BROADCASTED",
  SUCCESS = "SUCCESS",
  PENDING = "PENDING",
  FAILURE = "FAILURE",
}

export type ApprovalResponse = {
  ok: boolean;
  data: {
    id: string;
    approve_url: string;
    expires_in: number;
  };
};

export type BitkubNextCallerOptions = {
  clientId: string;
  networkMode: NetworkMode;
};

export type ContractCall = {
  contractAddr: string;
  methodName: string;
  methodParams: string[];
};
