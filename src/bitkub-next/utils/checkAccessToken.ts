import { storageKey } from "../constants";
import { exchangeRefreshToken, getOAuth2AuthorizeURL } from "../services";
import jwt from "jsonwebtoken";
import { requestWindow } from "./request-window";

export function checkAccessToken() {
  const accessToken = localStorage.getItem(storageKey.ACCESS_TOKEN);
  if (!accessToken) throw new Error("access token not found");
  const decoded = jwt.decode(accessToken);
  if (decoded && typeof decoded === "object" && "exp" in decoded) {
    if (decoded.exp !== undefined && decoded.exp < Date.now() / 1000) {
      return true;
    }
  }
  return false;
}

export async function updateToken(clientId: string, redirectURI: string) {
  const isExpired = checkAccessToken();
  if (!isExpired) return;
  const refreshToken = localStorage.getItem(storageKey.REFRESH_TOKEN);
  if (!refreshToken) throw new Error("refresh token not found");
  const newToken = await exchangeRefreshToken(clientId, refreshToken);
  if (newToken.ok === false) {
    // localStorage.clear();
    const authorizeBitkubNextUrl = getOAuth2AuthorizeURL(clientId, redirectURI);
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
    localStorage.setItem(storageKey.ACCESS_TOKEN, resultToken.access_token);
    localStorage.setItem(storageKey.REFRESH_TOKEN, resultToken.refresh_token);
  } else {
    localStorage.setItem(storageKey.ACCESS_TOKEN, newToken.access_token);
    localStorage.setItem(storageKey.REFRESH_TOKEN, newToken.refresh_token);
  }
  return localStorage.getItem(storageKey.ACCESS_TOKEN);
}
