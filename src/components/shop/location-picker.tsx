"use client";

import { Check, LoaderCircle, LocateFixed, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { shopButtonClasses } from "./shop-button";

export type PinnedLocation = { lat: number; lng: number; /** GPS accuracy in metres. */ accuracy?: number };

const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse bg-linen sm:h-80" />,
});

function geolocationErrorMessage(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access was blocked. Allow it in your browser settings, or tap your spot on the map instead.";
    case error.TIMEOUT:
      return "Finding your location took too long. Try again, or tap your spot on the map.";
    default:
      return "We couldn't find your location. Try again, or tap your spot on the map.";
  }
}

/** Optional delivery pin: GPS ("use my location") or tap/drag on a map. Submits `latitude` and `longitude` fields. */
export function LocationPicker({
  value,
  onChange,
  error,
}: {
  value: PinnedLocation | null;
  onChange: (value: PinnedLocation | null) => void;
  error?: string;
}) {
  const [mapOpen, setMapOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const showMap = mapOpen || value !== null;

  function locateMe() {
    if (!("geolocation" in navigator)) {
      setMessage("Your browser can't share your location. Tap your spot on the map instead.");
      setMapOpen(true);
      return;
    }

    setLocating(true);
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        setMapOpen(true);
        onChange({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy });
      },
      (geoError) => {
        setLocating(false);
        setMapOpen(true);
        setMessage(geolocationErrorMessage(geoError));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  return (
    <div className="space-y-4">
      {value && (
        <>
          <input type="hidden" name="latitude" value={value.lat.toFixed(6)} />
          <input type="hidden" name="longitude" value={value.lng.toFixed(6)} />
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={locateMe}
          disabled={locating}
          className={shopButtonClasses({ variant: value ? "outline" : "solid", className: "disabled:opacity-60" })}
        >
          {locating ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <LocateFixed className="size-4" strokeWidth={1.75} aria-hidden />
          )}
          {locating ? "Finding you…" : value ? "Use my current location" : "Share my location"}
        </button>
        {!showMap && (
          <button type="button" onClick={() => setMapOpen(true)} className={shopButtonClasses({ variant: "outline" })}>
            <MapPin className="size-4" strokeWidth={1.75} aria-hidden />
            Pick on map
          </button>
        )}
      </div>

      {(message || error) && (
        <p role="alert" className="text-sm text-rust">
          {message ?? error}
        </p>
      )}

      {showMap && (
        <div className="overflow-hidden rounded-2xl ring-1 ring-espresso/10">
          <LocationMap value={value} onChange={(next) => onChange({ lat: next.lat, lng: next.lng })} />
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 text-sm",
              value ? "bg-olive/10" : "bg-linen/70",
            )}
          >
            {value ? (
              <>
                <p className="flex items-center gap-2">
                  <Check className="size-4 text-olive" strokeWidth={2.5} aria-hidden />
                  <span>
                    Location pinned
                    {value.accuracy ? (
                      <span className="text-taupe"> · accurate to about {Math.round(value.accuracy)} m</span>
                    ) : null}
                  </span>
                </p>
                <div className="flex gap-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${value.lat},${value.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-taupe underline underline-offset-4 transition-colors hover:text-espresso"
                  >
                    Check in Google Maps
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(null);
                      setMapOpen(false);
                    }}
                    className="text-taupe underline underline-offset-4 transition-colors hover:text-espresso"
                  >
                    Remove
                  </button>
                </div>
              </>
            ) : (
              <p className="text-taupe">Tap the map to drop a pin on your delivery spot.</p>
            )}
          </div>
        </div>
      )}

      <p className="text-xs leading-relaxed text-taupe">
        Drag the pin to fine-tune it. Your location is only used to deliver this order.
      </p>
    </div>
  );
}
