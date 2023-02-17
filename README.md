## Wagmi Bitkubnext Connector

Use a bitkubnext wallet as a wagmi connector!

- BitkubnextConnector - Wagmi connector for bitkubnext
- BitkubNextCaller - To interact with smart contracts on bitkubnext

## Installation

```bash
npm install wagmi-bitkubnext-connector
```

## Usage

```tsx
import { createClient } from "wagmi";
import { BitkubNextConnector, BitkubNextCaller } from "wagmi-bitkubnext-connector";


export const bitkubnextCaller = new BitkubNextCaller({
  clientId: // <YOUR_CLIENT_ID>,
  networkMode: // <YOUR_NETWORK_MODE>,
});

const client = createClient({
  connectors: [
    new BitkubNextConnector({
      options: {
        clientId: // <YOUR_CLIENT_ID>,
        oauthRedirectURI: //<YOUR_REDIRECT_URI>,
        networkMode: // <YOUR_NETWORK_MODE>,
      },
    }),
  ],
});
```

## API

### `options`

| Key              | Value           | Required | Example                              |
| ---------------- | --------------- | -------- | ------------------------------------ |
| networkMode      | testnet,mainnet | true     | testnet                              |
| clientId         | string          | true     | XXXXXX                               |
| oauthRedirectURI | string          | true     | http://localhost:3000/oauth/callback |

## Set up callback pages

### `BitkubnextConnector `

you will need to set up a [callback page](https://github.com/phgoff/wagmi-bitkubnext-connector/tree/main/example/pages/oauth/callback) to receive the access token and login to the wallet.

### `BitkubNextCaller`

you will need to set up a these [callback page](https://github.com/phgoff/wagmi-bitkubnext-connector/tree/main/example/pages/callback) to send the transaction.

```tsx
async function handleSendTransaction() {
  await bitkubnextCaller.send({
    contractAddr: "",
    methodName: "",
    methodParams: [""], // don't need to add sender to params
  });
}
```

## Contribute

Feel free to contribute. Pull requests and issues are welcome!
