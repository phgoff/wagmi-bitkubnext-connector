## Wagmi Bitkubnext Connector

Use a bitkubnext wallet as a wagmi connector!

> _Currently, You can only use it to connect a wallet and read from the contract._.

## Installation

```bash
npm install wagmi-bitkubnext-connector
```

## Usage

```tsx
import { createClient, configureChains } from "wagmi";
import { BitkubNextConnector, bitkubChains } from "wagmi-bitkubnext-connector";

const { provider } = configureChains([bitkubChains.mainnet], [
  jsonRpcProvider({
    priority: 0,
    rpc: (chain) => {
      return {
        http: chain.rpcUrls.default,
      };
    },
  }),
]);

const client = createClient({
  connectors: [
    // ...Other connectors
    new BitkubNextConnector({
      options: {
        networkMode: // <YOUR_NETWORK_MODE>,
        clientId: // <YOUR_CLIENT_ID>,
        oauthRedirectURI: //<YOUR_REDIRECT_URI>,
      },
    }),
  ],
  provider
  // ...Other options
});
```

## API

### `options`

| Key              | Value           | Required |
| ---------------- | --------------- | -------- |
| networkMode      | testnet,mainnet | true     |
| clientId         | string          | true     |
| oauthRedirectURI | string          | true     |

## Callback page example in Next.js

```tsx
// page/oauth/callback.tsx
import { useEffect } from "react";
import { GetServerSidePropsContext } from "next";
import {
  storageKey,
  exchangeAuthorizationCode,
} from "wagmi-bitkubnext-connector";

const CallBackPage = ({ code }: { code: string }) => {
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
              "failed to get access token",
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

export default CallBackPage;
```
