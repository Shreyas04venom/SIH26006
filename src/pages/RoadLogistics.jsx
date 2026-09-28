import React, { useState, useMemo, useEffect } from "react";
import { useFlow } from "../lib/flow";
import CorridorLeafletMap from "../components/CorridorLeafletMap";
import { getCorridorData } from "../data/corridorsData";
import { 
  Truck, QrCode, ArrowRight, ShieldCheck, Clock, 
  CheckCircle2, AlertTriangle, Fuel, User, Navigation, 
  Zap, AlertOctagon, Phone, Calendar, Camera, Check, 
  X, Cpu, FileText, Printer, Building2, Anchor, Sparkles
} from "lucide-react";
import { toast } from "sonner";

// Sample First-Mile Trucks: Strictly Overseas Mine Siding to Deepwater Export Port (Zero East Coast India)
const SAMPLE_FIRST_MILE_TRUCKS = [
  {
    id: "TRK-FM-01",
    company: "Glencore Hunter Logistics",
    companyCode: "GLEN",
    countryCode: "AUS",
    plate: "NSW-4821-B",
    model: "Kenworth T909 High-Capacity B-Double",
    driver: "Liam Hughes",
    driverPhone: "+61 412 882 109",
    driverDl: "NSW-DL-982104",
    cargoType: "Metallurgical Coking Coal",
    cargoQuantityMt: 68.5,
    targetPayloadMt: 68.5,
    assignedSlot: "14:00 - 14:30 HRS",
    etaWindow: "ON-TIME (14:12)",
    designatedBay: "Carrington Berth #2 Conveyor Infeed",
    grossWeightMt: 85.2,
    tareWeightMt: 16.7,
    gatePassId: "GP-PWCS-8801",
    fuelPct: 88,
    speedKmh: 62,
    isGateCleared: true,
    telematics: {
      engineRpm: 1450,
      coolantTempC: 86,
      engineOilPressureBar: 4.3,
      batteryVoltage: 24.5,
      defRemainingPct: 88,
      odometerKm: 182400,
      tpmsStatus: "All 22 Tires Normal (115 PSI)",
      dmsFatigueStatus: "Attentive / Normal",
      breathalyzerTest: "0.00% BAC (PASS)"
    },
    fastag: {
      tagId: "NSW-LINKT-82032049281",
      issuer: "Linkt e-Toll NSW",
      balanceInr: 320,
      lastTollPassed: "Singleton Bypass (M15 Hunter Exp)",
      lastTollAmountInr: 18,
      lastTollTime: "14:12:08 HRS",
      status: "ACTIVE"
    },
    originLoadingBay: "Hunter Valley Mine Siding #4",
    destinationPoint: "Port of Newcastle Carrington Coal Berth #2",
    corridorRouteName: "M15 Hunter Expressway Corridor",
    lat: -32.5500,
    lon: 151.1800
  },
  {
    id: "TRK-FM-02",
    company: "Yancoal Bulga Fleet",
    companyCode: "YANC",
    countryCode: "AUS",
    plate: "NSW-4822-B",
    model: "Mack Titan Super B-Double Heavy Haul",
    driver: "Callum Murphy",
    driverPhone: "+61 423 914 302",
    driverDl: "NSW-DL-941029",
    cargoType: "Premium Semi-Soft Coking Coal",
    cargoQuantityMt: 66.8,
    targetPayloadMt: 66.8,
    assignedSlot: "14:30 - 15:00 HRS",
    etaWindow: "ON-TIME (14:38)",
    designatedBay: "Carrington Berth #2 Conveyor Infeed",
    grossWeightMt: 84.1,
    tareWeightMt: 17.3,
    gatePassId: "GP-PWCS-8802",
    fuelPct: 79,
    speedKmh: 58,
    isGateCleared: true,
    telematics: {
      engineRpm: 1410,
      coolantTempC: 85,
      engineOilPressureBar: 4.2,
      batteryVoltage: 24.3,
      defRemainingPct: 82,
      odometerKm: 142100,
      tpmsStatus: "All 22 Tires Normal (114 PSI)",
      dmsFatigueStatus: "Attentive / Normal",
      breathalyzerTest: "0.00% BAC (PASS)"
    },
    fastag: {
      tagId: "NSW-LINKT-82032049282",
      issuer: "Linkt e-Toll NSW",
      balanceInr: 450,
      lastTollPassed: "Belford Toll Portal (M15)",
      lastTollAmountInr: 18,
      lastTollTime: "14:28:15 HRS",
      status: "ACTIVE"
    },
    originLoadingBay: "Hunter Valley Mine Siding #4",
    destinationPoint: "Port of Newcastle Carrington Coal Berth #2",
    corridorRouteName: "M15 Hunter Expressway Corridor",
    lat: -32.6800,
    lon: 151.3500
  },
  {
    id: "TRK-FM-03",
    company: "Aurizon Heavy Road Logistics",
    companyCode: "AURI",
    countryCode: "AUS",
    plate: "NSW-4823-B",
    model: "Volvo FH16 700 Tri-Drive Road Train",
    driver: "Jack Anderson",
    driverPhone: "+61 435 601 884",
    driverDl: "NSW-DL-883192",
    cargoType: "Thermal Coal (High GCV)",
    cargoQuantityMt: 70.0,
    targetPayloadMt: 70.0,
    assignedSlot: "15:00 - 15:30 HRS",
    etaWindow: "ON-TIME (15:04)",
    designatedBay: "PWCS Kooragang Rail/Road Dump",
    grossWeightMt: 88.0,
    tareWeightMt: 18.0,
    gatePassId: "GP-PWCS-8803",
    fuelPct: 84,
    speedKmh: 64,
    isGateCleared: true,
    telematics: {
      engineRpm: 1480,
      coolantTempC: 87,
      engineOilPressureBar: 4.5,
      batteryVoltage: 24.6,
      defRemainingPct: 89,
      odometerKm: 112000,
      tpmsStatus: "All 22 Tires Normal (116 PSI)",
      dmsFatigueStatus: "Attentive / Normal",
      breathalyzerTest: "0.00% BAC (PASS)"
    },
    fastag: {
      tagId: "NSW-LINKT-82032049283",
      issuer: "Linkt e-Toll NSW",
      balanceInr: 510,
      lastTollPassed: "Branxton Interchange (M15)",
      lastTollAmountInr: 18,
      lastTollTime: "14:45:00 HRS",
      status: "ACTIVE"
    },
    originLoadingBay: "Hunter Valley Mine Siding #4",
    destinationPoint: "Port of Newcastle Carrington Coal Berth #2",
    corridorRouteName: "M15 Hunter Expressway Corridor",
    lat: -32.7800,
    lon: 151.5200
  },
  {
    id: "TRK-FM-04",
    company: "Toll Bulk Resources",
    companyCode: "TOLL",
    countryCode: "AUS",
    plate: "NSW-4824-B",
    model: "Scania R620 Heavy Tipper B-Double",
    driver: "Angus Campbell",
    driverPhone: "+61 448 229 015",
    driverDl: "NSW-DL-918234",
    cargoType: "Low-Ash Metallurgical Coal",
    cargoQuantityMt: 64.5,
    targetPayloadMt: 64.5,
    assignedSlot: "15:15 - 15:45 HRS",
    etaWindow: "ON-TIME (15:20)",
    designatedBay: "Carrington Berth #2 In-Gate Weighbridge",
    grossWeightMt: 81.2,
    tareWeightMt: 16.7,
    gatePassId: "GP-PWCS-8804",
    fuelPct: 71,
    speedKmh: 42,
    isGateCleared: false,
    telematics: {
      engineRpm: 1390,
      coolantTempC: 86,
      engineOilPressureBar: 4.1,
      batteryVoltage: 24.4,
      defRemainingPct: 76,
      odometerKm: 204500,
      tpmsStatus: "All 22 Tires Normal (112 PSI)",
      dmsFatigueStatus: "Attentive / Normal",
      breathalyzerTest: "0.00% BAC (PASS)"
    },
    fastag: {
      tagId: "NSW-LINKT-82032049284",
      issuer: "Linkt e-Toll NSW",
      balanceInr: 280,
      lastTollPassed: "Kurri Kurri Toll Plaza (M15)",
      lastTollAmountInr: 18,
      lastTollTime: "14:55:22 HRS",
      status: "ACTIVE"
    },
    originLoadingBay: "Hunter Valley Mine Siding #4",
    destinationPoint: "Port of Newcastle Carrington Coal Berth #2",
    corridorRouteName: "M15 Hunter Expressway Corridor",
    lat: -32.8900,
    lon: 151.7200
  }
];

// Sample Last-Mile Trucks: Strictly East Coast India Discharge Port to Domestic Consignee Warehouse & Plant
const SAMPLE_LAST_MILE_TRUCKS = [
  {
    id: "TRK-LM-01",
    company: "Tata Steel Logistics",
    companyCode: "TATA",
    countryCode: "IND",
    plate: "OD-05-AX-4821",
    model: "Tata Signa 4825.TK Heavy Tipper",
    driver: "Ramesh Kumar",
    driverPhone: "+91 98451 22801",
    driverDl: "OD-052019003412",
    cargoType: "Metallurgical Coking Coal",
    cargoQuantityMt: 40.2,
    targetPayloadMt: 40.2,
    assignedSlot: "14:00 - 14:30 HRS",
    etaWindow: "ON-TIME (14:12)",
    designatedBay: "Rotary Tippler #01 (Coal Stockpile)",
    grossWeightMt: 54.4,
    tareWeightMt: 14.2,
    gatePassId: "GP-TATA-8801",
    fuelPct: 84,
    speedKmh: 56,
    isGateCleared: true,
    telematics: {
      engineRpm: 1420,
      coolantTempC: 87,
      engineOilPressureBar: 4.2,
      batteryVoltage: 24.4,
      defRemainingPct: 84,
      odometerKm: 142820,
      tpmsStatus: "All 16 Tires Normal (110 PSI)",
      dmsFatigueStatus: "Attentive / Normal",
      breathalyzerTest: "0.00% BAC (PASS)"
    },
    fastag: {
      tagId: "34161FA820320492812001",
      issuer: "SBI FASTag",
      balanceInr: 4850,
      lastTollPassed: "Marshaghai Toll Plaza (NH-53)",
      lastTollAmountInr: 265,
      lastTollTime: "14:12:08 HRS",
      status: "ACTIVE"
    },
    originLoadingBay: "Paradip Port Bulk Jetty",
    destinationPoint: "Angul Integrated Steel Complex (WH-07)",
    corridorRouteName: "NH-53 Heavy Industrial Corridor",
    lat: 20.3120,
    lon: 86.6450
  },
  {
    id: "TRK-LM-02",
    company: "Jindal Steel & Power (JSPL)",
    companyCode: "JSPL",
    countryCode: "IND",
    plate: "OD-05-AX-4822",
    model: "BharatBenz 4228R Multi-Axle",
    driver: "Satish Jena",
    driverPhone: "+91 94371 55102",
    driverDl: "OD-052020004123",
    cargoType: "Thermal Coal (High GCV)",
    cargoQuantityMt: 39.8,
    targetPayloadMt: 39.8,
    assignedSlot: "14:30 - 15:00 HRS",
    etaWindow: "ON-TIME (14:38)",
    designatedBay: "Rotary Tippler #02 (Boiler Feed)",
    grossWeightMt: 53.9,
    tareWeightMt: 14.1,
    gatePassId: "GP-JSPL-8802",
    fuelPct: 76,
    speedKmh: 48,
    isGateCleared: true,
    telematics: {
      engineRpm: 1380,
      coolantTempC: 85,
      engineOilPressureBar: 4.0,
      batteryVoltage: 24.2,
      defRemainingPct: 78,
      odometerKm: 118450,
      tpmsStatus: "All 16 Tires Normal (108 PSI)",
      dmsFatigueStatus: "Attentive / Normal",
      breathalyzerTest: "0.00% BAC (PASS)"
    },
    fastag: {
      tagId: "34161FA820320492812002",
      issuer: "HDFC FASTag",
      balanceInr: 5200,
      lastTollPassed: "Marshaghai Toll Plaza (NH-53)",
      lastTollAmountInr: 265,
      lastTollTime: "14:28:15 HRS",
      status: "ACTIVE"
    },
    originLoadingBay: "Paradip Port Bulk Jetty",
    destinationPoint: "Angul Integrated Steel Complex (WH-07)",
    corridorRouteName: "NH-53 Heavy Industrial Corridor",
    lat: 20.4385,
    lon: 86.4320
  },
  {
    id: "TRK-LM-03",
    company: "JSW Steel Logistics",
    companyCode: "JSW",
    countryCode: "IND",
    plate: "OD-05-AX-4823",
    model: "Volvo FMX 460 Mining Tipper",
    driver: "Manoj Pradhan",
    driverPhone: "+91 97762 90114",
    driverDl: "OD-052018009214",
    cargoType: "High-Grade Iron Ore Fines",
    cargoQuantityMt: 42.5,
    targetPayloadMt: 42.5,
    assignedSlot: "15:00 - 15:30 HRS",
    etaWindow: "ON-TIME (15:04)",
    designatedBay: "Ore Stockyard Hopper #03",
    grossWeightMt: 56.8,
    tareWeightMt: 14.3,
    gatePassId: "GP-JSW-8803",
    fuelPct: 82,
    speedKmh: 52,
    isGateCleared: true,
    telematics: {
      engineRpm: 1460,
      coolantTempC: 88,
      engineOilPressureBar: 4.4,
      batteryVoltage: 24.6,
      defRemainingPct: 88,
      odometerKm: 94210,
      tpmsStatus: "All 16 Tires Normal (112 PSI)",
      dmsFatigueStatus: "Attentive / Normal",
      breathalyzerTest: "0.00% BAC (PASS)"
    },
    fastag: {
      tagId: "34161FA820320492812003",
      issuer: "ICICI FASTag",
      balanceInr: 6150,
      lastTollPassed: "Marshaghai Toll Plaza (NH-53)",
      lastTollAmountInr: 265,
      lastTollTime: "14:45:00 HRS",
      status: "ACTIVE"
    },
    originLoadingBay: "Paradip Port Bulk Jetty",
    destinationPoint: "Angul Integrated Steel Complex (WH-07)",
    corridorRouteName: "NH-53 Heavy Industrial Corridor",
    lat: 20.5210,
    lon: 86.2100
  },
  {
    id: "TRK-LM-04",
    company: "Vedanta Aluminium Logistics",
    companyCode: "VEDANTA",
    countryCode: "IND",
    plate: "OD-05-AX-4824",
    model: "Scania P410 Extra Heavy",
    driver: "Subrat Das",
    driverPhone: "+91 98610 33491",
    driverDl: "OD-052021003482",
    cargoType: "Calcined Petroleum Coke",
    cargoQuantityMt: 35.0,
    targetPayloadMt: 35.0,
    assignedSlot: "15:15 - 15:45 HRS",
    etaWindow: "ON-TIME (15:20)",
    designatedBay: "Pneumatic Alumina Silo Bay",
    grossWeightMt: 49.3,
    tareWeightMt: 14.3,
    gatePassId: "GP-VED-8804",
    fuelPct: 68,
    speedKmh: 45,
    isGateCleared: false,
    telematics: {
      engineRpm: 1400,
      coolantTempC: 86,
      engineOilPressureBar: 4.1,
      batteryVoltage: 24.3,
      defRemainingPct: 75,
      odometerKm: 168900,
      tpmsStatus: "All 16 Tires Normal (110 PSI)",
      dmsFatigueStatus: "Attentive / Normal",
      breathalyzerTest: "0.00% BAC (PASS)"
    },
    fastag: {
      tagId: "34161FA820320492812004",
      issuer: "Axis FASTag",
      balanceInr: 3900,
      lastTollPassed: "Marshaghai Toll Plaza (NH-53)",
      lastTollAmountInr: 265,
      lastTollTime: "14:55:22 HRS",
      status: "ACTIVE"
    },
    originLoadingBay: "Paradip Port Bulk Jetty",
    destinationPoint: "Angul Integrated Steel Complex (WH-07)",
    corridorRouteName: "NH-53 Heavy Industrial Corridor",
    lat: 20.3120,
    lon: 86.6450
  }
];

export default function RoadLogistics() {
  const { 
    requirement, 
    originGateCleared, 
    waitingForOriginGateScan,
    approveOriginGatePass, 
    vesselArrivedAtPort, 
    waitingForTruckGateScan,
    gateCleared, 
    scanGatePass,
    simProgress,
    simSpeed,
    isPlaying,
    addEvent 
  } = useFlow();

  // Mode Detection: Live requirement exists AND accepted by contractor
  const isLiveMode = Boolean(
    requirement && (
      requirement.contractorAccepted || 
      requirement.status === "ACTIVE_IN_TRANSIT" || 
      requirement.status === "ACCEPTED" ||
      requirement.status === "ARRIVED_AT_DESTINATION" ||
      requirement.status === "COMPLETED"
    )
  );

  // Auto-detect active leg (Origin First-Mile vs Destination Last-Mile)
  const defaultLeg = (simProgress >= 50 || vesselArrivedAtPort) ? "last-mile" : "first-mile";
  const [activeTab, setActiveTab] = useState(defaultLeg);

  useEffect(() => {
    if (isLiveMode) {
      if (simProgress >= 50 || vesselArrivedAtPort) {
        setActiveTab("last-mile");
      } else {
        setActiveTab("first-mile");
      }
    }
  }, [isLiveMode, simProgress, vesselArrivedAtPort]);

  // Sample mode truck lists for First-Mile vs Last-Mile
  const [firstMileSampleTrucks, setFirstMileSampleTrucks] = useState(SAMPLE_FIRST_MILE_TRUCKS);
  const [lastMileSampleTrucks, setLastMileSampleTrucks] = useState(SAMPLE_LAST_MILE_TRUCKS);

  const sampleTrucksState = activeTab === "first-mile" ? firstMileSampleTrucks : lastMileSampleTrucks;
  const [selectedSampleTruckId, setSelectedSampleTruckId] = useState(
    activeTab === "first-mile" ? "TRK-FM-01" : "TRK-LM-01"
  );

  // Sync selected truck ID if tab changes
  useEffect(() => {
    if (activeTab === "first-mile") {
      setSelectedSampleTruckId(prev => prev.startsWith("TRK-FM-") ? prev : "TRK-FM-01");
    } else {
      setSelectedSampleTruckId(prev => prev.startsWith("TRK-LM-") ? prev : "TRK-LM-01");
    }
  }, [activeTab]);

  // Live truck lifecycle step (derived from flow simProgress for perfect sync)
  const [liveLoadingPct, setLiveLoadingPct] = useState(0);
  const [gateScanning, setGateScanning] = useState(false);
  const [showGatePassModal, setShowGatePassModal] = useState(false);

  // ── Derive liveStep from simProgress (synchronized with company simulation) ──
  const liveStep = (() => {
    if (!isLiveMode) return "AT_GATE";
    if (simProgress >= 85) return "VESSEL_LOADED";
    if (simProgress >= 35) return "LOADING_IN_VESSEL";
    if (originGateCleared) return "TRANSIT_TO_VESSEL";
    return "AT_GATE";
  })();

  // ── Derive first-mile truck road progress ratio from simProgress ──
  // 0–14%: truck moves from mine siding → port gate (0 → 0.88)
  // 14–15%: waiting at gate
  // 15–35%: truck enters port and loads onto vessel (0.88 → 1.0)
  const liveProgressRatio = (() => {
    if (!isLiveMode) return 0.88;
    if (simProgress < 14) {
      // Moving from warehouse/mine toward port gate
      return Math.min(0.87, (simProgress / 14) * 0.87);
    }
    if (!originGateCleared) {
      // Stopped at port gate
      return 0.87;
    }
    if (simProgress < 35) {
      // Inside port — loading
      return 0.87 + ((simProgress - 15) / 20) * 0.13;
    }
    return 1.0;
  })();

  // ── Last-mile truck progress ratio (port → warehouse), 75%–100% of sim ──
  const lastMileProgressRatio = (() => {
    if (!isLiveMode || simProgress < 75) return 0;
    if (!gateCleared) return 0.02; // Waiting at destination port gate
    if (simProgress >= 100 || requirement?.status === "COMPLETED") return 1.0;
    return Math.min(0.98, ((simProgress - 75) / 25) * 0.98);
  })();

  // Loading pct driven by sim progress
  useEffect(() => {
    if (isLiveMode && simProgress >= 35 && simProgress < 75) {
      // Map sim 35–75% → loading 0–100%
      setLiveLoadingPct(Math.min(100, ((simProgress - 35) / 40) * 100));
    } else if (simProgress >= 75) {
      setLiveLoadingPct(100);
    } else {
      setLiveLoadingPct(0);
    }
  }, [isLiveMode, simProgress]);

  // Determine Corridor Endpoints:
  // First-Mile (Origin Side): Strictly Overseas Mines & Siding ➔ Overseas Export Loading Port (ZERO East Coast India)
  // Last-Mile (Destination Side): Strictly East Coast India Discharge Port ➔ Domestic Consignee Warehouse & Plant
  const corridorEndpoints = useMemo(() => {
    if (!isLiveMode) {
      return activeTab === "first-mile"
        ? { sourceId: "hunter_valley", destId: "newcastle_port" }
        : { sourceId: "paradip", destId: "angul" };
    }

    const origPort = (requirement?.originPort || "").toLowerCase();
    const destPort = (requirement?.destinationPort || "").toLowerCase();

    if (activeTab === "first-mile") {
      // First-Mile (Origin Side): Strictly overseas mines / inland sidings to overseas export loading ports
      if (origPort.includes("taboneo") || origPort.includes("indonesia") || origPort.includes("kalimantan")) {
        return { sourceId: "kalimantan_mine", destId: "taboneo_port" };
      }
      if (origPort.includes("richards") || origPort.includes("south africa") || origPort.includes("mpumalanga")) {
        return { sourceId: "mpumalanga_siding", destId: "richards_bay_port" };
      }
      if (origPort.includes("hedland") || origPort.includes("pilbara")) {
        return { sourceId: "pilbara_siding", destId: "port_hedland_port" };
      }
      if (origPort.includes("singapore") || origPort.includes("jurong")) {
        return { sourceId: "jurong_depot", destId: "singapore_port" };
      }
      // Default overseas origin side: Hunter Valley Mine Siding #4 to Port of Newcastle Carrington Coal Berth #2
      return { sourceId: "hunter_valley", destId: "newcastle_port" };
    } else {
      // Last-Mile (Destination Side): Strictly East Coast India discharge ports to domestic consignee warehouses
      if (destPort.includes("ennore") || destPort.includes("kamarajar") || destPort.includes("chennai")) {
        return { sourceId: "ennore", destId: "nctps" };
      }
      if (destPort.includes("vizag") || destPort.includes("visakha")) {
        return { sourceId: "vizag", destId: "vizag_pellet" };
      }
      if (destPort.includes("dhamra")) {
        return { sourceId: "dhamra", destId: "kalinganagar" };
      }
      if (destPort.includes("haldia")) {
        return { sourceId: "haldia", destId: "durgapur" };
      }
      if (destPort.includes("krishnapatnam")) {
        return { sourceId: "krishnapatnam", destId: "ballari" };
      }
      return { sourceId: "paradip", destId: "angul" };
    }
  }, [isLiveMode, requirement, activeTab]);

  const corridorData = useMemo(() => {
    return getCorridorData(corridorEndpoints.sourceId, corridorEndpoints.destId);
  }, [corridorEndpoints]);

  // Active truck object (Live vs Sample)
  const activeTruck = useMemo(() => {
    if (isLiveMode && requirement) {
      const isFirstMile = activeTab === "first-mile";
      const plate = isFirstMile 
        ? (requirement.assignedTruckPlate || "NSW-8801-B") 
        : (requirement.assignedTruckPlate || "OD-LIVE-9026");
      const company = requirement.companyName || "Astra Core Logistics";
      const companyCode = (requirement.companyCode || company.slice(0, 4)).toUpperCase();
      const vesselName = requirement.selectedVessel?.name || "MV Bengal Voyager";

      const isGateOpen = isFirstMile ? originGateCleared : gateCleared;
      const isAtBerth = isFirstMile 
        ? (originGateCleared && (simProgress >= 15 && simProgress < 85))
        : (lastMileProgressRatio > 0.95);

      // ── First-mile status labels (matching destination logic) ──
      let statusLabel, phaseLabel, speedVal;
      if (isFirstMile) {
        if (simProgress < 14) {
          statusLabel = "IN TRANSIT TO PORT";
          phaseLabel = `EN ROUTE TO ${corridorData.dest?.shortName?.toUpperCase() || "ORIGIN PORT"} GATE 01`;
          speedVal = 62;
        } else if (!originGateCleared) {
          statusLabel = "STOPPED OUTSIDE BARRIER";
          phaseLabel = `AT ${corridorData.dest?.shortName?.toUpperCase() || "ORIGIN PORT"} IN-GATE 01 · QR SCAN PENDING`;
          speedVal = 0;
        } else if (simProgress < 35) {
          statusLabel = "ENTERING PORT";
          phaseLabel = `TRANSIT TO QUAYSIDE BERTH (${vesselName})`;
          speedVal = 32;
        } else if (simProgress < 85) {
          statusLabel = "BERTH LOADING";
          phaseLabel = `LOADING ONTO ${vesselName} (${liveLoadingPct}%)`;
          speedVal = 0;
        } else {
          statusLabel = "VESSEL LOADED & DEPARTED";
          phaseLabel = `${vesselName} LOADED · READY FOR DEPARTURE`;
          speedVal = 0;
        }
      } else {
        // ── Last-mile status labels ──
        if (simProgress < 75) {
          statusLabel = "VESSEL IN TRANSIT";
          phaseLabel = `AWAITING VESSEL ARRIVAL AT ${corridorData.source?.shortName?.toUpperCase() || "PORT"}`;
          speedVal = 0;
        } else if (!gateCleared) {
          statusLabel = "STOPPED OUTSIDE BARRIER";
          phaseLabel = `AT ${corridorData.source?.shortName?.toUpperCase() || "PORT"} IN-GATE 01 · QR SCAN PENDING`;
          speedVal = 0;
        } else if (requirement?.status === "COMPLETED" || simProgress >= 100) {
          statusLabel = "COMPLETED";
          phaseLabel = `DELIVERED TO ${corridorData.dest?.shortName?.toUpperCase() || "PLANT"} · PROCESS COMPLETED`;
          speedVal = 0;
        } else if (lastMileProgressRatio < 0.95) {
          statusLabel = "IN TRANSIT TO WAREHOUSE";
          phaseLabel = `${corridorData.highwayName || "NH-53"} · TO ${corridorData.dest?.shortName?.toUpperCase() || "ANGUL"}`;
          speedVal = 58;
        } else {
          statusLabel = "DELIVERED";
          phaseLabel = `ARRIVED AT ${corridorData.dest?.shortName?.toUpperCase() || "ANGUL STEEL"} · UNLOADING`;
          speedVal = 0;
        }
      }

      return {
        id: "TRK-LIVE",
        isLiveRequirement: true,
        requirementId: requirement.id || "2026-LIVE",
        company,
        companyCode,
        countryCode: isFirstMile ? "AUS" : "IND",
        plate,
        driver: isFirstMile ? "Liam Hughes (Astra First-Mile Fleet)" : "Pratap Senapati (Astra Road Driver)",
        driverPhone: isFirstMile ? "+61 412 882 109" : "+91 94371 88204",
        driverDl: isFirstMile ? "NSW-DL-982104" : "OD-052021008741",
        model: isFirstMile ? "Kenworth T909 High-Capacity B-Double" : "BharatBenz 4828R Multi-Axle Heavy Tipper",
        truckModel: isFirstMile ? "Kenworth T909 B-Double" : "BharatBenz 4828R Multi-Axle",
        cargoType: requirement.cargoType || "Metallurgical Coking Coal",
        cargoQuantityMt: isFirstMile ? 68.5 : 40.2,
        targetPayloadMt: isFirstMile ? 68.5 : 40.2,
        currentCargoPct: isFirstMile
          ? (isAtBerth ? Math.max(0, 100 - liveLoadingPct) : 100)
          : (lastMileProgressRatio > 0.95 ? 0 : 100),
        assignedSlot: "14:00 - 14:30 HRS",
        etaWindow: "ON-TIME (14:12)",
        speedKmh: speedVal,
        progressRatio: isFirstMile ? liveProgressRatio : lastMileProgressRatio,
        gateApprovalStatus: isFirstMile 
          ? (originGateCleared ? "APPROVED" : "STOPPED_OUTSIDE") 
          : (gateCleared ? "APPROVED" : "STOPPED_OUTSIDE"),
        designatedBay: isFirstMile ? `Quayside Berth #2 (${vesselName})` : "Rotary Tippler #01 (Coal Stockpile)",
        originLoadingBay: isFirstMile 
          ? (requirement.originWarehouse || "Hunter Valley Coal Mine Siding #4") 
          : `${corridorData.source.name} Bulk Jetty Berth #2`,
        destinationPoint: isFirstMile 
          ? `${corridorData.dest.name} Quayside (${vesselName})` 
          : (requirement.destinationWarehouse || "Angul Integrated Steel Complex (WH-07)"),
        corridorRouteName: corridorData.highwayName || (isFirstMile ? "M15 Hunter Expressway Corridor" : "NH-53 Heavy Industrial Corridor"),
        grossWeightMt: isFirstMile ? 85.2 : 54.4,
        tareWeightMt: isFirstMile ? 16.7 : 14.2,
        fuelPct: 84 - Math.round((isFirstMile ? liveProgressRatio : lastMileProgressRatio) * 12),
        lat: corridorData.source.lat,
        lon: corridorData.source.lon,
        status: statusLabel,
        phase: phaseLabel,
        isAtBerth: isFirstMile ? isAtBerth : (lastMileProgressRatio > 0.95),
        loadingPct: liveLoadingPct,
        vesselName,
        fastag: isFirstMile ? {
          tagId: "NSW-LINKT-LIVE-01",
          issuer: "Linkt e-Toll NSW",
          balanceInr: 320,
          lastTollPassed: "Singleton Bypass (M15 Hunter Exp)",
          lastTollAmountInr: 18,
          lastTollTime: "14:12:08 HRS",
          status: "ACTIVE"
        } : {
          tagId: "34161FA820320492812001",
          issuer: "SBI FASTag",
          balanceInr: 4850,
          lastTollPassed: "Marshaghai Toll Plaza (NH-53)",
          lastTollAmountInr: 265,
          lastTollTime: "14:12:08 HRS",
          status: "ACTIVE"
        },
        telematics: {
          engineRpm: (speedVal > 0) ? 1420 : 850,
          coolantTempC: 87,
          engineOilPressureBar: 4.2,
          batteryVoltage: 24.4,
          defRemainingPct: 84,
          odometerKm: 142820 + Math.round((isFirstMile ? liveProgressRatio : lastMileProgressRatio) * 280),
          tpmsStatus: isFirstMile ? "All 22 Tires Normal (115 PSI)" : "All 16 Tires Normal (110 PSI)",
          dmsFatigueStatus: "Attentive / Normal",
          breathalyzerTest: "0.00% BAC (PASS)"
        }
      };
    } else {
      // Sample Mode active truck
      const sample = sampleTrucksState.find(t => t.id === selectedSampleTruckId) || sampleTrucksState[0];
      return {
        ...sample,
        isLiveRequirement: false,
        phase: sample.isGateCleared ? (activeTab === "first-mile" ? "HIGHWAY TO PWCS BERTH" : "HIGHWAY TO PORT") : "AT PORT GATE 01",
        gateApprovalStatus: sample.isGateCleared ? "APPROVED" : "STOPPED_OUTSIDE",
        status: sample.isGateCleared ? "IN TRANSIT" : "STOPPED OUTSIDE BARRIER"
      };
    }
  }, [isLiveMode, requirement, originGateCleared, gateCleared, liveStep, liveProgressRatio, lastMileProgressRatio, liveLoadingPct, simProgress, activeTab, corridorData, sampleTrucksState, selectedSampleTruckId]);

  // Machine Accept Action Handler
  const handleMachineAcceptance = async () => {
    setGateScanning(true);
    setTimeout(async () => {
      setGateScanning(false);
      const plate = activeTruck.plate;
      const passId = activeTruck.gatePassId;

      if (isLiveMode) {
        if (activeTab === "first-mile") {
          if (approveOriginGatePass) await approveOriginGatePass(plate, passId);
        } else {
          if (scanGatePass) await scanGatePass(plate, passId);
        }
      } else {
        // Sample Mode toggle based on activeTab
        if (activeTab === "first-mile") {
          setFirstMileSampleTrucks(prev => prev.map(t => {
            if (t.id === activeTruck.id) {
              return { ...t, isGateCleared: true };
            }
            return t;
          }));
        } else {
          setLastMileSampleTrucks(prev => prev.map(t => {
            if (t.id === activeTruck.id) {
              return { ...t, isGateCleared: true };
            }
            return t;
          }));
        }
        toast.success(`✅ Gate 01 Verified: Barrier raised for sample unit ${plate}!`);
      }

      if (addEvent) {
        addEvent({
          id: `EV-GATE-${Date.now()}`,
          type: "PORT_GATE_CLEARED",
          severity: "SUCCESS",
          title: `Port Gate 01 Cleared: ${plate}`,
          detail: `Gate pass verified for ${plate}. Boom barrier raised at Port Gate 01.`,
          roleRecipient: ["road_transporter", "company", "port_operator"]
        });
      }
    }, 600);
  };

  // Trucks prop for map
  const mapTrucks = useMemo(() => {
    if (isLiveMode && activeTruck) {
      return [activeTruck];
    }
    return sampleTrucksState;
  }, [isLiveMode, activeTruck, sampleTrucksState]);

  return (
    <div className="space-y-6">
      {/* Top Header & Multimodal Leg Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${isLiveMode ? "bg-emerald-600 shadow-emerald-500/20" : "bg-blue-900"} text-white grid place-items-center font-black shadow-md`}>
            <Truck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                Road Logistics Fleet & Gate Control Dashboard
              </h1>
              {isLiveMode ? (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-white animate-pulse shadow-sm">
                  🎯 REAL REQUIREMENT ACTIVE
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                  SAMPLE STATIC FLEET SIMULATION
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              {isLiveMode ? (
                <span>REQ-{requirement?.id || "2026-LIVE"} · {requirement?.companyName} · Vessel: <strong>{activeTruck?.vesselName || "MV Bengal Voyager"}</strong></span>
              ) : (
                <span>Background National Highway & Port Gate Corridors · Select unit to inspect</span>
              )}
            </div>
          </div>
        </div>

        {/* First-Mile / Last-Mile Route Leg Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab("first-mile")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "first-mile"
                ? "bg-blue-900 text-white shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Origin Side (First-Mile)</span>
            {activeTab === "first-mile" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => setActiveTab("last-mile")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "last-mile"
                ? "bg-blue-900 text-white shadow-sm font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Destination Side (Last-Mile)</span>
            {activeTab === "last-mile" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>
        </div>
      </div>

      {/* ── LIVE SIMULATION SYNC BANNER ── */}
      {isLiveMode && simProgress > 0 && (
        <div className="bg-slate-900 rounded-2xl px-5 py-4 font-mono border border-blue-800/60 shadow-lg space-y-3">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 text-blue-400 grid place-items-center">
                <Truck size={16} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  LIVE ROAD FLEET TRACKING · SYNCED WITH COMPANY SIMULATION
                </div>
                <div className="text-sm font-extrabold text-white" style={{ fontFamily: "Manrope" }}>
                  {activeTruck?.plate} · {activeTruck?.phase}
                </div>
              </div>
            </div>

            {/* Sim Progress */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Overall Voyage</div>
                <div className="text-xl font-black text-amber-400">{Math.round(simProgress)}%</div>
              </div>
              <div className="w-36 h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, simProgress)}%`,
                    background: simProgress < 15
                      ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                      : simProgress < 75
                        ? "linear-gradient(90deg, #f59e0b, #10b981)"
                        : "linear-gradient(90deg, #10b981, #34d399)"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Leg Progress Pills */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            {[
              { label: "Origin Mine → Port Gate", range: [0, 14], icon: "🚛", tab: "first-mile" },
              { label: "Gate Scan (Origin)", range: [14, 15], icon: "🛑", tab: "first-mile" },
              { label: "Berth Loading", range: [15, 35], icon: "⚓", tab: "first-mile" },
              { label: "Ocean Transit", range: [35, 75], icon: "🚢", tab: null },
              { label: "Dest. Gate Scan", range: [75, 76], icon: "🛑", tab: "last-mile" },
              { label: "Port → Warehouse", range: [76, 100], icon: "🏭", tab: "last-mile" },
            ].map((leg) => {
              const isActive = simProgress >= leg.range[0] && simProgress < leg.range[1];
              const isDone = simProgress >= leg.range[1];
              return (
                <span
                  key={leg.label}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 border transition-all ${
                    isActive
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm animate-pulse"
                      : isDone
                        ? "bg-emerald-900/50 text-emerald-400 border-emerald-700"
                        : "bg-slate-800/60 text-slate-500 border-slate-700"
                  }`}
                >
                  <span>{leg.icon}</span>
                  <span>{leg.label}</span>
                  {isDone && <span className="text-emerald-400">✓</span>}
                  {isActive && <span className="text-slate-950 text-[9px] font-black">LIVE</span>}
                </span>
              );
            })}
          </div>

          {/* Origin gate action */}
          {(!originGateCleared && (simProgress >= 14 || waitingForOriginGateScan)) && (
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-blue-950/90 border border-blue-500 text-blue-200 text-xs animate-pulse">
              <div className="flex items-center gap-2">
                <QrCode size={14} className="text-blue-400 shrink-0" />
                <span>First-mile truck at Origin Gate 01 — scan PCS QR gate pass to authorize entry, quayside loading & vessel departure.</span>
              </div>
              <button
                onClick={() => handleMachineAcceptance()}
                className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-bold text-[11px] whitespace-nowrap cursor-pointer transition-all shrink-0"
              >
                Scan Origin Gate Pass →
              </button>
            </div>
          )}

          {/* Destination gate action */}
          {simProgress >= 75 && !gateCleared && (
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-amber-950/80 border border-amber-500 text-amber-200 text-xs animate-pulse">
              <div className="flex items-center gap-2">
                <QrCode size={14} className="text-amber-400 shrink-0" />
                <span>Vessel berthed at destination port. Last-mile truck at Gate 01 — scan PCS QR gate pass to start discharge + road delivery.</span>
              </div>
              <button
                onClick={() => handleMachineAcceptance()}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] whitespace-nowrap cursor-pointer transition-all shrink-0"
              >
                Scan Dest. Gate Pass →
              </button>
            </div>
          )}
        </div>
      )}

      {/* High-Precision Interactive Leaflet Corridor Road Map (OSRM Snapped Highway to Quayside Sea Level Berth) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 font-mono">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
          <div className="flex items-center gap-2">
            <Navigation size={16} className="text-blue-900" />
            <span className="font-extrabold text-sm text-slate-900" style={{ fontFamily: "Manrope" }}>
              Real-Time Road Highway Tracking: {corridorData.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              🛣️ High-Precision Highway Snapped (OSRM)
            </span>
            {isLiveMode && (
              <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                <Anchor size={12} />
                Quayside Berth Sea Level Destination
              </span>
            )}
          </div>
        </div>

        <CorridorLeafletMap
          selectedSourceId={corridorEndpoints.sourceId}
          selectedDestId={corridorEndpoints.destId}
          activeTab={activeTab}
          trucks={mapTrucks}
          selectedTruckId={activeTruck?.id}
        />

      </div>


      {/* SCREENSHOT 1: Gate 01 Automated ANPR Terminal + Live Mission Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* Left Column (2 Cols): Gate 01 Automated ANPR & Slot Acceptance Terminal */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 grid place-items-center font-black shadow-sm">
                <Camera size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                    Gate 01 Automated ANPR & Slot Acceptance Terminal
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    STRICT ACCESS CONTROL
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-sans">
                  Trucks must be verified by machine and accepted before entering port. Prevents queue choke, berth congestion, and quay demurrage.
                </p>
              </div>
            </div>

            {/* Inspect Unit Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 text-[11px]">Inspect Unit:</span>
              {isLiveMode ? (
                <button className="px-3 py-1 rounded-lg text-[11px] font-black bg-emerald-600 text-white shadow-sm flex items-center gap-1 ring-2 ring-emerald-300 animate-pulse">
                  <span>🎯 {activeTruck?.plate} (REAL REQ)</span>
                </button>
              ) : (
                sampleTrucksState.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedSampleTruckId(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      selectedSampleTruckId === t.id
                        ? "bg-blue-900 text-white shadow-sm font-black"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <span>📋 {t.id} ({t.companyCode})</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Optical ANPR Scanner Box & TAS Appointment Slot Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Optical ANPR Scanner Box */}
            <div className="p-4 rounded-xl bg-slate-950 text-white space-y-3 relative overflow-hidden border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  ANPR OCR READOUT
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {activeTruck?.company}
                </span>
              </div>

              {/* License Plate Display */}
              <div className="bg-amber-400 text-slate-950 border-4 border-slate-900 rounded-lg p-3 text-center shadow-md">
                <div className="flex items-center justify-between px-2 text-[9px] font-black text-slate-800">
                  <span>{activeTruck?.countryCode || (activeTab === "first-mile" ? "AUS" : "IND")}</span>
                  <span>{activeTruck?.companyCode} LOGISTICS</span>
                </div>
                <div className="text-2xl font-black tracking-widest my-0.5">
                  {activeTruck?.plate}
                </div>
                <div className="text-[9px] font-bold text-slate-800">
                  {activeTruck?.model}
                </div>
              </div>

              {/* Machine Gate Status */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Gate Access Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  activeTruck?.gateApprovalStatus === "APPROVED" 
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500" 
                    : "bg-amber-950 text-amber-300 border border-amber-500"
                }`}>
                  {activeTruck?.gateApprovalStatus === "APPROVED" ? "✓ CLEARED TO ENTER PORT" : "⏳ STOPPED OUTSIDE BARRIER"}
                </span>
              </div>
            </div>

            {/* Scheduled Appointment Slot & Congestion Control Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-bold flex items-center gap-1.5">
                  <Calendar size={14} className="text-blue-900" />
                  TRUCK APPOINTMENT SYSTEM (TAS)
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">
                  PORT IN-GATE SLOT
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Allocated Slot Window:</span>
                  <strong className="text-slate-900">{activeTruck?.assignedSlot}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">ETA Status:</span>
                  <strong className="text-emerald-700">{activeTruck?.etaWindow}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Gross Weight:</span>
                  <strong className="text-slate-900">{activeTruck?.grossWeightMt} MT (Tare: {activeTruck?.tareWeightMt} MT)</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Designated Bay:</span>
                  <strong className="text-blue-700">{activeTruck?.designatedBay}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Machine Acceptance Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <button
              onClick={() => setShowGatePassModal(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <QrCode size={15} className="text-blue-900" />
              <span>View PCS 1x Digital Gate Pass</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toast.info(`${activeTruck?.plate} staged in pre-gate buffer yard.`)}
                className="px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-300 hover:bg-purple-100 text-purple-900 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Clock size={14} />
                <span>Hold in Buffer Yard</span>
              </button>

              <button
                onClick={handleMachineAcceptance}
                disabled={gateScanning || activeTruck?.gateApprovalStatus === "APPROVED"}
                className={`px-5 py-2.5 rounded-xl text-white font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                  activeTruck?.gateApprovalStatus === "APPROVED" 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                <Check size={16} />
                <span>
                  {gateScanning 
                    ? "Scanning Machine..." 
                    : activeTruck?.gateApprovalStatus === "APPROVED" 
                      ? "✓ Barrier Open (Admitted)" 
                      : (activeTab === "first-mile" 
                          ? "Scan Origin QR & Authorize Departure ➔" 
                          : "Machine Accept & Raise Barrier ➔")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Live Mission Telemetry */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3.5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2" style={{ fontFamily: "Manrope" }}>
              <User size={16} className="text-blue-900" />
              Live Mission Telemetry
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">
              {activeTruck?.gatePassId}
            </span>
          </div>

          {/* Current Lifecycle Stage Banner */}
          <div className="p-3 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Current Phase:</span>
              <span className="text-amber-400 font-bold uppercase">
                {activeTruck?.phase}
              </span>
            </div>

            {/* Dynamic Status Display */}
            {activeTruck?.isAtBerth ? (
              <div className="space-y-1.5 py-1">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                  <Anchor size={15} className="text-sky-400 animate-spin" />
                  <span>Loading into {activeTruck.vesselName} Hold #2 ({activeTruck.loadingPct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${activeTruck.loadingPct}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Truck size={15} className="text-emerald-400" />
                <span>
                  {activeTruck?.speedKmh > 0 
                    ? `Transit on Highway (${activeTruck.speedKmh} km/h)` 
                    : "Stopped at Port In-Gate Weighbridge"}
                </span>
              </div>
            )}

            {/* Payload Fill Meter */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Payload Fill:</span>
                <span className="text-emerald-400 font-bold">
                  {activeTruck?.currentCargoPct > 0 ? `${activeTruck?.cargoQuantityMt} MT` : "0 MT"} / {activeTruck?.targetPayloadMt} MT ({activeTruck?.currentCargoPct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${activeTruck?.currentCargoPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Company & Vehicle Specs Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-900 text-white grid place-items-center font-bold text-sm shadow-sm shrink-0">
              {activeTruck?.companyCode?.slice(0, 4)}
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm">{activeTruck?.company}</div>
              <div className="text-[11px] text-slate-500">{activeTruck?.model}</div>
              <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={12} /> Driver: {activeTruck?.driver}
              </div>
            </div>
          </div>

          {/* Telemetry Specs */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Cargo Type:</span>
              <strong className="text-slate-900">{activeTruck?.cargoType}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Assigned Slot:</span>
              <strong className="text-slate-900">{activeTruck?.assignedSlot}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Current Speed:</span>
              <strong className="text-slate-900">{activeTruck?.speedKmh} km/h</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Diesel Fuel Level:</span>
              <strong className="text-emerald-700 flex items-center gap-1">
                <Fuel size={12} /> {activeTruck?.fuelPct}% Full
              </strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Gate Status:</span>
              <strong className={activeTruck?.gateApprovalStatus === "APPROVED" ? "text-emerald-700" : "text-amber-600"}>
                {activeTruck?.gateApprovalStatus === "APPROVED" ? "IN_TRANSIT" : "WAITING_IN_GATE"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* FASTag ELECTRONIC TOLL LOG & ROUTE SPECIFICATIONS (EQUALLY SPLIT TWO COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        {/* Card 1: FASTag Electronic Toll Log */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Zap size={15} className="text-amber-500" />
                {activeTab === "first-mile" ? "e-Toll Electronic Road Charge Log" : "FASTag Electronic Toll Log"}
              </span>
              <span className="text-[10px] text-emerald-800 font-black bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                {activeTruck?.fastag?.status || "ACTIVE"}
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs mt-2">
              <div className="flex justify-between py-2">
                <span className="text-slate-500">{activeTab === "first-mile" ? "Tag / OBU ID:" : "FASTag ID:"}</span>
                <strong className="text-slate-900 font-bold">{activeTruck?.fastag?.tagId}</strong>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Issuer:</span>
                <strong className="text-slate-900 font-bold">{activeTruck?.fastag?.issuer}</strong>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Account Balance:</span>
                <strong className="text-emerald-700 font-bold">
                  {activeTab === "first-mile" 
                    ? `A$${activeTruck?.fastag?.balanceInr}.00` 
                    : `₹${activeTruck?.fastag?.balanceInr?.toLocaleString()}.00`}
                </strong>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Last Toll Passed:</span>
                <strong className="text-slate-900 font-bold">{activeTruck?.fastag?.lastTollPassed}</strong>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Deduction / Time:</span>
                <strong className="text-slate-900 font-bold">
                  {activeTab === "first-mile" 
                    ? `A$${activeTruck?.fastag?.lastTollAmountInr} · ${activeTruck?.fastag?.lastTollTime}` 
                    : `₹${activeTruck?.fastag?.lastTollAmountInr} · ${activeTruck?.fastag?.lastTollTime}`}
                </strong>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck size={14} className="text-emerald-600" />
              RFID ETC Telemetry Link
            </span>
            <span className="text-emerald-700 font-bold font-mono">100% OPERATIONAL</span>
          </div>
        </div>

        {/* Card 2: Corridor Logistics & Route Specifications */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Truck size={15} className="text-blue-600" />
                Corridor Route & Fleet Specs
              </span>
              <span className="text-[10px] text-blue-800 font-black bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                VERIFIED
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs mt-2">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Corridor Route:</span>
                <strong className="text-slate-900 text-right">{activeTruck?.corridorRouteName}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Origin Loading Bay:</span>
                <strong className="text-slate-900 text-right">{activeTruck?.originLoadingBay}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Destination Point:</span>
                <strong className="text-slate-900 text-right">{activeTruck?.destinationPoint}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Driver License (DL):</span>
                <strong className="text-slate-900">{activeTruck?.driverDl}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Driver Phone:</span>
                <strong className="text-slate-900 flex items-center gap-1">
                  <Phone size={11} className="text-slate-400" />
                  {activeTruck?.driverPhone}
                </strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Certified Net Payload:</span>
                <strong className="text-emerald-700">{activeTruck?.cargoQuantityMt} MT {activeTruck?.cargoType}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Quayside Vessel Sync:</span>
                <strong className="text-blue-900">{activeTruck?.vesselName || "MV Ocean Pioneer"} (Hold #2)</strong>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Building2 size={14} className="text-blue-600" />
              Designated Plant Receiver
            </span>
            <span className="text-blue-900 font-bold font-mono">AUTHORIZED WEIGHBRIDGE</span>
          </div>
        </div>
      </div>

      {/* PCS 1X DIGITAL GATE PASS MODAL */}
      {showGatePassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-300 shadow-2xl p-6 font-mono space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <QrCode size={20} className="text-blue-900" />
                <span className="font-extrabold text-base text-slate-900" style={{ fontFamily: "Manrope" }}>
                  Digital PCS 1x Gate Pass
                </span>
              </div>
              <button 
                onClick={() => setShowGatePassModal(false)} 
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <div className="w-28 h-28 mx-auto bg-white p-2 rounded-lg border border-slate-300 shadow-inner grid place-items-center">
                <svg viewBox="0 0 100 100" width="90" height="90">
                  <rect width="100" height="100" fill="#FFFFFF" />
                  <rect x="10" y="10" width="25" height="25" fill="#0F172A" />
                  <rect x="15" y="15" width="15" height="15" fill="#FFFFFF" />
                  <rect x="18" y="18" width="9" height="9" fill="#0F172A" />
                  <rect x="65" y="10" width="25" height="25" fill="#0F172A" />
                  <rect x="70" y="15" width="15" height="15" fill="#FFFFFF" />
                  <rect x="73" y="18" width="9" height="9" fill="#0F172A" />
                  <rect x="10" y="65" width="25" height="25" fill="#0F172A" />
                  <rect x="15" y="70" width="15" height="15" fill="#FFFFFF" />
                  <rect x="18" y="73" width="9" height="9" fill="#0F172A" />
                  <rect x="42" y="15" width="14" height="20" fill="#0F172A" />
                  <rect x="42" y="45" width="22" height="12" fill="#0F172A" />
                  <rect x="68" y="65" width="20" height="22" fill="#0F172A" />
                  <rect x="45" y="75" width="15" height="12" fill="#0F172A" />
                </svg>
              </div>
              <div className="font-extrabold text-slate-900 text-sm">{activeTruck?.gatePassId}</div>
              <div className="text-[11px] text-slate-500">Port Community System Verified · Slot: {activeTruck?.assignedSlot}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[11px] text-emerald-950 font-bold space-y-0.5">
              <div className="text-emerald-700 uppercase text-[9px] tracking-widest">
                {isLiveMode ? "Linked Real Shipment Transport Order" : "Sample Simulator Corridor Pass"}
              </div>
              <div>ID: REQ-{activeTruck?.requirementId || "SAMPLE-01"} · {activeTruck?.company}</div>
              <div>Route: {activeTruck?.originLoadingBay} ➔ {activeTruck?.destinationPoint}</div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Company:</span>
                <strong className="text-slate-900">{activeTruck?.company}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Registration Plate:</span>
                <strong className="text-slate-900">{activeTruck?.plate}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Scheduled Slot:</span>
                <strong className="text-blue-700">{activeTruck?.assignedSlot}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Cargo Payload:</span>
                <strong className="text-slate-900">{activeTruck?.cargoQuantityMt} MT {activeTruck?.cargoType}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => toast.success("Printing PCS 1x Digital Gate Pass slip...")}
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
              >
                <Printer size={13} />
                <span>Print Slip</span>
              </button>
              {activeTruck?.gateApprovalStatus !== "APPROVED" && (
                <button
                  onClick={() => {
                    handleMachineAcceptance();
                    setShowGatePassModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check size={14} />
                  <span>Scan & Verify QR Pass</span>
                </button>
              )}
              <button
                onClick={() => setShowGatePassModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}