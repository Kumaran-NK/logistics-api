import { db } from "./index";
import {
  driversTable, trucksTable, locationsTable,
  shipmentsTable, shipmentEventsTable,
  productsTable, warehouseStockTable,
  yardSlotsTable, docksTable, truckArrivalsTable,
  workersTable, workerTasksTable,
  shipmentVerificationsTable,
} from "./schema";

async function seed() {
  console.log("Seeding database with sample logistics data...");

  // ── Drivers ────────────────────────────────────────────────────────────────
  await db.insert(driversTable).values([
    { id: "D001", name: "Rajesh Kumar",    license_number: "MH01-20190012345", status: "on_duty",   phone: "+91-9876543210", truck_id: "T001", rating: 4.8, total_deliveries: 312 },
    { id: "D002", name: "Suresh Patel",    license_number: "GJ01-20180023456", status: "available", phone: "+91-9876543211", truck_id: null,   rating: 4.5, total_deliveries: 198 },
    { id: "D003", name: "Amit Sharma",     license_number: "DL01-20210034567", status: "on_duty",   phone: "+91-9876543212", truck_id: "T003", rating: 4.9, total_deliveries: 456 },
    { id: "D004", name: "Vikram Singh",    license_number: "RJ01-20170045678", status: "on_duty",   phone: "+91-9876543213", truck_id: "T004", rating: 4.2, total_deliveries: 134 },
    { id: "D005", name: "Arun Nair",       license_number: "KL01-20200056789", status: "on_duty",   phone: "+91-9876543214", truck_id: "T005", rating: 4.6, total_deliveries: 278 },
    { id: "D006", name: "Pradeep Yadav",   license_number: "UP01-20160067890", status: "on_duty",   phone: "+91-9876543215", truck_id: "T006", rating: 4.3, total_deliveries: 167 },
    { id: "D007", name: "Sanjay Mehta",    license_number: "MP01-20190078901", status: "available", phone: "+91-9876543216", truck_id: null,   rating: 4.7, total_deliveries: 389 },
    { id: "D008", name: "Ravi Krishnan",   license_number: "TN01-20200089012", status: "available", phone: "+91-9876543217", truck_id: null,   rating: 4.4, total_deliveries: 221 },
  ]).onConflictDoNothing();

  // ── Trucks ─────────────────────────────────────────────────────────────────
  await db.insert(trucksTable).values([
    { truck_id: "T001", license_plate: "MH01AB1234", model: "Tata Prima 4028.S",      capacity_kg: 5000, status: "in_transit",  driver_id: "D001" },
    { truck_id: "T002", license_plate: "GJ01CD5678", model: "Ashok Leyland 3718",     capacity_kg: 3800, status: "available",   driver_id: null   },
    { truck_id: "T003", license_plate: "DL01EF9012", model: "Eicher Pro 6028",        capacity_kg: 6000, status: "in_transit",  driver_id: "D003" },
    { truck_id: "T004", license_plate: "RJ01GH3456", model: "BharatBenz 2523R",       capacity_kg: 4500, status: "in_transit",  driver_id: "D004" },
    { truck_id: "T005", license_plate: "KL01IJ7890", model: "Tata Signa 4825.S",      capacity_kg: 5500, status: "in_transit",  driver_id: "D005" },
    { truck_id: "T006", license_plate: "UP01KL2345", model: "Mahindra Blazo X 40",    capacity_kg: 4000, status: "in_transit",  driver_id: "D006" },
    { truck_id: "T007", license_plate: "MP01MN6789", model: "Volvo FH16",             capacity_kg: 7000, status: "maintenance", driver_id: null   },
    { truck_id: "T008", license_plate: "HR01OP1234", model: "Tata Prima 5530.S",      capacity_kg: 6500, status: "idle",        driver_id: null   },
  ]).onConflictDoNothing();

  // ── Locations (GPS) ────────────────────────────────────────────────────────
  await db.insert(locationsTable).values([
    { id: "L001", truck_id: "T001", lat: 18.9774, lng: 73.0171, speed_kmh: 65,  fuel_pct: 72 },
    { id: "L002", truck_id: "T002", lat: 28.6107, lng: 77.1177, speed_kmh: 0,   fuel_pct: 95 },
    { id: "L003", truck_id: "T003", lat: 12.8644, lng: 77.3665, speed_kmh: 78,  fuel_pct: 61 },
    { id: "L004", truck_id: "T004", lat: 12.7929, lng: 80.4194, speed_kmh: 55,  fuel_pct: 48 },
    { id: "L005", truck_id: "T005", lat: 17.3277, lng: 78.0372, speed_kmh: 82,  fuel_pct: 38 },
    { id: "L006", truck_id: "T006", lat: 22.5588, lng: 88.5425, speed_kmh: 71,  fuel_pct: 29 },
    { id: "L007", truck_id: "T007", lat: 23.2353, lng: 72.3764, speed_kmh: 0,   fuel_pct: 55 },
    { id: "L008", truck_id: "T008", lat: 18.4218, lng: 73.9545, speed_kmh: 0,   fuel_pct: 88 },
  ]).onConflictDoNothing();

  // ── Shipments ──────────────────────────────────────────────────────────────
  const now = new Date();
  const d = (offset: number) => new Date(now.getTime() + offset * 86400000).toISOString().split("T")[0];
  await db.insert(shipmentsTable).values([
    { id: "S1001", origin: "Mumbai",    destination: "Delhi",     status: "in_transit", driver_id: "D001", estimated_delivery: d(2),  weight_kg: 450.5, priority: "high"   },
    { id: "S1002", origin: "Bangalore", destination: "Chennai",   status: "delivered",  driver_id: "D002", estimated_delivery: d(-2), weight_kg: 120,   priority: "medium" },
    { id: "S1003", origin: "Delhi",     destination: "Kolkata",   status: "pending",    driver_id: null,   estimated_delivery: d(4),  weight_kg: 780,   priority: "low"    },
    { id: "S1004", origin: "Hyderabad", destination: "Pune",      status: "delayed",    driver_id: "D003", estimated_delivery: d(0),  weight_kg: 230.5, priority: "high"   },
    { id: "S1005", origin: "Ahmedabad", destination: "Jaipur",    status: "in_transit", driver_id: "D004", estimated_delivery: d(3),  weight_kg: 390,   priority: "medium" },
    { id: "S1006", origin: "Chennai",   destination: "Mumbai",    status: "pending",    driver_id: null,   estimated_delivery: d(5),  weight_kg: 560,   priority: "medium" },
    { id: "S1007", origin: "Kolkata",   destination: "Hyderabad", status: "in_transit", driver_id: "D005", estimated_delivery: d(1),  weight_kg: 145,   priority: "high"   },
    { id: "S1008", origin: "Pune",      destination: "Bangalore", status: "delivered",  driver_id: "D001", estimated_delivery: d(-3), weight_kg: 290,   priority: "medium" },
    { id: "S1009", origin: "Jaipur",    destination: "Ahmedabad", status: "cancelled",  driver_id: null,   estimated_delivery: d(-1), weight_kg: 670,   priority: "low"    },
    { id: "S1010", origin: "Mumbai",    destination: "Bangalore", status: "in_transit", driver_id: "D006", estimated_delivery: d(2),  weight_kg: 380,   priority: "high"   },
  ]).onConflictDoNothing();

  // ── Shipment Events ────────────────────────────────────────────────────────
  await db.insert(shipmentEventsTable).values([
    { id: "E001", shipment_id: "S1001", event_type: "picked_up",     description: "Cargo picked up from Mumbai warehouse", location: "Mumbai" },
    { id: "E002", shipment_id: "S1001", event_type: "checkpoint",    description: "Cleared Nashik checkpoint",            location: "Nashik" },
    { id: "E003", shipment_id: "S1004", event_type: "delay",         description: "Delayed due to road construction",     location: "Solapur" },
    { id: "E004", shipment_id: "S1007", event_type: "picked_up",     description: "Cargo picked up from Kolkata",         location: "Kolkata" },
    { id: "E005", shipment_id: "S1010", event_type: "checkpoint",    description: "Cleared Pune toll",                    location: "Pune" },
    { id: "E006", shipment_id: "S1002", event_type: "delivered",     description: "Delivered to Chennai hub",             location: "Chennai" },
    { id: "E007", shipment_id: "S1005", event_type: "checkpoint",    description: "Crossed state border",                 location: "Udaipur" },
  ]).onConflictDoNothing();

  // ── Products ───────────────────────────────────────────────────────────────
  await db.insert(productsTable).values([
    { id: "P001", product_name: "Industrial Bearings",   sku: "IND-BRG-001", category: "Mechanical Parts",  unit_price: 2500  },
    { id: "P002", product_name: "Electronic Components", sku: "ELC-CMP-002", category: "Electronics",       unit_price: 450   },
    { id: "P003", product_name: "Textile Rolls",         sku: "TXT-ROL-003", category: "Textiles",          unit_price: 3200  },
    { id: "P004", product_name: "Pharmaceutical Packs",  sku: "PHR-PCK-004", category: "Pharmaceuticals",   unit_price: 8500  },
    { id: "P005", product_name: "Automotive Parts",      sku: "AUT-PRT-005", category: "Automotive",        unit_price: 5600  },
    { id: "P006", product_name: "FMCG Goods",            sku: "FMG-GDS-006", category: "Consumer Goods",    unit_price: 180   },
    { id: "P007", product_name: "Steel Coils",           sku: "STL-COL-007", category: "Raw Materials",     unit_price: 62000 },
    { id: "P008", product_name: "Chemical Drums",        sku: "CHM-DRM-008", category: "Chemicals",         unit_price: 4200  },
  ]).onConflictDoNothing();

  // ── Warehouse Stock ────────────────────────────────────────────────────────
  await db.insert(warehouseStockTable).values([
    { id: "WS001", product_id: "P001", warehouse: "Mumbai WH-1",   quantity: 450,  reorder_point: 100, predicted_demand: "HIGH",   confidence: "mock" },
    { id: "WS002", product_id: "P002", warehouse: "Mumbai WH-1",   quantity: 1200, reorder_point: 200, predicted_demand: "MEDIUM", confidence: "mock" },
    { id: "WS003", product_id: "P003", warehouse: "Delhi WH-2",    quantity: 80,   reorder_point: 150, predicted_demand: "LOW",    confidence: "mock" },
    { id: "WS004", product_id: "P004", warehouse: "Delhi WH-2",    quantity: 320,  reorder_point: 50,  predicted_demand: "HIGH",   confidence: "mock" },
    { id: "WS005", product_id: "P005", warehouse: "Pune WH-3",     quantity: 15,   reorder_point: 100, predicted_demand: "HIGH",   confidence: "mock" },
    { id: "WS006", product_id: "P006", warehouse: "Pune WH-3",     quantity: 5600, reorder_point: 500, predicted_demand: "MEDIUM", confidence: "mock" },
    { id: "WS007", product_id: "P007", warehouse: "Chennai WH-4",  quantity: 220,  reorder_point: 50,  predicted_demand: "LOW",    confidence: "mock" },
    { id: "WS008", product_id: "P008", warehouse: "Chennai WH-4",  quantity: 90,   reorder_point: 30,  predicted_demand: "MEDIUM", confidence: "mock" },
    { id: "WS009", product_id: "P001", warehouse: "Kolkata WH-5",  quantity: 180,  reorder_point: 80,  predicted_demand: "MEDIUM", confidence: "mock" },
    { id: "WS010", product_id: "P002", warehouse: "Kolkata WH-5",  quantity: 640,  reorder_point: 100, predicted_demand: "HIGH",   confidence: "mock" },
  ]).onConflictDoNothing();

  // ── Yard Slots ─────────────────────────────────────────────────────────────
  await db.insert(yardSlotsTable).values([
    { id: "YS01", zone: "A", status: "occupied", truck_id: "T001", dock_id: "D01" },
    { id: "YS02", zone: "A", status: "free",     truck_id: null,   dock_id: null  },
    { id: "YS03", zone: "A", status: "free",     truck_id: null,   dock_id: null  },
    { id: "YS04", zone: "B", status: "occupied", truck_id: "T003", dock_id: "D02" },
    { id: "YS05", zone: "B", status: "reserved", truck_id: null,   dock_id: "D03" },
    { id: "YS06", zone: "B", status: "free",     truck_id: null,   dock_id: null  },
    { id: "YS07", zone: "C", status: "occupied", truck_id: "T007", dock_id: null  },
    { id: "YS08", zone: "C", status: "free",     truck_id: null,   dock_id: null  },
    { id: "YS09", zone: "C", status: "free",     truck_id: null,   dock_id: null  },
    { id: "YS10", zone: "D", status: "free",     truck_id: null,   dock_id: null  },
    { id: "YS11", zone: "D", status: "free",     truck_id: null,   dock_id: null  },
    { id: "YS12", zone: "D", status: "reserved", truck_id: null,   dock_id: "D04" },
  ]).onConflictDoNothing();

  // ── Docks ──────────────────────────────────────────────────────────────────
  await db.insert(docksTable).values([
    { id: "D01", warehouse_id: "WH-Mumbai",  name: "Dock Alpha",   assigned_truck: "T001", status: "occupied"  },
    { id: "D02", warehouse_id: "WH-Mumbai",  name: "Dock Beta",    assigned_truck: "T003", status: "occupied"  },
    { id: "D03", warehouse_id: "WH-Delhi",   name: "Dock Gamma",   assigned_truck: null,   status: "available" },
    { id: "D04", warehouse_id: "WH-Delhi",   name: "Dock Delta",   assigned_truck: null,   status: "available" },
    { id: "D05", warehouse_id: "WH-Pune",    name: "Dock Epsilon", assigned_truck: null,   status: "available" },
    { id: "D06", warehouse_id: "WH-Chennai", name: "Dock Zeta",    assigned_truck: null,   status: "maintenance" },
  ]).onConflictDoNothing();

  // ── Truck Arrivals ─────────────────────────────────────────────────────────
  const ts = (h: number) => new Date(Date.now() + h * 3600000).toISOString();
  await db.insert(truckArrivalsTable).values([
    { id: "TA01", truck_id: "T002", scheduled_time: ts(2),  actual_arrival: null,    assigned_slot: "YS02", dock_id: "D03", status: "scheduled" },
    { id: "TA02", truck_id: "T005", scheduled_time: ts(5),  actual_arrival: null,    assigned_slot: "YS06", dock_id: "D04", status: "scheduled" },
    { id: "TA03", truck_id: "T001", scheduled_time: ts(-3), actual_arrival: ts(-3),  assigned_slot: "YS01", dock_id: "D01", status: "arrived"   },
    { id: "TA04", truck_id: "T004", scheduled_time: ts(8),  actual_arrival: null,    assigned_slot: null,   dock_id: null,  status: "en_route"  },
  ]).onConflictDoNothing();

  // ── Workers ────────────────────────────────────────────────────────────────
  await db.insert(workersTable).values([
    { id: "W001", name: "Anita Desai",     role: "Loader",         warehouse_id: "WH-Mumbai",  performance_score: 88, reward_points: 420, tasks_completed: 142, status: "active",    ai_recommendation: "Assign to high-priority dock loading" },
    { id: "W002", name: "Balu Rajan",      role: "Forklift Op.",   warehouse_id: "WH-Mumbai",  performance_score: 92, reward_points: 610, tasks_completed: 198, status: "active",    ai_recommendation: "Promote to senior operator" },
    { id: "W003", name: "Chetan Verma",    role: "QC Inspector",   warehouse_id: "WH-Delhi",   performance_score: 74, reward_points: 210, tasks_completed: 87,  status: "active",    ai_recommendation: "Additional QC training recommended" },
    { id: "W004", name: "Deepa Menon",     role: "Inventory Clerk",warehouse_id: "WH-Delhi",   performance_score: 81, reward_points: 340, tasks_completed: 115, status: "active",    ai_recommendation: "Consider for team lead role" },
    { id: "W005", name: "Farhan Qureshi",  role: "Loader",         warehouse_id: "WH-Pune",    performance_score: 65, reward_points: 120, tasks_completed: 54,  status: "on_break",  ai_recommendation: "Performance coaching needed" },
    { id: "W006", name: "Geeta Pillai",    role: "Dispatcher",     warehouse_id: "WH-Pune",    performance_score: 95, reward_points: 780, tasks_completed: 267, status: "active",    ai_recommendation: "Star performer — candidate for supervisor" },
    { id: "W007", name: "Harish Babu",     role: "Forklift Op.",   warehouse_id: "WH-Chennai", performance_score: 79, reward_points: 290, tasks_completed: 103, status: "active",    ai_recommendation: "Stable performance" },
    { id: "W008", name: "Indira Nath",     role: "QC Inspector",   warehouse_id: "WH-Chennai", performance_score: 83, reward_points: 365, tasks_completed: 128, status: "inactive",  ai_recommendation: "Return-to-work assessment pending" },
  ]).onConflictDoNothing();

  // ── Worker Tasks ───────────────────────────────────────────────────────────
  await db.insert(workerTasksTable).values([
    { id: "WT01", worker_id: "W001", task_type: "loading",    description: "Load S1001 cargo onto T001",     completed: true,  priority: "high"   },
    { id: "WT02", worker_id: "W002", task_type: "unloading",  description: "Unload S1008 at Bay 3",          completed: true,  priority: "medium" },
    { id: "WT03", worker_id: "W003", task_type: "inspection", description: "QC check on incoming S1006",     completed: false, priority: "high"   },
    { id: "WT04", worker_id: "W004", task_type: "inventory",  description: "Stock count zone B-14",          completed: false, priority: "low"    },
    { id: "WT05", worker_id: "W006", task_type: "dispatch",   description: "Coordinate dispatch for S1003",  completed: false, priority: "high"   },
    { id: "WT06", worker_id: "W007", task_type: "loading",    description: "Load S1010 onto T006",           completed: true,  priority: "high"   },
  ]).onConflictDoNothing();

  // ── Shipment Verifications ─────────────────────────────────────────────────
  await db.insert(shipmentVerificationsTable).values([
    { id: "SV001", shipment_id: "S1002", scan_code: "QR-S1002-A", verification_status: "verified",  damage_flag: false, verified_by: "W003", confidence: "0.97" },
    { id: "SV002", shipment_id: "S1008", scan_code: "QR-S1008-B", verification_status: "verified",  damage_flag: false, verified_by: "W008", confidence: "0.94" },
    { id: "SV003", shipment_id: "S1004", scan_code: "QR-S1004-C", verification_status: "flagged",   damage_flag: true,  damage_description: "Corner dent detected on outer packaging", verified_by: "W003", confidence: "0.88" },
    { id: "SV004", shipment_id: "S1001", scan_code: "QR-S1001-D", verification_status: "pending",   damage_flag: false, verified_by: null,   confidence: "mock" },
    { id: "SV005", shipment_id: "S1007", scan_code: "QR-S1007-E", verification_status: "in_review", damage_flag: false, verified_by: null,   confidence: "mock" },
  ]).onConflictDoNothing();

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
