import React from "react";
import RoadLogistics from "../pages/RoadLogistics";

/**
 * RoadFleetSimulator - Delegates directly to the Road Logistics Fleet Dashboard & Gate Control
 * ensuring unified, clean, perfectly aligned UI across both the Road Transporter dashboard role and /road-logistics.
 */
export default function RoadFleetSimulator() {
  return <RoadLogistics />;
}
