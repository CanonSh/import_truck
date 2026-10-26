// import VehicleCatalog from '../components/VehicleCatalog';

// const CAMIONES_DATA = [
//   { id: 1, titulo: 'Freightliner Cascadia 2018', motor: 'Detroit DD15', transmision: 'Automático', recorrido: '600,000 millas', precio: '42,500', img: '/images/cascadia.webp' },
//   { id: 2, titulo: 'Mack Granite Volteo 2017', motor: 'Mack MP8', transmision: 'Manual 10 vel.', recorrido: '450,000 millas', precio: '58,000', img: '/images/granite.jpeg' },
//   { id: 3, titulo: 'Isuzu NPR 2019', motor: '5.2L Diesel', transmision: 'Manual', recorrido: '220,000 km', precio: '32,900', img: '/images/npr.jpg' },
//   { id: 4, titulo: 'Kenworth T800 Volteo 2016', motor: 'Cummins ISX', transmision: 'Manual 18 vel.', recorrido: '520,000 millas', precio: '66,500', img: '/images/t800.jpeg' },
//   { id: 5, titulo: 'Hino 500 Volteo 2020', motor: 'J08E', transmision: 'Manual', recorrido: '180,000 km', precio: '47,900', img: '/images/hino.jpeg' },
//   { id: 6, titulo: 'International ProStar 2019', motor: 'Cummins X15', transmision: 'Automático', recorrido: '410,000 millas', precio: '51,000', img: '/images/npr.jpg' },
// ];

// const MARCAS_CAMIONES = ['Freightliner', 'Mack', 'Isuzu', 'Kenworth', 'Hino', 'International'];

// export default function Camiones() {
//   return (
//     <VehicleCatalog
//       titulo="CATÁLOGO DE CAMIONES"
//       subtitulo="Unidades de carga pesada importadas y listas para operar."
//       vehiculos={CAMIONES_DATA}
//       marcas={MARCAS_CAMIONES}
//     />
//   );
// }

import { useState, useEffect } from 'react';
import VehicleCatalog from '../components/VehicleCatalog';
import api from '../services/api';

export default function Camiones() {
  const [vehiculos, setVehiculos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarCamiones = async () => {
      try {
        // Asumimos que en la BD el tipo_vehiculo es 'Camion' o 'Camión'
        const respuesta = await api.get('/vehiculos');
        
        // Filtramos solo los camiones (puedes ajustar esto según cómo lo guardes en la BD)
        const camionesDB = respuesta.data.filter(v => 
          v.tipo_vehiculo.toLowerCase().includes('camion') || 
          v.tipo_vehiculo.toLowerCase().includes('camión')
        );

        // Adaptamos los datos de la BD a lo que espera tu componente VehicleCard
        const camionesAdaptados = camionesDB.map(v => {
          // Extraemos datos de las características o ponemos valores por defecto
          return {
            id: v.id_vehiculo,
            titulo: `${v.marca} ${v.modelo} ${v.anio}`,
            motor: v.caracteristicas ? v.caracteristicas.substring(0, 20) + '...' : 'Consultar',
            transmision: 'Ver detalles',
            recorrido: 'Consultar',
            precio: Number(v.precio).toLocaleString('en-US'),
            img: v.imagen_url 
                 ? (v.imagen_url.startsWith('http') ? v.imagen_url : `${import.meta.env.VITE_UPLOADS_URL}${v.imagen_url}`)
                 : '/images/default.jpg' // Asegúrate de tener una imagen por defecto
          };
        });

        setVehiculos(camionesAdaptados);
        
        // Extraer marcas únicas para el filtro
        const marcasUnicas = [...new Set(camionesDB.map(v => v.marca))];
        setMarcas(marcasUnicas);

      } catch (error) {
        console.error("Error cargando camiones:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarCamiones();
  }, []);

  if (cargando) return <div className="text-center py-20 text-[#e5a93b]">Cargando catálogo...</div>;

  return (
    <VehicleCatalog
      titulo="CATÁLOGO DE CAMIONES"
      subtitulo="Unidades de carga pesada importadas y listas para operar."
      vehiculos={vehiculos}
      marcas={marcas}
    />
  );
}