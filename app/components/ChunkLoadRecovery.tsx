"use client";

import { useEffect } from "react";

/**
 * Tras un deploy, el navegador puede tener HTML antiguo que referencia chunks
 * que ya no existen → ChunkLoadError 404. Recargar una vez lo soluciona.
 */
export default function ChunkLoadRecovery() {
  useEffect(() => {
    const reloadOnce = () => {
      const key = "cps-chunk-reload";
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
      window.location.reload();
    };

    const isChunkError = (message: string) =>
      /ChunkLoadError|Loading chunk|Failed to load chunk/i.test(message);

    const onError = (event: ErrorEvent) => {
      if (isChunkError(event.message ?? "")) reloadOnce();
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === "string"
          ? reason
          : reason?.message ?? reason?.name ?? "";
      if (isChunkError(String(message))) reloadOnce();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
