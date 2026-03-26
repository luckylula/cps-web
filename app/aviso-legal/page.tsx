import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso Legal y Condiciones de Uso',
  description: 'Aviso Legal y Condiciones de Uso de CONTROL PLAY SERVICES, S.L.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AvisoLegalPage() {
  return (
    <main className="bg-white px-6 py-10 text-gray-800 md:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">
          Aviso Legal y Condiciones de Uso
        </h1>
        <p className="mt-3 text-sm text-gray-500">Ultima actualizacion: 26 de marzo de 2025</p>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">1. Datos identificativos del titular</h2>
          <p>
            En cumplimiento del articulo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
            Sociedad de la Informacion y del Comercio Electronico (LSSI-CE), se informa al usuario
            de los datos identificativos del titular:
          </p>
          <p>- Razon social: CONTROL PLAY SERVICES, S.L.</p>
          <p>- CIF: G65565228</p>
          <p>
            - Domicilio social: CL SANT MIQUEL 63 - 08620 - SANT VICENC DELS HORTS - BARCELONA
          </p>
          <p>- Telefono: 930102191</p>
          <p>- Correo electronico: pedidos@cpmaterialdeportivo.com</p>
          <p>- Sitio web: www.cpmaterialdeportivo.com</p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">2. Objeto</h2>
          <p>
            El presente Aviso Legal regula el acceso y utilizacion del sitio web
            www.cpmaterialdeportivo.com, titularidad de CONTROL PLAY SERVICES, S.L., asi como los
            servicios ofrecidos a traves del mismo, principalmente la venta de material deportivo.
          </p>
          <p>
            El acceso y la utilizacion del Sitio Web atribuyen la condicion de usuario e implican la
            aceptacion plena y sin reservas de todas las disposiciones incluidas en este Aviso Legal,
            asi como en la Politica de Privacidad y en la Politica de Cookies vigentes en cada
            momento.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">3. Acceso y uso del Sitio Web</h2>
          <p>
            El acceso al Sitio Web es libre y gratuito, sin perjuicio de que algunos contenidos o
            servicios requieran el registro previo del usuario. El usuario se compromete a hacer un
            uso adecuado y licito del Sitio Web.
          </p>
          <p>El usuario debera abstenerse de:</p>
          <p>- Utilizar el Sitio Web con fines ilicitos, ilegales o contrarios a la buena fe.</p>
          <p>- Realizar actos que puedan danar, inutilizar, sobrecargar o deteriorar el Sitio Web.</p>
          <p>
            - Reproducir, copiar, distribuir o transformar los contenidos del Sitio Web sin
            autorizacion.
          </p>
          <p>
            - Introducir o difundir virus informaticos o cualquier otro sistema que pueda causar
            danos.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">4. Propiedad intelectual e industrial</h2>
          <p>
            Todos los contenidos del Sitio Web (textos, fotografias, graficos, imagenes, tecnologia,
            software, logotipos, marcas, nombres comerciales, bases de datos y disenos) son
            propiedad de CONTROL PLAY SERVICES, S.L. o de terceros que han autorizado su uso, y estan
            protegidos por la legislacion vigente en materia de propiedad intelectual e industrial.
          </p>
          <p>
            Queda expresamente prohibida la reproduccion total o parcial de los contenidos sin la
            autorizacion expresa y por escrito del titular.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">5. Responsabilidad</h2>
          <p>
            CONTROL PLAY SERVICES, S.L. no se hace responsable de los danos y perjuicios que pudieran
            derivarse de:
          </p>
          <p>- La utilizacion del Sitio Web de forma contraria al presente Aviso Legal.</p>
          <p>- Errores tipograficos, inexactitudes o actualizaciones pendientes en los contenidos.</p>
          <p>- La falta de disponibilidad del Sitio Web por causas ajenas al titular.</p>
          <p>
            - Contenidos de sitios web de terceros accesibles mediante enlaces desde el Sitio Web.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">6. Condiciones de compra</h2>
          <p>
            La realizacion de pedidos a traves del Sitio Web implica la aceptacion de las condiciones
            comerciales vigentes, incluyendo precios, condiciones de pago, plazos de entrega y
            politica de devoluciones.
          </p>
          <p>
            El usuario garantiza que es mayor de 18 anos y tiene plena capacidad legal para
            contratar.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">7. Ley aplicable y jurisdiccion</h2>
          <p>
            El presente Aviso Legal se rige por la legislacion espanola vigente. Para la resolucion
            de cualquier controversia, las partes se someten a la jurisdiccion de los Juzgados y
            Tribunales de Barcelona.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">8. Modificaciones</h2>
          <p>
            CONTROL PLAY SERVICES, S.L. se reserva el derecho a modificar en cualquier momento el
            presente Aviso Legal. Se recomienda al usuario que lo lea detenidamente cada vez que
            acceda al Sitio Web.
          </p>
        </section>
      </div>
    </main>
  );
}
