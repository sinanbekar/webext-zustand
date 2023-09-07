import { create } from "zustand";
import { wrapStore } from "webext-zustand";

interface BearState {
  bears: number;
  increase: (by: number) => void;
}

export const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}));

export const storeReadyPromise = wrapStore(useBearStore);

export default useBearStore;
