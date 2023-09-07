import { defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest(async (env) => ({
  manifest_version: 3,
  name: "webext-zustand example",
  description: "webext-zustand example",
  version: "0.1.0",
  background: {
    service_worker: "background.ts",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "file:///*"],
      js: ["content-script.tsx"],
    },
  ],
  host_permissions: ["<all_urls>"],
  action: {
    default_popup: "popup/popup.html",
  },
  permissions: ["storage", "tabs"],
}));

export default manifest;
