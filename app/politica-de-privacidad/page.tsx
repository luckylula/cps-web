import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica de Privacidad',
  description: 'Politica de Privacidad de CONTROL PLAY SERVICES, S.L.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PoliticaDePrivacidadPage() {
  return (
    <main className="bg-white px-6 py-10 text-gray-800 md:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">Politica de Privacidad</h1>
        <p className="mt-3 text-sm text-gray-500">Ultima actualizacion: 26 de marzo de 2025</p>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">1. Responsable del tratamiento</h2>
          <p>- Responsable: CONTROL PLAY SERVICES, S.L.</p>
          <p>- CIF: G65565228</p>
          <p>- Domicilio: CL SANT MIQUEL 63 - 08620 - SANT VICENC DELS HORTS - BARCELONA</p>
          <p>- Telefono: 930102191</p>
          <p>- Email: pedidos@cpmaterialdeportivo.com</p>
          <p>- Web: www.cpmaterialdeportivo.com</p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">2. Datos personales que recopilamos</h2>
          <p>Recopilamos datos personales en los siguientes contextos:</p>
          <p>
            - Proceso de compra: nombre y apellidos, direccion de envio y facturacion, correo
            electronico, telefono de contacto y datos de pago (gestionados por el proveedor de pago
            autorizado).
          </p>
          <p>
            - Registro de cuenta de usuario: nombre, apellidos, correo electronico y contrasena
            (almacenada de forma cifrada).
          </p>
          <p>- Formulario de contacto: nombre, correo electronico y el contenido del mensaje.</p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">3. Finalidad del tratamiento</h2>
          <p>Tratamos sus datos personales para las siguientes finalidades:</p>
          <p>- Gestionar y ejecutar los pedidos, incluyendo la facturacion y el seguimiento del envio.</p>
          <p>
            - Gestionar su cuenta de usuario y facilitar el acceso a los servicios del Sitio Web.
          </p>
          <p>
            - Atender sus consultas, solicitudes o reclamaciones a traves del formulario de contacto.
          </p>
          <p>- Cumplir con las obligaciones legales y fiscales aplicables.</p>
          <p>
            - Enviar comunicaciones comerciales, unicamente si ha prestado su consentimiento expreso.
          </p>
          <p>
            - Analizar el uso del Sitio Web para mejorarlo (cookies analiticas, previa aceptacion).
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">4. Base juridica del tratamiento</h2>
          <p>
            - Ejecucion de un contrato: para la gestion de pedidos y cuentas de usuario (Art. 6.1.b
            RGPD).
          </p>
          <p>
            - Obligacion legal: para el cumplimiento de obligaciones fiscales y contables (Art. 6.1.c
            RGPD).
          </p>
          <p>
            - Consentimiento: para comunicaciones comerciales y cookies no esenciales (Art. 6.1.a
            RGPD).
          </p>
          <p>
            - Interes legitimo: para la mejora del Sitio Web y la prevencion del fraude (Art. 6.1.f
            RGPD).
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">5. Conservacion de los datos</h2>
          <p>
            - Datos de pedidos y facturacion: 5 anos (obligacion fiscal) o 10 anos si aplica
            obligacion contable.
          </p>
          <p>
            - Datos de cuenta de usuario: mientras la cuenta este activa y durante 2 anos tras su
            eliminacion.
          </p>
          <p>- Datos del formulario de contacto: maximo 2 anos.</p>
          <p>- Datos para comunicaciones comerciales: hasta que retire su consentimiento.</p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">6. Destinatarios de los datos</h2>
          <p>Sus datos podran ser comunicados a:</p>
          <p>- Proveedores de servicios de pago (para la gestion de transacciones).</p>
          <p>- Empresas de transporte y logistica (para la entrega de pedidos).</p>
          <p>- Proveedores tecnologicos y de hosting (como encargados del tratamiento).</p>
          <p>- Administraciones Publicas y autoridades, cuando lo exija la normativa.</p>
          <p>
            No realizamos transferencias internacionales fuera del Espacio Economico Europeo, salvo
            con garantias adecuadas (clausulas contractuales tipo de la Comision Europea).
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">7. Derechos de los usuarios</h2>
          <p>Puede ejercer los siguientes derechos:</p>
          <p>- Acceso: conocer que datos tratamos sobre usted.</p>
          <p>- Rectificacion: solicitar la correccion de datos inexactos.</p>
          <p>- Supresion: solicitar la eliminacion de sus datos.</p>
          <p>- Limitacion: solicitar la restriccion del uso de sus datos.</p>
          <p>- Portabilidad: recibir sus datos en formato estructurado.</p>
          <p>- Oposicion: oponerse al tratamiento, incluido el marketing directo.</p>
          <p>- Retirada del consentimiento: en cualquier momento, sin efecto retroactivo.</p>
          <p>
            Para ejercer sus derechos, escribanos a pedidos@cpmaterialdeportivo.com indicando en el
            asunto "Proteccion de Datos" y adjuntando copia de su DNI.
          </p>
          <p>
            Tambien puede reclamar ante la Agencia Espanola de Proteccion de Datos en www.aepd.es.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">8. Seguridad</h2>
          <p>
            CONTROL PLAY SERVICES, S.L. ha adoptado las medidas tecnicas y organizativas necesarias
            para garantizar la seguridad de los datos personales conforme a la normativa vigente.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">9. Modificaciones</h2>
          <p>
            Nos reservamos el derecho a actualizar esta Politica de Privacidad para adaptarla a
            novedades legislativas. Le informaremos de cambios significativos mediante un aviso en el
            Sitio Web.
          </p>
        </section>
      </div>
    </main>
  );
}
