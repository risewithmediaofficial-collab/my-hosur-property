import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDownIcon, MagnifyingGlassIcon } from "./AppIcons";
import { MAIN_AREAS, NEARBY_AREAS } from "../constants/localities";
const LocalitySearch = () => {
  const navigate = useNavigate();
  const [manualSearch, setManualSearch] = useState("");

  const handleLocalitySearch = (locality) => {
    navigate(`/listings?city=${encodeURIComponent(locality)}`);
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualSearch.trim()) {
      handleLocalitySearch(manualSearch.trim());
    }
  };

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

        {/* Main Search Bar */}
        <div className="home-gsap-card mb-10 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <form onSubmit={handleManualSearch}>
            <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-4 py-3 transition focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20">
              <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0 text-orange" />
              <input
                type="text"
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
                placeholder=" "
                className="w-full bg-transparent text-sm font-medium text-navy outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="ml-2 rounded-lg bg-orange px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-orange-600 flex-shrink-0"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Nearby Areas first, Main Areas below */}
        <div className="grid grid-cols-1 gap-6 md:gap-8">
          <div className="home-gsap-card rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <h3 className="mb-4 text-lg font-bold text-navy">Nearby Areas</h3>
            <div className="grid max-h-[600px] grid-cols-1 gap-3 overflow-y-auto pr-3 sm:grid-cols-2 md:grid-cols-3">
              {NEARBY_AREAS.map((location, index) => (
                <motion.button
                  key={location}
                  type="button"
                  onClick={() => handleLocalitySearch(location)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="group rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-left font-medium text-slate-700 transition duration-200 hover:border-orange hover:bg-orange/10 hover:text-orange active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-orange transition group-hover:scale-125" />
                    <span className="truncate">{location}</span>
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="home-gsap-card rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <h3 className="mb-4 text-lg font-bold text-navy">Main Areas</h3>
            <div className="max-h-[600px] space-y-2 overflow-y-auto pr-3">
              {MAIN_AREAS.map((location, index) => (
                <motion.button
                  key={location}
                  type="button"
                  onClick={() => handleLocalitySearch(location)}
                  className="relative flex w-full items-center justify-between rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-left font-semibold text-navy transition duration-200 hover:border-orange hover:bg-orange/10 hover:text-orange active:scale-95"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="truncate">{location}</span>
                  <ChevronDownIcon className="h-5 w-5 flex-shrink-0" />
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
