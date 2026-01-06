"use client";

import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

interface StripePaymentFormProps {
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

export default function StripePaymentForm({ onPaymentSuccess, onPaymentError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/carrito/checkout`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onPaymentError(error.message || 'Error al procesar el pago');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess();
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
      }
    } catch (err: any) {
      onPaymentError(err.message || 'Error inesperado al procesar el pago');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="stripe-payment-form">
      <div className="p-4 bg-white border border-gray-300 rounded-lg">
        <PaymentElement />
      </div>
      <p className="text-xs text-gray-500 mt-3">
        🔒 Tu información de pago está protegida y encriptada
      </p>
      <input type="hidden" name="stripe-processing" value={isProcessing ? "true" : "false"} />
    </form>
  );
}
