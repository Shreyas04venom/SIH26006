import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import TopDownVesselIcon, { TopDownTruckSvg } from "../components/VesselIcons";
import { useFlow } from "../lib/flow";
import { useAuth } from "../lib/auth";
import { 
  ResponsiveContainer, ComposedChart, Line, Area, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid, Cell, ReferenceLine 
} from "recharts";
import { 
  Ship, TrendingUp, Anchor, CheckCircle2, ArrowRight, ArrowLeft, 
  Sparkles, ShieldCheck, HeartPulse, Truck, Factory, MapPin, 
  Award, Clock, DollarSign, FileCheck, Layers, AlertTriangle, Calendar, Sliders, Info,
  BarChart3, LineChart as LineIcon, PieChart as PieIcon, Cpu, Printer, Download, FileText, Building2
} from "lucide-react";
import { toast } from "sonner";

// 12 Major East Coast of India Deepwater & Major Ports
const EAST_COAST_DESTINATIONS = [
  { port: "Paradip", state: "Odisha", maxDraft: 14.5, maxLoa: 260, maxBeam: 40, plant: "Angul Integrated Steel Complex", waitHours: 12, congestion: "Low" },
  { port: "Visakhapatnam", state: "Andhra Pradesh", maxDraft: 16.5, maxLoa: 280, maxBeam: 45, plant: "Vizag Steel & Energy Plant", waitHours: 16, congestion: "Medium" },
  { port: "Haldia", state: "West Bengal", maxDraft: 9.0, maxLoa: 200, maxBeam: 32, plant: "Durgapur Steel Hub", waitHours: 32, congestion: "High" },
  { port: "Krishnapatnam", state: "Andhra Pradesh", maxDraft: 18.0, maxLoa: 320, maxBeam: 50, plant: "Ballari Metal Siding", waitHours: 4, congestion: "Low" },
  { port: "Chennai", state: "Tamil Nadu", maxDraft: 14.0, maxLoa: 250, maxBeam: 38, plant: "Sri City Manufacturing Zone", waitHours: 20, congestion: "Medium" },
  { port: "Dhamra", state: "Odisha", maxDraft: 18.0, maxLoa: 320, maxBeam: 48, plant: "Kalinganagar Industrial Hub", waitHours: 10, congestion: "Low" },
  { port: "Gangavaram", state: "Andhra Pradesh", maxDraft: 18.5, maxLoa: 330, maxBeam: 52, plant: "Raipur Sponge Iron Complex", waitHours: 14, congestion: "Medium" },
  { port: "Ennore (Kamarajar)", state: "Tamil Nadu", maxDraft: 15.0, maxLoa: 270, maxBeam: 42, plant: "North Chennai Thermal Station", waitHours: 18, congestion: "Medium" },
  { port: "Kakinada", state: "Andhra Pradesh", maxDraft: 12.5, maxLoa: 230, maxBeam: 36, plant: "Rajahmundry Industrial Belt", waitHours: 22, congestion: "High" },
  { port: "Tuticorin (V.O.C)", state: "Tamil Nadu", maxDraft: 14.0, maxLoa: 240, maxBeam: 38, plant: "Madurai Logistics Park", waitHours: 12, congestion: "Low" },
  { port: "Gopalpur", state: "Odisha", maxDraft: 13.5, maxLoa: 225, maxBeam: 34, plant: "Tata Steel SEZ Gopalpur", waitHours: 8, congestion: "Low" },
  { port: "Kolkata (SMP)", state: "West Bengal", maxDraft: 8.5, maxLoa: 190, maxBeam: 30, plant: "Howrah Heavy Foundry", waitHours: 36, congestion: "High" },
];

const ORIGIN_OPTIONS = [
  { port: "Newcastle", country: "Australia", warehouse: "Hunter Valley Coal Mine Siding, NSW", distNm: 5080 },
  { port: "Taboneo", country: "Indonesia", warehouse: "South Kalimantan Open-Cast Siding", distNm: 2280 },
  { port: "Richards Bay", country: "South Africa", warehouse: "Mpumalanga Coal Terminal Siding", distNm: 4680 },
  { port: "Singapore", country: "Singapore", warehouse: "Jurong Island Transshipment Yard", distNm: 1540 },
  { port: "Port Hedland", country: "Australia", warehouse: "Pilbara Iron Siding, WA", distNm: 3650 },
];

// Exact Physical Specifications for all 5 Vessel Categories (DWT, Beam, LOA, Draft)
const VESSEL_SPECS = {
  Handysize: {
    dwt: 35000,
    avgPayload: 35000,
    beam: 28.0,
    loa: 180,
    draft: 10.0,
    speedKnots: 13.0,
    desc: "15k–39k DWT · Max Beam 28m · Max LOA 180m · Draft 10m",
    ratePerTon: 22.50,
    demurrage: 950
  },
  Supramax: {
    dwt: 58000,
    avgPayload: 55000,
    beam: 32.2,
    loa: 200,
    draft: 12.5,
    speedKnots: 14.0,
    desc: "40k–65k DWT · Max Beam 32.2m · Max LOA 200m · Draft 12.5m",
    ratePerTon: 18.40,
    demurrage: 1100
  },
  Panamax: {
    dwt: 74000,
    avgPayload: 70000,
    beam: 32.2,
    loa: 225,
    draft: 13.8,
    speedKnots: 14.2,
    desc: "65k–85k DWT · Max Beam 32.2m · Max LOA 225m · Draft 13.8m",
    ratePerTon: 16.90,
    demurrage: 1200
  },
  Capesize: {
    dwt: 180000,
    avgPayload: 160000,
    beam: 45.0,
    loa: 300,
    draft: 18.2,
    speedKnots: 14.5,
    desc: "100k–200k DWT · Max Beam 45m · Max LOA 300m · Draft 18.2m",
    ratePerTon: 11.40,
    demurrage: 1800
  },
  VLOC: {
    dwt: 320000,
    avgPayload: 300000,
    beam: 55.0,
    loa: 340,
    draft: 21.5,
    speedKnots: 14.5,
    desc: "200k–400k DWT · Very Large Ore Carrier (VLOC / Valemax) · Draft 21.5m",
    ratePerTon: 9.20,
    demurrage: 2400
  }
};

export default function NewRequirement() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { setRequirement, setSelectedVessel, setIsPlaying, setSimProgress, addEvent } = useFlow();

  const [step, setStep] = useState(1);

  // Form State: Parameters in Step 1 (Company input) - Unselected by default
  const [companyName, setCompanyName] = useState(user?.name || "");
  const [cargoType, setCargoType] = useState("");
  const [cargoQuantity, setCargoQuantity] = useState("");
  const [originPort, setOriginPort] = useState("");
  const [destPort, setDestPort] = useState("");
  
  // Delivery & Contract Structure Parameters
  const todayStr = new Date().toISOString().split("T")[0];
  const [contractDuration, setContractDuration] = useState("1 voyage (Spot)");
  const [requiredArrivalDate, setRequiredArrivalDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [expectedVoyages, setExpectedVoyages] = useState(1);
  // Logistics Operator Strategy: "single" (Turnkey / Same at Origin & Destination) vs "multiple" (Specialized Leg-by-Leg Split)
  const [logisticsModel, setLogisticsModel] = useState("single");

  // Automatically predict best vessel size class based on East Coast port draft and cargo volume
  const predictedVesselCategory = useMemo(() => {
    const portInfo = EAST_COAST_DESTINATIONS.find(d => d.port === destPort) || EAST_COAST_DESTINATIONS[0];
    const qty = Math.max(1000, Number(cargoQuantity) || 70000);
    const isSpot = contractDuration === "1 voyage (Spot)";
    const voyages = isSpot ? 1 : Math.max(1, expectedVoyages);
    const parcelSize = Math.round(qty / voyages);
    const portDraft = portInfo.maxDraft;
    const portLoa = portInfo.maxLoa;

    // 1. Ultra-high parcel volumes (200k+ MT) strictly require Very Large Ore Carrier (VLOC / Valemax)
    if (parcelSize >= 200000) {
      return "VLOC";
    }

    // 2. Heavy bulk parcels (95,000 MT to 199,999 MT, such as 150k MT preset) predict Capesize
    if (parcelSize >= 95000 || (!isSpot && qty >= 250000 && parcelSize >= 85000)) {
      return "Capesize";
    }

    // 3. Draft & river fairway restrictions for smaller parcels
    if (portDraft < 10.5 || portLoa < 205) {
      return "Handysize";
    } else if (portDraft < 13.8 || portLoa < 235) {
      return parcelSize <= 38000 ? "Handysize" : "Supramax";
    } else {
      if (parcelSize <= 40000) return "Handysize";
      if (parcelSize <= 62000) return "Supramax";
      return "Panamax";
    }
  }, [destPort, cargoQuantity, contractDuration, expectedVoyages]);

  const preferredVesselCategory = predictedVesselCategory;

  const handleArrivalDateChange = (val) => {
    if (val < todayStr) {
      setRequiredArrivalDate(todayStr);
      toast.warning("Arrival date cannot be in the past. Automatically set to current date.");
    } else {
      setRequiredArrivalDate(val);
    }
  };

  // Strategy Preferences
  const [budgetPreference, setBudgetPreference] = useState("Balanced");
  const [riskTolerance, setRiskTolerance] = useState("Low (Avoid high-wait berths)");

  // AI Vessel Class Prediction Result (minimal state)
  const [aiPredictionResult, setAiPredictionResult] = useState(null);

  // AI Vessel Optimization Engine: Evaluates Sections 2 (Commodity, Qty, Ports) & 3 (Laycan, SLA, Contract)
  const handleAiVesselPredict = () => {
    const portInfo = EAST_COAST_DESTINATIONS.find(d => d.port === destPort) || EAST_COAST_DESTINATIONS[0];
    const originInfo = ORIGIN_OPTIONS.find(o => o.port === originPort) || ORIGIN_OPTIONS[0];
    const qty = Math.max(1000, Number(cargoQuantity) || 70000);
    const isSpot = contractDuration === "1 voyage (Spot)";
    const voyages = isSpot ? 1 : Math.max(1, expectedVoyages);
    const parcelSize = Math.round(qty / voyages);

    const portDraft = portInfo.maxDraft;
    const portLoa = portInfo.maxLoa;
    const distNm = originInfo.distNm || 5000;

    let chosenCategory = "Panamax";
    let rationale = "";

    // 1. CARGO PARCEL VOLUME & VESSEL CLASS DETERMINATION
    if (parcelSize >= 200000) {
      chosenCategory = "VLOC";
      rationale = `Very Large Ore Carrier (VLOC / Valemax 320k DWT) selected: Maximum economies of scale for ultra-heavy ${parcelSize.toLocaleString()} MT parcel at lowest benchmark freight ($9.20/t). ${portDraft < 21.0 ? `Note: Discharge at ${portInfo.port} (${portDraft}m draft) utilizes offshore deepwater transshipment / lightering.` : `Direct deepwater channel clearance at ${portInfo.port}.`}`;
    } else if (parcelSize >= 95000 || (!isSpot && qty >= 250000 && parcelSize >= 85000)) {
      chosenCategory = "Capesize";
      rationale = `Capesize (160k MT payload) selected: Optimal efficiency for ${parcelSize.toLocaleString()} MT cargo at $11.40/t. ${portDraft < 17.5 ? `Note: Berthing at ${portInfo.port} (${portDraft}m draft) supported via deepwater outer roads / lightering.` : `Direct deepwater berthing at ${portInfo.port} (${portDraft}m draft).`}`;
    } else if (portDraft < 10.5 || portLoa < 205) {
      // Shallow riverine ports (Kolkata 8.5m, Haldia 9.0m)
      chosenCategory = "Handysize";
      if (parcelSize > 40000) {
        rationale = `Handysize selected: ${portInfo.port}'s shallow ${portDraft}m draft restricts Supramax/Panamax (12.5m/13.8m); parcel must be split into ~35k MT loads to avoid grounding.`;
      } else {
        rationale = `Handysize (35k MT payload) selected: Matches ${qty.toLocaleString()} MT parcel and safely navigates ${portInfo.port}'s shallow ${portDraft}m river draft.`;
      }
    } else if (portDraft < 13.8 || portLoa < 235) {
      // Intermediate draft ports (Kakinada 12.5m, Gopalpur 13.5m)
      if (parcelSize <= 38000) {
        chosenCategory = "Handysize";
        rationale = `Handysize (35k MT) selected: Perfectly sized for ${parcelSize.toLocaleString()} MT without deadfreight, safely clearing ${portInfo.port}'s ${portDraft}m draft.`;
      } else {
        chosenCategory = "Supramax";
        rationale = `Supramax (55k MT payload) selected: Maximum allowable class for ${portInfo.port}'s ${portDraft}m draft; Panamax (13.8m) exceeds draft limits.`;
      }
    } else {
      // Standard East Coast ports (Paradip 14.5m, Ennore 15m, Vizag 16.5m, Chennai 14m, Tuticorin 14m)
      if (parcelSize <= 40000) {
        chosenCategory = "Handysize";
        rationale = `Handysize (35k MT payload) selected: Exactly fits ${parcelSize.toLocaleString()} MT parcel, preventing deadfreight on underfilled holds.`;
      } else if (parcelSize <= 62000) {
        chosenCategory = "Supramax";
        rationale = `Supramax (55k MT payload) selected: Optimal capacity utilization for ${parcelSize.toLocaleString()} MT at ${portInfo.port} (${portDraft}m draft).`;
      } else {
        chosenCategory = "Panamax";
        rationale = `Panamax (70k MT payload) selected: Highest freight efficiency ($16.90/t) for ${parcelSize.toLocaleString()} MT, safely clearing ${portInfo.port}'s ${portDraft}m draft.`;
      }
    }

    // 2. SLA & TRANSIT TIME FEASIBILITY CHECK
    const vesselSpeed = VESSEL_SPECS[chosenCategory].speedKnots || 14.0;
    const transitDays = Math.ceil(distNm / (vesselSpeed * 24)) + 1; // +1 day clearance/pilotage
    const today = new Date(todayStr);
    const laycan = new Date(requiredArrivalDate);
    const daysAvailable = Math.max(0, Math.round((laycan.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    if (daysAvailable < transitDays) {
      rationale += ` • ⚠️ Laycan tight: ${originPort} transit takes ~${transitDays}d vs ${daysAvailable}d available.`;
    } else {
      rationale += ` • SLA on track: ~${transitDays}d sailing from ${originPort} meets ${daysAvailable}d laycan.`;
    }

    setPreferredVesselCategory(chosenCategory);

    setAiPredictionResult({ 
      category: chosenCategory, 
      rationale,
      parcelSize,
      transitDays,
      daysAvailable
    });
    toast.success(`AI Selected ${chosenCategory} for ${qty.toLocaleString()} MT ${cargoType} to ${destPort}.`);
  };

  // 1. Manual Vessel Category Selection: Preserves user's custom cargo quantity so AI can evaluate true cargo intent
  const handleVesselCategoryChange = (vcat) => {
    setPreferredVesselCategory(vcat);
    const spec = VESSEL_SPECS[vcat];
    if (contractDuration === "1 voyage (Spot)") {
      setExpectedVoyages(1);
    } else {
      // For Period / COA contracts, recalculate voyage count needed based on vessel capacity
      const trips = Math.max(1, Math.ceil((cargoQuantity || spec.avgPayload) / spec.avgPayload));
      setExpectedVoyages(trips);
    }
  };

  // 2. Dynamic auto-adjustment: When Contract Duration changes
  const handleContractDurationChange = (cdur) => {
    setContractDuration(cdur);
    const spec = VESSEL_SPECS[preferredVesselCategory];
    if (cdur === "1 voyage (Spot)") {
      setExpectedVoyages(1);
    } else if (cdur === "3 months Period") {
      setExpectedVoyages(Math.max(2, Math.ceil(cargoQuantity / spec.avgPayload)));
    } else if (cdur === "6 months COA") {
      setExpectedVoyages(Math.max(4, Math.ceil(cargoQuantity / spec.avgPayload)));
    } else if (cdur === "12 months COA") {
      setExpectedVoyages(Math.max(8, Math.ceil(cargoQuantity / spec.avgPayload)));
    }
  };

  // 3. Dynamic auto-adjustment & validation: When Cargo Quantity changes (unclamped so AI can evaluate actual user intent)
  const handleQuantityChange = (qty) => {
    const rawVal = qty === "" ? "" : Math.max(0, Number(qty));
    setCargoQuantity(rawVal);
    const num = Number(qty) || 0;
    if (contractDuration !== "1 voyage (Spot)") {
      const spec = VESSEL_SPECS[preferredVesselCategory];
      setExpectedVoyages(Math.max(1, Math.ceil(Math.max(1000, num) / spec.avgPayload)));
    }
  };

  // Auto-inferred Hinterlands
  const activeOrigin = ORIGIN_OPTIONS.find(o => o.port === originPort) || ORIGIN_OPTIONS[0];
  const activeDest = EAST_COAST_DESTINATIONS.find(d => d.port === destPort) || EAST_COAST_DESTINATIONS[0];
  const currentSpec = VESSEL_SPECS[preferredVesselCategory];

  // Real-time verification of vessel selection against physical port limits and cargo volume
  const getVesselCompatibilityCheck = () => {
    const spec = VESSEL_SPECS[preferredVesselCategory] || VESSEL_SPECS.Panamax;
    const dest = activeDest || EAST_COAST_DESTINATIONS[0];
    const isDraftExceeded = spec.draft > dest.maxDraft;
    const isLoaExceeded = spec.loa > dest.maxLoa;
    const isSpot = contractDuration === "1 voyage (Spot)";
    const qty = Number(cargoQuantity) || 0;

    let warning = null;
    if (qty <= 0) {
      warning = "Cargo quantity is 0 MT! Commercial vessel fixture cannot proceed without cargo payload (min 1,000 MT).";
      return { isDraftExceeded: false, isLoaExceeded: false, isOvercapacity: false, isUnderutilized: false, warning };
    } else if (qty < 1000) {
      warning = "Parcel volume is below the 1,000 MT commercial minimum for dry-bulk chartering.";
      return { isDraftExceeded: false, isLoaExceeded: false, isOvercapacity: false, isUnderutilized: false, warning };
    }

    const isOvercapacity = isSpot && cargoQuantity > spec.dwt;
    const isUnderutilized = isSpot && cargoQuantity < spec.avgPayload * 0.45;

    if (isDraftExceeded) {
      warning = `${preferredVesselCategory} draft (${spec.draft}m) exceeds ${destPort}'s max allowable depth (${dest.maxDraft}m). Vessel cannot berth safely!`;
    } else if (isLoaExceeded) {
      warning = `${preferredVesselCategory} LOA (${spec.loa}m) exceeds ${destPort}'s berth length (${dest.maxLoa}m).`;
    } else if (isOvercapacity) {
      warning = `Cargo (${Number(cargoQuantity).toLocaleString()} MT) exceeds ${preferredVesselCategory} max capacity (${spec.dwt.toLocaleString()} MT).`;
    } else if (isUnderutilized) {
      warning = `Cargo (${Number(cargoQuantity).toLocaleString()} MT) significantly underfills ${preferredVesselCategory} (~${spec.avgPayload.toLocaleString()} MT), incurring deadfreight.`;
    }

    return { isDraftExceeded, isLoaExceeded, isOvercapacity, isUnderutilized, warning };
  };

  // ==========================================
  // WAREHOUSE SELECTION & SUITABILITY REGISTRY
  // ==========================================
  const DEST_WAREHOUSES = {
    Paradip: [
      { code: "WH-07", name: "Angul Integrated Steel Complex", distanceKm: 82, transitHours: 3.1, capacityTons: 150000, utilizationPct: 68, inlandFreightUsd: 4.80, risk: "LOW", score: 98, mode: "NH-53 Road Truck", truckSlots: 120 },
      { code: "WH-12", name: "Kalinganagar Industrial Hub", distanceKm: 104, transitHours: 4.2, capacityTons: 120000, utilizationPct: 82, inlandFreightUsd: 5.60, risk: "MEDIUM", score: 88, mode: "Industrial Road/Rail", truckSlots: 85 },
      { code: "WH-03", name: "Rourkela Steel Siding Complex", distanceKm: 285, transitHours: 8.5, capacityTons: 200000, utilizationPct: 54, inlandFreightUsd: 11.20, risk: "MEDIUM", score: 79, mode: "Freight Rail / Truck", truckSlots: 140 },
      { code: "WH-09", name: "Choudwar Power & Coal Silo", distanceKm: 96, transitHours: 3.8, capacityTons: 80000, utilizationPct: 91, inlandFreightUsd: 5.20, risk: "HIGH", score: 62, mode: "Road Haulage", truckSlots: 45 }
    ],
    Visakhapatnam: [
      { code: "WH-21", name: "Vizag Steel & Energy Plant (RINL)", distanceKm: 18, transitHours: 0.8, capacityTons: 220000, utilizationPct: 62, inlandFreightUsd: 1.90, risk: "LOW", score: 99, mode: "Dedicated Conveyor / Tipper", truckSlots: 150 },
      { code: "WH-28", name: "Gajuwaka Multimodal Logistics Park", distanceKm: 24, transitHours: 1.2, capacityTons: 95000, utilizationPct: 75, inlandFreightUsd: 2.80, risk: "LOW", score: 91, mode: "6-Lane Bypass Road", truckSlots: 110 },
      { code: "WH-25", name: "Raipur Sponge Iron Complex", distanceKm: 520, transitHours: 14.0, capacityTons: 180000, utilizationPct: 58, inlandFreightUsd: 16.50, risk: "MEDIUM", score: 74, mode: "Heavy Freight Rail", truckSlots: 90 }
    ],
    Dhamra: [
      { code: "WH-31", name: "Kalinganagar Industrial Hub Siding", distanceKm: 118, transitHours: 4.0, capacityTons: 180000, utilizationPct: 55, inlandFreightUsd: 5.10, risk: "LOW", score: 97, mode: "Expressway & Rail", truckSlots: 130 },
      { code: "WH-34", name: "Tata Steel Jamshedpur Stockyard", distanceKm: 295, transitHours: 8.5, capacityTons: 250000, utilizationPct: 72, inlandFreightUsd: 10.20, risk: "LOW", score: 90, mode: "Freight Rail (BOXN)", truckSlots: 160 }
    ],
    Haldia: [
      { code: "WH-41", name: "Durgapur Steel Hub Depot", distanceKm: 210, transitHours: 7.0, capacityTons: 140000, utilizationPct: 84, inlandFreightUsd: 11.40, risk: "HIGH", score: 81, mode: "NH-19 Multi-Axle", truckSlots: 70 },
      { code: "WH-43", name: "Kharagpur Freight Logistics Yard", distanceKm: 135, transitHours: 4.8, capacityTons: 90000, utilizationPct: 70, inlandFreightUsd: 7.80, risk: "MEDIUM", score: 86, mode: "Rail / Road", truckSlots: 80 }
    ],
    Krishnapatnam: [
      { code: "WH-51", name: "Ballari Metal & Thermal Siding", distanceKm: 340, transitHours: 9.2, capacityTons: 210000, utilizationPct: 52, inlandFreightUsd: 12.80, risk: "LOW", score: 95, mode: "Dedicated Rail Corridor", truckSlots: 140 },
      { code: "WH-53", name: "Nellore Power & Logistics Siding", distanceKm: 35, transitHours: 1.2, capacityTons: 110000, utilizationPct: 60, inlandFreightUsd: 2.90, risk: "LOW", score: 94, mode: "Port Highway Corridor", truckSlots: 95 }
    ]
  };

  const getCandidateWarehouses = () => {
    return DEST_WAREHOUSES[destPort] || [
      { code: "WH-01", name: `${destPort} Primary Regional Stockyard`, distanceKm: 45, transitHours: 1.8, capacityTons: 100000, utilizationPct: 65, inlandFreightUsd: 3.50, risk: "LOW", score: 92, mode: "State Highway", truckSlots: 80 },
      { code: "WH-02", name: `${destPort} Inland Commodity Terminal`, distanceKm: 110, transitHours: 4.0, capacityTons: 85000, utilizationPct: 78, inlandFreightUsd: 6.20, risk: "MEDIUM", score: 82, mode: "Rail Siding", truckSlots: 60 }
    ];
  };

  const candidateWarehousesList = getCandidateWarehouses();

  // =========================================================================
  // AI EXECUTION RECOMMENDATIONS: PLAN 01, PLAN 02, PLAN 03
  // =========================================================================
  const getExecutionPlans = () => {
    const vcat = preferredVesselCategory;
    const spec = VESSEL_SPECS[vcat];
    const wh1 = candidateWarehousesList[0];
    const wh2 = candidateWarehousesList[1] || wh1;
    const wh3 = candidateWarehousesList[2] || wh1;
    const isSingle = logisticsModel === "single";

    // PLAN 01: OPTIMAL
    const firstMileCost1 = Math.round(cargoQuantity * (isSingle ? 1.20 : 1.12));
    const oceanCost1 = Math.round(cargoQuantity * spec.ratePerTon);
    const portCost1 = Math.round(cargoQuantity * 0.60);
    const lastMileCost1 = Math.round(cargoQuantity * wh1.inlandFreightUsd);
    const landedTotal1 = firstMileCost1 + oceanCost1 + portCost1 + lastMileCost1;

    const originSpecialist1 = activeOrigin.country === "Australia" 
      ? "Hunter Valley Rail & Haulage" 
      : activeOrigin.country === "Indonesia" 
      ? "Kalimantan Coal Drayage Ltd" 
      : "Trans-Island Bulk Drayage";

    const plan01 = {
      planId: "PLAN-01",
      label: "PLAN 01",
      tag: isSingle ? "RECOMMENDED (SINGLE TURNKEY)" : "RECOMMENDED (BEST-OF-BREED SPLIT)",
      rank: 1,
      isRecommended: true,
      operatorModel: isSingle ? "SINGLE_OPERATOR" : "MULTI_OPERATOR",
      operatorModelTitle: isSingle ? "Single Unified Operator (End-to-End Turnkey)" : "Multiple Specialized Operators (Best-of-Breed Split)",
      contractor: isSingle ? {
        id: "TATA_NYK",
        name: "Tata NYK Integrated Multimodal Logistics",
        roadTransporter: "Tata NYK Intermodal Fleet",
        reliability: "98.8%"
      } : {
        id: "MULTI_TIER1",
        name: "Tier-1 Multi-Carrier Consortium",
        roadTransporter: "Intermodal Road Express",
        reliability: "97.6%"
      },
      originOperator: isSingle ? "Tata NYK Global Drayage Wing" : originSpecialist1,
      oceanCarrier: "Tata NYK Shipping Line",
      lastMileOperator: isSingle ? "Tata NYK Domestic Express Logistics" : "Intermodal Road Express (NH-53 Heavy Fleet)",
      handoffRisk: isSingle ? "ZERO (Unified SLA)" : "MANAGED (API Coordinated)",
      vessel: {
        name: vcat === "VLOC" ? "MV Berge Everest (VLOC)" : vcat === "Capesize" ? "MV Tata Titan" : vcat === "Supramax" ? "MV Tata Pride" : vcat === "Handysize" ? "MV Tata Pearl" : "MV Bengal Voyager",
        category: vcat,
        dwt: spec.dwt,
        draftM: spec.draft,
        loaM: spec.loa,
        beamM: spec.beam,
        speedKnots: 13.8,
        engineEfficiency: "98.2%",
        healthScore: 96.8,
        ciiRating: "Grade A (Eco-Bulker)",
        age: "4.2 Years",
        rightShipRating: 5,
        flag: "Panama",
        dailyFuelBurn: vcat === "VLOC" ? "58.0 MT/day" : vcat === "Capesize" ? "48.5 MT/day" : vcat === "Supramax" ? "24.2 MT/day" : "31.8 MT/day"
      },
      origin: `${originPort}, ${activeOrigin.country}`,
      originPort,
      originWarehouse: activeOrigin.warehouse,
      destinationPort: destPort,
      destinationWarehouse: wh1,
      inlandRoute: `${activeOrigin.warehouse} ➔ ${originPort} Port ➔ ${destPort} Port ➔ ${wh1.name}`,
      estimatedOceanTransitDays: activeOrigin.distNm ? (activeOrigin.distNm / (13.8 * 24)).toFixed(1) : 15.5,
      eta: requiredArrivalDate,
      oceanFreightRatePerTon: spec.ratePerTon,
      totalLandedCostUsd: landedTotal1,
      landedCostPerTonUsd: (landedTotal1 / cargoQuantity).toFixed(2),
      savingsUsd: Math.round(cargoQuantity * (isSingle ? 0.89 : 1.18)),
      portWaiting: `${activeDest.waitHours || 12} hrs estimated queue`,
      portWaitingHours: activeDest.waitHours || 12,
      demurrageRisk: "LOW",
      logisticsRisk: "LOW",
      overallFeasibility: "FEASIBLE",
      feasibilityScore: 98,
      firstMileTrucks: Math.ceil(cargoQuantity / 1400),
      lastMileTrucks: Math.ceil(cargoQuantity / 1350),
      firstMileCostUsd: firstMileCost1,
      oceanFreightTotalUsd: oceanCost1,
      portHandlingCostUsd: portCost1,
      roadFreightCostUsd: lastMileCost1,
      demurragePerHourUsd: spec.demurrage,
      recommendationReason: isSingle
        ? `Top tier single operator match: Tata NYK manages overseas loading, ocean transit, and Indian plant delivery under a unified SLA with zero handoff delay.`
        : `Optimal multi-operator synergy: Achieves lowest landed cost by pairing local siding haulage at origin with Tata NYK deepsea shipping and dedicated destination tippers.`
    };

    // PLAN 02: BALANCED ALTERNATIVE
    const firstMileCost2 = firstMileCost1;
    const oceanCost2 = Math.round(cargoQuantity * (spec.ratePerTon + 1.20));
    const portCost2 = Math.round(cargoQuantity * 0.65);
    const lastMileCost2 = Math.round(cargoQuantity * wh2.inlandFreightUsd);
    const landedTotal2 = firstMileCost2 + oceanCost2 + portCost2 + lastMileCost2;

    const plan02 = {
      planId: "PLAN-02",
      label: "PLAN 02",
      tag: isSingle ? "BALANCED ALTERNATIVE (SINGLE OPERATOR)" : "BALANCED ALTERNATIVE (MULTI-OPERATOR)",
      rank: 2,
      isRecommended: false,
      operatorModel: isSingle ? "SINGLE_OPERATOR" : "MULTI_OPERATOR",
      operatorModelTitle: isSingle ? "Single Unified Operator (Turnkey Alternative)" : "Multiple Specialized Operators (Leg Split)",
      contractor: isSingle ? {
        id: "JSW_GLOBAL",
        name: "JSW Integrated Logistics Ltd",
        roadTransporter: "JSW Intermodal Fleet",
        reliability: "95.2%"
      } : {
        id: "MULTI_BALANCED",
        name: "Pacific-JSW-Eastern Multi-Operator Split",
        roadTransporter: "Eastern Coastal Fleet",
        reliability: "94.2%"
      },
      originOperator: isSingle ? "JSW Overseas Logistics Network" : "Pacific Drayage & Mining Transport",
      oceanCarrier: "JSW Shipping Ltd",
      lastMileOperator: isSingle ? "JSW Coastal & Inland Transport" : "Eastern Coastal Logistics Fleet",
      handoffRisk: isSingle ? "LOW (Single Contract)" : "MODERATE (2 Handshake Points)",
      vessel: {
        name: vcat === "VLOC" ? "MV Ore Brasil (VLOC)" : vcat === "Capesize" ? "MV JSW Steel Bulk" : vcat === "Supramax" ? "MV Coastal Pride" : vcat === "Handysize" ? "MV JSW Express" : "MV JSW Vamsi",
        category: vcat,
        dwt: spec.dwt,
        draftM: spec.draft - 0.4,
        loaM: spec.loa - 8,
        beamM: spec.beam,
        speedKnots: 13.5,
        engineEfficiency: "92.0%",
        healthScore: 91.2,
        ciiRating: "Grade B",
        age: "8.5 Years",
        rightShipRating: 4,
        flag: "Marshall Islands",
        dailyFuelBurn: vcat === "VLOC" ? "62.0 MT/day" : vcat === "Capesize" ? "52.0 MT/day" : "33.5 MT/day"
      },
      origin: `${originPort}, ${activeOrigin.country}`,
      originPort,
      originWarehouse: activeOrigin.warehouse,
      destinationPort: destPort,
      destinationWarehouse: wh2,
      inlandRoute: `${activeOrigin.warehouse} ➔ ${originPort} Port ➔ ${destPort} Port ➔ ${wh2.name}`,
      estimatedOceanTransitDays: (Number(plan01.estimatedOceanTransitDays) + 0.6).toFixed(1),
      eta: requiredArrivalDate,
      oceanFreightRatePerTon: spec.ratePerTon + 1.20,
      totalLandedCostUsd: landedTotal2,
      landedCostPerTonUsd: (landedTotal2 / cargoQuantity).toFixed(2),
      savingsUsd: Math.round(cargoQuantity * (isSingle ? 0.35 : 0.62)),
      portWaiting: `${(activeDest.waitHours || 12) + 2} hrs queue`,
      portWaitingHours: (activeDest.waitHours || 12) + 2,
      demurrageRisk: "MEDIUM",
      logisticsRisk: "LOW",
      overallFeasibility: "FEASIBLE",
      feasibilityScore: 91,
      firstMileTrucks: Math.ceil(cargoQuantity / 1400),
      lastMileTrucks: Math.ceil(cargoQuantity / 1350),
      firstMileCostUsd: firstMileCost2,
      oceanFreightTotalUsd: oceanCost2,
      portHandlingCostUsd: portCost2,
      roadFreightCostUsd: lastMileCost2,
      demurragePerHourUsd: spec.demurrage + 150,
      recommendationReason: isSingle
        ? `Integrated single operator alternative with high warehouse headroom at ${wh2.name} and dedicated industrial rakes.`
        : `Multi-operator balance utilizing regional siding transporters and secondary spot chartering to optimize backhaul capacity.`
    };

    // PLAN 03: CONTINGENCY BUFFER
    const firstMileCost3 = firstMileCost1;
    const oceanCost3 = Math.round(cargoQuantity * (spec.ratePerTon + 0.80));
    const portCost3 = Math.round(cargoQuantity * 0.62);
    const lastMileCost3 = Math.round(cargoQuantity * wh3.inlandFreightUsd);
    const landedTotal3 = firstMileCost3 + oceanCost3 + portCost3 + lastMileCost3;

    const plan03 = {
      planId: "PLAN-03",
      label: "PLAN 03",
      tag: isSingle ? "BUFFER CONTINGENCY (SINGLE OPERATOR)" : "BUFFER CONTINGENCY (MULTI-OPERATOR)",
      rank: 3,
      isRecommended: false,
      operatorModel: isSingle ? "SINGLE_OPERATOR" : "MULTI_OPERATOR",
      operatorModelTitle: isSingle ? "Single Unified Operator (Buffer Turnkey)" : "Multiple Specialized Operators (Buffer Split)",
      contractor: isSingle ? {
        id: "ADANI_INTERMODAL",
        name: "Adani Integrated Port & Rail Logistics",
        roadTransporter: "Adani Rail Express",
        reliability: "93.4%"
      } : {
        id: "MULTI_BUFFER",
        name: "Trans-Mineral & Synergy Multi-Operator Split",
        roadTransporter: "National Highway Logistics",
        reliability: "91.8%"
      },
      originOperator: isSingle ? "Adani International Bulk Freight" : "Trans-Mineral Freight Co.",
      oceanCarrier: "Synergy Marine Group",
      lastMileOperator: isSingle ? "Adani Agri-Bulk & Rail Logistics" : "National Highway Logistics",
      handoffRisk: isSingle ? "LOW (Single Contract)" : "MODERATE (Buffer Holding)",
      vessel: {
        name: vcat === "VLOC" ? "MV Pacific Winner (VLOC)" : vcat === "Capesize" ? "MV Ocean Giant" : vcat === "Supramax" ? "MV Ocean Leader" : vcat === "Handysize" ? "MV Island Trader" : "MV Ocean Pioneer",
        category: vcat,
        dwt: spec.dwt + 2000,
        draftM: spec.draft + 0.3,
        loaM: spec.loa + 5,
        beamM: spec.beam,
        speedKnots: 13.0,
        engineEfficiency: "89.0%",
        healthScore: 88.5,
        ciiRating: "Grade C",
        age: "11.8 Years",
        rightShipRating: 4,
        flag: "Liberia",
        dailyFuelBurn: vcat === "VLOC" ? "65.0 MT/day" : vcat === "Capesize" ? "55.0 MT/day" : "35.2 MT/day"
      },
      origin: `${originPort}, ${activeOrigin.country}`,
      originPort,
      originWarehouse: activeOrigin.warehouse,
      destinationPort: destPort,
      destinationWarehouse: wh3,
      inlandRoute: `${activeOrigin.warehouse} ➔ ${originPort} Port ➔ ${destPort} Port ➔ ${wh3.name}`,
      estimatedOceanTransitDays: (Number(plan01.estimatedOceanTransitDays) + 1.2).toFixed(1),
      eta: requiredArrivalDate,
      oceanFreightRatePerTon: spec.ratePerTon + 0.80,
      totalLandedCostUsd: landedTotal3,
      landedCostPerTonUsd: (landedTotal3 / cargoQuantity).toFixed(2),
      savingsUsd: Math.round(cargoQuantity * (isSingle ? 0.42 : 0.48)),
      portWaiting: `${(activeDest.waitHours || 12) + 4} hrs queue`,
      portWaitingHours: (activeDest.waitHours || 12) + 4,
      demurrageRisk: "MEDIUM",
      logisticsRisk: "MEDIUM",
      overallFeasibility: "FEASIBLE (CONTINGENT)",
      feasibilityScore: 84,
      firstMileTrucks: Math.ceil(cargoQuantity / 1400),
      lastMileTrucks: Math.ceil(cargoQuantity / 1350),
      firstMileCostUsd: firstMileCost3,
      oceanFreightTotalUsd: oceanCost3,
      portHandlingCostUsd: portCost3,
      roadFreightCostUsd: lastMileCost3,
      demurragePerHourUsd: spec.demurrage + 100,
      recommendationReason: isSingle
        ? `Single-operator turnkey buffer with flexible laycan and direct rail sidings at ${wh3.name}.`
        : `Independent leg allocation with flexible laycan and multi-transporter buffer stock holding at ${wh3.name}.`
    };

    return [plan01, plan02, plan03];
  };

  const executionPlans = getExecutionPlans();
  const [selectedPlanId, setSelectedPlanId] = useState("PLAN-01");
  const selectedPlan = executionPlans.find(p => p.planId === selectedPlanId) || executionPlans[0];
  const selectedContractor = selectedPlan; // for compatibility with subsequent steps


  // Visual Chart State for Step 3 AI Multi-Factor Analysis
  const [aiChartTab, setAiChartTab] = useState("freight_curve"); // 'freight_curve' | 'cost_breakdown' | 'port_queue'
  const [hoveredCostCategory, setHoveredCostCategory] = useState(null);
  const [hoveredPortStage, setHoveredPortStage] = useState(null);

  // Dynamic Chart 1: 14-Day Freight Rate Forward Curve
  const currentSpotRate = selectedContractor.oceanFreightRatePerTon;
  const freightCurveData = [];
  const now = new Date();
  for (let i = 5; i >= 1; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().slice(5, 10);
    const historicalRate = parseFloat((currentSpotRate - (i * 0.06) + Math.sin(i * 0.5) * 0.05).toFixed(2));
    freightCurveData.push({
      date: dateStr,
      actual: historicalRate,
      lockedSpot: currentSpotRate,
      projected: null,
      confidenceUpper: null,
      confidenceLower: null
    });
  }
  // Day 0: Today
  freightCurveData.push({
    date: "Today (Lock)",
    actual: currentSpotRate,
    lockedSpot: currentSpotRate,
    projected: currentSpotRate,
    confidenceUpper: currentSpotRate + 0.15,
    confidenceLower: currentSpotRate - 0.15
  });
  // Forward 10 Days
  for (let i = 1; i <= 10; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const dateStr = d.toISOString().slice(5, 10);
    const projRate = parseFloat((currentSpotRate + (i * 0.08) + Math.sin(i * 0.4) * 0.04).toFixed(2));
    freightCurveData.push({
      date: `+${i}d (${dateStr})`,
      actual: null,
      lockedSpot: currentSpotRate,
      projected: projRate,
      confidenceUpper: parseFloat((projRate + 0.25 + i * 0.04).toFixed(2)),
      confidenceLower: parseFloat((projRate - 0.25 - i * 0.04).toFixed(2))
    });
  }

  // Dynamic Chart 2: Multimodal Cost Breakdown Comparison (Mapped directly from datasets)
  const costBreakdownData = [
    {
      category: "Ocean Freight",
      "Traditional Booking": Math.round(cargoQuantity * (currentSpotRate + 0.70)),
      "ASTRA Multimodal AI": Math.round(cargoQuantity * currentSpotRate),
      savings: Math.round(cargoQuantity * 0.70),
      dataset: "baltic_dry_freight_historical.csv",
      metric: `Spot Rate: $${currentSpotRate.toFixed(2)}/MT vs Spot Premium $${(currentSpotRate + 0.70).toFixed(2)}/MT`,
      whyCheaper: "Direct carrier fixture negotiated at forward spot rate curve, bypassing intermediary broker markup."
    },
    {
      category: "First-Mile Road",
      "Traditional Booking": Math.round(selectedContractor.roadFreightCostUsd * 0.58),
      "ASTRA Multimodal AI": Math.round(selectedContractor.roadFreightCostUsd * 0.50),
      savings: Math.round(selectedContractor.roadFreightCostUsd * 0.08),
      dataset: "inland_multimodal_corridors.csv",
      metric: `${selectedContractor.firstMileTrucks} dedicated 40T tippers on M15 corridor`,
      whyCheaper: "Bulk transporter contract with guaranteed backhaul rate instead of ad-hoc spot truck hire."
    },
    {
      category: "Last-Mile Road",
      "Traditional Booking": Math.round(selectedContractor.roadFreightCostUsd * 0.58),
      "ASTRA Multimodal AI": Math.round(selectedContractor.roadFreightCostUsd * 0.50),
      savings: Math.round(selectedContractor.roadFreightCostUsd * 0.08),
      dataset: "inland_multimodal_corridors.csv",
      metric: `${selectedContractor.lastMileTrucks} trucks on NH-53 heavy corridor`,
      whyCheaper: "Synchronized port gate dispatch prevents truck detention fees at destination plant hoppers."
    },
    {
      category: "Port Handling",
      "Traditional Booking": Math.round(selectedContractor.portHandlingCostUsd * 1.15),
      "ASTRA Multimodal AI": selectedContractor.portHandlingCostUsd,
      savings: Math.round(selectedContractor.portHandlingCostUsd * 0.15),
      dataset: "east_coast_india_port_telemetry.csv",
      metric: "2,800 MT/hr mechanized conveyor berth handling",
      whyCheaper: "Pre-allocated mechanized conveyor berth avoids conventional crane handling surcharges."
    },
    {
      category: "Demurrage Risk",
      "Traditional Booking": Math.round(selectedContractor.demurragePerHourUsd * (activeDest.waitHours || 12) * 0.8),
      "ASTRA Multimodal AI": 0, // Shielded by JIT pre-booking
      savings: Math.round(selectedContractor.demurragePerHourUsd * (activeDest.waitHours || 12) * 0.8),
      dataset: "east_coast_india_port_telemetry.csv",
      metric: `${activeDest.waitHours || 12}h historical queue at ${destPort} Port`,
      whyCheaper: "Zero demurrage: Just-In-Time (JIT) vessel arrival eliminates the average 12-hour anchorage wait."
    }
  ];

  // Dynamic Chart 3: Port Turnaround Stages (Mapped directly from east_coast_india_port_telemetry.csv)
  const dischargeHours = Math.max(16, Math.round(cargoQuantity / 2800));
  const queueHours = activeDest.waitHours || 12;
  const totalPortHours = (2.5 + queueHours + 1.5 + dischargeHours + 1.0).toFixed(1);

  const portQueueStages = [
    { 
      stage: "Pilotage & Fairway", 
      hours: 2.5, 
      type: "Navigation",
      dataset: "east_coast_india_port_telemetry.csv",
      status: "STANDARD NAV",
      desc: "Port pilot boards ship at outer fairway; safe pilotage through dredged channel at 4–6 knots.",
      whyItMatters: "Mandatory navigational procedure ensuring safe channel transit without grounding risk."
    },
    { 
      stage: "Anchorage Queue", 
      hours: queueHours, 
      type: "Waiting",
      dataset: "east_coast_india_port_telemetry.csv",
      status: "BOTTLENECK RISK",
      desc: `Vessel idles at outer anchorage waiting for empty berth. Historical wait time at ${destPort} Port.`,
      whyItMatters: `Every idle hour costs ~$1,200 in vessel demurrage. ASTRA's JIT schedule eliminates this wait.`
    },
    { 
      stage: "Tug & Mooring", 
      hours: 1.5, 
      type: "Berthing",
      dataset: "east_coast_india_port_telemetry.csv",
      status: "STANDARD BERTH",
      desc: "Twin tractor tugs guide and secure vessel alongside mechanized bulk jetty bollards.",
      whyItMatters: "Precision berthing operation safely securing the vessel alongside the discharge hopper."
    },
    { 
      stage: "Mechanized Discharge", 
      hours: dischargeHours, 
      type: "Operations",
      dataset: "east_coast_india_port_telemetry.csv",
      status: "CORE OPERATION",
      desc: `High-speed unloading of ${Number(cargoQuantity).toLocaleString()} MT cargo at 2,800 MT/hr via conveyor belts.`,
      whyItMatters: "Active physical discharge directly into waiting tipper trucks and plant railway siding."
    },
    { 
      stage: "Outward Clearance", 
      hours: 1.0, 
      type: "Documentation",
      dataset: "east_coast_india_port_telemetry.csv",
      status: "CLEARANCE",
      desc: "Port trust clearance, customs sign-off, draft survey validation, and outward unberthing.",
      whyItMatters: "Final regulatory sign-off releasing the vessel to depart for its next voyage."
    }
  ];

  // Final Execution & Confirmation
  const handleConfirmAndDispatch = () => {
    if (!cargoQuantity || Number(cargoQuantity) <= 0) {
      toast.error("Execution Rejected: Cargo quantity cannot be 0 tons. Minimum 1,000 MT required.");
      setStep(1);
      return;
    }
    if (Number(cargoQuantity) < 1000) {
      toast.error("Execution Rejected: Cargo quantity must be at least 1,000 MT for commercial fixture.");
      setStep(1);
      return;
    }

    const activePlan = executionPlans.find(p => p.planId === selectedPlanId) || executionPlans[0];
    const generatedId = `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectiveCompany = companyName || user?.name || "Jindal Steel & Power Ltd (JSPL)";

    const finalRequirement = {
      id: generatedId,
      companyName: effectiveCompany,
      companyCode: effectiveCompany.includes("Tata") ? "TATA" : effectiveCompany.includes("Vedanta") ? "VEDL" : "JSPL",
      planId: activePlan.planId,
      cargoType,
      cargoQuantity,
      logisticsModel, // "single" | "multiple"
      operatorModelTitle: activePlan.operatorModelTitle,
      firstMileOperator: activePlan.originOperator,
      oceanCarrier: activePlan.oceanCarrier,
      lastMileOperator: activePlan.lastMileOperator,
      originWarehouse: activePlan.originWarehouse,
      originPort: activePlan.originPort,
      destinationPort: activePlan.destinationPort,
      destinationWarehouse: activePlan.destinationWarehouse.name,
      destinationWarehouseCode: activePlan.destinationWarehouse.code,
      warehouseSuitability: activePlan.destinationWarehouse,
      preferredVesselCategory,
      requiredArrivalDate,
      contractDuration,
      expectedVoyages,
      budgetPreference,
      riskTolerance,
      selectedContractor: activePlan.contractor.name || "Tata NYK Shipping",
      selectedVessel: activePlan.vessel || {
        name: preferredVesselCategory === "Capesize" ? "MV Cape Sun" : preferredVesselCategory === "Supramax" ? "MV Coastal Pride" : "MV Bengal Voyager",
        category: preferredVesselCategory,
        dwt: currentSpec.dwt,
        draftM: currentSpec.draft,
        loaM: currentSpec.loa,
        beamM: currentSpec.beam
      },
      assignedVessel: activePlan.vessel || null,
      roadFleet: {
        firstMileTrucks: activePlan.firstMileTrucks,
        lastMileTrucks: activePlan.lastMileTrucks,
        transporterName: activePlan.lastMileOperator || activePlan.contractor.roadTransporter,
        truckType: "40T Multi-Axle Container & Tipping Trucks"
      },
      costBreakdown: {
        oceanFreightRatePerTon: activePlan.oceanFreightRatePerTon,
        oceanFreightTotalUsd: activePlan.oceanFreightTotalUsd,
        firstMileCostUsd: activePlan.firstMileCostUsd,
        roadTransportUsd: activePlan.roadFreightCostUsd,
        portHandlingUsd: activePlan.portHandlingCostUsd,
        totalLandedCostUsd: activePlan.totalLandedCostUsd,
        netSavingsUsd: activePlan.savingsUsd
      },
      status: "ACTIVE_IN_TRANSIT",
      contractorAccepted: true,
      timestamp: new Date().toISOString()
    };

    setRequirement(finalRequirement);
    setSelectedVessel(finalRequirement.selectedVessel);

    // Notify Contractor Profile in Real-Time
    if (addEvent) {
      addEvent({
        id: `EV-${Date.now()}`,
        type: "NEW_REQUIREMENT_CREATED",
        severity: "INFO",
        title: `📦 New Company Requirement: ${cargoType} (${cargoQuantity.toLocaleString()} MT)`,
        detail: `${effectiveCompany} created a new shipping requirement for ${preferredVesselCategory} from ${activePlan.originPort} to ${activePlan.destinationPort}. Awaiting contractor review & vessel fixture confirmation.`,
        requirementId: generatedId,
        roleRecipient: ["contractor", "company"]
      });
    }

    toast.success(`Requirement ${finalRequirement.id} Dispatched to Contractor Desk! Tata NYK Contractor will allocate the AI-predicted best vessel.`);
    nav("/");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" data-testid="new-requirement-page">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="OPTIMIZATION" />
            <span className="astra-label">End-to-End Multimodal Logistics Wizard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            New Multimodal Shipment
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure cargo, vessel size specs (Beam/LOA/Draft), East Coast ports, and contract structure.
          </p>
        </div>

        {/* 4-Step Progress Indicator */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold shadow-xs">
          {[
            { num: 1, label: "Cargo & Fairways" },
            { num: 2, label: "Multimodal Plan" },
            { num: 3, label: "AI Analysis" },
            { num: 4, label: "Dispatch" }
          ].map((s) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num > 1 && (!cargoType || !originPort || !destPort || !cargoQuantity || Number(cargoQuantity) < 1000)) {
                    toast.error("Please complete all required selections in Step 1 (Commodity, Origin, Destination, and Quantity >= 1,000 MT).");
                    setStep(1);
                    return;
                  }
                  if (isDone) setStep(s.num);
                }}
                disabled={!isDone && !isCurrent}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  isDone
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200/90 cursor-pointer shadow-xs"
                    : isCurrent
                    ? "bg-blue-900 text-white shadow-md cursor-default ring-2 ring-blue-900/30"
                    : "text-slate-400 bg-transparent cursor-not-allowed"
                }`}
                title={isDone ? `Jump back to Step ${s.num}: ${s.label}` : undefined}
              >
                {isDone ? (
                  <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
                ) : (
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isCurrent ? "bg-white/20 text-white font-bold" : "bg-slate-200 text-slate-500"
                  }`}>
                    {s.num}
                  </span>
                )}
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: CARGO, FAIRWAY (ORIGIN/DESTINATION) & DELIVERY SCHEDULE */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="astra-card p-6 space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                Step 1: Cargo, Fairway Routes & Delivery Schedule
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Specify your company, commodity, origin/destination ports, and laycan. Vessel hull assignment is automatically predicted and confirmed by the Contractor.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-50 text-blue-900 border border-blue-200 shrink-0">
              Contractor Fleet Allocation Model
            </span>
          </div>

          {/* Section 1: Company / Shipper Identity & Cargo Commodity */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-blue-900 uppercase flex items-center justify-between">
              <span>1. SHIPPER IDENTITY & CARGO COMMODITY</span>
              <span className="text-[11px] text-slate-500 font-normal">Step 1 of 4</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="astra-label block mb-1.5">Company / Industrial Shipper</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Jindal Steel & Power Ltd (JSPL)"
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Registered shipper chartering entity
                </span>
              </div>

              <div>
                <label className="astra-label block mb-1.5">Cargo Commodity Type</label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className={`w-full h-11 px-3 rounded-lg border font-bold text-sm outline-none transition ${
                    !cargoType ? "border-amber-400 bg-amber-50/50 text-slate-500" : "border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-900"
                  }`}
                >
                  <option value="">-- Select Cargo Commodity --</option>
                  <option value="Thermal Coal">Thermal Coal (Bulk Energy)</option>
                  <option value="Coking Coal">Coking Coal (Metallurgical)</option>
                  <option value="Iron Ore Fines">Iron Ore Fines (Steelmaking)</option>
                  <option value="Limestone Bulk">Limestone Bulk (Flux Material)</option>
                  <option value="Bauxite">Bauxite Ore (Aluminium Refinement)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Dry bulk standard classification
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="astra-label">Cargo Quantity (Metric Tons)</label>
                  <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                    {contractDuration === "1 voyage (Spot)" ? `${Number(cargoQuantity).toLocaleString()} MT` : `${expectedVoyages}x Voyages`}
                  </span>
                </div>
                <input
                  type="number"
                  value={cargoQuantity}
                  min="1000"
                  max="400000"
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className={`w-full h-11 px-3 rounded-lg border font-mono font-bold text-sm outline-none transition ${
                    Number(cargoQuantity) <= 0
                      ? "border-red-500 bg-red-50/70 text-red-900 focus:ring-2 focus:ring-red-400"
                      : Number(cargoQuantity) < 1000
                      ? "border-amber-400 bg-amber-50/70 text-amber-900 focus:ring-2 focus:ring-amber-400"
                      : "border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-blue-900"
                  }`}
                  step="1000"
                />
                {/* Real-time validation warning message */}
                {Number(cargoQuantity) <= 0 ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-700 bg-red-50 p-2 rounded-lg border border-red-200 mt-1.5">
                    <AlertTriangle size={13} className="shrink-0 text-red-600" />
                    <span>0 MT is invalid! Commercial dry-bulk shipping requires at least 1,000 MT.</span>
                  </div>
                ) : Number(cargoQuantity) < 1000 ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1.5">
                    <AlertTriangle size={13} className="shrink-0 text-amber-600" />
                    <span>Minimum parcel size is 1,000 MT for commercial chartering.</span>
                  </div>
                ) : null}
                {/* Volume Quick Presets */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-mono">Presets:</span>
                  {[35000, 55000, 70000, 150000, 220000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuantityChange(preset)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition ${
                        cargoQuantity === preset 
                          ? "bg-blue-900 text-white border-blue-900" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {preset === 150000 ? "150k MT (Capesize)" : preset === 220000 ? "220k MT (VLOC)" : `${preset / 1000}k MT`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Origin Loading & Destination Discharge Fairways */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-xs font-mono font-bold text-blue-900 uppercase">
              2. CORRIDOR & PORTS (ORIGIN & DESTINATION FAIRWAYS)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="astra-label">Origin Port (Loading Jetty)</label>
                  <span className="text-[10px] font-mono text-slate-500">Overseas Siding</span>
                </div>
                <select
                  value={originPort}
                  onChange={(e) => setOriginPort(e.target.value)}
                  className={`w-full h-11 px-3 rounded-lg border font-bold text-sm outline-none transition ${
                    !originPort ? "border-amber-400 bg-amber-50/50 text-slate-500" : "border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-900"
                  }`}
                >
                  <option value="">-- Select Origin Loading Port --</option>
                  {ORIGIN_OPTIONS.map(o => (
                    <option key={o.port} value={o.port}>{o.port} ({o.country}) · {o.distNm} NM to East Coast</option>
                  ))}
                </select>
                <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1.5 pt-1">
                  <MapPin size={12} className="text-blue-900 shrink-0" />
                  <span>Siding: <strong>{originPort ? activeOrigin.warehouse : "Select origin port"}</strong></span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="astra-label">Destination Port (Discharge Jetty)</label>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {destPort ? `Max Permissible Draft: ${activeDest.maxDraft}m` : "East Coast Ports"}
                  </span>
                </div>
                <select
                  value={destPort}
                  onChange={(e) => setDestPort(e.target.value)}
                  className={`w-full h-11 px-3 rounded-lg border font-bold text-sm outline-none transition ${
                    !destPort ? "border-amber-400 bg-amber-50/50 text-slate-500" : "border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-900"
                  }`}
                >
                  <option value="">-- Select Destination Discharge Port --</option>
                  {EAST_COAST_DESTINATIONS.map(d => (
                    <option key={d.port} value={d.port}>{d.port} Port ({d.state}) · Draft Limit: {d.maxDraft}m · Max LOA: {d.maxLoa}m</option>
                  ))}
                </select>
                <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1.5 pt-1">
                  <Factory size={12} className="text-amber-700 shrink-0" />
                  <span>Receiving Facility: <strong>{destPort ? activeDest.plant : "Select destination port"}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Laycan & Contract Structure */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-blue-900 uppercase">
                3. DELIVERY LAYCAN & CONTRACT STRUCTURE
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {contractDuration === "1 voyage (Spot)" ? "Spot: Single 1-time delivery" : `Divided across ${expectedVoyages} sequential ${preferredVesselCategory} voyages`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="astra-label block mb-1.5">
                  {contractDuration === "1 voyage (Spot)" ? "Target Arrival Laycan Date" : "First Voyage Laycan Date"}
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={requiredArrivalDate}
                  onChange={(e) => handleArrivalDateChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Select laycan (Earliest selectable: Today {todayStr})
                </span>
              </div>

              <div>
                <label className="astra-label block mb-1.5">Contract Duration</label>
                <select
                  value={contractDuration}
                  onChange={(e) => handleContractDurationChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none"
                >
                  <option value="1 voyage (Spot)">1 voyage (Spot Market Single Trip)</option>
                  <option value="3 months Period">3 months Period Contract (COA)</option>
                  <option value="6 months COA">6 months Long-Term COA</option>
                  <option value="12 months COA">12 months Annual Volume Contract</option>
                </select>
              </div>

              <div>
                <label className="astra-label block mb-1.5">Expected Voyage Count</label>
                <input
                  type="number"
                  min="1"
                  value={expectedVoyages}
                  onChange={(e) => setExpectedVoyages(Number(e.target.value))}
                  disabled={contractDuration === "1 voyage (Spot)"}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Logistics Operator Model Strategy (Single vs Multiple) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-blue-900 uppercase flex items-center gap-2">
                <Building2 size={14} />
                <span>4. LOGISTICS OPERATOR MODEL (ORIGIN & DESTINATION STRATEGY)</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                logisticsModel === "single" 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
                  : "bg-indigo-50 text-indigo-800 border-indigo-300"
              }`}>
                {logisticsModel === "single" ? "🛡️ Single Unified Operator (Turnkey)" : "🔀 Multiple Specialized Operators (Leg Split)"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Single Logistics Operator */}
              <div
                onClick={() => setLogisticsModel("single")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  logisticsModel === "single"
                    ? "border-blue-900 bg-blue-50/40 shadow-md ring-1 ring-blue-900/30"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg grid place-items-center ${logisticsModel === "single" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-700"}`}>
                      <ShieldCheck size={17} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Single Logistics Operator</h4>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold block">
                        Same unified 3PL/4PL at Origin & Destination
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="logisticsModel"
                    checked={logisticsModel === "single"}
                    onChange={() => setLogisticsModel("single")}
                    className="w-4 h-4 text-blue-900 accent-blue-900 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                  One integrated turnkey contractor handles overseas siding drayage, ocean vessel charter, port handling, and destination plant delivery under a <strong>single unified SLA</strong>.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-slate-200/60">
                  <div className="bg-white/80 p-1.5 rounded border border-slate-200/80">
                    <span className="text-slate-400 block font-bold">ACCOUNTABILITY:</span>
                    <span className="font-bold text-slate-800">Single Point of Contact</span>
                  </div>
                  <div className="bg-white/80 p-1.5 rounded border border-slate-200/80">
                    <span className="text-slate-400 block font-bold">HANDOFF RISK:</span>
                    <span className="font-bold text-emerald-700">Zero Inter-Leg Demurrage</span>
                  </div>
                </div>
              </div>

              {/* Option B: Multiple Logistics Operators */}
              <div
                onClick={() => setLogisticsModel("multiple")}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  logisticsModel === "multiple"
                    ? "border-blue-900 bg-blue-50/40 shadow-md ring-1 ring-blue-900/30"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg grid place-items-center ${logisticsModel === "multiple" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-700"}`}>
                      <Layers size={17} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Multiple Logistics Operators</h4>
                      <span className="text-[10px] font-mono text-blue-700 font-bold block">
                        Different specialized operators per leg
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="logisticsModel"
                    checked={logisticsModel === "multiple"}
                    onChange={() => setLogisticsModel("multiple")}
                    className="w-4 h-4 text-blue-900 accent-blue-900 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                  Contract separate specialized operators for <strong>Origin Overseas Haulage</strong>, <strong>Deepsea Ocean Line</strong>, and <strong>Destination Hinterland Fleet</strong> for maximum leg arbitrage.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-slate-200/60">
                  <div className="bg-white/80 p-1.5 rounded border border-slate-200/80">
                    <span className="text-slate-400 block font-bold">COST ARBITRAGE:</span>
                    <span className="font-bold text-emerald-700">Lowest Leg-by-Leg Quotes</span>
                  </div>
                  <div className="bg-white/80 p-1.5 rounded border border-slate-200/80">
                    <span className="text-slate-400 block font-bold">SPECIALIZATION:</span>
                    <span className="font-bold text-blue-900">Niche Regional Haulers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: ASTRA AI Vessel & Route Feasibility (Contractor Allocation) */}
          <div className="p-4 bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/70 rounded-xl border border-blue-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-900 text-white grid place-items-center shrink-0 shadow-sm">
                  <Sparkles size={16} className="text-amber-300" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
                    <span>AI Fleet Optimization & Contractor Feasibility Check</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-600" />
                      Auto-Evaluated: {preferredVesselCategory} Class
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Company shippers do not need to choose a vessel. When you dispatch, ASTRA AI checks draft clearance, ballast positioning, and evaluates fuel efficiency to predict the best vessel directly on the Contractor Desk.
                  </div>
                </div>
              </div>
            </div>

            {/* Feasibility metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-[11px] font-mono">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">PREDICTED VESSEL CLASS</span>
                <span className="font-extrabold text-blue-900">{preferredVesselCategory}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">~{(currentSpec.avgPayload / 1000).toFixed(0)}k MT capacity</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">PORT DRAFT COMPLIANCE</span>
                <span className={`font-extrabold ${currentSpec.draft <= activeDest.maxDraft ? "text-emerald-700" : "text-amber-700"}`}>
                  {currentSpec.draft <= activeDest.maxDraft ? `✓ Cleared (+${(activeDest.maxDraft - currentSpec.draft).toFixed(1)}m)` : `⚠️ Exceeds by ${(currentSpec.draft - activeDest.maxDraft).toFixed(1)}m`}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{destPort} max {activeDest.maxDraft}m</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">ESTIMATED SAILING SLA</span>
                <span className="font-extrabold text-slate-800">
                  ~{Math.ceil((activeOrigin.distNm || 5000) / (currentSpec.speedKnots * 24)) + 1} Days
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{activeOrigin.distNm || 5000} NM from {originPort}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">ESTIMATED FREIGHT RATE</span>
                <span className="font-extrabold text-emerald-700 font-mono">
                  ${currentSpec.ratePerTon.toFixed(2)} / MT
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Base ocean freight index</span>
              </div>
            </div>
          </div>

          {/* Section 5: Auto-Inferred Hinterland Corridor */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
            <div className="text-xs font-mono font-bold text-blue-900 uppercase flex items-center gap-2">
              <Info size={14} />
              <span>AUTO-INFERRED MULTIMODAL 4-POINT CORRIDOR</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <div className="text-slate-400 text-[10px] uppercase font-bold">1. ORIGIN SIDING</div>
                <div className="font-bold text-slate-900 mt-1">{activeOrigin.warehouse}</div>
                <div className="text-emerald-700 text-[10px] mt-1 font-semibold">{Math.ceil(cargoQuantity / 1400)} First-Mile Trucks</div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <div className="text-slate-400 text-[10px] uppercase font-bold">2. LOADING JETTY</div>
                <div className="font-bold text-slate-900 mt-1">{activeOrigin.port} Deepwater Berth</div>
                <div className="text-slate-500 text-[10px] mt-1">Conveyor Loading</div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <div className="text-slate-400 text-[10px] uppercase font-bold">3. DISCHARGE TERMINAL</div>
                <div className="font-bold text-slate-900 mt-1">{activeDest.port} Port Bulk Jetty</div>
                <div className="text-blue-900 text-[10px] mt-1 font-semibold">Max Draft: {activeDest.maxDraft}m · Max LOA: {activeDest.maxLoa}m</div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-blue-100">
                <div className="text-slate-400 text-[10px] uppercase font-bold">4. DESTINATION PLANT</div>
                <div className="font-bold text-slate-900 mt-1">{activeDest.plant}</div>
                <div className="text-amber-700 text-[10px] mt-1 font-semibold">{Math.ceil(cargoQuantity / 1350)} Last-Mile Trucks</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                if (!companyName.trim()) {
                  toast.error("Please enter your Company / Industrial Shipper name.");
                  return;
                }
                if (!cargoType) {
                  toast.error("Please select a Cargo Commodity type from the dropdown.");
                  return;
                }
                if (!cargoQuantity || Number(cargoQuantity) <= 0) {
                  toast.error("Invalid Cargo Quantity: Please enter at least 1,000 Metric Tons.");
                  return;
                }
                if (Number(cargoQuantity) < 1000) {
                  toast.error("Minimum parcel volume is 1,000 MT for commercial dry-bulk chartering.");
                  return;
                }
                if (!originPort) {
                  toast.error("Please select an Origin Loading Port from the dropdown.");
                  return;
                }
                if (!destPort) {
                  toast.error("Please select a Destination Discharge Port from the dropdown.");
                  return;
                }
                if (requiredArrivalDate < todayStr) {
                  toast.error("Target arrival laycan date cannot be in the past.");
                  setRequiredArrivalDate(todayStr);
                  return;
                }
                setStep(2);
              }}
              className="btn-primary px-8 h-12 text-sm font-bold gap-2"
            >
              <span>Proceed to Multimodal Feasibility & Cost Analysis</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: AI EXECUTION RECOMMENDATIONS (PLAN 01, PLAN 02, PLAN 03) */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="astra-card p-5 space-y-2 border-b border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge kind="OPTIMIZATION" />
                  <span className="text-[10px] font-mono font-bold text-blue-900 uppercase tracking-wider">
                    AI END-TO-END EXECUTION COMBINATIONS
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1" style={{ fontFamily: "Manrope" }}>
                  Step 2: AI Execution Recommendations (Plan 1 / 2 / 3)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instead of recommending only a vessel operator, ASTRA combines <strong>Vessel + Origin Port + Destination Port + Contractor + Origin Warehouse + Best-Suited Destination Warehouse</strong> into ranked full-chain execution plans.
                </p>
              </div>
              <button onClick={() => setStep(1)} className="btn-secondary text-xs">
                <ArrowLeft size={14} /> Back to Setup & Specs
              </button>
            </div>
          </div>

          {/* Destination Warehouse Suitability Matrix */}
          <div className="astra-card p-5 space-y-3 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <div className="text-[10px] font-mono font-bold text-blue-900 uppercase">
                  DESTINATION HINTERLAND INTELLIGENCE · {destPort} PORT
                </div>
                <h3 className="text-base font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                  Candidate Destination Warehouses & Suitability Ranking
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-100 text-blue-900">
                Top Suited: {candidateWarehousesList[0]?.code} ({candidateWarehousesList[0]?.score}% Score)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <th className="py-2 px-3">Warehouse / Plant</th>
                    <th className="py-2 px-3">Distance</th>
                    <th className="py-2 px-3">Transit Time</th>
                    <th className="py-2 px-3">Capacity Headroom</th>
                    <th className="py-2 px-3">Transport Mode</th>
                    <th className="py-2 px-3">Inland Rate</th>
                    <th className="py-2 px-3">Risk</th>
                    <th className="py-2 px-3 text-right">Suitability Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidateWarehousesList.map((wh, idx) => (
                    <tr 
                      key={wh.code}
                      className={idx === 0 ? "bg-emerald-50/60 font-semibold" : "hover:bg-slate-50/60"}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-emerald-600" : "bg-slate-400"}`} />
                          <span className="font-bold text-slate-900">[{wh.code}] {wh.name}</span>
                          {idx === 0 && (
                            <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">BEST FIT</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{wh.distanceKm} km</td>
                      <td className="py-2.5 px-3 text-slate-700">{wh.transitHours} hrs</td>
                      <td className="py-2.5 px-3 text-slate-700">{100 - wh.utilizationPct}% Available ({((wh.capacityTons * (100 - wh.utilizationPct)) / 100000).toFixed(0)}k MT)</td>
                      <td className="py-2.5 px-3 text-slate-600">{wh.mode}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">${wh.inlandFreightUsd.toFixed(2)}/t</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${wh.risk === "LOW" ? "bg-emerald-100 text-emerald-800" : wh.risk === "MEDIUM" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                          {wh.risk}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-extrabold text-sm ${idx === 0 ? "text-emerald-700" : "text-slate-800"}`}>
                          {wh.score}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1">
              <span>* Warehouse multi-criteria model evaluates distance, receiving throughput, cargo compatibility, and congestion risk.</span>
              <span className="font-bold text-blue-900">Feeds directly into Plan 01, Plan 02, and Plan 03 below ↓</span>
            </div>
          </div>

          {/* 3 Ranked AI Execution Plans */}
          <div className="space-y-4">
            {executionPlans.map((plan) => {
              const isSelected = selectedPlanId === plan.planId;
              const isDraftSafe = plan.vessel.draftM <= activeDest.maxDraft;
              const isLoaSafe = plan.vessel.loaM <= activeDest.maxLoa;

              return (
                <div
                  key={plan.planId}
                  onClick={() => setSelectedPlanId(plan.planId)}
                  className={`astra-card p-5 cursor-pointer transition-all border-2 relative ${
                    isSelected 
                      ? "border-blue-900 bg-blue-50/20 shadow-xl ring-2 ring-blue-900/30" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  {/* Top Status Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded text-xs font-mono font-extrabold ${
                        plan.isRecommended ? "bg-blue-900 text-white" : "bg-slate-800 text-slate-200"
                      }`}>
                        {plan.label}
                      </span>
                      <span className="font-extrabold text-sm text-slate-900">{plan.tag}</span>
                      {plan.isRecommended && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Award size={11} /> RANK #1 OPTIMAL COMBINATION
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {plan.overallFeasibility} · Score {plan.feasibilityScore}%
                      </span>
                      <span className="text-xs font-extrabold text-blue-900">
                        {isSelected ? "● SELECTED PLAN" : "○ Click to Select"}
                      </span>
                    </div>
                  </div>

                  {/* Complete 3-Column Plan Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Col 1: Vessel & Contractor */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-900 shrink-0 overflow-hidden flex items-end justify-center"
                          style={{
                            width: plan.vessel.category === "VLOC" ? 44 : plan.vessel.category === "Capesize" ? 40 : plan.vessel.category === "Panamax" ? 36 : plan.vessel.category === "Supramax" ? 32 : 28,
                            height: plan.vessel.category === "VLOC" ? 72 : plan.vessel.category === "Capesize" ? 64 : plan.vessel.category === "Panamax" ? 56 : plan.vessel.category === "Supramax" ? 48 : 42,
                          }}
                        >
                          <TopDownVesselIcon
                            category={plan.vessel.category}
                            size={plan.vessel.category === "VLOC" ? 20 : plan.vessel.category === "Capesize" ? 17 : plan.vessel.category === "Panamax" ? 15 : plan.vessel.category === "Supramax" ? 13 : 11}
                          />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-mono font-bold text-blue-900">PREDICTED VESSEL CLASS</div>
                          <div className="font-extrabold text-slate-900 text-sm">{plan.vessel.category} (~{(plan.vessel.dwt / 1000).toFixed(0)}k DWT)</div>
                          <div className="text-[11px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                            <Sparkles size={11} /> Hull Assigned by Contractor Desk
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                        <div>
                          <span className="text-slate-400 block text-[10px]">OPTIMAL CLASS:</span>
                          <span className="font-bold text-slate-800">{plan.vessel.category} ({plan.vessel.dwt.toLocaleString()} DWT)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">ENGINE & HEALTH:</span>
                          <span className="font-bold text-emerald-700">{plan.vessel.engineEfficiency} ({plan.vessel.ciiRating?.slice(0, 7)})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">PORT DRAFT FIT:</span>
                          <span className={`font-bold ${isDraftSafe ? "text-emerald-700" : "text-red-600"}`}>
                            {plan.vessel.draftM}m vs {activeDest.maxDraft}m {isDraftSafe ? "✓ Safe" : "✕ Risk"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">FLEET PARTNER:</span>
                          <span className="font-bold text-slate-800">{plan.contractor.roadTransporter}</span>
                        </div>
                      </div>

                      {/* Port Rationale: Why Origin & Destination */}
                      <div className="pt-2 border-t border-slate-200/70 space-y-2">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Port Selection Rationale</div>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-start gap-2 bg-amber-50/60 border border-amber-200/70 rounded-lg p-2">
                            <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 text-amber-700 grid place-items-center shrink-0 mt-0.5">
                              <Truck size={10} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-extrabold text-amber-800 uppercase">Origin · {plan.originPort}</div>
                              <div className="text-[10px] text-slate-600 leading-snug mt-0.5">
                                {activeOrigin.country === "Australia" && "Deep-draft coal terminal with 24/7 conveyor loading at 4,000+ MT/hr. Minimal anchorage queue and shortest NM corridor to Indian East Coast."}
                                {activeOrigin.country === "Indonesia" && "South Kalimantan open-cast siding offers shortest sailing distance to East India at " + (activeOrigin.distNm || 2280) + " NM, cutting transit time by ~3 days vs Australian origin."}
                                {activeOrigin.country === "South Africa" && "Richards Bay Coal Terminal ranks #1 globally for throughput reliability. Ideal for Capesize/VLOC fixtures with 18m draft clearance."}
                                {activeOrigin.country === "Singapore" && "Jurong Island transshipment hub enables feeder consolidation and flexible laycan scheduling for just-in-time Indian East Coast delivery."}
                                {!['Australia','Indonesia','South Africa','Singapore'].includes(activeOrigin.country) && `${plan.originPort} selected for optimal NM-to-cost ratio and draft clearance on the ${plan.vessel.category} class fixture.`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-200/70 rounded-lg p-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 grid place-items-center shrink-0 mt-0.5">
                              <Factory size={10} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-extrabold text-emerald-800 uppercase">Destination · {plan.destinationPort}</div>
                              <div className="text-[10px] text-slate-600 leading-snug mt-0.5">
                                Max draft {activeDest.maxDraft}m accommodates {plan.vessel.category} class at {plan.vessel.draftM}m.
                                {' '}{activeDest.congestion === 'Low' ? 'Low berth congestion ensures rapid turnaround and near-zero demurrage risk.' : activeDest.congestion === 'Medium' ? 'Moderate congestion managed via JIT vessel arrival scheduling to eliminate queue wait.' : 'High congestion port — ASTRA schedules JIT arrival to compress anchorage wait and shield demurrage.'}
                                {' '}Hinterland corridor via {plan.destinationWarehouse.mode} to {plan.destinationWarehouse.name} is the lowest-cost inland leg.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Col 2: Visually Appealing End-to-End Multimodal Supply Chain Pipeline */}
                    <div className="p-3.5 bg-gradient-to-b from-slate-50 via-white to-slate-50 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3">
                      {/* Corridor Header */}
                      <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                        <div className="text-[10px] uppercase font-mono font-bold text-slate-500 flex items-center gap-1.5">
                          <Layers size={13} className="text-blue-900" />
                          <span>END-TO-END MULTIMODAL CHAIN</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          plan.operatorModel === "SINGLE_OPERATOR" 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
                            : "bg-indigo-50 text-indigo-800 border-indigo-300"
                        }`}>
                          {plan.operatorModel === "SINGLE_OPERATOR" ? "🛡️ Single Turnkey Operator" : "🔀 Multi-Operator Split"}
                        </span>
                      </div>

                      {/* Spacious 3-Node Connected Milestone Flow */}
                      <div className="space-y-2 relative font-mono">
                        {/* Continuous Vertical Accent Line connecting nodes */}
                        <div className="absolute left-[14px] top-3.5 bottom-3.5 w-0.5 bg-gradient-to-b from-amber-400 via-blue-500 to-emerald-500 opacity-30 pointer-events-none" />

                        {/* Stage 1: Origin First-Mile Land Leg */}
                        <div className="relative flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs hover:border-amber-300 transition">
                          <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-300 text-amber-700 grid place-items-center shrink-0 z-10 font-bold text-[11px]">
                            <Truck size={13} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-extrabold text-amber-800 uppercase tracking-tight">1. Origin First-Mile</span>
                              <span className="text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-semibold">{plan.firstMileTrucks} Tippers</span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-900 truncate mt-0.5" title={plan.originWarehouse}>
                              {plan.originWarehouse}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                              <span>➔ {plan.originPort} Port</span>
                              <span className="text-amber-900 font-bold bg-amber-50 px-1 rounded truncate max-w-[130px]" title={plan.originOperator}>
                                {plan.originOperator}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stage 2: Deepsea Ocean Maritime Passage */}
                        <div className="relative flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition">
                          <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-300 text-blue-900 grid place-items-center shrink-0 z-10 font-bold text-[11px]">
                            <Anchor size={13} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-extrabold text-blue-900 uppercase tracking-tight">2. Ocean Fairway</span>
                              <span className="text-blue-900 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-bold">⏱️ {plan.estimatedOceanTransitDays}d Sailing</span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-900 truncate mt-0.5">
                              {plan.originPort} ➔ {plan.destinationPort} Deepwater
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                              <span>{plan.vessel.name}</span>
                              <span className="text-blue-900 font-bold bg-blue-50 px-1 rounded truncate max-w-[130px]" title={plan.oceanCarrier}>
                                {plan.oceanCarrier}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stage 3: Destination Last-Mile Hinterland Leg */}
                        <div className="relative flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition">
                          <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 grid place-items-center shrink-0 z-10 font-bold text-[11px]">
                            <Factory size={13} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-extrabold text-emerald-800 uppercase tracking-tight">3. Destination Plant</span>
                              <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">{plan.destinationWarehouse.distanceKm}km · {plan.destinationWarehouse.transitHours}h</span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-900 truncate mt-0.5" title={plan.destinationWarehouse.name}>
                              [{plan.destinationWarehouse.code}] {plan.destinationWarehouse.name}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                              <span>{plan.lastMileTrucks} Dedicated Trucks</span>
                              <span className="text-emerald-900 font-bold bg-emerald-50 px-1 rounded truncate max-w-[130px]" title={plan.lastMileOperator}>
                                {plan.lastMileOperator}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Micro-Badge: Handoff Risk */}
                      <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                          <CheckCircle2 size={12} className={plan.operatorModel === "SINGLE_OPERATOR" ? "text-emerald-600" : "text-blue-600"} />
                          <span className="font-semibold">
                            {plan.operatorModel === "SINGLE_OPERATOR" ? plan.contractor.name : "3 Coordinated Partners"}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600 shrink-0 border border-slate-200">
                          {plan.handoffRisk}
                        </span>
                      </div>
                    </div>

                    {/* Col 3: Landed Cost & Risk Feasibility */}
                    <div className="p-4 bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl border border-slate-700 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-widest mb-1">Total Landed Cost</div>
                            <div className="text-2xl font-extrabold text-white font-mono leading-none">
                              ${plan.totalLandedCostUsd.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-1.5">
                              ${plan.landedCostPerTonUsd} / MT landed
                            </div>
                          </div>
                          <div className="text-right bg-emerald-500/20 border border-emerald-500/40 rounded-xl px-3 py-2.5">
                            <div className="text-[9px] uppercase font-mono font-bold text-emerald-400 tracking-widest">AI Saves</div>
                            <div className="text-xl font-extrabold text-emerald-400 font-mono leading-tight mt-0.5">
                              +${plan.savingsUsd.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1 mb-2 text-[9px] font-mono font-bold uppercase tracking-widest">
                          <div className="text-slate-500">Cost Leg</div>
                          <div className="text-right text-red-400">Market</div>
                          <div className="text-right text-emerald-400">ASTRA</div>
                        </div>
                        <div className="border-t border-slate-700 mb-3" />

                        <div className="space-y-3">
                          {[
                            { label: "Ocean Freight", icon: "🌊", actual: plan.oceanFreightTotalUsd + Math.round(cargoQuantity * 0.70), astra: plan.oceanFreightTotalUsd },
                            { label: "First-Mile Road", icon: "🚛", actual: Math.round(plan.firstMileCostUsd * 1.16), astra: plan.firstMileCostUsd },
                            { label: "Port Handling", icon: "⚓", actual: Math.round(plan.portHandlingCostUsd * 1.15), astra: plan.portHandlingCostUsd },
                            { label: "Last-Mile Road", icon: "🏭", actual: Math.round(plan.roadFreightCostUsd * 1.16), astra: plan.roadFreightCostUsd },
                            { label: "Demurrage Risk", icon: "⏱️", actual: Math.round(plan.demurragePerHourUsd * plan.portWaitingHours * 0.8), astra: plan.demurrageRisk === "LOW" ? 0 : Math.round(plan.demurragePerHourUsd * 2) }
                          ].map(({ label, icon, actual, astra }) => {
                            const pctSaved = actual > 0 ? Math.round(((actual - astra) / actual) * 100) : 0;
                            const barWidth = actual > 0 ? Math.min(100, Math.round((astra / actual) * 100)) : 0;
                            return (
                              <div key={label}>
                                <div className="grid grid-cols-3 gap-1 items-center mb-1">
                                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300 font-semibold">
                                    <span>{icon}</span>
                                    <span className="truncate">{label}</span>
                                  </div>
                                  <div className="text-right text-[11px] font-mono font-bold text-red-400">
                                    ${(actual / 1000).toFixed(1)}k
                                  </div>
                                  <div className="text-right text-[11px] font-mono font-bold text-emerald-400">
                                    ${(astra / 1000).toFixed(1)}k
                                    {pctSaved > 0 && <span className="ml-1 text-[9px] text-emerald-500">-{pctSaved}%</span>}
                                    {astra === 0 && <span className="ml-1 text-[9px] text-emerald-500">NIL</span>}
                                  </div>
                                </div>
                                <div className="h-1 bg-red-900/50 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${barWidth}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-t border-slate-600 pt-3 space-y-2.5">
                        <div className="grid grid-cols-3 gap-1 items-center">
                          <div className="text-[11px] font-extrabold font-mono text-white uppercase tracking-wide">Total</div>
                          <div className="text-right text-[13px] font-extrabold font-mono text-red-400">
                            ${((plan.totalLandedCostUsd + plan.savingsUsd) / 1000).toFixed(1)}k
                          </div>
                          <div className="text-right text-[13px] font-extrabold font-mono text-emerald-400">
                            ${(plan.totalLandedCostUsd / 1000).toFixed(1)}k
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <div className="flex gap-3 text-slate-400">
                            <span>Wait: <strong className="text-slate-200">{plan.portWaitingHours}h</strong></span>
                            <span>Demurrage: <strong className={plan.demurrageRisk === "LOW" ? "text-emerald-400" : "text-amber-400"}>{plan.demurrageRisk}</strong></span>
                          </div>
                          <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-extrabold px-2.5 py-1 rounded-full text-[10px]">
                            Save ${plan.savingsUsd.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan Advantage Reason */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-600 font-mono">
                      💡 <strong>Execution Rationale:</strong> {plan.recommendationReason}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedPlanId(plan.planId); }}
                      className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                        isSelected 
                          ? "bg-blue-900 text-white shadow" 
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {isSelected ? "✓ Active Selected Plan" : "Select This Plan"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button onClick={() => setStep(1)} className="btn-secondary">
              <ArrowLeft size={15} /> Back to Setup
            </button>
            <button
              onClick={() => setStep(3)}
              className="btn-primary px-8 h-12 text-sm font-bold gap-2"
            >
              <span>Proceed to AI Multi-Factor Analysis ({selectedPlan.label})</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: AI MULTI-FACTOR ANALYSIS (CLEAR, VISUAL & CHART-DRIVEN) */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in">
          {/* Section Header */}
          <div className="astra-card p-5 space-y-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-900 uppercase">STEP 3 OF 4: AI MULTI-FACTOR OPTIMIZATION</span>
                <h2 className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                  AI Multi-Factor Route & Cost Optimization
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comprehensive optimization analysis for <strong>{selectedContractor.name} ({selectedContractor.vessel.name})</strong> on corridor <strong>{originPort} ➔ {destPort}</strong>.
                </p>
              </div>
              <button onClick={() => setStep(2)} className="btn-secondary text-xs">
                <ArrowLeft size={14} /> Change Contractor
              </button>
            </div>
          </div>



          {/* ========================================================================= */}
          {/* VISUAL GRAPHS & INTERACTIVE CHARTS CONTAINER */}
          {/* ========================================================================= */}
          <div className="astra-card p-6 space-y-5 bg-white border-2 border-slate-200">
            {/* Visual Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-900" />
                <h3 className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
                  Interactive AI Optimization Visualizations
                </h3>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono font-bold overflow-x-auto no-scrollbar max-w-full">
                <button
                  onClick={() => setAiChartTab("freight_curve")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 shrink-0 ${
                    aiChartTab === "freight_curve" ? "bg-blue-900 text-white shadow" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <TrendingUp size={13} />
                  <span>14-Day Freight Curve</span>
                </button>

                <button
                  onClick={() => setAiChartTab("cost_breakdown")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 shrink-0 ${
                    aiChartTab === "cost_breakdown" ? "bg-blue-900 text-white shadow" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <DollarSign size={13} />
                  <span>Cost vs Benchmark</span>
                </button>

                <button
                  onClick={() => setAiChartTab("port_queue")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 shrink-0 ${
                    aiChartTab === "port_queue" ? "bg-blue-900 text-white shadow" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Anchor size={13} />
                  <span>Port Turnaround Stages</span>
                </button>
              </div>
            </div>

            {/* TAB 1: 14-DAY FREIGHT FORWARD CURVE & TIMING ADVANTAGE */}
            {aiChartTab === "freight_curve" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div>
                    <span className="font-bold text-slate-900">Neural Freight Forward Curve (Newcastle ➔ {destPort}):</span>
                    <span className="text-slate-500 ml-2">Temporal Fusion Transformer + LightGBM (95% CI)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                      <span className="w-3 h-0.5 bg-emerald-600 inline-block" /> Locked Spot Rate (${currentSpotRate.toFixed(2)}/t)
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-red-600 font-bold">
                      <span className="w-3 h-0.5 bg-red-600 inline-block" /> 14-Day Projected Spike
                    </span>
                  </div>
                </div>

                <div className="h-[280px] w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={freightCurveData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#64748b" }} unit="$" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace" }}
                        formatter={(val, name) => [`$${Number(val).toFixed(2)} / MT`, name]}
                      />
                      <Area type="monotone" dataKey="confidenceUpper" stroke="none" fill="#fecaca" fillOpacity={0.4} name="95% CI Upper" />
                      <Area type="monotone" dataKey="confidenceLower" stroke="none" fill="#fecaca" fillOpacity={0.4} name="95% CI Lower" />
                      <Line type="monotone" dataKey="actual" stroke="#1e3a8a" strokeWidth={2.5} dot={{ r: 3 }} name="Historical Spot" />
                      <Line type="monotone" dataKey="projected" stroke="#dc2626" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} name="Projected Forward Spike" />
                      <Line type="monotone" dataKey="lockedSpot" stroke="#059669" strokeWidth={2} dot={false} name="Locked Spot Price" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs font-mono text-emerald-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <TrendingUp size={15} className="text-emerald-700" /> Timing Recommendation: Lock Spot Rate Today
                  </span>
                  <span>Projected forward rise of +$0.50/t captures <strong>+${(cargoQuantity * 0.50).toLocaleString()} net cost avoidance</strong>.</span>
                </div>
              </div>
            )}

            {/* TAB 2: MULTIMODAL COST VS MARKET BENCHMARK */}
            {aiChartTab === "cost_breakdown" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div>
                    <span className="font-bold text-slate-900">Multimodal Landed Cost Comparison (USD):</span>
                    <span className="text-slate-500 ml-2">Traditional Fragmented Booking vs ASTRA AI Multimodal Optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      Net Multimodal Savings: +${selectedContractor.savingsUsd.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="h-[280px] w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={costBreakdownData} 
                      margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
                      onMouseMove={(state) => {
                        if (state && state.activeLabel) {
                          setHoveredCostCategory(state.activeLabel);
                        }
                      }}
                      onMouseLeave={() => setHoveredCostCategory(null)}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                      {/* Floating tooltip disabled so blackbox does not cover the chart; user reads the highlighted card below */}
                      <Tooltip content={() => null} cursor={{ fill: "rgba(226, 232, 240, 0.45)" }} />
                      <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
                      <Bar dataKey="Traditional Booking" fill="#94a3b8" radius={[4, 4, 0, 0]}>
                        {costBreakdownData.map((entry, index) => (
                          <Cell 
                            key={`trad-${index}`} 
                            fill="#94a3b8" 
                            opacity={hoveredCostCategory ? (hoveredCostCategory === entry.category ? 1 : 0.35) : 0.85} 
                          />
                        ))}
                      </Bar>
                      <Bar dataKey="ASTRA Multimodal AI" fill="#059669" radius={[4, 4, 0, 0]}>
                        {costBreakdownData.map((entry, index) => (
                          <Cell 
                            key={`astra-${index}`} 
                            fill={hoveredCostCategory === entry.category ? "#047857" : "#059669"} 
                            opacity={hoveredCostCategory ? (hoveredCostCategory === entry.category ? 1 : 0.35) : 1} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Interactive Explanatory Cards with Hover Effect & Full Details from Blackbox */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
                  {costBreakdownData.slice(0, 4).map((c) => {
                    const isHovered = hoveredCostCategory === c.category;
                    return (
                      <div 
                        key={c.category}
                        onMouseEnter={() => setHoveredCostCategory(c.category)}
                        onMouseLeave={() => setHoveredCostCategory(null)}
                        className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                          isHovered
                            ? "bg-emerald-50/95 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl -translate-y-1.5 scale-[1.01]"
                            : hoveredCostCategory
                            ? "bg-slate-50/80 border-slate-200 opacity-60 hover:opacity-100"
                            : "bg-slate-50/90 border-slate-200 hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-1 pb-2 border-b border-slate-200/80">
                            <span className="text-slate-800 text-[11px] uppercase font-bold tracking-tight">{c.category}</span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                              Save ${c.savings.toLocaleString()}
                            </span>
                          </div>

                          {/* Cost Comparison: Traditional vs ASTRA AI */}
                          <div className="py-2.5 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>Traditional:</span>
                              <span className="font-semibold text-slate-600 line-through">${c["Traditional Booking"].toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-emerald-900">ASTRA AI:</span>
                              <span className="font-extrabold text-emerald-700 text-sm">${c["ASTRA Multimodal AI"].toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Full Why Cheaper Explanation */}
                        <div className="pt-2.5 mt-1 border-t border-slate-200/80 text-[11px] text-slate-700 leading-snug">
                          <span className="text-amber-800 font-bold">💡 Why cheaper: </span>
                          <span>{c.whyCheaper}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Demurrage Risk Shield Highlight Box */}
                <div 
                  onMouseEnter={() => setHoveredCostCategory("Demurrage Risk")}
                  onMouseLeave={() => setHoveredCostCategory(null)}
                  className={`p-3.5 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-2.5 ${
                    hoveredCostCategory === "Demurrage Risk"
                      ? "bg-emerald-100/90 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg -translate-y-1"
                      : "bg-emerald-50/80 border-emerald-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={20} className="text-emerald-700 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Demurrage Risk Protected ($0 Charge):</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                          Save ${Math.round(selectedContractor.demurragePerHourUsd * (activeDest.waitHours || 12) * 0.8).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Traditional chartering risks <strong>${Math.round(selectedContractor.demurragePerHourUsd * (activeDest.waitHours || 12) * 0.8).toLocaleString()}</strong> in port waiting fees. 💡 <strong className="text-amber-800">Why cheaper:</strong> Zero demurrage — Just-In-Time (JIT) vessel arrival eliminates the average {activeDest.waitHours || 12}-hour anchorage wait.
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-700 text-white text-[10px] font-bold shrink-0 self-start md:self-auto">
                    JIT Siding Alignment Active
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: PORT TURNAROUND STAGES & DEMURRAGE SHIELD */}
            {aiChartTab === "port_queue" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div>
                    <span className="font-bold text-slate-900">Port Turnaround Pipeline & Queue Breakdown ({destPort} Port):</span>
                    <span className="text-slate-500 ml-2">Total Estimated Turnaround: <strong>{totalPortHours} Hours</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Historical Wait Queue: {activeDest.waitHours}h
                    </span>
                  </div>
                </div>

                <div className="h-[280px] w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={portQueueStages} 
                      layout="vertical" 
                      margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                      onMouseMove={(state) => {
                        if (state && state.activeLabel) {
                          setHoveredPortStage(state.activeLabel);
                        } else if (state && state.activePayload && state.activePayload.length) {
                          setHoveredPortStage(state.activePayload[0].payload?.stage || null);
                        }
                      }}
                      onMouseLeave={() => setHoveredPortStage(null)}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} unit="h" />
                      <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: "#64748b" }} width={140} />
                      {/* Floating tooltip disabled so blackbox does not cover the chart; user reads the highlighted card below */}
                      <Tooltip content={() => null} cursor={{ fill: "rgba(226, 232, 240, 0.45)" }} />
                      <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                        {portQueueStages.map((entry, index) => {
                          const baseColor = entry.type === "Waiting" ? "#f59e0b" : entry.type === "Operations" ? "#1e3a8a" : "#059669";
                          const isHovered = hoveredPortStage === entry.stage;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={baseColor}
                              opacity={hoveredPortStage ? (isHovered ? 1 : 0.35) : 0.9}
                              className="cursor-pointer transition-opacity duration-150"
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Interactive 5-Stage Step Breakdown with Synchronized Hover (Replaces Floating Blackbox) */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-xs font-mono">
                  {portQueueStages.map((s, idx) => {
                    const isHovered = hoveredPortStage === s.stage;
                    const pctOfStay = Math.round((s.hours / Number(totalPortHours)) * 100);
                    
                    const themeClasses = isHovered
                      ? s.type === "Waiting"
                        ? "bg-amber-50/95 border-amber-500 ring-2 ring-amber-400/40 shadow-xl -translate-y-1.5 scale-[1.01]"
                        : s.type === "Operations"
                        ? "bg-blue-50/95 border-blue-500 ring-2 ring-blue-400/40 shadow-xl -translate-y-1.5 scale-[1.01]"
                        : "bg-emerald-50/95 border-emerald-500 ring-2 ring-emerald-400/40 shadow-xl -translate-y-1.5 scale-[1.01]"
                      : hoveredPortStage
                      ? "bg-slate-50/70 border-slate-200 opacity-60 hover:opacity-100"
                      : "bg-slate-50/90 border-slate-200 hover:border-slate-300 hover:shadow-sm";

                    const badgeClasses = s.type === "Waiting"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : s.type === "Operations"
                      ? "bg-blue-100 text-blue-900 border border-blue-300"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-300";

                    return (
                      <div
                        key={s.stage}
                        onMouseEnter={() => setHoveredPortStage(s.stage)}
                        onMouseLeave={() => setHoveredPortStage(null)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${themeClasses}`}
                      >
                        <div>
                          <div className="flex justify-between items-center text-[10px] pb-1.5 border-b border-slate-200/70">
                            <span className="text-slate-500 font-semibold">Stage {idx + 1}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${badgeClasses}`}>
                              {s.status}
                            </span>
                          </div>
                          
                          <div className="font-bold text-slate-900 mt-2 text-[12px] leading-snug">
                            {s.stage}
                          </div>
                          
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-base font-extrabold text-slate-900">{s.hours}h</span>
                            <span className="text-[10px] text-slate-500 font-medium">({pctOfStay}% of stay)</span>
                          </div>

                          {/* Full Operational Description from previous blackbox */}
                          <div className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                            {s.desc}
                          </div>
                        </div>

                        {/* Company Impact Callout from previous blackbox */}
                        <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[10px] leading-relaxed">
                          <span className="text-slate-400 uppercase font-bold text-[9px] block">Company Impact:</span>
                          <span className={s.type === "Waiting" ? "text-amber-900 font-semibold" : "text-slate-700"}>
                            🎯 {s.whyItMatters}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Highlighted Stage Live Inspector Box */}
                {hoveredPortStage && (() => {
                  const activeStage = portQueueStages.find(s => s.stage === hoveredPortStage);
                  if (!activeStage) return null;
                  return (
                    <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 text-xs font-mono flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg animate-in fade-in zoom-in-95 duration-150">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400 text-sm">{activeStage.stage}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            activeStage.type === "Waiting" ? "bg-amber-900/80 text-amber-300 border border-amber-700" :
                            activeStage.type === "Operations" ? "bg-blue-900/80 text-blue-300 border border-blue-700" :
                            "bg-emerald-900/80 text-emerald-300 border border-emerald-700"
                          }`}>
                            {activeStage.hours} Hours ({Math.round((activeStage.hours / Number(totalPortHours)) * 100)}% of stay) · {activeStage.status}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {activeStage.desc}
                        </p>
                      </div>
                      <div className="md:border-l md:border-slate-800 md:pl-4 shrink-0 text-[11px] max-w-sm">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Operational Impact:</span>
                        <span className="text-emerald-400 font-semibold leading-tight">
                          🎯 {activeStage.whyItMatters}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs font-mono text-blue-950 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-blue-900 shrink-0" />
                    <span>
                      Mechanized Berth #2 Allocated: Discharge rate: <strong>2,800 MT/hr</strong> with automated conveyor to waiting road truck fleet.
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded self-start md:self-auto">
                    Formula: {cargoQuantity.toLocaleString()} MT ÷ 2,800 MT/hr = {dischargeHours}h
                  </span>
                </div>
              </div>
            )}


          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-2">
            <button onClick={() => setStep(2)} className="btn-secondary">
              <ArrowLeft size={15} /> Back / Choose Different Contractor
            </button>
            <button
              onClick={() => setStep(4)}
              className="btn-primary px-8 h-12 text-sm font-bold gap-2"
            >
              <span>Accept AI Optimization & Proceed to Confirm</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: EXECUTIVE DECISION DOSSIER & FORMAL MEMORANDUM REPORT */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in" data-testid="executive-dossier-report">
          {/* Top Actions & Breadcrumb Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 no-print print:hidden">
            <button 
              onClick={() => setStep(3)} 
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back to AI Analysis
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 hidden sm:inline">
                Dossier: ASTRA-MEMO-VOY-2026-{String(cargoQuantity).slice(0, 3)}
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-blue-900 text-white font-mono font-bold text-xs hover:bg-blue-800 transition shadow flex items-center gap-2"
              >
                <Printer size={15} />
                <span>Print / Export Executive Memorandum (PDF)</span>
              </button>
            </div>
          </div>

          {/* Master Formal Executive Memorandum Card */}
          <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-10 shadow-xl space-y-8 font-sans print:border-none print:shadow-none print:p-2 text-slate-900">
            
            {/* Formal Masthead & Executive Letterhead (Clean typography, no external logo) */}
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-blue-900 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      ASTRA MARITIME MULTIMODAL INTELLIGENCE · EXECUTIVE MEMORANDUM
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "Manrope" }}>
                    Dry-Bulk Vessel Chartering & Logistics Decision Dossier
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    East Coast India Strategic Bulk Import Logistics, Intermodal Routing & Freight Risk Assessment
                  </p>
                </div>

                {/* Formal Document Meta Box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1 text-slate-600 shrink-0 min-w-[280px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dossier Ref:</span>
                    <strong className="text-slate-900">ASTRA-MEMO-VOY-2026-{String(cargoQuantity).slice(0, 3)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date & Time:</span>
                    <span>{todayStr} · Live Execution</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Standard:</span>
                    <span className="text-blue-900 font-bold">ISO-IEC-IEEE 29148 / BIMCO</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                    <span className="text-slate-400">Shipper Entity:</span>
                    <strong className="text-slate-900 truncate max-w-[160px]">{companyName}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Section A — Executive Decision Summary & Mandate */}
            <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/80 border border-blue-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm uppercase tracking-wide font-mono">
                <ShieldCheck size={18} className="text-blue-900 shrink-0" />
                <span>Section A — Executive Decision Summary & Mandate</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                <strong>Executive Recommendation:</strong> Execute immediate vessel fixture under an <strong>Optimized Charter Now</strong> mandate. Chartering operations should fix <strong>{preferredVesselCategory}</strong> tonnage ({currentSpec.desc}) via <strong>{selectedContractor.name}</strong> under a <strong>{contractDuration}</strong> structure across the scheduled import campaign ({Number(cargoQuantity).toLocaleString()} MT total cargo volume).
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-mono">
                <div className="p-2.5 bg-white/90 rounded-lg border border-blue-200 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Estimated Commercial Benefit:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    +${selectedContractor.savingsUsd.toLocaleString()} USD Cost Avoidance
                  </span>
                </div>
                <div className="p-2.5 bg-white/90 rounded-lg border border-blue-200 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Demurrage Risk Shield:</span>
                  <span className="font-bold text-blue-900">
                    Zero Demurrage (JIT Pre-Allocated Berth)
                  </span>
                </div>
              </div>
            </div>

            {/* Section B — Cargo & Voyage Operational Specifications */}
            <div className="space-y-3">
              <div className="text-xs font-mono font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-2">
                <Ship size={15} className="text-slate-700" />
                <span>Section B — Cargo & Voyage Operational Specifications</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">COMMODITY</span>
                  <div className="font-extrabold text-slate-900 text-sm">{cargoType}</div>
                  <span className="text-[11px] text-slate-500">Dry Bulk Industrial Classification</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">PARCEL QUANTITY</span>
                  <div className="font-extrabold text-slate-900 text-sm">{Number(cargoQuantity).toLocaleString()} MT</div>
                  <span className="text-[11px] text-emerald-700 font-bold">±5% MOLOO Margin Standard</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">ORIGIN FAIRWAY & SIDING</span>
                  <div className="font-extrabold text-slate-900 text-sm">{activeOrigin.port}, {activeOrigin.country}</div>
                  <span className="text-[11px] text-slate-500 truncate block">{activeOrigin.warehouse} ({activeOrigin.distNm} NM)</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">DESTINATION JETTY & FACILITY</span>
                  <div className="font-extrabold text-slate-900 text-sm">{destPort} Port ({activeDest.state})</div>
                  <span className="text-[11px] text-slate-500 truncate block">{activeDest.plant} · Max Draft: {activeDest.maxDraft}m</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Laycan Window:</span>
                  <strong className="text-slate-900">{requiredArrivalDate} (Earliest Selectable Arrival)</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Contract Structure:</span>
                  <strong className="text-blue-900">{contractDuration} ({contractDuration === "1 voyage (Spot)" ? "1 Single Delivery" : `${expectedVoyages}x Sequential Voyages`})</strong>
                </div>
              </div>
            </div>

            {/* Section C — Recommended Multimodal Execution Plan & Vessel Specification */}
            <div className="space-y-3">
              <div className="text-xs font-mono font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award size={15} className="text-blue-900" />
                  <span>Section C — Selected Execution Plan & Vessel Technical Specifications</span>
                </div>
                <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedPlan.label}: {selectedPlan.tag}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">NOMINATED VESSEL CLASS & NAME</span>
                    <div className="text-sm font-extrabold text-blue-900 mt-0.5">
                      {preferredVesselCategory} · {selectedContractor.vessel.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {currentSpec.dwt.toLocaleString()} DWT · {selectedContractor.vessel.flag || "Panama"} Flag
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">VESSEL DIMENSIONS & FAIRWAY CLEARANCE</span>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                      Beam: {currentSpec.beam}m · LOA: {currentSpec.loa}m · Draft: {currentSpec.draft}m
                    </div>
                    <div className={`text-[11px] font-bold ${activeDest.maxDraft >= currentSpec.draft ? "text-emerald-700" : "text-amber-700"}`}>
                      {activeDest.maxDraft >= currentSpec.draft 
                        ? `✓ Safe Direct Berth (+${(activeDest.maxDraft - currentSpec.draft).toFixed(1)}m underkeel margin)`
                        : `⚠️ Deepwater transshipment / lightering required at ${destPort} (${activeDest.maxDraft}m limit)`}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">ENGINE EFFICIENCY & RIGHTSHIP RATING</span>
                    <div className="text-sm font-extrabold text-emerald-800 mt-0.5">
                      {selectedContractor.vessel.healthScore || 96.8}% Engine Score · {selectedContractor.vessel.ciiRating || "Grade A"}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Burn: {selectedContractor.vessel.dailyFuelBurn || "48.5 MT/day"} @ 13.8 kts · RightShip 5★
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-bold">Logistics Strategy:</span>
                    <strong className="text-blue-900">{selectedPlan.operatorModelTitle}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Origin Drayage Partner:</span>
                    <strong className="text-slate-900">{selectedPlan.originOperator} ({selectedPlan.firstMileTrucks} Tippers)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Ocean Bulk Carrier:</span>
                    <strong className="text-slate-900">{selectedPlan.oceanCarrier} ({selectedPlan.contractor?.reliability || "98.4%"})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Destination Hinterland:</span>
                    <strong className="text-slate-900">{selectedPlan.lastMileOperator} ({selectedPlan.lastMileTrucks} Trucks)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Section D — Multimodal Landed Cost Financial Breakdown */}
            <div className="space-y-3 print:break-inside-avoid">
              <div className="text-xs font-mono font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={15} className="text-emerald-700" />
                  <span>Section D — Multimodal Landed Cost Financial Statement & Cost Avoidance</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                  Net Realized Savings: +${selectedContractor.savingsUsd.toLocaleString()} USD
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Cost Component</th>
                      <th className="py-2.5 px-3">Traditional Fragmented Booking</th>
                      <th className="py-2.5 px-3 text-emerald-900">ASTRA Multimodal AI</th>
                      <th className="py-2.5 px-3 text-emerald-700">Net Cost Avoidance</th>
                      <th className="py-2.5 px-3">Operational Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {costBreakdownData.map((row) => (
                      <tr key={row.category} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.category}</td>
                        <td className="py-2.5 px-3 text-slate-500 line-through">${row["Traditional Booking"].toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-extrabold text-slate-900 text-emerald-800">${row["ASTRA Multimodal AI"].toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">-${row.savings.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-xs">{row.whyCheaper}</td>
                      </tr>
                    ))}
                    {/* Total Summary Row */}
                    <tr className="bg-slate-900 text-white font-extrabold border-t-2 border-slate-900">
                      <td className="py-3 px-3 uppercase tracking-wider">TOTAL LANDED COST</td>
                      <td className="py-3 px-3 text-slate-400 line-through">
                        ${(selectedContractor.totalLandedCostUsd + selectedContractor.savingsUsd).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-emerald-400 text-sm">
                        ${selectedContractor.totalLandedCostUsd.toLocaleString()} USD
                      </td>
                      <td className="py-3 px-3 text-emerald-300 text-sm">
                        +${selectedContractor.savingsUsd.toLocaleString()} SAVED
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-300">
                        Unit Rate: <strong>${selectedContractor.landedCostPerTonUsd} / MT Landed</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section E — Port Turnaround & Hydrodynamic Berth Pipeline */}
            <div className="space-y-3">
              <div className="text-xs font-mono font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-2">
                <Anchor size={15} className="text-amber-600" />
                <span>Section E — Port Turnaround & Hydrodynamic Berth Pipeline ({destPort} Port)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-bold">PILOTAGE & FAIRWAY</span>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">2.5 Hours</div>
                  <span className="text-[10px] text-slate-500">Outer Fairway Navigation</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-700 block font-bold">ANCHORAGE WAIT</span>
                  <div className="text-base font-extrabold text-emerald-800 mt-0.5">0.0 Hours</div>
                  <span className="text-[10px] text-emerald-700 font-bold">JIT Pre-Booking Shield</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-bold">TUG & MOORING</span>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">1.5 Hours</div>
                  <span className="text-[10px] text-slate-500">Twin Tractor Tugs</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-bold">CONVEYOR DISCHARGE</span>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">~{dischargeHours} Hours</div>
                  <span className="text-[10px] text-slate-500">2,800 MT/hr Mechanized Jetty</span>
                </div>
              </div>
            </div>

            {/* Section F — Formal Governance Sign-Off & Execution Action */}
            <div className="space-y-3 pt-2 border-t-2 border-slate-200">
              <div className="text-xs font-mono font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileCheck size={15} className="text-blue-900" />
                <span>Section F — Formal Governance Sign-Off & Execution Certificate</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">COMMERCIAL SHIPPERS DESK</span>
                  <div className="font-extrabold text-slate-900 truncate">{companyName}</div>
                  <div className="text-[11px] text-slate-500">Procurement & Chartering Authority</div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 mt-1">
                    ✓ DIGITALLY AUTHORIZED
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">CONTRACTOR ALLOCATION DESK</span>
                  <div className="font-extrabold text-slate-900">{selectedContractor.name}</div>
                  <div className="text-[11px] text-slate-500">Vessel Operations & Logistics Desk</div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200 mt-1">
                    ✓ READY FOR FIXTURE
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">CRYPTOGRAPHIC AUDIT PROOF</span>
                  <div className="text-[11px] text-slate-600 font-mono truncate">SHA-256: 7f9b8c...dossier-2026</div>
                  <div className="text-[11px] text-slate-500">ISO-29148 Standard Compliant</div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 mt-1">
                    TIMESTAMP: {todayStr}
                  </span>
                </div>
              </div>
            </div>

            {/* Final Action & Dispatch Controls */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print print:hidden">
              <button 
                onClick={() => setStep(3)} 
                className="btn-secondary w-full sm:w-auto"
              >
                <ArrowLeft size={15} /> Back to AI Analysis
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-3 rounded-lg border border-slate-300 font-mono font-bold text-xs text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Printer size={16} />
                  <span>Print Dossier (PDF)</span>
                </button>

                <button
                  onClick={handleConfirmAndDispatch}
                  className="btn-primary px-8 h-12 text-sm font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-xl w-full sm:w-auto"
                >
                  <CheckCircle2 size={18} />
                  <span>Authorize & Dispatch Requirement to Contractor Fleet Desk</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
