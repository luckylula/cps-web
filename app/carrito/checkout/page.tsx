"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import CartButton from "@/app/components/CartButton";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Inicializar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface FormData {
  nombreCompleto: string;
  nombreCentro: string;
  email: string;
  telefono: string;
  direccion: string;
  nifCif: string;
  metodoEntrega: string;
  paymentMethod: string;
}

interface FormErrors {
  nombreCompleto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  nifCif?: string;
}

// Componente interno para manejar el pago con Stripe (debe estar dentro de Elements)
function StripePaymentSection({ 
  onPaymentSuccess, 
  onPaymentError 
}: { 
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handlePayment = async () => {
    if (!stripe || !elements) {
      onPaymentError("Stripe no está cargado. Por favor, recarga la página.");
      return;
    }

    setIsProcessing(true);
    setPaymentError("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/carrito/checkout`,
        },
        redirect: 'if_required',
      });

      if (error) {
        const errorMessage = error.message || 'Error al procesar el pago';
        setPaymentError(errorMessage);
        onPaymentError(errorMessage);
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess();
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado al procesar el pago';
      setPaymentError(errorMessage);
      onPaymentError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Información de pago
      </h3>
      <div className="p-4 bg-white border border-gray-300 rounded-lg">
        <PaymentElement />
      </div>
      {paymentError && (
        <p className="mt-3 text-sm text-red-500">{paymentError}</p>
      )}
      <button
        type="button"
        onClick={handlePayment}
        disabled={!stripe || !elements || isProcessing}
        className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Procesando pago...
          </>
        ) : (
          "Confirmar pago"
        )}
      </button>
      <p className="text-xs text-gray-500 mt-3">
        🔒 Tu información de pago está protegida y encriptada
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [formData, setFormData] = useState<FormData>({
    nombreCompleto: "",
    nombreCentro: "",
    email: "",
    telefono: "",
    direccion: "",
    nifCif: "",
    metodoEntrega: "estandar",
    paymentMethod: "stripe",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePaymentConfirmed, setStripePaymentConfirmed] = useState(false);
  const [stripeError, setStripeError] = useState("");

  // Calcular totales
  const subtotal = getTotalPrice();
  const iva = subtotal * 0.21;
  const subtotalWithIva = subtotal + iva;
  const shippingCost = formData.metodoEntrega === "express" ? 15 : 0;
  const discountAmount = appliedCoupon 
    ? (subtotalWithIva * appliedCoupon.discountPercent) / 100 
    : 0;
  const finalTotal = subtotalWithIva + shippingCost - discountAmount;

  // Crear PaymentIntent cuando se selecciona Stripe y hay productos
  useEffect(() => {
    if (formData.paymentMethod === "stripe" && items.length > 0) {
      // Resetear si cambia el método de pago
      if (formData.paymentMethod !== "stripe") {
        setClientSecret(null);
        setStripePaymentConfirmed(false);
        return;
      }

      const createPaymentIntent = async () => {
        try {
          const response = await fetch('/api/checkout/create-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: finalTotal,
              currency: 'eur',
            }),
          });

          const data = await response.json();
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
            setStripePaymentConfirmed(false); // Resetear confirmación al crear nuevo intent
          } else if (data.error) {
            setStripeError(data.error);
          }
        } catch (error) {
          console.error('Error creating PaymentIntent:', error);
          setStripeError('Error al inicializar el sistema de pago');
        }
      };

      // Solo crear si no hay clientSecret o si cambió el total
      if (!clientSecret || stripePaymentConfirmed) {
        createPaymentIntent();
      }
    } else {
      // Si no es Stripe, limpiar
      setClientSecret(null);
      setStripePaymentConfirmed(false);
    }
  }, [formData.paymentMethod, finalTotal, items.length]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Por favor, introduce un código de cupón");
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError("");

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: couponCode.trim() }),
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountPercent: data.discountPercent,
        });
        setCouponError("");
        setCouponCode("");
      } else {
        setCouponError(data.error || "Código de cupón no válido");
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError("Error al validar el cupón. Por favor, intenta de nuevo.");
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nombreCompleto.trim()) {
      newErrors.nombreCompleto = "El nombre completo es obligatorio";
    } else if (formData.nombreCompleto.trim().length < 3) {
      newErrors.nombreCompleto = "El nombre debe tener al menos 3 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    } else if (!/^[0-9+\s()-]{9,}$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono no es válido (mínimo 9 caracteres)";
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es obligatoria";
    } else if (formData.direccion.trim().length < 10) {
      newErrors.direccion = "La dirección debe ser más detallada (mínimo 10 caracteres)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Si el método de pago es Stripe, verificar que el pago se haya confirmado
    if (formData.paymentMethod === "stripe") {
      if (!stripePaymentConfirmed) {
        alert("Por favor, completa el pago con tarjeta haciendo clic en 'Confirmar pago' antes de finalizar el pedido.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Preparar datos del pedido (los totales ya están calculados arriba)
      const orderData = {
        customer: {
          nombreCompleto: formData.nombreCompleto.trim(),
          nombreCentro: formData.nombreCentro.trim() || undefined,
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          direccion: formData.direccion.trim(),
          nifCif: formData.nifCif.trim() || undefined,
          metodoEntrega: formData.metodoEntrega,
          paymentMethod: formData.paymentMethod,
        },
        cart: {
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            price: item.price,
            quantity: item.quantity,
          })),
          totalPrice: finalTotal,
        },
        coupon: appliedCoupon ? {
          code: appliedCoupon.code,
          discountAmount: discountAmount,
        } : undefined,
      };

      // Enviar pedido a la API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Error al procesar el pedido';
        const errorDetails = result.details ? `\n\nDetalles:\n${result.details.join('\n')}` : '';
        alert(`${errorMessage}${errorDetails}`);
        return;
      }

      // Pedido creado exitosamente
      console.log("==========================================");
      console.log("📦 PEDIDO CREADO EXITOSAMENTE");
      console.log("==========================================");
      console.log("\n📋 INFORMACIÓN DEL PEDIDO:");
      console.log(`   Número de pedido: ${result.order.orderNumber}`);
      console.log(`   ID: ${result.order.id}`);
      console.log(`   Estado: ${result.order.status}`);
      console.log(`   Total: ${result.order.total}€`);
      console.log(`   Artículos: ${result.order.itemsCount}`);
      console.log(`   Fecha: ${new Date(result.order.createdAt).toLocaleString("es-ES")}`);
      console.log("\n👤 DATOS DEL CLIENTE:");
      console.log(JSON.stringify(orderData.customer, null, 2));
      console.log("\n🛒 PRODUCTOS DEL CARRITO:");
      console.log(JSON.stringify(orderData.cart.items, null, 2));
      console.log("\n==========================================");
      console.log("✅ Pedido guardado en la base de datos");
      console.log("==========================================\n");

      clearCart();

      alert(
        `¡Pedido registrado exitosamente!\n\nNúmero de pedido: ${result.order.orderNumber}\n\nTe hemos enviado un email de confirmación.`
      );

      setTimeout(() => {
        router.push(`/?order=${result.order.orderNumber}`);
      }, 1500);
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      alert("Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si el carrito está vacío, redirigir o mostrar mensaje
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="w-full bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
              <Link
                href="/"
                className="text-white text-lg md:text-xl font-semibold tracking-tight hover:text-orange-300 transition-colors"
              >
                CPS Material Deportivo
              </Link>
              <ul className="flex items-center gap-3 md:gap-6 flex-wrap text-xs md:text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1"
                  >
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

        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Tu carrito está vacío
              </h2>
              <p className="text-gray-600">
                No tienes productos en tu carrito. Añade productos antes de
                finalizar tu pedido.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                href="/carrito"
                className="inline-block px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Ver Carrito
              </Link>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                Volver a la tienda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Los totales ya están calculados arriba, usar finalTotal
  const total = finalTotal;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="w-full bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
            <Link
              href="/"
              className="text-white text-lg md:text-xl font-semibold tracking-tight hover:text-orange-300 transition-colors"
            >
              CPS Material Deportivo
            </Link>
            <ul className="flex items-center gap-3 md:gap-6 flex-wrap text-xs md:text-sm">
              <li>
                <Link
                  href="/"
                  className="text-white hover:text-orange-300 transition-colors font-medium py-2 px-1"
                >
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-orange-500 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/carrito" className="hover:text-orange-500 transition-colors">
            Carrito
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Checkout</span>
        </nav>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column - Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6 lg:p-8">
                {/* Información de Contacto */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                    Información de contacto
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Usaremos esta información para contactarte sobre tu pedido
                  </p>

                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="tu@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="telefono"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                          errors.telefono ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="+34 600 000 000"
                      />
                      {errors.telefono && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.telefono}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dirección de Envío */}
                <div className="mb-10">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                    Dirección de envío
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    ¿A dónde quieres que enviemos tu pedido?
                  </p>

                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor="nombreCompleto"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Nombre completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="nombreCompleto"
                        name="nombreCompleto"
                        value={formData.nombreCompleto}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                          errors.nombreCompleto ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Juan Pérez García"
                      />
                      {errors.nombreCompleto && (
                        <p className="mt-1.5 text-sm text-red-500">
                          {errors.nombreCompleto}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="nombreCentro"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Nombre del centro <span className="text-gray-400 text-xs font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        id="nombreCentro"
                        name="nombreCentro"
                        value={formData.nombreCentro}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="Colegio San Juan"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="direccion"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Dirección completa <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="direccion"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none ${
                          errors.direccion ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Calle, número, piso, ciudad, código postal, provincia"
                      />
                      {errors.direccion && (
                        <p className="mt-1.5 text-sm text-red-500">
                          {errors.direccion}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="nifCif"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        NIF/CIF <span className="text-gray-400 text-xs font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        id="nifCif"
                        name="nifCif"
                        value={formData.nifCif}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="12345678A"
                      />
                    </div>
                  </div>
                </div>

                {/* Método de Entrega */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                    Método de entrega
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Selecciona cómo quieres recibir tu pedido
                  </p>

                  <div className="space-y-3">
                    <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-400 transition-colors group">
                      <input
                        type="radio"
                        name="metodoEntrega"
                        value="estandar"
                        checked={formData.metodoEntrega === "estandar"}
                        onChange={handleInputChange}
                        className="mt-1 mr-3 w-4 h-4 text-orange-500 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 group-hover:text-orange-600">
                            Envío estándar
                          </span>
                          <span className="text-sm font-medium text-gray-600">Gratis</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          5-7 días laborables
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-400 transition-colors group">
                      <input
                        type="radio"
                        name="metodoEntrega"
                        value="express"
                        checked={formData.metodoEntrega === "express"}
                        onChange={handleInputChange}
                        className="mt-1 mr-3 w-4 h-4 text-orange-500 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 group-hover:text-orange-600">
                            Envío express
                          </span>
                          <span className="text-sm font-medium text-gray-600">+15€</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          2-3 días laborables
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Método de Pago */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                    Método de pago
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Selecciona cómo quieres pagar tu pedido
                  </p>

                  <div className="space-y-3">
                    <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-400 transition-colors group">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={formData.paymentMethod === "stripe"}
                        onChange={handleInputChange}
                        className="mt-1 mr-3 w-4 h-4 text-orange-500 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 group-hover:text-orange-600">
                            Tarjeta / Apple Pay / Google Pay
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Pago seguro con Stripe
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-400 transition-colors group">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transferencia"
                        checked={formData.paymentMethod === "transferencia"}
                        onChange={handleInputChange}
                        className="mt-1 mr-3 w-4 h-4 text-orange-500 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 group-hover:text-orange-600">
                          Transferencia Bancaria
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          Realiza la transferencia después de confirmar el pedido
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Stripe Elements Container */}
                  {formData.paymentMethod === "stripe" && clientSecret && (
                    <Elements 
                      stripe={stripePromise} 
                      options={{
                        clientSecret,
                        appearance: {
                          theme: 'stripe',
                        },
                      }}
                    >
                      <StripePaymentSection 
                        onPaymentSuccess={() => setStripePaymentConfirmed(true)}
                        onPaymentError={(error) => setStripeError(error)}
                      />
                      {stripeError && (
                        <p className="mt-3 text-sm text-red-500">{stripeError}</p>
                      )}
                    </Elements>
                  )}
                  {formData.paymentMethod === "stripe" && !clientSecret && (
                    <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-500 text-center py-4">
                        Cargando formulario de pago...
                      </p>
                    </div>
                  )}

                  {/* Datos Bancarios */}
                  {formData.paymentMethod === "transferencia" && (
                    <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        Datos bancarios para la transferencia
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Titular:</span>
                          <span className="text-gray-900 font-semibold">Control Play Sports S.L.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">IBAN:</span>
                          <span className="text-gray-900 font-mono font-semibold">ES12 1234 5678 9012 3456 7890</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">SWIFT/BIC:</span>
                          <span className="text-gray-900 font-mono font-semibold">ABCDESMMXXX</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">Banco:</span>
                          <span className="text-gray-900 font-semibold">Banco Ejemplo</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <p className="text-xs text-gray-600">
                            <strong className="text-gray-900">Importante:</strong> Al confirmar el pedido, recibirás un email con el número de pedido. 
                            Incluye este número en el concepto de la transferencia para que podamos identificar tu pago.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Link
                    href="/carrito"
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors text-center"
                  >
                    Volver al carrito
                  </Link>
                  <button
                    type="submit"
                    disabled={
                      isSubmitting || 
                      (formData.paymentMethod === "stripe" && !stripePaymentConfirmed)
                    }
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    title={
                      formData.paymentMethod === "stripe" && !stripePaymentConfirmed
                        ? "Por favor, confirma el pago con tarjeta primero"
                        : undefined
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Procesando...
                      </>
                    ) : formData.paymentMethod === "stripe" && !stripePaymentConfirmed ? (
                      "Confirma el pago primero"
                    ) : (
                      "Confirmar pedido"
                    )}
                  </button>
                  {formData.paymentMethod === "stripe" && !stripePaymentConfirmed && (
                    <p className="text-xs text-orange-600 mt-2 text-center">
                      ⚠️ Debes confirmar el pago con tarjeta antes de finalizar el pedido
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 lg:p-8 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Resumen del pedido
              </h2>

              {/* Coupon Section */}
              <div className="mb-6 pb-6 border-b border-gray-300">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de cupón
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-green-800">
                        {appliedCoupon.code} - {appliedCoupon.discountPercent}% descuento
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      placeholder="PROMO10"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isValidatingCoupon ? (
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        "Aplicar"
                      )}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="mt-2 text-sm text-red-500">{couponError}</p>
                )}
              </div>

              {/* Product List */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                  >
                    {item.images && item.images.length > 0 ? (
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-2">
                        {(item.price * item.quantity).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-6 border-t border-gray-300">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>IVA (21%)</span>
                  <span className="font-medium">{iva.toFixed(2)}€</span>
                </div>
                {formData.metodoEntrega === "express" && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Envío express</span>
                    <span className="font-medium">+15.00€</span>
                  </div>
                )}
                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Descuento ({appliedCoupon.code})</span>
                    <span>-{discountAmount.toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-300">
                  <span>Total</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-300">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Al confirmar el pedido, recibirás un email de confirmación con
                  los detalles de tu compra y el número de seguimiento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
