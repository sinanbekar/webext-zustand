import {
  Store,
  wrapStore as reduxWrapStore,
} from "@eduardoac-skimlinks/webext-redux";
import type { StoreApi } from "zustand";

export const wrapStore = async <T>(store: StoreApi<T>) => {
  const portName = PORTNAME_PREFIX + getStoreId(store);
  const serializer = (payload: unknown) => JSON.stringify(payload);
  const deserializer = (payload: string) => JSON.parse(payload);

  if (isBackground()) {
    handleBackground(store, {
      portName,
      serializer,
      deserializer,
    });

    return;
  } else {
    return handlePages(store, {
      portName,
      serializer,
      deserializer,
    });
  }
};

const handleBackground = <T>(
  store: StoreApi<T>,
  configuration?: BackgroundConfiguration
) => {
  reduxWrapStore(
    {
      getState: store.getState,
      subscribe: store.subscribe,
      //@ts-ignore
      dispatch(data: { _sender: chrome.runtime.MessageSender; state: T }) {
        store.setState(data.state);

        return { payload: data.state };
      },
    },
    configuration
  );
};

const handlePages = async <T>(
  store: StoreApi<T>,
  configuration?: PagesConfiguration
) => {
  const proxyStore = new Store(configuration);
  // wait to be ready
  await proxyStore.ready();
  // initial state
  store.setState(proxyStore.getState());

  const callback = (state: T, oldState: T) => {
    (proxyStore.dispatch({ state }) as unknown as Promise<T>).then(
      (syncedState) => {
        if (syncedState) {
          // success
        } else {
          // error (edge case)
          // prevent infinite loop
          unsubscribe();
          // revert
          store.setState(oldState);
          // resub
          unsubscribe = store.subscribe(callback);
        }
      }
    );
  };

  let unsubscribe = store.subscribe(callback);

  proxyStore.subscribe(() => {
    // prevent retrigger
    unsubscribe();
    // update
    store.setState(proxyStore.getState());
    // resub
    unsubscribe = store.subscribe(callback);
  });
};

const isBackground = () => {
  const isCurrentPathname = (path?: string | null) =>
    path
      ? new URL(path, location.origin).pathname === location.pathname
      : false;

  const manifest = chrome.runtime.getManifest();

  return (
    !self.window ||
    (chrome.extension.getBackgroundPage &&
      typeof window !== "undefined" &&
      chrome.extension.getBackgroundPage() === window) ||
    (manifest &&
      (isCurrentPathname(manifest.background_page) ||
        (manifest.background &&
          "page" in manifest.background &&
          isCurrentPathname(manifest.background.page)) ||
        Boolean(
          manifest.background &&
            "scripts" in manifest.background &&
            manifest.background.scripts &&
            isCurrentPathname("/_generated_background_page.html")
        )))
  );
};

type BackgroundConfiguration = Parameters<typeof reduxWrapStore>[1];
type PagesConfiguration = ConstructorParameters<typeof Store>[0];

const getStoreId = (() => {
  let id = 0;
  const map = new WeakMap();

  return <T>(store: StoreApi<T>): number => {
    if (!map.has(store)) {
      map.set(store, ++id);
    }

    return map.get(store);
  };
})();

const PORTNAME_PREFIX = `webext-zustand-`;
