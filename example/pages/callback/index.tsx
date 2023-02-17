// @dev: Don't forget to remove the @ts-nocheck comment when you start using.
// @ts-nocheck

import { GetServerSidePropsContext } from "next";
import { useCallback, useEffect } from "react";
import localStorageService from "../../utils/localStorage.service";
import { storageKey } from "wagmi-bitkubnext-connector";
import { bitkubnextCaller } from "../_app";

type CallBackProps = {
  approvalToken: string;
};

const CallBackPage = ({ approvalToken }: CallBackProps) => {
  const accessToken = localStorageService.getItem(storageKey.ACCESS_TOKEN);
  const queueTransaction = useCallback(async () => {
    try {
      if (accessToken && approvalToken) {
        const res = await bitkubnextCaller.createTxQueueApproval({
          accessToken,
          approvalToken,
        });
        localStorageService.setItem(storageKey.TX_QUEUE_ID, res.queue_id);
      }
    } catch (e: any) {
      localStorageService.removeItem(storageKey.TX_QUEUE_ID);
      localStorageService.setItem(storageKey.TX_ERROR, e.response);
    }

    const countdownCloseWindow = setTimeout(() => {
      window.close();
      clearTimeout(countdownCloseWindow);
    }, 1500);
  }, [accessToken, approvalToken]);

  useEffect(() => {
    if (accessToken && approvalToken) {
      queueTransaction();
    }
  }, [accessToken, approvalToken, queueTransaction]);

  return (
    <div>
      <p>Sending Transaction...</p>
    </div>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const query = context.query;

  return {
    props: {
      approvalToken: query.approval_token ?? null,
    },
  };
};

export default CallBackPage;
