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

// In-memory cache for fetched OSRM real road geometries
const osrmRouteCache = {};

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

    // High-precision road route state (follows exact real road network via OSRM)
    const [preciseRoadCoords, setPreciseRoadCoords] = useState(null);
    const [isRoadSnapped, setIsRoadSnapped] = useState(false);
    const [actualRoadKm, setActualRoadKm] = useState(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

    // Camera follow and user interaction tracking
    const [isFollowing, setIsFollowing] = useState(false);
    const isUserInteractingRef = useRef(false);
    const prevSelectedTruckIdRef = useRef(null);
    const truckMarkersRef = useRef(new Map());

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
            // Origin side (first-mile): strictly overseas mines & sidings (NEVER East Coast India)
            const firstMileSources = CORRIDOR_SOURCES.filter(s => s.leg === "first-mile");
            if (!firstMileSources.some(s => s.id === sourceId)) {
                setSourceId("hunter_valley");
                setDestId("newcastle_port");
            }
        } else {
            // Destination side (last-mile): strictly East Coast India discharge ports to inland plants
            const lastMileSources = CORRIDOR_SOURCES.filter(s => s.leg === "last-mile");
            if (!lastMileSources.some(s => s.id === sourceId)) {
                setSourceId("paradip");
                setDestId("angul");
            }
        }
    }, [activeTab]);

    const [mapStyle, setMapStyle] = useState("satellite"); // "streets" | "satellite" | "dark"

    // Compute corridor data (waypoints, distance, highway name, trucks)
    const corridorData = useMemo(() => {
        return getCorridorData(sourceId, destId);
    }, [sourceId, destId]);

    // Fetch live OSRM driving shortest-path geometry
    useEffect(() => {
        let isMounted = true;
        const src = corridorData.source;
        const dst = corridorData.dest;
        if (!src || !dst || typeof src.lat !== "number" || typeof dst.lat !== "number") return;

        const cacheKey = `${src.id}_${dst.id}_${src.lat}_${src.lon}_${dst.lat}_${dst.lon}`;

        if (osrmRouteCache[cacheKey]) {
            setPreciseRoadCoords(osrmRouteCache[cacheKey].coords);
            setActualRoadKm(osrmRouteCache[cacheKey].distanceKm);
            setIsRoadSnapped(true);
            return;
        }

        setIsLoadingRoute(true);
        const controller = new AbortController();
        const url = `https://router.project-osrm.org/route/v1/driving/${src.lon},${src.lat};${dst.lon},${dst.lat}?overview=full&geometries=geojson`;

        fetch(url, { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                if (!isMounted) return;
                if (data.code === "Ok" && data.routes && data.routes[0]) {
                    const rawCoords = data.routes[0].geometry.coordinates; // [[lon, lat], ...]
                    const mapped = rawCoords.map(([lon, lat]) => [lat, lon]);
                    
                    // Ensure 100% complete connectivity: route starts directly from port berth/gate and reaches inside the warehouse
                    let coords = [...mapped];
                    const firstPt = coords[0];
                    const lastPt = coords[coords.length - 1];

                    // Only stitch if within 250m (< 0.0025) to prevent artificial straight lines cutting across water or fields
                    const distSrc = Math.hypot(firstPt[0] - src.lat, firstPt[1] - src.lon);
                    const distDst = Math.hypot(lastPt[0] - dst.lat, lastPt[1] - dst.lon);

                    if (distSrc > 0.0001 && distSrc < 0.0025) {
                        coords = [[src.lat, src.lon], ...coords];
                    }
                    if (distDst > 0.0001 && distDst < 0.0025) {
                        coords = [...coords, [dst.lat, dst.lon]];
                    }

                    const distKm = parseFloat((data.routes[0].distance / 1000).toFixed(1));
                    osrmRouteCache[cacheKey] = { coords, distanceKm: distKm };
                    setPreciseRoadCoords(coords);
                    setActualRoadKm(distKm);
                    setIsRoadSnapped(true);
                }
            })
            .catch(err => {
                if (err.name !== "AbortError") {
                    console.warn("OSRM road route fetch notice:", err.message);
                }
            })
            .finally(() => {
                if (isMounted) setIsLoadingRoute(false);
            });

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [corridorData.source, corridorData.dest]);

    // Use corridor trucks if propTrucks is empty or doesn't match current corridor
    const effectiveTrucks = useMemo(() => {
        if (propTrucks && propTrucks.length > 0) {
            const valid = propTrucks.filter(t => typeof t.lat === "number" && typeof t.lon === "number");
            if (valid.length > 0) return propTrucks;
        }
        return corridorData.trucks;
    }, [propTrucks, corridorData]);

    const waypoints = corridorData.waypoints || [];
    const corridorRouteCoords = useMemo(() => {
        if (!waypoints || waypoints.length === 0) {
            return [[corridorData.source.lat, corridorData.source.lon], [corridorData.dest.lat, corridorData.dest.lon]];
        }
        const pts = waypoints.map(w => [w.lat, w.lon]);
        return [
            [corridorData.source.lat, corridorData.source.lon],
            ...pts.filter((_, idx) => idx !== 0 && idx !== pts.length - 1),
            [corridorData.dest.lat, corridorData.dest.lon]
        ];
    }, [waypoints, corridorData.source, corridorData.dest]);

    const activeRouteCoords = (preciseRoadCoords && preciseRoadCoords.length > 5)
        ? preciseRoadCoords
        : corridorRouteCoords;

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

        // Detect user manual dragging or zooming - immediately release follow lock and give 100% control to user
        map.on("dragstart", () => {
            isUserInteractingRef.current = true;
            setIsFollowing(false);
            map.stop();
        });

        map.on("zoomstart", (e) => {
            if (e.originalEvent) {
                isUserInteractingRef.current = true;
                setIsFollowing(false);
                map.stop();
            }
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
            truckMarkersRef.current.clear();
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

    // Redraw Highway Road Corridor and Waypoints
    useEffect(() => {
        if (!mapInstanceRef.current || !routeGroupRef.current || !waypointsGroupRef.current) return;
        if (!activeRouteCoords || activeRouteCoords.length === 0) return;

        routeGroupRef.current.clearLayers();
        waypointsGroupRef.current.clearLayers();

        // Helper to get snapped road coordinate for a waypoint along the actual highway
        const getSnappedWpCoord = (wp, index, total) => {
            // Anchor origin directly at source facility
            if (index === 0) return [corridorData.source.lat, corridorData.source.lon];
            // Anchor destination directly inside consignee warehouse / plant tippler siding
            if (index === total - 1) return [corridorData.dest.lat, corridorData.dest.lon];

            if (!preciseRoadCoords || preciseRoadCoords.length < 5) {
                return [wp.lat, wp.lon];
            }

            // Proportional snapping along the real road network
            let ratio = (index / (total - 1));
            if (wp.type === "WEIGHBRIDGE") ratio = 0.04;
            else if (wp.type === "JUNCTION" && index <= 2) ratio = 0.25;
            else if (wp.type === "TOLL") ratio = 0.50;
            else if (wp.type === "JUNCTION") ratio = 0.75;
            else if (wp.type === "CHECKPOST") ratio = 0.90;

            const idx = Math.min(
                preciseRoadCoords.length - 1, 
                Math.max(0, Math.round(ratio * (preciseRoadCoords.length - 1)))
            );
            return preciseRoadCoords[idx];
        };

        // --- 1. HIGH-PRECISION BLUE HIGHWAY ROAD CORRIDOR ---
        // Outer glow casing following real road curves
        L.polyline(activeRouteCoords, {
            color: "#38bdf8",
            weight: 8,
            opacity: 0.35,
            lineCap: "round",
            lineJoin: "round"
        }).addTo(routeGroupRef.current);

        // Core Corridor Highway Polyline following exact road geometry
        const corridorLine = L.polyline(activeRouteCoords, {
            color: "#1d4ed8",
            weight: 4.5,
            opacity: 0.95,
            dashArray: "8, 6",
            lineCap: "round",
            lineJoin: "round"
        }).addTo(routeGroupRef.current);

        // --- 2. WAYPOINT & TERMINAL MARKERS SNAPPED TO CORRIDOR ---
        waypoints.forEach((wp, index) => {
            let iconColor = "#1e293b";
            let iconLabel = "WP";
            let iconEmoji = "📍";

            const isDestination = (index === waypoints.length - 1) || wp.type === "PLANT";

            if (wp.type === "PORT") {
                iconColor = "#0284c7"; // Cyan / Blue
                const isGate = wp.name.toLowerCase().includes("gate");
                iconEmoji = isGate ? "🛑" : "⚓";
                iconLabel = isGate ? "PORT IN-GATE" : "PORT TERMINAL";
            } else if (wp.type === "MINE") {
                iconColor = "#b45309";
                iconEmoji = "⛏️";
                iconLabel = "MINE SIDING";
            } else if (wp.type === "TOLL") {
                iconColor = "#d97706"; // Amber
                iconEmoji = "🏷️";
                iconLabel = "TOLL";
            } else if (wp.type === "WEIGHBRIDGE" || wp.name.toLowerCase().includes("gate")) {
                iconColor = "#dc2626"; // Crimson Gate
                iconEmoji = "🛑";
                iconLabel = "PORT GATE 01";
            } else if (isDestination) {
                iconColor = "#991b1b"; // Deep Crimson for Warehouse / Plant
                iconEmoji = "🏭";
                iconLabel = `WH: ${corridorData.dest.shortName.toUpperCase()}`;
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
                iconSize: [isDestination ? 110 : 84, 24],
                iconAnchor: [isDestination ? 55 : 42, 12]
            });

            const [wpLat, wpLon] = getSnappedWpCoord(wp, index, waypoints.length);
            const marker = L.marker([wpLat, wpLon], { icon: wpIcon }).addTo(waypointsGroupRef.current);
            marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 6px; min-width: 220px;">
          <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 4px;">
            <span style="font-size: 14px;">${iconEmoji}</span>
            <strong style="color: #0f172a; font-size: 12px;">${isDestination ? corridorData.dest.name : wp.name}</strong>
          </div>
          <div style="color: ${isDestination ? '#b91c1c' : '#475569'}; font-size: 11px; margin-bottom: 5px; font-weight: ${isDestination ? 'bold' : 'normal'};">
            ${isDestination ? '🎯 Designated Consignee Warehouse & Rotary Tippler Siding (WH-07)' : (wp.desc || "")}
          </div>
          <div style="background: #f1f5f9; padding: 4px 6px; border-radius: 4px; font-family: monospace; font-size: 10px; color: #1e3a8a; display: flex; justify-content: space-between;">
            <span>KM: <strong>${wp.km !== undefined ? wp.km + ' km' : `Node #${index + 1}`}</strong></span>
            <span>${wpLat.toFixed(4)}° N, ${wpLon.toFixed(4)}° E</span>
          </div>
        </div>
      `);
        });

        // Smoothly fit bounds to corridor
        try {
            const boundsLine = corridorLine;
            if (boundsLine) {
                mapInstanceRef.current.fitBounds(boundsLine.getBounds(), {
                    padding: [45, 45],
                    maxZoom: 13,
                    animate: true
                });
            }
        } catch (e) {
            console.warn("fitBounds notice:", e);
        }
    }, [sourceId, destId, activeRouteCoords.length, preciseRoadCoords]);

    // Helper to calculate exact snapped coordinates and heading angle for a truck along OSRM road geometry
    const getTruckSnappedLatLng = (t, trkIdx) => {
        let lat = t.lat;
        let lon = t.lon;
        let angle = 0;
        const isLive = t.isLiveRequirement || t.id === "TRK-LIVE";

        if (preciseRoadCoords && preciseRoadCoords.length > 5) {
            let roadIdx = 0;
            if (isLive) {
                let ratio = 0.02;
                if (typeof t.progressRatio === "number") {
                    ratio = Math.min(0.98, Math.max(0.02, t.progressRatio));
                } else if (typeof t.progressPct === "number") {
                    ratio = Math.min(0.98, Math.max(0.02, t.progressPct / 100));
                } else if (typeof t.distanceCoveredKm === "number") {
                    const totalKm = actualRoadKm || corridorData.distanceKm || 50;
                    ratio = Math.min(0.98, Math.max(0.02, t.distanceCoveredKm / totalKm));
                } else if (t.gateCleared || t.status === "IN TRANSIT") {
                    ratio = 0.45;
                }
                roadIdx = Math.round(ratio * (preciseRoadCoords.length - 1));
            } else if (typeof t.distanceCoveredKm === "number" || typeof t.km === "number") {
                const kmVal = t.distanceCoveredKm || t.km || (trkIdx + 1) * 15;
                const totalKm = actualRoadKm || corridorData.distanceKm || 50;
                const ratio = Math.min(0.95, Math.max(0.05, kmVal / totalKm));
                roadIdx = Math.round(ratio * (preciseRoadCoords.length - 1));
            } else {
                const spreadRatio = ((trkIdx + 1) / (effectiveTrucks.length + 1));
                roadIdx = Math.round(spreadRatio * (preciseRoadCoords.length - 1));
            }
            roadIdx = Math.max(0, Math.min(preciseRoadCoords.length - 1, roadIdx));
            lat = preciseRoadCoords[roadIdx][0];
            lon = preciseRoadCoords[roadIdx][1];

            // Directional heading calculation along road vector
            const nextIdx = Math.min(preciseRoadCoords.length - 1, roadIdx + 1);
            const prevIdx = Math.max(0, roadIdx - 1);
            const p1 = preciseRoadCoords[prevIdx];
            const p2 = preciseRoadCoords[nextIdx];
            if (p1 && p2 && (p1[0] !== p2[0] || p1[1] !== p2[1])) {
                if (mapInstanceRef.current) {
                    try {
                        const pt1 = mapInstanceRef.current.latLngToLayerPoint(p1);
                        const pt2 = mapInstanceRef.current.latLngToLayerPoint(p2);
                        angle = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x) * (180 / Math.PI);
                    } catch (e) {
                        const dy = -(p2[0] - p1[0]);
                        const dx = (p2[1] - p1[1]) * Math.cos(p1[0] * Math.PI / 180);
                        angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    }
                } else {
                    const dy = -(p2[0] - p1[0]);
                    const dx = (p2[1] - p1[1]) * Math.cos(p1[0] * Math.PI / 180);
                    angle = Math.atan2(dy, dx) * (180 / Math.PI);
                }
            }
        }
        const res = [lat, lon];
        res.lat = lat;
        res.lon = lon;
        res.angle = angle;
        return res;
    };

    // Update Truck Markers on Map with precision road alignment without destroying layers during drag
    useEffect(() => {
        if (!mapInstanceRef.current || !markersGroupRef.current) return;

        const currentIds = new Set();

        effectiveTrucks.forEach((t, trkIdx) => {
            const snapped = getTruckSnappedLatLng(t, trkIdx);
            const lat = snapped.lat ?? snapped[0];
            const lon = snapped.lon ?? snapped[1];
            const angle = snapped.angle || 0;
            if (typeof lat !== "number" || typeof lon !== "number") return;

            currentIds.add(t.id);
            const isLive = t.isLiveRequirement || t.id === "TRK-LIVE";
            const isSelected = t.id === selectedTruckId;
            const isDelayed = t.status === "DELAYED" || t.exception !== null;
            const isAtTerminal = t.status === "AT WAREHOUSE" || t.status === "LOADING" || t.status === "AT PORT";

            // Top-Down Blue Cabin + Yellow Corrugated Multi-Axle Hauler Truck (matching company simulation vector)
            const truckScale = isLive ? "scale(0.85)" : "scale(0.72)";
            const truckSvg = `
              <svg width="64" height="22" viewBox="0 0 160 48" style="overflow: visible; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.65));">
                <!-- Chassis Wheels -->
                <rect x="10" y="2" width="12" height="4" rx="1" fill="#18181B" />
                <rect x="10" y="42" width="12" height="4" rx="1" fill="#18181B" />
                <rect x="26" y="2" width="12" height="4" rx="1" fill="#18181B" />
                <rect x="26" y="42" width="12" height="4" rx="1" fill="#18181B" />
                <rect x="42" y="2" width="12" height="4" rx="1" fill="#18181B" />
                <rect x="42" y="42" width="12" height="4" rx="1" fill="#18181B" />
                <rect x="116" y="2" width="12" height="4" rx="1" fill="#18181B" />
                <rect x="116" y="42" width="12" height="4" rx="1" fill="#18181B" />
                
                <!-- Yellow Corrugated Trailer Bed -->
                <rect x="4" y="6" width="112" height="36" rx="2" fill="${isDelayed ? '#D97706' : '#FBBF24'}" stroke="${isDelayed ? '#B45309' : '#D97706'}" stroke-width="1.2" />
                <!-- Trailer Corrugation Ribs -->
                <line x1="12" y1="7" x2="12" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="18" y1="7" x2="18" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="24" y1="7" x2="24" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="30" y1="7" x2="30" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="36" y1="7" x2="36" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="42" y1="7" x2="42" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="48" y1="7" x2="48" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="54" y1="7" x2="54" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="60" y1="7" x2="60" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="66" y1="7" x2="66" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="72" y1="7" x2="72" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="78" y1="7" x2="78" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="84" y1="7" x2="84" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="90" y1="7" x2="90" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="96" y1="7" x2="96" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="102" y1="7" x2="102" y2="41" stroke="#B45309" stroke-width="1.2" />
                <line x1="108" y1="7" x2="108" y2="41" stroke="#B45309" stroke-width="1.2" />
                
                <!-- Blue Driver Cabin (Cab) at Front -->
                <path d="M 118 7 L 146 7 C 154 7 156 14 156 24 C 156 34 154 41 146 41 L 118 41 Z" fill="${isLive ? '#3B82F6' : '#2563EB'}" stroke="#1D4ED8" stroke-width="1.2" />
                <!-- Windscreen -->
                <path d="M 128 10 L 140 10 C 146 10 149 15 149 24 C 149 33 146 38 140 38 L 128 38 C 132 30 132 18 128 10 Z" fill="#0F172A" />
                <!-- Side Mirrors -->
                <rect x="134" y="2" width="4" height="4" rx="1" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.6" />
                <rect x="134" y="42" width="4" height="4" rx="1" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.6" />
              </svg>
            `;

            const truckIcon = L.divIcon({
                className: "custom-truck-icon",
                html: `
          <div style="
            position: relative;
            width: 80px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: ${isLive ? 1000 : isSelected ? 999 : 500};
          ">
            <!-- Pulsing Ground Radar Ring for Live Fleet Vehicle -->
            ${isLive ? `
              <div style="
                position: absolute;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: rgba(245, 158, 11, 0.25);
                border: 1.5px solid rgba(245, 158, 11, 0.65);
                animation: pulse 1.8s infinite;
                pointer-events: none;
              "></div>
            ` : ''}

            <!-- Directionally Rotated Top-Down Truck Matching Company Simulation -->
            <div style="
              transform: rotate(${angle}deg) ${truckScale};
              transform-origin: center center;
              transition: transform 0.2s ease-out;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              ${truckSvg}
            </div>

            <!-- Floating Plate & Telematics Speed Tag -->
            <div style="
              position: absolute;
              bottom: 35px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(15, 23, 42, 0.95);
              border: 1.5px solid ${isLive ? '#38BDF8' : isSelected ? '#60A5FA' : (isDelayed ? '#F59E0B' : '#34D399')};
              box-shadow: 0 3px 8px rgba(0,0,0,0.5);
              padding: 2px 6px;
              border-radius: 5px;
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
              pointer-events: none;
              font-family: monospace;
              z-index: 10;
              ${isSelected ? 'box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.6);' : ''}
            ">
              <span style="font-size: 8px; font-weight: 900; background: ${isLive ? '#0284C7' : (isDelayed ? '#D97706' : '#059669')}; color: white; padding: 1px 3px; border-radius: 2px;">
                ${isLive ? 'LIVE' : 'FLEET'}
              </span>
              <span style="font-size: 9px; font-weight: 800; color: #FFFFFF;">
                ${t.plate}
              </span>
              <span style="font-size: 8px; font-weight: 700; color: #FDE68A;">
                ${t.speedKmh > 0 ? t.speedKmh + 'k' : (isLive && t.gateApprovalStatus !== 'APPROVED' ? 'QR SCAN' : '0k')}
              </span>
            </div>
          </div>
        `,
                iconSize: [80, 52],
                iconAnchor: [40, 26]
            });

            const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; padding: 4px; min-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 4px;">
              ${isLive ? '<span style="background: #059669; color: white; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: bold;">LIVE REQ</span>' : ''}
              <strong style="font-family: monospace; font-size: 13px; color: #0f172a;">${t.plate}</strong>
            </div>
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
            <strong>Speed / ETA:</strong> ${t.speedKmh} km/h · ETA ${t.etaFormatted || t.etaMinutes + 'm' || 'On Schedule'}
          </div>
          <div style="display: flex; justify-content: space-between; font-family: monospace; font-size: 10px; color: #1e3a8a; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <span>FASTag: ${t.fastag?.tagId || t.fastag?.issuer?.split(' ')[0] || "Active"}</span>
            <span>GatePass: ${t.gatePassId || "GP-2026"}</span>
          </div>
        </div>
      `;

            let existingMarker = truckMarkersRef.current.get(t.id);
            if (existingMarker) {
                existingMarker.setLatLng([lat, lon]);
                existingMarker.setIcon(truckIcon);
                if (existingMarker.getPopup()) {
                    existingMarker.getPopup().setContent(popupContent);
                }
            } else {
                const marker = L.marker([lat, lon], { icon: truckIcon }).addTo(markersGroupRef.current);
                marker.on("click", () => {
                    if (onSelectTruck) onSelectTruck(t.id);
                });
                marker.bindPopup(popupContent);
                truckMarkersRef.current.set(t.id, marker);
            }
        });

        // Clean up removed truck markers
        for (const [id, marker] of truckMarkersRef.current.entries()) {
            if (!currentIds.has(id)) {
                markersGroupRef.current.removeLayer(marker);
                truckMarkersRef.current.delete(id);
            }
        }

        // Only smoothly follow truck if the user explicitly turned on Following and is not currently dragging/interacting
        if (isFollowing && !isUserInteractingRef.current && mapInstanceRef.current) {
            const trkIdx = effectiveTrucks.findIndex(t => t.id === selectedTruckId);
            const liveTruck = trkIdx >= 0 ? effectiveTrucks[trkIdx] : effectiveTrucks[0];
            if (liveTruck) {
                const [liveLat, liveLon] = getTruckSnappedLatLng(liveTruck, trkIdx >= 0 ? trkIdx : 0);
                if (typeof liveLat === "number" && typeof liveLon === "number") {
                    const isDragging = mapInstanceRef.current.dragging && mapInstanceRef.current.dragging.moving();
                    if (!isDragging) {
                        mapInstanceRef.current.panTo([liveLat, liveLon], { animate: true, duration: 0.4 });
                    }
                }
            }
        }
    }, [effectiveTrucks, selectedTruckId, preciseRoadCoords, actualRoadKm, isFollowing]);

    // Center on selected truck ONLY when user selects a different truck (not on every simulation tick)
    useEffect(() => {
        if (!mapInstanceRef.current || !selectedTruckId) return;
        if (prevSelectedTruckIdRef.current === selectedTruckId) return;
        prevSelectedTruckIdRef.current = selectedTruckId;

        // Reset user interaction so the newly selected truck is brought into view
        isUserInteractingRef.current = false;

        const trkIdx = effectiveTrucks.findIndex(t => t.id === selectedTruckId);
        const selectedTruck = trkIdx >= 0 ? effectiveTrucks[trkIdx] : null;
        if (selectedTruck) {
            const [lat, lon] = getTruckSnappedLatLng(selectedTruck, trkIdx);
            if (typeof lat === "number" && typeof lon === "number") {
                mapInstanceRef.current.panTo([lat, lon], { animate: true, duration: 0.5 });
            }
        }
    }, [selectedTruckId]);

    // Explicit user button to center or follow the selected truck
    const handleCenterTruck = () => {
        if (!mapInstanceRef.current) return;
        const trkIdx = effectiveTrucks.findIndex(t => t.id === selectedTruckId);
        const truck = trkIdx >= 0 ? effectiveTrucks[trkIdx] : effectiveTrucks[0];
        if (truck) {
            const [lat, lon] = getTruckSnappedLatLng(truck, trkIdx >= 0 ? trkIdx : 0);
            if (typeof lat === "number" && typeof lon === "number") {
                isUserInteractingRef.current = false;
                setIsFollowing(prev => !prev);
                mapInstanceRef.current.panTo([lat, lon], { animate: true, duration: 0.5 });
            }
        }
    };

    const fitCorridor = () => {
        if (!mapInstanceRef.current || corridorRouteCoords.length === 0) return;
        isUserInteractingRef.current = true;
        setIsFollowing(false);
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
                                <span>{activeTab === "first-mile" ? "Source (Overseas Mine / Inland Siding)" : "Source (East Coast India Discharge Port)"}</span>
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
                                {activeTab === "first-mile" ? (
                                    <optgroup label="Overseas Mine Sidings (First-Mile Origins)">
                                        {CORRIDOR_SOURCES.filter(s => s.leg === "first-mile").map(s => (
                                            <option key={s.id} value={s.id}>
                                                ⛏️ {s.name} ({s.country})
                                            </option>
                                        ))}
                                    </optgroup>
                                ) : (
                                    <optgroup label="East Coast India Discharge Ports (Last-Mile Origins)">
                                        {CORRIDOR_SOURCES.filter(s => s.leg === "last-mile").map(s => (
                                            <option key={s.id} value={s.id}>
                                                ⚓ {s.name} ({s.state})
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
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
                                <span>{activeTab === "first-mile" ? "Destination (Overseas Export Loading Port)" : "Destination (Domestic Consignee Warehouse & Plant)"}</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                                {corridorData.dest.state}, {corridorData.dest.country}
                            </span>
                        </div>
                        <div className="relative">
                            <select
                                value={destId}
                                onChange={(e) => handleDestChange(e.target.value)}
                                className="w-full bg-slate-800/90 border border-slate-600 hover:border-rose-400 focus:border-rose-400 text-white font-mono text-xs rounded-lg px-3 py-2 pr-8 outline-none transition cursor-pointer appearance-none shadow-inner"
                            >
                                {activeTab === "first-mile" ? (
                                    <optgroup label="Overseas Deepwater Export Loading Ports">
                                        {CORRIDOR_DESTINATIONS.filter(d => d.leg === "first-mile").map(d => (
                                            <option key={d.id} value={d.id}>
                                                ⚓ {d.name} ({d.country})
                                            </option>
                                        ))}
                                    </optgroup>
                                ) : (
                                    <optgroup label="Domestic Consignee Plants & Silos (India)">
                                        {CORRIDOR_DESTINATIONS.filter(d => d.leg === "last-mile").map(d => (
                                            <option key={d.id} value={d.id}>
                                                🏭 {d.name} ({d.state})
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                                ▼
                            </div>
                        </div>
                    </div>
                </div>

                {/* Popular Quick-Select Corridor Presets */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800 text-[10px] font-mono">
                    <span className="text-slate-400 mr-1">
                        {activeTab === "first-mile" ? "First-Mile Corridors:" : "Last-Mile Corridors:"}
                    </span>
                    {activeTab === "first-mile" ? (
                        <>
                            <button
                                onClick={() => handleSelectPreset("hunter_valley", "newcastle_port")}
                                className={`px-2 py-0.5 rounded transition ${sourceId === "hunter_valley" && destId === "newcastle_port" ? "bg-sky-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"}`}
                            >
                                Hunter Valley ➔ Newcastle Port (M15)
                            </button>
                            <button
                                onClick={() => handleSelectPreset("kalimantan_mine", "taboneo_port")}
                                className={`px-2 py-0.5 rounded transition ${sourceId === "kalimantan_mine" && destId === "taboneo_port" ? "bg-sky-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"}`}
                            >
                                Kalimantan ➔ Taboneo Anchorage
                            </button>
                            <button
                                onClick={() => handleSelectPreset("mpumalanga_siding", "richards_bay_port")}
                                className={`px-2 py-0.5 rounded transition ${sourceId === "mpumalanga_siding" && destId === "richards_bay_port" ? "bg-sky-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"}`}
                            >
                                Mpumalanga ➔ Richards Bay (N4/N2)
                            </button>
                            <button
                                onClick={() => handleSelectPreset("pilbara_siding", "port_hedland_port")}
                                className={`px-2 py-0.5 rounded transition ${sourceId === "pilbara_siding" && destId === "port_hedland_port" ? "bg-sky-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"}`}
                            >
                                Pilbara ➔ Port Hedland
                            </button>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>

            {/* Interactive Leaflet Map Container */}
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-300 shadow-md bg-slate-900">
                <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 0 }} />

                {/* Corridor Header Overlay Inside Map */}
                <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-700 text-white shadow-lg max-w-[85%]">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span className="text-[10px] font-mono tracking-wider text-slate-300 uppercase font-bold">
                            {corridorData.highway}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 font-bold flex items-center gap-1">
                            <span>🛣️</span> Road Highway Route (Active)
                        </span>
                    </div>
                    <div className="text-xs font-extrabold text-white mt-0.5 font-mono flex flex-wrap items-center gap-1.5">
                        <span className="text-sky-300">{corridorData.source.shortName}</span>
                        <span className="text-amber-400">➔</span>
                        <span className="text-rose-300">{corridorData.dest.shortName}</span>
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                            (Road Transit: {actualRoadKm ? `${actualRoadKm} km` : `${corridorData.distanceKm} km`} · ~{corridorData.durationHours}h)
                        </span>
                    </div>
                </div>

                {/* Map Controls: Center Truck, Map Styles, Fit View */}
                <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 text-white shadow-lg text-[11px] font-mono">
                    <button
                        onClick={handleCenterTruck}
                        className={`px-2 py-1 rounded transition flex items-center gap-1 font-bold ${
                            isFollowing
                                ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400"
                                : "text-sky-300 hover:text-white hover:bg-sky-600/30"
                        }`}
                        title={isFollowing ? "Auto-following truck · Drag map anytime to unlock free movement" : "Center map on active truck"}
                    >
                        <Navigation size={12} className={isFollowing ? "text-white" : "text-sky-400"} />
                        <span>{isFollowing ? "Following" : "Center Truck"}</span>
                    </button>
                    <div className="w-px h-4 bg-slate-700 mx-0.5"></div>
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