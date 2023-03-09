import { BitkubNextCaller } from "../bitkub-next/caller";
import { useCallback, useEffect, useRef } from "react";
import { storageKey } from "../bitkub-next/constants";

export const useCreateQueue = (
  bitkubnextCaller: BitkubNextCaller,
  approvalToken: string,
) => {
  const firstRender = useRef(true);
  const queueTransaction = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem(storageKey.ACCESS_TOKEN);
      if (accessToken && approvalToken) {
        const res = await bitkubnextCaller.createTxQueueApproval({
          accessToken,
          approvalToken,
        });
        if (res.queue_id) {
          localStorage.setItem(
            storageKey.TX_QUEUE_ID,
            JSON.stringify(res.queue_id),
          );
        } else {
          localStorage.setItem(storageKey.TX_ERROR, JSON.stringify(res.error));
        }
      }
    } catch (e: any) {
      localStorage.removeItem(storageKey.TX_QUEUE_ID);
      localStorage.setItem(storageKey.TX_ERROR, JSON.stringify(e.response));
    }

    const countdownCloseWindow = setTimeout(() => {
      window.close();
      clearTimeout(countdownCloseWindow);
    }, 1000);
  }, [approvalToken]);

  useEffect(() => {
    if (firstRender.current) {
      queueTransaction();
      firstRender.current = false;
    }
  }, [queueTransaction]);
};
