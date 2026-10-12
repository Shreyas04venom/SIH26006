import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const FlowContext = createContext(null);

export const DEFAULT_REQUIREMENT = {
  id: "ASTRA-REQ-001",
  planId: "PLAN-01",
  cargoType: "Thermal Coal",
  cargoQuantity: 70000,
  originWarehouse: "Hunter Valley Mine Siding, NSW",
  originPort: "Newcastle",
  destinationPort: "Paradip",
  destinationWarehouse: "Angul Integrated Steel Complex",
  destinationWarehouseCode: "WH-07",
  preferredVesselCategory: "Panamax",
  requiredArrivalDate: "2026-09-14",
  contractDuration: "1 voyage (Spot)",
  expectedVoyages: 1,
  budgetPreference: "Balanced",
  riskTolerance: "Low (Avoid high-wait berths)",
  selectedContractor: "Tata NYK Shipping",
  contractorAccepted: true,
  acceptanceDate: "2026-08-29T10:30:00Z",
  selectedVessel: {
    name: "MV Bengal Voyager",
    dwt: 74000,
    category: "Panamax",
    draftM: 13.8,
    loaM: 225,
    beamM: 32.2,
    healthScore: 96.8,
    engineEfficiency: "98.2%",
    ciiRating: "Grade A (Eco-Bulker)",
    age: "4.5 Years",
    rightShipRating: 5,
    dailyFuelBurn: "31.8 MT/day",
    captain: "Capt. Arvind Sharma"
  },
  roadFleet: {
    firstMileTrucks: 48,
    lastMileTrucks: 52,
    transporterName: "Intermodal Road Express",
    truckType: "40T Multi-Axle Tipping Trailers"
  },
  costBreakdown: {
    oceanFreightRatePerTon: 16.90,
    oceanFreightTotalUsd: 1183000,
    firstMileCostUsd: 62400,
    roadTransportUsd: 94000,
    portHandlingUsd: 42000,
    totalLandedCostUsd: 1319000,
    netSavingsUsd: 62400
  },
  warehouseSuitability: {
    code: "WH-07",
    name: "Angul Integrated Steel Complex",
    distanceKm: 82,
    transitHours: 3.1,
    utilizationPct: 68,
    suitabilityScore: 98,
    rating: "EXCELLENT"
  },
  status: "ACTIVE_IN_TRANSIT"
};

export const INITIAL_FIXTURES = [
  DEFAULT_REQUIREMENT,
  {
    id: "REQ-2026-8794",
    cargoType: "Coking Coal",
    cargoQuantity: 55000,
    originWarehouse: "Queensland Bowen Basin Siding",
    originPort: "Hay Point",
    destinationPort: "Visakhapatnam",
    destinationWarehouse: "Vizag Steel & Energy Plant",
    preferredVesselCategory: "Supramax",
    requiredArrivalDate: "2026-08-15",
    contractDuration: "1 voyage (Spot)",
    expectedVoyages: 1,
    selectedContractor: "JSW Shipping Ltd",
    contractorAccepted: true,
    acceptanceDate: "2026-08-01T08:00:00Z",
    selectedVessel: {
      name: "MV Coastal Pride",
      dwt: 58000,
      category: "Supramax",
      draftM: 12.2,
      loaM: 190,
      beamM: 32.2,
      healthScore: 91.2,
      engineEfficiency: "92.0%",
      ciiRating: "Grade B",
      age: "8.0 Years",
      rightShipRating: 4
    },
    roadFleet: {
      firstMileTrucks: 38,
      lastMileTrucks: 42,
      transporterName: "Eastern Coastal Fleet"
    },
    costBreakdown: {
      oceanFreightRatePerTon: 18.40,
      oceanFreightTotalUsd: 1012000,
      roadTransportUsd: 82000,
      portHandlingUsd: 38000,
      totalLandedCostUsd: 1132000,
      netSavingsUsd: 28000
    },
    status: "COMPLETED"
  }
];

export const INITIAL_COMPANY_REQUIREMENTS = [];

export function FlowProvider({ children }) {
  // Requirement starts as null on fresh load / page refresh so user sees the 1st simulation by default.
  // When a user books a new ship, requirement is set with ACTIVE_IN_TRANSIT to show the 2nd simulation.
  const [requirement, setRequirementState] = useState(null);

  const [fixturesList, setFixturesList] = useState(INITIAL_FIXTURES);

  // Central company requirements for Contractor Confirmation Dashboard (stores only real company requirements)
  const [companyRequirements, setCompanyRequirements] = useState(() => {
    try {
      const saved = localStorage.getItem("astra_company_requirements");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_COMPANY_REQUIREMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("astra_company_requirements", JSON.stringify(companyRequirements));
    } catch {}
  }, [companyRequirements]);

  // Shipbuilder & Fleet Readiness
  const [shipbuilderHulls, setShipbuilderHulls] = useState([
    { name: "MV Bengal Voyager", category: "Panamax", dwt: "74,000 DWT", location: "Newcastle / Paradip", status: "READY_NOW", condition: "Survey Class A1", color: "text-emerald-400" },
    { name: "MV Jag Radha", category: "Panamax", dwt: "76,500 DWT", location: "Singapore Ballast", status: "BALLAST_TRANSIT", condition: "ETA 3 Days (Hull Certified)", color: "text-blue-400" },
    { name: "MV Coastal Pride", category: "Supramax", dwt: "58,000 DWT", location: "Visakhapatnam Harbor", status: "READY_NOW", condition: "Cranes 4x30T Active", color: "text-emerald-400" },
    { name: "MV Vishva Nidhi", category: "Capesize", dwt: "180,000 DWT", location: "Cochin Shipyard Drydock", status: "DRYDOCK_CHECK", condition: "Release in 5 Days", color: "text-amber-400" },
    { name: "MV Chennai Express", category: "Handysize", dwt: "35,000 DWT", location: "Chennai Anchorage", status: "READY_NOW", condition: "Coastal Shallow Draft", color: "text-emerald-400" }
  ]);

  const pingShipbuilderDesk = () => {
    // Proactive simulated update of shipyard telemetry
    setShipbuilderHulls(prev => prev.map(h => {
      if (h.name === "MV Vishva Nidhi") {
        return { ...h, condition: "Hull survey complete · Available in 48h" };
      }
      return h;
    }));
    toast.success("📡 Cochin Shipyard & L&T Kattupalli Telemetry Synced: 4 hulls ready, 1 in survey clearance.");
  };

  const setRequirement = (req) => {
    setRequirementState(req);
    if (req) {
      setFixturesList((prev) => {
        const filtered = prev.filter(p => p.id !== req.id);
        return [req, ...filtered];
      });

      setCompanyRequirements((prev) => {
        const existing = prev.find(p => p.id === req.id);
        if (existing) {
          return prev.map(p => p.id === req.id ? { ...p, ...req } : p);
        }
        const newEntry = {
          id: req.id,
          companyName: req.companyName || "Jindal Steel & Power Ltd (Shipper)",
          companyCode: "JSPL",
          cargoType: req.cargoType || "Thermal Coal",
          cargoQuantity: req.cargoQuantity || 70000,
          originWarehouse: req.originWarehouse || "Mine Siding",
          originPort: req.originPort || "Newcastle",
          destinationPort: req.destinationPort || "Paradip",
          destinationWarehouse: req.destinationWarehouse || "Angul Steel Complex",
          preferredVesselCategory: req.preferredVesselCategory || "Panamax",
          maxDraftM: 14.0,
          requiredArrivalDate: req.requiredArrivalDate || "2026-09-14",
          targetFreightRatePerTon: req.costBreakdown?.oceanFreightRatePerTon || 16.90,
          status: req.status === "ACTIVE_IN_TRANSIT" ? "ACCEPTED" : (req.status || "PENDING_REVIEW"),
          createdAt: "Just now",
          assignedVessel: req.selectedVessel,
          isNewlyCreated: true
        };
        return [newEntry, ...prev];
      });
    }
  };

  const updateContractorDecision = (reqId, decision) => {
    setCompanyRequirements(prev => prev.map(item => {
      if (item.id === reqId) {
        return {
          ...item,
          ...decision,
          updatedAt: "Just now"
        };
      }
      return item;
    }));

    const target = companyRequirements.find(r => r.id === reqId);
    const company = target?.companyName || "Company";

    if (decision.status === "ACCEPTED") {
      addEvent({
        type: "CONTRACTOR_ACCEPTED",
        severity: "SUCCESS",
        title: `✅ Tata NYK Accepted Fixture: ${company} (${reqId})`,
        detail: `Vessel ${decision.assignedVessel?.name || "Assigned"} confirmed. Laycan active. ${decision.contractorNote || ""}`,
        requirementId: reqId,
        roleRecipient: ["company", "contractor"]
      });
      toast.success(`✅ Fixture Confirmed for ${company}! Vessel ${decision.assignedVessel?.name} allocated.`);

      if (requirement && requirement.id === reqId) {
        setRequirement({
          ...requirement,
          status: "ACTIVE_IN_TRANSIT",
          contractorAccepted: true,
          selectedVessel: decision.assignedVessel || requirement.selectedVessel,
          contractorNote: decision.contractorNote
        });
      }
    } else if (decision.status === "REJECTED_WITH_SOLUTION") {
      addEvent({
        type: "CONTRACTOR_REJECTED_WITH_SOLUTION",
        severity: "WARNING",
        title: `⚠️ Tata NYK Counter-Proposal for ${company} (${reqId})`,
        detail: `Declined: ${decision.rejectionReason}. Counter Solution: ${decision.recommendedSolution}`,
        requirementId: reqId,
        roleRecipient: ["company", "contractor"]
      });
      toast.error(`⚠️ Tender Declined for ${company}. Strategic solution provided to shipper.`);

      if (requirement && requirement.id === reqId) {
        setRequirement({
          ...requirement,
          status: "CONTRACTOR_COUNTERED",
          contractorAccepted: false,
          rejectionReason: decision.rejectionReason,
          recommendedSolution: decision.recommendedSolution,
          contractorNote: decision.contractorNote
        });
      }
    } else if (decision.status === "WAIT_SHIPBUILDER") {
      addEvent({
        type: "CONTRACTOR_WAIT_SHIPBUILDER",
        severity: "INFO",
        title: `⏳ Tata NYK Contacting Shipbuilder for ${company} (${reqId})`,
        detail: `Checking fleet hull availability & drydock schedule with Cochin Shipyard. Decision pending within 2h.`,
        requirementId: reqId,
        roleRecipient: ["company", "contractor"]
      });
      toast.info(`⏳ Hold notice sent to ${company} while checking with shipbuilder.`);

      if (requirement && requirement.id === reqId) {
        setRequirement({
          ...requirement,
          status: "WAIT_SHIPBUILDER",
          contractorAccepted: false,
          contractorNote: decision.contractorNote
        });
      }
    }
  };

  const acceptContractorFixture = (reqId) => {
    const target = requirement?.id === reqId ? requirement : fixturesList.find(f => f.id === reqId) || requirement;
    const updated = {
      ...target,
      contractorAccepted: true,
      acceptanceDate: new Date().toISOString(),
      status: "ACTIVE_IN_TRANSIT"
    };
    setRequirement(updated);
  };

  const markFixtureCompleted = (reqId) => {
    const target = requirement?.id === reqId ? requirement : fixturesList.find(f => f.id === reqId) || requirement;
    const updated = {
      ...target,
      status: "COMPLETED",
      completedDate: new Date().toISOString()
    };
    setRequirement(updated);
  };

  const [forecast, setForecast] = useState(null);
  const [waiting, setWaiting] = useState(null);
  const [risk, setRisk] = useState(null);
  const [matching, setMatching] = useState(null);
  const [selectedVessel, setSelectedVessel] = useState(requirement?.selectedVessel || DEFAULT_REQUIREMENT.selectedVessel);

  // AI Execution Recommendations (Plan 01, Plan 02, Plan 03)
  const [executionPlans, setExecutionPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("PLAN-01");

  // Candidate Destination Warehouses & Suitability Rankings
  const [candidateWarehouses, setCandidateWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(DEFAULT_REQUIREMENT.warehouseSuitability);

  // Inland Logistics Truck Fleet State (First-Mile & Last-Mile)
  const [trucks, setTrucks] = useState([
    {
      id: "TRK-FM-101",
      leg: "first-mile",
      plate: "NSW-48-TX-101",
      driver: "David Miller",
      phone: "+61 412 882 101",
      trailer: "40T Multi-Axle Tipper",
      cargoQuantityMt: 40.0,
      cargoType: "Thermal Coal",
      originWarehouse: "Hunter Valley Mine Siding, NSW",
      targetPort: "Newcastle Port Jetty Berth #2",
      status: "IN TRANSIT",
      speedKmh: 54,
      headingDeg: 125,
      etaMinutes: 28,
      etaFormatted: "14:32 HRS",
      fuelPct: 88,
      gatePassId: "GP-NSW-8801",
      routeCorridor: "Hunter Valley Expressway ➔ Port Jetty",
      plannedDistanceKm: 120,
      distanceCoveredKm: 92,
      lastUpdateSecondsAgo: 12,
      trackingType: "GPS",
      exception: null
    },
    {
      id: "TRK-FM-102",
      leg: "first-mile",
      plate: "NSW-48-TX-102",
      driver: "Liam Cooper",
      phone: "+61 412 882 102",
      trailer: "40T Multi-Axle Tipper",
      cargoQuantityMt: 39.8,
      cargoType: "Thermal Coal",
      originWarehouse: "Hunter Valley Mine Siding, NSW",
      targetPort: "Newcastle Port Jetty Berth #2",
      status: "DISPATCHED",
      speedKmh: 48,
      headingDeg: 130,
      etaMinutes: 65,
      etaFormatted: "15:10 HRS",
      fuelPct: 92,
      gatePassId: "GP-NSW-8802",
      routeCorridor: "Hunter Valley Expressway",
      plannedDistanceKm: 120,
      distanceCoveredKm: 55,
      lastUpdateSecondsAgo: 24,
      trackingType: "FASTag",
      exception: null
    },
    {
      id: "TRK-LM-201",
      leg: "last-mile",
      plate: "OD-05-AX-4821",
      driver: "Ramesh Kumar",
      phone: "+91 98451 22801",
      trailer: "40T Hydraulic Tipper",
      cargoQuantityMt: 40.2,
      cargoType: "Thermal Coal",
      originPort: "Paradip Port Bulk Jetty",
      destPlant: "Angul Integrated Steel Complex (WH-07)",
      status: "IN TRANSIT",
      speedKmh: 52,
      headingDeg: 285,
      lat: 20.4800,
      lon: 86.1200,
      etaMinutes: 75,
      etaFormatted: "15:45 HRS",
      fuelPct: 84,
      gatePassId: "GP-2026-9041",
      routeCorridor: "NH-53 Heavy Industrial Corridor",
      plannedDistanceKm: 82,
      distanceCoveredKm: 34,
      lastUpdateSecondsAgo: 14,
      trackingType: "GPS",
      exception: null
    },
    {
      id: "TRK-LM-202",
      leg: "last-mile",
      plate: "OD-05-AX-4822",
      driver: "Satish Jena",
      phone: "+91 98451 22802",
      trailer: "40T Hydraulic Tipper",
      cargoQuantityMt: 39.8,
      cargoType: "Thermal Coal",
      originPort: "Paradip Port Bulk Jetty",
      destPlant: "Angul Integrated Steel Complex (WH-07)",
      status: "IN TRANSIT",
      speedKmh: 46,
      headingDeg: 290,
      lat: 20.6500,
      lon: 85.6200,
      etaMinutes: 38,
      etaFormatted: "15:05 HRS",
      fuelPct: 78,
      gatePassId: "GP-2026-9042",
      routeCorridor: "NH-53 Expressway",
      plannedDistanceKm: 82,
      distanceCoveredKm: 58,
      lastUpdateSecondsAgo: 18,
      trackingType: "FASTag",
      exception: null
    },
    {
      id: "TRK-LM-203",
      leg: "last-mile",
      plate: "OD-05-AX-4823",
      driver: "Manoj Pradhan",
      phone: "+91 98451 22803",
      trailer: "40T Hydraulic Tipper",
      cargoQuantityMt: 40.0,
      cargoType: "Thermal Coal",
      originPort: "Paradip Port Bulk Jetty",
      destPlant: "Angul Integrated Steel Complex (WH-07)",
      status: "APPROACHING PORT",
      speedKmh: 14,
      headingDeg: 95,
      lat: 20.3200,
      lon: 86.6300,
      etaMinutes: 8,
      etaFormatted: "14:35 HRS",
      fuelPct: 91,
      gatePassId: "GP-2026-9043",
      routeCorridor: "Paradip Port In-Gate Buffer",
      plannedDistanceKm: 82,
      distanceCoveredKm: 4,
      lastUpdateSecondsAgo: 6,
      trackingType: "SIM",
      exception: null
    },
    {
      id: "TRK-LM-204",
      leg: "last-mile",
      plate: "OD-05-AX-4824",
      driver: "Deepak Mohanty",
      phone: "+91 98451 22804",
      trailer: "40T Hydraulic Tipper",
      cargoQuantityMt: 40.1,
      cargoType: "Thermal Coal",
      originPort: "Paradip Port Bulk Jetty",
      destPlant: "Angul Integrated Steel Complex (WH-07)",
      status: "AT WAREHOUSE",
      speedKmh: 0,
      headingDeg: 0,
      lat: 20.8380,
      lon: 85.1450,
      etaMinutes: 0,
      etaFormatted: "DELIVERED",
      fuelPct: 69,
      gatePassId: "GP-2026-9044",
      routeCorridor: "Angul Steel Plant Unloading Bay",
      plannedDistanceKm: 82,
      distanceCoveredKm: 82,
      lastUpdateSecondsAgo: 50,
      trackingType: "GPS",
      exception: null
    }
  ]);

  // Unified Event System
  const [eventsList, setEventsList] = useState([
    {
      id: "EVT-8801",
      requirementId: "ASTRA-REQ-001",
      type: "TRUCK_DISPATCHED",
      severity: "INFO",
      title: "First-Mile Fleet Dispatched from Mine Siding",
      detail: "48x 40T multi-axle tipper trucks dispatched from Hunter Valley Mine Siding to Newcastle Port Jetty.",
      timestamp: "10 mins ago",
      entityId: "TRK-FM-101",
      roleRecipient: ["company", "road_transporter"]
    },
    {
      id: "EVT-8802",
      requirementId: "ASTRA-REQ-001",
      type: "CARGO_LOADING_COMPLETED",
      severity: "INFO",
      title: "Conveyor Jetty Loading Completed at Newcastle",
      detail: "70,000 MT Thermal Coal successfully loaded onto MV Bengal Voyager. Draft verified at 13.8m.",
      timestamp: "1 hour ago",
      entityId: "VESSEL-001",
      roleRecipient: ["company", "contractor", "port_operator"]
    },
    {
      id: "EVT-8803",
      requirementId: "ASTRA-REQ-001",
      type: "VESSEL_DEPARTED",
      severity: "INFO",
      title: "Vessel Departed Origin Port on Deepsea Transit",
      detail: "MV Bengal Voyager cleared outer fairway at Newcastle, steaming towards Paradip Port via Sunda Strait.",
      timestamp: "2 hours ago",
      entityId: "VESSEL-001",
      roleRecipient: ["company", "contractor"]
    }
  ]);

  const addEvent = (event) => {
    const newEvt = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      requirementId: requirement?.id || "ASTRA-REQ-001",
      timestamp: "Just now",
      ...event
    };
    setEventsList(prev => [newEvt, ...prev]);
  };

  // Truck Status Mutators & Exception Triggers
  const updateTruckStatus = (truckId, newStatus) => {
    setTrucks(prev => prev.map(t => {
      if (t.id === truckId) {
        return { ...t, status: newStatus, lastUpdateSecondsAgo: 0 };
      }
      return t;
    }));
    addEvent({
      type: "TRUCK_STATUS_UPDATED",
      severity: "INFO",
      title: `Truck ${truckId} Status: ${newStatus}`,
      detail: `Operational status updated to ${newStatus}.`,
      entityId: truckId,
      roleRecipient: ["road_transporter", "company"]
    });
  };

  const triggerTruckDelay = (truckId = "TRK-LM-201", delayMinutes = 42) => {
    setTrucks(prev => prev.map(t => {
      if (t.id === truckId) {
        return {
          ...t,
          status: "DELAYED",
          etaMinutes: t.etaMinutes + delayMinutes,
          etaFormatted: "16:27 HRS (DELAYED)",
          exception: {
            type: "TRUCK_DELAY",
            delayMinutes,
            impact: "Port gate arrival may miss planned slot. Gate pass window rescheduled."
          }
        };
      }
      return t;
    }));
    addEvent({
      type: "TRUCK_DELAYED",
      severity: "HIGH",
      title: `Truck Delay Alert: ${truckId} (+${delayMinutes} min)`,
      detail: `Highway toll bottleneck delayed truck. Revised ETA: 16:27 HRS. Port gate slot rescheduled.`,
      entityId: truckId,
      roleRecipient: ["road_transporter", "company"]
    });
  };

  const triggerRouteDeviation = (truckId = "TRK-LM-202") => {
    setTrucks(prev => prev.map(t => {
      if (t.id === truckId) {
        return {
          ...t,
          exception: {
            type: "ROUTE_DEVIATION",
            deviationKm: 4.8,
            impact: "Truck deviated 4.8 km outside designated NH-53 corridor. Driver alerted."
          }
        };
      }
      return t;
    }));
    addEvent({
      type: "ROUTE_DEVIATION",
      severity: "HIGH",
      title: `Route Deviation Detected: ${truckId}`,
      detail: `Vehicle moved 4.8 km outside approved geofence corridor onto secondary bypass road.`,
      entityId: truckId,
      roleRecipient: ["road_transporter", "company"]
    });
  };

  const triggerVehicleIdle = (truckId = "TRK-LM-203") => {
    setTrucks(prev => prev.map(t => {
      if (t.id === truckId) {
        return {
          ...t,
          speedKmh: 0,
          exception: {
            type: "VEHICLE_IDLE",
            idleMinutes: 48,
            impact: "Vehicle stationary >45 min near port approach gate. Driver contacted."
          }
        };
      }
      return t;
    }));
    addEvent({
      type: "VEHICLE_IDLE",
      severity: "HIGH",
      title: `Vehicle Idle Alert: ${truckId} (48 min stationary)`,
      detail: `Telemetry indicates zero motion for 48 minutes at Paradip Port in-gate queue.`,
      entityId: truckId,
      roleRecipient: ["road_transporter"]
    });
  };

  const resetAllExceptions = () => {
    setTrucks(prev => prev.map(t => ({
      ...t,
      status: t.status === "DELAYED" ? "IN TRANSIT" : t.status,
      speedKmh: t.speedKmh === 0 && t.status === "IN TRANSIT" ? 48 : t.speedKmh,
      exception: null
    })));
  };

  // Live vs Simulation data source tag state
  const [isLiveTruckData, setIsLiveTruckData] = useState(false);
  const [isLiveVesselData, setIsLiveVesselData] = useState(true);

  // Sync live inland truck telemetry from server (powered by TomTom API)
  useEffect(() => {
    fetch('/api/logistics/trucks')
      .then(res => res.json())
      .then(data => {
        if (data && data.trucks && data.trucks.length > 0) {
          setTrucks(data.trucks);
          if (data.isLive !== undefined) {
            setIsLiveTruckData(Boolean(data.isLive));
          }
        }
      })
      .catch(err => console.log("Truck telematics sync notice:", err.message));
  }, []);

  // Simulation Engine State
  const [isPlaying, setIsPlaying] = useState(true);
  const [simProgress, setSimProgress] = useState(48); // 0 to 100%
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 2x, 5x
  const [activeScenario, setActiveScenario] = useState("normal"); // "normal" | "weather_delay" | "port_congestion"
  
  // Scenario 1: Weather delay (+10h) & Port Berth Reallocation
  const [weatherDelayActive, setWeatherDelayActive] = useState(false);
  const [berthReallocated, setBerthReallocated] = useState(false);
  // feederProgress: 0-100 = feeder approaching berth, feederDeparting: true = feeder leaving after berth cleared
  const [feederProgress, setFeederProgress] = useState(0);   // 0→100 approach
  const [feederDeparting, setFeederDeparting] = useState(false);
  const [feederDepartProgress, setFeederDepartProgress] = useState(0); // 0→100 departure

  // Scenario 2: Port Congestion & Alternate Port Diversion
  const [portCongestionActive, setPortCongestionActive] = useState(false);
  const [portDiverted, setPortDiverted] = useState(false);


  // Ticker for smooth, steady live voyage simulation (consistent, observable, realistic GPS tracking feel)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 100) return 0;
        // ── Scenario 1 guard: freeze simProgress while vessel is held in swell ──
        // Held at 54% in swell zone until emergency berth reallocation is approved
        if (weatherDelayActive && !berthReallocated && prev >= 54) return 54;

        // Consistent, smooth, steady speed: ~0.08% per 80ms at 1x (~100-120 seconds full transit)
        const step = (weatherDelayActive && berthReallocated) ? (0.07 * (simSpeed || 1)) : (0.08 * (simSpeed || 1));
        return Math.min(100, prev + step);
      });
    }, 80);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, weatherDelayActive, berthReallocated]);

  // Secondary vessel approach animation ticker (runs when weatherDelayActive & not yet reallocated)
  useEffect(() => {
    if (!weatherDelayActive || berthReallocated) return;
    const interval = setInterval(() => {
      setFeederProgress((prev) => Math.min(100, prev + 0.35 * (simSpeed || 1)));
    }, 100);
    return () => clearInterval(interval);
  }, [weatherDelayActive, berthReallocated, simSpeed]);

  // Secondary vessel departure animation ticker (runs after berth cleared)
  useEffect(() => {
    if (!feederDeparting) return;
    const interval = setInterval(() => {
      setFeederDepartProgress((prev) => Math.min(100, prev + 0.45 * (simSpeed || 1)));
    }, 100);
    return () => clearInterval(interval);
  }, [feederDeparting, simSpeed]);

  const togglePlay = () => setIsPlaying(p => !p);

  const resetSimulation = () => {
    setSimProgress(0);
    setIsPlaying(false);
    setActiveScenario("normal");
    setWeatherDelayActive(false);
    setBerthReallocated(false);
    setFeederProgress(0);
    setFeederDeparting(false);
    setFeederDepartProgress(0);
    setPortCongestionActive(false);
    setPortDiverted(false);
  };

  const triggerWeatherDelay = () => {
    setSimProgress(0);
    setIsPlaying(true);
    setWeatherDelayActive(true);
    setActiveScenario("weather_delay");
    setBerthReallocated(false);
    setFeederProgress(0);
    setFeederDeparting(false);
    setFeederDepartProgress(0);
    setPortCongestionActive(false);
    setPortDiverted(false);
  };

  const approveBerthReallocation = () => {
    setBerthReallocated(true);
    setFeederDeparting(true);
    setFeederDepartProgress(0);
  };

  const triggerPortCongestion = () => {
    setPortCongestionActive(true);
    setActiveScenario("port_congestion");
    setWeatherDelayActive(false);
    setBerthReallocated(false);
  };

  const approvePortDiversion = () => {
    setPortDiverted(true);
  };

  // Helper to get active multimodal leg name
  const getCurrentLeg = () => {
    const origWh = requirement?.originWarehouse || "Hunter Valley Mine Siding, NSW";
    const origPort = requirement?.originPort || "Newcastle";
    const destPort = portDiverted ? "Krishnapatnam" : (requirement?.destinationPort || "Paradip");
    const destWh = requirement?.destinationWarehouse || "Angul Integrated Steel Complex";
    const vesselName = requirement?.selectedVessel?.name || "MV Bengal Voyager";
    const vesselCat = requirement?.selectedVessel?.category || "Panamax";
    const cargoQty = requirement?.cargoQuantity ? requirement.cargoQuantity.toLocaleString() : "70,000";

    if (simProgress < 20) {
      return { 
        stage: 1, 
        name: "First-Mile Road Transport", 
        mode: "TRUCK", 
        location: `${origWh} ➔ ${origPort} Port`,
        details: `${requirement?.roadFleet?.firstMileTrucks || 48} Trucks hauling coal from mine siding to port stockyard`
      };
    }
    if (simProgress < 35) {
      return { 
        stage: 2, 
        name: "Origin Port Jetty Loading", 
        mode: "PORT", 
        location: `${origPort} Deepwater Mechanized Jetty`,
        details: `Conveyor loading ${cargoQty} MT onto ${vesselName}`
      };
    }
    if (simProgress < 75) {
      return { 
        stage: 3, 
        name: "Ocean Transit (High Seas)", 
        mode: "VESSEL", 
        location: `Bay of Bengal ➔ ${destPort} Port`,
        details: `${vesselName} (${vesselCat}) cruising at 13.8 kts`
      };
    }
    if (simProgress < 85) {
      return { 
        stage: 4, 
        name: "Destination Port Berth Discharge", 
        mode: "PORT", 
        location: portDiverted ? "Krishnapatnam Port Berth #4" : `${destPort} Bulk Berth #2`,
        details: `Mobile cranes discharging directly into waiting road trucks & hopper silos`
      };
    }
    return { 
      stage: 5, 
      name: "Last-Mile Road Delivery", 
      mode: "TRUCK", 
      location: `${destPort} ➔ ${destWh}`,
      details: `${requirement?.roadFleet?.lastMileTrucks || 52} Trucks delivering directly to ${destWh}`
    };
  };

  return (
    <FlowContext.Provider
      value={{
        requirement, setRequirement,
        fixturesList, setFixturesList,
        acceptContractorFixture, markFixtureCompleted,
        companyRequirements, setCompanyRequirements,
        shipbuilderHulls, setShipbuilderHulls,
        pingShipbuilderDesk, updateContractorDecision,
        forecast, setForecast,
        waiting, setWaiting,
        risk, setRisk,
        matching, setMatching,
        selectedVessel, setSelectedVessel,

        // AI Execution Recommendations & Warehouse Selection
        executionPlans, setExecutionPlans,
        selectedPlanId, setSelectedPlanId,
        candidateWarehouses, setCandidateWarehouses,
        selectedWarehouse, setSelectedWarehouse,

        // Inland Truck Fleet & Exceptions
        trucks, setTrucks,
        updateTruckStatus,
        triggerTruckDelay,
        triggerRouteDeviation,
        triggerVehicleIdle,
        resetAllExceptions,

        // Unified Event System
        eventsList, setEventsList, addEvent,

        // Provider Telemetry Flags
        isLiveTruckData, setIsLiveTruckData,
        isLiveVesselData, setIsLiveVesselData,
        
        // Simulation Engine
        isPlaying, setIsPlaying, togglePlay,
        simProgress, setSimProgress,
        simSpeed, setSimSpeed,
        activeScenario, setActiveScenario,
        weatherDelayActive, triggerWeatherDelay,
        berthReallocated, approveBerthReallocation,
        feederProgress, feederDeparting, feederDepartProgress,
        portCongestionActive, triggerPortCongestion,
        portDiverted, approvePortDiversion,
        resetSimulation,
        getCurrentLeg
      }}
    >
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow() {
  return useContext(FlowContext);
}
