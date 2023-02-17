// @dev: Don't forget to remove the @ts-nocheck comment when you start using.
// @ts-nocheck

import { useEffect } from "react";
import { GetServerSidePropsContext } from "next";
import {
  storageKey,
  exchangeAuthorizationCode,
} from "wagmi-bitkubnext-connector";

type OAuthCallBackProps = {
  code: string;
};

const OAuthCallBackPage = ({ code }: OAuthCallBackProps) => {
  const getAccessToken = async () => {
    if (window && window.localStorage) {
      if (code) {
        try {
          const result = await exchangeAuthorizationCode(
            // <YOUR_CLIENT_ID>,
            // <YOUR_REDIRECT_URI>,
            code,
          );
          localStorage.setItem(storageKey.ACCESS_TOKEN, result.access_token);
          localStorage.setItem(storageKey.REFRESH_TOKEN, result.refresh_token);
          localStorage.setItem(storageKey.RESULT, JSON.stringify(result));
        } catch (error) {
          if (error.response && error.response.data) {
            localStorage.setItem(storageKey.RESULT_ERROR, error.response.data);
          } else {
            localStorage.setItem(
              storageKey.RESULT_ERROR,
              "failed to get bitkubnext access token",
            );
          }
        }
        const countdownCloseWindow = setTimeout(() => {
          window.close();
          clearTimeout(countdownCloseWindow);
        }, 500);
      }
    }
  };

  useEffect(() => {
    getAccessToken();
  }, []);

  return (
    <div>
      <h1>Connecting to Bitkub Next</h1>
      <p>This window will close automatically</p>
    </div>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const query = context.query;

  return {
    props: {
      code: query.code,
    },
  };
};

export default OAuthCallBackPage;
