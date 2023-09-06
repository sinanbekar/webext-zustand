# webext-zustand

Use zustand to share state between pages and background in web extensions.

> **Warning** This package is early in development. Do NOT use in production environment.

## 🚀 Quick Start

```bash
npm install webext-zustand
```

- Create a store based on https://github.com/pmndrs/zustand.
- You can create a store either reactive way or vanilla.
- Wrap the store with `wrapStore`.

That's it! Now your store is available from everywhere.

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

wrapStore(useBearStore);

export default useBearStore;
```

`popup.tsx`

```js
import { useBearStore } from "../store";

const Popup = () => {
  const bears = useBearStore((state) => state.bears);

  return (
    <div>
      <span>Bears: {bears}</span>
    </div>
  );
};
```

`background.ts`

```js
import store from "../store";

// listen state changes
store.subscribe((state) => {
  console.log(state);
});

// dispatch
store.getState().increase(2);
```

You can access the store from `content_script` too.

## Architecture

Current implementation is based on the
https://github.com/eduardoacskimlinks/webext-redux (which is a fork of `tshaddix/webext-redux`)

This library adds a minimal layer to support `zustand` and automatic runtime environment detection.

You can find more information on the `webext-redux` package.

## License

[MIT](./LICENSE) License © 2023 [Sinan Bekar](https://github.com/sinanbekar)