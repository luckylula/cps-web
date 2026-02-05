"use client";

import { useState } from 'react';

const useTestWebhook = process.env.NEXT_PUBLIC_N8N_WEBHOOK_TEST === 'true';
const isNoSendMode = process.env.NEXT_PUBLIC_CONTACT_TEST_MODE === 'true';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    asunto: '',
    mensaje: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastResponseType, setLastResponseType] = useState<'normal' | 'testNoSend' | 'testWebhook'>('normal');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Completa este campo';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Completa este campo';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.asunto.trim()) {
      newErrors.asunto = 'Completa este campo';
    }
    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'Completa este campo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const type = data.testMode ? 'testNoSend' : data.testWebhook ? 'testWebhook' : 'normal';
        setLastResponseType(type);
        setSubmitStatus('success');
        setTimeout(() => setSubmitStatus('idle'), type !== 'normal' ? 8000 : 5000);
        setFormData({
          nombre: '',
          telefono: '',
          email: '',
          asunto: '',
          mensaje: '',
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error enviando formulario:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {isNoSendMode && (
        <div className="mb-4 px-3 py-2 bg-amber-500/90 text-black text-sm font-medium rounded">
          Modo test — Los mensajes no se envían al webhook
        </div>
      )}
      {useTestWebhook && !isNoSendMode && (
        <div className="mb-4 px-3 py-2 bg-amber-500/90 text-black text-sm font-medium rounded">
          Usando webhook de prueba — Los mensajes se envían al endpoint de test
        </div>
      )}
      <h3 className="text-base font-bold text-white mb-4 uppercase tracking-wide">
        ENVÍANOS TU MENSAJE
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nombre */}
        <div className="relative">
          <label htmlFor="nombre" className="block text-white mb-1 text-sm font-medium">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm bg-white text-gray-900 rounded border transition-colors ${
              errors.nombre ? 'border-red-400' : 'border-transparent'
            } focus:outline-none focus:ring-2 focus:ring-white/50`}
            placeholder=""
          />
          {errors.nombre && (
            <span className="absolute right-2 top-[34px] text-xs text-gray-400 bg-white px-2 py-1 rounded shadow">
              {errors.nombre}
            </span>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="telefono" className="block text-white mb-1 text-sm font-medium">
            Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm bg-white text-gray-900 rounded border border-transparent focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder=""
          />
        </div>

        {/* Email */}
        <div className="relative">
          <label htmlFor="email" className="block text-white mb-1 text-sm font-medium">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm bg-white text-gray-900 rounded border transition-colors ${
              errors.email ? 'border-red-400' : 'border-transparent'
            } focus:outline-none focus:ring-2 focus:ring-white/50`}
            placeholder=""
          />
          {errors.email && (
            <span className="absolute right-2 top-[34px] text-xs text-gray-400 bg-white px-2 py-1 rounded shadow">
              {errors.email}
            </span>
          )}
        </div>

        {/* Asunto */}
        <div className="relative">
          <label htmlFor="asunto" className="block text-white mb-1 text-sm font-medium">
            Asunto <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="asunto"
            name="asunto"
            value={formData.asunto}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm bg-white text-gray-900 rounded border transition-colors ${
              errors.asunto ? 'border-red-400' : 'border-transparent'
            } focus:outline-none focus:ring-2 focus:ring-white/50`}
            placeholder=""
          />
          {errors.asunto && (
            <span className="absolute right-2 top-[34px] text-xs text-gray-400 bg-white px-2 py-1 rounded shadow">
              {errors.asunto}
            </span>
          )}
        </div>

        {/* Mensaje */}
        <div className="relative">
          <label htmlFor="mensaje" className="block text-white mb-1 text-sm font-medium">
            Mensaje <span className="text-red-400">*</span>
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 text-sm bg-white text-gray-900 rounded border transition-colors resize-y ${
              errors.mensaje ? 'border-red-400' : 'border-transparent'
            } focus:outline-none focus:ring-2 focus:ring-white/50`}
            placeholder=""
          />
          {errors.mensaje && (
            <span className="absolute right-2 top-[88px] text-xs text-gray-400 bg-white px-2 py-1 rounded shadow">
              {errors.mensaje}
            </span>
          )}
        </div>

        {/* Mensajes de estado */}
        {submitStatus === 'success' && (
          <div className={`px-3 py-2 text-sm rounded ${lastResponseType !== 'normal' ? 'bg-amber-600 text-white' : 'bg-green-600 text-white'}`}>
            {lastResponseType === 'testNoSend'
              ? 'Modo test: mensaje recibido correctamente (no se ha enviado al webhook).'
              : lastResponseType === 'testWebhook'
                ? 'Enviado al webhook de prueba correctamente.'
                : '¡Mensaje enviado correctamente! Te responderemos pronto.'}
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="bg-red-600 text-white px-3 py-2 text-sm rounded">
            Error al enviar el mensaje. Por favor, inténtalo de nuevo.
          </div>
        )}

        {/* Botón Enviar */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#003366] hover:bg-[#004080] text-white text-sm font-semibold py-2.5 px-4 rounded transition-colors duration-300 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
