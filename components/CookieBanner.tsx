"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

const STORAGE_KEY = "cp_cookie_consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function applyConsent(consent: CookieConsent) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("consent", "update", {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
  });
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setShowBanner(true);
      return;
    }
    setShowFloatingButton(true);
    try {
      const saved = JSON.parse(raw) as CookieConsent;
      setAnalytics(!!saved.analytics);
      setMarketing(!!saved.marketing);
      applyConsent(saved);
    } catch {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (next: CookieConsent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    applyConsent(next);
    setAnalytics(next.analytics);
    setMarketing(next.marketing);
    setShowBanner(false);
    setShowModal(false);
    setShowFloatingButton(true);
  };

  const acceptAll = () =>
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    });

  const onlyNecessary = () =>
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });

  const saveCustom = () =>
    saveConsent({
      necessary: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    });

  return (
    <>
      {showBanner && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/20 bg-[#1a1a2e] text-white shadow-2xl">
          <div className="mx-auto max-w-6xl px-4 py-4 md:px-6">
            <p className="text-sm leading-relaxed text-gray-200">
              Usamos cookies técnicas y, con tu permiso, cookies analíticas y de
              marketing para mejorar tu experiencia. Consulta nuestra{" "}
              <Link href="/politica-de-cookies" className="text-[#f4a261] underline">
                Política de Cookies
              </Link>{" "}
              y{" "}
              <Link href="/politica-de-privacidad" className="text-[#f4a261] underline">
                Política de Privacidad
              </Link>
              .
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-md bg-[#f4a261] px-4 py-2 text-sm font-semibold text-black hover:opacity-95"
              >
                Aceptar todas
              </button>
              <button
                type="button"
                onClick={onlyNecessary}
                className="rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Solo necesarias
              </button>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Personalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {showFloatingButton && (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="fixed bottom-4 left-4 z-50 rounded-full bg-[#1a1a2e] px-3 py-2 text-xl text-white shadow-lg ring-1 ring-white/20"
          aria-label="Configurar cookies"
        >
          🍪
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-lg bg-[#1a1a2e] p-5 text-white shadow-2xl">
            <h2 className="text-xl font-semibold">Preferencias de cookies</h2>
            <p className="mt-2 text-sm text-gray-300">
              Configura qué categorías de cookies quieres permitir.
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between rounded-md border border-white/20 p-3">
                <div>
                  <p className="font-medium">Cookies técnicas</p>
                  <p className="text-xs text-gray-300">Necesarias para el funcionamiento del sitio.</p>
                </div>
                <input type="checkbox" checked disabled className="h-5 w-5 accent-[#f4a261]" />
              </div>

              <div className="flex items-center justify-between rounded-md border border-white/20 p-3">
                <div>
                  <p className="font-medium">Cookies analíticas</p>
                  <p className="text-xs text-gray-300">Google Analytics / GA4</p>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="h-5 w-5 accent-[#f4a261]"
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-white/20 p-3">
                <div>
                  <p className="font-medium">Cookies de marketing</p>
                  <p className="text-xs text-gray-300">Google Ads, Meta Pixel, Hotjar</p>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="h-5 w-5 accent-[#f4a261]"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveCustom}
                className="rounded-md bg-[#f4a261] px-4 py-2 text-sm font-semibold text-black"
              >
                Guardar preferencias
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-md border border-white/30 px-4 py-2 text-sm font-semibold"
              >
                Aceptar todas
              </button>
              <button
                type="button"
                onClick={onlyNecessary}
                className="rounded-md border border-white/30 px-4 py-2 text-sm font-semibold"
              >
                Solo necesarias
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="ml-auto rounded-md border border-white/30 px-4 py-2 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
