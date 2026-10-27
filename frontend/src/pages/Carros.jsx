import VehicleCatalog from "../components/VehicleCatalog";
import useVehicles from "../hooks/useVehicles";
import { normalizeVehicleType } from "../services/vehicles";

export default function Carros() {
  const { vehicles, loading, error, retry } = useVehicles();
  const carros = vehicles.filter((vehiculo) => {
    const tipo = normalizeVehicleType(vehiculo.tipo_vehiculo);
    return tipo.includes("carro") || tipo.includes("auto");
  });

  return (
    <VehicleCatalog
      titulo="VENTA DE VEHÍCULOS LIVIANOS"
      subtitulo="Sedanes, SUV y Pickups para uso personal o comercial."
      vehiculos={carros}
      cargando={loading}
      error={error}
      onRetry={retry}
    />
  );
}
