import { storageKey } from "../constants";
import { exchangeRefreshToken } from "../services";
import jwt from "jsonwebtoken";

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

export async function updateToken(client_id: string) {
  const isExpired = checkAccessToken();
  if (!isExpired) return;
  const refreshToken = localStorage.getItem(storageKey.REFRESH_TOKEN);
  if (!refreshToken) throw new Error("refresh token not found");
  const newToken = await exchangeRefreshToken(client_id, refreshToken);
  localStorage.setItem(storageKey.ACCESS_TOKEN, newToken.access_token);
  localStorage.setItem(storageKey.REFRESH_TOKEN, newToken.refresh_token);
}
