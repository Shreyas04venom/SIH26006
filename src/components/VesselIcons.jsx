import React from "react";

const CONTAINER_PALETTE = [
  "#EF4444", "#3B82F6", "#10B981", "#F59E0B", 
  "#6366F1", "#EC4899", "#14B8A6", "#8B5CF6"
];

function getVisibleContainerCount(total, cargoProgress) {
  if (cargoProgress === null || cargoProgress === undefined) return total;
  const pct = Math.max(0, Math.min(100, cargoProgress));
  // Vessels arrive full of cargo; at port, cargo is progressively unloaded from 0% (full) to 100% (empty)
  return Math.max(0, Math.round(total * (1 - pct / 100)));
}

// Top-down high-detail vector ship graphics with dynamic multicolor container boxes
export function CapesizeShipSvg({ size = 48, className = "", cargoProgress = null, operationType = "DISCHARGE" }) {
  const totalContainers = 36; // 9 rows x 4 cols
  const visibleContainers = getVisibleContainerCount(totalContainers, cargoProgress, operationType);
  const rows = [16, 24, 32, 40, 48, 56, 64, 72, 80];
  const cols = [8, 14, 20, 26];

  return (
    <svg width={size} height={size * 2.8} viewBox="0 0 40 112" className={className} style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.5))" }}>
      <path
        d="M 20 2 C 32 10 38 24 38 48 L 38 98 C 38 108 34 110 20 110 C 6 110 2 108 2 98 L 2 48 C 2 24 8 10 20 2 Z"
        fill="#3F1212"
        stroke="#240707"
        strokeWidth="1.5"
      />
      <path
        d="M 20 5 C 30 13 35 25 35 48 L 35 96 C 35 104 31 106 20 106 C 9 106 5 104 5 96 L 5 48 C 5 25 10 13 20 5 Z"
        fill="#1C1917"
      />
      {rows.map((rowY, rIdx) => (
        <g key={rIdx}>
          {cols.map((colX, cIdx) => {
            const containerIdx = rIdx * 4 + cIdx;
            const isPresent = containerIdx < visibleContainers;
            const color = CONTAINER_PALETTE[(rIdx * 4 + cIdx * 3) % CONTAINER_PALETTE.length];
            return isPresent ? (
              <rect
                key={cIdx}
                x={colX}
                y={rowY}
                width="5.4"
                height="6.6"
                rx="0.5"
                fill={color}
                stroke="#171717"
                strokeWidth="0.4"
              />
            ) : (
              <rect
                key={cIdx}
                x={colX}
                y={rowY}
                width="5.4"
                height="6.6"
                rx="0.5"
                fill="#18181B"
                stroke="#27272A"
                strokeWidth="0.3"
              />
            );
          })}
        </g>
      ))}
      <rect x="8" y="93" width="24" height="10" rx="1.5" fill="#FAFAFA" stroke="#71717A" strokeWidth="0.8" />
      <rect x="11" y="94.5" width="18" height="3.5" fill="#0284C7" />
      <circle cx="20" cy="102" r="2.2" fill="none" stroke="#E11D48" strokeWidth="0.6" />
      <rect x="15" y="99" width="3" height="1.8" fill="#E11D48" rx="0.4" />
      <rect x="22" y="99" width="3" height="1.8" fill="#E11D48" rx="0.4" />
    </svg>
  );
}

export function PanamaxShipSvg({ size = 42, className = "", cargoProgress = null, operationType = "DISCHARGE" }) {
  const totalContainers = 28; // 7 rows x 4 cols
  const visibleContainers = getVisibleContainerCount(totalContainers, cargoProgress, operationType);
  const rows = [15, 23, 31, 39, 47, 55, 63];
  const cols = [6.5, 12.5, 18.5, 24.5];

  return (
    <svg width={size} height={size * 2.7} viewBox="0 0 34 94" className={className} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.45))" }}>
      <path
        d="M 17 2 C 27 8 32 20 32 40 L 32 82 C 32 90 28 92 17 92 C 6 92 2 90 2 82 L 2 40 C 2 20 7 8 17 2 Z"
        fill="#1E293B"
        stroke="#0F172A"
        strokeWidth="1.2"
      />
      <path
        d="M 17 5 C 25 11 29 22 29 40 L 29 80 C 29 86 26 88 17 88 C 8 88 5 86 5 80 L 5 40 C 5 22 9 11 17 5 Z"
        fill="#1C1917"
      />
      {rows.map((rowY, rIdx) => (
        <g key={rIdx}>
          {cols.map((colX, cIdx) => {
            const containerIdx = rIdx * 4 + cIdx;
            const isPresent = containerIdx < visibleContainers;
            const color = CONTAINER_PALETTE[(rIdx * 4 + cIdx * 3) % CONTAINER_PALETTE.length];
            return isPresent ? (
              <rect
                key={cIdx}
                x={colX}
                y={rowY}
                width="4.8"
                height="6.2"
                rx="0.5"
                fill={color}
                stroke="#171717"
                strokeWidth="0.4"
              />
            ) : (
              <rect
                key={cIdx}
                x={colX}
                y={rowY}
                width="4.8"
                height="6.2"
                rx="0.5"
                fill="#18181B"
                stroke="#27272A"
                strokeWidth="0.3"
              />
            );
          })}
        </g>
      ))}
      <rect x="7" y="76" width="20" height="9" rx="1" fill="#F8FAFC" stroke="#64748B" strokeWidth="0.6" />
      <rect x="9" y="77.5" width="16" height="3" fill="#0284C7" rx="0.4" />
      <rect x="12" y="74.5" width="3" height="2" fill="#E11D48" rx="0.4" />
      <rect x="19" y="74.5" width="3" height="2" fill="#E11D48" rx="0.4" />
    </svg>
  );
}

export function SupramaxShipSvg({ size = 36, className = "", cargoProgress = null, operationType = "DISCHARGE" }) {
  const totalContainers = 24; // 6 rows x 4 cols
  const visibleContainers = getVisibleContainerCount(totalContainers, cargoProgress, operationType);
  const rows = [14, 22, 30, 38, 46, 54];
  const cols = [5.5, 11, 16.5, 22];

  return (
    <svg width={size} height={size * 2.6} viewBox="0 0 30 84" className={className} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}>
      <path
        d="M 15 2 C 24 8 28 18 28 36 L 28 74 C 28 81 25 83 15 83 C 5 83 2 81 2 74 L 2 36 C 2 18 6 8 15 2 Z"
        fill="#1E3A8A"
        stroke="#172554"
        strokeWidth="1.2"
      />
      <path
        d="M 15 5 C 22 10 26 20 26 36 L 26 72 C 26 77 23 79 15 79 C 7 79 4 77 4 72 L 4 36 C 4 20 8 10 15 5 Z"
        fill="#1C1917"
      />
      {rows.map((rowY, rIdx) => (
        <g key={rIdx}>
          {cols.map((colX, cIdx) => {
            const containerIdx = rIdx * 4 + cIdx;
            const isPresent = containerIdx < visibleContainers;
            const color = CONTAINER_PALETTE[(rIdx * 4 + cIdx * 3) % CONTAINER_PALETTE.length];
            return isPresent ? (
              <rect
                key={cIdx}
                x={colX}
                y={rowY}
                width="4.4"
                height="6"
                rx="0.5"
                fill={color}
                stroke="#171717"
                strokeWidth="0.4"
              />
            ) : (
              <rect
                key={cIdx}
                x={colX}
                y={rowY}
                width="4.4"
                height="6"
                rx="0.5"
                fill="#18181B"
                stroke="#27272A"
                strokeWidth="0.3"
              />
            );
          })}
        </g>
      ))}
      <rect x="6" y="68" width="18" height="8" rx="1" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.6" />
      <rect x="8" y="69.5" width="14" height="2.5" fill="#0284C7" />
    </svg>
  );
}

export function HandysizeShipSvg({ size = 30, className = "", cargoProgress = null, operationType = "DISCHARGE" }) {
  const totalContainers = 16; // 4 rows x 4 cols
  const visibleContainers = getVisibleContainerCount(totalContainers, cargoProgress, operationType);
  const rows = [13, 21, 29, 37];
  const cols = [4.5, 9.5, 14.5, 19.5];

  return (
    <svg width={size} height={size * 2.5} viewBox="0 0 26 70" className={className} style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))" }}>
      <path
        d="M 13 2 C 21 7 24 15 24 30 L 24 62 C 24 68 21 69 13 69 C 5 69 2 68 2 62 L 2 30 C 2 15 5 7 13 2 Z"
        fill="#15803D"
        stroke="#14532D"
        strokeWidth="1.2"
      />
      <path
        d="M 13 4 C 19 8 22 16 22 30 L 22 60 C 22 65 19 66 13 66 C 7 66 4 65 4 60 L 4 30 C 4 16 7 8 13 4 Z"
        fill="#1C1917"
      />
      {rows.map((rowY, rIdx) => (
        <g key={rIdx}>
          {cols.map((colX, cIdx) => {
            const containerIdx = rIdx * 4 + cIdx;
            const isPresent = containerIdx < visibleContainers;
            const color = CONTAINER_PALETTE[(rIdx * 4 + cIdx * 3) % CONTAINER_PALETTE.length];
            return isPresent ? (
              <rect
                key={cIdx}
                x={colX}
                y={rowY}
                width="4.2"
                height="5.8"
                rx="0.5"
                fill={color}
                stroke="#171717"
                strokeWidth="0.4"
              />
            ) : (
              <rect
                key={cIdx}
                x={colX}
                y={rowY}
                width="4.2"
                height="5.8"
                rx="0.5"
                fill="#18181B"
                stroke="#27272A"
                strokeWidth="0.3"
              />
            );
          })}
        </g>
      ))}
      <rect x="5" y="55" width="16" height="8" rx="1" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.5" />
      <rect x="7" y="56.5" width="12" height="2.5" fill="#0284C7" />
    </svg>
  );
}

export function ContainerShipSvg({ size = 44, className = "", cargoProgress = null, operationType = "DISCHARGE" }) {
  const colors = CONTAINER_PALETTE;
  const totalContainers = 32;
  const visibleContainers = getVisibleContainerCount(totalContainers, cargoProgress, operationType);

  return (
    <svg width={size} height={size * 2.8} viewBox="0 0 36 100" className={className} style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.45))" }}>
      <path
        d="M 18 2 C 29 10 34 22 34 45 L 34 88 C 34 96 30 98 18 98 C 6 98 2 96 2 88 L 2 45 C 2 22 7 10 18 2 Z"
        fill="#3F1212"
        stroke="#240707"
        strokeWidth="1.2"
      />
      <path
        d="M 18 5 C 27 12 31 24 31 45 L 31 86 C 31 93 28 95 18 95 C 8 95 5 93 5 86 L 5 45 C 5 24 9 12 18 5 Z"
        fill="#262626"
      />
      {[16, 24, 32, 40, 48, 56, 64, 72].map((rowY, rIdx) => (
        <g key={rIdx}>
          {[7, 13, 19, 25].map((colX, cIdx) => {
            const containerIdx = rIdx * 4 + cIdx;
            const isPresent = containerIdx < visibleContainers;
            const color = colors[(rIdx * 4 + cIdx * 3) % colors.length];
            return isPresent ? (
              <rect
                key={cIdx}
                x={colX}
                y={rowY}
                width="5.2"
                height="6.5"
                rx="0.5"
                fill={color}
                stroke="#171717"
                strokeWidth="0.4"
              />
            ) : (
              <rect
                key={cIdx}
                x={colX}
                y={rowY}
                width="5.2"
                height="6.5"
                rx="0.5"
                fill="#18181B"
                stroke="#27272A"
                strokeWidth="0.3"
              />
            );
          })}
        </g>
      ))}
      <rect x="7" y="82" width="22" height="9" rx="1" fill="#F4F4F5" stroke="#52525B" strokeWidth="0.8" />
      <rect x="9" y="83.5" width="18" height="3" fill="#0284C7" />
      <rect x="15.5" y="88" width="5" height="2" fill="#E11D48" rx="0.5" />
    </svg>
  );
}

// 4 High-Fidelity Top-Down Road Vehicle Vectors matching the User Reference Image
// 1. Yellow Cabin with White/Gray Cargo Box Trailer
export function TopDownYellowBoxTruck({ size = 42, horizontal = true, className = "" }) {
  if (horizontal) {
    return (
      <svg width={size * 2.5} height={size} viewBox="0 0 120 48" className={className} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))" }}>
        <rect x="12" y="2" width="12" height="4" rx="1" fill="#18181B" />
        <rect x="12" y="42" width="12" height="4" rx="1" fill="#18181B" />
        <rect x="74" y="2" width="10" height="4" rx="1" fill="#18181B" />
        <rect x="74" y="42" width="10" height="4" rx="1" fill="#18181B" />
        <rect x="4" y="6" width="76" height="36" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
        <line x1="80" y1="6" x2="80" y2="42" stroke="#64748B" strokeWidth="1.5" />
        <path d="M 82 8 L 106 8 C 114 8 116 14 116 24 C 116 34 114 40 106 40 L 82 40 Z" fill="#FACC15" stroke="#EAB308" strokeWidth="1" />
        <path d="M 92 11 L 102 11 C 107 11 110 16 110 24 C 110 32 107 37 102 37 L 92 37 C 95 30 95 18 92 11 Z" fill="#1E293B" />
        <rect x="98" y="3" width="4" height="4" rx="1" fill="#FACC15" stroke="#CA8A04" strokeWidth="0.6" />
        <rect x="98" y="41" width="4" height="4" rx="1" fill="#FACC15" stroke="#CA8A04" strokeWidth="0.6" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size * 2.5} viewBox="0 0 48 120" className={className} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))" }}>
      <rect x="2" y="12" width="4" height="12" rx="1" fill="#18181B" />
      <rect x="42" y="12" width="4" height="12" rx="1" fill="#18181B" />
      <rect x="2" y="74" width="4" height="10" rx="1" fill="#18181B" />
      <rect x="42" y="74" width="4" height="10" rx="1" fill="#18181B" />
      <path d="M 8 38 L 8 14 C 8 6 14 4 24 4 C 34 4 40 6 40 14 L 40 38 Z" fill="#FACC15" stroke="#EAB308" strokeWidth="1" />
      <path d="M 11 28 L 11 18 C 11 13 16 10 24 10 C 32 10 37 13 37 18 L 37 28 C 30 25 18 25 11 28 Z" fill="#1E293B" />
      <rect x="6" y="40" width="36" height="76" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
    </svg>
  );
}

// 2. Blue Cabin with Ribbed Yellow Multi-Axle Container Trailer (Master SIH Trailer)
export function TopDownRibbedContainerTruck({ size = 44, horizontal = true, className = "" }) {
  if (horizontal) {
    return (
      <svg width={size * 3.2} height={size} viewBox="0 0 160 48" className={className} style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.4))" }}>
        <rect x="10" y="2" width="12" height="4" rx="1" fill="#18181B" />
        <rect x="10" y="42" width="12" height="4" rx="1" fill="#18181B" />
        <rect x="26" y="2" width="12" height="4" rx="1" fill="#18181B" />
        <rect x="26" y="42" width="12" height="4" rx="1" fill="#18181B" />
        <rect x="42" y="2" width="12" height="4" rx="1" fill="#18181B" />
        <rect x="42" y="42" width="12" height="4" rx="1" fill="#18181B" />
        <rect x="116" y="2" width="12" height="4" rx="1" fill="#18181B" />
        <rect x="116" y="42" width="12" height="4" rx="1" fill="#18181B" />
        <rect x="4" y="6" width="112" height="36" rx="2" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
        {[12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 102, 108].map(x => (
          <line key={x} x1={x} y1="7" x2={x} y2="41" stroke="#B45309" strokeWidth="1.2" />
        ))}
        <path d="M 118 7 L 146 7 C 154 7 156 14 156 24 C 156 34 154 41 146 41 L 118 41 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
        <path d="M 128 10 L 140 10 C 146 10 149 15 149 24 C 149 33 146 38 140 38 L 128 38 C 132 30 132 18 128 10 Z" fill="#0F172A" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size * 3.2} viewBox="0 0 48 160" className={className} style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.4))" }}>
      <path d="M 7 42 L 7 14 C 7 6 14 4 24 4 C 34 4 41 6 41 14 L 41 42 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
      <rect x="6" y="44" width="36" height="112" rx="2" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
    </svg>
  );
}

// Master Top-Down Truck Component export
export function TopDownTruckSvg({ size = 42, horizontal = true, variant = "ribbed", className = "" }) {
  if (variant === "box") return <TopDownYellowBoxTruck size={size} horizontal={horizontal} className={className} />;
  return <TopDownRibbedContainerTruck size={size} horizontal={horizontal} className={className} />;
}

// Master top-down vessel selector
export default function TopDownVesselIcon({ category = "Panamax", size, className = "" }) {
  switch (category) {
    case "Capesize":
      return <CapesizeShipSvg size={size || 38} className={className} />;
    case "Panamax":
      return <PanamaxShipSvg size={size || 32} className={className} />;
    case "Supramax":
      return <SupramaxShipSvg size={size || 28} className={className} />;
    case "Handysize":
      return <HandysizeShipSvg size={size || 24} className={className} />;
    case "Container":
      return <ContainerShipSvg size={size || 34} className={className} />;
    default:
      return <PanamaxShipSvg size={size || 30} className={className} />;
  }
}
