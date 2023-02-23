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
        localStorage.setItem(storageKey.TX_QUEUE_ID, res.queue_id);
      }
    } catch (e: any) {
      localStorage.removeItem(storageKey.TX_QUEUE_ID);
      localStorage.setItem(storageKey.TX_ERROR, e.response);
    }

    const countdownCloseWindow = setTimeout(() => {
      window.close();
      clearTimeout(countdownCloseWindow);
    }, 3000);
  }, [approvalToken]);

  useEffect(() => {
    if (firstRender.current) {
      queueTransaction();
      firstRender.current = false;
    }
  }, [queueTransaction]);
};
