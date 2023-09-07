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
  const style = document.createElement("style");
  style.textContent = `
  :host {
    all: initial
  }
  `;

  document.head.replaceWith(style);
  document.body.replaceWith(document.createElement("body"));
  const root = document.createElement("div");
  document.body.prepend(root);

  createRoot(root).render(
    <React.StrictMode>
      <Content />
    </React.StrictMode>
  );
});
