import VehicleCatalog from '../components/VehicleCatalog';

const CARROS_DATA = [
  { id: 101, titulo: 'Mazda CX-5 2020', motor: '2.5L 4 Cilindros', transmision: 'Automática', recorrido: '45,000 millas', precio: '18,500' },
  { id: 102, titulo: 'Toyota Corolla 2021', motor: '1.8L 4 Cilindros', transmision: 'Automática CVT', recorrido: '38,000 millas', precio: '16,900' },
  { id: 103, titulo: 'Honda CR-V 2019', motor: '1.5L Turbo', transmision: 'Automática', recorrido: '52,000 millas', precio: '19,200' },
  { id: 104, titulo: 'Nissan Frontier 2022', motor: '3.8L V6', transmision: 'Automática 9 vel.', recorrido: '28,000 millas', precio: '26,800' },
  { id: 105, titulo: 'Hyundai Elantra 2020', motor: '2.0L 4 Cilindros', transmision: 'Automática', recorrido: '41,000 millas', precio: '14,800' },
];

const MARCAS_CARROS = ['Mazda', 'Toyota', 'Honda', 'Nissan', 'Hyundai'];

export default function Carros() {
  return (
    <VehicleCatalog
      titulo="VENTA DE VEHÍCULOS LIVIANOS"
      subtitulo="Sedanes, SUV y Pickups para uso personal o comercial."
      vehiculos={CARROS_DATA}
      marcas={MARCAS_CARROS}
    />
  );
}