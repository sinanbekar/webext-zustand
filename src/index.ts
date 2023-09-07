import {
  Store,
  wrapStore as reduxWrapStore,
} from "@eduardoac-skimlinks/webext-redux";
import type { StoreApi } from "zustand";

export const wrapStore = async <T>(store: StoreApi<T>) => {
  const serializer = (payload: unknown) => JSON.stringify(payload);
  const deserializer = (payload: string) => JSON.parse(payload);

  if (isBackground()) {
    // background
    handleBackground(store, {
      serializer,
      deserializer,
    });

    return;
  } else {
    return handlePages(store, {
      serializer,
      deserializer,
    });
  }
};

type ReduxConfiguration = Parameters<typeof reduxWrapStore>[1];

const handleBackground = <T>(
  store: StoreApi<T>,
  _configuration?: ReduxConfiguration
) => {
  reduxWrapStore({
    getState: store.getState,
    subscribe: store.subscribe,
    //@ts-ignore
    dispatch(action) {
      if (action.type === DISPATCH_TYPE) {
        store.setState(action.payload);
      }
    },
  });
};

const handlePages = async <T>(
  store: StoreApi<T>,
  _configuration?: ReduxConfiguration
) => {
  const { serializer, deserializer, ...configuration } = _configuration || {};
  const proxyStore = new Store(configuration);

  await proxyStore.ready();

  // initial
  store.setState(proxyStore.getState());

  const callback = (state: T) => {
    state = deserializer?.(serializer?.(state)) ?? state;

    // to prevent infinite loop, setting state directly
    //@ts-ignore
    proxyStore.state = state;
    proxyStore.dispatch({ type: DISPATCH_TYPE, payload: state });
  };

  let unsubscribe = store.subscribe(callback);

  proxyStore.subscribe(() => {
    // prevent retrigger
    unsubscribe();
    store.setState(proxyStore.getState());
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

const DISPATCH_TYPE = "STATE_CHANGE";
