import { Router } from "express";

const router = Router();

const EVENT_TYPES = [
  { event: "shipment_picked_up", severity: "info" as const },
  { event: "truck_arrived_warehouse", severity: "info" as const },
  { event: "shipment_delayed", severity: "warning" as const },
  { event: "route_optimized", severity: "info" as const },
  { event: "driver_assigned", severity: "info" as const },
  { event: "inventory_low", severity: "warning" as const },
  { event: "shipment_delivered", severity: "info" as const },
  { event: "truck_breakdown", severity: "critical" as const },
  { event: "demand_spike_detected", severity: "warning" as const },
  { event: "ai_route_suggestion", severity: "info" as const },
  // New microservice events
  { event: "truck_arrived_yard", severity: "info" as const },
  { event: "dock_assigned", severity: "info" as const },
  { event: "yard_congestion_high", severity: "warning" as const },
  { event: "shipment_verified", severity: "info" as const },
  { event: "shipment_damaged", severity: "critical" as const },
  { event: "network_optimized", severity: "info" as const },
  { event: "worker_task_completed", severity: "info" as const },
  { event: "worker_reward_earned", severity: "info" as const },
  { event: "consolidation_opportunity", severity: "warning" as const },
];

const REASONS: Record<string, string[]> = {
  shipment_delayed: ["traffic congestion", "weather conditions", "mechanical issue", "customs clearance"],
  truck_breakdown: ["engine failure", "flat tire", "fuel shortage", "electrical fault"],
  inventory_low: ["high demand", "supply chain disruption", "seasonal surge"],
  demand_spike_detected: ["festival season", "flash sale", "industrial demand"],
};

const LOCATIONS = [
  "Mumbai Depot", "Delhi Hub", "Bangalore Warehouse",
  "Chennai Port", "Hyderabad Yard", "Pune Distribution Center",
  "Kolkata Terminal", "Ahmedabad Facility"
];

const SHIPMENT_IDS = ["S1001", "S1002", "S1003", "S1004", "S1005", "S1006", "S1007"];
const TRUCK_IDS = ["T001", "T002", "T003", "T004", "T005", "T006", "T007", "T008"];

let eventBuffer: object[] = [];
let eventIdCounter = 1000;

function generateEvent() {
  const template = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  const reasons = REASONS[template.event];
  const event: Record<string, unknown> = {
    id: `EVT${eventIdCounter++}`,
    event: template.event,
    severity: template.severity,
    timestamp: new Date().toISOString(),
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
  };

  if (Math.random() > 0.3) {
    event.shipment_id = SHIPMENT_IDS[Math.floor(Math.random() * SHIPMENT_IDS.length)];
  }
  if (Math.random() > 0.5) {
    event.truck_id = TRUCK_IDS[Math.floor(Math.random() * TRUCK_IDS.length)];
  }
  if (reasons) {
    event.reason = reasons[Math.floor(Math.random() * reasons.length)];
  }

  return event;
}

// Pre-fill buffer with 10 events
for (let i = 0; i < 10; i++) {
  eventBuffer.push(generateEvent());
}

// Generate new event every 4 seconds
setInterval(() => {
  eventBuffer.unshift(generateEvent());
  if (eventBuffer.length > 50) eventBuffer = eventBuffer.slice(0, 50);
}, 4000);

router.get("/events/latest", (_req, res) => {
  res.json(eventBuffer.slice(0, 20));
});

export default router;
