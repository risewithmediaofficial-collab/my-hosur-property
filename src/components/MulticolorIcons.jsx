import React from "react";

/**
 * Premium Multi-color Real SVG Icons for Property Types & Shortcut Categories.
 * Uses vibrant multi-tone gradients, realistic drop shadows, and high-definition details.
 */

export const PlotMulticolorIcon = ({ className = "h-6 w-6" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="plotGrad1" x1="4" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="plotGrad2" x1="12" y1="8" x2="36" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    {/* Plot Land Base */}
    <path d="M6 26L24 14L42 26L24 38L6 26Z" fill="url(#plotGrad1)" />
    <path d="M6 26L24 38V44L6 32V26Z" fill="#047857" opacity="0.8" />
    <path d="M42 26L24 38V44L42 32V26Z" fill="#065F46" opacity="0.9" />
    {/* Grid / Boundary Lines */}
    <path d="M15 20L33 32" stroke="#A7F3D0" strokeWidth="1.5" strokeDasharray="3 2" />
    <path d="M33 20L15 32" stroke="#A7F3D0" strokeWidth="1.5" strokeDasharray="3 2" />
    {/* Corner Boundary Markers */}
    <circle cx="24" cy="14" r="2.5" fill="#F59E0B" />
    <circle cx="6" cy="26" r="2.5" fill="#F59E0B" />
    <circle cx="42" cy="26" r="2.5" fill="#F59E0B" />
    <circle cx="24" cy="38" r="2.5" fill="#F59E0B" />
    {/* Mini Pin */}
    <path d="M24 6C21.7909 6 20 7.79086 20 10C20 13 24 18 24 18C24 18 28 13 28 10C28 7.79086 26.2091 6 24 6Z" fill="url(#plotGrad2)" />
    <circle cx="24" cy="10" r="1.5" fill="#FFFFFF" />
  </svg>
);

export const VillaMulticolorIcon = ({ className = "h-6 w-6" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="villaRoof" x1="4" y1="20" x2="44" y2="4" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="villaWall" x1="10" y1="20" x2="38" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F3F4F6" />
        <stop offset="100%" stopColor="#E5E7EB" />
      </linearGradient>
      <linearGradient id="villaDoor" x1="20" y1="30" x2="28" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
    </defs>
    {/* Main House Structure */}
    <path d="M8 20H40V42H8V20Z" fill="url(#villaWall)" stroke="#CBD5E1" strokeWidth="1" />
    {/* Roof */}
    <path d="M4 21L24 5L44 21H4Z" fill="url(#villaRoof)" />
    {/* Garage / Side wing */}
    <path d="M30 24H42V42H30V24Z" fill="#DBEAFE" />
    <path d="M30 24L42 16V24H30Z" fill="#1D4ED8" opacity="0.7" />
    {/* Windows */}
    <rect x="13" y="24" width="6" height="7" rx="1" fill="#60A5FA" stroke="#2563EB" strokeWidth="1" />
    <rect x="22" y="24" width="5" height="5" rx="1" fill="#FDE047" stroke="#D97706" strokeWidth="0.8" />
    <rect x="33" y="28" width="6" height="5" rx="1" fill="#93C5FD" />
    {/* Door */}
    <path d="M19 33H26V42H19V33Z" fill="url(#villaDoor)" />
    <circle cx="24.5" cy="38" r="0.8" fill="#FEF08A" />
    {/* Garden Base */}
    <rect x="2" y="41" width="44" height="3" rx="1.5" fill="#10B981" />
  </svg>
);

export const VillaFlatMulticolorIcon = ({ className = "h-6 w-6" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vfTower" x1="22" y1="6" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <linearGradient id="vfVilla" x1="4" y1="22" x2="26" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* Highrise Tower (Flat) */}
    <rect x="24" y="6" width="18" height="36" rx="2" fill="url(#vfTower)" />
    <rect x="27" y="10" width="4" height="4" rx="0.5" fill="#93C5FD" />
    <rect x="35" y="10" width="4" height="4" rx="0.5" fill="#FDE047" />
    <rect x="27" y="17" width="4" height="4" rx="0.5" fill="#FDE047" />
    <rect x="35" y="17" width="4" height="4" rx="0.5" fill="#93C5FD" />
    <rect x="27" y="24" width="4" height="4" rx="0.5" fill="#93C5FD" />
    <rect x="35" y="24" width="4" height="4" rx="0.5" fill="#93C5FD" />
    <rect x="27" y="31" width="4" height="4" rx="0.5" fill="#FDE047" />
    <rect x="35" y="31" width="4" height="4" rx="0.5" fill="#93C5FD" />
    {/* Villa in front */}
    <path d="M4 24L16 12L28 24V42H4V24Z" fill="url(#vfVilla)" />
    <path d="M4 24H28L16 12L4 24Z" fill="#B45309" opacity="0.6" />
    <rect x="8" y="27" width="5" height="5" rx="1" fill="#FEF3C7" />
    <rect x="18" y="27" width="5" height="5" rx="1" fill="#FEF3C7" />
    <path d="M13 34H19V42H13V34Z" fill="#1E293B" />
    {/* Green Base */}
    <rect x="2" y="41" width="44" height="3" rx="1.5" fill="#10B981" />
  </svg>
);

export const HouseMulticolorIcon = ({ className = "h-6 w-6" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="houseRoof" x1="6" y1="18" x2="42" y2="4" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#B91C1C" />
      </linearGradient>
      <linearGradient id="houseBody" x1="10" y1="18" x2="38" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#FDE68A" />
      </linearGradient>
    </defs>
    <path d="M6 20L24 6L42 20H6Z" fill="url(#houseRoof)" />
    <rect x="9" y="20" width="30" height="22" rx="1" fill="url(#houseBody)" stroke="#F59E0B" strokeWidth="1" />
    <rect x="14" y="25" width="7" height="7" rx="1" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="1" />
    <rect x="27" y="25" width="7" height="7" rx="1" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="1" />
    <path d="M21 34H27V42H21V34Z" fill="#78350F" />
    <circle cx="25.5" cy="38" r="0.8" fill="#FDE047" />
    <rect x="4" y="41" width="40" height="3" rx="1.5" fill="#059669" />
  </svg>
);

export const FlatMulticolorIcon = ({ className = "h-6 w-6" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="flatBody" x1="10" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0EA5E9" />
        <stop offset="100%" stopColor="#0369A1" />
      </linearGradient>
    </defs>
    <rect x="10" y="6" width="28" height="36" rx="3" fill="url(#flatBody)" />
    {/* Window Grid */}
    <rect x="15" y="11" width="6" height="5" rx="1" fill="#FEF08A" />
    <rect x="27" y="11" width="6" height="5" rx="1" fill="#E0F2FE" />
    <rect x="15" y="19" width="6" height="5" rx="1" fill="#E0F2FE" />
    <rect x="27" y="19" width="6" height="5" rx="1" fill="#FEF08A" />
    <rect x="15" y="27" width="6" height="5" rx="1" fill="#FEF08A" />
    <rect x="27" y="27" width="6" height="5" rx="1" fill="#E0F2FE" />
    {/* Entrance */}
    <path d="M20 35H28V42H20V35Z" fill="#1E293B" />
    <rect x="2" y="41" width="44" height="3" rx="1.5" fill="#64748B" />
  </svg>
);

export const CommercialMulticolorIcon = ({ className = "h-6 w-6" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="commGrad1" x1="6" y1="12" x2="28" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#4338CA" />
      </linearGradient>
      <linearGradient id="commGrad2" x1="26" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#6D28D9" />
      </linearGradient>
    </defs>
    {/* Back Tower */}
    <rect x="8" y="14" width="18" height="28" rx="2" fill="url(#commGrad1)" />
    <rect x="12" y="18" width="4" height="4" rx="0.5" fill="#A5B4FC" />
    <rect x="18" y="18" width="4" height="4" rx="0.5" fill="#A5B4FC" />
    <rect x="12" y="25" width="4" height="4" rx="0.5" fill="#FDE047" />
    <rect x="18" y="25" width="4" height="4" rx="0.5" fill="#A5B4FC" />
    <rect x="12" y="32" width="4" height="4" rx="0.5" fill="#A5B4FC" />
    <rect x="18" y="32" width="4" height="4" rx="0.5" fill="#FDE047" />

    {/* Front Main Tower */}
    <rect x="24" y="6" width="18" height="36" rx="2" fill="url(#commGrad2)" />
    <rect x="28" y="10" width="10" height="4" rx="0.5" fill="#DDD6FE" opacity="0.9" />
    <rect x="28" y="17" width="10" height="4" rx="0.5" fill="#DDD6FE" opacity="0.9" />
    <rect x="28" y="24" width="10" height="4" rx="0.5" fill="#FDE047" />
    <rect x="28" y="31" width="10" height="4" rx="0.5" fill="#DDD6FE" opacity="0.9" />
    <path d="M29 38H37V42H29V38Z" fill="#1E1B4B" />
    <rect x="2" y="41" width="44" height="3" rx="1.5" fill="#3B82F6" />
  </svg>
);

export const FarmLandMulticolorIcon = ({ className = "h-6 w-6" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="farmSky" x1="0" y1="0" x2="48" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#7DD3FC" />
      </linearGradient>
      <linearGradient id="farmField" x1="0" y1="20" x2="48" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#84CC16" />
        <stop offset="100%" stopColor="#4D7C0F" />
      </linearGradient>
      <linearGradient id="farmBarn" x1="28" y1="16" x2="44" y2="34" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
    </defs>
    {/* Sky & Sun */}
    <path d="M4 22C4 12 12 4 24 4C36 4 44 12 44 22V24H4V22Z" fill="url(#farmSky)" />
    <circle cx="14" cy="12" r="5" fill="#FBBF24" />
    {/* Farm Land Fields */}
    <path d="M4 24C14 22 34 22 44 24V42H4V24Z" fill="url(#farmField)" />
    <path d="M4 30C16 28 32 32 44 28" stroke="#FACC15" strokeWidth="2" />
    <path d="M4 36C18 34 30 38 44 34" stroke="#FACC15" strokeWidth="2" />
    {/* Red Barn */}
    <path d="M28 20L36 13L44 20V34H28V20Z" fill="url(#farmBarn)" />
    <path d="M28 20H44L36 13L28 20Z" fill="#7F1D1D" opacity="0.6" />
    <rect x="33" y="25" width="6" height="9" rx="0.5" fill="#FEF08A" />
    <path d="M33 29H39" stroke="#92400E" strokeWidth="1" />
    <path d="M36 25V34" stroke="#92400E" strokeWidth="1" />
    {/* Windmill / Tree accent */}
    <circle cx="10" cy="22" r="4" fill="#15803D" />
    <rect x="9" y="24" width="2" height="6" fill="#78350F" />
  </svg>
);

export const AgricultureLandMulticolorIcon = ({ className = "h-6 w-6" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="agriField1" x1="4" y1="18" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#22C55E" />
        <stop offset="100%" stopColor="#15803D" />
      </linearGradient>
    </defs>
    <path d="M4 20C14 16 34 16 44 20V42H4V20Z" fill="url(#agriField1)" />
    {/* Soil & Crop Rows */}
    <path d="M6 24C16 22 32 26 42 24" stroke="#A3E635" strokeWidth="2.5" />
    <path d="M6 30C16 28 32 32 42 30" stroke="#FACC15" strokeWidth="2.5" />
    <path d="M6 36C16 34 32 38 42 36" stroke="#A3E635" strokeWidth="2.5" />
    {/* Sprouting Crop Plants */}
    <path d="M12 18C10 14 12 10 14 8C16 10 16 14 14 18H12Z" fill="#FACC15" />
    <path d="M22 17C20 13 22 9 24 7C26 9 26 13 24 17H22Z" fill="#84CC16" />
    <path d="M32 18C30 14 32 10 34 8C36 10 36 14 34 18H32Z" fill="#FACC15" />
    <rect x="2" y="41" width="44" height="3" rx="1.5" fill="#78350F" />
  </svg>
);

export const BuyCategoryMulticolorIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="buyGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#buyGrad)" />
    <path d="M9 13.5L16 8L23 13.5V23C23 23.5523 22.5523 24 22 24H10C9.44772 24 9 23.5523 9 23V13.5Z" fill="#FFFFFF" opacity="0.9" />
    <circle cx="16" cy="17" r="3" fill="#047857" />
    <path d="M16 14V17L18 19" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const SellCategoryMulticolorIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sellGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#sellGrad)" />
    <path d="M9 11C9 9.89543 9.89543 9 11 9H21C22.1046 9 23 9.89543 23 11V21C23 22.1046 22.1046 23 21 23H11C9.89543 23 9 22.1046 9 21V11Z" fill="#FFFFFF" opacity="0.9" />
    <path d="M16 12V20M13 14H18.5C19 14 19.5 14.5 19.5 15C19.5 15.5 19 16 18.5 16H13.5C13 16 12.5 16.5 12.5 17C12.5 17.5 13 18 13.5 18H19" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const RentCategoryMulticolorIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rentGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0EA5E9" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#rentGrad)" />
    <circle cx="14" cy="14" r="5" fill="#FFFFFF" />
    <path d="M17.5 17.5L24 24M21 21L23 23M23 19L24 20" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="14" cy="14" r="2" fill="#0369A1" />
  </svg>
);

export const LoanCategoryMulticolorIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="loanGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#6D28D9" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#loanGrad)" />
    <rect x="9" y="8" width="14" height="16" rx="2" fill="#FFFFFF" opacity="0.9" />
    <path d="M12 12H20M12 16H18M12 20H16" stroke="#5B21B6" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="21" cy="21" r="5" fill="#FDE047" stroke="#6D28D9" strokeWidth="1.5" />
    <text x="21" y="24" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#78350F">%</text>
  </svg>
);

export const ConstructionCategoryMulticolorIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="constGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#C2410C" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#constGrad)" />
    <path d="M10 18C10 13.5817 12.6863 10 16 10C19.3137 10 22 13.5817 22 18H10Z" fill="#FDE047" />
    <rect x="7" y="18" width="18" height="3" rx="1" fill="#FEF08A" />
    <rect x="15" y="10" width="2" height="8" fill="#D97706" />
    <path d="M10 24L22 24" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const InteriorCategoryMulticolorIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="intGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#BE185D" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#intGrad)" />
    <path d="M10 13C10 11.8954 10.8954 11 12 11H20C21.1046 11 22 11.8954 22 13V18H10V13Z" fill="#FFFFFF" opacity="0.9" />
    <rect x="8" y="16" width="16" height="5" rx="1.5" fill="#FCE7F3" />
    <path d="M10 21V25M22 21V25" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const HomeOfficeServicesMulticolorIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="servGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#0E7490" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#servGrad)" />
    <path d="M18 10C16.8954 10 16 10.8954 16 12C16 12.8 16.47 13.48 17.15 13.8L11.5 19.45C11.1 19.85 11.1 20.5 11.5 20.9L12.1 21.5C12.5 21.9 13.15 21.9 13.55 21.5L19.2 15.85C19.52 16.53 20.2 17 21 17C22.1046 17 23 16.1046 23 15L20 12L21 10H18Z" fill="#FFFFFF" />
    <circle cx="9" cy="9" r="1.5" fill="#FEF08A" />
    <circle cx="24" cy="23" r="1" fill="#FEF08A" />
  </svg>
);

export const PropertyManagementMulticolorIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mgmtGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#mgmtGrad)" />
    <path d="M16 8L23 11V16.5C23 20.5 19.8 24 16 25C12.2 24 9 20.5 9 16.5V11L16 8Z" fill="#FFFFFF" opacity="0.95" />
    <path d="M13 16L15 18L19.5 13.5" stroke="#1D4ED8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
