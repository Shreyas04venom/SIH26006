import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import {
    Navigation, Compass, MapPin, Activity,
    Layers, Maximize2, ShieldCheck, Zap,
    Anchor, Factory, ArrowRight, ArrowLeftRight,
    CheckCircle2, Clock, AlertTriangle, Truck
} from "lucide-react";
import {
    CORRIDOR_SOURCES,
    CORRIDOR_DESTINATIONS,
    getCorridorData,
    PREDEFINED_CORRIDORS
} from "../data/corridorsData";

export default function CorridorLeafletMap({
    selectedSourceId: propSourceId,
    selectedDestId: propDestId,
    onSelectSource,
    onSelectDestination,
    trucks: propTrucks = [],
    selectedTruckId = null,
    onSelectTruck,
    activeTab = "last-mile",
    onCorridorChange
}) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersGroupRef = useRef(null);
    const routeGroupRef = useRef(null);
    const waypointsGroupRef = useRef(null);

    // Internal state for source and destination (synced with props or internal)
    const [sourceId, setSourceId] = useState(
        propSourceId || (activeTab === "first-mile" ? "hunter_valley" : "paradip")
    );
    const [destId, setDestId] = useState(
        propDestId || (activeTab === "first-mile" ? "newcastle_port" : "angul")
    );

    // Sync state when props or activeTab changes
    useEffect(() => {
        if (propSourceId && propSourceId !== sourceId) {
            setSourceId(propSourceId);
        }
    }, [propSourceId]);

    useEffect(() => {
        if (propDestId && propDestId !== destId) {
            setDestId(propDestId);
        }
    }, [propDestId]);

    useEffect(() => {
        if (activeTab === "first-mile") {
            setSourceId("hunter_valley");
            setDestId("newcastle_port");
        } else if (sourceId === "hunter_valley") {
            setSourceId("paradip");
            setDestId("angul");
        }
    }, [activeTab]);

    const [mapStyle, setMapStyle] = useState("satellite"); // "streets" | "satellite" | "dark"

    // Compute corridor data (waypoints, distance, highway name, trucks)
    const corridorData = useMemo(() => {
        return getCorridorData(sourceId, destId);
    }, [sourceId, destId]);

    // Use corridor trucks if propTrucks is empty or doesn't match current corridor
    const effectiveTrucks = useMemo(() => {
        if (propTrucks && propTrucks.length > 0) {
            // Check if any prop trucks have valid lat/lon
            const valid = propTrucks.filter(t => typeof t.lat === "number" && typeof t.lon === "number");
            if (valid.length > 0) return propTrucks;
        }
        return corridorData.trucks;
    }, [propTrucks, corridorData]);

    const waypoints = corridorData.waypoints || [];
    const corridorRouteCoords = waypoints.map(w => [w.lat, w.lon]);

    // Handle source selection
    const handleSourceChange = (newSourceId) => {
        setSourceId(newSourceId);
        if (onSelectSource) onSelectSource(newSourceId);

        // Auto-recommend default destination for this source
        const srcObj = CORRIDOR_SOURCES.find(s => s.id === newSourceId);
        if (srcObj && srcObj.defaultDestId) {
            setDestId(srcObj.defaultDestId);
            if (onSelectDestination) onSelectDestination(srcObj.defaultDestId);
            if (onCorridorChange) {
                const newCorr = getCorridorData(newSourceId, srcObj.defaultDestId);
                onCorridorChange(newCorr);
            }
        }
    };

    // Handle destination selection
    const handleDestChange = (newDestId) => {
        setDestId(newDestId);
        if (onSelectDestination) onSelectDestination(newDestId);
        if (onCorridorChange) {
            const newCorr = getCorridorData(sourceId, newDestId);
            onCorridorChange(newCorr);
        }
    };

    // Swap direction (e.g. Return trip / Export corridor)
    const handleSwapDirection = () => {
        // Find matching port and plant
        const currentSrc = CORRIDOR_SOURCES.find(s => s.id === sourceId);
        const currentDest = CORRIDOR_DESTINATIONS.find(d => d.id === destId);

        // Check if destination exists as a source or vice-versa
        const matchingSrc = CORRIDOR_SOURCES.find(s => s.id === destId);
        const matchingDest = CORRIDOR_DESTINATIONS.find(d => d.id === sourceId);

        if (matchingSrc && matchingDest) {
            setSourceId(matchingSrc.id);
            setDestId(matchingDest.id);
            if (onSelectSource) onSelectSource(matchingSrc.id);
            if (onSelectDestination) onSelectDestination(matchingDest.id);
        } else if (currentSrc && currentDest) {
            // Reverse waypoints corridor
            const reversed = getCorridorData(sourceId, destId);
            if (onCorridorChange) onCorridorChange(reversed);
        }
    };

    // Preset corridor selector
    const handleSelectPreset = (src, dst) => {
        setSourceId(src);
        setDestId(dst);
        if (onSelectSource) onSelectSource(src);
        if (onSelectDestination) onSelectDestination(dst);
        if (onCorridorChange) {
            const corr = getCorridorData(src, dst);
            onCorridorChange(corr);
        }
    };

    // Map Tile Layers
    const tileLayers = {
        streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        dark: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    };

    const tileLayerRef = useRef(null);

    // Initialize Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const initialCenter = [corridorData.source.lat, corridorData.source.lon];
        const initialZoom = 9;

        const map = L.map(mapContainerRef.current, {
            center: initialCenter,
            zoom: initialZoom,
            minZoom: 5,
            maxZoom: 18,
            zoomControl: false,
            attributionControl: false
        });

        tileLayerRef.current = L.tileLayer(tileLayers[mapStyle], {
            maxZoom: 18,
            subdomains: ["a", "b", "c"]
        }).addTo(map);

        markersGroupRef.current = L.layerGroup().addTo(map);
        routeGroupRef.current = L.layerGroup().addTo(map);
        waypointsGroupRef.current = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Update tile style when changed
    useEffect(() => {
        if (!mapInstanceRef.current || !tileLayerRef.current) return;
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
        tileLayerRef.current = L.tileLayer(tileLayers[mapStyle], {
            maxZoom: 18,
            subdomains: ["a", "b", "c"]
        }).addTo(mapInstanceRef.current);
    }, [mapStyle]);

    // Redraw Route Corridor Polyline and Waypoints when corridorData changes
    useEffect(() => {
        if (!mapInstanceRef.current || !routeGroupRef.current || !waypointsGroupRef.current) return;
        if (!corridorRouteCoords || corridorRouteCoords.length === 0) return;

        routeGroupRef.current.clearLayers();
        waypointsGroupRef.current.clearLayers();

        // Outer glow casing
        L.polyline(corridorRouteCoords, {
            color: "#38bdf8",
            weight: 10,
            opacity: 0.35,
            lineCap: "round",
            lineJoin: "round"
        }).addTo(routeGroupRef.current);

        // Core Corridor Highway Polyline
        const corridorLine = L.polyline(corridorRouteCoords, {
            color: "#1d4ed8",
            weight: 5,
            opacity: 0.95,
            dashArray: "8, 6",
            lineCap: "round",
            lineJoin: "round"
        }).addTo(routeGroupRef.current);

        // Waypoints markers
        waypoints.forEach((wp, index) => {
            let iconColor = "#1e293b";
            let iconLabel = "WP";
            let iconEmoji = "📍";

            if (wp.type === "PORT" || wp.type === "MINE") {
                iconColor = "#0284c7"; // Cyan / Blue
                iconEmoji = wp.type === "PORT" ? "⚓" : "⛏️";
                iconLabel = wp.type === "PORT" ? "PORT" : "MINE";
            } else if (wp.type === "TOLL") {
                iconColor = "#d97706"; // Amber
                iconEmoji = "🏷️";
                iconLabel = "TOLL";
            } else if (wp.type === "WEIGHBRIDGE") {
                iconColor = "#059669"; // Emerald
                iconEmoji = "⚖️";
                iconLabel = "SCALE";
            } else if (wp.type === "PLANT") {
                iconColor = "#b91c1c"; // Crimson / Red
                iconEmoji = "🏭";
                iconLabel = "PLANT";
            } else if (wp.type === "CHECKPOST") {
                iconColor = "#7c3aed"; // Violet
                iconEmoji = "🛂";
                iconLabel = "CHECK";
            } else if (wp.type === "BRIDGE") {
                iconColor = "#0f766e"; // Teal
                iconEmoji = "🌉";
                iconLabel = "BRIDGE";
            } else if (wp.type === "JUNCTION") {
                iconColor = "#334155"; // Slate
                iconEmoji = "🔀";
                iconLabel = "JUNC";
            }

            const wpIcon = L.divIcon({
                className: "custom-wp-icon",
                html: `
          <div style="
            background: ${iconColor};
            color: white;
            padding: 3px 7px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 800;
            font-family: monospace;
            box-shadow: 0 2px 8px rgba(0,0,0,0.45);
            white-space: nowrap;
            border: 1.5px solid white;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            <span>${iconEmoji} ${iconLabel}</span>
          </div>
        `,
                iconSize: [84, 24],
                iconAnchor: [42, 12]
            });

            const marker = L.marker([wp.lat, wp.lon], { icon: wpIcon }).addTo(waypointsGroupRef.current);
            marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 6px; min-width: 220px;">
          <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 4px;">
            <span style="font-size: 14px;">${iconEmoji}</span>
            <strong style="color: #0f172a; font-size: 12px;">${wp.name}</strong>
          </div>
          <div style="color: #475569; font-size: 11px; margin-bottom: 5px;">${wp.desc || ""}</div>
          <div style="background: #f1f5f9; padding: 4px 6px; border-radius: 4px; font-family: monospace; font-size: 10px; color: #1e3a8a; display: flex; justify-content: space-between;">
            <span>KM: <strong>${wp.km !== undefined ? wp.km + ' km' : `Node #${index + 1}`}</strong></span>
            <span>${wp.lat.toFixed(4)}° N, ${wp.lon.toFixed(4)}° E</span>
          </div>
        </div>
      `);
        });

        // Smoothly fit bounds to entire corridor line
        try {
            mapInstanceRef.current.fitBounds(corridorLine.getBounds(), {
                padding: [45, 45],
                maxZoom: 13,
                animate: true
            });
        } catch (e) {
            console.warn("fitBounds notice:", e);
        }
    }, [sourceId, destId, corridorRouteCoords.length]);

    // Update Truck Markers on Map
    useEffect(() => {
        if (!mapInstanceRef.current || !markersGroupRef.current) return;
        markersGroupRef.current.clearLayers();

        effectiveTrucks.forEach(t => {
            if (typeof t.lat !== "number" || typeof t.lon !== "number") return;

            const isSelected = t.id === selectedTruckId;
            const isDelayed = t.status === "DELAYED" || t.exception !== null;
            const isAtTerminal = t.status === "AT WAREHOUSE" || t.status === "LOADING" || t.status === "AT PORT";

            let bgClass = "background: #059669;"; // green for moving
            if (isDelayed) bgClass = "background: #d97706;"; // amber for delay
            if (isAtTerminal) bgClass = "background: #475569;"; // slate for terminal
            if (isSelected) bgClass = "background: #1e3a8a; border: 2px solid #38bdf8;";

            const truckIcon = L.divIcon({
                className: "custom-truck-icon",
                html: `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            z-index: ${isSelected ? 999 : 500};
          ">
            <div style="
              ${bgClass}
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 800;
              font-family: monospace;
              white-space: nowrap;
              box-shadow: 0 3px 8px rgba(0,0,0,0.4);
              border: 1px solid rgba(255,255,255,0.9);
              display: flex;
              align-items: center;
              gap: 4px;
              ${isSelected ? 'box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.7); transform: scale(1.18);' : ''}
            ">
              <span>🚛 ${t.plate}</span>
              <span style="opacity: 0.9; font-size: 8px; background: rgba(0,0,0,0.25); padding: 1px 3px; border-radius: 2px;">
                ${t.speedKmh > 0 ? t.speedKmh + 'k' : 'STOP'}
              </span>
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 4px solid transparent;
              border-right: 4px solid transparent;
              border-top: 5px solid ${isSelected ? '#1e3a8a' : (isDelayed ? '#d97706' : (isAtTerminal ? '#475569' : '#059669'))};
            "></div>
          </div>
        `,
                iconSize: [95, 32],
                iconAnchor: [47, 30]
            });

            const marker = L.marker([t.lat, t.lon], { icon: truckIcon }).addTo(markersGroupRef.current);

            marker.on("click", () => {
                if (onSelectTruck) onSelectTruck(t.id);
            });

            marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 4px; min-width: 210px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="font-family: monospace; font-size: 13px; color: #0f172a;">${t.plate}</strong>
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${isDelayed ? '#fef3c7' : (isAtTerminal ? '#f1f5f9' : '#dcfce7')}; color: ${isDelayed ? '#92400e' : (isAtTerminal ? '#334155' : '#166534')};">
              ${t.status}
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 3px;">
            <strong>Driver:</strong> ${t.driver} (${t.phone || "Active"})
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 3px;">
            <strong>Payload:</strong> ${t.cargoQuantityMt} MT ${t.cargoType || "Thermal Coal"}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 3px;">
            <strong>Vehicle:</strong> ${t.truckModel || t.trailer || "40T Multi-Axle"}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            <strong>Speed / ETA:</strong> ${t.speedKmh} km/h · ETA ${t.etaFormatted || t.etaMinutes + 'm'}
          </div>
          <div style="display: flex; justify-content: space-between; font-family: monospace; font-size: 10px; color: #1e3a8a; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <span>FASTag: ${t.fastag?.issuer?.split(' ')[0] || "Active"}</span>
            <span>GatePass: ${t.gatePassId || "GP-2026"}</span>
          </div>
        </div>
      `);
        });
    }, [effectiveTrucks, selectedTruckId]);

    // Center on selected truck if it changes
    useEffect(() => {
        if (!mapInstanceRef.current || !selectedTruckId) return;
        const selectedTruck = effectiveTrucks.find(t => t.id === selectedTruckId);
        if (selectedTruck && typeof selectedTruck.lat === "number" && typeof selectedTruck.lon === "number") {
            mapInstanceRef.current.panTo([selectedTruck.lat, selectedTruck.lon], { animate: true, duration: 0.6 });
        }
    }, [selectedTruckId, effectiveTrucks]);

    const fitCorridor = () => {
        if (!mapInstanceRef.current || corridorRouteCoords.length === 0) return;
        const bounds = L.latLngBounds(corridorRouteCoords);
        mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45] });
    };

    return (
        <div className="space-y-2">
            {/* Top Interactive Corridor Selector Bar: Left Source Dropdown, Center Route Indicator, Right Destination Dropdown */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-lg text-white">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    
                    {/* LEFT SIDE: SOURCE (ORIGIN PORT / MINE) DROPDOWN */}
                    <div className="flex-1 min-w-[240px]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5">
                                <Anchor size={12} className="text-sky-400" />
                                <span>Source (Origin Port / Mine)</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                                {corridorData.source.state}, {corridorData.source.country}
                            </span>
                        </div>
                        <div className="relative">
                            <select
                                value={sourceId}
                                onChange={(e) => handleSourceChange(e.target.value)}
                                className="w-full bg-slate-800/90 border border-slate-600 hover:border-sky-400 focus:border-sky-400 text-white font-mono text-xs rounded-lg px-3 py-2 pr-8 outline-none transition cursor-pointer appearance-none shadow-inner"
                            >
                                <optgroup label="Major East Coast Ports (India)">
                                    {CORRIDOR_SOURCES.filter(s => s.country === "India").map(s => (
                                        <option key={s.id} value={s.id}>
                                            ⚓ {s.name} ({s.state})
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="First-Mile Mine Sidings">
                                    {CORRIDOR_SOURCES.filter(s => s.country !== "India").map(s => (
                                        <option key={s.id} value={s.id}>
                                            ⛏️ {s.name} ({s.state}, {s.country})
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                                ▼
                            </div>
                        </div>
                    </div>

                    {/* CENTER: HIGHWAY CORRIDOR BADGE, DISTANCE & SWAP BUTTON */}
                    <div className="flex flex-row lg:flex-col items-center justify-center gap-1 px-2 py-1 bg-slate-800/60 rounded-lg border border-slate-700/60 self-center">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold font-mono text-amber-400 tracking-wide">
                                {corridorData.highway?.split(" ")[0] || "HIGHWAY"}
                            </span>
                            <button
                                onClick={handleSwapDirection}
                                className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition"
                                title="Swap Corridor Direction (Return / Export)"
                            >
                                <ArrowLeftRight size={13} />
                            </button>
                        </div>
                        <div className="text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
                            <span className="text-emerald-400 font-bold">{corridorData.distanceKm} km</span>
                            <span className="text-slate-500">·</span>
                            <span>~{corridorData.durationHours}h transit</span>
                        </div>
                    </div>

                    {/* RIGHT SIDE: DESTINATION (STEEL PLANT / HUB) DROPDOWN */}
                    <div className="flex-1 min-w-[240px]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                                <Factory size={12} className="text-rose-400" />
                                <span>Destination (Industrial Works / Plant)</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                                {corridorData.dest.state}
                            </span>
                        </div>
                        <div className="relative">
                            <select
                                value={destId}
                                onChange={(e) => handleDestChange(e.target.value)}
                                className="w-full bg-slate-800/90 border border-slate-600 hover:border-rose-400 focus:border-rose-400 text-white font-mono text-xs rounded-lg px-3 py-2 pr-8 outline-none transition cursor-pointer appearance-none shadow-inner"
                            >
                                <optgroup label="Integrated Steel & Industrial Plants">
                                    {CORRIDOR_DESTINATIONS.filter(d => d.type === "STEEL_PLANT").map(d => (
                                        <option key={d.id} value={d.id}>
                                            🏭 {d.name} ({d.state})
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="Power, Sponge Iron & Manufacturing Hubs">
                                    {CORRIDOR_DESTINATIONS.filter(d => d.type !== "STEEL_PLANT" && d.type !== "PORT").map(d => (
                                        <option key={d.id} value={d.id}>
                                            ⚡ {d.name} ({d.state})
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="First-Mile Port Terminals">
                                    {CORRIDOR_DESTINATIONS.filter(d => d.type === "PORT").map(d => (
                                        <option key={d.id} value={d.id}>
                                            ⚓ {d.name} ({d.state})
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                                ▼
                            </div>
                        </div>
                    </div>
                </div>

                {/* Popular Quick-Select Corridor Presets */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800 text-[10px] font-mono">
                    <span className="text-slate-400 mr-1">Popular Corridors:</span>
                    <button
                        onClick={() => handleSelectPreset("paradip", "angul")}
                        className={`px-2 py-0.5 rounded transition ${sourceId === "paradip" && destId === "angul" ? "bg-sky-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"}`}
                    >
                        Paradip ➔ Angul (NH-53)
                    </button>
                    <button
                        onClick={() => handleSelectPreset("visakhapatnam", "vizag_steel")}
                        className={`px-2 py-0.5 rounded transition ${sourceId === "visakhapatnam" && destId === "vizag_steel" ? "bg-sky-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"}`}
                    >
                        Vizag ➔ RINL (NH-16)
                    </button>
                    <button
                        onClick={() => handleSelectPreset("haldia", "durgapur")}
                        className={`px-2 py-0.5 rounded transition ${sourceId === "haldia" && destId === "durgapur" ? "bg-sky-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"}`}
                    >
                        Haldia ➔ Durgapur (NH-19)
                    </button>
                    <button
                        onClick={() => handleSelectPreset("dhamra", "kalinganagar")}
                        className={`px-2 py-0.5 rounded transition ${sourceId === "dhamra" && destId === "kalinganagar" ? "bg-sky-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"}`}
                    >
                        Dhamra ➔ Kalinganagar
                    </button>
                    <button
                        onClick={() => handleSelectPreset("krishnapatnam", "ballari")}
                        className={`px-2 py-0.5 rounded transition ${sourceId === "krishnapatnam" && destId === "ballari" ? "bg-sky-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"}`}
                    >
                        Krishnapatnam ➔ Ballari (NH-67)
                    </button>
                    <button
                        onClick={() => handleSelectPreset("chennai", "sricity")}
                        className={`px-2 py-0.5 rounded transition ${sourceId === "chennai" && destId === "sricity" ? "bg-sky-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"}`}
                    >
                        Chennai ➔ Sri City (NH-16)
                    </button>
                </div>
            </div>

            {/* Interactive Leaflet Map Container */}
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-300 shadow-md bg-slate-900">
                <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 0 }} />

                {/* Corridor Header Overlay Inside Map */}
                <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-700 text-white shadow-lg max-w-[85%]">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span className="text-[10px] font-mono tracking-wider text-slate-300 uppercase font-bold">
                            {corridorData.highway}
                        </span>
                    </div>
                    <div className="text-xs font-extrabold text-white mt-0.5 font-mono flex flex-wrap items-center gap-1.5">
                        <span className="text-sky-300">{corridorData.source.shortName}</span>
                        <span className="text-amber-400">➔</span>
                        <span className="text-rose-300">{corridorData.dest.shortName}</span>
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                            ({waypoints.length} Waypoints · {corridorData.distanceKm} km)
                        </span>
                    </div>
                </div>

                {/* Map Style & Zoom Controls */}
                <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 text-white shadow-lg text-[11px] font-mono">
                    <button
                        onClick={() => setMapStyle("streets")}
                        className={`px-2 py-1 rounded transition ${mapStyle === "streets" ? "bg-blue-900 text-white font-bold" : "text-slate-400 hover:text-white"}`}
                    >
                        Streets
                    </button>
                    <button
                        onClick={() => setMapStyle("satellite")}
                        className={`px-2 py-1 rounded transition ${mapStyle === "satellite" ? "bg-blue-900 text-white font-bold" : "text-slate-400 hover:text-white"}`}
                    >
                        Satellite
                    </button>
                    <button
                        onClick={() => setMapStyle("dark")}
                        className={`px-2 py-1 rounded transition ${mapStyle === "dark" ? "bg-blue-900 text-white font-bold" : "text-slate-400 hover:text-white"}`}
                    >
                        Voyager
                    </button>
                    <div className="w-px h-4 bg-slate-700 mx-0.5"></div>
                    <button
                        onClick={fitCorridor}
                        className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded"
                        title="Fit Full Corridor"
                    >
                        <Maximize2 size={13} />
                    </button>
                </div>

                {/* Bottom Corridor Telemetry Status Bar */}
                <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-700 text-white shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span className="text-slate-300 text-[11px]">
                                En Route: <strong className="text-white">{effectiveTrucks.filter(t => t.status === "IN TRANSIT").length} units</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            <span className="text-slate-300 text-[11px]">
                                Delayed: <strong className="text-white">{effectiveTrucks.filter(t => t.status === "DELAYED" || t.exception !== null).length} units</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                            <span className="text-slate-300 text-[11px]">
                                Terminals: <strong className="text-white">{effectiveTrucks.filter(t => t.status === "AT WAREHOUSE" || t.status === "LOADING" || t.status === "AT PORT" || t.status === "APPROACHING PORT").length} units</strong>
                            </span>
                        </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>AIS-140 GPS Frequency: <strong>10s</strong></span>
                        <span>·</span>
                        <span>FASTag Toll Clearance: <strong className="text-emerald-400">98.6%</strong></span>
                    </div>
                </div>
            </div>
        </div>
    );
}