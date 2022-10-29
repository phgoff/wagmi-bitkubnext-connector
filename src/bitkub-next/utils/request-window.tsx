import { RefreshTokenType } from "../types";

export const requestWindow = (
  tabWindow: Window,
  url: string,
  resultKey?: string,
  errorKey?: string
): Promise<RefreshTokenType> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined") {
      return Promise.reject("window is undefined");
    }

    tabWindow.location.href = url;
    const subscribeWindow = setInterval(() => {
      const isClosed = tabWindow.closed;
      if (isClosed) {
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
    }, 500);
  });
};
