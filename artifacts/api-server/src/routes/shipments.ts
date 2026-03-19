import { Router } from "express";
import { db } from "@workspace/db";
import { shipmentsTable, shipmentEventsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata",
  "Hyderabad", "Pune", "Ahmedabad", "Surat", "Jaipur",
  "Lucknow", "Kanpur", "Nagpur", "Visakhapatnam", "Indore"
];

function randomCity(exclude?: string) {
  const options = exclude ? CITIES.filter(c => c !== exclude) : CITIES;
  return options[Math.floor(Math.random() * options.length)];
}

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

router.get("/shipments", async (_req, res) => {
  try {
    const shipments = await db.select().from(shipmentsTable).orderBy(shipmentsTable.created_at);
    res.json(shipments.map(s => ({
      ...s,
      created_at: s.created_at.toISOString(),
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
});

router.post("/shipments", async (req, res) => {
  try {
    const body = req.body;
    const id = `S${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const newShipment = await db.insert(shipmentsTable).values({
      id,
      origin: body.origin,
      destination: body.destination,
      weight_kg: body.weight_kg,
      priority: body.priority || "medium",
      status: "pending",
      estimated_delivery: body.estimated_delivery || daysFromNow(3),
    }).returning();

    // Auto-create first event
    await db.insert(shipmentEventsTable).values({
      id: randomUUID(),
      shipment_id: id,
      event_type: "created",
      description: `Shipment created from ${body.origin} to ${body.destination}`,
      location: body.origin,
    });

    const s = newShipment[0];
    res.status(201).json({ ...s, created_at: s.created_at.toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to create shipment" });
  }
});

router.get("/shipments/:id", async (req, res) => {
  try {
    const shipmentRows = await db.select().from(shipmentsTable).where(eq(shipmentsTable.id, req.params.id));
    if (!shipmentRows.length) return res.status(404).json({ error: "Not found" });
    const s = shipmentRows[0];
    const events = await db.select().from(shipmentEventsTable).where(eq(shipmentEventsTable.shipment_id, s.id));
    res.json({
      ...s,
      created_at: s.created_at.toISOString(),
      events: events.map(e => ({ ...e, timestamp: e.timestamp.toISOString() })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shipment" });
  }
});

router.put("/shipments/:id", async (req, res) => {
  try {
    const body = req.body;
    const updated = await db.update(shipmentsTable)
      .set({ status: body.status, driver_id: body.driver_id })
      .where(eq(shipmentsTable.id, req.params.id))
      .returning();
    if (!updated.length) return res.status(404).json({ error: "Not found" });

    await db.insert(shipmentEventsTable).values({
      id: randomUUID(),
      shipment_id: req.params.id,
      event_type: `status_${body.status}`,
      description: `Status updated to ${body.status.replace("_", " ")}`,
      location: randomCity(),
    });

    const s = updated[0];
    res.json({ ...s, created_at: s.created_at.toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to update shipment" });
  }
});

export default router;
