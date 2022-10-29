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
