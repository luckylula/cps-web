import ProductCard from './components/ProductCard';

async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/products`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Error al cargar productos');
  }
  
  return res.json();
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            CPS Material Deportivo
          </h1>
          <p className="text-gray-600 mt-1">
            Material deportivo para profesionales
          </p>
        </div>
      </header>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Productos Destacados</h2>
        
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No hay productos disponibles
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}