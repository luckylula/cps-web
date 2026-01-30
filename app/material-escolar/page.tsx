import { Suspense } from "react";
import MaterialEscolarContent from "./MaterialEscolarContent";
import Navigation from "@/app/components/Navigation";

export const dynamic = "force-dynamic";

function MaterialEscolarFallback() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <section className="pt-16 pb-12 px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="h-10 bg-gray-200 rounded animate-pulse max-w-2xl mx-auto mb-4" />
          <div className="h-6 bg-gray-100 rounded animate-pulse max-w-3xl mx-auto" />
        </div>
      </section>
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </section>
      <footer className="py-8 px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm font-light">
          <p>© 2024 Control Play Sports S.L. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default function MaterialEscolarPage() {
  return (
    <Suspense fallback={<MaterialEscolarFallback />}>
      <MaterialEscolarContent />
    </Suspense>
  );
}
