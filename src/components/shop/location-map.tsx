"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import type { PinnedLocation } from "./location-picker";

/** Roughly the centre of Pakistan, zoomed out to show the whole country. */
const DEFAULT_CENTER: L.LatLngTuple = [30.3753, 69.3451];
const DEFAULT_ZOOM = 5;
const PINNED_ZOOM = 17;

const pinIcon = L.divIcon({
  className: "",
  html: '<span class="location-pin"></span>',
  iconSize: [36, 36],
  iconAnchor: [18, 42],
});

/** Leaflet map: tap to drop the delivery pin, drag it to adjust. Browser-only (loaded with ssr: false). */
export default function LocationMap({
  value,
  onChange,
}: {
  value: PinnedLocation | null;
  onChange: (value: PinnedLocation) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const accuracyRef = useRef<L.Circle | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValue = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initial = initialValue.current;
    const map = L.map(container, {
      center: initial ? [initial.lat, initial.lng] : DEFAULT_CENTER,
      zoom: initial ? PINNED_ZOOM : DEFAULT_ZOOM,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on("click", (event: L.LeafletMouseEvent) => {
      onChangeRef.current({ lat: event.latlng.lat, lng: event.latlng.lng });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      accuracyRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      accuracyRef.current?.remove();
      accuracyRef.current = null;
      return;
    }

    const position = L.latLng(value.lat, value.lng);

    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    } else {
      const marker = L.marker(position, { draggable: true, icon: pinIcon, title: "Delivery location", autoPan: true });
      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        onChangeRef.current({ lat, lng });
      });
      markerRef.current = marker.addTo(map);
    }

    // Show GPS accuracy as a soft circle; hide it once the pin is placed by hand.
    if (value.accuracy && value.accuracy < 2000) {
      if (accuracyRef.current) {
        accuracyRef.current.setLatLng(position).setRadius(value.accuracy);
      } else {
        accuracyRef.current = L.circle(position, {
          radius: value.accuracy,
          color: "#9a5a3a",
          weight: 1,
          fillOpacity: 0.08,
          interactive: false,
        }).addTo(map);
      }
    } else {
      accuracyRef.current?.remove();
      accuracyRef.current = null;
    }

    if (map.getZoom() < 14 || !map.getBounds().contains(position)) {
      map.flyTo(position, PINNED_ZOOM, { duration: 0.8 });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Map. Tap to place your delivery pin, or drag the pin to adjust it."
      // isolate keeps Leaflet's high z-indexes below the sticky header.
      className="isolate h-72 w-full bg-linen sm:h-80"
    />
  );
}
