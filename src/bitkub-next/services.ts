import type {
  AccessTokenType,
  RefreshTokenType,
  AccountInformationType,
} from "./types";

import { storageKey } from "./constants";
import { requestWindow } from "./utils/request-window";

const BITKUB_ACCOUNT_URL = "https://accounts.bitkubnext.com";
const BITKUB_ACCOUNT_API = "https://api.bitkubnext.io/accounts";

const getAccountInformation = async (
  accessToken: string,
): Promise<AccountInformationType> => {
  try {
    const url = `${BITKUB_ACCOUNT_API}/auth/info`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(url, {
      headers,
    });
    const result: AccountInformationType = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

const getOAuth2AuthorizeURL = (clientId: string, redirectURI: string) => {
  const encodedRedirectUrl = encodeURIComponent(redirectURI);
  const url =
    BITKUB_ACCOUNT_URL +
    `/oauth2/authorize?` +
    `response_type=code&` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodedRedirectUrl}`;
  return url;
};

const exchangeRefreshToken = async (clientId: string, refreshToken: string) => {
  try {
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
  } catch (error) {
    throw error;
  }
};

export const exchangeAuthorizationCode = async (
  clientId: string,
  redirectURI: string,
  code: string,
) => {
  try {
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
  } catch (error) {
    throw error;
  }
};

export const connectBitkubNext = async (
  clientId: string,
  redirectURI: string,
) => {
  if (typeof window === "undefined") {
    return null;
  }
  let accountToken = localStorage.getItem(storageKey.ACCESS_TOKEN);
  let refreshToken = localStorage.getItem(storageKey.REFRESH_TOKEN);

  try {
    if (refreshToken && refreshToken !== "undefined") {
      const resultRefreshToken = await exchangeRefreshToken(
        clientId,
        refreshToken,
      );
      accountToken = resultRefreshToken.access_token;
      refreshToken = resultRefreshToken.refresh_token;
    } else {
      const authorizeBitkubNextUrl = getOAuth2AuthorizeURL(
        clientId,
        redirectURI,
      );

      const windowFeatures =
        "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,left=200,top=200,width=400,height=600";
      const tapWindow = window.open(
        authorizeBitkubNextUrl,
        "_blank",
        windowFeatures,
      )!;
      const resultToken = await requestWindow(
        tapWindow,
        authorizeBitkubNextUrl,
        storageKey.RESULT,
        storageKey.RESULT_ERROR,
      );

      if (!resultToken.access_token || !resultToken.refresh_token) {
        throw Error("Token not found");
      }

      accountToken = resultToken.access_token;
      refreshToken = resultToken.refresh_token;
    }

    localStorage.setItem(storageKey.ACCESS_TOKEN, accountToken);
    localStorage.setItem(storageKey.REFRESH_TOKEN, refreshToken);

    const information = await getAccountInformation(accountToken);
    const address = information.data.wallet_address;
    return address;
  } catch (err) {
    console.error("connectBitkubNext error", err);
    throw new Error("Can not connect to Bitkub Next");
  }
};
