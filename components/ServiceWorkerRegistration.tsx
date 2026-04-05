"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.addEventListener("updatefound", () => {
            const worker = reg.installing;
            if (worker) {
              worker.addEventListener("statechange", () => {
                if (
                  worker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New SW available; could show an update toast here
                  console.info("[MindBridge] App update available.");
                }
              });
            }
          });
        })
        .catch((err) =>
          console.error("[MindBridge] SW registration failed:", err)
        );
    }
  }, []);

  return null;
}
