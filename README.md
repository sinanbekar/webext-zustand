# webext-zustand

Use zustand to share state between pages and background in web extensions.

> **Warning** This package is early in development. Do NOT use in production environment.

## 🚀 Quick Start

```bash
npm install webext-zustand
```

- Create a store based on https://github.com/pmndrs/zustand.
- You can create a store either reactive way or vanilla.
- Wrap the store with `wrapStore`. Import the store from the background.
- You should await for the store to connect to the background.

That's it! Now your store is available from everywhere.

> You can try out the basic example app in the `examples` folder.

`store.ts`

```js
import { create } from 'zustand'
// or import { createStore } from 'zustand/vanilla'
import { wrapStore } from 'webext-zustand'

interface BearState {
  bears: number
  increase: (by: number) => void
}

export const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}))

export const storeReadyPromise = wrapStore(useBearStore);

export default useBearStore;
```

`background.ts`

```js
import store from "./store";

// listen state changes
store.subscribe((state) => {
  // console.log(state);
});

// dispatch
// store.getState().increase(2);
```

`popup.tsx`

```js
import React from "react";
import { createRoot } from "react-dom/client";

import { useBearStore, storeReadyPromise } from "./store";

const Popup = () => {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);

  return (
    <div>
      Popup
      <div>
        <span>Bears: {bears}</span>
        <br />
        <button onClick={() => increase(1)}>Increment +</button>
      </div>
    </div>
  );
};

storeReadyPromise.then(() => {
  createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
});
```

`content-script.tsx`

```js
import React from "react";
import { createRoot } from "react-dom/client";
import { useBearStore, storeReadyPromise } from "./store";

const Content = () => {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);

  return (
    <div>
      Content
      <div>
        <span>Bears: {bears}</span>
        <br />
        <button onClick={() => increase(1)}>Increment +</button>
      </div>
    </div>
  );
};

storeReadyPromise.then(() => {
  createRoot(document.body).render(
    <React.StrictMode>
      <Content />
    </React.StrictMode>
  );
});
```

## Architecture

Current implementation is based on the
https://github.com/eduardoacskimlinks/webext-redux (which is a fork of `tshaddix/webext-redux`)

This library adds a minimal layer to support `zustand` and automatic runtime environment detection.

You can find more information on the `webext-redux` package.

## License

[MIT](./LICENSE) License © 2023 [Sinan Bekar](https://github.com/sinanbekar)
