import VehicleCatalog from "../components/VehicleCatalog";
import useVehicles from "../hooks/useVehicles";
import { normalizeVehicleType } from "../services/vehicles";

export default function Camiones() {
  const { vehicles, loading, error, retry } = useVehicles();
  const camiones = vehicles.filter((vehiculo) =>
    normalizeVehicleType(vehiculo.tipo_vehiculo).includes("camion"),
  );

  return (
    <VehicleCatalog
      titulo="CATÁLOGO DE CAMIONES"
      subtitulo="Unidades de carga pesada importadas y listas para operar."
      vehiculos={camiones}
      cargando={loading}
      error={error}
      onRetry={retry}
    />
  );
}
