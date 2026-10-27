import VehicleCatalog from "../components/VehicleCatalog";
import useVehicles from "../hooks/useVehicles";

export default function Inventario() {
  const { vehicles, loading, error, retry } = useVehicles();

  return (
    <VehicleCatalog
      titulo="INVENTARIO DE VEHÍCULOS"
      subtitulo="Consulta las unidades registradas en nuestro inventario."
      vehiculos={vehicles}
      cargando={loading}
      error={error}
      onRetry={retry}
    />
  );
}
