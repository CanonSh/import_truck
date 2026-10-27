import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { getVehicleImageUrl } from "../services/vehicles";

export default function VehicleImage({
  imagePath,
  alt,
  className = "",
  imageClassName = "",
}) {
  const imageUrl = getVehicleImageUrl(imagePath);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [imageUrl]);

  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-[#122238] ${className}`}
    >
      {!imageUrl || failed ? (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-500"
          role="img"
          aria-label={`${alt}: imagen no disponible`}
        >
          <ImageOff className="h-8 w-8" />
          <span className="text-xs">Imagen no disponible</span>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={alt}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${imageClassName}`}
        />
      )}
    </div>
  );
}
