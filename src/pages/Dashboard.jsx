import React, { useState, useEffect } from "react";
import EastCoastMap from "../components/EastCoastMap";
import TopDownVesselIcon, { TopDownTruckSvg } from "../components/VesselIcons";
import PortOperationsSimulator from "../components/PortOperationsSimulator";
import ContractorConfirmationDashboard from "../components/ContractorConfirmationDashboard";
import RoadFleetSimulator from "../components/RoadFleetSimulator";
import { useFlow } from "../lib/flow";
import { useAuth } from "../lib/auth";
import { useNavigate, Link } from "react-router-dom";
import {
    Ship, Activity, AlertTriangle, TrendingUp, Anchor, ClipboardList,
    HeartPulse, Play, Pause, RotateCcw, Zap, ShieldAlert, ShieldCheck,
    Truck, ArrowRight, CheckCircle2, Navigation, Clock, Sparkles, Building2, MapPin, QrCode, Globe
} from "lucide-react";
import { toast } from "sonner";

// NOTE: Cleanup of active requirement moved inside Dashboard component.
// The effect will run when the component unmounts to clear sessionStorage.

// Coordinates for the World / Multimodal Corridor Simulation Canvas (ViewBox: 0 0 1000 490)
const SIM_NODES = {
    Newcastle: {
        country: "Australia",
        portName: "Newcastle Port",
        sidingName: "Hunter Valley Mine Siding, NSW",
        sidingX: 960,
        sidingY: 410,
        portX: 920,
        portY: 360,
        seaWaypoints: [{ x: 800, y: 280 }, { x: 650, y: 220 }]
    },
    "Hay Point": {
        country: "Australia",
        portName: "Hay Point Coal Terminal",
        sidingName: "Bowen Basin Siding, QLD",
        sidingX: 950,
        sidingY: 390,
        portX: 910,
        portY: 340,
        seaWaypoints: [{ x: 790, y: 270 }, { x: 640, y: 210 }]
    },
    Gladstone: {
        country: "Australia",
        portName: "Gladstone Port",
        sidingName: "Moura Coal Siding, QLD",
        sidingX: 955,
        sidingY: 400,
        portX: 915,
        portY: 350,
        seaWaypoints: [{ x: 795, y: 275 }, { x: 645, y: 215 }]
    },
    Taboneo: {
        country: "Indonesia",
        portName: "Taboneo Port",
        sidingName: "South Kalimantan Siding",
        sidingX: 940,
        sidingY: 370,
        portX: 900,
        portY: 320,
        seaWaypoints: [{ x: 770, y: 250 }, { x: 630, y: 200 }]
    },
    Balikpapan: {
        country: "Indonesia",
        portName: "Balikpapan Port",
        sidingName: "East Kalimantan Coal Terminal",
        sidingX: 935,
        sidingY: 360,
        portX: 895,
        portY: 310,
        seaWaypoints: [{ x: 765, y: 245 }, { x: 625, y: 195 }]
    },
    Samarinda: {
        country: "Indonesia",
        portName: "Samarinda Port",
        sidingName: "Mahakam River Coal Basin",
        sidingX: 930,
        sidingY: 355,
        portX: 890,
        portY: 305,
        seaWaypoints: [{ x: 760, y: 240 }, { x: 620, y: 190 }]
    },
    "Richards Bay": {
        country: "South Africa",
        portName: "Richards Bay Terminal",
        sidingName: "Mpumalanga Coal Siding",
        sidingX: 50,
        sidingY: 440,
        portX: 100,
        portY: 390,
        seaWaypoints: [{ x: 220, y: 320 }, { x: 340, y: 240 }]
    },
    Durban: {
        country: "South Africa",
        portName: "Durban Port",
        sidingName: "Natal Rail Hub",
        sidingX: 45,
        sidingY: 450,
        portX: 95,
        portY: 400,
        seaWaypoints: [{ x: 215, y: 325 }, { x: 335, y: 245 }]
    },
    Maputo: {
        country: "Mozambique",
        portName: "Maputo Coal Terminal",
        sidingName: "Matola Coal Siding",
        sidingX: 60,
        sidingY: 430,
        portX: 110,
        portY: 380,
        seaWaypoints: [{ x: 230, y: 315 }, { x: 350, y: 235 }]
    },
    Singapore: {
        country: "Singapore",
        portName: "Jurong Island Terminal",
        sidingName: "Jurong Logistics Hub",
        sidingX: 880,
        sidingY: 350,
        portX: 840,
        portY: 300,
        seaWaypoints: [{ x: 710, y: 240 }, { x: 570, y: 190 }]
    },
    "Port Hedland": {
        country: "Australia",
        portName: "Port Hedland",
        sidingName: "Pilbara Iron Siding, WA",
        sidingX: 940,
        sidingY: 390,
        portX: 900,
        portY: 340,
        seaWaypoints: [{ x: 770, y: 260 }, { x: 640, y: 210 }]
    },
    Vostochny: {
        country: "Russia",
        portName: "Vostochny Port",
        sidingName: "Siberian Rail Siding",
        sidingX: 920,
        sidingY: 180,
        portX: 870,
        portY: 200,
        seaWaypoints: [{ x: 750, y: 210 }, { x: 620, y: 180 }]
    }
};

const DEST_NODES = {
    "Kolkata (SMP)": { name: "Kolkata (SMP)", x: 550, y: 55, plantX: 430, plantY: 35, plantName: "Howrah Heavy Foundry", labelSide: "left" },
    Kolkata: { name: "Kolkata (SMP)", x: 550, y: 55, plantX: 430, plantY: 35, plantName: "Howrah Heavy Foundry", labelSide: "left" },
    Haldia: { name: "Haldia Dock Complex", x: 530, y: 90, plantX: 410, plantY: 70, plantName: "Durgapur Steel Hub", labelSide: "right" },
    Dhamra: { name: "Dhamra Port", x: 505, y: 125, plantX: 385, plantY: 105, plantName: "Kalinganagar Industrial Hub", labelSide: "right" },
    Paradip: { name: "Paradip Port", x: 480, y: 165, plantX: 360, plantY: 140, plantName: "Angul Integrated Steel Complex", labelSide: "right" },
    Gopalpur: { name: "Gopalpur Port", x: 450, y: 205, plantX: 330, plantY: 180, plantName: "Tata Steel SEZ Gopalpur", labelSide: "left" },
    Visakhapatnam: { name: "Visakhapatnam Port", x: 420, y: 245, plantX: 300, plantY: 220, plantName: "Vizag Steel & Energy Plant", labelSide: "right" },
    Gangavaram: { name: "Gangavaram Port", x: 405, y: 280, plantX: 285, plantY: 255, plantName: "Raipur Sponge Iron Complex", labelSide: "left" },
    Kakinada: { name: "Kakinada Port", x: 380, y: 315, plantX: 260, plantY: 290, plantName: "Rajahmundry Industrial Belt", labelSide: "right" },
    Krishnapatnam: { name: "Krishnapatnam Port", x: 345, y: 355, plantX: 225, plantY: 330, plantName: "Ballari Metal Siding", labelSide: "left" },
    "Ennore (Kamarajar)": { name: "Ennore Port", x: 325, y: 395, plantX: 205, plantY: 370, plantName: "North Chennai Thermal Station", labelSide: "right" },
    Kamarajar: { name: "Ennore Port", x: 325, y: 395, plantX: 205, plantY: 370, plantName: "North Chennai Thermal Station", labelSide: "right" },
    Chennai: { name: "Chennai Port", x: 310, y: 430, plantX: 190, plantY: 405, plantName: "Sri City Manufacturing Zone", labelSide: "left" },
    "Tuticorin (V.O.C)": { name: "Tuticorin Port", x: 250, y: 465, plantX: 130, plantY: 440, plantName: "Madurai Logistics Park", labelSide: "left" },
    "V.O. Chidambaranar": { name: "Tuticorin Port", x: 250, y: 465, plantX: 130, plantY: 440, plantName: "Madurai Logistics Park", labelSide: "left" },
};

// Commercial Multi-Vessel Traffic (Shown when no vessel is booked yet)
const MULTI_VESSEL_TRAFFIC = [
    {
        id: "mv1",
        name: "MV Global Trader",
        category: "Panamax",
        origin: "Newcastle",
        dest: "Paradip Port",
        cargo: "74k MT Coal",
        speed: "13.8 kts",
        p0: { x: 750, y: 380 },
        p1: { x: 640, y: 300 },
        p2: { x: 550, y: 220 },
        p3: { x: 480, y: 165 },
        offset: 0.08,
        color: "#38BDF8"
    },
    {
        id: "mv2",
        name: "MV East Ocean",
        category: "Supramax",
        origin: "Gladstone",
        dest: "Visakhapatnam Port",
        cargo: "58k MT Coal",
        speed: "12.9 kts",
        p0: { x: 720, y: 410 },
        p1: { x: 600, y: 350 },
        p2: { x: 500, y: 290 },
        p3: { x: 420, y: 245 },
        offset: 0.42,
        color: "#F59E0B"
    },
    {
        id: "mv3",
        name: "MV Southern Cross",
        category: "Capesize",
        origin: "Port Hedland",
        dest: "Dhamra Port",
        cargo: "180k MT Ore",
        speed: "14.2 kts",
        p0: { x: 770, y: 350 },
        p1: { x: 660, y: 255 },
        p2: { x: 580, y: 185 },
        p3: { x: 505, y: 125 },
        offset: 0.72,
        color: "#10B981"
    },
    {
        id: "mv4",
        name: "MV Bengal Pioneer",
        category: "Handysize",
        origin: "Richards Bay",
        dest: "Haldia Dock",
        cargo: "35k MT Lime",
        speed: "11.7 kts",
        p0: { x: 690, y: 390 },
        p1: { x: 620, y: 280 },
        p2: { x: 560, y: 170 },
        p3: { x: 530, y: 90 },
        offset: 0.22,
        color: "#A855F7"
    }
];

export default function Dashboard() {
    const { user } = useAuth();
    const nav = useNavigate();
    const {
        requirement,
        isPlaying, togglePlay,
        simProgress, setSimProgress,
        simSpeed, setSimSpeed,
        weatherDelayActive, triggerWeatherDelay,
        berthReallocated, approveBerthReallocation,
        feederProgress, feederDeparting, feederDepartProgress,
        portCongestionActive, triggerPortCongestion,
        portDiverted, approvePortDiversion,
        resetSimulation,
        getCurrentLeg,
        simActive,
        bookSampleSingaporeDhamra,
        acceptContractorFixture,
        waitingForTruckGateScan,
        vesselArrivedAtPort,
        gateCleared,
        scanGatePass
    } = useFlow();

    const hasActiveBooking = Boolean(
        requirement &&
        requirement.status !== "COMPLETED" &&
        requirement.originPort &&
        requirement.destinationPort
    );
    const isContractorAccepted = Boolean(
        hasActiveBooking &&
        requirement.contractorAccepted &&
        (requirement.status === "ACTIVE_IN_TRANSIT" || requirement.status === "ACCEPTED")
    );
    const showSimulation = Boolean(isContractorAccepted && simActive && simProgress < 100);
    const hasBookedVessel = showSimulation;
    const currentLeg = getCurrentLeg();

    // Simulated days & hours based on simProgress (0-100% represents 72 hours)
    const totalHoursElapsed = Math.floor((simProgress / 100) * 72);
    const simulatedDay = Math.floor(totalHoursElapsed / 24) + 1;
    const simulatedHour = totalHoursElapsed % 24;
    const formattedSimTime = `DAY 0${simulatedDay} · ${simedPad(simulatedHour)}:00 HRS`;

    function simedPad(n) {
        return n < 10 ? `0${n}` : n;
    }

    // Active Origin & Destination Nodes for Dedicated Vessel
    const originKey = requirement?.originPort || "Singapore";
    const originHub = SIM_NODES[originKey] || SIM_NODES["Singapore"] || SIM_NODES["Newcastle"];

    const destKey = portDiverted ? "Krishnapatnam" : (requirement?.destinationPort || "Dhamra");
    const destObj = DEST_NODES[destKey] || DEST_NODES["Dhamra"] || DEST_NODES["Paradip"];
    const origDestObj = DEST_NODES[requirement?.destinationPort || "Dhamra"] || DEST_NODES["Paradip"];

    const srcSiding = { x: originHub.sidingX, y: originHub.sidingY, name: requirement?.originWarehouse || originHub.sidingName };
    const srcPort = { x: originHub.portX, y: originHub.portY, name: originHub.portName };
    const targetPort = { x: destObj.x, y: destObj.y, name: destObj.name };
    const targetPlant = { x: destObj.plantX, y: destObj.plantY, name: requirement?.destinationWarehouse || destObj.plantName };

    // Calculate live moving 2D asset position on the World Canvas
    // Always animates – uses sample defaults when no vessel is booked
    const calculateWorldAssetPosition = () => {
        // 1. First Mile: 0% to 20% (Mine Siding ➔ Origin Port)
        if (simProgress < 20) {
            const t = simProgress / 20;
            const x = srcSiding.x + (srcPort.x - srcSiding.x) * t;
            const y = srcSiding.y + (srcPort.y - srcSiding.y) * t;
            const angle = Math.atan2(srcPort.y - srcSiding.y, srcPort.x - srcSiding.x) * (180 / Math.PI);
            return { type: "TRUCK", stage: "FIRST_MILE", x, y, angle, label: "First-Mile Road Haulage" };
        }

        // 2. Origin Port Loading: 20% to 35%
        if (simProgress < 35) {
            return { type: "VESSEL", stage: "LOADING", x: srcPort.x - 8, y: srcPort.y - 5, angle: -45, label: "Conveyor Jetty Loading" };
        }

        // 3. Ocean Transit: 35% to 75% (Sea Lane Curve to Destination Port)
        if (simProgress < 75) {
            let t = (simProgress - 35) / 40;

            // If weather delay active and not yet reallocated, slow down slightly in the swell zone
            if (weatherDelayActive && !berthReallocated && t > 0.55) {
                t = 0.55; // Holds gracefully at swell zone until berth swap approved
            }

            const p0 = srcPort;
            const p1 = originHub.seaWaypoints[0];
            const p2 = originHub.seaWaypoints[1];
            const p3 = targetPort;

            const cx = Math.pow(1 - t, 3) * p0.x + 3 * Math.pow(1 - t, 2) * t * p1.x + 3 * (1 - t) * Math.pow(t, 2) * p2.x + Math.pow(t, 3) * p3.x;
            const cy = Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y;

            const dx = -3 * Math.pow(1 - t, 2) * p0.x + 3 * (1 - t) * (1 - 3 * t) * p1.x + 3 * t * (2 - 3 * t) * p2.x + 3 * Math.pow(t, 2) * p3.x;
            const dy = -3 * Math.pow(1 - t, 2) * p0.y + 3 * (1 - t) * (1 - 3 * t) * p1.y + 3 * t * (2 - 3 * t) * p2.y + 3 * Math.pow(t, 2) * p3.y;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            return {
                type: "VESSEL",
                stage: "OCEAN_TRANSIT",
                x: cx,
                y: cy,
                angle,
                label: weatherDelayActive && !berthReallocated && t >= 0.55 ? "⚓ Idle Holding in Swell (Waiting Berth Clear)" : "Ocean High-Seas Transit"
            };
        }

        // 4. Destination Port Berth: 75% to 85%
        if (simProgress < 85) {
            return { type: "VESSEL", stage: "DISCHARGING", x: targetPort.x + 5, y: targetPort.y, angle: -90, label: "Quay Crane Discharge" };
        }

        // 5. Last Mile Road: 85% to 100% (Destination Port ➔ Steel Complex)
        const t = Math.min(1, (simProgress - 85) / 15);
        const x = targetPort.x + (targetPlant.x - targetPort.x) * t;
        const y = targetPort.y + (targetPlant.y - targetPort.y) * t;
        const angle = Math.atan2(targetPlant.y - targetPort.y, targetPlant.x - targetPort.x) * (180 / Math.PI);
        return {
            type: "TRUCK",
            stage: simProgress >= 100 ? "DELIVERED" : "LAST_MILE",
            x,
            y,
            angle,
            label: simProgress >= 100 ? "Cargo Delivered to Plant (Completed)" : "Last-Mile Steel Plant Delivery"
        };
    };

    const asset = calculateWorldAssetPosition();

    // Multi-Vessel Position Calculator for Live Traffic Mode
    const calculateMultiVesselPos = (v) => {
        const norm = ((simProgress / 100) + v.offset) % 1;
        const t = Math.max(0.01, Math.min(0.99, norm));
        const { p0, p1, p2, p3 } = v;
        const cx = Math.pow(1 - t, 3) * p0.x + 3 * Math.pow(1 - t, 2) * t * p1.x + 3 * (1 - t) * Math.pow(t, 2) * p2.x + Math.pow(t, 3) * p3.x;
        const cy = Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y;
        const dx = -3 * Math.pow(1 - t, 2) * p0.x + 3 * (1 - t) * (1 - 3 * t) * p1.x + 3 * t * (2 - 3 * t) * p2.x + 3 * Math.pow(t, 2) * p3.x;
        const dy = -3 * Math.pow(1 - t, 2) * p0.y + 3 * (1 - t) * (1 - 3 * t) * p1.y + 3 * t * (2 - 3 * t) * p2.y + 3 * Math.pow(t, 2) * p3.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return { x: cx, y: cy, angle };
    };

    // Ocean Sea Lane Path
    const p0 = srcPort;
    const p1 = originHub.seaWaypoints[0];
    const p2 = originHub.seaWaypoints[1];
    const p3 = targetPort;
    const oceanRoutePathD = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;

    // Congested Port Alternate Path
    const origP3 = origDestObj;
    const congestedRoutePathD = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${origP3.x} ${origP3.y}`;

    const calculateSecondaryVesselPosition = () => {
        // Exact destination port berth #2 coordinates (seaward side)
        const berth = { x: targetPort.x + 22, y: targetPort.y + 10 };
        // Open sea starting coordinate in Bay of Bengal
        const seaStart = { x: targetPort.x + 160, y: targetPort.y + 110 };
        // Outbound sea exit point
        const exitEnd = { x: targetPort.x + 190, y: targetPort.y + 70 };

        if (feederDeparting) {
            const t = feederDepartProgress / 100;
            const x = berth.x + (exitEnd.x - berth.x) * t;
            const y = berth.y + (exitEnd.y - berth.y) * t;
            const angle = Math.atan2(exitEnd.y - berth.y, exitEnd.x - berth.x) * (180 / Math.PI);
            return { x, y, angle, atBerth: false, visible: feederDepartProgress < 100, stage: "DEPARTING" };
        }

        const t = Math.min(feederProgress / 100, 1);
        const x = seaStart.x + (berth.x - seaStart.x) * t;
        const y = seaStart.y + (berth.y - seaStart.y) * t;
        const angle = Math.atan2(berth.y - seaStart.y, berth.x - seaStart.x) * (180 / Math.PI);
        const atBerth = feederProgress >= 100;
        return { x, y, angle, atBerth, visible: true, stage: atBerth ? "AT_BERTH" : "APPROACHING" };
    };

    const secondaryVessel = (hasBookedVessel && (weatherDelayActive || feederDeparting)) ? calculateSecondaryVesselPosition() : null;

    // Exactly ONE (1) moving truck for the coastal/feeder vessel that travels from the port directly to Angul Steel Complex
    const [feederTruckProgress, setFeederTruckProgress] = useState(0);

    useEffect(() => {
        if (!secondaryVessel?.atBerth || feederDeparting) {
            setFeederTruckProgress(0);
            return;
        }
        const interval = setInterval(() => {
            setFeederTruckProgress((prev) => (prev >= 100 ? 0 : prev + 0.9 * (simSpeed || 1)));
        }, 100);
        return () => clearInterval(interval);
    }, [secondaryVessel?.atBerth, feederDeparting, simSpeed]);

    const feederTruck = secondaryVessel?.atBerth && !feederDeparting ? (() => {
        const t = feederTruckProgress / 100;
        const x = targetPort.x + (targetPlant.x - targetPort.x) * t;
        const y = targetPort.y + (targetPlant.y - targetPort.y) * t;
        const angle = Math.atan2(targetPlant.y - targetPort.y, targetPlant.x - targetPort.x) * (180 / Math.PI);
        return { x, y, angle, progress: Math.round(feederTruckProgress) };
    })() : null;

    // PORT OPS PROFILE: Port Operations & Real-Time Berth Simulator IS their dedicated primary Dashboard!
    if (user?.role === "port_operator" || user?.role === "vessel_operator") {
        return (
            <div className="space-y-6" data-testid="port-operator-dashboard">
                <PortOperationsSimulator
                    defaultPort={requirement?.destinationPort || "Paradip"}
                />
            </div>
        );
    }

    // CONTRACTOR PROFILE: No Map! Dedicated Confirmation List & Shipbuilder Verification Desk
    if (user?.role === "contractor" || user?.role === "chartering_operator") {
        return (
            <div className="space-y-6" data-testid="contractor-dashboard">
                <ContractorConfirmationDashboard />
            </div>
        );
    }

    // ROAD FLEET / LOGISTICS OPERATOR PROFILE: Dedicated 2D Port-to-Warehouse Corridor & Automated Gate Radar!
    if (user?.role === "road_transporter" || user?.role === "transporter") {
        return (
            <div className="space-y-6" data-testid="road-transporter-dashboard">
                <RoadFleetSimulator />
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="dashboard-page">
            {/* Real-time Contractor Status Notification Banner for Company Profile */}
            {requirement?.status === "CONTRACTOR_COUNTERED" && (
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 shadow-md animate-fadeIn">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl mt-0.5">⚠️</span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sm text-amber-950 uppercase font-mono">Contractor Counter-Proposal Received</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 font-mono">Action Recommended</span>
                                </div>
                                <div className="text-xs text-amber-900 font-semibold mt-1">
                                    Reason: <span className="font-normal">{requirement.rejectionReason}</span>
                                </div>
                                <div className="mt-1.5 p-2.5 rounded-lg bg-white/90 border border-amber-200 text-xs text-amber-950 font-mono">
                                    <strong className="text-amber-800">Recommended Solution:</strong> {requirement.recommendedSolution}
                                    {requirement.contractorNote && (
                                        <div className="text-slate-600 text-[11px] mt-1 italic">Note from Contractor: "{requirement.contractorNote}"</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Link
                            to="/new-requirement"
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold whitespace-nowrap shadow transition-all"
                        >
                            Adjust & Re-tender ➔
                        </Link>
                    </div>
                </div>
            )}

            {requirement?.status === "WAIT_SHIPBUILDER" && (
                <div className="p-4 rounded-xl border border-blue-300 bg-blue-50 text-blue-900 shadow-sm flex items-center justify-between gap-3 font-mono text-xs">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl">⏳</span>
                        <div>
                            <strong className="font-bold text-blue-950">Under Shipbuilder Hull & Drydock Verification:</strong>
                            <div className="text-blue-800 text-[11px] mt-0.5">{requirement.contractorNote || "Contractor is checking hull availability with Cochin Shipyard before confirming laycan."}</div>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-blue-200 text-blue-950 font-bold text-[10px]">Decision In Progress</span>
                </div>
            )}

            {/* Awaiting Contractor Confirmation Banner (Appears after booking) */}
            {requirement?.status === "PENDING_REVIEW" && (
                <div className="p-4 rounded-xl border border-purple-300 bg-purple-50 text-purple-900 shadow-sm flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl">📡</span>
                        <div>
                            <strong className="font-bold text-purple-950">Requirement #{requirement.id} Submitted to Contractor Desk:</strong>
                            <div className="text-purple-800 text-[11px] mt-0.5">
                                Route: <span className="font-bold text-purple-950">{requirement.originPort} ➔ {requirement.destinationPort}</span> ({requirement.cargoQuantity?.toLocaleString() || "70,000"} MT {requirement.cargoType || "Coal"}). Reviewing ballast fleet.
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3.5 py-1.5 rounded-lg bg-purple-200 text-purple-950 font-bold text-xs flex items-center gap-1.5 animate-pulse">
                            <Clock size={13} />
                            <span>Pending Contractor (Carrier) Desk Acceptance</span>
                        </span>
                    </div>
                </div>
            )}

            {/* Clean Radar View Banner (Shown when no active booking exists, e.g. after refresh) */}
            {!hasActiveBooking && (
                <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-blue-600/30 border border-blue-400 text-blue-300">
                            <Ship className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 font-mono">Maritime GIS · Clean Radar View</div>
                            <div className="text-sm font-bold text-white">No Active Sea Corridors Booked</div>
                            <div className="text-xs text-slate-300">Book a cargo shipment to generate live multimodal transit routes and simulation.</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={bookSampleSingaporeDhamra}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                        >
                            <Sparkles size={14} className="text-amber-300" />
                            <span>⚡ Book Shipment (Singapore ➔ Dhamra)</span>
                        </button>
                        <Link
                            to="/new-requirement"
                            className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
                        >
                            <span>+ Custom Booking</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MASTER WORLD MAP 2D MULTIMODAL VISUAL SIMULATION CANVAS (ONLY AFTER ACCEPTING) */}
            {/* ========================================================================= */}
            {showSimulation && (
                <div className="astra-card p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-900/60 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600/30 border border-blue-400 text-blue-300 grid place-items-center font-mono font-bold text-sm">
                                ASTRA
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-mono font-bold text-amber-400 tracking-wider">
                                        2D WORLD MULTIMODAL SIMULATION RADAR
                                    </span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                </div>
                                <h2 className="text-lg font-extrabold text-white" style={{ fontFamily: "Manrope" }}>
                                    {formattedSimTime} · {currentLeg.name}
                                </h2>
                            </div>
                        </div>

                        {/* Player Controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={togglePlay}
                                disabled={simProgress >= 100}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-white text-xs font-bold transition-all shadow ${simProgress >= 100 ? "bg-emerald-700 cursor-default" : "bg-blue-600 hover:bg-blue-500"
                                    }`}
                            >
                                {simProgress >= 100 ? (
                                    <>
                                        <CheckCircle2 size={14} className="text-emerald-300" />
                                        <span>Completed</span>
                                    </>
                                ) : isPlaying ? (
                                    <>
                                        <Pause size={14} />
                                        <span>Pause</span>
                                    </>
                                ) : (
                                    <>
                                        <Play size={14} />
                                        <span>Play</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={resetSimulation}
                                className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                                title="Reset to Day 0"
                            >
                                <RotateCcw size={15} />
                            </button>

                            <div className="flex bg-white/10 rounded-md p-0.5 text-[11px] font-mono font-bold">
                                {[1, 2, 5].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSimSpeed(s)}
                                        className={`px-2 py-1 rounded transition-colors ${simSpeed === s ? "bg-amber-400 text-slate-950 font-extrabold" : "text-slate-300 hover:text-white"}`}
                                    >
                                        {s}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Multimodal Synchronized Gate Status Banners */}
                    {(waitingForTruckGateScan || (simProgress >= 75 && !gateCleared)) && (
                        <div className="p-3.5 rounded-xl border border-amber-400 bg-amber-950/80 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3 font-mono animate-pulse shadow-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⚓</span>
                                <div>
                                    <div className="font-extrabold text-amber-300 uppercase tracking-wide">
                                        Vessel Berthed at Destination Port ({requirement?.destinationPort || "Dhamra"}) · Awaiting Truck In-Gate
                                    </div>
                                    <div className="text-[11px] text-amber-200 mt-0.5">
                                        Vessel voyage stopped at quay. STS Crane unloading paused until Road Fleet scans PCS 1x Digital QR Gate Pass at Gate 01.
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow">
                                    <Clock size={13} />
                                    <span>Awaiting Road Fleet QR Scan at Port Gate 01</span>
                                </span>
                                <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500 text-amber-300 font-bold text-[10px]">
                                    GATE 01 BARRIER CLOSED
                                </span>
                            </div>
                        </div>
                    )}

                    {gateCleared && simProgress >= 75 && simProgress < 85 && (
                        <div className="p-3 rounded-xl border border-emerald-500/80 bg-emerald-950/70 text-emerald-200 text-xs flex items-center justify-between gap-3 font-mono shadow-md">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl">✅</span>
                                <div>
                                    <strong className="font-bold text-emerald-300">Port In-Gate Cleared & Authorized:</strong>
                                    <span className="text-[11px] text-emerald-100 ml-1.5">
                                        Road Fleet tipper admitted past gate. Mobile cranes discharging material directly into truck hauliers.
                                    </span>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]">
                                BOOM BARRIER RAISED
                            </span>
                        </div>
                    )}

                    {/* 2D WORLD MULTIMODAL VECTOR MAP SIMULATION CANVAS (1000 x 490) */}
                    <div className="relative w-full h-[490px] bg-slate-950/90 rounded-xl border border-blue-900/60 overflow-hidden shadow-inner select-none">
                        <svg viewBox="0 0 1000 490" className="w-full h-full">
                            <defs>
                                {/* Grid Background */}
                                <pattern id="simGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(30, 58, 138, 0.15)" strokeWidth="0.6" />
                                </pattern>

                                {/* Glowing Gradients */}
                                <linearGradient id="seaGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#F59E0B" />
                                    <stop offset="50%" stopColor="#38BDF8" />
                                    <stop offset="100%" stopColor="#10B981" />
                                </linearGradient>

                                <filter id="simGlow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            {/* Ocean Basin Background */}
                            <rect width="1000" height="490" fill="#0A1128" />
                            <rect width="1000" height="490" fill="url(#simGrid)" />

                            {/* Stylized World Landmass Vector Outlines */}
                            <g opacity="0.35">
                                {/* India East Coast Landmass (Left / Center) */}
                                <path
                                    d="M 50 0 L 580 0 L 550 55 L 530 90 L 505 125 L 480 165 L 450 205 L 420 245 L 405 280 L 380 315 L 345 355 L 325 395 L 310 430 L 250 465 L 180 490 L 0 490 L 0 0 Z"
                                    fill="#1E293B"
                                    stroke="#334155"
                                    strokeWidth="1.2"
                                />

                                {/* Australia / Indonesia Landmass (Right Side) */}
                                <path
                                    d="M 830 250 Q 910 280 970 310 L 1000 320 L 1000 490 L 880 490 Q 840 370 830 250 Z"
                                    fill="#1E293B"
                                    stroke="#334155"
                                    strokeWidth="1.2"
                                />
                            </g>


                            {/* ========================================================================= */}
                            {/* DEDICATED MULTIMODAL SHIPMENT SIMULATION */}
                            {/* (Sample defaults shown when no vessel booked; live data when booked) */}
                            {/* ========================================================================= */}
                            {(
                                <g id="dedicated-shipment-layer">
                                    {/* 1. FIRST-MILE ROAD CORRIDOR (MINE SIDING ➔ ORIGIN PORT) */}
                                    <g id="first-mile-route">
                                        <line
                                            x1={srcSiding.x}
                                            y1={srcSiding.y}
                                            x2={srcPort.x}
                                            y2={srcPort.y}
                                            stroke="#F59E0B"
                                            strokeWidth="3"
                                            strokeDasharray="5 3"
                                            filter="url(#simGlow)"
                                        />

                                        {/* Mine Siding Pin */}
                                        <circle cx={srcSiding.x} cy={srcSiding.y} r="6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                                        <text x={srcSiding.x - 8} y={srcSiding.y + 14} fontSize="8" fill="#FDE68A" fontWeight="bold" fontFamily="monospace" textAnchor="end">
                                            🏭 {srcSiding.name.split(",")[0]}
                                        </text>

                                        {/* Origin Port Pin */}
                                        <circle cx={srcPort.x} cy={srcPort.y} r="7" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
                                        <text x={srcPort.x + 10} y={srcPort.y + 3} fontSize="9" fill="#93C5FD" fontWeight="extrabold" fontFamily="monospace">
                                            ⚓ {srcPort.name}
                                        </text>
                                    </g>

                                    {/* 2. OCEAN SEA LANE SHIPPING ROUTE (ORIGIN PORT ➔ DESTINATION PORT) */}
                                    <g id="ocean-sea-route">
                                        <path
                                            d={oceanRoutePathD}
                                            fill="none"
                                            stroke="url(#seaGlowGrad)"
                                            strokeWidth="3.5"
                                            strokeDasharray="7 4"
                                            filter="url(#simGlow)"
                                        />

                                        {/* If Port Congested & Diverting: Alternate Path to Krishnapatnam */}
                                        {portCongestionActive && (
                                            <path
                                                d={congestedRoutePathD}
                                                fill="none"
                                                stroke="#EF4444"
                                                strokeWidth="2"
                                                strokeDasharray="4 4"
                                                opacity={portDiverted ? "0.3" : "0.9"}
                                            />
                                        )}

                                        {/* Scenario 1: Monsoon Swell Storm Ripples & Holding Zone */}
                                        {weatherDelayActive && (
                                            <g transform="translate(620, 240)">
                                                <circle cx="0" cy="0" r="28" fill="none" stroke="#F59E0B" strokeWidth="1.8">
                                                    <animate attributeName="r" values="12;45" dur="1.5s" repeatCount="indefinite" />
                                                    <animate attributeName="opacity" values="0.9;0" dur="1.5s" repeatCount="indefinite" />
                                                </circle>
                                                <circle cx="0" cy="0" r="9" fill="#F59E0B" opacity="0.3" />
                                                <text x="0" y="3" fontSize="8" fill="#FDE68A" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                                                    ⚠️ SWELL (+10H)
                                                </text>
                                            </g>
                                        )}
                                    </g>

                                    {/* SCENARIO 1: SECONDARY VESSEL (MV COASTAL PRIDE) SAILING TO EXACT SAME PORT */}
                                    {secondaryVessel?.visible && (
                                        <g id="scenario1-secondary-vessel">
                                            {!secondaryVessel.atBerth && !feederDeparting && (
                                                <g>
                                                    <path
                                                        d={`M ${targetPort.x + 160} ${targetPort.y + 110} Q ${targetPort.x + 80} ${targetPort.y + 50} ${targetPort.x + 22} ${targetPort.y + 10}`}
                                                        fill="none"
                                                        stroke="#38BDF8"
                                                        strokeWidth="2"
                                                        strokeDasharray="5 3"
                                                        opacity="0.8"
                                                    />
                                                    <circle cx={targetPort.x + 160} cy={targetPort.y + 110} r="4" fill="#38BDF8" />
                                                    <text x={targetPort.x + 166} y={targetPort.y + 114} fontSize="7" fill="#7DD3FC" fontFamily="monospace" fontWeight="bold">
                                                        Coastal Sea Channel
                                                    </text>
                                                </g>
                                            )}

                                            {feederDeparting && (
                                                <path
                                                    d={`M ${targetPort.x + 22} ${targetPort.y + 10} Q ${targetPort.x + 100} ${targetPort.y + 35} ${targetPort.x + 190} ${targetPort.y + 70}`}
                                                    fill="none"
                                                    stroke="#10B981"
                                                    strokeWidth="2"
                                                    strokeDasharray="4 4"
                                                    opacity="0.7"
                                                />
                                            )}

                                            <g
                                                transform={`translate(${secondaryVessel.x}, ${secondaryVessel.y}) rotate(${secondaryVessel.angle + 90})`}
                                                style={{ transition: isPlaying ? "transform 0.12s linear" : "none" }}
                                            >
                                                <circle
                                                    cx="0"
                                                    cy="0"
                                                    r="15"
                                                    fill={secondaryVessel.atBerth ? "rgba(245, 158, 11, 0.25)" : "rgba(56, 189, 248, 0.25)"}
                                                />
                                                <g transform="scale(0.65)">
                                                    <TopDownVesselIcon category="Supramax" size={24} />
                                                </g>
                                            </g>

                                            <g transform={`translate(${secondaryVessel.x + (secondaryVessel.atBerth ? 12 : 0)}, ${secondaryVessel.y - 18})`}>
                                                <rect
                                                    x="-68"
                                                    y="-10"
                                                    width="136"
                                                    height="18"
                                                    rx="4"
                                                    fill={secondaryVessel.atBerth ? "#78350F" : feederDeparting ? "#065F46" : "#0C4A6E"}
                                                    stroke={secondaryVessel.atBerth ? "#F59E0B" : feederDeparting ? "#34D399" : "#38BDF8"}
                                                    strokeWidth="1"
                                                    opacity="0.95"
                                                />
                                                <text x="0" y="2" fontSize="7" fill="#FFFFFF" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                                                    {secondaryVessel.stage === "APPROACHING" && `🚢 MV Coastal Pride (${Math.round(feederProgress)}%)`}
                                                    {secondaryVessel.stage === "AT_BERTH" && `⚓ MV Coastal Pride · Berth #2`}
                                                    {secondaryVessel.stage === "DEPARTING" && `✅ MV Coastal Pride Cleared`}
                                                </text>
                                            </g>

                                            {secondaryVessel.atBerth && !feederDeparting && (
                                                <g transform={`translate(${secondaryVessel.x}, ${secondaryVessel.y})`}>
                                                    <circle cx="0" cy="0" r="16" fill="none" stroke="#F59E0B" strokeWidth="1.5">
                                                        <animate attributeName="r" values="8;20" dur="1.2s" repeatCount="indefinite" />
                                                        <animate attributeName="opacity" values="1;0" dur="1.2s" repeatCount="indefinite" />
                                                    </circle>

                                                    <line x1="-10" y1="-6" x2="-10" y2="-18" stroke="#FBBF24" strokeWidth="2" strokeDasharray="2 2">
                                                        <animate attributeName="y2" values="-18;-12;-18" dur="0.9s" repeatCount="indefinite" />
                                                    </line>
                                                    <line x1="10" y1="-6" x2="10" y2="-18" stroke="#FBBF24" strokeWidth="2" strokeDasharray="2 2">
                                                        <animate attributeName="y2" values="-12;-18;-12" dur="0.9s" repeatCount="indefinite" />
                                                    </line>
                                                </g>
                                            )}
                                        </g>
                                    )}

                                    {/* EXACTLY ONE (1) Moving Truck for Coastal/Feeder Vessel Discharging to Angul Steel */}
                                    {feederTruck && (
                                        <g
                                            id="scenario1-feeder-single-truck"
                                            transform={`translate(${feederTruck.x}, ${feederTruck.y}) rotate(${feederTruck.angle})`}
                                            style={{ transition: isPlaying ? "transform 0.12s linear" : "none" }}
                                        >
                                            <circle cx="0" cy="0" r="9" fill="rgba(245, 158, 11, 0.35)" />
                                            <g transform="scale(0.6)">
                                                <TopDownTruckSvg size={20} horizontal={true} />
                                            </g>

                                            <g transform={`rotate(${-feederTruck.angle}) translate(0, 16)`}>
                                                <rect
                                                    x="-50"
                                                    y="-8"
                                                    width="100"
                                                    height="15"
                                                    rx="3"
                                                    fill="#1E293B"
                                                    stroke="#F59E0B"
                                                    strokeWidth="1"
                                                    opacity="0.95"
                                                />
                                                <text x="0" y="2.5" fontSize="6.5" fill="#FDE68A" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                                                    🚛 Angul Steel ({feederTruck.progress}%)
                                                </text>
                                            </g>
                                        </g>
                                    )}

                                    {/* 4. LAST-MILE ROAD CORRIDOR (DESTINATION PORT ➔ STEEL COMPLEX) */}
                                    <g id="last-mile-route">
                                        <line
                                            x1={targetPort.x}
                                            y1={targetPort.y}
                                            x2={targetPlant.x}
                                            y2={targetPlant.y}
                                            stroke="#10B981"
                                            strokeWidth="3"
                                            strokeDasharray="5 3"
                                            filter="url(#simGlow)"
                                        />

                                        {/* Steel Plant Node & Label */}
                                        <circle cx={targetPlant.x} cy={targetPlant.y} r="7" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                                        <g transform={`translate(${targetPlant.x - 12}, ${targetPlant.y + 4})`}>
                                            <rect x="-90" y="-8" width="90" height="15" rx="3" fill="#064E3B" stroke="#10B981" strokeWidth="0.8" opacity="0.9" />
                                            <text x="-45" y="2.5" fontSize="7" fill="#6EE7B7" fontWeight="extrabold" fontFamily="monospace" textAnchor="middle">
                                                🏢 {targetPlant.name.split(" ")[0]} Steel
                                            </text>
                                        </g>
                                    </g>

                                    {/* Vessel Docked at Destination Port once arrived */}
                                    {simProgress >= 75 && (
                                        <g transform={`translate(${targetPort.x + 5}, ${targetPort.y}) rotate(-90)`}>
                                            <g transform="scale(0.7)">
                                                <TopDownVesselIcon category={requirement?.selectedVessel?.category || "Panamax"} size={22} />
                                            </g>
                                            <rect x="12" y="-7" width="105" height="14" rx="3" fill="#0F172A" stroke="#06B6D4" strokeWidth="0.8" opacity="0.9" />
                                            <text x="64" y="3" fontSize="6.5" fill="#67E8F9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                                ⚓ {requirement?.selectedVessel?.name || "Vessel"} (At Port)
                                            </text>
                                        </g>
                                    )}

                                    {/* 5. REAL-TIME LIVE MOVING 2D ASSET (TOP-DOWN TRUCK OR SHIP) */}
                                    <g
                                        id="live-traveling-asset"
                                        transform={`translate(${asset.x}, ${asset.y}) rotate(${asset.angle + (asset.type === "TRUCK" ? 0 : 90)})`}
                                        style={{ transition: isPlaying ? "transform 0.15s linear" : "none" }}
                                    >
                                        <circle cx="0" cy="0" r="16" fill={asset.type === "TRUCK" ? "rgba(245, 158, 11, 0.3)" : weatherDelayActive && !berthReallocated ? "rgba(239, 68, 68, 0.55)" : "rgba(14, 165, 233, 0.35)"} />

                                        {asset.type === "TRUCK" ? (
                                            <g transform="scale(0.75)">
                                                <TopDownTruckSvg size={26} horizontal={true} />
                                            </g>
                                        ) : (
                                            <g transform="scale(0.75)">
                                                <TopDownVesselIcon category={requirement?.selectedVessel?.category || "Panamax"} size={24} />
                                            </g>
                                        )}
                                    </g>

                                    {/* Holding in Sea Floating Label */}
                                    {weatherDelayActive && !berthReallocated && (
                                        <g transform={`translate(${asset.x}, ${asset.y + 22})`}>
                                            <rect x="-80" y="-10" width="160" height="18" rx="4" fill="#991B1B" stroke="#F87171" strokeWidth="1" opacity="0.95" />
                                            <text x="0" y="2" fontSize="7" fill="#FFFFFF" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                                                ⚓ STOPPED IN SEA (SWELL WAIT)
                                            </text>
                                        </g>
                                    )}
                                </g>
                            )}

                            {/* 3. ALL 12 DESTINATION PORTS ON EAST COAST (CLEARLY DISPLAYED & STAGGERED) */}
                            <g id="dest-ports">
                                {Object.keys(DEST_NODES).map((dKey) => {
                                    const d = DEST_NODES[dKey];
                                    const isTarget = dKey === destKey;
                                    const isCongested = portCongestionActive && dKey === (requirement?.destinationPort || "Paradip");
                                    const isRight = d.labelSide === "right";
                                    const portTitle = d.name.replace(" Port", "").replace(" Dock Complex", "");

                                    return (
                                        <g key={dKey} transform={`translate(${d.x}, ${d.y})`}>
                                            {isTarget && hasBookedVessel && (
                                                <circle cx="0" cy="0" r="14" fill="none" stroke="#10B981" strokeWidth="1.5">
                                                    <animate attributeName="r" values="6;22" dur="1.4s" repeatCount="indefinite" />
                                                    <animate attributeName="opacity" values="1;0" dur="1.4s" repeatCount="indefinite" />
                                                </circle>
                                            )}

                                            <circle
                                                cx="0"
                                                cy="0"
                                                r={isTarget && hasBookedVessel ? "7" : "4.5"}
                                                fill={isCongested ? "#EF4444" : isTarget && hasBookedVessel ? "#10B981" : "#0284C7"}
                                                stroke="#FFFFFF"
                                                strokeWidth={isTarget && hasBookedVessel ? "1.8" : "1"}
                                            />

                                            {/* Port Name Badge */}
                                            <g transform={`translate(${isRight ? 9 : -9}, 0)`}>
                                                <rect
                                                    x={isRight ? 0 : -portTitle.length * 6.5 - 12}
                                                    y="-8"
                                                    width={portTitle.length * 6.5 + 12}
                                                    height="16"
                                                    rx="3"
                                                    fill="#0B132B"
                                                    fillOpacity="0.9"
                                                    stroke={isTarget && hasBookedVessel ? "#10B981" : isCongested ? "#EF4444" : "#334155"}
                                                    strokeWidth="0.8"
                                                />
                                                <text
                                                    x={isRight ? 6 : -6}
                                                    y="3.5"
                                                    fontSize="8.5"
                                                    fill={isCongested ? "#FCA5A5" : isTarget && hasBookedVessel ? "#6EE7B7" : "#E2E8F0"}
                                                    fontWeight={isTarget && hasBookedVessel ? "extrabold" : "bold"}
                                                    fontFamily="Manrope"
                                                    textAnchor={isRight ? "start" : "end"}
                                                >
                                                    {portTitle}
                                                </text>
                                            </g>
                                        </g>
                                    );
                                })}
                            </g>
                        </svg>

                        {/* Canvas Bottom Mini HUD */}
                        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700/80">
                            {simProgress >= 100 ? (
                                <div className="w-full flex items-center justify-between text-emerald-400 font-bold">
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 size={13} className="text-emerald-300" />
                                        Multimodal Transit Completed: Vessel arrived at {targetPort.name}, Truck delivered material to {targetPlant.name.split(" ")[0]} Plant!
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                                        VOYAGE COMPLETED & SETTLED
                                    </span>
                                </div>
                            ) : hasBookedVessel ? (
                                <>
                                    <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                                        <Truck size={12} /> 1. Siding: {srcSiding.name.split(",")[0]}
                                    </span>
                                    <ArrowRight size={10} className="text-slate-500" />
                                    <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                                        <Ship size={12} /> 2. Sea Lane: {requirement?.selectedVessel?.name} ({weatherDelayActive && !berthReallocated ? "Idle in Swell (0 kts)" : "13.8 kts"})
                                    </span>
                                    <ArrowRight size={10} className="text-slate-500" />
                                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                        <Building2 size={12} /> 3. Last-Mile: {targetPlant.name.split(" ")[0]} Steel Complex
                                    </span>
                                </>
                            ) : (
                                <div className="w-full flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                                        <Ship size={13} /> Sample Route: Newcastle → Paradip Port · Book a shipment to track your own vessel
                                    </span>
                                    <span className="text-amber-400 font-bold">
                                        Demo Mode · 74k MT Coal · Panamax · 13.8 kts
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Action / Scenario Trigger Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="text-xs text-blue-200 font-bold flex items-center gap-1.5">
                            <Sparkles size={14} className="text-amber-400" />
                            <span>
                                {hasBookedVessel
                                    ? "Interactive What-If Triggers (Click to see real-time 4-role reaction):"
                                    : "Live Fleet Radar Mode · Create a shipment booking to track your dedicated vessel:"}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {!hasBookedVessel ? (
                                <Link
                                    to="/new-requirement"
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md animate-pulse"
                                >
                                    <Sparkles size={14} className="text-amber-300" />
                                    <span>+ Book Shipment & Dispatch Dedicated Vessel</span>
                                </Link>
                            ) : (
                                <>
                                    <button
                                        onClick={triggerWeatherDelay}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${weatherDelayActive
                                                ? "bg-amber-500 text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-400/30"
                                                : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                                            }`}
                                    >
                                        <Zap size={14} className={weatherDelayActive ? "text-slate-950" : "text-amber-300"} />
                                        <span>⚡ Scenario 1: Swell Delay (+10h) ➔ Hold Sea & Swap Berth</span>
                                    </button>

                                    <button
                                        onClick={triggerPortCongestion}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${portCongestionActive
                                                ? "bg-red-600 text-white border-red-400 shadow-md ring-2 ring-red-400/30 animate-pulse"
                                                : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                                            }`}
                                    >
                                        <ShieldAlert size={14} className="text-red-300" />
                                        <span>🚨 Scenario 2: Port Congested ➔ Divert to Krishnapatnam</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* DYNAMIC SCENARIO NOTIFICATION BANNER 1: SWELL DELAY + VESSEL BERTH SWAP */}
            {weatherDelayActive && (
                <div className="astra-card p-4 bg-amber-50 border-2 border-amber-400 text-amber-950 flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 grid place-items-center shrink-0 font-bold">
                            <Zap size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-mono font-bold text-amber-800 uppercase flex items-center gap-2">
                                <span>SCENARIO 1 ACTIVE</span>
                                <span>·</span>
                                <span>
                                    {!berthReallocated
                                        ? (feederProgress < 100 ? "STAGE 1: MAIN VESSEL HOLDING · COASTAL VESSEL APPROACHING" : "STAGE 2: COASTAL VESSEL DOCKED · TRUCK DISPATCH ACTIVE")
                                        : "STAGE 3: BERTH CLEARED · MAIN VESSEL RESUMED"}
                                </span>
                            </div>
                            <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                                {!berthReallocated
                                    ? (feederProgress < 100
                                        ? `${requirement?.selectedVessel?.name || "MV Bengal Voyager"} is holding in Bay of Bengal (Swell Delay +10h). Coastal vessel MV Coastal Pride is sailing into ${destObj.name} Berth #2.`
                                        : `MV Coastal Pride is berthed at ${destObj.name} Berth #2. Quay cranes and inland road trucks are actively unloading cargo.`)
                                    : `MV Coastal Pride completed cargo turnaround and departed! Berth #2 is clear. ${requirement?.selectedVessel?.name || "MV Bengal Voyager"} has resumed sailing directly to ${destObj.name}.`}
                            </div>
                            <div className="text-xs text-amber-800 mt-0.5 font-mono">
                                {!berthReallocated
                                    ? (feederProgress < 100
                                        ? "Watch MV Coastal Pride sail into the destination port berth at a steady pace."
                                        : "Click below to authorize berth clearance so MV Coastal Pride departs and the main vessel can dock!")
                                    : "✓ Dynamic berth turnaround complete. Main vessel proceeding to Berth #2 with zero downtime!"}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {!berthReallocated ? (
                            <button
                                onClick={() => {
                                    approveBerthReallocation();
                                    toast.success("Berth #2 cleared! MV Coastal Pride departed. Main vessel MV Bengal Voyager resuming course.");
                                }}
                                className="px-4 py-2 rounded-md bg-blue-900 text-white text-xs font-bold shadow hover:bg-blue-800 transition-all flex items-center gap-1.5 animate-bounce"
                            >
                                <CheckCircle2 size={15} /> 1-Click Authorize Berth #2 Clearance & Resume Main Vessel
                            </button>
                        ) : (
                            <div className="text-right font-mono">
                                <span className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5">
                                    <CheckCircle2 size={15} /> BERTH CLEARED · MAIN VESSEL RESUMED & SAILING!
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* DYNAMIC SCENARIO NOTIFICATION BANNER 2: PORT CONGESTION */}
            {portCongestionActive && (
                <div className="astra-card p-4 bg-red-50 border-2 border-red-400 text-red-950 flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-600 text-white grid place-items-center shrink-0 font-bold">
                            <ShieldAlert size={18} />
                        </div>
                        <div>
                            <div className="text-xs font-mono font-bold text-red-800 uppercase">SCENARIO 2 ACTIVE · DESTINATION PORT HEAVY CONGESTION</div>
                            <div className="text-sm font-extrabold text-slate-900">
                                {requirement?.destinationPort || "Paradip"} Port queue reached 28 vessels (32+ hours wait time)!
                            </div>
                            <div className="text-xs text-red-800 mt-0.5">
                                ASTRA Solution: Divert vessel to <strong>Krishnapatnam Port Berth #4 (0 wait time)</strong> & auto-reroute 52 last-mile road trucks.
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {!portDiverted ? (
                            <button
                                onClick={() => { approvePortDiversion(); toast.success("Ship diverted to Krishnapatnam Berth #4 & 52 Trucks Rerouted! $38,400 Demurrage Saved."); }}
                                className="px-4 py-2 rounded-md bg-red-600 text-white text-xs font-bold shadow hover:bg-red-700 transition-all flex items-center gap-1.5 animate-bounce"
                            >
                                <Navigation size={15} /> 1-Click Authorize Port Diversion (Saves $38,400)
                            </button>
                        ) : (
                            <div className="text-right font-mono">
                                <span className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5">
                                    <ShieldCheck size={15} /> DIVERSION EXECUTED · 22 HOURS & $38,400 SAVED!
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* 4 SYNCHRONIZED STAKEHOLDER PROFILE CARDS (ONLY WHEN BOOKED) */}
            {/* ========================================================================= */}
            {hasBookedVessel && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Profile Card 1: Company / Cargo Owner */}
                        <div
                            onClick={() => nav("/new-requirement")}
                            className={`astra-card p-4 space-y-3 cursor-pointer transition-all border-t-4 ${user?.role === "company"
                                    ? "border-t-blue-900 ring-2 ring-blue-900/30 bg-blue-50/30 shadow-md"
                                    : "border-t-blue-900 bg-white hover:shadow-sm"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-blue-900 uppercase flex items-center gap-1.5">
                                    <span>1. CARGO OWNER</span>
                                    {user?.role === "company" && (
                                        <span className="px-1.5 py-0.2 rounded bg-blue-900 text-white text-[9px] font-black">
                                            YOU
                                        </span>
                                    )}
                                </span>
                                <Building2 size={16} className="text-blue-900" />
                            </div>
                            <div>
                                <div className="font-extrabold text-sm text-slate-900">Tata Steel Logistics</div>
                                <div className="text-xs text-slate-500 font-mono mt-0.5">{requirement?.cargoQuantity?.toLocaleString()} MT {requirement?.cargoType}</div>
                            </div>
                            <div className="space-y-1 font-mono text-[11px] pt-2 border-t border-slate-100">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Plan / Wh:</span>
                                    <span className="font-bold text-slate-900">{requirement?.planId || "PLAN-01"} · {requirement?.destinationWarehouseCode || "WH-07"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Landed Cost:</span>
                                    <span className="font-bold text-slate-900">${Number(requirement?.costBreakdown?.totalLandedCostUsd ?? 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">AI Savings:</span>
                                    <span className="font-bold text-emerald-600">+${Number(requirement?.costBreakdown?.netSavingsUsd ?? 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Card 2: Ocean Contractor */}
                        <div
                            onClick={() => nav("/contractor")}
                            className={`astra-card p-4 space-y-3 cursor-pointer transition-all border-t-4 ${user?.role === "contractor"
                                    ? "border-t-indigo-600 ring-2 ring-indigo-600/30 bg-indigo-50/30 shadow-md"
                                    : "border-t-indigo-600 bg-white hover:shadow-sm"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase flex items-center gap-1.5">
                                    <span>2. OCEAN CARRIER</span>
                                    {user?.role === "contractor" && (
                                        <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[9px] font-black">
                                            YOU
                                        </span>
                                    )}
                                </span>
                                <Ship size={16} className="text-indigo-600" />
                            </div>
                            <div>
                                <div className="font-extrabold text-sm text-slate-900">{requirement?.selectedVessel?.name}</div>
                                <div className="text-xs text-slate-500 font-mono mt-0.5">{requirement?.selectedContractor} · {requirement?.selectedVessel?.category}</div>
                            </div>
                            <div className="space-y-1 font-mono text-[11px] pt-2 border-t border-slate-100">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Engine Health:</span>
                                    <span className="font-bold text-emerald-700">{requirement?.selectedVessel?.engineEfficiency || "98.2%"} ({requirement?.selectedVessel?.ciiRating?.slice(0, 7) || "Grade A"})</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Speed / Burn:</span>
                                    <span className="font-bold text-slate-900">
                                        {weatherDelayActive && !berthReallocated ? "0.0 kts (Holding)" : "13.8 kts"} · {requirement?.selectedVessel?.dailyFuelBurn || "31.8 MT/d"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Card 3: Road Transporter */}
                        <div
                            onClick={() => nav("/road-logistics")}
                            className={`astra-card p-4 space-y-3 cursor-pointer transition-all border-t-4 ${user?.role === "road_transporter"
                                    ? "border-t-amber-500 ring-2 ring-amber-500/30 bg-amber-50/30 shadow-md"
                                    : "border-t-amber-500 bg-white hover:shadow-sm"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase flex items-center gap-1.5">
                                    <span>3. ROAD LOGISTICS</span>
                                    {user?.role === "road_transporter" && (
                                        <span className="px-1.5 py-0.2 rounded bg-amber-600 text-white text-[9px] font-black">
                                            YOU
                                        </span>
                                    )}
                                </span>
                                <Truck size={16} className="text-amber-500" />
                            </div>
                            <div>
                                <div className="font-extrabold text-sm text-slate-900">{requirement?.roadFleet?.transporterName}</div>
                                <div className="text-xs text-slate-500 font-mono mt-0.5">{(requirement?.roadFleet?.firstMileTrucks || 48) + (requirement?.roadFleet?.lastMileTrucks || 52)}x Multi-Axle Fleet</div>
                            </div>
                            <div className="space-y-1 font-mono text-[11px] pt-2 border-t border-slate-100">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Discharge Point:</span>
                                    <span className="font-bold text-blue-900">{portDiverted ? "Krishnapatnam Gate 2" : `${requirement?.destinationPort} Gate #3`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Gate Passes:</span>
                                    <span className="font-bold text-emerald-700">100% Synced FASTag</span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Card 4: Port Operator */}
                        <div
                            onClick={() => nav("/ports")}
                            className={`astra-card p-4 space-y-3 cursor-pointer transition-all border-t-4 ${user?.role === "port_operator"
                                    ? "border-t-emerald-600 ring-2 ring-emerald-600/30 bg-emerald-50/30 shadow-md"
                                    : "border-t-emerald-600 bg-white hover:shadow-sm"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase flex items-center gap-1.5">
                                    <span>4. PORT TERMINAL</span>
                                    {user?.role === "port_operator" && (
                                        <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-black">
                                            YOU
                                        </span>
                                    )}
                                </span>
                                <Anchor size={16} className="text-emerald-600" />
                            </div>
                            <div>
                                <div className="font-extrabold text-sm text-slate-900">{portDiverted ? "Krishnapatnam Port" : `${requirement?.destinationPort} Port Authority`}</div>
                                <div className="text-xs text-slate-500 font-mono mt-0.5">{portDiverted ? "Deepwater Berth #4" : "Mechanized Bulk Berth #2"}</div>
                            </div>
                            <div className="space-y-1 font-mono text-[11px] pt-2 border-t border-slate-100">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Berth Status:</span>
                                    <span className="font-bold text-emerald-700">
                                        {weatherDelayActive && !berthReallocated ? "Feeder Turnaround Active" : "Allocated & Ready"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Crane Pre-position:</span>
                                    <span className="font-bold text-slate-900">Crane #2 & #3 Synced</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ROLE-ADAPTIVE OPERATIONAL COCKPIT */}
                    <div className="astra-card p-5 bg-slate-900 text-white border border-slate-800 shadow-xl">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
                            <div className="flex items-center gap-2.5">
                                <Sparkles size={18} className="text-amber-400" />
                                <div>
                                    <span className="text-[10px] font-mono uppercase text-blue-300 font-bold tracking-wider">
                                        ROLE-ADAPTIVE OPERATIONAL COCKPIT
                                    </span>
                                    <h3 className="text-base font-extrabold text-white">
                                        {user?.role === "company" && "Shipper Command: AI Plan 01 Execution & Warehouse Matrix"}
                                        {user?.role === "contractor" && "Carrier Command: Charter Fixture Diagnostics & Vessel Health"}
                                        {user?.role === "road_transporter" && "Inland Command: Road Fleet Telemetry & Exception Engine"}
                                        {user?.role === "port_operator" && "Quayside Command: 4-Stage Terminal Manifest & Berth Turnaround"}
                                    </h3>
                                </div>
                            </div>

                            <span className="px-3 py-1 rounded-full bg-white/10 text-white font-mono text-xs font-bold border border-white/20">
                                Corridor ID: {requirement?.id || "ASTRA-REQ-001"}
                            </span>
                        </div>

                        {/* Company Cockpit */}
                        {user?.role === "company" && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-slate-400 text-[10px]">SELECTED PLAN</span>
                                    <div className="text-base font-bold text-amber-400 mt-0.5">{requirement?.planId || "PLAN-01"} (Recommended)</div>
                                    <div className="text-[10px] text-slate-400 mt-1">Tata NYK + MV Bengal Voyager</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-slate-400 text-[10px]">DESTINATION WAREHOUSE</span>
                                    <div className="text-base font-bold text-emerald-400 mt-0.5">{requirement?.warehouseSuitability?.code || "WH-07"} (98% Suitability)</div>
                                    <div className="text-[10px] text-slate-400 mt-1">{requirement?.destinationWarehouse || "Angul Steel Complex"} (82 km)</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-slate-400 text-[10px]">TOTAL LANDED COST</span>
                                    <div className="text-base font-bold text-white mt-0.5">${Number(requirement?.costBreakdown?.totalLandedCostUsd || 1319000).toLocaleString()}</div>
                                    <div className="text-[10px] text-emerald-400 mt-1">Saved ${Number(requirement?.costBreakdown?.netSavingsUsd || 62400).toLocaleString()} vs Spot</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex flex-col justify-between">
                                    <span className="text-slate-400 text-[10px]">CORRIDOR CONTROLS</span>
                                    <Link to="/new-requirement" className="btn-primary justify-center h-8 text-[11px] font-bold mt-1">
                                        Re-evaluate Plans / Warehouses
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Contractor Cockpit */}
                        {user?.role === "contractor" && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-slate-400 text-[10px]">ASSIGNED VESSEL</span>
                                    <div className="text-base font-bold text-indigo-300 mt-0.5">{requirement?.selectedVessel?.name}</div>
                                    <div className="text-[10px] text-slate-400 mt-1">{requirement?.selectedVessel?.dwt?.toLocaleString()} DWT · {requirement?.selectedVessel?.category}</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-slate-400 text-[10px]">HEALTH & RIGHTSHIP</span>
                                    <div className="text-base font-bold text-emerald-400 mt-0.5">{requirement?.selectedVessel?.healthScore || 96.8}/100 · 5-Star</div>
                                    <div className="text-[10px] text-slate-400 mt-1">CII: {requirement?.selectedVessel?.ciiRating || "Grade A (Eco-Bulker)"}</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-slate-400 text-[10px]">CHARTER FREIGHT REVENUE</span>
                                    <div className="text-base font-bold text-white mt-0.5">${Number(requirement?.costBreakdown?.oceanFreightTotalUsd || 1183000).toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-400 mt-1">Rate: ${requirement?.costBreakdown?.oceanFreightRatePerTon || 16.90}/MT</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex flex-col justify-between">
                                    <span className="text-slate-400 text-[10px]">FIXTURE ACTIONS</span>
                                    <Link to="/contractor" className="btn-primary justify-center h-8 text-[11px] font-bold mt-1 bg-indigo-600 hover:bg-indigo-700">
                                        Open Contractor Fixtures Drawer
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Road Transporter Cockpit */}
                        {user?.role === "road_transporter" && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-slate-400 text-[10px]">FLEET DISPATCH</span>
                                    <div className="text-base font-bold text-amber-400 mt-0.5">100 Multi-Axle Trucks</div>
                                    <div className="text-[10px] text-slate-400 mt-1">48 First-Mile + 52 Last-Mile</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-slate-400 text-[10px]">INLAND TELEMETRY</span>
                                    <div className="text-base font-bold text-emerald-400 mt-0.5">Intugine FASTag / GPS Active</div>
                                    <div className="text-[10px] text-slate-400 mt-1">100% Digital QR Gate Clearance</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-slate-400 text-[10px]">PRIMARY CORRIDOR</span>
                                    <div className="text-base font-bold text-white mt-0.5">NH-53 Heavy Industrial</div>
                                    <div className="text-[10px] text-slate-400 mt-1">Paradip ➔ Angul Complex (82 km)</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex flex-col justify-between">
                                    <span className="text-slate-400 text-[10px]">DISPATCH ACTIONS</span>
                                    <Link to="/road-logistics" className="btn-primary justify-center h-8 text-[11px] font-bold mt-1 bg-amber-600 hover:bg-amber-700">
                                        Launch Inland Control Center
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Port Operator Cockpit */}
                        {user?.role === "port_operator" && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-slate-400 text-[10px]">QUAYSIDE BERTH #2</span>
                                    <div className="text-base font-bold text-emerald-400 mt-0.5">Mechanized Coal Jetty</div>
                                    <div className="text-[10px] text-slate-400 mt-1">Cranes #2 & #3 Synced</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-slate-400 text-[10px]">4-STAGE MANIFEST</span>
                                    <div className="text-base font-bold text-white mt-0.5">3 Incoming · 3 Anchorage</div>
                                    <div className="text-[10px] text-slate-400 mt-1">4 Active Berths · 2 Departures</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-slate-400 text-[10px]">TURNAROUND SLA</span>
                                    <div className="text-base font-bold text-amber-400 mt-0.5">28.0 Hours / Vessel</div>
                                    <div className="text-[10px] text-slate-400 mt-1">Mechanized grab unloaders online</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex flex-col justify-between">
                                    <span className="text-slate-400 text-[10px]">TERMINAL ACTIONS</span>
                                    <Link
                                        to="/port-intelligence"
                                        className="btn-primary justify-center h-8 text-[11px] font-bold mt-1 bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        Berth Management
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* EAST COAST MARITIME & INLAND LOGISTICS MAP */}
            {/* ========================================================================= */}
            <div className="astra-card p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <div>
                        <div className="text-xs uppercase font-mono font-bold text-blue-900">LIVE GEOSPATIAL RADAR</div>
                        <h3 className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                            Bay of Bengal Multimodal Corridor & East Coast Ports
                        </h3>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-blue-900" />
                            <span>Panamax Vessel ({requirement?.selectedVessel?.name || "MV Bengal Voyager"})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span>Road Fleet Feeders</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span>East Coast Terminals</span>
                        </div>
                    </div>
                </div>

                <div className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <EastCoastMap
                        originPort={requirement?.originPort || "Singapore"}
                        activePort={requirement?.destinationPort || "Dhamra"}
                        highlightedPorts={[requirement?.destinationPort || "Dhamra", "Krishnapatnam", "Visakhapatnam"]}
                        showRoute={hasActiveBooking}
                    />
                </div>
            </div>
        </div>
    );
}
