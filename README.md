## Wagmi Bitkubnext Connector

## Installation

```bash
npm install wagmi-bitkubnext-connector
```

## Usage

```tsx
import { createClient } from "wagmi";
import { BitkubNextConnector, chains } from "wagmi-bitkubnext-connector";

const client = createClient({
  connectors: [
    // ...Other connectors
    new BitkubNextConnector({
      options: {
        networkMode: BITKUBNEXT_NETWORK_MODE,
        clientId: BITKUBNEXT_CLIENT_ID,
        oauthRedirectURI: BITKUBNEXT_REDIRECT_URI,
      },
    }),
  ],
  // ...Other options
});
```

## API

### `options`

| key              | value           | required |
| ---------------- | --------------- | -------- |
| networkMode      | testnet,mainnet | true     |
| clientId         | string          | true     |
| oauthRedirectURI | string          | true     |
