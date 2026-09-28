/**
 * ASTRA - AI Execution Recommendations Engine
 * Generates ranked end-to-end multimodal logistics execution combinations:
 * PLAN 01, PLAN 02, PLAN 03.
 *
 * Each plan connects:
 * Vessel + Origin Port + Destination Port + Contractor + Origin Warehouse +
 * Destination Warehouse (via warehouseService) + Inland Route + Ocean Transit +
 * Landed Cost + Demurrage Risk + Logistics Risk + Feasibility.
 */

import { rankCandidateWarehouses } from "./warehouseService.js";

const CONTRACTOR_FLEET = [
  {
    contractorId: "CONT-TATA-01",
    contractorName: "Tata NYK Shipping",
    operatorType: "Global Industrial Carrier",
    reliabilityScore: 98.4,
    vessels: {
      Panamax: { name: "MV Bengal Voyager", dwt: 74000, draft: 13.8, loa: 225, beam: 32.2, speedKnots: 13.8, fuelPerDay: 31.8, healthScore: 96.8, cii: "Grade A" },
      Supramax: { name: "MV Tata Pride", dwt: 58000, draft: 12.5, loa: 200, beam: 32.2, speedKnots: 14.0, fuelPerDay: 24.2, healthScore: 95.4, cii: "Grade A" },
      Capesize: { name: "MV Tata Titan", dwt: 180000, draft: 18.2, loa: 300, beam: 45.0, speedKnots: 14.5, fuelPerDay: 48.5, healthScore: 97.2, cii: "Grade A" },
      Handysize: { name: "MV Tata Pearl", dwt: 35000, draft: 10.0, loa: 180, beam: 28.0, speedKnots: 13.2, fuelPerDay: 18.5, healthScore: 94.0, cii: "Grade B" },
    },
    transporterPartner: "Intermodal Road Express",
    baseOceanRateDiscount: 0.0 // lowest benchmark
  },
  {
    contractorId: "CONT-JSW-02",
    contractorName: "JSW Shipping Ltd",
    operatorType: "Dedicated Coastal & Deepsea Fleet",
    reliabilityScore: 94.2,
    vessels: {
      Panamax: { name: "MV JSW Vamsi", dwt: 75000, draft: 13.9, loa: 225, beam: 32.2, speedKnots: 13.5, fuelPerDay: 33.5, healthScore: 92.0, cii: "Grade B" },
      Supramax: { name: "MV Coastal Pride", dwt: 58000, draft: 12.2, loa: 190, beam: 32.2, speedKnots: 13.8, fuelPerDay: 25.0, healthScore: 91.2, cii: "Grade B" },
      Capesize: { name: "MV JSW Steel Bulk", dwt: 175000, draft: 18.0, loa: 295, beam: 45.0, speedKnots: 14.0, fuelPerDay: 51.0, healthScore: 93.5, cii: "Grade B" },
      Handysize: { name: "MV JSW Express", dwt: 34000, draft: 9.8, loa: 178, beam: 28.0, speedKnots: 13.0, fuelPerDay: 19.2, healthScore: 89.8, cii: "Grade B" },
    },
    transporterPartner: "Eastern Coastal Fleet",
    baseOceanRateDiscount: 0.90 // +$0.90/t
  },
  {
    contractorId: "CONT-SYN-03",
    contractorName: "Synergy Marine Group",
    operatorType: "Charter Management Operator",
    reliabilityScore: 91.8,
    vessels: {
      Panamax: { name: "MV Ocean Pioneer", dwt: 76000, draft: 14.1, loa: 228, beam: 32.2, speedKnots: 13.2, fuelPerDay: 35.0, healthScore: 88.5, cii: "Grade C" },
      Supramax: { name: "MV Ocean Leader", dwt: 56000, draft: 12.6, loa: 195, beam: 32.2, speedKnots: 13.5, fuelPerDay: 26.5, healthScore: 87.9, cii: "Grade C" },
      Capesize: { name: "MV Ocean Giant", dwt: 182000, draft: 18.5, loa: 305, beam: 45.0, speedKnots: 14.2, fuelPerDay: 53.5, healthScore: 90.1, cii: "Grade B" },
      Handysize: { name: "MV Island Trader", dwt: 36000, draft: 10.2, loa: 182, beam: 28.5, speedKnots: 12.8, fuelPerDay: 20.0, healthScore: 86.5, cii: "Grade C" },
    },
    transporterPartner: "National Highway Logistics",
    baseOceanRateDiscount: 1.40 // +$1.40/t
  }
];

const ORIGIN_PROFILES = {
  Newcastle: {
    country: "Australia",
    warehouse: "Hunter Valley Mine Siding, NSW",
    distanceNm: 5080,
    inlandFirstMileKm: 120,
    inlandFirstMileMode: "Heavy Freight Rail / Truck",
    inlandFirstMileCostPerTon: 5.20,
    avgOceanDays: 15.5
  },
  Taboneo: {
    country: "Indonesia",
    warehouse: "South Kalimantan Open-Cast Siding",
    distanceNm: 2280,
    inlandFirstMileKm: 85,
    inlandFirstMileMode: "River Barge & Heavy Tipper",
    inlandFirstMileCostPerTon: 4.50,
    avgOceanDays: 7.2
  },
  "Richards Bay": {
    country: "South Africa",
    warehouse: "Mpumalanga Coal Terminal Siding",
    distanceNm: 4680,
    inlandFirstMileKm: 240,
    inlandFirstMileMode: "Transnet Freight Rail",
    inlandFirstMileCostPerTon: 8.80,
    avgOceanDays: 14.2
  },
  Singapore: {
    country: "Singapore",
    warehouse: "Jurong Island Transshipment Hub",
    distanceNm: 1540,
    inlandFirstMileKm: 15,
    inlandFirstMileMode: "Industrial Belt Conveyor",
    inlandFirstMileCostPerTon: 2.10,
    avgOceanDays: 5.0
  },
  "Port Hedland": {
    country: "Australia",
    warehouse: "Pilbara Iron Siding, WA",
    distanceNm: 3650,
    inlandFirstMileKm: 160,
    inlandFirstMileMode: "Heavy Heavy-Haul Rail",
    inlandFirstMileCostPerTon: 4.90,
    avgOceanDays: 11.0
  }
};

const BASE_RATES_BY_CLASS = {
  Handysize: 22.50,
  Supramax: 18.40,
  Panamax: 16.90,
  Capesize: 11.40
};

export function generateExecutionPlans({
  originPort = "Newcastle",
  destinationPort = "Paradip",
  cargoType = "Thermal Coal",
  cargoQuantity = 70000,
  preferredVesselCategory = "Panamax",
  requiredArrivalDate = "2026-09-14"
}) {
  const originInfo = ORIGIN_PROFILES[originPort] || ORIGIN_PROFILES["Newcastle"];
  const warehouseRanking = rankCandidateWarehouses(destinationPort, cargoType, cargoQuantity);
  const candidates = warehouseRanking.candidates;

  const baseOceanRate = BASE_RATES_BY_CLASS[preferredVesselCategory] || 16.90;

  // Plan 01: Optimal Best-Fit (Rank #1 Warehouse + Contractor #1 + Lowest Landed Cost)
  const c1 = CONTRACTOR_FLEET[0];
  const v1 = c1.vessels[preferredVesselCategory] || c1.vessels.Panamax;
  const wh1 = candidates[0];
  const oceanRate1 = baseOceanRate;
  const firstMileTotal1 = Math.round(cargoQuantity * originInfo.inlandFirstMileCostPerTon);
  const oceanFreightTotal1 = Math.round(cargoQuantity * oceanRate1);
  const portHandlingTotal1 = Math.round(cargoQuantity * 0.60);
  const lastMileTotal1 = wh1.totalInlandCostUsd;
  const landedCostTotal1 = firstMileTotal1 + oceanFreightTotal1 + portHandlingTotal1 + lastMileTotal1;
  const landedPerTon1 = parseFloat((landedCostTotal1 / cargoQuantity).toFixed(2));

  // Plan 02: Alternative Cost & Capacity (Rank #2 Warehouse + Contractor #2)
  const c2 = CONTRACTOR_FLEET[1];
  const v2 = c2.vessels[preferredVesselCategory] || c2.vessels.Panamax;
  const wh2 = candidates[1] || candidates[0];
  const oceanRate2 = parseFloat((baseOceanRate + c2.baseOceanRateDiscount).toFixed(2));
  const firstMileTotal2 = firstMileTotal1;
  const oceanFreightTotal2 = Math.round(cargoQuantity * oceanRate2);
  const portHandlingTotal2 = Math.round(cargoQuantity * 0.65);
  const lastMileTotal2 = wh2.totalInlandCostUsd;
  const landedCostTotal2 = firstMileTotal2 + oceanFreightTotal2 + portHandlingTotal2 + lastMileTotal2;
  const landedPerTon2 = parseFloat((landedCostTotal2 / cargoQuantity).toFixed(2));

  // Plan 03: Fast Transit / Buffer Alternative (Rank #3 or #1 Warehouse + Contractor #3)
  const c3 = CONTRACTOR_FLEET[2];
  const v3 = c3.vessels[preferredVesselCategory] || c3.vessels.Panamax;
  const wh3 = candidates[2] || candidates[0];
  const oceanRate3 = parseFloat((baseOceanRate + c3.baseOceanRateDiscount).toFixed(2));
  const firstMileTotal3 = firstMileTotal1;
  const oceanFreightTotal3 = Math.round(cargoQuantity * oceanRate3);
  const portHandlingTotal3 = Math.round(cargoQuantity * 0.68);
  const lastMileTotal3 = wh3.totalInlandCostUsd;
  const landedCostTotal3 = firstMileTotal3 + oceanFreightTotal3 + portHandlingTotal3 + lastMileTotal3;
  const landedPerTon3 = parseFloat((landedCostTotal3 / cargoQuantity).toFixed(2));

  // Build the 3 distinct plans
  const plan01 = {
    planId: "PLAN-01",
    label: "PLAN 01",
    tag: "RECOMMENDED (OPTIMAL)",
    isRecommended: true,
    rank: 1,
    vessel: {
      name: v1.name,
      category: preferredVesselCategory,
      dwt: v1.dwt,
      draftM: v1.draft,
      loaM: v1.loa,
      beamM: v1.beam,
      speedKnots: v1.speedKnots,
      dailyFuelBurn: `${v1.fuelPerDay} MT/day`,
      healthScore: v1.healthScore,
      ciiRating: v1.cii
    },
    origin: `${originPort}, ${originInfo.country}`,
    originPort,
    originWarehouse: originInfo.warehouse,
    destinationPort,
    destinationWarehouse: {
      id: wh1.id,
      code: wh1.code,
      name: wh1.name,
      distanceKm: wh1.distanceKm,
      transitHours: wh1.transitHours,
      utilizationPct: wh1.currentUtilizationPct,
      suitabilityScore: wh1.suitabilityScore
    },
    contractor: {
      id: c1.contractorId,
      name: c1.contractorName,
      operatorType: c1.operatorType,
      transporterPartner: c1.transporterPartner
    },
    inlandRoute: `${originInfo.warehouse} ➔ ${originPort} Port ➔ ${destinationPort} Port ➔ ${wh1.name}`,
    firstMileSummary: `${originInfo.inlandFirstMileKm} km via ${originInfo.inlandFirstMileMode}`,
    lastMileSummary: `${wh1.distanceKm} km via ${wh1.transportMode} (${wh1.transitHours}h)`,
    estimatedOceanTransitDays: originInfo.avgOceanDays,
    eta: requiredArrivalDate,
    costs: {
      oceanFreightRatePerTon: oceanRate1,
      oceanFreightTotalUsd: oceanFreightTotal1,
      firstMileCostUsd: firstMileTotal1,
      portHandlingCostUsd: portHandlingTotal1,
      lastMileCostUsd: lastMileTotal1,
      totalLandedCostUsd: landedCostTotal1,
      landedCostPerTonUsd: landedPerTon1,
      projectedSavingsUsd: Math.round(cargoQuantity * 1.25)
    },
    portWaitingHours: destinationPort === "Paradip" ? 12 : destinationPort === "Visakhapatnam" ? 16 : 8,
    portWaitingSummary: `${destinationPort === "Paradip" ? 12 : 16} hrs estimated queue`,
    demurrageRisk: "LOW",
    logisticsRisk: "LOW",
    overallFeasibility: "FEASIBLE",
    feasibilityScore: 98,
    keyAdvantages: [
      `Lowest overall landed cost at $${landedPerTon1}/MT`,
      `Top-ranked warehouse (${wh1.code}: ${wh1.name}) with ${100 - wh1.currentUtilizationPct}% capacity headroom`,
      `Grade A Vessel ${v1.name} with 5-Star RightShip rating`
    ]
  };

  const plan02 = {
    planId: "PLAN-02",
    label: "PLAN 02",
    tag: "BALANCED BACKUP",
    isRecommended: false,
    rank: 2,
    vessel: {
      name: v2.name,
      category: preferredVesselCategory,
      dwt: v2.dwt,
      draftM: v2.draft,
      loaM: v2.loa,
      beamM: v2.beam,
      speedKnots: v2.speedKnots,
      dailyFuelBurn: `${v2.fuelPerDay} MT/day`,
      healthScore: v2.healthScore,
      ciiRating: v2.cii
    },
    origin: `${originPort}, ${originInfo.country}`,
    originPort,
    originWarehouse: originInfo.warehouse,
    destinationPort,
    destinationWarehouse: {
      id: wh2.id,
      code: wh2.code,
      name: wh2.name,
      distanceKm: wh2.distanceKm,
      transitHours: wh2.transitHours,
      utilizationPct: wh2.currentUtilizationPct,
      suitabilityScore: wh2.suitabilityScore
    },
    contractor: {
      id: c2.contractorId,
      name: c2.contractorName,
      operatorType: c2.operatorType,
      transporterPartner: c2.transporterPartner
    },
    inlandRoute: `${originInfo.warehouse} ➔ ${originPort} Port ➔ ${destinationPort} Port ➔ ${wh2.name}`,
    firstMileSummary: `${originInfo.inlandFirstMileKm} km via ${originInfo.inlandFirstMileMode}`,
    lastMileSummary: `${wh2.distanceKm} km via ${wh2.transportMode} (${wh2.transitHours}h)`,
    estimatedOceanTransitDays: originInfo.avgOceanDays + 0.5,
    eta: requiredArrivalDate,
    costs: {
      oceanFreightRatePerTon: oceanRate2,
      oceanFreightTotalUsd: oceanFreightTotal2,
      firstMileCostUsd: firstMileTotal2,
      portHandlingCostUsd: portHandlingTotal2,
      lastMileCostUsd: lastMileTotal2,
      totalLandedCostUsd: landedCostTotal2,
      landedCostPerTonUsd: landedPerTon2,
      projectedSavingsUsd: Math.round(cargoQuantity * 0.65)
    },
    portWaitingHours: destinationPort === "Paradip" ? 14 : 18,
    portWaitingSummary: `${destinationPort === "Paradip" ? 14 : 18} hrs queue`,
    demurrageRisk: "MEDIUM",
    logisticsRisk: "LOW",
    overallFeasibility: "FEASIBLE",
    feasibilityScore: 91,
    keyAdvantages: [
      `Alternative secondary terminal route via ${wh2.name}`,
      `Strong fleet reliability with ${c2.contractorName}`,
      `Adequate receiving capacity (Score: ${wh2.suitabilityScore}%)`
    ]
  };

  const plan03 = {
    planId: "PLAN-03",
    label: "PLAN 03",
    tag: "HIGH BUFFER CONTINGENCY",
    isRecommended: false,
    rank: 3,
    vessel: {
      name: v3.name,
      category: preferredVesselCategory,
      dwt: v3.dwt,
      draftM: v3.draft,
      loaM: v3.loa,
      beamM: v3.beam,
      speedKnots: v3.speedKnots,
      dailyFuelBurn: `${v3.fuelPerDay} MT/day`,
      healthScore: v3.healthScore,
      ciiRating: v3.cii
    },
    origin: `${originPort}, ${originInfo.country}`,
    originPort,
    originWarehouse: originInfo.warehouse,
    destinationPort,
    destinationWarehouse: {
      id: wh3.id,
      code: wh3.code,
      name: wh3.name,
      distanceKm: wh3.distanceKm,
      transitHours: wh3.transitHours,
      utilizationPct: wh3.currentUtilizationPct,
      suitabilityScore: wh3.suitabilityScore
    },
    contractor: {
      id: c3.contractorId,
      name: c3.contractorName,
      operatorType: c3.operatorType,
      transporterPartner: c3.transporterPartner
    },
    inlandRoute: `${originInfo.warehouse} ➔ ${originPort} Port ➔ ${destinationPort} Port ➔ ${wh3.name}`,
    firstMileSummary: `${originInfo.inlandFirstMileKm} km via ${originInfo.inlandFirstMileMode}`,
    lastMileSummary: `${wh3.distanceKm} km via ${wh3.transportMode} (${wh3.transitHours}h)`,
    estimatedOceanTransitDays: originInfo.avgOceanDays + 1.0,
    eta: requiredArrivalDate,
    costs: {
      oceanFreightRatePerTon: oceanRate3,
      oceanFreightTotalUsd: oceanFreightTotal3,
      firstMileCostUsd: firstMileTotal3,
      portHandlingCostUsd: portHandlingTotal3,
      lastMileCostUsd: lastMileTotal3,
      totalLandedCostUsd: landedCostTotal3,
      landedCostPerTonUsd: landedPerTon3,
      projectedSavingsUsd: Math.round(cargoQuantity * 0.30)
    },
    portWaitingHours: destinationPort === "Paradip" ? 16 : 22,
    portWaitingSummary: `${destinationPort === "Paradip" ? 16 : 22} hrs queue`,
    demurrageRisk: "MEDIUM",
    logisticsRisk: "MEDIUM",
    overallFeasibility: "FEASIBLE (CONTINGENT)",
    feasibilityScore: 84,
    keyAdvantages: [
      `Immediate spot fixture spot availability`,
      `Additional storage buffer at ${wh3.name}`,
      `Flexible laycan cancellation window`
    ]
  };

  return {
    requirementId: `ASTRA-REQ-001`,
    originPort,
    destinationPort,
    cargoType,
    cargoQuantity,
    preferredVesselCategory,
    rankedWarehouseCandidates: candidates,
    plans: [plan01, plan02, plan03]
  };
}
