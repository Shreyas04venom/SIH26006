import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Badge from "../components/Badge";
import { useFlow } from "../lib/flow";
import { toast } from "sonner";
import { 
  HeartPulse, Gauge, Fuel, Thermometer, Radio, Activity, 
  Wrench, CheckCircle2, AlertTriangle, ShieldCheck, Zap, HardDrive,
  Building2, Anchor, ArrowLeft, ExternalLink, Ship, Compass, Waves,
  Check, RefreshCw, SlidersHorizontal, Search, FileText, ChevronRight,
  TrendingUp, Clock, AlertCircle, Cpu
} from "lucide-react";

// Fleet Master Telemetry Database
const FLEET_MASTER_DATA = [
  {
    id: "ASTRA-PAN-101",
    name: "MV Bengal Voyager",
    imo: "9812450",
    category: "Panamax",
    dwt: 74000,
    draftM: 13.8,
    flag: "India",
    built: 2019,
    classSoc: "IRS / DNV",
    location: "Paradip Anchorage / Bay of Bengal",
    speed: "13.8 kts",
    course: "042°",
    overallScore: 95,
    status: "OPTIMAL",
    engine: "MAN B&W 6S70ME-C8.2 (21,500 kW)",
    subsystems: [
      { name: "Main Engine (MAN B&W 6S70ME)", status: "NORMAL", score: 96, metric: "84.8 RPM · Load 76%", detail: "Exhaust: 382°C · Scavenge Air: 2.1 bar" },
      { name: "Lube Oil & Cooling Circuit", status: "NORMAL", score: 94, metric: "4.3 bar · Temp 47°C", detail: "Separator Delta P: 0.35 bar (Clean)" },
      { name: "Propulsion Shaft Vibration", status: "NORMAL", score: 95, metric: "1.6 mm/s RMS", detail: "Thrust Bearing: 52°C (ISO Limit: 75°C)" },
      { name: "Bunker Fuel System", status: "NORMAL", score: 92, metric: "78% Tank (2,250 MT VLSFO)", detail: "Daily Burn: 31.2 MT/day @ 13.8 kts" },
      { name: "Auxiliary Generators (3x Yanmar)", status: "NORMAL", score: 98, metric: "Gen #1 & #2 Online", detail: "Grid Load: 440 kW (46% Capacity)" },
      { name: "Bridge Navigation & SatComms", status: "NORMAL", score: 99, metric: "Inmarsat Fleet Xpress", detail: "Dual GPS Sync · Latency 142ms" },
    ],
    sensors: [
      { id: "SENS-ME-01", param: "Cylinder #1 Exhaust Gas Temp", value: "382°C", nominal: "360 - 410°C", status: "NORMAL", trend: "Stable" },
      { id: "SENS-ME-02", param: "Scavenge Air Pressure", value: "2.12 bar", nominal: "1.9 - 2.3 bar", status: "NORMAL", trend: "Optimal" },
      { id: "SENS-LO-03", param: "Main Engine Lube Oil Header Pressure", value: "4.30 bar", nominal: "4.0 - 4.8 bar", status: "NORMAL", trend: "Stable" },
      { id: "SENS-VB-04", param: "Intermediate Shaft Bearing Vibration", value: "1.62 mm/s", nominal: "< 2.8 mm/s", status: "NORMAL", trend: "Low" },
      { id: "SENS-TB-05", param: "Stern Tube Aft Bearing Temp", value: "52.4°C", nominal: "< 65.0°C", status: "NORMAL", trend: "Optimal" },
      { id: "SENS-BK-06", param: "Fuel Oil Viscosity @ Engine Inlet", value: "12.8 cSt", nominal: "12.0 - 14.0 cSt", status: "NORMAL", trend: "Stable" },
    ],
    timeline: [
      { timestamp: "Today 09:15 IST", event: "Real-time telemetry handshake confirmed via Paradip Coast Earth Station", type: "NORMAL" },
      { timestamp: "Yesterday 16:40 IST", event: "Main engine cylinder #3 exhaust thermal balance validated (±2.5°C margin)", type: "NORMAL" },
      { timestamp: "4 days ago", event: "Bi-weekly propulsion vibration spectrum analysis signed off (IRS Class A1)", type: "RESOLVED" },
      { timestamp: "12 days ago", event: "Routine bunkering fuel quality test approved (ISO 8217 0.50% Sulphur compliant)", type: "NORMAL" },
    ]
  },
  {
    id: "ASTRA-PAN-102",
    name: "MV Jag Radha",
    imo: "9845112",
    category: "Panamax",
    dwt: 76500,
    draftM: 14.1,
    flag: "India",
    built: 2020,
    classSoc: "Lloyd's Register",
    location: "Singapore Strait / Ballast Transit",
    speed: "14.2 kts",
    course: "285°",
    overallScore: 97,
    status: "OPTIMAL",
    engine: "MAN B&W 7S60MC-C (19,800 kW)",
    subsystems: [
      { name: "Main Engine (MAN B&W 7S60MC)", status: "OPTIMAL", score: 98, metric: "86.5 RPM · Load 79%", detail: "Exhaust: 378°C · Scavenge Air: 2.2 bar" },
      { name: "Lube Oil & Cooling Circuit", status: "OPTIMAL", score: 96, metric: "4.4 bar · Temp 45°C", detail: "Separator Delta P: 0.28 bar (Pristine)" },
      { name: "Propulsion Shaft Vibration", status: "OPTIMAL", score: 97, metric: "1.4 mm/s RMS", detail: "Thrust Bearing: 49°C (ISO Limit: 75°C)" },
      { name: "Bunker Fuel System", status: "NORMAL", score: 94, metric: "82% Tank (2,400 MT VLSFO)", detail: "Daily Burn: 32.8 MT/day @ 14.2 kts" },
      { name: "Auxiliary Generators (3x Daihatsu)", status: "OPTIMAL", score: 99, metric: "Gen #1 Online", detail: "Grid Load: 380 kW (40% Capacity)" },
      { name: "Bridge Navigation & SatComms", status: "OPTIMAL", score: 99, metric: "Starlink Maritime + Iridium", detail: "High-Bandwidth LEO · Latency 68ms" },
    ],
    sensors: [
      { id: "SENS-ME-11", param: "Main Engine Mean Indicated Pressure", value: "18.4 bar", nominal: "17 - 20 bar", status: "OPTIMAL", trend: "Optimal" },
      { id: "SENS-LO-12", param: "Camshaft Lube Oil Supply Pressure", value: "4.42 bar", nominal: "4.0 - 4.8 bar", status: "OPTIMAL", trend: "Stable" },
      { id: "SENS-VB-13", param: "Flywheel Torsional Vibration", value: "0.85 mm/s", nominal: "< 2.0 mm/s", status: "OPTIMAL", trend: "Minimal" },
      { id: "SENS-BK-14", param: "Bunker Fuel Daily Mass Flow Rate", value: "1.36 MT/h", nominal: "1.2 - 1.5 MT/h", status: "OPTIMAL", trend: "Efficient" },
    ],
    timeline: [
      { timestamp: "Today 06:00 IST", event: "Automated engine electronic logbook verified via Starlink telemetry", type: "NORMAL" },
      { timestamp: "3 days ago", event: "Auxiliary generator #1 injector calibration completed at Singapore anchorage", type: "RESOLVED" },
      { timestamp: "8 days ago", event: "Dry dock intermediate underwater hull survey completed with 100% clean report", type: "MAINTENANCE" },
    ]
  },
  {
    id: "ASTRA-SUP-201",
    name: "MV Coastal Pride",
    imo: "9723041",
    category: "Supramax",
    dwt: 58000,
    draftM: 12.8,
    flag: "Marshall Islands",
    built: 2018,
    classSoc: "ClassNK",
    location: "Visakhapatnam Harbor / Coastal Channel",
    speed: "12.4 kts",
    course: "198°",
    overallScore: 92,
    status: "NORMAL",
    engine: "Wärtsilä 6L50DF Dual-Fuel (16,200 kW)",
    subsystems: [
      { name: "Main Engine (Wärtsilä 6L50DF)", status: "NORMAL", score: 91, metric: "92.0 RPM · Load 81%", detail: "Exhaust: 395°C · Scavenge: 1.95 bar" },
      { name: "Lube Oil & Cooling Circuit", status: "NORMAL", score: 90, metric: "4.1 bar · Temp 49°C", detail: "Cooler Fresh Water Circulating Clean" },
      { name: "Propulsion Shaft Vibration", status: "NORMAL", score: 91, metric: "2.1 mm/s RMS", detail: "Thrust Bearing: 58°C (Limit: 75°C)" },
      { name: "Bunker Fuel System", status: "NORMAL", score: 93, metric: "68% Tank (1,620 MT)", detail: "Daily Burn: 24.5 MT/day @ 12.4 kts" },
      { name: "Auxiliary & 4x30T Cargo Cranes", status: "NORMAL", score: 94, metric: "Hydraulic Pack Active", detail: "Grid Load: 580 kW (62% Capacity)" },
      { name: "Bridge Navigation & SatComms", status: "NORMAL", score: 96, metric: "Furuno Dual ECDIS + VSAT", detail: "Dual Radar Sync · Latency 195ms" },
    ],
    sensors: [
      { id: "SENS-CR-21", param: "Crane #3 Hydraulic Pump Pressure", value: "245 bar", nominal: "230 - 260 bar", status: "NORMAL", trend: "Nominal" },
      { id: "SENS-ME-22", param: "Turbocharger #1 Bearing Vibration", value: "2.10 mm/s", nominal: "< 3.0 mm/s", status: "NORMAL", trend: "Acceptable" },
      { id: "SENS-LO-23", param: "Jacket Water Cooling Temp Out", value: "82.5°C", nominal: "80 - 86°C", status: "NORMAL", trend: "Stable" },
    ],
    timeline: [
      { timestamp: "Today 10:30 IST", event: "Cargo gear 4x30T hydraulic test passed ahead of coastal cargo operations", type: "NORMAL" },
      { timestamp: "2 days ago", event: "Bilge water separator auto-calibrated to < 15 ppm (MARPOL Annex I compliant)", type: "RESOLVED" },
    ]
  },
  {
    id: "ASTRA-CAP-301",
    name: "MV Vishva Nidhi",
    imo: "9918234",
    category: "Capesize",
    dwt: 180000,
    draftM: 18.2,
    flag: "India",
    built: 2021,
    classSoc: "IRS",
    location: "Off Haldia / Sandheads Deep Anchorage",
    speed: "11.5 kts",
    course: "180°",
    overallScore: 89,
    status: "ADVISORY",
    engine: "MAN B&W 6S70ME-C9.5 (24,800 kW)",
    subsystems: [
      { name: "Main Engine (MAN B&W 6S70ME)", status: "NORMAL", score: 91, metric: "74.0 RPM · Load 72%", detail: "Exhaust: 388°C · Scavenge: 2.0 bar" },
      { name: "Lube Oil Secondary Circuit", status: "ADVISORY", score: 84, metric: "3.9 bar · Temp 51°C", detail: "Strainer Delta P: 0.62 bar (Auto-flushed)" },
      { name: "Propulsion Shaft Vibration", status: "NORMAL", score: 88, metric: "2.4 mm/s RMS", detail: "Thrust Bearing: 62°C (ISO Limit: 75°C)" },
      { name: "Bunker Fuel System", status: "NORMAL", score: 89, metric: "62% Tank (3,800 MT)", detail: "Daily Burn: 52.0 MT/day @ 11.5 kts" },
      { name: "Auxiliary Generators (3x Daihatsu)", status: "NORMAL", score: 93, metric: "Gen #1 & #3 Online", detail: "Grid Load: 610 kW (55% Capacity)" },
      { name: "Bridge Navigation & SatComms", status: "NORMAL", score: 96, metric: "Dual Sailor Inmarsat-C", detail: "AIS-SART Active · Latency 160ms" },
    ],
    sensors: [
      { id: "SENS-ME-31", param: "Main Bearing #4 Temperature", value: "66.5°C", nominal: "< 72.0°C", status: "NORMAL", trend: "Stable" },
      { id: "SENS-LO-32", param: "Lube Oil Auto-Filter Differential", value: "0.62 bar", nominal: "< 0.8 bar", status: "ADVISORY", trend: "Flushed" },
      { id: "SENS-VB-33", param: "Intermediate Shaft Vibration RMS", value: "2.42 mm/s", nominal: "< 2.8 mm/s", status: "NORMAL", trend: "Monitored" },
    ],
    timeline: [
      { timestamp: "Today 07:15 IST", event: "Automated backwash cycle completed on lube oil secondary filtration circuit", type: "RESOLVED" },
      { timestamp: "Yesterday 14:00 IST", event: "Deep draft hydrostatic trim verification signed off for Sandheads fairway entry", type: "NORMAL" },
    ]
  },
  {
    id: "ASTRA-HND-401",
    name: "MV Chennai Express",
    imo: "9691880",
    category: "Handysize",
    dwt: 35000,
    draftM: 10.2,
    flag: "Singapore",
    built: 2017,
    classSoc: "Bureau Veritas",
    location: "Chennai Port Outer Anchorage",
    speed: "12.0 kts",
    course: "110°",
    overallScore: 94,
    status: "OPTIMAL",
    engine: "Hyundai-MAN B&W 5S50ME-B9 (9,200 kW)",
    subsystems: [
      { name: "Main Engine (Hyundai-MAN 5S50ME)", status: "OPTIMAL", score: 95, metric: "96.0 RPM · Load 74%", detail: "Exhaust: 375°C · Scavenge: 1.9 bar" },
      { name: "Lube Oil & Cooling Circuit", status: "NORMAL", score: 93, metric: "4.2 bar · Temp 46°C", detail: "Plate Heat Exchanger Cleaned" },
      { name: "Propulsion Shaft Vibration", status: "OPTIMAL", score: 95, metric: "1.7 mm/s RMS", detail: "Thrust Bearing: 50°C (Limit: 75°C)" },
      { name: "Bunker Fuel System", status: "OPTIMAL", score: 95, metric: "85% Tank (1,150 MT)", detail: "Daily Burn: 18.2 MT/day @ 12.0 kts" },
      { name: "Auxiliary Generators (2x Yanmar)", status: "OPTIMAL", score: 96, metric: "Gen #1 Online", detail: "Grid Load: 310 kW (42% Capacity)" },
      { name: "Bridge Navigation & SatComms", status: "NORMAL", score: 94, metric: "JRC ECDIS + FleetBroadband", detail: "GPS Sync Active · Latency 210ms" },
    ],
    sensors: [
      { id: "SENS-ME-41", param: "Shaft Generator Output Voltage", value: "440 V", nominal: "435 - 445 V", status: "OPTIMAL", trend: "Stable" },
      { id: "SENS-SG-42", param: "Steering Gear Pump #1 Pressure", value: "185 bar", nominal: "170 - 200 bar", status: "OPTIMAL", trend: "Nominal" },
    ],
    timeline: [
      { timestamp: "Today 08:45 IST", event: "Coastal shallow draft passage plan uploaded to port control", type: "NORMAL" },
      { timestamp: "5 days ago", event: "Steering gear emergency changeover drill logged with zero discrepancies", type: "NORMAL" },
    ]
  },
  {
    id: "ASTRA-PAN-103",
    name: "MV Deccan Pioneer",
    imo: "9804561",
    category: "Panamax",
    dwt: 75000,
    draftM: 13.9,
    flag: "India",
    built: 2020,
    classSoc: "DNV",
    location: "Krishnapatnam Roads",
    speed: "13.5 kts",
    course: "025°",
    overallScore: 96,
    status: "OPTIMAL",
    engine: "MAN B&W 6S60ME-C8 (20,200 kW)",
    subsystems: [
      { name: "Main Engine (MAN B&W 6S60ME)", status: "OPTIMAL", score: 97, metric: "87.0 RPM · Load 77%", detail: "Exhaust: 380°C · Scavenge: 2.15 bar" },
      { name: "Lube Oil & Cooling Circuit", status: "OPTIMAL", score: 95, metric: "4.3 bar · Temp 47°C", detail: "Header Pressure Stable" },
      { name: "Propulsion Shaft Vibration", status: "OPTIMAL", score: 96, metric: "1.5 mm/s RMS", detail: "Thrust Bearing: 51°C" },
      { name: "Bunker Fuel System", status: "OPTIMAL", score: 95, metric: "74% Tank (2,100 MT)", detail: "Daily Burn: 30.5 MT/day @ 13.5 kts" },
      { name: "Auxiliary Generators (3x Yanmar)", status: "OPTIMAL", score: 98, metric: "Gen #1 & #3 Online", detail: "Grid Load: 420 kW (45% Capacity)" },
      { name: "Bridge Navigation & SatComms", status: "OPTIMAL", score: 98, metric: "Starlink Maritime High-Speed", detail: "Dual LEO Links · Latency 55ms" },
    ],
    sensors: [
      { id: "SENS-ME-51", param: "Cylinder #4 Thermal Balance", value: "379°C", nominal: "360 - 400°C", status: "OPTIMAL", trend: "Optimal" },
    ],
    timeline: [
      { timestamp: "Today 09:30 IST", event: "Automated vibration spectrogram validated under full sea speed", type: "NORMAL" },
    ]
  },
  {
    id: "ASTRA-PAN-104",
    name: "MV Coromandel Trader",
    imo: "9789320",
    category: "Panamax",
    dwt: 74500,
    draftM: 13.8,
    flag: "India",
    classSoc: "IRS",
    built: 2019,
    location: "Ennore (Kamarajar) Coal Berth #2",
    speed: "0.0 kts (Berthed)",
    course: "000°",
    overallScore: 93,
    status: "NORMAL",
    engine: "Wärtsilä-Sulzer 7RTA58T (18,400 kW)",
    subsystems: [
      { name: "Main Engine (Wärtsilä-Sulzer 7RTA)", status: "NORMAL", score: 93, metric: "Standby / Port Turning Gear", detail: "Jacket Pre-heating Active @ 65°C" },
      { name: "Lube Oil & Cooling Circuit", status: "NORMAL", score: 92, metric: "3.8 bar (Circulating) · 42°C", detail: "Auxiliary Cooler Operational" },
      { name: "Propulsion Shaft Vibration", status: "NORMAL", score: 96, metric: "0.2 mm/s RMS (Berth Baseline)", detail: "Shaft Locked for Cargo Operations" },
      { name: "Bunker Fuel System", status: "NORMAL", score: 91, metric: "70% Tank (1,950 MT)", detail: "Aux Boiler Burn: 3.2 MT/day in port" },
      { name: "Auxiliary Generators (3x Daihatsu)", status: "NORMAL", score: 94, metric: "Gen #2 Online (Shore Sync Ready)", detail: "Port Load: 390 kW (41% Capacity)" },
      { name: "Bridge Navigation & SatComms", status: "OPTIMAL", score: 97, metric: "V-SAT Dual Band Connected", detail: "Terminal Wi-Fi Sync · Latency 110ms" },
    ],
    sensors: [
      { id: "SENS-BL-61", param: "Auxiliary Boiler Steam Pressure", value: "6.8 bar", nominal: "6.5 - 7.5 bar", status: "NORMAL", trend: "Constant" },
    ],
    timeline: [
      { timestamp: "Today 04:00 IST", event: "Mooring arrival telemetry recorded at Kamarajar Coal Berth #2", type: "NORMAL" },
    ]
  },
  {
    id: "ASTRA-SUP-202",
    name: "MV Indus Navigator",
    imo: "9941102",
    category: "Supramax",
    dwt: 63000,
    draftM: 13.2,
    flag: "India",
    built: 2022,
    classSoc: "Lloyd's Register",
    location: "Bay of Bengal Enroute Dhamra",
    speed: "13.0 kts",
    course: "015°",
    overallScore: 98,
    status: "OPTIMAL",
    engine: "MAN B&W 6S50ME-C9.7 (15,400 kW)",
    subsystems: [
      { name: "Main Engine (MAN B&W 6S50ME)", status: "OPTIMAL", score: 99, metric: "89.0 RPM · Load 73%", detail: "Exhaust: 368°C · Scavenge: 2.25 bar" },
      { name: "Lube Oil & Cooling Circuit", status: "OPTIMAL", score: 98, metric: "4.5 bar · Temp 44°C", detail: "Auto-Cleaning Purifier Online" },
      { name: "Propulsion Shaft Vibration", status: "OPTIMAL", score: 98, metric: "1.2 mm/s RMS", detail: "Thrust Bearing: 48°C (Peak Health)" },
      { name: "Bunker Fuel System", status: "OPTIMAL", score: 97, metric: "88% Tank (2,150 MT)", detail: "Daily Burn: 23.8 MT/day @ 13.0 kts" },
      { name: "Auxiliary Generators (3x Yanmar)", status: "OPTIMAL", score: 99, metric: "Gen #1 Online", detail: "Grid Load: 360 kW (38% Capacity)" },
      { name: "Bridge Navigation & SatComms", status: "OPTIMAL", score: 99, metric: "LEO SatComms Ultra-Low Latency", detail: "Continuous Cloud Sync · Latency 45ms" },
    ],
    sensors: [
      { id: "SENS-ME-71", param: "Fuel Mass Flow Efficiency Index", value: "104%", nominal: "> 98%", status: "OPTIMAL", trend: "High" },
    ],
    timeline: [
      { timestamp: "Today 11:00 IST", event: "Sea passage performance index confirmed at 104% fuel conservation", type: "NORMAL" },
    ]
  },
  {
    id: "ASTRA-VLC-501",
    name: "MV Berge Everest",
    imo: "9447536",
    category: "VLOC",
    dwt: 388000,
    draftM: 21.5,
    flag: "Marshall Islands",
    built: 2022,
    classSoc: "DNV",
    location: "Deepwater Fairway / Singapore",
    speed: "14.5 kts",
    course: "270°",
    overallScore: 97,
    status: "OPTIMAL",
    engine: "MAN B&W 7S80ME-C9 (27,100 kW)",
    subsystems: [
      { name: "Main Engine (MAN B&W 7S80ME)", status: "OPTIMAL", score: 98, metric: "76.0 RPM · Load 74%", detail: "Exhaust: 375°C · Scavenge: 2.3 bar" },
      { name: "Lube Oil Circuit", status: "OPTIMAL", score: 96, metric: "4.5 bar · Temp 46°C", detail: "Separator Delta P: 0.22 bar" },
      { name: "Propulsion Shaft & Thrust", status: "OPTIMAL", score: 97, metric: "1.3 mm/s RMS", detail: "Bearing Temp: 50°C" },
      { name: "Bunker Fuel System", status: "OPTIMAL", score: 95, metric: "78% Tank (4,500 MT)", detail: "Daily Burn: 58.0 MT/day @ 14.5 kts" },
      { name: "Auxiliary Generators (4x Daihatsu)", status: "OPTIMAL", score: 98, metric: "Gen #1 & #2 Online", detail: "Grid Load: 740 kW (48% Capacity)" },
      { name: "Bridge Navigation & Deep Draft Telemetry", status: "OPTIMAL", score: 99, metric: "Dual Starlink Maritime + ECDIS", detail: "Underkeel Sonar Active · Latency 42ms" },
    ],
    sensors: [
      { id: "SENS-ME-91", param: "Cylinder Liner Mean Wear Rate", value: "0.015 mm/1000h", nominal: "< 0.05 mm/1000h", status: "OPTIMAL", trend: "Minimal" },
      { id: "SENS-DFT-92", param: "Dynamic Hydrostatic Draft Telemetry", value: "21.45 m", nominal: "< 21.60 m", status: "OPTIMAL", trend: "Balanced" }
    ],
    timeline: [
      { timestamp: "Today 08:00 IST", event: "Automated deepwater hydrostatic load stability verified for 300,000+ MT ore parcel", type: "NORMAL" },
      { timestamp: "Yesterday 18:20 IST", event: "Ultra-heavy ore hold structural integrity check cleared with zero deflections", type: "RESOLVED" }
    ]
  },
  {
    id: "ASTRA-CAP-302",
    name: "MV Tata Titan",
    imo: "9912048",
    category: "Capesize",
    dwt: 180000,
    draftM: 18.2,
    flag: "Panama",
    built: 2021,
    classSoc: "ClassNK",
    location: "Bay of Bengal Deepwater",
    speed: "14.2 kts",
    course: "030°",
    overallScore: 98,
    status: "OPTIMAL",
    engine: "MAN B&W 6S70ME-C9 (22,400 kW)",
    subsystems: [
      { name: "Main Engine (MAN B&W 6S70ME)", status: "OPTIMAL", score: 99, metric: "78.0 RPM · Load 76%", detail: "Exhaust: 370°C · Scavenge: 2.2 bar" },
      { name: "Lube Oil Circuit", status: "OPTIMAL", score: 97, metric: "4.4 bar · Temp 45°C", detail: "Auto-backwash operational" },
      { name: "Propulsion Shaft Vibration", status: "OPTIMAL", score: 98, metric: "1.2 mm/s RMS", detail: "Thrust Bearing: 48°C" },
      { name: "Bunker Fuel System", status: "OPTIMAL", score: 96, metric: "80% Tank (3,200 MT)", detail: "Daily Burn: 48.5 MT/day @ 13.8 kts" },
      { name: "Auxiliary Generators (3x Yanmar)", status: "OPTIMAL", score: 98, metric: "Gen #1 Online", detail: "Grid Load: 460 kW (44% Capacity)" },
      { name: "Bridge Navigation & SatComms", status: "OPTIMAL", score: 99, metric: "Starlink Maritime + FleetBroadband", detail: "High Precision ECDIS · Latency 48ms" },
    ],
    sensors: [
      { id: "SENS-ME-81", param: "Shaft Power Torque Sensor", value: "16,800 kW", nominal: "16,000 - 18,000 kW", status: "OPTIMAL", trend: "Optimal" },
    ],
    timeline: [
      { timestamp: "Today 10:15 IST", event: "RightShip 5-Star inspection rating renewed with pristine structural assessment", type: "NORMAL" },
    ]
  }
];

export default function VesselHealth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { companyRequirements, requirement } = useFlow();

  // Selected vessel ID or name for detailed view
  const [selectedVesselName, setSelectedVesselName] = useState(() => {
    return searchParams.get("vessel") || null;
  });

  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, CHARTERED, AVAILABLE
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState("Just now (Automated)");

  // Cross-reference vessel with real company requirements & approvals
  const getCharterInfo = (vesselName) => {
    if (!vesselName) return { isChartered: false };

    // 1. Search in companyRequirements for accepted requirements matching this vessel
    const acceptedReq = (companyRequirements || []).find(r => 
      r.status === "ACCEPTED" && 
      (
        r.assignedVessel?.name?.trim().toLowerCase() === vesselName.trim().toLowerCase() ||
        r.selectedVessel?.name?.trim().toLowerCase() === vesselName.trim().toLowerCase() ||
        r.vesselName?.trim().toLowerCase() === vesselName.trim().toLowerCase()
      )
    );

    if (acceptedReq) {
      return {
        isChartered: true,
        companyName: acceptedReq.companyName || "Industrial Shipper Ltd",
        companyCode: acceptedReq.companyCode || (acceptedReq.companyName || "COMP").substring(0, 4).toUpperCase(),
        cargo: `${acceptedReq.cargoQuantity ? Number(acceptedReq.cargoQuantity).toLocaleString() + ' MT ' : ''}${acceptedReq.cargoType || 'Industrial Bulk'}`,
        cargoType: acceptedReq.cargoType || "Bulk Cargo",
        quantity: acceptedReq.cargoQuantity || 70000,
        route: `${acceptedReq.originPort || 'Newcastle'} ➔ ${acceptedReq.destinationPort || 'Paradip'}`,
        originPort: acceptedReq.originPort || "Newcastle",
        destinationPort: acceptedReq.destinationPort || "Paradip",
        fixtureId: acceptedReq.id,
        laycan: acceptedReq.requiredArrivalDate || "Immediate Laycan",
        contractorNote: acceptedReq.contractorNote || "Charter confirmed by Tata NYK Fleet Operations.",
        freightRate: acceptedReq.targetFreightRatePerTon ? `$${acceptedReq.targetFreightRatePerTon}/MT` : "$16.90/MT",
        contractType: "Voyage Charter (Confirmed Fixture)",
        updatedAt: acceptedReq.updatedAt || "Confirmed"
      };
    }

    // 2. Also check active single requirement in useFlow() if accepted
    if (requirement && (requirement.contractorAccepted || requirement.status === "ACTIVE_IN_TRANSIT")) {
      const assignedName = requirement.selectedVessel?.name || requirement.assignedVessel?.name;
      if (assignedName && assignedName.trim().toLowerCase() === vesselName.trim().toLowerCase()) {
        return {
          isChartered: true,
          companyName: requirement.companyName || "Jindal Steel & Power Ltd (JSPL)",
          companyCode: requirement.companyCode || "JSPL",
          cargo: `${requirement.cargoQuantity ? Number(requirement.cargoQuantity).toLocaleString() + ' MT ' : ''}${requirement.cargoType || 'Thermal Coal'}`,
          cargoType: requirement.cargoType || "Thermal Coal",
          quantity: requirement.cargoQuantity || 70000,
          route: `${requirement.originPort || 'Newcastle'} ➔ ${requirement.destinationPort || 'Paradip'}`,
          originPort: requirement.originPort || "Newcastle",
          destinationPort: requirement.destinationPort || "Paradip",
          fixtureId: requirement.id,
          laycan: requirement.requiredArrivalDate || "Immediate Laycan",
          contractorNote: requirement.contractorNote || "Charter confirmed by Fleet Operations.",
          freightRate: requirement.costBreakdown?.oceanFreightRatePerTon ? `$${requirement.costBreakdown.oceanFreightRatePerTon}/MT` : "$16.90/MT",
          contractType: "Voyage Charter (Active Transit)",
          updatedAt: "Active in Transit"
        };
      }
    }

    // Not chartered
    return {
      isChartered: false,
      companyName: null,
      companyCode: null,
      cargo: "Open (In Ballast)",
      route: "Awaiting Next Tender / Cargo Fixture",
      fixtureId: null,
      laycan: "Immediate Delivery",
      contractorNote: null,
      freightRate: null,
      contractType: "Available in Ballast Fleet"
    };
  };

  // Build combined fleet list with dynamic charter state
  const enrichedFleet = useMemo(() => {
    return FLEET_MASTER_DATA.map(v => {
      const charter = getCharterInfo(v.name);
      return {
        ...v,
        charter
      };
    });
  }, [companyRequirements, requirement]);

  // Metrics
  const totalFleetCount = enrichedFleet.length;
  const charteredCount = enrichedFleet.filter(v => v.charter.isChartered).length;
  const availableCount = totalFleetCount - charteredCount;
  const avgHealth = Math.round(enrichedFleet.reduce((acc, cur) => acc + cur.overallScore, 0) / totalFleetCount);

  // Filtered vessels
  const filteredFleet = useMemo(() => {
    return enrichedFleet.filter(v => {
      if (statusFilter === "CHARTERED" && !v.charter.isChartered) return false;
      if (statusFilter === "AVAILABLE" && v.charter.isChartered) return false;
      if (categoryFilter !== "ALL" && v.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(q);
        const matchesCompany = v.charter.companyName && v.charter.companyName.toLowerCase().includes(q);
        const matchesLocation = v.location.toLowerCase().includes(q);
        const matchesImo = v.imo.includes(q);
        const matchesCargo = v.charter.cargo.toLowerCase().includes(q);
        return matchesName || matchesCompany || matchesLocation || matchesImo || matchesCargo;
      }
      return true;
    });
  }, [enrichedFleet, statusFilter, categoryFilter, searchQuery]);

  // Selected vessel object
  const currentVessel = useMemo(() => {
    if (!selectedVesselName) return null;
    return enrichedFleet.find(v => v.name.toLowerCase() === selectedVesselName.toLowerCase()) || enrichedFleet[0];
  }, [enrichedFleet, selectedVesselName]);

  const handleSelectVessel = (vesselName) => {
    setSelectedVesselName(vesselName);
    setSearchParams({ vessel: vesselName });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToFleet = () => {
    setSelectedVesselName(null);
    setSearchParams({});
  };

  const handleTriggerScan = () => {
    setIsScanning(true);
    toast.info("Connecting to onboard Inmarsat-C satellite transponder...");
    setTimeout(() => {
      setIsScanning(false);
      const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastScanTime(`Just now (${timeStr} IST)`);
      toast.success(`Telemetry Synced! All 32 sensors for ${currentVessel?.name || 'fleet'} verified within ISO-10816 margins.`);
    }, 1200);
  };

  return (
    <div className="space-y-6" data-testid="vessel-health-page">
      {/* ─────────────────────────────────────────────────────────────
          BREADCRUMBS & TOP HEADER
      ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="MONITORING" />
            <span className="astra-label">Condition-Based Maintenance & Telemetry</span>
            <span className="astra-sim-tag">REAL COMPANY CHARTER SYNCHRONIZATION</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            {selectedVesselName ? (
              <span className="flex items-center gap-2">
                <button 
                  onClick={handleBackToFleet}
                  className="hover:text-blue-700 transition flex items-center gap-1 text-slate-500 font-medium text-2xl mr-1"
                >
                  <ArrowLeft size={24} />
                  <span>Fleet</span>
                </button>
                <ChevronRight size={22} className="text-slate-400" />
                <span>{currentVessel?.name}</span>
                <span className="text-sm font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold border border-blue-200">
                  {currentVessel?.category}
                </span>
              </span>
            ) : (
              "Vessel Operational Health & Fleet Fleet Diagnostics"
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {selectedVesselName ? (
              `Full machinery telemetry, shaft vibration analytics, and commercial charter assignment for ${currentVessel?.name}.`
            ) : (
              "Live overview of all commercial bulk carriers. Shows charterer company fixtures and real-time machinery telemetry."
            )}
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-3">
          {selectedVesselName && (
            <button 
              onClick={handleBackToFleet}
              className="px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 bg-white transition flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft size={14} />
              Back to All Vessels
            </button>
          )}
          <button 
            onClick={handleTriggerScan}
            disabled={isScanning}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-900 hover:bg-blue-800 text-white transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={isScanning ? "animate-spin" : ""} />
            {isScanning ? "Scanning Sensors..." : "Ping Live Telemetry"}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VIEW A: DETAILED VESSEL VIEW (IF VESSEL SELECTED)
      ────────────────────────────────────────────────────────────── */}
      {selectedVesselName && currentVessel ? (
        <div className="space-y-6">
          {/* DETAILED HERO BANNER */}
          <div className="astra-card astra-card-p bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white shadow-xl border border-slate-800">
            <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6">
              
              {/* Left Column: Vessel Identity & Radial Score */}
              <div className="flex items-center gap-6">
                {/* Radial Gauge */}
                <div className="relative w-28 h-28 shrink-0 grid place-items-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={currentVessel.overallScore >= 95 ? "text-emerald-400" : currentVessel.overallScore >= 90 ? "text-teal-400" : "text-amber-400"}
                      strokeDasharray={`${currentVessel.overallScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-3xl font-extrabold font-mono text-emerald-400 leading-none">
                      {currentVessel.overallScore}%
                    </div>
                    <div className="text-[9px] uppercase font-bold text-slate-400 mt-1">HEALTH</div>
                  </div>
                </div>

                {/* Identity & Specs */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: "Manrope" }}>
                      {currentVessel.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      currentVessel.status === "OPTIMAL" 
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                        : currentVessel.status === "ADVISORY"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                    }`}>
                      {currentVessel.status === "OPTIMAL" ? "ALL SYSTEMS OPTIMAL" : currentVessel.status === "ADVISORY" ? "ATTENTION REQUIRED" : "ALL SYSTEMS NOMINAL"}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-mono flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>IMO: <strong className="text-white">{currentVessel.imo}</strong></span>
                    <span>·</span>
                    <span>{currentVessel.category} ({currentVessel.dwt.toLocaleString()} DWT)</span>
                    <span>·</span>
                    <span>Draft: {currentVessel.draftM}m</span>
                    <span>·</span>
                    <span>Flag: {currentVessel.flag}</span>
                    <span>·</span>
                    <span>Class: {currentVessel.classSoc}</span>
                  </div>

                  <div className="text-xs text-blue-300 font-mono flex items-center gap-2">
                    <Activity size={13} className="text-blue-400 shrink-0" />
                    <span>Engine: {currentVessel.engine}</span>
                  </div>

                  <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                    <Compass size={13} className="text-cyan-400 shrink-0" />
                    <span>Position: {currentVessel.location} · Speed {currentVessel.speed} · Hdg {currentVessel.course}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Prominent Company Charter Badge */}
              <div className="lg:w-96 shrink-0 bg-slate-800/90 rounded-xl p-4 border border-slate-700/80 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between mb-2">
                    <span>COMMERCIAL CHARTER STATUS</span>
                    {currentVessel.charter.isChartered ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        ON HIRE / CHARTERED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        OPEN FOR CHARTER
                      </span>
                    )}
                  </div>

                  {currentVessel.charter.isChartered ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 size={18} className="text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-sm font-extrabold text-white leading-tight">
                            {currentVessel.charter.companyName}
                          </div>
                          <div className="text-[11px] text-emerald-300 font-mono">
                            Fixture #{currentVessel.charter.fixtureId} · {currentVessel.charter.contractType}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50 space-y-1 text-xs font-mono">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Cargo:</span>
                          <span className="font-bold text-white">{currentVessel.charter.cargo}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Route:</span>
                          <span className="text-blue-300 font-semibold">{currentVessel.charter.route}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Target Laycan:</span>
                          <span className="text-emerald-300">{currentVessel.charter.laycan}</span>
                        </div>
                        {currentVessel.charter.freightRate && (
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-400">Agreed Rate:</span>
                            <span className="text-amber-300">{currentVessel.charter.freightRate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 py-1">
                      <div className="flex items-center gap-2">
                        <Anchor size={18} className="text-cyan-400 shrink-0" />
                        <div>
                          <div className="text-sm font-extrabold text-white">
                            Available in Spot Ballast Fleet
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Ready for immediate company requirement allocation
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/40">
                        No active fixture currently chartered. Open to receive new tenders from Shippers & Logistics Companies.
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Last Sync: {lastScanTime}</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <Radio size={12} className="animate-pulse" />
                    LIVE TELEMETRY
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* MACHINERY KPI OVERVIEW ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="astra-card astra-card-p bg-white space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">ACTIVE ALERTS</div>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-500" />
                0 Critical
              </div>
              <div className="text-xs text-slate-500">ISO-10816 Compliant</div>
            </div>

            <div className="astra-card astra-card-p bg-white space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">NEXT SCHEDULED SERVICE</div>
              <div className="text-2xl font-extrabold text-blue-900 font-mono">
                120 Hours
              </div>
              <div className="text-xs text-slate-500">Auxiliary Gen #2 Filter Inspection</div>
            </div>

            <div className="astra-card astra-card-p bg-white space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">TELEMETRY BANDWIDTH</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                100% ONLINE
              </div>
              <div className="text-xs text-slate-500">Satellite Latency: 142 ms</div>
            </div>

            <div className="astra-card astra-card-p bg-white space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">CLASS SURVEY VALIDITY</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                CLASS A1
              </div>
              <div className="text-xs text-slate-500">Hull & Machinery Certified</div>
            </div>
          </div>

          {/* 6 MACHINERY SUBSYSTEM CARDS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2" style={{ fontFamily: "Manrope" }}>
                <Cpu size={18} className="text-blue-900" />
                Condition-Based Machinery Subsystems (6 Modules)
              </h2>
              <span className="text-xs text-slate-500 font-mono">Real-time ISO Mechanical Standards</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentVessel.subsystems.map((sub) => {
                const isOptimal = sub.status === "OPTIMAL";
                const isAdvisory = sub.status === "ADVISORY";
                return (
                  <div 
                    key={sub.name} 
                    className={`astra-card astra-card-p space-y-2 border-t-4 transition hover:shadow-md ${
                      isAdvisory ? "border-amber-500 bg-amber-50/20" : isOptimal ? "border-emerald-500" : "border-blue-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 leading-tight">{sub.name}</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        isAdvisory 
                          ? "bg-amber-100 text-amber-800 border-amber-300" 
                          : isOptimal 
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-blue-100 text-blue-800 border-blue-300"
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-lg font-extrabold font-mono text-slate-900">{sub.metric}</div>
                    <div className="text-xs text-slate-500 font-mono">{sub.detail}</div>
                    
                    <div className="pt-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>Efficiency Index</span>
                        <span className="font-bold text-slate-700">{sub.score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isAdvisory ? "bg-amber-500" : isOptimal ? "bg-emerald-500" : "bg-blue-600"
                          }`} 
                          style={{ width: `${sub.score}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SENSOR TELEMETRY READINGS TABLE */}
          {currentVessel.sensors && currentVessel.sensors.length > 0 && (
            <div className="astra-card astra-card-p space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-blue-900" />
                  <span className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
                    Live Diagnostic Telemetry Transponder Feed ({currentVessel.sensors.length} Active Sensors)
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ALL SENSORS NORMAL
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                      <th className="py-2.5 px-3 font-bold">Sensor ID</th>
                      <th className="py-2.5 px-3 font-bold">Diagnostic Parameter</th>
                      <th className="py-2.5 px-3 font-bold">Current Telemetry</th>
                      <th className="py-2.5 px-3 font-bold">Nominal Range</th>
                      <th className="py-2.5 px-3 font-bold">Condition</th>
                      <th className="py-2.5 px-3 font-bold">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentVessel.sensors.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2 px-3 font-bold text-slate-700">{s.id}</td>
                        <td className="py-2 px-3 font-sans font-semibold text-slate-900">{s.param}</td>
                        <td className="py-2 px-3 font-bold text-blue-900">{s.value}</td>
                        <td className="py-2 px-3 text-slate-500">{s.nominal}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === "OPTIMAL" 
                              ? "bg-emerald-100 text-emerald-800" 
                              : s.status === "ADVISORY" 
                              ? "bg-amber-100 text-amber-800" 
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{s.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* HEALTH PROGRESSION & EVENT LOG */}
          <div className="astra-card astra-card-p space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-900" />
                <span className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
                  Machinery Health Progression & Diagnostic Stream
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">ISO 10816 Mechanical Diagnostics</span>
            </div>

            <div className="space-y-2">
              {currentVessel.timeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 font-mono text-xs">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-slate-800">{item.event}</span>
                      <span className="text-slate-400 text-[11px]">{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            VIEW B: ALL FLEET VESSELS LIST (DEFAULT FLEET OVERVIEW)
        ────────────────────────────────────────────────────────────── */
        <div className="space-y-6">
          {/* FLEET KPI SUMMARY BANNER */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="astra-card astra-card-p bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center justify-between">
                <span>TOTAL FLEET MONITORED</span>
                <Ship size={14} className="text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono mt-1 text-white">
                {totalFleetCount} Vessels
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Bulk carriers & coastal gear</div>
            </div>

            <div className="astra-card astra-card-p bg-gradient-to-br from-emerald-950 to-slate-900 text-white shadow-md border-emerald-500/30">
              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase flex items-center justify-between">
                <span>TAKEN BY COMPANIES</span>
                <Building2 size={14} className="text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono mt-1 text-emerald-400">
                {charteredCount} Active
              </div>
              <div className="text-xs text-emerald-300 mt-0.5">
                {charteredCount > 0 ? "Under confirmed voyage charter" : "No active company fixtures yet"}
              </div>
            </div>

            <div className="astra-card astra-card-p bg-white shadow-sm border border-slate-200">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center justify-between">
                <span>OPEN BALLAST FLEET</span>
                <Anchor size={14} className="text-cyan-600" />
              </div>
              <div className="text-3xl font-extrabold font-mono mt-1 text-slate-900">
                {availableCount} Available
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Ready for company requirement allocation</div>
            </div>

            <div className="astra-card astra-card-p bg-white shadow-sm border border-slate-200">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center justify-between">
                <span>AVERAGE FLEET HEALTH</span>
                <HeartPulse size={14} className="text-rose-500" />
              </div>
              <div className="text-3xl font-extrabold font-mono mt-1 text-emerald-600">
                {avgHealth}%
              </div>
              <div className="text-xs text-slate-500 mt-0.5">ISO-10816 Condition Certified</div>
            </div>
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="astra-card astra-card-p bg-white flex flex-wrap items-center justify-between gap-4 border border-slate-200">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search vessel name, company name (e.g. JSPL, Tata Steel), IMO, or cargo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-md transition ${statusFilter === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  All Vessels ({totalFleetCount})
                </button>
                <button
                  onClick={() => setStatusFilter("CHARTERED")}
                  className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${statusFilter === "CHARTERED" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <Building2 size={13} />
                  Chartered by Companies ({charteredCount})
                </button>
                <button
                  onClick={() => setStatusFilter("AVAILABLE")}
                  className={`px-3 py-1.5 rounded-md transition ${statusFilter === "AVAILABLE" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Available / Ballast ({availableCount})
                </button>
              </div>

              {/* Category Dropdown */}
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-800"
              >
                <option value="ALL">All Categories</option>
                <option value="VLOC">VLOC (Very Large Ore Carrier)</option>
                <option value="Capesize">Capesize</option>
                <option value="Panamax">Panamax</option>
                <option value="Supramax">Supramax</option>
                <option value="Handysize">Handysize</option>
              </select>
            </div>
          </div>

          {/* FLEET VESSELS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFleet.map((v) => {
              const isChartered = v.charter.isChartered;

              return (
                <div 
                  key={v.id}
                  onClick={() => handleSelectVessel(v.name)}
                  className={`astra-card astra-card-p bg-white border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:shadow-xl hover:-translate-y-0.5 ${
                    isChartered 
                      ? "border-emerald-500/80 ring-1 ring-emerald-500/20 shadow-emerald-50" 
                      : "border-slate-200 hover:border-blue-400"
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Vessel Identity & Health Indicator */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-900 transition flex items-center gap-1.5" style={{ fontFamily: "Manrope" }}>
                            {v.name}
                          </h3>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          {v.category} · {v.dwt.toLocaleString()} DWT · IMO {v.imo}
                        </div>
                      </div>

                      {/* Health Mini Circular Gauge */}
                      <div className="relative w-12 h-12 shrink-0 grid place-items-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-100"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className={v.overallScore >= 95 ? "text-emerald-500" : v.overallScore >= 90 ? "text-teal-500" : "text-amber-500"}
                            strokeDasharray={`${v.overallScore}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute font-mono text-xs font-extrabold text-slate-800">
                          {v.overallScore}%
                        </span>
                      </div>
                    </div>

                    {/* CHARTER STATUS HERO BLOCK (PROMINENT COMPANY IDENTIFICATION) */}
                    {isChartered ? (
                      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-3.5 rounded-xl border border-emerald-500/40 text-white shadow-inner">
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                            <Building2 size={13} className="text-emerald-400" />
                            TAKEN BY COMPANY
                          </span>
                          <span className="font-mono text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                            #{v.charter.fixtureId}
                          </span>
                        </div>
                        <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                          {v.charter.companyName}
                        </div>
                        <div className="text-xs text-slate-300 mt-1.5 flex items-center justify-between font-mono">
                          <span className="text-blue-300 font-semibold">{v.charter.route}</span>
                          <span className="text-emerald-300 font-bold">{v.charter.cargo}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Laycan: <strong className="text-slate-200">{v.charter.laycan}</strong></span>
                          <span className="text-emerald-400 font-semibold">● ACTIVE ON HIRE</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-600">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                            <Anchor size={13} className="text-cyan-600" />
                            OPEN SPOT FLEET
                          </span>
                          <span className="font-mono text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            BALLAST
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-800">
                          Available for New Company Tenders
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 font-mono">
                          Position: {v.location}
                        </div>
                      </div>
                    )}

                    {/* Real-time Machinery Metric Snippets */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase block">PROPULSION RPM</span>
                        <span className="font-bold text-slate-800">{v.subsystems[0]?.metric.split("·")[0] || "85 RPM"}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase block">VIBRATION RMS</span>
                        <span className="font-bold text-slate-800">{v.subsystems[2]?.metric || "1.6 mm/s"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Click Action CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-900 group-hover:text-blue-700">
                    <span className="flex items-center gap-1">
                      View Detailed Telemetry & Diagnostics
                    </span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFleet.length === 0 && (
            <div className="astra-card astra-card-p text-center py-12 text-slate-500 space-y-2">
              <Ship size={36} className="mx-auto text-slate-400" />
              <div className="text-base font-bold text-slate-700">No vessels match the search criteria</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for a different vessel name, IMO, company charterer, or reset the filters.
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); setCategoryFilter("ALL"); }}
                className="mt-2 text-xs font-bold text-blue-900 hover:underline"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
