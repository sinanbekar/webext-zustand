# webext-zustand

Use zustand to share state between pages and background in web extensions.

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
  const root = document.createElement("div");
  document.body.prepend(root);

  createRoot(root).render(
    <React.StrictMode>
      <Content />
    </React.StrictMode>
  );
});
```

## 🛠 Usage with Aliases

Aliases offer a way to execute specific actions exclusively in the background script. They provide a mechanism to ensure that certain logic runs only in the background, especially handy for situations where certain browser APIs are only accessible in the background context.

### Setting up Aliases

In the context of our bear example, let's say you have a special action that should only be executed in the background. For instance, every time bears are incremented by a specific number, you want to send a browser notification.

First, define the aliases in your store setup.

`store.ts`:

```js
const aliases = {
  "special-increment-alias": (store, { by }) => {
    // For demonstration, let's send a browser notification when this alias is triggered.
    browser.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Special Increment!",
      message: `The bears were specially incremented by ${by}!`,
    });

    store.getState().increase(by);
  },
};

export const storeReadyPromise = wrapStore(useBearStore, aliases);

export default useBearStore;
```

### Using Aliases in UI Components

In your UI components (like popup.tsx and content-script.tsx), you can then dispatch this special action:

`popup.tsx`:

```js
import React from "react";
// ... other imports ...

const Popup = () => {
  // ... other states ...

  const specialIncrement = () => {
    useBearStore.setState({ type: "special-increment-alias", by: 5 });
  };

  return (
    <div>
      Popup
      <div>
        <button onClick={specialIncrement}>Special Increment</button>
      </div>
    </div>
  );
};
```

## Architecture

Current implementation is based on the
https://github.com/eduardoacskimlinks/webext-redux (which is a fork of `tshaddix/webext-redux`)

This library adds a minimal layer to support `zustand` and automatic runtime environment detection.

You can find more information on the `webext-redux` package.

## License

[MIT](./LICENSE) License © 2023 [Sinan Bekar](https://github.com/sinanbekar)
