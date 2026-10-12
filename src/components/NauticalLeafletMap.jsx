import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import {
    Navigation, Wind, Layers, Compass, MapPin,
    Activity, ShieldAlert, Anchor, Ship, RefreshCw,
    Info, AlertTriangle, Eye, EyeOff, Radio,
    Search, X, Crosshair, ChevronRight, ChevronDown, ExternalLink, Gauge,
    Warehouse, Building2, Truck, ArrowRight, CheckCircle2, RotateCcw
} from "lucide-react";
import axios from "@/lib/api";
import { useFlow } from "@/lib/flow";

// 12 East Coast India Ports Geodata
export const EAST_COAST_PORTS = [
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

// High-Reliability Maritime & Tactical Tile Providers
const BASEMAP_TILES = {
    dark: {
        id: "dark",
        name: "Tactical Dark",
        url: "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        options: { maxZoom: 16, attribution: "Esri, HERE, Garmin, &copy; OpenStreetMap" }
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

// Realistic maritime waypoints coordinates map
export const PORT_COORDINATES_MAP = {
    Paradip: [20.2644, 86.6685],
    "Paradip Port": [20.2644, 86.6685],
    Visakhapatnam: [17.6868, 83.2185],
    "Visakhapatnam Port": [17.6868, 83.2185],
    Vizag: [17.6868, 83.2185],
    Dhamra: [20.8145, 86.9634],
    "Dhamra Port": [20.8145, 86.9634],
    Haldia: [22.0232, 88.0645],
    "Haldia Dock Complex": [22.0232, 88.0645],
    Kolkata: [22.5726, 88.3639],
    "Kolkata (SMP)": [22.5726, 88.3639],
    "Kolkata (SMP Port)": [22.5726, 88.3639],
    Chennai: [13.0827, 80.2707],
    "Chennai Port": [13.0827, 80.2707],
    Gangavaram: [17.6200, 83.2300],
    "Gangavaram Port": [17.6200, 83.2300],
    Gopalpur: [19.3093, 84.9667],
    "Gopalpur Port": [19.3093, 84.9667],
    Kakinada: [16.9891, 82.2475],
    "Kakinada Deepwater": [16.9891, 82.2475],
    Krishnapatnam: [14.2500, 80.1200],
    "Krishnapatnam Port": [14.2500, 80.1200],
    Kamarajar: [13.2500, 80.3300],
    "Kamarajar (Ennore)": [13.2500, 80.3300],
    Ennore: [13.2500, 80.3300],
    "Ennore (Kamarajar)": [13.2500, 80.3300],
    "V.O. Chidambaranar": [8.7642, 78.1348],
    Tuticorin: [8.7642, 78.1348],
    "Tuticorin (V.O.C)": [8.7642, 78.1348],
    "VOC Port (Tuticorin)": [8.7642, 78.1348],
    Singapore: [1.2655, 103.8198],
    Newcastle: [-32.9283, 151.7817],
    "Hay Point": [-21.2858, 149.3000],
    Gladstone: [-23.8427, 151.2555],
    "Port Hedland": [-20.3167, 118.5760],
    "Richards Bay": [-28.8000, 32.0833],
    Durban: [-29.8587, 31.0218],
    Balikpapan: [-1.2654, 116.8312],
    Samarinda: [-0.5022, 117.1536],
    Taboneo: [-3.6167, 114.4833],
    Maputo: [-25.9692, 32.5732],
    "Ust-Luga": [59.6833, 28.3167],
    Vostochny: [42.7333, 133.0833]
};

// Master Geodata for Origin & Destination Port Warehouses, Silos, and Buffer Stockyards
export const PORT_WAREHOUSES_MAP = {
    // Destination Port Warehouses (East Coast India)
    Paradip: {
        name: "Paradip Port Mechanized Bulk Warehouse & Silos MCH-02",
        shortName: "Paradip Bulk Silos",
        code: "WH-PPT-01",
        type: "Intermodal Silo & Rail Loop Yard",
        lat: 20.2780,
        lon: 86.6450,
        capacityMt: 420000,
        utilizationPct: 72,
        connectedFleet: 52,
        loadingRateTph: 3200,
        railLoopConnected: true
    },
    Dhamra: {
        name: "Dhamra Port Coastal Logistics Terminal & Buffer Stockyard",
        shortName: "Dhamra Port Silo Complex",
        code: "WH-DHM-01",
        type: "Capesize Bulk Silo & Stockyard Complex",
        lat: 20.8280,
        lon: 86.9450,
        capacityMt: 450000,
        utilizationPct: 64,
        connectedFleet: 48,
        loadingRateTph: 3500,
        railLoopConnected: true
    },
    Visakhapatnam: {
        name: "Vizag Harbor Buffer Stockyard & Conveyor Silos",
        shortName: "Vizag Harbor Silos",
        code: "WH-VTZ-01",
        type: "Automated Coastal Silo Hub",
        lat: 17.6980,
        lon: 83.2000,
        capacityMt: 350000,
        utilizationPct: 58,
        connectedFleet: 44,
        loadingRateTph: 2800,
        railLoopConnected: true
    },
    Krishnapatnam: {
        name: "KPCL Automated Bulk Terminal & Silo Complex",
        shortName: "KPCL Deepwater Silos",
        code: "WH-KRI-01",
        type: "Deepwater Capesize Stockyard & Buffer ICD",
        lat: 14.2650,
        lon: 80.1000,
        capacityMt: 400000,
        utilizationPct: 45,
        connectedFleet: 60,
        loadingRateTph: 4000,
        railLoopConnected: true
    },
    Haldia: {
        name: "Haldia Dock Intermodal Freight Terminal & Stockyard",
        shortName: "Haldia Freight Terminal",
        code: "WH-HAL-01",
        type: "Mechanized Jetty Stockyard",
        lat: 22.0380,
        lon: 88.0450,
        capacityMt: 280000,
        utilizationPct: 84,
        connectedFleet: 36,
        loadingRateTph: 2400,
        railLoopConnected: true
    },
    Kolkata: {
        name: "SMP Netaji Subhas Dock Warehouse Hub",
        shortName: "Netaji Subhas Dock WH",
        code: "WH-CCU-01",
        type: "Riverine Bulk Transit Warehouse",
        lat: 22.5640,
        lon: 88.3400,
        capacityMt: 190000,
        utilizationPct: 76,
        connectedFleet: 28,
        loadingRateTph: 1800,
        railLoopConnected: true
    },
    Chennai: {
        name: "Chennai Port Jawahar Dock Transit Warehouse",
        shortName: "Jawahar Dock WH",
        code: "WH-MAA-01",
        type: "Coastal Container & Bulk Staging Yard",
        lat: 13.0920,
        lon: 80.2550,
        capacityMt: 220000,
        utilizationPct: 82,
        connectedFleet: 38,
        loadingRateTph: 2200,
        railLoopConnected: true
    },
    Gangavaram: {
        name: "Gangavaram Super Silos & Heavy Stockyard",
        shortName: "Gangavaram Super Silos",
        code: "WH-GGW-01",
        type: "Deep-Draft Conveyor Silo System",
        lat: 17.6320,
        lon: 83.2100,
        capacityMt: 360000,
        utilizationPct: 50,
        connectedFleet: 40,
        loadingRateTph: 3600,
        railLoopConnected: true
    },
    Gopalpur: {
        name: "Gopalpur Coastal Mineral Buffer Stockyard",
        shortName: "Gopalpur Buffer Stockyard",
        code: "WH-GOP-01",
        type: "Minerals Buffer Staging Warehouse",
        lat: 19.3240,
        lon: 84.9450,
        capacityMt: 180000,
        utilizationPct: 52,
        connectedFleet: 24,
        loadingRateTph: 1600,
        railLoopConnected: true
    },
    Kakinada: {
        name: "Kakinada Deepwater Multimodal Stockyard",
        shortName: "Kakinada Multimodal WH",
        code: "WH-KAK-01",
        type: "Deepwater Port Buffer Warehouse",
        lat: 17.0040,
        lon: 82.2250,
        capacityMt: 210000,
        utilizationPct: 62,
        connectedFleet: 30,
        loadingRateTph: 2000,
        railLoopConnected: true
    },
    Kamarajar: {
        name: "Ennore Coal Yard & Conveyor Silos WH-06",
        shortName: "Ennore Conveyor Silos",
        code: "WH-ENR-01",
        type: "High-Capacity Power Coal Stockyard",
        lat: 13.2680,
        lon: 80.3100,
        capacityMt: 300000,
        utilizationPct: 70,
        connectedFleet: 35,
        loadingRateTph: 2500,
        railLoopConnected: true
    },
    "Ennore (Kamarajar)": {
        name: "Ennore Coal Yard & Conveyor Silos WH-06",
        shortName: "Ennore Conveyor Silos",
        code: "WH-ENR-01",
        type: "High-Capacity Power Coal Stockyard",
        lat: 13.2680,
        lon: 80.3100,
        capacityMt: 300000,
        utilizationPct: 70,
        connectedFleet: 35,
        loadingRateTph: 2500,
        railLoopConnected: true
    },
    Ennore: {
        name: "Ennore Coal Yard & Conveyor Silos WH-06",
        shortName: "Ennore Conveyor Silos",
        code: "WH-ENR-01",
        type: "High-Capacity Power Coal Stockyard",
        lat: 13.2680,
        lon: 80.3100,
        capacityMt: 300000,
        utilizationPct: 70,
        connectedFleet: 35,
        loadingRateTph: 2500,
        railLoopConnected: true
    },
    "V.O. Chidambaranar": {
        name: "VOC Tuticorin Coal Terminal Stockyard WH-12",
        shortName: "VOC Tuticorin Stockyard",
        code: "WH-TUT-01",
        type: "Southern Thermal Coal Buffer Yard",
        lat: 8.7780,
        lon: 78.1150,
        capacityMt: 240000,
        utilizationPct: 65,
        connectedFleet: 32,
        loadingRateTph: 2100,
        railLoopConnected: true
    },
    "Tuticorin (V.O.C)": {
        name: "VOC Tuticorin Coal Terminal Stockyard WH-12",
        shortName: "VOC Tuticorin Stockyard",
        code: "WH-TUT-01",
        type: "Southern Thermal Coal Buffer Yard",
        lat: 8.7780,
        lon: 78.1150,
        capacityMt: 240000,
        utilizationPct: 65,
        connectedFleet: 32,
        loadingRateTph: 2100,
        railLoopConnected: true
    },
    Tuticorin: {
        name: "VOC Tuticorin Coal Terminal Stockyard WH-12",
        shortName: "VOC Tuticorin Stockyard",
        code: "WH-TUT-01",
        type: "Southern Thermal Coal Buffer Yard",
        lat: 8.7780,
        lon: 78.1150,
        capacityMt: 240000,
        utilizationPct: 65,
        connectedFleet: 32,
        loadingRateTph: 2100,
        railLoopConnected: true
    },

    // Origin Port Warehouses (Global Loading Terminals)
    Newcastle: {
        name: "Kooragang Coal Terminal Stockyard & Rail Loop",
        shortName: "Hunter Valley Export WH",
        code: "WH-AU-NTL",
        type: "Hunter Valley Export Coal Terminal",
        lat: -32.9150,
        lon: 151.7650,
        capacityMt: 580000,
        utilizationPct: 81,
        connectedFleet: 72,
        loadingRateTph: 6000,
        railLoopConnected: true
    },
    "Port Hedland": {
        name: "Port Hedland Nelson Point Bulk Stockyard & Rail Siding",
        shortName: "Port Hedland Stockyard Hub",
        code: "WH-AU-PHE",
        type: "Capesize Mega Stockyard & Rotary Dumper Yard",
        lat: -20.3320,
        lon: 118.5550,
        capacityMt: 650000,
        utilizationPct: 78,
        connectedFleet: 85,
        loadingRateTph: 7500,
        railLoopConnected: true
    },
    "Hay Point": {
        name: "DBCT Hay Point Stockyard & Inload Terminal",
        shortName: "Hay Point Terminal Stockyard",
        code: "WH-AU-HPT",
        type: "Bowen Basin Coking Coal Export Hub",
        lat: -21.2980,
        lon: 149.2750,
        capacityMt: 520000,
        utilizationPct: 74,
        connectedFleet: 65,
        loadingRateTph: 5500,
        railLoopConnected: true
    },
    Gladstone: {
        name: "Wiggins Island Coal Terminal Buffer Stockyard",
        shortName: "Wiggins Island Silo Yard",
        code: "WH-AU-GLT",
        type: "Deepwater Capesize Silo Yard",
        lat: -23.8320,
        lon: 151.2250,
        capacityMt: 460000,
        utilizationPct: 69,
        connectedFleet: 55,
        loadingRateTph: 4800,
        railLoopConnected: true
    },
    Singapore: {
        name: "Jurong Island Bulk Logistics Terminal & Silos",
        shortName: "Jurong Island Silos",
        code: "WH-SG-JUR",
        type: "SE Asia Transshipment Silo Complex",
        lat: 1.2780,
        lon: 103.7850,
        capacityMt: 380000,
        utilizationPct: 71,
        connectedFleet: 45,
        loadingRateTph: 3800,
        railLoopConnected: true
    },
    "Richards Bay": {
        name: "RBCT Richards Bay Coal Terminal Storage Yard",
        shortName: "RBCT Storage Yard",
        code: "WH-ZA-RCB",
        type: "Heavy Mineral & Steam Coal Terminal",
        lat: -28.7920,
        lon: 32.0550,
        capacityMt: 600000,
        utilizationPct: 79,
        connectedFleet: 80,
        loadingRateTph: 6500,
        railLoopConnected: true
    },
    Taboneo: {
        name: "Kalimantan River Coal Logistics Stockyard",
        shortName: "Kalimantan Coal Stockyard",
        code: "WH-ID-TBN",
        type: "River Barge & Floating Crane Stockyard",
        lat: -3.6320,
        lon: 114.4550,
        capacityMt: 320000,
        utilizationPct: 62,
        connectedFleet: 40,
        loadingRateTph: 2800,
        railLoopConnected: false
    },
    Balikpapan: {
        name: "Kariangau Bulk Terminal Stockyard & Jetty",
        shortName: "Kariangau Bulk Terminal",
        code: "WH-ID-BPN",
        type: "Coastal Coal Storage Silos",
        lat: -1.2520,
        lon: 116.8100,
        capacityMt: 300000,
        utilizationPct: 67,
        connectedFleet: 35,
        loadingRateTph: 2600,
        railLoopConnected: false
    },

    // Suggested / Chosen Inland Warehouses from New Requirement
    "WH-31": {
        name: "Kalinganagar Industrial Hub Siding",
        shortName: "Kalinganagar Siding (WH-31)",
        code: "WH-31",
        port: "Dhamra",
        type: "Inland Steel Complex & Rail Siding",
        lat: 20.9500,
        lon: 86.0000,
        capacityMt: 180000,
        utilizationPct: 55,
        connectedFleet: 130,
        loadingRateTph: 3800,
        railLoopConnected: true
    },
    "Kalinganagar Industrial Hub Siding": {
        name: "Kalinganagar Industrial Hub Siding",
        shortName: "Kalinganagar Siding (WH-31)",
        code: "WH-31",
        port: "Dhamra",
        type: "Inland Steel Complex & Rail Siding",
        lat: 20.9500,
        lon: 86.0000,
        capacityMt: 180000,
        utilizationPct: 55,
        connectedFleet: 130,
        loadingRateTph: 3800,
        railLoopConnected: true
    },
    "Kalinganagar Industrial Hub": {
        name: "Kalinganagar Industrial Hub Siding",
        shortName: "Kalinganagar Siding (WH-31)",
        code: "WH-31",
        port: "Dhamra",
        type: "Inland Steel Complex & Rail Siding",
        lat: 20.9500,
        lon: 86.0000,
        capacityMt: 180000,
        utilizationPct: 55,
        connectedFleet: 130,
        loadingRateTph: 3800,
        railLoopConnected: true
    },
    "WH-07": {
        name: "Angul Integrated Steel Complex",
        shortName: "Angul Steel Complex (WH-07)",
        code: "WH-07",
        port: "Paradip",
        type: "Inland Mega Steel Plant Stockyard",
        lat: 20.8400,
        lon: 85.1500,
        capacityMt: 150000,
        utilizationPct: 68,
        connectedFleet: 120,
        loadingRateTph: 3500,
        railLoopConnected: true
    },
    "Angul Integrated Steel Complex": {
        name: "Angul Integrated Steel Complex",
        shortName: "Angul Steel Complex (WH-07)",
        code: "WH-07",
        port: "Paradip",
        type: "Inland Mega Steel Plant Stockyard",
        lat: 20.8400,
        lon: 85.1500,
        capacityMt: 150000,
        utilizationPct: 68,
        connectedFleet: 120,
        loadingRateTph: 3500,
        railLoopConnected: true
    },
    "WH-34": {
        name: "Tata Steel Jamshedpur Stockyard",
        shortName: "Jamshedpur Stockyard (WH-34)",
        code: "WH-34",
        port: "Dhamra",
        type: "Inland Primary Steel Stockyard",
        lat: 22.8000,
        lon: 86.2000,
        capacityMt: 250000,
        utilizationPct: 72,
        connectedFleet: 160,
        loadingRateTph: 4500,
        railLoopConnected: true
    },
    "Tata Steel Jamshedpur Stockyard": {
        name: "Tata Steel Jamshedpur Stockyard",
        shortName: "Jamshedpur Stockyard (WH-34)",
        code: "WH-34",
        port: "Dhamra",
        type: "Inland Primary Steel Stockyard",
        lat: 22.8000,
        lon: 86.2000,
        capacityMt: 250000,
        utilizationPct: 72,
        connectedFleet: 160,
        loadingRateTph: 4500,
        railLoopConnected: true
    },
    "WH-21": {
        name: "Vizag Steel & Energy Plant (RINL)",
        shortName: "RINL Steel Plant (WH-21)",
        code: "WH-21",
        port: "Visakhapatnam",
        type: "Dedicated Conveyor & Tipper Silos",
        lat: 17.6300,
        lon: 83.1800,
        capacityMt: 220000,
        utilizationPct: 62,
        connectedFleet: 150,
        loadingRateTph: 4200,
        railLoopConnected: true
    },
    "Vizag Steel & Energy Plant (RINL)": {
        name: "Vizag Steel & Energy Plant (RINL)",
        shortName: "RINL Steel Plant (WH-21)",
        code: "WH-21",
        port: "Visakhapatnam",
        type: "Dedicated Conveyor & Tipper Silos",
        lat: 17.6300,
        lon: 83.1800,
        capacityMt: 220000,
        utilizationPct: 62,
        connectedFleet: 150,
        loadingRateTph: 4200,
        railLoopConnected: true
    },
    "WH-51": {
        name: "Ballari Metal & Thermal Siding",
        shortName: "Ballari Metal Siding (WH-51)",
        code: "WH-51",
        port: "Krishnapatnam",
        type: "Inland Heavy Industry Siding",
        lat: 15.1500,
        lon: 76.9200,
        capacityMt: 210000,
        utilizationPct: 52,
        connectedFleet: 140,
        loadingRateTph: 4000,
        railLoopConnected: true
    },
    "Ballari Metal & Thermal Siding": {
        name: "Ballari Metal & Thermal Siding",
        shortName: "Ballari Metal Siding (WH-51)",
        code: "WH-51",
        port: "Krishnapatnam",
        type: "Inland Heavy Industry Siding",
        lat: 15.1500,
        lon: 76.9200,
        capacityMt: 210000,
        utilizationPct: 52,
        connectedFleet: 140,
        loadingRateTph: 4000,
        railLoopConnected: true
    },
    "WH-41": {
        name: "Durgapur Steel Hub Depot",
        shortName: "Durgapur Hub Depot (WH-41)",
        code: "WH-41",
        port: "Haldia",
        type: "Inland Steel & Foundry Depot",
        lat: 23.5200,
        lon: 87.3100,
        capacityMt: 140000,
        utilizationPct: 84,
        connectedFleet: 70,
        loadingRateTph: 2400,
        railLoopConnected: true
    },
    "Durgapur Steel Hub Depot": {
        name: "Durgapur Steel Hub Depot",
        shortName: "Durgapur Hub Depot (WH-41)",
        code: "WH-41",
        port: "Haldia",
        type: "Inland Steel & Foundry Depot",
        lat: 23.5200,
        lon: 87.3100,
        capacityMt: 140000,
        utilizationPct: 84,
        connectedFleet: 70,
        loadingRateTph: 2400,
        railLoopConnected: true
    },

    // Origin Inland Mine Sidings
    "Hunter Valley Coal Mine Siding, NSW": {
        name: "Hunter Valley Coal Mine Siding, NSW",
        shortName: "Hunter Valley Mine Siding",
        code: "WH-AU-HVY",
        type: "Inland Open-Cut Mine Rail Loop",
        lat: -32.6500,
        lon: 151.1500,
        capacityMt: 650000,
        utilizationPct: 78,
        connectedFleet: 80,
        loadingRateTph: 6500,
        railLoopConnected: true
    },
    "Jurong Island Transshipment Yard": {
        name: "Jurong Island Bulk Logistics Terminal & Silos",
        shortName: "Jurong Island Silos",
        code: "WH-SG-JUR",
        type: "SE Asia Transshipment Silo Complex",
        lat: 1.2820,
        lon: 103.7350,
        capacityMt: 380000,
        utilizationPct: 71,
        connectedFleet: 45,
        loadingRateTph: 3800,
        railLoopConnected: true
    },
    "South Kalimantan Open-Cast Siding": {
        name: "South Kalimantan Open-Cast Siding",
        shortName: "Kalimantan Pit Siding",
        code: "WH-ID-KLT",
        type: "Inland Open-Cast River Terminal",
        lat: -3.4500,
        lon: 114.8500,
        capacityMt: 340000,
        utilizationPct: 65,
        connectedFleet: 50,
        loadingRateTph: 3000,
        railLoopConnected: false
    },
    "Mpumalanga Coal Terminal Siding": {
        name: "Mpumalanga Coal Terminal Siding",
        shortName: "Mpumalanga Rail Siding",
        code: "WH-ZA-MPM",
        type: "Transnet Heavy Haul Rail Siding",
        lat: -26.0500,
        lon: 29.8000,
        capacityMt: 700000,
        utilizationPct: 82,
        connectedFleet: 90,
        loadingRateTph: 7000,
        railLoopConnected: true
    },
    "Pilbara Iron Siding, WA": {
        name: "Pilbara Heavy Haul Iron Siding",
        shortName: "Pilbara Iron Siding",
        code: "WH-AU-PLB",
        type: "Heavy Haul Automated Mine Loop",
        lat: -22.3500,
        lon: 119.5000,
        capacityMt: 850000,
        utilizationPct: 79,
        connectedFleet: 95,
        loadingRateTph: 8500,
        railLoopConnected: true
    }
};

export function getPortCoord(name, defaultPt) {
    if (!name) return defaultPt;
    if (PORT_COORDINATES_MAP[name]) return PORT_COORDINATES_MAP[name];
    const lower = String(name).toLowerCase();
    for (const [k, v] of Object.entries(PORT_COORDINATES_MAP)) {
        if (lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)) {
            return v;
        }
    }
    return defaultPt;
}

export function getWarehouse(portName, customWh) {
    if (customWh) {
        if (typeof customWh === "object" && customWh.lat && (customWh.lon || customWh.lng)) {
            return {
                ...customWh,
                lon: customWh.lon || customWh.lng
            };
        }
        const codeToMatch = (typeof customWh === "object" ? customWh.code || "" : (typeof customWh === "string" && customWh.startsWith("WH-") ? customWh : "")).toLowerCase();
        if (codeToMatch) {
            for (const [k, v] of Object.entries(PORT_WAREHOUSES_MAP)) {
                if (v.code && v.code.toLowerCase() === codeToMatch) {
                    return v;
                }
            }
        }
        const nameToMatch = (typeof customWh === "string" ? customWh : customWh.name || customWh.shortName || "").toLowerCase();
        if (nameToMatch) {
            for (const [k, v] of Object.entries(PORT_WAREHOUSES_MAP)) {
                if (v.name.toLowerCase().includes(nameToMatch) || nameToMatch.includes(v.name.toLowerCase()) ||
                    (v.shortName && (v.shortName.toLowerCase().includes(nameToMatch) || nameToMatch.includes(v.shortName.toLowerCase())))) {
                    return v;
                }
            }
        }
    }
    if (!portName) return null;
    if (PORT_WAREHOUSES_MAP[portName]) return PORT_WAREHOUSES_MAP[portName];
    const lower = String(portName).toLowerCase();
    for (const [k, v] of Object.entries(PORT_WAREHOUSES_MAP)) {
        if (lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)) {
            return v;
        }
    }
    return null;
}

// Safe coastal fairway approach into East Coast India ports
export function getPortFairwayApproach(destName) {
    const lower = String(destName || "").toLowerCase();
    if (lower.includes("paradip")) {
        return [[19.80, 87.00], [20.15, 86.82]];
    }
    if (lower.includes("dhamra")) {
        return [[20.40, 87.35], [20.72, 87.18]];
    }
    if (lower.includes("haldia")) {
        return [[21.20, 88.15], [21.65, 88.05]];
    }
    if (lower.includes("kolkata")) {
        return [[21.20, 88.15], [21.80, 88.10], [22.30, 88.20]];
    }
    if (lower.includes("visakhapatnam")) {
        return [[17.40, 83.45]];
    }
    if (lower.includes("gangavaram")) {
        return [[17.40, 83.40]];
    }
    if (lower.includes("gopalpur")) {
        return [[19.10, 85.15]];
    }
    if (lower.includes("kakinada")) {
        return [[16.85, 82.42]];
    }
    if (lower.includes("krishnapatnam")) {
        return [[14.20, 80.35]];
    }
    if (lower.includes("chennai")) {
        return [[13.05, 80.45]];
    }
    if (lower.includes("kamarajar") || lower.includes("ennore")) {
        return [[13.20, 80.48]];
    }
    if (lower.includes("chidambaranar") || lower.includes("tuticorin")) {
        return [[8.60, 78.35]];
    }
    return [];
}

// Chaikin's Corner-Cutting Smoothing Algorithm to create elegant, realistic curved nautical turns
export function smoothChaikinCurve(points, iterations = 2) {
    if (!points || points.length < 3) return points;
    let current = points;
    for (let it = 0; it < iterations; it++) {
        const next = [current[0]];
        for (let i = 0; i < current.length - 1; i++) {
            const p0 = current[i];
            const p1 = current[i + 1];
            // 75% p0 + 25% p1
            const q = [
                Number((0.75 * p0[0] + 0.25 * p1[0]).toFixed(4)),
                Number((0.75 * p0[1] + 0.25 * p1[1]).toFixed(4))
            ];
            // 25% p0 + 75% p1
            const r = [
                Number((0.25 * p0[0] + 0.75 * p1[0]).toFixed(4)),
                Number((0.25 * p0[1] + 0.75 * p1[1]).toFixed(4))
            ];
            next.push(q);
            next.push(r);
        }
        next.push(current[current.length - 1]);
        current = next;
    }
    return current;
}

// 100% Pure Deepwater Maritime Route Planner (No Land Incursions, Smooth Natural Curves)
export function generateNauticalWaypoints(origin, destination) {
    const originPt = getPortCoord(origin, [-32.9283, 151.7817]); // Default: Newcastle
    const destPt = getPortCoord(destination, [20.2644, 86.6685]); // Default: Paradip
    const lowerOrig = String(origin || "").toLowerCase();
    const approach = getPortFairwayApproach(destination);

    let midWaypoints = [];
    const destLat = destPt[0];

    // 1. Newcastle / East Coast Australia -> Sails up East Coast of Australia, through Torres Strait & Timor Sea, South of Java
    if (lowerOrig.includes("newcastle") || lowerOrig.includes("hay point") || lowerOrig.includes("gladstone")) {
        midWaypoints = [
            [-28.00, 154.00], // Up East Coast of Australia
            [-23.50, 152.00], // Off Fraser Island / Capricorn Channel
            [-18.00, 148.00], // Great Barrier Reef Outer Shipping Route
            [-13.00, 144.50], // Coral Sea
            [-10.50, 142.20], // Torres Strait Deepwater International Route
            [-10.00, 135.00], // Arafura Sea
            [-10.20, 128.00], // Timor Sea
            [-10.50, 120.00], // Savu Sea
            [-10.00, 114.00], // Indian Ocean South of Bali
            [-10.50, 106.00], // Indian Ocean South of Java
            [-8.50, 98.00],   // Deep Indian Ocean Westbound
            [-4.00, 94.00],   // SW of Sumatra Deepwater Channel
            [2.00, 92.50],    // West of Simeulue
            [6.00, 93.60]     // Great Channel / Six Degree Channel
        ];
        if (destLat <= 10.0) {
            midWaypoints.push([6.50, 85.00], [7.50, 80.50], [8.20, 78.80]);
        } else if (destLat <= 14.5) {
            midWaypoints.push([8.50, 88.00], [11.00, 84.50], [12.80, 81.50]);
        } else {
            midWaypoints.push([10.50, 90.50], [15.50, 88.00]);
            if (destLat > 18.0) {
                midWaypoints.push([18.00, 87.50]);
            }
        }
    }
    // 2. Port Hedland (NW Australia / Pilbara) -> Deep Indian Ocean west of Sumatra
    else if (lowerOrig.includes("hedland")) {
        midWaypoints = [
            [-19.50, 117.80], // Deepwater channel departure
            [-18.20, 116.20], // Off Dampier shelf
            [-15.00, 110.50], // Deep Indian Ocean WNW heading
            [-12.20, 105.00], // South of Christmas Island
            [-9.50, 99.00],   // Java Trench deep sea
            [-5.50, 94.80],   // Deep international waters SW of Sumatra
            [-1.50, 93.20],   // West of Siberut
            [2.50, 92.50],    // West of Simeulue
            [6.00, 93.60]     // Great Channel / Six Degree Channel
        ];
        if (destLat <= 10.0) {
            midWaypoints.push([6.60, 85.00], [7.50, 80.50], [8.20, 78.80]);
        } else if (destLat <= 14.5) {
            midWaypoints.push([8.50, 88.00], [11.00, 84.50], [12.80, 81.50]);
        } else {
            midWaypoints.push([10.50, 90.50], [14.50, 88.60]);
            if (destLat > 18.0) {
                midWaypoints.push([18.00, 87.60]);
            }
        }
    }
    // 3. Singapore / SE Asia -> Strait of Malacca Traffic Separation Scheme (TSS)
    else if (lowerOrig.includes("singapore") || lowerOrig.includes("jurong")) {
        midWaypoints = [
            [1.24, 103.60], // Singapore Strait West
            [1.24, 103.42], // South of Tanjung Piai TSS
            [1.50, 103.00], // Deep fairway off Kukup
            [1.90, 102.40], // Southern Malacca Strait
            [2.30, 101.80], // Off Melaka
            [2.70, 101.20], // Cape Rachado TSS
            [3.10, 100.60], // One Fathom Bank
            [4.00, 99.80],  // Central Malacca Strait
            [5.20, 98.20],  // Off Penang / North Sumatra
            [5.80, 96.50],  // Approaching Six Degree Channel
            [5.90, 95.00],  // Six Degree Channel East
            [5.85, 93.50],  // Six Degree Channel South of Great Nicobar (Pure deep ocean)
            [6.20, 91.50]   // Cleared into open Bay of Bengal / Indian Ocean
        ];
        if (destLat <= 10.0) {
            midWaypoints.push([6.00, 88.00], [6.00, 83.00], [5.70, 80.50], [7.00, 78.50]);
        } else if (destLat <= 14.5) {
            midWaypoints.push([8.00, 87.00], [10.50, 84.00], [12.80, 81.20]);
        } else if (destLat <= 18.0) {
            midWaypoints.push([9.00, 88.50], [13.00, 86.00], [16.20, 84.20]);
        } else {
            midWaypoints.push([10.00, 89.50], [14.50, 88.00], [18.00, 87.40], [19.80, 87.20]);
        }
    }
    // 4. South / East Africa (Richards Bay, Durban, Maputo) -> High seas Indian Ocean, South of Sri Lanka, into Bay of Bengal
    else if (lowerOrig.includes("richards") || lowerOrig.includes("durban") || lowerOrig.includes("maputo")) {
        midWaypoints = [
            [-25.00, 35.50],
            [-18.00, 42.00],
            [-10.00, 50.00],
            [-2.00, 60.00],
            [3.00, 70.00],
            [5.40, 79.50], // Deepwater passage south of Sri Lanka
            [5.70, 80.60]
        ];

        // Specific routing based on destination latitude on East Coast India
        if (destLat <= 10.0) {
            // Tuticorin / Southern Tamil Nadu -> Gulf of Mannar deep passage
            midWaypoints.push([6.80, 79.60], [8.00, 78.80]);
        } else if (destLat <= 14.5) {
            // Chennai / Ennore / Krishnapatnam -> direct coastal approach from south
            midWaypoints.push([6.20, 81.80], [9.50, 82.50], [12.00, 81.80], [12.80, 81.00]);
        } else {
            // Central & Northern East Coast: Visakhapatnam, Paradip, Dhamra, Haldia
            midWaypoints.push([6.20, 81.80], [8.50, 83.50], [13.00, 85.50]);
            if (destLat > 18.0) {
                midWaypoints.push([17.00, 86.80]);
            }
        }
    }
    // 5. Indonesia (Taboneo, Balikpapan, Samarinda) -> Navigable Sunda Channel to Indian Ocean
    else if (lowerOrig.includes("taboneo") || lowerOrig.includes("balikpapan") || lowerOrig.includes("samarinda") || lowerOrig.includes("indonesia")) {
        midWaypoints = [
            [-4.50, 110.50], // Java Sea
            [-5.80, 106.00],
            [-6.00, 105.85], // Sunda Strait Channel (between Java & Sumatra)
            [-6.15, 105.65],
            [-6.35, 105.35],
            [-6.60, 104.80], // Out into Indian Ocean
            [-5.00, 98.00],
            [-1.00, 94.00],
            [3.00, 92.50],
            [6.00, 93.60]
        ];
        if (destLat <= 10.0) {
            midWaypoints.push([6.80, 86.00], [7.80, 81.00], [8.30, 78.90]);
        } else if (destLat <= 14.5) {
            midWaypoints.push([8.50, 88.00], [11.00, 84.50], [12.80, 81.20]);
        } else {
            midWaypoints.push([11.00, 90.00], [15.50, 88.00]);
        }
    }
    // 6. Domestic East Coast India Coastal Shipping
    else {
        const eastCoastNames = ["paradip", "visakhapatnam", "dhamra", "haldia", "kolkata", "chennai", "gangavaram", "gopalpur", "kakinada", "krishnapatnam", "kamarajar", "chidambaranar", "tuticorin", "ennore"];
        const isDomestic = eastCoastNames.some(ep => lowerOrig.includes(ep));
        if (isDomestic) {
            const lat1 = originPt[0];
            const lat2 = destPt[0];
            const midLat = (lat1 + lat2) / 2;
            midWaypoints = [
                [lat1 + (lat2 > lat1 ? 0.3 : -0.3), Math.max(originPt[1] + 0.8, 83.5)],
                [midLat, 85.5],
                [lat2 - (lat2 > lat1 ? 0.3 : -0.3), Math.max(destPt[1] + 0.8, 84.5)]
            ];
        } else {
            midWaypoints = [
                [3.50, 95.00],
                [6.50, 93.50]
            ];
            if (destLat <= 14.5) {
                midWaypoints.push([9.50, 87.00], [12.00, 83.00]);
            } else {
                midWaypoints.push([11.00, 90.00], [15.00, 88.00], [17.50, 87.20]);
            }
        }
    }

    const rawWaypoints = [
        originPt,
        ...midWaypoints,
        ...approach,
        destPt
    ];

    // Curve and smooth turns so there are no sharp unnatural corners
    return smoothChaikinCurve(rawWaypoints, 3);
}

// Interpolate vessel [lat, lon], heading, traveled path, and remaining path cleanly along waypoints (Google Maps style)
export function calculateVesselPosOnRoute(waypoints, progress) {
    if (!waypoints || waypoints.length === 0) return null;
    if (waypoints.length === 1) {
        return { pos: waypoints[0], heading: 0, traveled: [waypoints[0]], remaining: [waypoints[0]] };
    }

    // Direct 0 to 100% normalization
    const norm = Math.max(0, Math.min(1, (progress !== undefined ? progress : 0) / 100));

    const dists = [];
    let total = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
        const dLat = waypoints[i + 1][0] - waypoints[i][0];
        const dLon = waypoints[i + 1][1] - waypoints[i][1];
        const d = Math.sqrt(dLat * dLat + dLon * dLon);
        dists.push(d);
        total += d;
    }

    if (total === 0) {
        return { pos: waypoints[0], heading: 0, traveled: [waypoints[0]], remaining: waypoints };
    }

    if (norm <= 0) {
        const p1 = waypoints[0];
        const p2 = waypoints[1];
        const dLonRad = ((p2[1] - p1[1]) * Math.PI) / 180;
        const p1LatRad = (p1[0] * Math.PI) / 180;
        const p2LatRad = (p2[0] * Math.PI) / 180;
        const y = Math.sin(dLonRad) * Math.cos(p2LatRad);
        const x = Math.cos(p1LatRad) * Math.sin(p2LatRad) -
            Math.sin(p1LatRad) * Math.cos(p2LatRad) * Math.cos(dLonRad);
        const heading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
        return { pos: waypoints[0], heading, traveled: [waypoints[0]], remaining: waypoints };
    }

    if (norm >= 1) {
        const pPrev = waypoints[waypoints.length - 2];
        const pLast = waypoints[waypoints.length - 1];
        const dLonRad = ((pLast[1] - pPrev[1]) * Math.PI) / 180;
        const pPrevLatRad = (pPrev[0] * Math.PI) / 180;
        const pLastLatRad = (pLast[0] * Math.PI) / 180;
        const y = Math.sin(dLonRad) * Math.cos(pLastLatRad);
        const x = Math.cos(pPrevLatRad) * Math.sin(pLastLatRad) -
            Math.sin(pPrevLatRad) * Math.cos(pLastLatRad) * Math.cos(dLonRad);
        const heading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
        return { pos: pLast, heading, traveled: waypoints, remaining: [pLast] };
    }

    const target = norm * total;
    let accumulated = 0;

    for (let i = 0; i < dists.length; i++) {
        if (accumulated + dists[i] >= target || i === dists.length - 1) {
            const segT = dists[i] > 0 ? Math.max(0, Math.min(1, (target - accumulated) / dists[i])) : 0;
            const p1 = waypoints[i];
            const p2 = waypoints[i + 1];
            const lat = p1[0] + (p2[0] - p1[0]) * segT;
            const lon = p1[1] + (p2[1] - p1[1]) * segT;
            const currPos = [lat, lon];

            const dLonRad = ((p2[1] - p1[1]) * Math.PI) / 180;
            const p1LatRad = (p1[0] * Math.PI) / 180;
            const p2LatRad = (p2[0] * Math.PI) / 180;

            const y = Math.sin(dLonRad) * Math.cos(p2LatRad);
            const x = Math.cos(p1LatRad) * Math.sin(p2LatRad) -
                Math.sin(p1LatRad) * Math.cos(p2LatRad) * Math.cos(dLonRad);
            const heading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

            const traveled = [...waypoints.slice(0, i + 1), currPos];
            const remaining = [currPos, ...waypoints.slice(i + 1)];

            return { pos: currPos, heading, traveled, remaining };
        }
        accumulated += dists[i];
    }

    const last = waypoints[waypoints.length - 1];
    return { pos: last, heading: 0, traveled: waypoints, remaining: [last] };
}

export default function NauticalLeafletMap({
    selectedOrigin: propSelectedOrigin,
    selectedDestination: propSelectedDestination,
    showRoute: propShowRoute = true,
    showSimulation: propShowSimulation = true,
    bookedVessel: propBookedVessel = null,
    simProgress: propSimProgress,
    isPlaying: propIsPlaying = false,
    simSpeed = 1,
    weatherDelayActive: propWeatherDelayActive = false,
    berthReallocated: propBerthReallocated = false,
    portCongestionActive: propPortCongestionActive = false,
    portDiverted: propPortDiverted = false,
    waitingForTruckGateScan = false,
    gateCleared = false,
    onPortSelect,
    onVesselSelect,
    onTriggerWeatherDelay,
    onApproveBerthReallocation,
    onTriggerPortCongestion,
    onApprovePortDiversion,
    onResetScenarios
}) {
    const flow = useFlow() || {};

    // Defaults to Newcastle -> Paradip / Dhamra to match active company requirement
    const effectiveOrigin = propSelectedOrigin || flow.requirement?.originPort || "Newcastle";
    const flowDiverted = flow.portDiverted || propPortDiverted;
    const effectiveDestination = flowDiverted
        ? "Krishnapatnam"
        : (propSelectedDestination || flow.requirement?.destinationPort || "Paradip");

    const effectiveWeatherDelay = propWeatherDelayActive !== undefined ? propWeatherDelayActive : flow.weatherDelayActive;
    const effectiveBerthReallocated = propBerthReallocated !== undefined ? propBerthReallocated : flow.berthReallocated;
    const effectivePortCongestion = propPortCongestionActive !== undefined ? propPortCongestionActive : flow.portCongestionActive;
    const effectivePortDiverted = flowDiverted;
    const effectiveBookedVessel = propBookedVessel || flow.requirement?.selectedVessel || { name: "MV Bengal Voyager", category: "Panamax" };

    const hudOrigWh = useMemo(() => {
        return getWarehouse(effectiveOrigin, flow.requirement?.originWarehouse);
    }, [effectiveOrigin, flow.requirement?.originWarehouse]);

    const hudDestWh = useMemo(() => {
        return getWarehouse(effectiveDestination, flow.requirement?.destinationWarehouse || flow.requirement?.warehouseSuitability || flow.requirement?.destinationWarehouseCode);
    }, [effectiveDestination, flow.requirement]);

    const defaultRouteDistance = useMemo(() => {
        const lower = String(effectiveOrigin).toLowerCase();
        if (lower.includes("singapore") || lower.includes("jurong")) return 1640;
        if (lower.includes("taboneo") || lower.includes("indonesia") || lower.includes("balikpapan")) return 2280;
        if (lower.includes("hedland")) return 3650;
        if (lower.includes("richards") || lower.includes("durban")) return 4680;
        return 5080;
    }, [effectiveOrigin]);

    // Default simulation progress to 53% (active in Indian Ocean) if not started yet, matching active transit state
    const effectiveSimProgress = (propSimProgress !== undefined && propSimProgress > 0)
        ? propSimProgress
        : (flow.simProgress > 0 ? flow.simProgress : 53);

    // ALWAYS show active nautical sea-lane and simulation vessel by default!
    const effectiveShowRoute = true;
    const effectiveShowSimulation = true;

    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const layersRef = useRef({});
    const fleetMarkersRef = useRef({});
    const simMarkerRef = useRef(null);
    const swellMarkerRef = useRef(null);
    const routeLinesRef = useRef({ core: null, glow: null, pins: [], connectors: [] });

    // Zoom level tracking for Google Maps-like adaptive label visibility
    const [currentZoom, setCurrentZoom] = useState(4);

    // State
    const [fleet, setFleet] = useState([]);
    const [routeData, setRouteData] = useState(null);
    const activeDistanceNm = routeData?.distanceNm || defaultRouteDistance;
    const [marineWeather, setMarineWeather] = useState(null);
    const [apiHealth, setApiHealth] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedVessel, setSelectedVessel] = useState(null);
    const [basemapStyle, setBasemapStyle] = useState("dark");

    // Nearby East Coast Vessels Drawer & Filter State
    const [showNearbyDrawer, setShowNearbyDrawer] = useState(false);
    const [vesselFilterText, setVesselFilterText] = useState("");

    // Layer Visibility Toggles
    const [showSeamarks, setShowSeamarks] = useState(true);
    const [showVessels, setShowVessels] = useState(true);
    const [showWarehouses, setShowWarehouses] = useState(true);
    const [showWeatherOverlay, setShowWeatherOverlay] = useState(true);

    // Map Controls Dropdown Menu State
    const [showMapMenu, setShowMapMenu] = useState(false);
    const menuRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMapMenu(false);
            }
        };
        if (showMapMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMapMenu]);

    // Initialize Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        // Centered to frame the corridor between Australia and Bay of Bengal
        const map = L.map(mapContainerRef.current, {
            center: [-5.0, 110.0],
            zoom: 4,
            minZoom: 2,
            maxZoom: 14,
            zoomControl: false,
            attributionControl: false
        });

        // Zoom tracking for Google Maps-style dynamic label hiding/scaling
        map.on("zoomend", () => {
            setCurrentZoom(map.getZoom());
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);

        const baseCfg = BASEMAP_TILES[basemapStyle] || BASEMAP_TILES.dark;
        const baseLayer = L.tileLayer(baseCfg.url, baseCfg.options).addTo(map);

        const seamarksLayer = L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
            maxZoom: 18,
            opacity: 0.85
        });
        if (showSeamarks) seamarksLayer.addTo(map);

        // Feature Groups
        const routeGroup = L.featureGroup().addTo(map);
        const simGroup = L.featureGroup().addTo(map);
        const warehousesGroup = L.featureGroup().addTo(map);
        const portsGroup = L.featureGroup().addTo(map);
        const vesselsGroup = L.featureGroup().addTo(map);
        const weatherGroup = L.featureGroup().addTo(map);

        layersRef.current = {
            base: baseLayer,
            seamarks: seamarksLayer,
            route: routeGroup,
            sim: simGroup,
            warehouses: warehousesGroup,
            ports: portsGroup,
            vessels: vesselsGroup,
            weather: weatherGroup
        };

        mapInstanceRef.current = map;

        // Auto-fit to route waypoints on init
        const initialWaypoints = generateNauticalWaypoints(effectiveOrigin, effectiveDestination);
        if (initialWaypoints && initialWaypoints.length > 1) {
            try {
                map.fitBounds(L.latLngBounds(initialWaypoints), { padding: [40, 40], maxZoom: 6 });
            } catch (e) {}
        }

        return () => {
            map.remove();
            mapInstanceRef.current = null;
            layersRef.current = {};
            routeLinesRef.current = { core: null, glow: null, traveled: null, planned: null, pins: [], connectors: [] };
            simMarkerRef.current = null;
            swellMarkerRef.current = null;
            fleetMarkersRef.current = {};
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

    // Fetch Live Fleet, Weather & Route Plan
    const fetchLiveData = async () => {
        try {
            const [fleetRes, weatherRes, healthRes] = await Promise.allSettled([
                axios.get("/live/vessels"),
                axios.get("/live/marine-weather"),
                axios.get("/system/api-health")
            ]);

            if (fleetRes.status === "fulfilled" && fleetRes.value.data?.vessels) {
                setFleet(fleetRes.value.data.vessels);
            }
            if (weatherRes.status === "fulfilled" && weatherRes.value.data) {
                setMarineWeather(weatherRes.value.data);
            }
            if (healthRes.status === "fulfilled" && healthRes.value.data) {
                setApiHealth(healthRes.value.data);
            }

            try {
                const routeRes = await axios.post("/live/route-plan", {
                    origin: effectiveOrigin,
                    destination: effectiveDestination
                });
                if (routeRes.data && routeRes.data.waypoints && routeRes.data.waypoints.length > 2) {
                    setRouteData(routeRes.data);
                }
            } catch (e) {
                const localWaypoints = generateNauticalWaypoints(effectiveOrigin, effectiveDestination);
                setRouteData({
                    distanceNm: 5080,
                    waypoints: localWaypoints.map(pt => ({ lat: pt[0], lon: pt[1] }))
                });
            }
        } catch (err) {
            console.error("Live nautical sync error:", err);
        }
    };

    useEffect(() => {
        fetchLiveData();
        const timer = setInterval(fetchLiveData, 45000);
        return () => clearInterval(timer);
    }, [effectiveOrigin, effectiveDestination]);

    // Real-time Dead-Reckoning Positional Drift
    useEffect(() => {
        const moveTimer = setInterval(() => {
            setFleet((prevFleet) => {
                if (!prevFleet || prevFleet.length === 0) return prevFleet;
                return prevFleet.map((v) => {
                    if (v.status === "At Anchor" || v.status === "Moored") return v;
                    const speed = v.speedKnots || 13.5;
                    const heading = v.heading || v.course || 0;
                    const distDeg = (speed / 3600) * 0.05;
                    const rad = (heading * Math.PI) / 180;
                    const dLat = distDeg * Math.cos(rad);
                    const dLon = distDeg * Math.sin(rad);
                    return {
                        ...v,
                        lat: v.lat + dLat,
                        lon: (v.lon || v.lng) + dLon,
                        lng: (v.lon || v.lng) + dLon
                    };
                });
            });
        }, 2500);
        return () => clearInterval(moveTimer);
    }, []);

    // Action: Focus & Track Specific Vessel
    const handleFocusVessel = (v) => {
        setSelectedVessel(v);
        if (onVesselSelect) onVesselSelect(v);
        const map = mapInstanceRef.current;
        if (map) {
            map.flyTo([v.lat, v.lon || v.lng], 8.5, { animate: true, duration: 1.2 });
            const marker = fleetMarkersRef.current[v.id];
            if (marker) {
                setTimeout(() => marker.openPopup(), 600);
            }
        }
    };

    // Google Maps-like Dynamic Port Markers (Adaptive label scale & hide based on zoom)
    useEffect(() => {
        const map = mapInstanceRef.current;
        const portsGroup = layersRef.current.ports;
        if (!map || !portsGroup) return;

        portsGroup.clearLayers();

        EAST_COAST_PORTS.forEach((port) => {
            const isSelected = port.id === effectiveDestination;
            const isOrigin = port.id === effectiveOrigin;
            const isCongested = (port.id === effectiveDestination && effectivePortCongestion && !effectivePortDiverted);
            const isDivertedTarget = (port.id === "Krishnapatnam" && effectivePortCongestion);

            const isHigh = port.congestion === "High" || isCongested;
            const isMedium = port.congestion === "Medium";
            const color = isCongested ? "#EF4444" : isDivertedTarget ? "#10B981" : isHigh ? "#EF4444" : isMedium ? "#F59E0B" : "#10B981";

            const isZoomedOut = currentZoom <= 5;
            const isMidZoom = currentZoom === 6 || currentZoom === 7;

            let labelDisplayHtml = "";

            if (isSelected) {
                labelDisplayHtml = `
                    <div class="absolute left-6 whitespace-nowrap bg-emerald-950/95 border border-emerald-400 px-2.5 py-1 rounded-md shadow-2xl text-[11px] font-bold text-emerald-200 pointer-events-none flex items-center gap-1.5 z-20">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>⚓ DESTINATION: ${port.name}</span>
                        ${effectivePortDiverted ? '<span class="text-amber-300 font-mono text-[9px]">(DIVERTED)</span>' : ''}
                    </div>
                `;
            } else if (isCongested) {
                labelDisplayHtml = `
                    <div class="absolute left-6 whitespace-nowrap bg-red-950/95 border border-red-500 px-2.5 py-1 rounded-md shadow-2xl text-[11px] font-bold text-red-200 pointer-events-none flex items-center gap-1.5 animate-pulse z-20">
                        <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        <span>🚨 ${port.name} (CONGESTION ALERT)</span>
                    </div>
                `;
            } else if (isDivertedTarget && !effectivePortDiverted) {
                labelDisplayHtml = `
                    <div class="absolute left-6 whitespace-nowrap bg-blue-950/90 border border-blue-400 px-2 py-0.5 rounded shadow text-[10px] font-bold text-blue-200 pointer-events-none">
                        <span>🎯 ${port.name} (Alternate 0 Queue)</span>
                    </div>
                `;
            } else if (isZoomedOut) {
                labelDisplayHtml = `
                    <div class="absolute left-6 whitespace-nowrap bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded shadow text-[10px] font-semibold text-slate-200 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        ${port.name} <span class="text-slate-400">(${port.queue} ships)</span>
                    </div>
                `;
            } else if (isMidZoom) {
                labelDisplayHtml = `
                    <div class="absolute left-6 whitespace-nowrap bg-slate-900/90 border border-slate-700/80 px-1.5 py-0.5 rounded shadow text-[10px] font-semibold text-slate-200 pointer-events-none">
                        ${port.name.replace(" Port", "").replace(" Dock Complex", "")} <span class="text-slate-400 font-mono text-[9px]">(${port.queue})</span>
                    </div>
                `;
            } else {
                labelDisplayHtml = `
                    <div class="absolute left-6 whitespace-nowrap bg-slate-900/95 border border-slate-700/80 px-2 py-0.5 rounded shadow-lg text-[11px] font-semibold text-slate-200 pointer-events-none">
                        ${port.name} <span class="text-slate-400">(${port.queue} in queue · ${port.waitHrs}h wait)</span>
                    </div>
                `;
            }

            const iconHtml = `
                <div class="relative flex items-center justify-center cursor-pointer group">
                    <div class="absolute w-6 h-6 rounded-full animate-ping opacity-40" style="background-color: ${color}"></div>
                    <div class="w-4 h-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${isSelected ? 'ring-4 ring-cyan-400 scale-125' : ''}" style="background-color: ${color}">
                        <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>
                    ${labelDisplayHtml}
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
                <div class="p-2.5 font-sans text-slate-800 text-xs min-w-[210px]">
                    <div class="font-bold text-sm text-slate-900 flex items-center justify-between border-b pb-1.5">
                        <span>⚓ ${port.name}</span>
                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-600">${port.locode}</span>
                    </div>
                    <div class="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                        <div><span class="text-slate-500">Max Draft:</span> <b>${port.maxDraft}m</b></div>
                        <div><span class="text-slate-500">Congestion:</span> <b style="color: ${color}">${isCongested ? 'Severe (18 ships)' : port.congestion}</b></div>
                        <div><span class="text-slate-500">Vessels in Queue:</span> <b>${isCongested ? '18' : port.queue}</b></div>
                        <div><span class="text-slate-500">Avg Waiting:</span> <b>${isCongested ? '32 hrs' : `${port.waitHrs} hrs`}</b></div>
                    </div>
                </div>
            `);

            marker.on("click", () => {
                if (onPortSelect) onPortSelect(port);
            });

            portsGroup.addLayer(marker);
        });
    }, [effectiveDestination, effectiveOrigin, effectivePortCongestion, effectivePortDiverted, currentZoom]);

    // Render Origin & Destination Port Warehouses with Intermodal Connectors
    useEffect(() => {
        const map = mapInstanceRef.current;
        const warehousesGroup = layersRef.current.warehouses;
        if (!map || !warehousesGroup) return;

        warehousesGroup.clearLayers();
        if (!showWarehouses) return;

        const chosenDestWh = flow.requirement?.destinationWarehouse || flow.requirement?.warehouseSuitability || flow.requirement?.destinationWarehouseCode;
        const chosenOrigWh = flow.requirement?.originWarehouse;

        const origWh = getWarehouse(effectiveOrigin, chosenOrigWh);
        const destWh = getWarehouse(effectiveDestination, chosenDestWh);

        const renderWh = (wh, isOrigin, portCoord) => {
            if (!wh) return;

            const badgeBg = isOrigin ? "#F59E0B" : "#10B981";
            const borderCol = isOrigin ? "#D97706" : "#059669";
            const stepNum = isOrigin ? "1" : "4";
            const stepTitle = isOrigin ? "ORIGIN WAREHOUSE" : "DEST WAREHOUSE";

            const whHtml = `
                <div class="relative flex items-center justify-center cursor-pointer group">
                    <div class="w-8 h-8 rounded-lg border-2 shadow-2xl flex items-center justify-center transition-transform group-hover:scale-110" style="background-color: ${badgeBg}; border-color: #FFFFFF">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 21h18"/>
                            <path d="M19 21v-4"/>
                            <path d="M19 17l-7-5-7 5"/>
                            <path d="M5 17v4"/>
                            <path d="M3 7l9-4 9 4v10"/>
                        </svg>
                    </div>
                    <div class="absolute left-9 whitespace-nowrap bg-slate-950/95 border px-2.5 py-1 rounded-md shadow-xl text-[11px] font-bold text-white flex items-center gap-1.5 pointer-events-none z-20" style="border-color: ${borderCol}">
                        <span class="w-2 h-2 rounded-full" style="background-color: ${badgeBg}"></span>
                        <span>${isOrigin ? '🏭' : '🏬'} ${stepNum}. ${stepTitle}: ${wh.shortName || wh.name}</span>
                        <span class="text-slate-400 font-mono text-[9px]">(${wh.code})</span>
                    </div>
                </div>
            `;

            const icon = L.divIcon({
                html: whHtml,
                className: "custom-warehouse-marker",
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            const marker = L.marker([wh.lat, wh.lon], { icon, zIndexOffset: 950 }).addTo(warehousesGroup);

            marker.bindPopup(`
                <div class="p-2.5 font-sans text-slate-800 text-xs min-w-[250px]">
                    <div class="flex items-center justify-between border-b pb-1.5">
                        <div class="font-bold text-sm text-slate-900">${wh.name}</div>
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase" style="background-color: ${badgeBg}">
                            ${isOrigin ? 'POINT 1: ORIGIN SIDING' : 'POINT 4: DESTINATION WAREHOUSE'}
                        </span>
                    </div>
                    <div class="mt-2 space-y-1 text-[11px]">
                        <div class="flex justify-between"><span class="text-slate-500">Warehouse Code:</span> <b class="font-mono text-cyan-800">${wh.code}</b></div>
                        <div class="flex justify-between"><span class="text-slate-500">Facility Type:</span> <b>${wh.type}</b></div>
                        <div class="flex justify-between"><span class="text-slate-500">Storage Capacity:</span> <b>${(wh.capacityMt || 250000).toLocaleString()} MT</b></div>
                        <div class="flex justify-between"><span class="text-slate-500">Utilization:</span> <b class="text-emerald-700">${wh.utilizationPct || 65}% Active</b></div>
                        <div class="flex justify-between"><span class="text-slate-500">Intermodal Fleet:</span> <b>${wh.connectedFleet || 50} Trucks / Rail Cars</b></div>
                        <div class="flex justify-between"><span class="text-slate-500">Loading Rate:</span> <b>${wh.loadingRateTph || 3500} TPH</b></div>
                    </div>
                </div>
            `);

            if (portCoord) {
                const connectorLine = L.polyline([[wh.lat, wh.lon], portCoord], {
                    color: isOrigin ? "#F59E0B" : "#10B981",
                    weight: 3,
                    dashArray: "4, 5",
                    opacity: 0.95
                });
                warehousesGroup.addLayer(connectorLine);
            }
        };

        const origPortCoord = getPortCoord(effectiveOrigin, [1.2655, 103.8198]);
        const destPortCoord = getPortCoord(effectiveDestination, [20.8145, 86.9634]);

        renderWh(origWh, true, origPortCoord);
        renderWh(destWh, false, destPortCoord);

    }, [effectiveOrigin, effectiveDestination, showWarehouses, flow.requirement]);

    // Render AIS Fleet with ZERO Blinking
    useEffect(() => {
        const map = mapInstanceRef.current;
        const vesselsGroup = layersRef.current.vessels;
        if (!map || !vesselsGroup) return;

        if (!showVessels) {
            vesselsGroup.clearLayers();
            fleetMarkersRef.current = {};
            return;
        }

        const currentMmsis = new Set();

        fleet.forEach((v) => {
            currentMmsis.add(v.id);
            const heading = v.heading || v.course || 0;
            const isCapesize = v.category === "Capesize";
            const isPanamax = v.category === "Panamax";
            const isSelected = selectedVessel?.id === v.id;
            const hullColor = isCapesize ? "#F59E0B" : isPanamax ? "#06B6D4" : "#10B981";

            const existingMarker = fleetMarkersRef.current[v.id];

            if (existingMarker) {
                existingMarker.setLatLng([v.lat, v.lon || v.lng]);
                const el = existingMarker.getElement();
                if (el) {
                    const rotNode = el.querySelector(".vessel-rotator");
                    if (rotNode) rotNode.style.transform = `rotate(${heading}deg)`;
                }
            } else {
                const vesselHtml = `
                    <div class="relative cursor-pointer transition-transform duration-300 group">
                        <div class="vessel-rotator" style="transform: rotate(${heading}deg); transform-origin: center center;">
                            <svg width="32" height="32" viewBox="0 0 40 40" class="filter drop-shadow-md">
                                <line x1="20" y1="20" x2="20" y2="4" stroke="${hullColor}" stroke-width="2" stroke-dasharray="3,2" opacity="0.8" />
                                <path d="M20,4 C23,8 24,14 24,28 C24,34 22,36 20,36 C18,36 16,34 16,28 C16,14 17,8 20,4 Z" fill="${hullColor}" stroke="#ffffff" stroke-width="1.5" />
                                <rect x="18" y="24" width="4" height="6" fill="#0F172A" rx="1" />
                                <circle cx="20" cy="8" r="1.5" fill="#FFFFFF" />
                            </svg>
                        </div>
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
                            <div class="flex justify-between"><span class="text-slate-500">Heading:</span> <b>${heading}°</b></div>
                            <div class="flex justify-between"><span class="text-slate-500">Destination:</span> <b class="text-cyan-700">⚓ ${v.destinationPort || v.destination}</b></div>
                            <div class="flex justify-between"><span class="text-slate-500">Nav Status:</span> <span class="text-emerald-600 font-semibold">${v.status}</span></div>
                        </div>
                    </div>
                `);

                marker.on("click", () => {
                    setSelectedVessel(v);
                    if (onVesselSelect) onVesselSelect(v);
                });

                vesselsGroup.addLayer(marker);
                fleetMarkersRef.current[v.id] = marker;
            }
        });

        Object.keys(fleetMarkersRef.current).forEach((id) => {
            if (!currentMmsis.has(id)) {
                vesselsGroup.removeLayer(fleetMarkersRef.current[id]);
                delete fleetMarkersRef.current[id];
            }
        });
    }, [fleet, showVessels, selectedVessel]);

    // ALWAYS Render Full Ocean Nautical Route Line with Origin & Destination Badges (Google Maps Style)
    useEffect(() => {
        const map = mapInstanceRef.current;
        const routeGroup = layersRef.current.route;
        if (!map || !routeGroup) return;

        const rawWaypoints = (routeData && routeData.waypoints && routeData.waypoints.length > 2)
            ? routeData.waypoints.map(pt => [pt.lat, pt.lon || pt.lng])
            : generateNauticalWaypoints(effectiveOrigin, effectiveDestination);

        if (!rawWaypoints || rawWaypoints.length < 2) return;

        // Guarantee smooth organic curve with 3 iterations of corner-cutting
        const latLngs = smoothChaikinCurve(rawWaypoints, 3);

        // Auto-fit bounds on route change so user immediately sees origin to destination corridor
        try {
            map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50], maxZoom: 6 });
        } catch (e) {}

        // Split route into Traveled vs Remaining based on current sim progress
        const routeCalc = calculateVesselPosOnRoute(latLngs, effectiveSimProgress);
        const traveledPts = routeCalc?.traveled || [latLngs[0]];
        const remainingPts = routeCalc?.remaining || latLngs;

        // Clean re-render of route layers to guarantee lines are on current map instance
        routeGroup.clearLayers();

        // 1. Wide Maritime Navigation Corridor Glow
        const glowLine = L.polyline(latLngs, {
            color: "#06B6D4",
            weight: 8,
            opacity: 0.28,
            lineCap: "round",
            lineJoin: "round"
        }).addTo(routeGroup);

        // 2. Traveled Route Line (Solid glowing emerald path from origin to ship pos - Google Maps style)
        const traveledLine = L.polyline(traveledPts, {
            color: "#10B981",
            weight: 4,
            opacity: 0.95,
            lineCap: "round",
            lineJoin: "round"
        }).addTo(routeGroup);

        // 3. Remaining Planned Route Line (Dashed cyan line ahead of the ship)
        const plannedLine = L.polyline(remainingPts, {
            color: "#22D3EE",
            weight: 3.5,
            dashArray: "6, 6",
            opacity: 0.85,
            lineCap: "round",
            lineJoin: "round"
        }).addTo(routeGroup);

        // 4. Point 2: Origin Port Pin with Rich Badge
        const startPt = latLngs[0];
        const originHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group">
                <div class="w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-lg ring-4 ring-amber-400/40 animate-pulse"></div>
                <div class="absolute left-6 whitespace-nowrap bg-slate-950/95 border border-amber-400 px-2.5 py-1 rounded-md shadow-2xl text-[11px] font-bold text-amber-300 flex items-center gap-1.5 pointer-events-none z-20">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>⚓ 2. ORIGIN PORT: ${effectiveOrigin}</span>
                </div>
            </div>
        `;
        const originPin = L.marker(startPt, {
            icon: L.divIcon({ html: originHtml, className: "origin-route-pin", iconSize: [20, 20], iconAnchor: [10, 10] }),
            zIndexOffset: 1000
        }).bindPopup(`<b>Point 2: Origin Loading Port (${effectiveOrigin})</b><br/>Global Maritime Export Terminal`).addTo(routeGroup);

        // 5. Point 3: Destination Port Pin with Dynamic Congestion / Diversion Badges
        const endPt = latLngs[latLngs.length - 1];
        const isCongested = effectivePortCongestion && !effectivePortDiverted;
        const destColor = isCongested ? "#EF4444" : effectivePortDiverted ? "#10B981" : "#06B6D4";
        const destHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group">
                <div class="w-4 h-4 rounded-full border-2 border-white shadow-lg ring-4 animate-pulse" style="background-color: ${destColor}; ring-color: ${destColor}66;"></div>
                <div class="absolute left-6 whitespace-nowrap bg-slate-950/95 border px-2.5 py-1 rounded-md shadow-2xl text-[11px] font-bold flex items-center gap-1.5 pointer-events-none z-20" style="border-color: ${destColor}; color: ${destColor};">
                    <span class="w-2 h-2 rounded-full" style="background-color: ${destColor};"></span>
                    <span>⚓ 3. DEST PORT: ${effectiveDestination}</span>
                    ${isCongested ? '<span class="text-red-400 font-mono text-[9px]">(18 QUEUED)</span>' : ''}
                    ${effectivePortDiverted ? '<span class="text-emerald-300 font-mono text-[9px]">(DIVERTED 0 QUEUE)</span>' : ''}
                </div>
            </div>
        `;
        const destPin = L.marker(endPt, {
            icon: L.divIcon({ html: destHtml, className: "dest-route-pin", iconSize: [20, 20], iconAnchor: [10, 10] }),
            zIndexOffset: 1000
        }).bindPopup(`<b>Point 3: Destination Discharge Port (${effectiveDestination})</b><br/>${isCongested ? 'Severe Port Congestion (18 in queue)' : 'Berth Discharge Corridor'}`).addTo(routeGroup);

        // 6. Scenario 2: Dynamic Port Diversion Alternate Route Indicator
        let divertLine = null;
        let divertPin = null;
        if (effectivePortCongestion && !effectivePortDiverted) {
            const divertPt = PORT_COORDINATES_MAP["Krishnapatnam"] || [14.2500, 80.1200];
            const branchPt = routeCalc ? routeCalc.pos : [12.0, 81.8];
            const divertWaypoints = [branchPt, [13.2, 81.2], [13.8, 80.6], divertPt];

            divertLine = L.polyline(divertWaypoints, {
                color: "#F59E0B",
                weight: 4,
                dashArray: "5, 6",
                opacity: 0.95
            }).addTo(routeGroup);

            const divertHtml = `
                <div class="relative flex items-center justify-center cursor-pointer group">
                    <div class="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg ring-4 ring-emerald-400/50 animate-bounce"></div>
                    <div class="absolute left-6 whitespace-nowrap bg-emerald-950/95 border border-emerald-400 px-2 py-0.5 rounded shadow-xl text-[10px] font-bold text-emerald-200 pointer-events-none z-20">
                        <span>🎯 Krishnapatnam (Alternate 0 Queue)</span>
                    </div>
                </div>
            `;
            divertPin = L.marker(divertPt, {
                icon: L.divIcon({ html: divertHtml, className: "divert-target-pin", iconSize: [20, 20], iconAnchor: [10, 10] }),
                zIndexOffset: 1000
            }).addTo(routeGroup);
        }

        routeLinesRef.current = {
            glow: glowLine,
            traveled: traveledLine,
            planned: plannedLine,
            pins: [originPin, destPin],
            diversion: divertLine,
            divertPin: divertPin
        };

    }, [routeData, effectiveOrigin, effectiveDestination, effectivePortCongestion, effectivePortDiverted]);

    // ALWAYS Render Active Simulation Vessel with Tactical Radar Ripple Circles
    useEffect(() => {
        const map = mapInstanceRef.current;
        const simGroup = layersRef.current.sim;
        if (!map || !simGroup) return;

        const rawWaypoints = (routeData && routeData.waypoints && routeData.waypoints.length > 2)
            ? routeData.waypoints.map(pt => [pt.lat, pt.lon || pt.lng])
            : generateNauticalWaypoints(effectiveOrigin, effectiveDestination);

        if (!rawWaypoints || rawWaypoints.length < 2) return;

        const curvedWaypoints = smoothChaikinCurve(rawWaypoints, 3);
        const vesselPosState = calculateVesselPosOnRoute(curvedWaypoints, effectiveSimProgress);
        if (!vesselPosState) return;

        const { pos, heading, traveled, remaining } = vesselPosState;
        const vessel = effectiveBookedVessel;

        // Update live route line traveled and planned segments smoothly (Google Maps live progress!)
        if (routeLinesRef.current?.traveled && traveled) {
            routeLinesRef.current.traveled.setLatLngs(traveled);
        }
        if (routeLinesRef.current?.planned && remaining) {
            routeLinesRef.current.planned.setLatLngs(remaining);
        }

        // Scenario 1: Swell Hold check
        const isIdleInSwell = effectiveWeatherDelay && !effectiveBerthReallocated && effectiveSimProgress >= 50 && effectiveSimProgress <= 58;
        const isBerthedAtPort = effectiveSimProgress >= 98;
        const routePct = Math.min(100, Math.round(effectiveSimProgress));

        const pulseColor = isIdleInSwell ? "#EF4444" : isBerthedAtPort ? "#10B981" : "#06B6D4";
        const statusText = isIdleInSwell
            ? "⚠️ Swell Hold (0.0 kn) · Waiting Berth Swap"
            : isBerthedAtPort
                ? `⚓ Berthed at ${effectiveDestination} · Unloading Active`
                : "14.2 kn · Ocean Transit";

        // Update or create simulation marker position smoothly (Zero Blinking!)
        if (simMarkerRef.current && map.hasLayer(simMarkerRef.current)) {
            simMarkerRef.current.setLatLng(pos);
            const el = simMarkerRef.current.getElement();
            if (el) {
                const rot = el.querySelector(".sim-rotator");
                if (rot) rot.style.transform = `rotate(${heading}deg)`;
                const badge = el.querySelector(".sim-pct-badge");
                if (badge) {
                    badge.innerText = `🚢 ${vessel.name || "MV Bengal Voyager"} (${routePct}%)`;
                }
                const speedTag = el.querySelector(".sim-speed-tag");
                if (speedTag) {
                    speedTag.innerText = statusText;
                }
            }
        } else {
            // Visual tactical radar ripple circles matching screenshot
            // Notice: floating badge has opacity-0 group-hover:opacity-100 so it does NOT permanently clutter the map!
            const vesselHtml = `
                <div class="relative flex items-center justify-center cursor-pointer group">
                    <!-- Concentric Tactical Radar Ripple Circles -->
                    <div class="absolute -inset-10 rounded-full border border-cyan-400/30 animate-ping opacity-60 pointer-events-none"></div>
                    <div class="absolute -inset-6 rounded-full border border-cyan-400/50 pointer-events-none"></div>
                    <div class="absolute -inset-2 rounded-full bg-cyan-500/20 border border-cyan-300 pointer-events-none"></div>

                    <!-- Realistic Ship Top-Down Hull -->
                    <div class="sim-rotator z-10 transition-transform duration-100 ease-linear" style="transform: rotate(${heading}deg); transform-origin: center center;">
                        <svg width="42" height="42" viewBox="0 0 40 40" class="filter drop-shadow-2xl">
                            <line x1="20" y1="20" x2="20" y2="2" stroke="${pulseColor}" stroke-width="2.5" stroke-dasharray="3,2" />
                            <path d="M20,2 C24,7 26,14 26,29 C26,35 23,38 20,38 C17,38 14,35 14,29 C14,14 16,7 20,2 Z" fill="${pulseColor}" stroke="#FFFFFF" stroke-width="2" />
                            <rect x="17.5" y="24" width="5" height="7" fill="#0F172A" rx="1" />
                            <circle cx="20" cy="7" r="2" fill="#FDE68A" />
                        </svg>
                    </div>

                    <!-- Floating Dark Badge with Cyan Border: Hidden by default, reveals on hover to keep map view clean -->
                    <div class="absolute left-8 -top-4 whitespace-nowrap bg-slate-950/95 border border-cyan-400 px-3 py-1 rounded-full shadow-2xl text-[11px] font-bold font-mono text-white flex flex-col pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div class="flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full ${isIdleInSwell ? 'bg-red-500' : 'bg-cyan-400'} animate-ping"></span>
                            <span class="sim-pct-badge text-cyan-200">🚢 ${vessel.name || "MV Bengal Voyager"} (${routePct}%)</span>
                        </div>
                        <div class="sim-speed-tag text-[9px] text-slate-400 font-sans mt-0.5">
                            ${statusText}
                        </div>
                    </div>
                </div>
            `;

            const icon = L.divIcon({
                html: vesselHtml,
                className: "booked-vessel-marker",
                iconSize: [44, 44],
                iconAnchor: [22, 22]
            });

            const marker = L.marker(pos, { icon, zIndexOffset: 1200 }).addTo(simGroup);

            marker.bindPopup(`
                <div class="p-2.5 font-sans text-slate-800 text-xs min-w-[240px]">
                    <div class="flex items-center justify-between border-b pb-1.5">
                        <span class="font-bold text-sm text-slate-900">${vessel.name || "MV Bengal Voyager"}</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase bg-emerald-600">LIVE VOYAGE</span>
                    </div>
                    <div class="mt-2 space-y-1 text-[11px]">
                        <div class="flex justify-between"><span class="text-slate-500">Category:</span> <b>${vessel.category || "Panamax"}</b></div>
                        <div class="flex justify-between"><span class="text-slate-500">Active Corridor:</span> <b class="text-cyan-800">${effectiveOrigin} ➔ ${effectiveDestination}</b></div>
                        <div class="flex justify-between"><span class="text-slate-500">Sea Transit:</span> <b class="text-emerald-600 font-mono">${routePct}% Completed</b></div>
                        <div class="flex justify-between"><span class="text-slate-500">Live Heading:</span> <b class="font-mono">${Math.round(heading)}°</b></div>
                        <div class="flex justify-between"><span class="text-slate-500">Speed / Status:</span> <b class="text-blue-900">${statusText}</b></div>
                    </div>
                </div>
            `);

            simMarkerRef.current = marker;
        }

        // Scenario 1: Monsoon Swell Hazard Zone Overlay placed dynamically right on the route at 54% progress!
        if (effectiveWeatherDelay && !effectiveBerthReallocated) {
            const swellRoutePos = calculateVesselPosOnRoute(rawWaypoints, 54);
            const swellPos = swellRoutePos ? swellRoutePos.pos : [12.5, 83.5];

            if (!swellMarkerRef.current) {
                const swellIcon = L.divIcon({
                    html: `
                        <div class="relative flex items-center justify-center pointer-events-none">
                            <div class="w-24 h-24 rounded-full border-2 border-amber-400 bg-amber-500/10 animate-ping opacity-60"></div>
                            <div class="absolute whitespace-nowrap bg-amber-950/95 border border-amber-400 text-amber-200 px-2.5 py-1 rounded-md font-mono text-[10px] font-bold top-16 shadow-2xl flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                <span>⚠️ SWELL SURGE HAZARD (+10H)</span>
                            </div>
                        </div>
                    `,
                    className: "swell-delay-marker",
                    iconSize: [96, 96],
                    iconAnchor: [48, 48]
                });
                swellMarkerRef.current = L.marker(swellPos, { icon: swellIcon, zIndexOffset: 900 }).addTo(simGroup);
            } else {
                swellMarkerRef.current.setLatLng(swellPos);
            }
        } else {
            if (swellMarkerRef.current) {
                simGroup.removeLayer(swellMarkerRef.current);
                swellMarkerRef.current = null;
            }
        }

    }, [effectiveSimProgress, routeData, effectiveOrigin, effectiveDestination, effectiveWeatherDelay, effectiveBerthReallocated]);

    // Repositioned Marine Weather Telemetry Box (East of Indian Coast so it never covers ports or routes)
    useEffect(() => {
        const map = mapInstanceRef.current;
        const weatherGroup = layersRef.current.weather;
        if (!map || !weatherGroup) return;

        weatherGroup.clearLayers();
        if (!showWeatherOverlay || currentZoom <= 3) return;

        const waveHeight = typeof marineWeather?.waveHeightMeters === 'number'
            ? marineWeather.waveHeightMeters.toFixed(1)
            : (parseFloat(marineWeather?.waveHeightMeters) || 2.5).toFixed(1);
        const swellHeight = typeof marineWeather?.swellHeightMeters === 'number'
            ? marineWeather.swellHeightMeters.toFixed(1)
            : (parseFloat(marineWeather?.swellHeightMeters) || 1.8).toFixed(1);

        const weatherHtml = `
            <div class="bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-lg shadow-2xl text-slate-100 flex items-center gap-2.5">
                <div class="p-1 bg-cyan-500/20 text-cyan-400 rounded">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2 12c.6 0 1.2-.4 1.5-1 1-2 3-2 4 0 .3.6.9 1 1.5 1s1.2-.4 1.5-1c1-2 3-2 4 0 .3.6.9 1 1.5 1s1.2-.4 1.5-1c1-2 3-2 4 0 .3.6.9 1 1.5 1" />
                    </svg>
                </div>
                <div>
                    <div class="text-[9px] text-cyan-300 font-bold uppercase tracking-wider">Bay of Bengal Marine</div>
                    <div class="text-[11px] font-bold flex items-center gap-1.5">
                        <span>Wave: ${waveHeight}m</span>
                        <span class="text-slate-400">•</span>
                        <span>Swell: ${swellHeight}m</span>
                    </div>
                </div>
            </div>
        `;

        const weatherIcon = L.divIcon({
            html: weatherHtml,
            className: "weather-overlay-marker",
            iconSize: [190, 48],
            iconAnchor: [95, 24]
        });

        const weatherMarker = L.marker([14.2, 91.5], { icon: weatherIcon });
        weatherGroup.addLayer(weatherMarker);
    }, [marineWeather, showWeatherOverlay, currentZoom]);

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

                {/* Left: Origin ➔ Destination Route Banner & 4-Point Pipeline */}
                <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-xl shadow-xl flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
                        <Compass className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Active Nautical Sea-Lane & 4-Point Multimodal Pipeline
                        </div>
                        <div className="text-sm font-extrabold text-white flex items-center gap-2">
                            <span className="text-amber-400">{effectiveOrigin}</span>
                            <span className="text-slate-500 font-mono">━━━━▶</span>
                            <span className={effectivePortDiverted ? "text-emerald-400" : "text-cyan-400"}>
                                {effectiveDestination}
                            </span>
                        </div>
                        {/* 4-Step Multimodal Pipeline Breadcrumb */}
                        <div className="text-[10px] text-slate-300 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span className="text-amber-300 font-semibold">🏭 1. {hudOrigWh?.shortName || hudOrigWh?.name || "Origin Silo"}</span>
                            <span className="text-slate-500">➔</span>
                            <span className="text-amber-400 font-semibold">⚓ 2. {effectiveOrigin}</span>
                            <span className="text-slate-500">➔</span>
                            <span className="text-cyan-300 font-semibold">🌊 Sea ({Math.round(effectiveSimProgress)}%)</span>
                            <span className="text-slate-500">➔</span>
                            <span className="text-cyan-400 font-semibold">⚓ 3. {effectiveDestination}</span>
                            <span className="text-slate-500">➔</span>
                            <span className="text-emerald-400 font-bold">🏬 4. {hudDestWh?.shortName || hudDestWh?.name || "Dest Warehouse"}</span>
                        </div>
                    </div>

                    <div className="pl-3 border-l border-slate-700/80 flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            <span>{effectiveBookedVessel.name || "MV Bengal Voyager"}</span>
                            <span className="text-amber-300">({Math.round(effectiveSimProgress)}%)</span>
                        </div>
                    </div>

                    <div className="pl-3 border-l border-slate-700/80 flex items-center gap-3 text-xs">
                        <div>
                            <div className="text-[10px] text-slate-400">Distance</div>
                            <div className="font-mono font-bold text-cyan-300">{activeDistanceNm.toLocaleString()} NM</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400">Est. Transit</div>
                            <div className="font-mono font-bold text-white">{(activeDistanceNm / (14 * 24)).toFixed(1)} Days</div>
                        </div>
                    </div>
                </div>

                {/* Right: Actions, Scenario Quick Buttons & Map Options */}
                <div className="pointer-events-auto flex items-center gap-2" ref={menuRef}>

                    {/* Scenario 1 Quick Trigger */}
                    <button
                        onClick={() => {
                            if (onTriggerWeatherDelay) onTriggerWeatherDelay();
                            else if (flow.triggerWeatherDelay) flow.triggerWeatherDelay();
                        }}
                        className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-lg border ${
                            effectiveWeatherDelay
                                ? "bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400"
                                : "bg-slate-900/90 text-amber-300 border-amber-500/30 hover:bg-slate-800"
                        }`}
                        title="Scenario 1: Swell Delay (+10h) & Berth Reallocation"
                    >
                        <span>⚡</span>
                        <span>Scenario 1</span>
                    </button>

                    {/* Scenario 2 Quick Trigger */}
                    <button
                        onClick={() => {
                            if (onTriggerPortCongestion) onTriggerPortCongestion();
                            else if (flow.triggerPortCongestion) flow.triggerPortCongestion();
                        }}
                        className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-lg border ${
                            effectivePortCongestion
                                ? "bg-red-600 text-white border-red-400 ring-2 ring-red-400 animate-pulse"
                                : "bg-slate-900/90 text-red-300 border-red-500/30 hover:bg-slate-800"
                        }`}
                        title="Scenario 2: Port Congestion & Alternate Port Diversion"
                    >
                        <span>🚨</span>
                        <span>Scenario 2</span>
                    </button>

                    {(effectiveWeatherDelay || effectivePortCongestion || effectivePortDiverted) && (
                        <button
                            onClick={() => {
                                if (onResetScenarios) onResetScenarios();
                                else if (flow.resetSimulation) flow.resetSimulation();
                            }}
                            className="p-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 shadow"
                            title="Reset Active Scenarios"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* Nearby East Coast Vessels Radar Button */}
                    <button
                        onClick={() => setShowNearbyDrawer(prev => !prev)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xl active:scale-95 ${
                            showNearbyDrawer
                                ? "bg-emerald-400 text-slate-950 shadow-emerald-500/50 ring-2 ring-emerald-300"
                                : "bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 hover:text-white backdrop-blur-md"
                        }`}
                    >
                        <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span>Nearby Vessels ({fleet.length})</span>
                    </button>

                    {/* Map Options / Controls Dropdown Trigger */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMapMenu(prev => !prev)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xl border backdrop-blur-md ${
                                showMapMenu
                                    ? "bg-blue-600 text-white border-blue-400 shadow-blue-500/30"
                                    : "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:text-white"
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Map Options</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMapMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu Modal */}
                        {showMapMenu && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 z-[1100] text-xs space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                                <div className="flex items-center justify-between border-b border-slate-700/70 pb-2">
                                    <div className="flex items-center gap-2 font-bold text-white">
                                        <Layers className="w-4 h-4 text-cyan-400" />
                                        <span>Map Controls & Overlays</span>
                                    </div>
                                    <button
                                        onClick={() => setShowMapMenu(false)}
                                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Base Maps */}
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
                                        Base Map Style
                                    </span>
                                    <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                                        {[
                                            { id: "dark", label: "Tactical Dark" },
                                            { id: "satellite", label: "Satellite" },
                                            { id: "osm", label: "Standard" }
                                        ].map((b) => (
                                            <button
                                                key={b.id}
                                                onClick={() => setBasemapStyle(b.id)}
                                                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-center transition-all ${
                                                    basemapStyle === b.id
                                                        ? "bg-blue-600 text-white shadow font-bold"
                                                        : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                                                }`}
                                            >
                                                {b.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Map Overlays */}
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
                                        Map Overlays
                                    </span>
                                    <div className="space-y-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
                                        <button
                                            onClick={() => setShowWarehouses(!showWarehouses)}
                                            className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors"
                                        >
                                            <span className="flex items-center gap-2 text-slate-300">
                                                <Warehouse className="w-3.5 h-3.5 text-amber-400" />
                                                <span>Port Warehouses & Silos</span>
                                            </span>
                                            <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] font-bold ${showWarehouses ? 'bg-amber-600 border-amber-500 text-white' : 'border-slate-600 text-transparent'}`}>
                                                ✓
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => setShowVessels(!showVessels)}
                                            className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors"
                                        >
                                            <span className="flex items-center gap-2 text-slate-300">
                                                <Ship className="w-3.5 h-3.5 text-cyan-400" />
                                                <span>Live AIS Fleet ({fleet.length})</span>
                                            </span>
                                            <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] font-bold ${showVessels ? 'bg-cyan-600 border-cyan-500 text-white' : 'border-slate-600 text-transparent'}`}>
                                                ✓
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => setShowSeamarks(!showSeamarks)}
                                            className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors"
                                        >
                                            <span className="flex items-center gap-2 text-slate-300">
                                                <Anchor className="w-3.5 h-3.5 text-cyan-400" />
                                                <span>OpenSeaMap Seamarks</span>
                                            </span>
                                            <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] font-bold ${showSeamarks ? 'bg-cyan-600 border-cyan-500 text-white' : 'border-slate-600 text-transparent'}`}>
                                                ✓
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => setShowWeatherOverlay(!showWeatherOverlay)}
                                            className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors"
                                        >
                                            <span className="flex items-center gap-2 text-slate-300">
                                                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                                                <span>Marine Weather & Swell</span>
                                            </span>
                                            <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] font-bold ${showWeatherOverlay ? 'bg-cyan-600 border-cyan-500 text-white' : 'border-slate-600 text-transparent'}`}>
                                                ✓
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-1 border-t border-slate-700/70">
                                    <button
                                        onClick={fetchLiveData}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors font-medium text-[11px]"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
                                        <span>Refresh AIS & Ocean Corridors</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* DYNAMIC SCENARIO 1 INTERACTIVE ACTION BANNER (Monsoon Swell & Berth Swap) */}
            {effectiveWeatherDelay && (
                <div className="absolute top-20 left-4 right-4 z-[999] pointer-events-auto flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-950/95 border-2 border-amber-400 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3">
                    <div className="flex items-center gap-3 text-amber-200 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 grid place-items-center font-bold text-base border border-amber-500/40">
                            ⚡
                        </div>
                        <div>
                            <div className="font-extrabold uppercase tracking-wide text-amber-300 flex items-center gap-2">
                                <span>Scenario 1 Active: Monsoon Swell Surge (+10h)</span>
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                            </div>
                            <div className="text-[11px] text-amber-100/90 mt-0.5">
                                {effectiveBerthReallocated
                                    ? "✅ Berth swap approved! Feeder departing. Vessel resuming full cruising speed to Dhamra Berth B-01."
                                    : "Primary vessel held in Bay of Bengal high seas. Destination Berth B-02 occupied by feeder vessel MV Coastal Pride."}
                            </div>
                        </div>
                    </div>
                    {!effectiveBerthReallocated ? (
                        <button
                            onClick={() => {
                                if (onApproveBerthReallocation) onApproveBerthReallocation();
                                else if (flow.approveBerthReallocation) flow.approveBerthReallocation();
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xl active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                        >
                            <span>Approve Early Berth Swap</span>
                            <ArrowRight size={14} />
                        </button>
                    ) : (
                        <span className="px-3 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                            Berth Reallocated ✓
                        </span>
                    )}
                </div>
            )}

            {/* DYNAMIC SCENARIO 2 INTERACTIVE ACTION BANNER (Port Congestion & Diversion) */}
            {effectivePortCongestion && (
                <div className="absolute top-20 left-4 right-4 z-[999] pointer-events-auto flex items-center justify-between gap-3 p-3 rounded-xl bg-red-950/95 border-2 border-red-500 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3">
                    <div className="flex items-center gap-3 text-red-200 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 grid place-items-center font-bold text-base border border-red-500/40 animate-pulse">
                            🚨
                        </div>
                        <div>
                            <div className="font-extrabold uppercase tracking-wide text-red-300 flex items-center gap-2">
                                <span>Scenario 2 Active: Destination Port Critical Congestion</span>
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                            </div>
                            <div className="text-[11px] text-red-100/90 mt-0.5">
                                {effectivePortDiverted
                                    ? "✅ Vessel diverted to Krishnapatnam Port! 0 Wait Queue · Immediate Capesize Berth allocated."
                                    : "Dhamra Port has 18 vessels waiting (32h delay). Krishnapatnam Port has 0 queue & immediate Capesize bulk berth ready."}
                            </div>
                        </div>
                    </div>
                    {!effectivePortDiverted ? (
                        <button
                            onClick={() => {
                                if (onApprovePortDiversion) onApprovePortDiversion();
                                else if (flow.approvePortDiversion) flow.approvePortDiversion();
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold text-xs shadow-xl active:scale-95 transition-all flex items-center gap-1.5 shrink-0 animate-pulse"
                        >
                            <span>Authorize Diversion to Krishnapatnam</span>
                            <ArrowRight size={14} />
                        </button>
                    ) : (
                        <span className="px-3 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                            Diverted to Krishnapatnam ✓
                        </span>
                    )}
                </div>
            )}

            {/* Main Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

            {/* Nearby East Coast Vessels Drawer */}
            {showNearbyDrawer && (
                <div className="absolute top-16 right-4 bottom-16 w-84 md:w-96 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl z-[1001] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
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
                        >
                            <X size={16} />
                        </button>
                    </div>

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

                                        <div className="mt-2 pt-2 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-[11px] font-mono">
                                            <div>
                                                <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                    <span>Live AIS:</span>
                                                </div>
                                                <div className="text-cyan-300 font-bold text-[11px]">
                                                    {v.lat.toFixed(3)}°N, ${(v.lon || v.lng).toFixed(3)}°E
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 text-[10px]">SOG / Heading:</span>
                                                <div className="text-emerald-400 font-bold text-[11px]">
                                                    {v.speedKnots} kn · {v.heading || v.course}°
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 text-[10px]">Destination:</span>
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

            {/* Bottom Floating Legend */}
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
                    <div className="pl-3 border-l border-slate-700 text-[11px] text-amber-300 flex items-center gap-1.5 font-mono">
                        <Warehouse className="w-3.5 h-3.5 text-amber-400" />
                        <span>Port Stockyards & Silos Active</span>
                    </div>
                    <div className="pl-3 border-l border-slate-700 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                        <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <span>12 East Coast Ports</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
