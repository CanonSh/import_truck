import { useEffect, useState } from "react";
import { getVehicles } from "../services/vehicles";

export default function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    getVehicles()
      .then((data) => {
        if (active) setVehicles(data);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.error ||
              requestError.message ||
              "No fue posible cargar el catálogo.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  return {
    vehicles,
    loading,
    error,
    retry: () => setAttempt((current) => current + 1),
  };
}
