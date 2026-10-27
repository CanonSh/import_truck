import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { useParams } from 'react-router-dom';

export default function Contacto() {
  const { servicio: servicioParam } = useParams();

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    servicio: servicioParam ? decodeURIComponent(servicioParam) : 'Compra de vehículo',
    mensaje: '',
  });

  // Sincronizar el campo si el parámetro de la URL cambia
  useEffect(() => {
    if (servicioParam) {
      setForm((prev) => ({
        ...prev,
        servicio: decodeURIComponent(servicioParam),
      }));
    }
  }, [servicioParam]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    const numeroWA = '50372145892';
    const texto = `Hola, mi nombre es ${form.nombre || 'Un cliente'}.\n` +
                  `*Teléfono:* ${form.telefono}\n` +
                  `*Correo:* ${form.correo}\n` +
                  `*Servicio de interés:* ${form.servicio}\n` +
                  `*Mensaje:* ${form.mensaje}`;
    
    window.open(`https://api.whatsapp.com/send?phone=${numeroWA}&text=${encodeURIComponent(texto)}`, '_blank');
  };

  const handleEmail = (e) => {
    e.preventDefault();
    const destinatario = 'info@importtrucklb.com';
    const asunto = `Consulta sobre: ${form.servicio} - ${form.nombre}`;
    const cuerpo = `Nombre: ${form.nombre}\n` +
                   `Teléfono: ${form.telefono}\n` +
                   `Correo: ${form.correo}\n` +
                   `Servicio de interés: ${form.servicio}\n\n` +
                   `Mensaje:\n${form.mensaje}`;

    window.location.href = `mailto:${destinatario}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  };

  return (
    <div className="py-8 space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-[#e5a93b]">CONTÁCTANOS</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          ¿Tienes dudas o necesitas una cotización? Escríbenos y te atenderemos a la brevedad.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#0b1726]/90 border border-[#b8860b]/40 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Información de Atención</h3>
            <ul className="space-y-4 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#e5a93b] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Teléfonos</p>
                  <p className="text-slate-400">+503 7214-5892</p>
                  <p className="text-slate-400">+503 2501-7733</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#e5a93b] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Correo Electrónico</p>
                  <p className="text-slate-400">info@importtrucklb.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#e5a93b] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Ubicación</p>
                  <p className="text-slate-400">Carretera a Santa Ana, Km 26, La Libertad, El Salvador</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-[#122238] p-4 rounded-xl border border-slate-800 text-xs text-slate-400">
            <strong className="text-slate-200">Horario:</strong> Lunes a Viernes de 8:00 AM a 5:00 PM. Sábados de 8:00 AM a 12:00 MD.
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#0b1726]/90 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre completo</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Tu nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-xs p-3 rounded-lg focus:outline-none focus:border-[#e5a93b]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  name="telefono"
                  placeholder="+503 0000-0000"
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-xs p-3 rounded-lg focus:outline-none focus:border-[#e5a93b]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  name="correo"
                  placeholder="correo@ejemplo.com"
                  value={form.correo}
                  onChange={handleChange}
                  className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-xs p-3 rounded-lg focus:outline-none focus:border-[#e5a93b]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Servicio de interés</label>
                <select
                  name="servicio"
                  value={form.servicio}
                  onChange={handleChange}
                  className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-xs p-3 rounded-lg focus:outline-none focus:border-[#e5a93b]"
                >
                  <option value="Compra de vehículo">Compra de vehículo</option>
                  <option value="Camiones de Volteo">Camiones de Volteo</option>
                  <option value="Transporte de Carga Pesada">Transporte de Carga Pesada</option>
                  <option value="Servicio de Camión Basurero">Servicio de Camión Basurero</option>
                  <option value="Contrato especial">Contrato especial</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mensaje o detalles de la solicitud</label>
              <textarea
                name="mensaje"
                rows="4"
                placeholder="Escribe tus dudas o requerimientos de carga..."
                value={form.mensaje}
                onChange={handleChange}
                className="w-full bg-[#122238] border border-slate-700 text-slate-200 text-xs p-3 rounded-lg focus:outline-none focus:border-[#e5a93b] resize-none"
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleWhatsApp}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="w-4 h-4" /> Enviar por WhatsApp
              </button>

              <button
                type="button"
                onClick={handleEmail}
                className="flex-1 bg-[#e5a93b] hover:bg-[#f5b84c] text-slate-950 font-bold py-3 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 fill-slate-950" /> Enviar por Correo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}