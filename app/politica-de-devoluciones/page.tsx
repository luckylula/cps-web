import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica de Devoluciones y Reembolsos',
  description: 'Politica de Devoluciones y Reembolsos de CONTROL PLAY SERVICES, S.L.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PoliticaDeDevolucionesPage() {
  return (
    <main className="bg-white px-6 py-10 text-gray-800 md:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">
          Politica de Devoluciones y Reembolsos
        </h1>
        <p className="mt-3 text-sm text-gray-500">Ultima actualizacion: 26 de marzo de 2025</p>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">1. Derecho de desistimiento</h2>
          <p>
            De conformidad con el Real Decreto Legislativo 1/2007, de 16 de noviembre, por el que se
            aprueba el Texto Refundido de la Ley General para la Defensa de los Consumidores y
            Usuarios, el cliente dispone de un plazo de 14 dias naturales desde la recepcion del
            pedido para ejercer su derecho de desistimiento sin necesidad de justificacion.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">2. Como realizar una devolucion</h2>
          <p>
            Para iniciar una devolucion, el cliente debe contactar con nosotros en
            pedidos@cpmaterialdeportivo.com indicando el numero de pedido y el motivo de la
            devolucion. Una vez confirmada la solicitud, se facilitaran las instrucciones para el
            envio del producto. Los articulos deben devolverse en su estado original, sin usar, con
            el embalaje original y con todos los accesorios incluidos.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">3. Gastos de devolucion</h2>
          <p>
            Los gastos de envio derivados de la devolucion correran a cargo del cliente, salvo en los
            casos en que el producto recibido sea defectuoso o no corresponda al pedido realizado, en
            cuyo caso CONTROL PLAY SERVICES, S.L. asumira los costes de recogida y reenvio.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">
            4. Productos excluidos del derecho de devolucion
          </h2>
          <p>No se admitiran devoluciones de:</p>
          <p>- Productos personalizados o fabricados a medida.</p>
          <p>
            - Productos que por razones de higiene o proteccion de la salud hayan sido desprecintados
            tras la entrega.
          </p>
          <p>- Productos que hayan sido usados o danados por el cliente.</p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">5. Reembolso</h2>
          <p>
            Una vez recibido y verificado el producto devuelto, procederemos al reembolso del importe
            en un plazo maximo de 14 dias naturales mediante el mismo metodo de pago utilizado en la
            compra original.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">6. Productos defectuosos o incorrectos</h2>
          <p>
            Si el producto recibido presenta algun defecto o no corresponde al pedido realizado, el
            cliente debe comunicarlo en un plazo maximo de 48 horas desde la recepcion escribiendo a
            pedidos@cpmaterialdeportivo.com. CONTROL PLAY SERVICES, S.L. procedera a la recogida del
            producto y al envio del articulo correcto o al reembolso total, segun prefiera el cliente.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">7. Contacto</h2>
          <p>
            Para cualquier consulta sobre devoluciones o reembolsos:
            pedidos@cpmaterialdeportivo.com
          </p>
        </section>
      </div>
    </main>
  );
}
