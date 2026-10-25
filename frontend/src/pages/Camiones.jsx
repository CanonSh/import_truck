import VehicleCatalog from '../components/VehicleCatalog';

const CAMIONES_DATA = [
  { id: 1, titulo: 'Freightliner Cascadia 2018', motor: 'Detroit DD15', transmision: 'Automático', recorrido: '600,000 millas', precio: '42,500', img: '/images/cascadia.webp' },
  { id: 2, titulo: 'Mack Granite Volteo 2017', motor: 'Mack MP8', transmision: 'Manual 10 vel.', recorrido: '450,000 millas', precio: '58,000', img: '/images/granite.jpeg' },
  { id: 3, titulo: 'Isuzu NPR 2019', motor: '5.2L Diesel', transmision: 'Manual', recorrido: '220,000 km', precio: '32,900', img: '/images/npr.jpg' },
  { id: 4, titulo: 'Kenworth T800 Volteo 2016', motor: 'Cummins ISX', transmision: 'Manual 18 vel.', recorrido: '520,000 millas', precio: '66,500', img: '/images/t800.jpeg' },
  { id: 5, titulo: 'Hino 500 Volteo 2020', motor: 'J08E', transmision: 'Manual', recorrido: '180,000 km', precio: '47,900', img: '/images/hino.jpeg' },
  { id: 6, titulo: 'International ProStar 2019', motor: 'Cummins X15', transmision: 'Automático', recorrido: '410,000 millas', precio: '51,000', img: '/images/npr.jpg' },
];

const MARCAS_CAMIONES = ['Freightliner', 'Mack', 'Isuzu', 'Kenworth', 'Hino', 'International'];

export default function Camiones() {
  return (
    <VehicleCatalog
      titulo="CATÁLOGO DE CAMIONES"
      subtitulo="Unidades de carga pesada importadas y listas para operar."
      vehiculos={CAMIONES_DATA}
      marcas={MARCAS_CAMIONES}
    />
  );
}