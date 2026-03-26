import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-8 px-8 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm font-light">
        <div className="mb-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link href="/aviso-legal" className="hover:text-gray-700">
            Aviso Legal
          </Link>
          <Link href="/politica-de-privacidad" className="hover:text-gray-700">
            Política de Privacidad
          </Link>
          <Link href="/politica-de-cookies" className="hover:text-gray-700">
            Política de Cookies
          </Link>
        </div>
        <p>© 2025 Control Play Sports, S.L. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
