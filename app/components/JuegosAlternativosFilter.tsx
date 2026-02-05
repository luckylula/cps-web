"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const TIPO_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "exterior", label: "Juegos exterior" },
  { value: "mesa", label: "Juegos mesa" },
  { value: "acuaticos", label: "Juegos acuáticos" },
] as const;

export default function JuegosAlternativosFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTipo = searchParams?.get("tipo") || "";

  const handleTipoChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value) {
      params.set("tipo", value);
    } else {
      params.delete("tipo");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-gray-700 mb-3">Tipo de juego</p>
      <div className="flex flex-wrap gap-2">
        {TIPO_OPTIONS.map((opt) => (
          <button
            key={opt.value || "todos"}
            onClick={() => handleTipoChange(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentTipo === opt.value
                ? "bg-[#003366] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
