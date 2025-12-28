"use client";

import { MapContainer as LeafletMap, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPointDto } from "@/types/map";

interface Props {
  points: MapPointDto[];
}

export default function MapContainer({ points }: Props) {
  const center = points.length
    ? [points[0].latitude, points[0].longitude]
    : [9.0, 39.0]; // default Ethiopia center

  return (
    <LeafletMap center={center as [number, number]} zoom={13} className="w-full h-full">
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map(point => (
        <Marker key={point.id} position={[point.latitude, point.longitude]}>
          <Popup>
            <div>
              <h3 className="font-semibold">{point.name}</h3>
              <p>{point.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </LeafletMap>
  );
}
