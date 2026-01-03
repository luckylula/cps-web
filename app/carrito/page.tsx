"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import CartButton from "@/app/components/CartButton";

interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
}

interface FormErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export default function CarritoPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    } else if (!/^[0-9+\s()-]{9,}$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono no es válido";
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Aquí más adelante conectaremos con el webhook de n8n
      // Por ahora, simulamos el envío
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mostrar mensaje de éxito
      setOrderConfirmed(true);
      
      // Vaciar el carrito después de 2 segundos
      setTimeout(() => {
        clearCart();
        setFormData({
          nombre: "",
          email: "",
          telefono: "",
          direccion: "",
        });
        setOrderConfirmed(false);
      }, 3000);
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      alert("Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="w-full bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
              <Link href="/" className="text-white text-lg md:text-xl font-semibold tracking-tight hover:text-orange-300 transition-colors">
                CPS Material Deportivo
              </Link>
              <ul className="flex items-center gap-3 md:gap-6 flex-wrap text-xs md:text-sm">
                <li>
                  <Link href="/" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1">
                    Home
                  </Link>
                </li>
                <li>
                  <CartButton />
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Success Message */}
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h2>
              <p className="text-gray-600">
                Tu pedido ha sido recibido correctamente. Te contactaremos pronto para confirmar los detalles.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="w-full bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
              <Link href="/" className="text-white text-lg md:text-xl font-semibold tracking-tight hover:text-orange-300 transition-colors">
                CPS Material Deportivo
              </Link>
              <ul className="flex items-center gap-3 md:gap-6 flex-wrap text-xs md:text-sm">
                <li>
                  <Link href="/" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1">
                    Home
                  </Link>
                </li>
                <li>
                  <CartButton />
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Empty Cart */}
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
              <p className="text-gray-600">
                No tienes productos en tu carrito. Explora nuestra tienda para encontrar lo que necesitas.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = getTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="w-full bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
            <Link href="/" className="text-white text-lg md:text-xl font-semibold tracking-tight hover:text-orange-300 transition-colors">
              CPS Material Deportivo
            </Link>
            <ul className="flex items-center gap-3 md:gap-6 flex-wrap text-xs md:text-sm">
              <li>
                <Link href="/" className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1">
                  Home
                </Link>
              </li>
              <li>
                <CartButton />
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-light text-gray-900 mb-8">Mi Carrito</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Productos ({items.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4">
                    {/* Imagen */}
                    <div className="relative w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.images[0] || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Información del Producto */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <Link
                          href={`/articulos/${item.slug}`}
                          className="text-lg font-semibold text-gray-900 hover:text-orange-500 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-gray-600 mt-1">
                          {item.price.toFixed(2)}€ unidad
                        </p>
                      </div>

                      {/* Controles de Cantidad */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            aria-label="Disminuir cantidad"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[6rem]">
                          <p className="text-lg font-semibold text-gray-900">
                            {(item.price * item.quantity).toFixed(2)}€
                          </p>
                        </div>

                        {/* Botón Eliminar */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Eliminar producto"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen y Formulario */}
          <div className="lg:col-span-1 space-y-6">
            {/* Resumen del Pedido */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Resumen del Pedido
              </h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío:</span>
                  <span className="text-sm">Calculado al finalizar</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de Datos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Datos de Envío/Contacto
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.nombre ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Juan Pérez"
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="juan@ejemplo.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.telefono ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="+34 600 000 000"
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-sm text-red-500">{errors.telefono}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <textarea
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.direccion ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Calle, número, ciudad, código postal"
                  />
                  {errors.direccion && (
                    <p className="mt-1 text-sm text-red-500">{errors.direccion}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    "Confirmar Pedido"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
