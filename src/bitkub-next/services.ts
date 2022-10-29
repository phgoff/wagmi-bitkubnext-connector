import type {
  AccessTokenType,
  RefreshTokenType,
  AccountInformationType,
} from "./types";

import { STORAGE_KEY } from "./constants";
import * as ls from "local-storage";
import { requestWindow } from "./utils/request-window";

const BITKUB_ACCOUNT_URL = "https://accounts.bitkubnext.com";
const BITKUB_ACCOUNT_API = "https://api.bitkubnext.io/accounts";

export const getAccountInformation = async (
  accessToken: string
): Promise<AccountInformationType> => {
  const url = `${BITKUB_ACCOUNT_API}/auth/info`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(url, {
    headers,
  });
  const result: AccountInformationType = await response.json();
  return result;
};

export const getOAuth2AuthorizeURL = (
  clientId: string,
  redirectURI: string
) => {
  const encodedRedirectUrl = encodeURIComponent(redirectURI);
  let url =
    BITKUB_ACCOUNT_URL +
    `/oauth2/authorize?` +
    `response_type=code&` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodedRedirectUrl}`;
  return url;
};

export const exchangeAuthorizationCode = async (
  clientId: string,
  redirectURI: string,
  code: string
) => {
  const url = `${BITKUB_ACCOUNT_URL}/oauth2/access_token`;
  const headers = {
    Authorization: Buffer.from(`${clientId}:`).toString("base64"),
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectURI,
    code: code,
  });

  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  });
  const result: AccessTokenType = await response.json();

  return result;
};

export const exchangeRefreshToken = async (
  clientId: string,
  refreshToken: string
) => {
  const url = `${BITKUB_ACCOUNT_URL}/oauth2/access_token`;
  const headers = {
    Authorization: Buffer.from(`${clientId}:`).toString("base64"),
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });

  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  });
  const result: RefreshTokenType = await response.json();

  return result;
};

export const connectBitkubNext = async (
  clientId: string,
  redirectURI: string
) => {
  if (typeof window === "undefined") {
    return null;
  }
  let accountToken = ls.get<string>(STORAGE_KEY.ACCESS_TOKEN);
  let refreshToken = ls.get<string>(STORAGE_KEY.REFRESH_TOKEN);

  try {
    if (refreshToken) {
      const resultRefreshToken = await exchangeRefreshToken(
        clientId,
        refreshToken
      );
      accountToken = resultRefreshToken.access_token;
      refreshToken = resultRefreshToken.refresh_token;
    } else {
      const authorizeBitkubNextUrl = getOAuth2AuthorizeURL(
        clientId,
        redirectURI
      );

      const windowFeatures =
        "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,left=200,top=200,width=400,height=600";
      const tapWindow = window.open(
        authorizeBitkubNextUrl,
        "_blank",
        windowFeatures
      );
      const resultToken = await requestWindow(
        tapWindow!,
        authorizeBitkubNextUrl,
        STORAGE_KEY.RESULT,
        STORAGE_KEY.RESULT_ERROR
      );

      if (!resultToken.access_token || !resultToken.refresh_token) {
        throw Error("Cannot get access token");
      }

      accountToken = resultToken.access_token;
      refreshToken = resultToken.refresh_token;
    }

    ls.set(STORAGE_KEY.ACCESS_TOKEN, accountToken);
    ls.set(STORAGE_KEY.REFRESH_TOKEN, refreshToken);

    const information = await getAccountInformation(accountToken);
    const address = information.data.wallet_address;
    return address;
  } catch (err) {
    throw new Error("Can not connect to Bitkub Next");
  }
};
