import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-light text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Artículo no encontrado
        </h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, el artículo que buscas no existe o ha sido eliminado.
        </p>
        <Link
          href="/material-escolar"
          className="inline-block px-8 py-3 bg-[#003366] hover:bg-[#004080] text-white font-semibold rounded-full transition-colors"
        >
          Volver a Material Escolar
        </Link>
      </div>
    </div>
  );
}

