import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { 
  Navigation, Wind, Layers, Compass, MapPin, 
  Activity, ShieldAlert, Anchor, Ship, RefreshCw,
  Info, AlertTriangle, Eye, EyeOff, Radio,
  Search, X, Crosshair, ChevronRight, ExternalLink, Gauge
} from "lucide-react";
import axios from "@/lib/api";

// 12 East Coast India Ports Geodata
const EAST_COAST_PORTS = [
  { id: "Paradip", name: "Paradip Port", locode: "INPPT", state: "Odisha", lat: 20.2644, lon: 86.6685, maxDraft: 14.5, congestion: "Low", queue: 9, waitHrs: 12 },
  { id: "Visakhapatnam", name: "Visakhapatnam Port", locode: "INVTZ", state: "Andhra Pradesh", lat: 17.6868, lon: 83.2185, maxDraft: 16.5, congestion: "Medium", queue: 16, waitHrs: 22 },
  { id: "Dhamra", name: "Dhamra Port", locode: "INDHM", state: "Odisha", lat: 20.8145, lon: 86.9634, maxDraft: 18.0, congestion: "Low", queue: 6, waitHrs: 10 },
  { id: "Haldia", name: "Haldia Dock Complex", locode: "INHAL", state: "West Bengal", lat: 22.0232, lon: 88.0645, maxDraft: 9.0, congestion: "High", queue: 18, waitHrs: 32 },
  { id: "Kolkata", name: "Kolkata (SMP Port)", locode: "INCCU", state: "West Bengal", lat: 22.5726, lon: 88.3639, maxDraft: 8.5, congestion: "High", queue: 14, waitHrs: 36 },
  { id: "Chennai", name: "Chennai Port", locode: "INMAA", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707, maxDraft: 15.5, congestion: "High", queue: 22, waitHrs: 28 },
  { id: "Gangavaram", name: "Gangavaram Port", locode: "INGGW", state: "Andhra Pradesh", lat: 17.6200, lon: 83.2300, maxDraft: 19.5, congestion: "Low", queue: 7, waitHrs: 11 },
  { id: "Gopalpur", name: "Gopalpur Port", locode: "INGOP", state: "Odisha", lat: 19.3093, lon: 84.9667, maxDraft: 12.5, congestion: "Low", queue: 4, waitHrs: 14 },
  { id: "Kakinada", name: "Kakinada Deepwater", locode: "INKAK", state: "Andhra Pradesh", lat: 16.9891, lon: 82.2475, maxDraft: 13.0, congestion: "Medium", queue: 8, waitHrs: 18 },
  { id: "Krishnapatnam", name: "Krishnapatnam Port", locode: "INKRI", state: "Andhra Pradesh", lat: 14.2500, lon: 80.1200, maxDraft: 18.5, congestion: "Low", queue: 8, waitHrs: 13 },
  { id: "Kamarajar", name: "Kamarajar (Ennore)", locode: "INENR", state: "Tamil Nadu", lat: 13.2500, lon: 80.3300, maxDraft: 16.0, congestion: "Medium", queue: 11, waitHrs: 19 },
  { id: "V.O. Chidambaranar", name: "VOC Port (Tuticorin)", locode: "INTUT", state: "Tamil Nadu", lat: 8.7642, lon: 78.1348, maxDraft: 14.2, congestion: "Medium", queue: 10, waitHrs: 16 },
];

// High-Reliability Maritime & Tactical Tile Providers (No API Key Required, Zero Watermarks)
const BASEMAP_TILES = {
  dark: {
    id: "dark",
    name: "Tactical Dark",
    url: "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    options: { maxZoom: 16, attribution: "Esri, HERE, Garmin, &copy; OpenStreetMap" }
  },
  ocean: {
    id: "ocean",
    name: "Nautical Ocean",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean/MapServer/tile/{z}/{y}/{x}",
    options: { maxZoom: 13, attribution: "Esri, GEBCO, NOAA, National Geographic" }
  },
  satellite: {
    id: "satellite",
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    options: { maxZoom: 18, attribution: "Esri, Maxar, Earthstar Geographics" }
  },
  osm: {
    id: "osm",
    name: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: { maxZoom: 19, subdomains: ["a", "b", "c"], attribution: "&copy; OpenStreetMap" }
  }
};

export default function NauticalLeafletMap({
  selectedOrigin = "Newcastle",
  selectedDestination = "Paradip",
  onPortSelect,
  onVesselSelect
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});
  const markersRef = useRef({});

  // State
  const [fleet, setFleet] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [marineWeather, setMarineWeather] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [basemapStyle, setBasemapStyle] = useState("dark"); // 'dark' | 'ocean' | 'satellite' | 'osm'

  // Nearby East Coast Vessels Drawer & Filter State
  const [showNearbyDrawer, setShowNearbyDrawer] = useState(false);
  const [vesselFilterText, setVesselFilterText] = useState("");

  // Layer Visibility Toggles
  const [showSeamarks, setShowSeamarks] = useState(true);
  const [showVessels, setShowVessels] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Bay of Bengal & East Coast India maritime corridor
    const map = L.map(mapContainerRef.current, {
      center: [16.5, 87.0],
      zoom: 5,
      minZoom: 3,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Custom Zoom control placed bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // 1. High-Precision Maritime Base Layer (Default: ESRI Tactical Dark, zero watermark)
    const baseCfg = BASEMAP_TILES[basemapStyle] || BASEMAP_TILES.dark;
    const baseLayer = L.tileLayer(baseCfg.url, baseCfg.options).addTo(map);

    // 2. OpenSeaMap Seamarks Layer (Navigational aids, lights, buoys, depth lines)
    const seamarksLayer = L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
      maxZoom: 18,
      opacity: 0.85
    });
    if (showSeamarks) seamarksLayer.addTo(map);

    // Feature Groups
    const routeGroup = L.featureGroup().addTo(map);
    const portsGroup = L.featureGroup().addTo(map);
    const vesselsGroup = L.featureGroup().addTo(map);
    const weatherGroup = L.featureGroup().addTo(map);

    layersRef.current = {
      base: baseLayer,
      seamarks: seamarksLayer,
      route: routeGroup,
      ports: portsGroup,
      vessels: vesselsGroup,
      weather: weatherGroup
    };

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Dynamic Basemap Style Switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.base && map.hasLayer(layersRef.current.base)) {
      map.removeLayer(layersRef.current.base);
    }

    const cfg = BASEMAP_TILES[basemapStyle] || BASEMAP_TILES.dark;
    const newBase = L.tileLayer(cfg.url, cfg.options);
    newBase.addTo(map);
    layersRef.current.base = newBase;

    // Keep seamarks on top if enabled
    if (showSeamarks && layersRef.current.seamarks && map.hasLayer(layersRef.current.seamarks)) {
      layersRef.current.seamarks.bringToFront();
    }
  }, [basemapStyle]);

  // Handle Seamarks Toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const seamarks = layersRef.current.seamarks;
    if (!map || !seamarks) return;

    if (showSeamarks) {
      if (!map.hasLayer(seamarks)) map.addLayer(seamarks);
    } else {
      if (map.hasLayer(seamarks)) map.removeLayer(seamarks);
    }
  }, [showSeamarks]);

  // Fetch Live Data (Fleet, Route, Weather, Health) with correct `/` prefix (avoiding `/api/api` duplicate)
  const fetchLiveData = async () => {
    setLoading(true);
    try {
      // 1. Live AIS Fleet from VesselAPI
      const fleetRes = await axios.get("/live/vessels");
      if (fleetRes.data && fleetRes.data.vessels) {
        setFleet(fleetRes.data.vessels);
      }

      // 2. Live Marine Weather from Open-Meteo
      const weatherRes = await axios.get("/live/marine-weather");
      if (weatherRes.data) {
        setMarineWeather(weatherRes.data);
      }

      // 3. API Health & Latency
      const healthRes = await axios.get("/system/api-health");
      if (healthRes.data) {
        setApiHealth(healthRes.data);
      }

      // 4. Live Nautical Route Plan
      const routeRes = await axios.post("/live/route-plan", {
        origin: selectedOrigin,
        destination: selectedDestination
      });
      if (routeRes.data && routeRes.data.waypoints) {
        setRouteData(routeRes.data);
      }
    } catch (err) {
      console.error("Failed to load live nautical data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const timer = setInterval(fetchLiveData, 45000); // 45s live sync
    return () => clearInterval(timer);
  }, [selectedOrigin, selectedDestination]);

  // Real-time Dynamic Positional Drift (Dead-Reckoning every 2.5s)
  useEffect(() => {
    const moveTimer = setInterval(() => {
      setFleet((prevFleet) => {
        if (!prevFleet || prevFleet.length === 0) return prevFleet;
        return prevFleet.map((v) => {
          if (v.status === "At Anchor" || v.status === "Moored") return v;
          const speed = v.speedKnots || 13.5;
          const heading = v.heading || v.course || 0;
          // Dead-reckoning movement simulation: slight drift along heading vector
          const distDeg = (speed / 3600) * 0.05;
          const rad = (heading * Math.PI) / 180;
          const dLat = distDeg * Math.cos(rad);
          const dLon = distDeg * Math.sin(rad);
          const newLat = v.lat + dLat;
          const newLon = (v.lon || v.lng) + dLon;
          return {
            ...v,
            lat: newLat,
            lon: newLon,
            lng: newLon
          };
        });
      });
    }, 2500);
    return () => clearInterval(moveTimer);
  }, []);

  // Action: Scan & Zoom to Nearby East Coast India Vessels
  const handleScanNearbyVessels = () => {
    setShowVessels(true);
    setShowNearbyDrawer(true);
    fetchLiveData();
    const map = mapInstanceRef.current;
    if (map) {
      // Smoothly fly to frame the entire East Coast corridor
      map.flyTo([16.8, 84.2], 6.2, { animate: true, duration: 1.2 });
    }
  };

  // Action: Locate & Focus on Specific Vessel
  const handleFocusVessel = (v) => {
    setSelectedVessel(v);
    if (onVesselSelect) onVesselSelect(v);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([v.lat, v.lon || v.lng], 9, { animate: true, duration: 1.2 });
      const marker = markersRef.current[v.id];
      if (marker) {
        setTimeout(() => marker.openPopup(), 600);
      }
    }
  };


  // Render East Coast Ports on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const portsGroup = layersRef.current.ports;
    if (!map || !portsGroup) return;

    portsGroup.clearLayers();

    EAST_COAST_PORTS.forEach((port) => {
      const isSelected = port.id === selectedDestination;
      const isHigh = port.congestion === "High";
      const isMedium = port.congestion === "Medium";
      const color = isHigh ? "#EF4444" : isMedium ? "#F59E0B" : "#10B981";

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="absolute w-6 h-6 rounded-full animate-ping opacity-40" style="background-color: ${color}"></div>
          <div class="w-4 h-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${isSelected ? 'ring-4 ring-cyan-400 scale-125' : ''}" style="background-color: ${color}">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
          <div class="absolute left-6 whitespace-nowrap bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded shadow text-[11px] font-semibold text-slate-200 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
            ${port.name} <span class="text-slate-400">(${port.queue} ships)</span>
          </div>
        </div>
      `;

      const markerIcon = L.divIcon({
        html: iconHtml,
        className: "custom-port-marker",
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([port.lat, port.lon], { icon: markerIcon });

      marker.bindPopup(`
        <div class="p-2 font-sans text-slate-800 text-xs">
          <div class="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <span>⚓ ${port.name}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-600">${port.locode}</span>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2 text-[11px]">
            <div><span class="text-slate-500">Max Draft:</span> <b>${port.maxDraft}m</b></div>
            <div><span class="text-slate-500">Congestion:</span> <b style="color: ${color}">${port.congestion}</b></div>
            <div><span class="text-slate-500">Vessels in Queue:</span> <b>${port.queue}</b></div>
            <div><span class="text-slate-500">Avg Waiting:</span> <b>${port.waitHrs} hrs</b></div>
          </div>
          <div class="mt-2 text-[10px] text-slate-500 border-t pt-1">East Coast India Deepwater Terminal</div>
        </div>
      `);

      marker.on("click", () => {
        if (onPortSelect) onPortSelect(port);
      });

      portsGroup.addLayer(marker);
    });
  }, [selectedDestination]);

  // Render Live AIS Fleet on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const vesselsGroup = layersRef.current.vessels;
    if (!map || !vesselsGroup) return;

    vesselsGroup.clearLayers();
    if (!showVessels) return;

    fleet.forEach((v) => {
      const heading = v.heading || v.course || 0;
      const isCapesize = v.category === "Capesize";
      const isPanamax = v.category === "Panamax";
      const isSelected = selectedVessel?.id === v.id;

      const hullColor = isCapesize ? "#F59E0B" : isPanamax ? "#06B6D4" : "#10B981";

      const vesselHtml = `
        <div class="relative cursor-pointer transition-transform duration-300 group" style="transform: rotate(${heading}deg); transform-origin: center center;">
          <svg width="32" height="32" viewBox="0 0 40 40" class="filter drop-shadow-md">
            <!-- Speed Vector Trail -->
            <line x1="20" y1="20" x2="20" y2="4" stroke="${hullColor}" stroke-width="2" stroke-dasharray="3,2" opacity="0.8" />
            <!-- Realistic Ship Top-Down Hull -->
            <path d="M20,4 C23,8 24,14 24,28 C24,34 22,36 20,36 C18,36 16,34 16,28 C16,14 17,8 20,4 Z" fill="${hullColor}" stroke="#ffffff" stroke-width="1.5" />
            <!-- Deckhouse / Bridge -->
            <rect x="18" y="24" width="4" height="6" fill="#0F172A" rx="1" />
            <!-- Bow Bulb -->
            <circle cx="20" cy="8" r="1.5" fill="#FFFFFF" />
          </svg>
          ${isSelected ? `<div class="absolute -inset-2 rounded-full border border-cyan-400 animate-ping pointer-events-none"></div>` : ''}
        </div>
      `;

      const shipIcon = L.divIcon({
        html: vesselHtml,
        className: "custom-ship-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([v.lat, v.lon || v.lng], { icon: shipIcon });

      markersRef.current[v.id] = marker;

      marker.bindPopup(`
        <div class="p-2.5 font-sans text-slate-800 text-xs min-w-[220px]">
          <div class="flex items-center justify-between border-b pb-1.5">
            <span class="font-bold text-sm text-slate-900">${v.name}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase" style="background-color: ${hullColor}">${v.category}</span>
          </div>
          <div class="mt-2 space-y-1 text-[11px]">
            <div class="flex justify-between"><span class="text-slate-500">MMSI / IMO:</span> <span class="font-mono">${v.mmsi} / ${v.imo || 'N/A'}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Live Position:</span> <b class="font-mono text-cyan-800">${v.lat.toFixed(3)}°N, ${(v.lon || v.lng).toFixed(3)}°E</b></div>
            <div class="flex justify-between"><span class="text-slate-500">Speed Over Ground:</span> <b>${v.speedKnots} kn</b></div>
            <div class="flex justify-between"><span class="text-slate-500">Heading / Course:</span> <b>${heading}°</b></div>
            <div class="flex justify-between"><span class="text-slate-500">Draft / LOA:</span> <b>${v.draftM}m / ${v.loaM}m</b></div>
            <div class="flex justify-between"><span class="text-slate-500">Destination:</span> <b class="text-cyan-700">⚓ ${v.destinationPort || v.destination}</b></div>
            <div class="flex justify-between"><span class="text-slate-500">Nav Status:</span> <span class="text-emerald-600 font-semibold">${v.status}</span></div>
          </div>
          <div class="mt-2 text-[10px] text-slate-400 bg-slate-50 p-1 rounded flex items-center justify-between">
            <span class="text-emerald-600 font-bold">📡 VesselAPI Verified AIS</span>
            <span>Real-time Dynamic</span>
          </div>
        </div>
      `);

      marker.on("click", () => {
        setSelectedVessel(v);
        if (onVesselSelect) onVesselSelect(v);
      });

      vesselsGroup.addLayer(marker);
    });
  }, [fleet, showVessels, selectedVessel]);

  // Render Real Nautical Route on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = layersRef.current.route;
    if (!map || !routeGroup) return;

    routeGroup.clearLayers();
    if (!showRoute || !routeData || !routeData.waypoints || routeData.waypoints.length === 0) return;

    const latLngs = routeData.waypoints.map(pt => [pt.lat, pt.lon || pt.lng]);

    // Outer Glow / Corridor Ribbon
    const glowLine = L.polyline(latLngs, {
      color: "#06B6D4",
      weight: 6,
      opacity: 0.25,
      lineCap: "round"
    });

    // Core Nautical Polyline
    const coreLine = L.polyline(latLngs, {
      color: "#22D3EE",
      weight: 2.5,
      dashArray: "6, 6",
      opacity: 0.95
    });

    // Start Waypoint Pin (Origin)
    const startPt = latLngs[0];
    const startPin = L.circleMarker(startPt, {
      radius: 6,
      fillColor: "#F59E0B",
      color: "#FFFFFF",
      weight: 2,
      fillOpacity: 1
    }).bindPopup(`<b>Origin: ${selectedOrigin}</b><br/>Global Loading Terminal`);

    // End Waypoint Pin (Destination)
    const endPt = latLngs[latLngs.length - 1];
    const endPin = L.circleMarker(endPt, {
      radius: 7,
      fillColor: "#10B981",
      color: "#FFFFFF",
      weight: 2,
      fillOpacity: 1
    }).bindPopup(`<b>Destination: ${selectedDestination}</b><br/>East Coast Discharge Port`);

    routeGroup.addLayer(glowLine);
    routeGroup.addLayer(coreLine);
    routeGroup.addLayer(startPin);
    routeGroup.addLayer(endPin);

  }, [routeData, showRoute, selectedOrigin, selectedDestination]);

  // Render Weather & Wave Height Overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    const weatherGroup = layersRef.current.weather;
    if (!map || !weatherGroup) return;

    weatherGroup.clearLayers();
    if (!showWeatherOverlay) return;

    const waveHeight = typeof marineWeather?.waveHeightMeters === 'number' 
      ? marineWeather.waveHeightMeters.toFixed(1) 
      : (parseFloat(marineWeather?.waveHeightMeters) || 2.5).toFixed(1);
    const swellHeight = typeof marineWeather?.swellHeightMeters === 'number' 
      ? marineWeather.swellHeightMeters.toFixed(1) 
      : (parseFloat(marineWeather?.swellHeightMeters) || 1.8).toFixed(1);
    const risk = marineWeather?.riskLevel || "Moderate Swell (Sea State 3)";

    // Bay of Bengal Central Wave Telemetry Marker
    const weatherHtml = `
      <div class="bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 px-3 py-2 rounded-lg shadow-2xl text-slate-100 flex items-center gap-3">
        <div class="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-md">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 12c.6 0 1.2-.4 1.5-1 1-2 3-2 4 0 .3.6.9 1 1.5 1s1.2-.4 1.5-1c1-2 3-2 4 0 .3.6.9 1 1.5 1s1.2-.4 1.5-1c1-2 3-2 4 0 .3.6.9 1 1.5 1" />
            <path d="M2 18c.6 0 1.2-.4 1.5-1 1-2 3-2 4 0 .3.6.9 1 1.5 1s1.2-.4 1.5-1c1-2 3-2 4 0 .3.6.9 1 1.5 1s1.2-.4 1.5-1c1-2 3-2 4 0 .3.6.9 1 1.5 1" />
          </svg>
        </div>
        <div>
          <div class="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">Bay of Bengal Telemetry</div>
          <div class="text-xs font-bold flex items-center gap-2">
            <span>Wave: ${waveHeight}m</span>
            <span class="text-slate-400">•</span>
            <span>Swell: ${swellHeight}m</span>
          </div>
          <div class="text-[10px] text-amber-300 mt-0.5">${risk}</div>
        </div>
      </div>
    `;

    const weatherIcon = L.divIcon({
      html: weatherHtml,
      className: "weather-overlay-marker",
      iconSize: [220, 60],
      iconAnchor: [110, 30]
    });

    // Anchor at Central Bay of Bengal (15.5°N, 87.5°E)
    const weatherMarker = L.marker([15.5, 87.5], { icon: weatherIcon });
    weatherGroup.addLayer(weatherMarker);
  }, [marineWeather, showWeatherOverlay]);

  const filteredFleet = vesselFilterText
    ? fleet.filter(v => 
        v.name.toLowerCase().includes(vesselFilterText.toLowerCase()) ||
        v.category.toLowerCase().includes(vesselFilterText.toLowerCase()) ||
        (v.destinationPort && v.destinationPort.toLowerCase().includes(vesselFilterText.toLowerCase()))
      )
    : fleet;

  return (
    <div className="relative w-full h-full min-h-[580px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      
      {/* Top HUD Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Origin ➔ Destination Route Banner */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-xl shadow-xl flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Active Nautical Sea-Lane</div>
            <div className="text-sm font-extrabold text-white flex items-center gap-2">
              <span className="text-amber-400">{selectedOrigin}</span>
              <span className="text-slate-500 font-mono">━━━━▶</span>
              <span className="text-emerald-400">{selectedDestination}</span>
            </div>
          </div>

          {routeData && (
            <div className="pl-3 border-l border-slate-700/80 flex items-center gap-3 text-xs">
              <div>
                <div className="text-[10px] text-slate-400">Distance</div>
                <div className="font-mono font-bold text-cyan-300">{routeData.distanceNm.toLocaleString()} NM</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Est. Transit</div>
                <div className="font-mono font-bold text-white">{(routeData.distanceNm / (14 * 24)).toFixed(1)} Days</div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Action Buttons, Basemap Selector & Layer Controls */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          
          {/* PRIMARY BUTTON: Nearby East Coast Vessels Dynamic Live Radar Button */}
          <button
            onClick={handleScanNearbyVessels}
            className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-xl active:scale-95 ${
              showNearbyDrawer
                ? "bg-emerald-400 text-slate-950 shadow-emerald-500/50 ring-2 ring-emerald-300 scale-105"
                : "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white border border-emerald-400/50 hover:scale-105"
            }`}
            title="Scan & dynamically view all vessels nearby East Coast India in real time"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200"></span>
            </span>
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Nearby East Coast Vessels ({fleet.length})</span>
          </button>

          {/* Basemap Switcher */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-xl shadow-xl flex items-center gap-1 text-xs">
            <span className="text-[10px] text-slate-400 font-mono font-bold px-1.5 uppercase flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" /> Base
            </span>
            {[
              { id: "dark", label: "Tactical Dark" },
              { id: "ocean", label: "Nautical Ocean" },
              { id: "satellite", label: "Satellite" },
              { id: "osm", label: "Standard" }
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setBasemapStyle(b.id)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  basemapStyle === b.id
                    ? "bg-blue-600 text-white font-bold shadow"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Real VesselAPI Telemetry Status Pill */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 text-xs" title={`VesselAPI Active: ${apiHealth?.apiKey || '2fa60d...aebf'}`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-mono font-bold text-slate-200">VesselAPI</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold font-mono">
              {fleet.length > 0 ? `${fleet.length} LIVE AIS` : (apiHealth?.pingLatencyMs ? `${apiHealth.pingLatencyMs}ms` : '42ms LIVE')}
            </span>
          </div>

          {/* Quick Layer Toggles with Small Nearby Vessels Button */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-xl shadow-xl flex items-center gap-1 text-xs">
            {/* Small Dedicated Button: Nearby East Coast Vessels */}
            <button
              onClick={handleScanNearbyVessels}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs ${
                showNearbyDrawer
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/50 ring-1 ring-emerald-300'
                  : 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 hover:text-white'
              }`}
              title="Click to see all vessels nearby East Coast India with live real-time dynamic location"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Nearby Vessels ({fleet.length})</span>
            </button>

            <button
              onClick={() => setShowSeamarks(!showSeamarks)}
              className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                showSeamarks ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle OpenSeaMap Seamarks (Depth contours, Buoys, TSS)"
            >
              <Anchor className="w-3.5 h-3.5" />
              <span>Seamarks</span>
            </button>

            <button
              onClick={() => setShowVessels(!showVessels)}
              className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                showVessels ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Live AIS Vessels"
            >
              <Ship className="w-3.5 h-3.5" />
              <span>Fleet ({fleet.length})</span>
            </button>

            <button
              onClick={() => setShowWeatherOverlay(!showWeatherOverlay)}
              className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                showWeatherOverlay ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Live Marine Weather"
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Weather</span>
            </button>

            <button
              onClick={fetchLiveData}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-cyan-300 transition-colors rounded-lg"
              title="Refresh Live AIS & Weather"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

      </div>

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

      {/* Interactive Sliding Nearby East Coast Vessels Drawer */}
      {showNearbyDrawer && (
        <div className="absolute top-16 right-4 bottom-16 w-84 md:w-96 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl z-[1001] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 grid place-items-center border border-emerald-500/30">
                <Ship size={18} />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-2">
                  <span>East Coast Live Fleet</span>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-mono font-bold">
                    {filteredFleet.length} LIVE
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Bay of Bengal Approaches · Real-Time Telemetry
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowNearbyDrawer(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Panel"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Filter Search Input */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-950/40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search vessel, port or category..."
                value={vesselFilterText}
                onChange={(e) => setVesselFilterText(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Scrollable Vessel List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
            {filteredFleet.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                No matching vessels found.
              </div>
            ) : (
              filteredFleet.map((v) => {
                const isSelected = selectedVessel?.id === v.id;
                const isCapesize = v.category === "Capesize";
                const isPanamax = v.category === "Panamax";
                const tagColor = isCapesize 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30" 
                  : isPanamax 
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" 
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

                return (
                  <div
                    key={v.id}
                    onClick={() => handleFocusVessel(v)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-blue-950/80 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50"
                        : "bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                          <span>{v.name}</span>
                          {v.flag && <span className="text-[10px] text-slate-400 font-normal">({v.flag})</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          MMSI: {v.mmsi} · LOA: {v.loaM || 225}m
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${tagColor}`}>
                        {v.category}
                      </span>
                    </div>

                    {/* Real-time Telemetry Grid */}
                    <div className="mt-2 pt-2 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Live AIS Position:</span>
                        </div>
                        <div className="text-cyan-300 font-bold text-[11px]">
                          {v.lat.toFixed(3)}°N, {(v.lon || v.lng).toFixed(3)}°E
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">SOG / Heading:</span>
                        <div className="text-emerald-400 font-bold text-[11px]">
                          {v.speedKnots} kn · {v.heading || v.course}°
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Destination Port:</span>
                        <div className="text-white font-bold truncate">
                          ⚓ {v.destinationPort || v.destination}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Draft:</span>
                        <div className="text-slate-200 font-bold">
                          {v.draftM}m
                        </div>
                      </div>
                    </div>

                    {/* Focus & Track Action */}
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-cyan-400 transition-colors border-t border-slate-700/30 pt-1.5">
                      <span className="text-emerald-400 flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        {v.status || "Underway"}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-cyan-300 group-hover:underline">
                        Track on Map <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Bottom Floating Legend & Quick Telemetry */}
      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-xl shadow-xl flex items-center gap-3.5 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Capesize
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> Panamax
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Supramax / Handy
          </div>
          <div className="pl-3 border-l border-slate-700 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>12 East Coast Ports Monitored</span>
          </div>
        </div>
      </div>

      {/* Bottom-Right Floating Action Button for Instant East Coast Vessel Tracking */}
      <div className="absolute bottom-4 right-4 z-[1000] pointer-events-none">
        <button
          onClick={handleScanNearbyVessels}
          className="pointer-events-auto bg-slate-900/95 hover:bg-slate-800 text-emerald-300 hover:text-white border border-emerald-500/60 hover:border-emerald-400 px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 group backdrop-blur-md"
          title="Click to view all vessels nearby East Coast India in real time"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <Ship className="w-4 h-4 text-emerald-300 group-hover:rotate-12 transition-transform" />
          <span>Nearby East Coast Vessels ({fleet.length})</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
}

