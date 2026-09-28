/**
 * ASTRA - Warehouse Suitability & Ranking Engine
 * Evaluates candidate destination warehouses/plants for major East Coast ports
 * based on multi-criteria operational factors.
 */

export const WAREHOUSE_REGISTRY = {
  Paradip: [
    {
      id: "WH-PDP-01",
      code: "WH-07",
      name: "Angul Integrated Steel Complex",
      type: "Integrated Steel Siding & Stockyard",
      distanceKm: 82,
      transitHours: 3.1,
      transportMode: "Multi-Axle Road Truck (NH-53)",
      inlandFreightPerTonUsd: 4.80,
      totalCapacityTons: 150000,
      currentUtilizationPct: 68,
      receivingCapacityTpd: 18000,
      compatibleCargos: ["Thermal Coal", "Coking Coal", "Iron Ore", "Limestone"],
      truckAvailability: 120,
      railSidingAvailable: true,
      congestionRisk: "LOW",
      roadCondition: "4-Lane Dedicated Corridor",
      lat: 20.8400,
      lon: 85.1500
    },
    {
      id: "WH-PDP-02",
      code: "WH-12",
      name: "Kalinganagar Industrial Logistics Park",
      type: "Bulk Commodity Hub",
      distanceKm: 104,
      transitHours: 4.2,
      transportMode: "Heavy Freight Road / Rail (SH-9)",
      inlandFreightPerTonUsd: 5.60,
      totalCapacityTons: 120000,
      currentUtilizationPct: 82,
      receivingCapacityTpd: 14000,
      compatibleCargos: ["Thermal Coal", "Coking Coal", "Petcoke", "Fertilizer"],
      truckAvailability: 85,
      railSidingAvailable: true,
      congestionRisk: "MEDIUM",
      roadCondition: "Heavy Industrial Corridor",
      lat: 20.9500,
      lon: 86.0200
    },
    {
      id: "WH-PDP-03",
      code: "WH-03",
      name: "Rourkela Steel Siding Complex",
      type: "Deep Hinterland Metal Depot",
      distanceKm: 285,
      transitHours: 8.5,
      transportMode: "Freight Rail (BOXN Rakes) / Truck",
      inlandFreightPerTonUsd: 11.20,
      totalCapacityTons: 200000,
      currentUtilizationPct: 54,
      receivingCapacityTpd: 22000,
      compatibleCargos: ["Thermal Coal", "Coking Coal", "Iron Ore"],
      truckAvailability: 140,
      railSidingAvailable: true,
      congestionRisk: "MEDIUM",
      roadCondition: "National Highway / Rail",
      lat: 22.2500,
      lon: 84.8500
    },
    {
      id: "WH-PDP-04",
      code: "WH-09",
      name: "Choudwar Power & Coal Silo Yard",
      type: "Power Plant Buffer Silo",
      distanceKm: 96,
      transitHours: 3.8,
      transportMode: "Road Haulage (NH-16)",
      inlandFreightPerTonUsd: 5.20,
      totalCapacityTons: 80000,
      currentUtilizationPct: 91,
      receivingCapacityTpd: 9000,
      compatibleCargos: ["Thermal Coal", "Petcoke"],
      truckAvailability: 45,
      railSidingAvailable: false,
      congestionRisk: "HIGH",
      roadCondition: "Single Toll Bottleneck",
      lat: 20.5200,
      lon: 85.9200
    }
  ],

  Visakhapatnam: [
    {
      id: "WH-VTZ-01",
      code: "WH-21",
      name: "Vizag Steel & Energy Plant (RINL)",
      type: "Direct Coastal Conveyor & Rail Siding",
      distanceKm: 18,
      transitHours: 0.8,
      transportMode: "Dedicated Closed Conveyor & Tipper",
      inlandFreightPerTonUsd: 1.90,
      totalCapacityTons: 220000,
      currentUtilizationPct: 62,
      receivingCapacityTpd: 28000,
      compatibleCargos: ["Coking Coal", "Thermal Coal", "Iron Ore", "Limestone"],
      truckAvailability: 150,
      railSidingAvailable: true,
      congestionRisk: "LOW",
      roadCondition: "Port Industrial Internal Road",
      lat: 17.6300,
      lon: 83.1800
    },
    {
      id: "WH-VTZ-02",
      code: "WH-25",
      name: "Raipur Sponge Iron Complex Siding",
      type: "Inland Sponge Iron Terminal",
      distanceKm: 520,
      transitHours: 14.0,
      transportMode: "East Coast Heavy Freight Rail",
      inlandFreightPerTonUsd: 16.50,
      totalCapacityTons: 180000,
      currentUtilizationPct: 58,
      receivingCapacityTpd: 16000,
      compatibleCargos: ["Thermal Coal", "Iron Ore"],
      truckAvailability: 90,
      railSidingAvailable: true,
      congestionRisk: "MEDIUM",
      roadCondition: "Rail Freight Transit",
      lat: 21.2500,
      lon: 81.6300
    },
    {
      id: "WH-VTZ-03",
      code: "WH-28",
      name: "Gajuwaka Multimodal Logistics Park",
      type: "Dry Bulk & Container Terminal",
      distanceKm: 24,
      transitHours: 1.2,
      transportMode: "Heavy Road Truck (NH-16)",
      inlandFreightPerTonUsd: 2.80,
      totalCapacityTons: 95000,
      currentUtilizationPct: 75,
      receivingCapacityTpd: 12000,
      compatibleCargos: ["Fertilizer", "Bauxite", "Thermal Coal"],
      truckAvailability: 110,
      railSidingAvailable: false,
      congestionRisk: "LOW",
      roadCondition: "6-Lane Bypass",
      lat: 17.6900,
      lon: 83.2100
    }
  ],

  Dhamra: [
    {
      id: "WH-DHM-01",
      code: "WH-31",
      name: "Kalinganagar Industrial Hub Siding",
      type: "Heavy Industrial Siding",
      distanceKm: 118,
      transitHours: 4.0,
      transportMode: "Dedicated Port Rail Link / Multi-Axle",
      inlandFreightPerTonUsd: 5.10,
      totalCapacityTons: 180000,
      currentUtilizationPct: 55,
      receivingCapacityTpd: 25000,
      compatibleCargos: ["Thermal Coal", "Coking Coal", "Iron Ore"],
      truckAvailability: 130,
      railSidingAvailable: true,
      congestionRisk: "LOW",
      roadCondition: "Direct Expressway & Freight Line",
      lat: 20.9500,
      lon: 86.0200
    },
    {
      id: "WH-DHM-02",
      code: "WH-34",
      name: "Tata Steel Jamshedpur Stockyard",
      type: "Primary Mother Plant Depot",
      distanceKm: 295,
      transitHours: 8.5,
      transportMode: "Unit Freight Train (BOXN)",
      inlandFreightPerTonUsd: 10.20,
      totalCapacityTons: 250000,
      currentUtilizationPct: 72,
      receivingCapacityTpd: 30000,
      compatibleCargos: ["Coking Coal", "Iron Ore", "Limestone"],
      truckAvailability: 160,
      railSidingAvailable: true,
      congestionRisk: "LOW",
      roadCondition: "Double-Track Electrified Freight Line",
      lat: 22.8000,
      lon: 86.2000
    }
  ],

  Haldia: [
    {
      id: "WH-HAL-01",
      code: "WH-41",
      name: "Durgapur Steel Hub Depot",
      type: "Integrated Steel Siding",
      distanceKm: 210,
      transitHours: 7.0,
      transportMode: "40T Multi-Axle Road Truck (NH-19)",
      inlandFreightPerTonUsd: 11.40,
      totalCapacityTons: 140000,
      currentUtilizationPct: 84,
      receivingCapacityTpd: 12000,
      compatibleCargos: ["Coking Coal", "Thermal Coal", "Limestone"],
      truckAvailability: 70,
      railSidingAvailable: true,
      congestionRisk: "HIGH",
      roadCondition: "Frequent Highway Toll Delay",
      lat: 23.5200,
      lon: 87.3100
    },
    {
      id: "WH-HAL-02",
      code: "WH-43",
      name: "Kharagpur Freight Logistics Yard",
      type: "Intermodal Rake Siding",
      distanceKm: 135,
      transitHours: 4.8,
      transportMode: "Freight Rail / Heavy Truck",
      inlandFreightPerTonUsd: 7.80,
      totalCapacityTons: 90000,
      currentUtilizationPct: 70,
      receivingCapacityTpd: 10000,
      compatibleCargos: ["Thermal Coal", "Petcoke", "Fertilizer"],
      truckAvailability: 80,
      railSidingAvailable: true,
      congestionRisk: "MEDIUM",
      roadCondition: "National Highway 16",
      lat: 22.3400,
      lon: 87.3200
    }
  ],

  Krishnapatnam: [
    {
      id: "WH-KPT-01",
      code: "WH-51",
      name: "Ballari Metal & Thermal Siding",
      type: "Heavy Minerals Depot",
      distanceKm: 340,
      transitHours: 9.2,
      transportMode: "Dedicated Rail Corridor / Road",
      inlandFreightPerTonUsd: 12.80,
      totalCapacityTons: 210000,
      currentUtilizationPct: 52,
      receivingCapacityTpd: 24000,
      compatibleCargos: ["Thermal Coal", "Coking Coal", "Iron Ore"],
      truckAvailability: 140,
      railSidingAvailable: true,
      congestionRisk: "LOW",
      roadCondition: "Direct Rail Link & 4-Lane Road",
      lat: 15.1400,
      lon: 76.9200
    },
    {
      id: "WH-KPT-02",
      code: "WH-53",
      name: "Nellore Power & Logistics Siding",
      type: "Coastal Power Buffer Yard",
      distanceKm: 35,
      transitHours: 1.2,
      transportMode: "Heavy Multi-Axle Road Truck",
      inlandFreightPerTonUsd: 2.90,
      totalCapacityTons: 110000,
      currentUtilizationPct: 60,
      receivingCapacityTpd: 15000,
      compatibleCargos: ["Thermal Coal", "Limestone"],
      truckAvailability: 95,
      railSidingAvailable: false,
      congestionRisk: "LOW",
      roadCondition: "Express Port Corridor",
      lat: 14.4400,
      lon: 79.9800
    }
  ]
};

/**
 * Multi-criteria decision ranking algorithm:
 * Considers distance, capacity, cargo compatibility, utilization, transit time, and operational risk.
 */
export function rankCandidateWarehouses(portName, cargoType = "Thermal Coal", cargoQuantity = 70000) {
  const candidates = WAREHOUSE_REGISTRY[portName] || WAREHOUSE_REGISTRY["Paradip"];

  const evaluated = candidates.map(wh => {
    // 1. Cargo compatibility check (binary multiplier)
    const isCompatible = wh.compatibleCargos.some(c => 
      c.toLowerCase() === cargoType.toLowerCase() || 
      cargoType.toLowerCase().includes(c.toLowerCase())
    );

    // 2. Capacity Score (0-25 pts): Available headroom vs cargo volume
    const availableHeadroomTons = wh.totalCapacityTons * (1 - wh.currentUtilizationPct / 100);
    const capacityRatio = Math.min(2.0, availableHeadroomTons / (cargoQuantity * 0.4));
    const capacityScore = Math.min(25, capacityRatio * 12.5);

    // 3. Distance & Transit Score (0-25 pts): Shorter distance = higher score
    const distanceScore = Math.max(0, 25 - (wh.distanceKm / 20));

    // 4. Inland Cost Score (0-25 pts): Lower freight rate = higher score
    const costScore = Math.max(0, 25 - (wh.inlandFreightPerTonUsd * 1.5));

    // 5. Operational & Risk Score (0-25 pts): Utilization, turnaround, congestion
    let riskPenalty = wh.congestionRisk === "HIGH" ? 12 : wh.congestionRisk === "MEDIUM" ? 5 : 0;
    const utilizationScore = Math.max(0, 15 - ((wh.currentUtilizationPct - 50) * 0.3));
    const truckBonus = wh.truckAvailability >= 100 ? 5 : wh.truckAvailability >= 60 ? 3 : 1;
    const operationalScore = Math.max(0, utilizationScore + truckBonus + (wh.railSidingAvailable ? 5 : 0) - riskPenalty);

    // Composite suitability score (0-100)
    let totalScore = capacityScore + distanceScore + costScore + operationalScore;
    if (!isCompatible) totalScore *= 0.4; // heavy penalty if cargo not natively handled
    const suitabilityScore = Math.min(99, Math.max(25, Math.round(totalScore)));

    // Qualitative assessment
    let rating = "EXCELLENT";
    if (suitabilityScore < 65) rating = "SUB-OPTIMAL";
    else if (suitabilityScore < 80) rating = "GOOD";

    return {
      ...wh,
      isCompatible,
      availableHeadroomTons: Math.round(availableHeadroomTons),
      suitabilityScore,
      rating,
      totalInlandCostUsd: Math.round(cargoQuantity * wh.inlandFreightPerTonUsd),
      estimatedDeliveryEta: `+${Math.ceil(wh.transitHours + 1.5)} hrs from Port Exit`
    };
  });

  // Sort descending by suitability score
  evaluated.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  return {
    portName,
    cargoType,
    cargoQuantity,
    bestWarehouse: evaluated[0],
    candidates: evaluated
  };
}
