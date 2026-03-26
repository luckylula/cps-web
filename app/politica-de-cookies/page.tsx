import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica de Cookies',
  description: 'Politica de Cookies de CONTROL PLAY SPORTS, S.L.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PoliticaDeCookiesPage() {
  return (
    <main className="bg-white px-6 py-10 text-gray-800 md:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">Politica de Cookies</h1>
        <p className="mt-3 text-sm text-gray-500">Ultima actualizacion: 26 de marzo de 2025</p>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">1. ¿Que son las cookies?</h2>
          <p>
            Las cookies son pequenos archivos de texto que se almacenan en el dispositivo del usuario
            cuando visita un sitio web. Permiten recordar informacion sobre su visita, como el idioma
            preferido y otras opciones, facilitando futuras visitas.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">2. Tipos de cookies que utilizamos</h2>
          <p>
            En cumplimiento del articulo 22.2 de la LSSI-CE y el RGPD, informamos de las cookies
            utilizadas:
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">
            2.1 Cookies tecnicas o necesarias (no requieren consentimiento)
          </h2>
          <p>
            Son imprescindibles para el correcto funcionamiento del Sitio Web. No pueden
            desactivarse.
          </p>
          <p>- Sesion de usuario (autenticacion y carrito de compra).</p>
          <p>- Preferencias de idioma y region.</p>
          <p>- Token de seguridad CSRF.</p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">
            2.2 Cookies analiticas (requieren consentimiento)
          </h2>
          <p>
            Permiten conocer como los usuarios interactuan con el Sitio Web para mejorarlo.
          </p>
          <p>
            - Google Analytics / GA4 (Google LLC): analiza paginas visitadas, tiempo de permanencia y
            origen del trafico. Politica de privacidad: https://policies.google.com/privacy
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">
            2.3 Cookies de marketing (requieren consentimiento)
          </h2>
          <p>
            Se utilizan para mostrar publicidad personalizada en este y otros sitios.
          </p>
          <p>
            - Google Ads / Google Tag Manager (Google LLC). Politica:
            https://policies.google.com/privacy
          </p>
          <p>
            - Meta Pixel / Facebook Pixel (Meta Platforms, Inc.). Politica:
            https://www.facebook.com/privacy/policy/
          </p>
          <p>
            - Hotjar (Hotjar Ltd.): mapas de calor y grabacion de sesiones. Politica:
            https://www.hotjar.com/legal/policies/privacy/
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">
            3. ¿Como gestionar o desactivar las cookies?
          </h2>
          <p>
            Al acceder al Sitio Web aparecera un banner donde podra aceptar o rechazar las cookies no
            esenciales. Puede cambiar su preferencia en cualquier momento desde el boton 🍪 en la
            esquina inferior izquierda.
          </p>
          <p>Tambien puede configurar su navegador:</p>
          <p>- Google Chrome: https://support.google.com/chrome/answer/95647</p>
          <p>
            - Mozilla Firefox:
            https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies
          </p>
          <p>- Safari: https://support.apple.com/es-es/guide/safari/sfri11471/mac</p>
          <p>- Microsoft Edge: https://support.microsoft.com/es-es/microsoft-edge</p>
          <p>
            La desactivacion de ciertas cookies puede afectar al funcionamiento del Sitio Web.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">
            4. Cookies de terceros y transferencias internacionales
          </h2>
          <p>
            Algunos proveedores (Google, Meta, Hotjar) pueden estar ubicados fuera del Espacio
            Economico Europeo. Ofrecen garantias adecuadas mediante Clausulas Contractuales Tipo o el
            Marco de Privacidad de Datos UE-EE.UU. (Data Privacy Framework).
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">5. Actualizacion de esta Politica</h2>
          <p>
            Nos reservamos el derecho a modificar esta Politica de Cookies para adaptarla a cambios
            normativos o tecnicos.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">6. Contacto</h2>
          <p>Para cualquier consulta escribenos a: pedidos@cpmaterialdeportivo.com</p>
        </section>
      </div>
    </main>
  );
}
