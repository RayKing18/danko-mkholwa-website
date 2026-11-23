"use client";

import { useEffect } from "react";

/** Registers the service worker so the site can be installed to the home screen. */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // avoid caching during development
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* PWA is optional — ignore failures */
    });
  }, []);
  return null;
}
