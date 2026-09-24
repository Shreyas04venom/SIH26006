/**
 * ASTRA - Unified Supply Chain Event Service
 *
 * Central operational event stream connecting:
 * Company, Contractor, Logistics Ops, Port Ops, Alerts, and Decision History.
 */

let eventStore = [
  {
    id: "EVT-8801",
    requirementId: "ASTRA-REQ-001",
    type: "TRUCK_DISPATCHED",
    severity: "INFO",
    title: "First-Mile Fleet Dispatched from Mine Siding",
    detail: "48x 40T multi-axle tipper trucks dispatched from Hunter Valley Mine Siding to Newcastle Port Jetty.",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
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
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
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
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    entityId: "VESSEL-001",
    roleRecipient: ["company", "contractor"]
  },
  {
    id: "EVT-8804",
    requirementId: "ASTRA-REQ-001",
    type: "VESSEL_POSITION_UPDATED",
    severity: "LOW",
    title: "AIS Telemetry Ping Synchronized",
    detail: "MV Bengal Voyager cruising at 13.8 kts in Bay of Bengal approaches (Heading 295° WNW).",
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    entityId: "VESSEL-001",
    roleRecipient: ["company", "contractor", "port_operator"]
  }
];

export function getEvents(requirementId = null) {
  if (requirementId) {
    return eventStore.filter(e => e.requirementId === requirementId);
  }
  return eventStore;
}

export function recordEvent(eventData) {
  const newEvt = {
    id: `EVT-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    ...eventData
  };
  eventStore.unshift(newEvt);
  return newEvt;
}

export function clearEvents() {
  eventStore = [];
  return true;
}
