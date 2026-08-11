import { useEffect, useMemo } from "react";
import {
  getAreasByVillage,
  getCountries,
  getDistrictsByState,
  getStatesByCountry,
  getTaluksByDistrict,
  getVillagesByTaluk,
} from "../constants/locationData";

const LocationCascadeFilter = ({ values, update }) => {
  const country = values.country || "";
  const state = values.state || "";
  const district = values.district || "";
  const taluk = values.taluk || "";
  const village = values.village || "";
  const locality = values.locality || values.location || "";

  // Available options based on cascading selections
  const countryList = useMemo(() => getCountries(), []);

  const stateList = useMemo(() => {
    return country ? getStatesByCountry(country) : [];
  }, [country]);

  const districtList = useMemo(() => {
    return country && state ? getDistrictsByState(country, state) : [];
  }, [country, state]);

  const talukList = useMemo(() => {
    return country && state && district ? getTaluksByDistrict(country, state, district) : [];
  }, [country, state, district]);

  const villageList = useMemo(() => {
    return country && state && district && taluk ? getVillagesByTaluk(country, state, district, taluk) : [];
  }, [country, state, district, taluk]);

  const areaList = useMemo(() => {
    return country && state && district && taluk && village
      ? getAreasByVillage(country, state, district, taluk, village)
      : [];
  }, [country, state, district, taluk, village]);

  const handleCountryChange = (e) => {
    const val = e.target.value;
    update({
      country: val,
      state: "",
      district: "",
      taluk: "",
      village: "",
      locality: "",
      location: "",
    });
  };

  const handleStateChange = (e) => {
    const val = e.target.value;
    update({
      state: val,
      district: "",
      taluk: "",
      village: "",
      locality: "",
      location: "",
    });
  };

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    update({
      district: val,
      taluk: "",
      village: "",
      locality: "",
      location: "",
    });
  };

  const handleTalukChange = (e) => {
    const val = e.target.value;
    update({
      taluk: val,
      village: "",
      locality: "",
      location: "",
    });
  };

  const handleVillageChange = (e) => {
    const val = e.target.value;
    update({
      village: val,
      locality: "",
      location: val || "",
    });
  };

  const handleLocalityChange = (e) => {
    const val = e.target.value;
    update({
      locality: val,
      location: val || village || taluk || district || "",
    });
  };

  return (
    <div className="location-cascade-container space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Location Filters</p>
        {(country !== "India" || state || district || taluk || village || locality) && (
          <button
            type="button"
            onClick={() =>
              update({
                country: "India",
                state: "",
                district: "",
                taluk: "",
                village: "",
                locality: "",
                location: "",
              })
            }
            className="text-xs font-medium text-orange hover:underline"
          >
            Clear Location
          </button>
        )}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-1">
        {/* 1. Country */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-600">Country</label>
          <select
            className="site-input property-filter-input property-filter-select w-full"
            value={country}
            onChange={handleCountryChange}
          >
            <option value="">Select Country</option>
            {countryList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. State */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-600">State</label>
          <select
            className="site-input property-filter-input property-filter-select w-full"
            value={state}
            onChange={handleStateChange}
            disabled={!country || stateList.length === 0}
          >
            <option value="">Select State</option>
            {stateList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. District */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-600">District</label>
          <select
            className="site-input property-filter-input property-filter-select w-full"
            value={district}
            onChange={handleDistrictChange}
            disabled={!state || districtList.length === 0}
          >
            <option value="">Select District</option>
            {districtList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Taluk */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-600">Taluk</label>
          <select
            className="site-input property-filter-input property-filter-select w-full"
            value={taluk}
            onChange={handleTalukChange}
            disabled={!district || talukList.length === 0}
          >
            <option value="">Select Taluk</option>
            {talukList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Village */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-600">Village</label>
          <select
            className="site-input property-filter-input property-filter-select w-full"
            value={village}
            onChange={handleVillageChange}
            disabled={!taluk || villageList.length === 0}
          >
            <option value="">Select Village</option>
            {villageList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Area / Locality */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-600">Area / Locality</label>
          <select
            className="site-input property-filter-input property-filter-select w-full"
            value={locality}
            onChange={handleLocalityChange}
            disabled={!village && areaList.length === 0}
          >
            <option value="">Select Area / Locality</option>
            {areaList.map((areaName) => (
              <option key={areaName} value={areaName}>
                {areaName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default LocationCascadeFilter;
