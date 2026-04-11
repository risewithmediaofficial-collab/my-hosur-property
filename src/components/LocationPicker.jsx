import { useEffect, useRef, useState } from "react";
import { loadExternalScript } from "../utils/loadExternalScript";

const extractComponent = (components, type) => {
  const match = components?.find((c) => c.types?.includes(type));
  return match?.long_name || "";
};

const LocationPicker = ({ location, setLocation }) => {
  const inputRef = useRef(null);
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsFailed, setMapsFailed] = useState(!mapsApiKey);

  useEffect(() => {
    if (!mapsApiKey) {
      return;
    }

    const src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`;
    loadExternalScript(src).then((ok) => {
      if (ok && window.google?.maps?.places) {
        setMapsReady(true);
      } else {
        setMapsFailed(true);
      }
    });
  }, [mapsApiKey]);

  useEffect(() => {
    if (!mapsReady || !inputRef.current || !window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry", "address_components", "name"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place?.geometry?.location) return;

      const city =
        extractComponent(place.address_components, "locality") ||
        extractComponent(place.address_components, "administrative_area_level_2");
      const area =
        extractComponent(place.address_components, "sublocality_level_1") ||
        extractComponent(place.address_components, "neighborhood") ||
        place.name ||
        "";

      setLocation((prev) => ({
        ...prev,
        city: city || prev.city,
        area: area || prev.area,
        address: place.formatted_address || prev.address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }));
    });
  }, [mapsReady, setLocation]);

  const query = encodeURIComponent(
    location.lat && location.lng ? `${location.lat},${location.lng}` : `${location.area || ""}, ${location.city || ""}`
  );

  return (
    <div className="space-y-3 rounded-xl border border-clay/70 p-4">
      <h3 className="text-sm font-bold">Location (Google Maps)</h3>
      <input
        ref={inputRef}
        className="w-full rounded-lg border border-clay px-3 py-2 text-sm"
        placeholder="Search location / locality"
        disabled={mapsFailed}
      />

      {mapsFailed && (
        <p className="text-xs text-ink/60">
          Google Maps key missing or script failed. You can still fill city/area/address manually.
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <input
          className="rounded-lg border border-clay px-3 py-2"
          placeholder="City"
          value={location.city}
          onChange={(e) => setLocation((p) => ({ ...p, city: e.target.value }))}
          required
        />
        <input
          className="rounded-lg border border-clay px-3 py-2"
          placeholder="Area"
          value={location.area}
          onChange={(e) => setLocation((p) => ({ ...p, area: e.target.value }))}
          required
        />
        <input
          className="rounded-lg border border-clay px-3 py-2"
          placeholder="Address"
          value={location.address}
          onChange={(e) => setLocation((p) => ({ ...p, address: e.target.value }))}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded-lg border border-clay px-3 py-2"
          placeholder="Latitude"
          value={location.lat || ""}
          onChange={(e) => setLocation((p) => ({ ...p, lat: e.target.value }))}
        />
        <input
          className="rounded-lg border border-clay px-3 py-2"
          placeholder="Longitude"
          value={location.lng || ""}
          onChange={(e) => setLocation((p) => ({ ...p, lng: e.target.value }))}
        />
      </div>

      <iframe
        title="Location Preview"
        className="h-64 w-full rounded-xl border-0"
        loading="lazy"
        src={`https://maps.google.com/maps?q=${query}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
      />
    </div>
  );
};

export default LocationPicker;
