// import VehicleCatalog from '../components/VehicleCatalog';

// const CARROS_DATA = [
//   { id: 101, titulo: 'Mazda CX-5 2020', motor: '2.5L 4 Cilindros', transmision: 'Automática', recorrido: '45,000 millas', precio: '18,500', img: '/images/cars.jpg' },
//   { id: 102, titulo: 'Toyota Corolla 2021', motor: '1.8L 4 Cilindros', transmision: 'Automática CVT', recorrido: '38,000 millas', precio: '16,900', img: '/images/cars.jpg' },
//   { id: 103, titulo: 'Honda CR-V 2019', motor: '1.5L Turbo', transmision: 'Automática', recorrido: '52,000 millas', precio: '19,200', img: '/images/cars.jpg' },
//   { id: 104, titulo: 'Nissan Frontier 2022', motor: '3.8L V6', transmision: 'Automática 9 vel.', recorrido: '28,000 millas', precio: '26,800', img: '/images/cars.jpg' },
//   { id: 105, titulo: 'Hyundai Elantra 2020', motor: '2.0L 4 Cilindros', transmision: 'Automática', recorrido: '41,000 millas', precio: '14,800', img: '/images/cars.jpg' },
// ];

// const MARCAS_CARROS = ['Mazda', 'Toyota', 'Honda', 'Nissan', 'Hyundai'];

// export default function Carros() {
//   return (
//     <VehicleCatalog
//       titulo="VENTA DE VEHÍCULOS LIVIANOS"
//       subtitulo="Sedanes, SUV y Pickups para uso personal o comercial."
//       vehiculos={CARROS_DATA}
//       marcas={MARCAS_CARROS}
//     />
//   );
// }

import { useState, useEffect } from 'react';
import VehicleCatalog from '../components/VehicleCatalog';
import api from '../services/api';

export default function Carros() {
  const [vehiculos, setVehiculos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarCarros = async () => {
      try {
        const respuesta = await api.get('/vehiculos');
        
        const carrosDB = respuesta.data.filter(v => 
          v.tipo_vehiculo.toLowerCase().includes('carro') || 
          v.tipo_vehiculo.toLowerCase().includes('auto')
        );

        const carrosAdaptados = carrosDB.map(v => ({
          id: v.id_vehiculo,
          titulo: `${v.marca} ${v.modelo} ${v.anio}`,
          motor: v.caracteristicas ? v.caracteristicas.substring(0, 20) + '...' : 'Consultar',
          transmision: 'Ver detalles',
          recorrido: 'Consultar',
          precio: Number(v.precio).toLocaleString('en-US'),
          img: v.imagen_url 
               ? (v.imagen_url.startsWith('http') ? v.imagen_url : `${import.meta.env.VITE_UPLOADS_URL}${v.imagen_url}`)
               : '/images/cars.jpg'
        }));

        setVehiculos(carrosAdaptados);
        setMarcas([...new Set(carrosDB.map(v => v.marca))]);
      } catch (error) {
        console.error("Error cargando carros:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarCarros();
  }, []);

  if (cargando) return <div className="text-center py-20 text-[#e5a93b]">Cargando catálogo...</div>;

  return (
    <VehicleCatalog
      titulo="VENTA DE VEHÍCULOS LIVIANOS"
      subtitulo="Sedanes, SUV y Pickups para uso personal o comercial."
      vehiculos={vehiculos}
      marcas={marcas}
    />
  );
}