import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica de Envios',
  description: 'Politica de Envios de CONTROL PLAY SERVICES, S.L.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PoliticaDeEnviosPage() {
  return (
    <main className="bg-white px-6 py-10 text-gray-800 md:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">Politica de Envios</h1>
        <p className="mt-3 text-sm text-gray-500">Ultima actualizacion: 26 de marzo de 2025</p>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">1. Ambito de entrega</h2>
          <p>
            Realizamos envios unicamente a direcciones situadas en Espana peninsular. No realizamos
            envios a Canarias, Baleares, Ceuta, Melilla ni a otros paises.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">2. Plazos de entrega</h2>
          <p>
            El plazo estimado de entrega es de 5 a 7 dias laborables desde la confirmacion del
            pedido, salvo causa de fuerza mayor o circunstancias ajenas a nuestra voluntad. Los
            pedidos realizados en fin de semana o festivos se procesaran el siguiente dia laborable.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">3. Gastos de envio</h2>
          <p>
            Los gastos de envio se calcularan en funcion del peso y destino del pedido y se mostraran
            de forma desglosada antes de finalizar la compra. Los pedidos con un importe igual o
            superior a 120 EUR (IVA incluido) tienen envio gratuito.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">4. Seguimiento del pedido</h2>
          <p>
            Una vez realizado el envio, el cliente recibira un correo electronico con el numero de
            seguimiento para poder localizar su pedido en todo momento a traves de la web del
            transportista.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">5. Incidencias en la entrega</h2>
          <p>
            Si el pedido no puede entregarse por ausencia del destinatario, el transportista realizara
            un segundo intento de entrega o dejara el paquete en un punto de recogida cercano.
            CONTROL PLAY SERVICES, S.L. no se hace responsable de los retrasos ocasionados por causas
            ajenas a su control.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">6. Contacto</h2>
          <p>
            Para cualquier consulta sobre el estado de su pedido, puede contactarnos en:
            pedidos@cpmaterialdeportivo.com
          </p>
        </section>
      </div>
    </main>
  );
}
