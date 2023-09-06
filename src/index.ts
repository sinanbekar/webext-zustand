import {
  Store,
  wrapStore as reduxWrapStore,
} from "@eduardoac-skimlinks/webext-redux";
import type { StoreApi } from "zustand";

export const wrapStore = <T>(store: StoreApi<T>) => {
  const serializer = (payload: unknown) => JSON.stringify(payload);
  const deserializer = (payload: string) => JSON.parse(payload);

  if (!self.window) {
    // background
    handleBackground(store, {
      serializer,
      deserializer,
    });
  } else {
    handlePages(store, {
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

const handlePages = <T>(
  store: StoreApi<T>,
  _configuration?: ReduxConfiguration
) => {
  const { serializer, deserializer, ...configuration } = _configuration || {};
  const proxyStore = new Store(configuration);

  proxyStore.ready().then(() => {
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
  });
};

const DISPATCH_TYPE = "STATE_CHANGE";
