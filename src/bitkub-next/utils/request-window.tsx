import { RefreshTokenType } from "../types";

export const requestWindow = (
  tabWindow: Window,
  url: string,
  resultKey?: string,
  errorKey?: string,
): Promise<RefreshTokenType> => {
  return new Promise((resolve, reject) => {
    tabWindow.location.href = url;
    const subscribeWindow = setInterval(() => {
      const isClosed = tabWindow.closed;
      if (isClosed && typeof window !== "undefined") {
        if (!resultKey) reject("Result key not found");
        const result = localStorage.getItem(resultKey!);
        const error = localStorage.getItem(errorKey!);
        if (result) {
          resolve(JSON.parse(result));
        } else if (error) {
          reject(error);
        } else {
          reject("Unexpected error");
        }
        clearInterval(subscribeWindow);
      }
    }, 1000);
  });
};
