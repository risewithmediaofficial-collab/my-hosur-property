import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDownIcon, MagnifyingGlassIcon } from "./AppIcons";
import { MAIN_AREAS, NEARBY_AREAS, ROAD_AREAS } from "../constants/localities";
import { fetchPropertyLocations } from "../services/api/propertyApi";

const LocalitySearch = () => {
  const navigate = useNavigate();
  const [manualSearch, setManualSearch] = useState("");
  const [dynamicLocations, setDynamicLocations] = useState([]);

  useEffect(() => {
    fetchPropertyLocations()
      .then((locs) => setDynamicLocations(locs || []))
      .catch(() => setDynamicLocations([]));
  }, []);

  const handleLocalitySearch = (locality) => {
    navigate(`/listings?location=${encodeURIComponent(locality)}`);
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualSearch.trim()) {
      handleLocalitySearch(manualSearch.trim());
    }
  };

  // Combine static and dynamic locations, filtering out duplicates
  const allLocationsList = Array.from(
    new Set([
      ...ROAD_AREAS,
      ...MAIN_AREAS,
      ...NEARBY_AREAS,
      ...dynamicLocations,
    ])
  );

  const customPostedLocations = dynamicLocations.filter(
    (loc) => !MAIN_AREAS.includes(loc) && !NEARBY_AREAS.includes(loc) && !ROAD_AREAS.includes(loc)
  );

  return (
    <section className="home-gsap-section bg-gradient-to-b from-white to-slate-50 px-5 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="section-tag">Search by Locality</p>
          <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">
            Find properties in your preferred location
          </h2>
        </div>

        {/* Main Search Bar with Datalist */}
        <div className="home-gsap-card mb-10 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <form onSubmit={handleManualSearch}>
            <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-4 py-3 transition focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20">
              <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0 text-orange" />
              <input
                type="text"
                list="hero-location-datalist"
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
                placeholder="Search area, road, or locality (e.g. Bagalur Road, Mathigiri)..."
                className="w-full bg-transparent text-sm font-medium text-navy outline-none placeholder:text-slate-400"
              />
              <datalist id="hero-location-datalist">
                {allLocationsList.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
              <button
                type="submit"
                className="ml-2 rounded-lg bg-orange px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-orange-600 flex-shrink-0"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Recently Posted / Custom Locations section if any exist */}
        {customPostedLocations.length > 0 && (
          <div className="home-gsap-card mb-8 rounded-xl border border-orange/30 bg-orange/5 p-6 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-navy flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange animate-pulse" />
              Recently Posted Locations
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {customPostedLocations.map((location) => (
                <button
                  key={location}
                  type="button"
                  onClick={() => handleLocalitySearch(location)}
                  className="inline-flex items-center gap-2 rounded-full border border-orange/30 bg-white px-4 py-2 text-xs font-bold text-navy shadow-xs transition hover:bg-orange hover:text-white"
                >
                  📍 {location}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Major Roads, Nearby Areas & Main Areas */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {/* Major Roads */}
          <div className="home-gsap-card rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <h3 className="mb-4 text-lg font-bold text-navy">Major Roads</h3>
            <div className="grid max-h-[500px] grid-cols-1 gap-2.5 overflow-y-auto pr-2">
              {ROAD_AREAS.map((location, index) => (
                <motion.button
                  key={location}
                  type="button"
                  onClick={() => handleLocalitySearch(location)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-left text-xs font-bold text-slate-700 transition duration-200 hover:border-orange hover:bg-orange/10 hover:text-orange active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-orange transition group-hover:scale-125" />
                    <span className="truncate">{location}</span>
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Nearby Areas */}
          <div className="home-gsap-card rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <h3 className="mb-4 text-lg font-bold text-navy">Nearby Areas</h3>
            <div className="grid max-h-[500px] grid-cols-1 gap-2.5 overflow-y-auto pr-2">
              {NEARBY_AREAS.map((location, index) => (
                <motion.button
                  key={location}
                  type="button"
                  onClick={() => handleLocalitySearch(location)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-left text-xs font-bold text-slate-700 transition duration-200 hover:border-orange hover:bg-orange/10 hover:text-orange active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-navy transition group-hover:scale-125" />
                    <span className="truncate">{location}</span>
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Main Areas */}
          <div className="home-gsap-card rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <h3 className="mb-4 text-lg font-bold text-navy">Main Areas</h3>
            <div className="max-h-[500px] space-y-2 overflow-y-auto pr-2">
              {MAIN_AREAS.map((location) => (
                <motion.button
                  key={location}
                  type="button"
                  onClick={() => handleLocalitySearch(location)}
                  className="relative flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 transition duration-200 hover:border-orange hover:bg-orange hover:text-white active:scale-95"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="truncate">{location}</span>
                  <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalitySearch;
