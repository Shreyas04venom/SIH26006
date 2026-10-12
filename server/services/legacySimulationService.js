/**
 * ASTRA - ARCHIVED LEGACY FORMULA LOGIC
 * =====================================
 * This file safely stores and preserves the original trigonometric / heuristic
 * mathematical formulas previously used across ASTRA.
 * 
 * NOTE: These formulas are preserved for reference and legacy backup,
 * but are replaced in production by the trained Data Science & MILP models.
 */

// 1. LEGACY FREIGHT FORECAST (Original Math.sin / Math.cos wave simulation)
export function getLegacyFreightForecast({ destinationPort = "Paradip", vesselClass = "Panamax" }) {
  const baseRates = { Handysize: 24.5, Supramax: 20.8, Panamax: 17.6, Capesize: 12.2 };
  const portMod = { Kolkata: 3.2, Haldia: 2.5, Chennai: 1.8, Paradip: 0, Visakhapatnam: 0.5, Dhamra: -0.4 }[destinationPort] || 0;
  const currentRate = parseFloat(((baseRates[vesselClass] || 18.0) + portMod).toFixed(2));
  const isUp = destinationPort === "Chennai" || destinationPort === "Kolkata";
  const predictedRate = parseFloat((isUp ? currentRate * 1.074 : currentRate * 0.938).toFixed(2));
  const trend = isUp ? "up" : "down";

  const series = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().slice(5, 10);
    const wave = Math.sin(i * 0.35) * 0.9;
    const noise = Math.cos(i * 0.7) * 0.3;
    const act = parseFloat((currentRate - (isUp ? (30 - i) * 0.05 : -(30 - i) * 0.04) + wave + noise).toFixed(2));
    const pred = parseFloat((act + (Math.sin(i * 0.5) * 0.18)).toFixed(2));
    const bdi = Math.round(1450 + act * 45 + (Math.sin(i * 0.4) * 60));
    series.push({ 
      date: dateStr, 
      actual: act, 
      predicted: pred,
      bdiIndex: bdi,
      confidenceUpper: parseFloat((act + 0.65).toFixed(2)),
      confidenceLower: parseFloat((act - 0.65).toFixed(2)),
    });
  }

  for (let i = 1; i <= 14; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const dateStr = d.toISOString().slice(5, 10);
    const pred = parseFloat((currentRate + (isUp ? i * 0.12 : -i * 0.09) + (Math.sin(i * 0.4) * 0.2)).toFixed(2));
    const spread = 0.45 + i * 0.08;
    const bdi = Math.round(1450 + pred * 45 + (isUp ? i * 15 : -i * 12));
    series.push({ 
      date: dateStr, 
      predicted: pred,
      bdiIndex: bdi,
      confidenceUpper: parseFloat((pred + spread).toFixed(2)),
      confidenceLower: parseFloat((pred - spread).toFixed(2)),
    });
  }

  return {
    destinationPort,
    vesselClass,
    currentRate,
    predictedRate,
    trend,
    series
  };
}

// 2. LEGACY PORT WAITING TIME (Original static lookup +/- 4h)
export function getLegacyWaitingTime(port) {
  const expectedWaitingHours = port.historicalWaitingHours || 12;
  const rangeLow = Math.max(2, expectedWaitingHours - 4);
  const rangeHigh = expectedWaitingHours + 7;
  return {
    expectedWaitingHours,
    rangeLow,
    rangeHigh
  };
}

// 3. LEGACY IDLE RISK (Original ternary operator check)
export function getLegacyIdleRisk(port) {
  const risk = port.currentCongestion === "High" ? "HIGH" : port.currentCongestion === "Medium" ? "MEDIUM" : "LOW";
  const score = risk === "HIGH" ? 0.78 : risk === "MEDIUM" ? 0.48 : 0.22;
  return { risk, score };
}

// 4. LEGACY VESSEL MATCHING & HEURISTIC SORTING
export function getLegacyVesselMatching(fleet, port, cargoQuantity = 60000, preferredVesselCategory = "Panamax") {
  const bunkerPrice = 585;
  const voyageDays = 14;

  const candidates = fleet.filter(v => {
    return v.category === preferredVesselCategory || 
      (preferredVesselCategory === 'Panamax' && v.category === 'Supramax') || 
      (preferredVesselCategory === 'Capesize' && v.category === 'Panamax');
  }).slice(0, 8);

  const ranked = candidates.map(vessel => {
    const freightRatePerTon = vessel.category === "Handysize" ? 23.5 : vessel.category === "Supramax" ? 19.8 : vessel.category === "Panamax" ? 17.2 : 11.8;
    const freightCost = cargoQuantity * freightRatePerTon;
    const fuelCost = voyageDays * vessel.fuelConsumptionTonsPerDay * bunkerPrice;
    const demurragePerHour = 1200;
    const waitingHours = port.historicalWaitingHours || 12;
    const waitingCost = waitingHours * demurragePerHour;
    const totalCost = freightCost + fuelCost + waitingCost;
    const capacityUtilization = Math.min(100, Math.round((cargoQuantity / vessel.cargoCapacityTons) * 100));

    const draftPass = vessel.draftM <= port.maxDraftM;
    const loaPass = vessel.loaM <= port.maxLoaM;
    const beamPass = vessel.beamM <= port.maxBeamM;
    const compatible = draftPass && loaPass && beamPass && cargoQuantity <= vessel.cargoCapacityTons;

    return {
      vessel,
      predictedFreightUsdPerTon: freightRatePerTon,
      freightCost,
      fuelCost,
      waitingCost,
      totalCost,
      waitingHours,
      capacityUtilization,
      compatible
    };
  });

  ranked.sort((a, b) => {
    if (a.compatible && !b.compatible) return -1;
    if (!a.compatible && b.compatible) return 1;
    return a.totalCost - b.totalCost;
  });

  return ranked;
}

// 5. LEGACY NEW REQUIREMENT FORWARD SPIKE SIMULATION
export function getLegacyForwardSpikeCurve(currentSpotRate) {
  const data = [];
  const now = new Date();
  for (let i = 5; i >= 1; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().slice(5, 10);
    const historicalRate = parseFloat((currentSpotRate - (i * 0.06) + Math.sin(i * 0.5) * 0.05).toFixed(2));
    data.push({ date: dateStr, actual: historicalRate, lockedSpot: currentSpotRate });
  }
  data.push({ date: "Today (Lock)", actual: currentSpotRate, lockedSpot: currentSpotRate, projected: currentSpotRate });
  for (let i = 1; i <= 10; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const dateStr = d.toISOString().slice(5, 10);
    const projRate = parseFloat((currentSpotRate + (i * 0.08) + Math.sin(i * 0.4) * 0.04).toFixed(2));
    data.push({ date: `+${i}d (${dateStr})`, projected: projRate, lockedSpot: currentSpotRate });
  }
  return data;
}
