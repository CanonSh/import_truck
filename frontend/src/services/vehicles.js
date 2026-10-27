import api from "./api";

let vehiclesRequest;
const vehicleRequests = new Map();

export const getVehicles = () => {
  if (!vehiclesRequest) {
    vehiclesRequest = api.get("/vehiculos").then(({ data }) => {
      if (!Array.isArray(data)) {
        throw new Error(
          "La respuesta del catálogo no tiene un formato válido.",
        );
      }
      return data;
    });
    vehiclesRequest
      .finally(() => {
        vehiclesRequest = undefined;
      })
      .catch(() => {});
  }

  return vehiclesRequest;
};

export const getVehicleById = (id) => {
  const key = String(id);
  if (!vehicleRequests.has(key)) {
    const request = api
      .get(`/vehiculos/${encodeURIComponent(key)}`)
      .then(({ data }) => data);
    vehicleRequests.set(key, request);
    request
      .finally(() => {
        if (vehicleRequests.get(key) === request) vehicleRequests.delete(key);
      })
      .catch(() => {});
  }

  return vehicleRequests.get(key);
};

export const normalizeVehicleType = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const getVehicleTitle = (vehicle) => {
  const model = String(vehicle.modelo ?? "").trim();
  const year = String(vehicle.anio ?? "").trim();
  const values = [vehicle.marca, model];

  if (year && !model.includes(year)) values.push(year);
  return values
    .filter(
      (value) =>
        value !== null && value !== undefined && String(value).trim() !== "",
    )
    .join(" ");
};

export const getVehicleImageUrl = (imagePath) => {
  if (typeof imagePath !== "string" || imagePath.trim() === "") return "";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  const uploadsUrl = import.meta.env.VITE_UPLOADS_URL;
  if (!uploadsUrl) return imagePath;
  return `${uploadsUrl.replace(/\/$/, "")}/${imagePath.replace(/^\//, "")}`;
};
