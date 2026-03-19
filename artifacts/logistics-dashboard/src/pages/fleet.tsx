import { Fragment, useEffect, useMemo, useState } from "react";
import { useGetFleet } from "@workspace/api-client-react";
import { LoadingScan, ErrorScan } from "@/components/shared";
import Layout from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import { Fuel, Activity, Satellite, TrendingUp } from "lucide-react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip as LeafletTooltip } from "react-leaflet";

type LatLngTuple = [number, number];

const MAP_CENTER: LatLngTuple = [13.0827, 80.2707]; // Chennai

function haversineDistanceKm(a: LatLngTuple, b: LatLngTuple): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

function bezierRoute(
  start: LatLngTuple,
  end: LatLngTuple,
  offsetDeg = 1.2,
  segments = 60
): LatLngTuple[] {
  const dx = end[1] - start[1];
  const dy = end[0] - start[0];
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;
  const control: LatLngTuple = [midLat + ny * offsetDeg, midLng + nx * offsetDeg];
  const points: LatLngTuple[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const oneMinusT = 1 - t;
    const lat = oneMinusT * oneMinusT * start[0] + 2 * oneMinusT * t * control[0] + t * t * end[0];
    const lng = oneMinusT * oneMinusT * start[1] + 2 * oneMinusT * t * control[1] + t * t * end[1];
    points.push([lat, lng]);
  }
  return points;
}

function formatEta(hours: number): string {
  if (!isFinite(hours) || hours <= 0) return "Now";
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function getTripPhase(progress: number): "pre" | "forward" | "delivered" | "returning" {
  if (progress < 0.05) return "pre";
  if (progress < 0.5) return "forward";
  if (progress < 0.65) return "delivered";
  return "returning";
}

const TRUCK_COLORS = [
  "#22d3ee", // cyan
  "#34d399", // emerald
  "#f59e0b", // amber
  "#a78bfa", // violet
  "#fb7185", // rose
  "#38bdf8", // sky
  "#4ade80", // green
  "#fbbf24", // yellow
  "#c084fc", // purple
  "#f472b6", // pink
];

function getStatusColor(status: string) {
  switch (status) {
    case "in_transit": return "#22d3ee";
    case "maintenance": return "#f87171";
    case "idle": return "#64748b";
    default: return "#94a3b8";
  }
}

function getPhaseInfo(phase: string) {
  switch (phase) {
    case "forward": return { label: "In Transit", color: "#22d3ee", bg: "rgba(34,211,238,0.1)", border: "rgba(34,211,238,0.3)" };
    case "returning": return { label: "Backhaul", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.3)" };
    case "delivered": return { label: "Delivered", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)" };
    default: return { label: "Pre-departure", color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.3)" };
  }
}

export default function Fleet() {
  const { data: fleet, isLoading, error } = useGetFleet({ query: { refetchInterval: 5000 } });
  const [progress, setProgress] = useState(0);
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((prev: number) => {
        const next = prev + 0.008;
        return next >= 1 ? 0 : next;
      });
    }, 800);
    return () => clearInterval(id);
  }, []);

  const simulatedRoutes = useMemo(() => {
    if (!fleet?.length) return new Map<string, any>();
    const map = new Map<string, any>();
    const radiusDeg = 3.2;

    fleet.forEach((truck: any, index: number) => {
      const angle = (index / Math.max(fleet.length, 1)) * Math.PI * 2;
      const origin: LatLngTuple = [
        MAP_CENTER[0] + radiusDeg * Math.cos(angle),
        MAP_CENTER[1] + radiusDeg * Math.sin(angle),
      ];
      const deliveryStop: LatLngTuple = [truck.lat, truck.lng];
      const backhaulPickup: LatLngTuple = [
        (deliveryStop[0] + MAP_CENTER[0]) / 2,
        (deliveryStop[1] + MAP_CENTER[1]) / 2,
      ];
      const returnHub: LatLngTuple = [
        MAP_CENTER[0] - radiusDeg * Math.cos(angle),
        MAP_CENTER[1] - radiusDeg * Math.sin(angle),
      ];

      const forwardRoute = bezierRoute(origin, deliveryStop, 1.3, 60);
      const backhaulRoute = bezierRoute(deliveryStop, returnHub, -1.0, 60);

      const allPoints = [...forwardRoute, ...backhaulRoute];
      let totalDistanceKm = 0;
      for (let i = 0; i < allPoints.length - 1; i++) {
        totalDistanceKm += haversineDistanceKm(allPoints[i], allPoints[i + 1]);
      }

      map.set(truck.truck_id, {
        forwardRoute,
        backhaulRoute,
        deliveryStop,
        backhaulPickup,
        totalDistanceKm,
        color: TRUCK_COLORS[index % TRUCK_COLORS.length],
      });
    });
    return map;
  }, [fleet]);

  const getTelemetryForTruck = (truck: any) => {
    const meta = simulatedRoutes.get(truck.truck_id);
    if (!meta) return { phase: "pre" as const, distanceCoveredKm: 0, remainingDistanceKm: 0, eta: "N/A" };

    const forwardProgress = Math.min(progress * 2, 1);
    const backhaulProgress = Math.max((progress - 0.5) * 2, 0);

    const forwardDistance = meta.forwardRoute.length > 1
      ? meta.forwardRoute.slice(0, Math.max(1, Math.round(forwardProgress * (meta.forwardRoute.length - 1))))
          .reduce((acc: number, point: LatLngTuple, idx: number, arr: LatLngTuple[]) => idx === 0 ? 0 : acc + haversineDistanceKm(arr[idx - 1], point), 0)
      : 0;

    const backhaulDistance = meta.backhaulRoute.length > 1
      ? meta.backhaulRoute.slice(0, Math.max(1, Math.round(backhaulProgress * (meta.backhaulRoute.length - 1))))
          .reduce((acc: number, point: LatLngTuple, idx: number, arr: LatLngTuple[]) => idx === 0 ? 0 : acc + haversineDistanceKm(arr[idx - 1], point), 0)
      : 0;

    const distanceCoveredKm = forwardDistance + backhaulDistance;
    const remainingDistanceKm = Math.max(0, (meta.totalDistanceKm || 0) - distanceCoveredKm);
    const effectiveSpeed = truck.speed_kmh > 5 ? truck.speed_kmh : 45;
    const eta = distanceCoveredKm >= meta.totalDistanceKm ? "Completed" : formatEta(remainingDistanceKm / effectiveSpeed);

    return { phase: getTripPhase(progress), distanceCoveredKm, remainingDistanceKm, eta };
  };

  if (isLoading) return <Layout><LoadingScan /></Layout>;
  if (error) return <Layout><ErrorScan error="Loss of telemetry signal from fleet nodes." /></Layout>;

  const activeTrucks = fleet?.filter((t: any) => t.status === "in_transit").length ?? 0;
  const avgFuel = fleet?.length ? Math.round(fleet.reduce((a: number, t: any) => a + t.fuel_pct, 0) / fleet.length) : 0;
  const moving = fleet?.filter((t: any) => t.speed_kmh > 0) ?? [];
  const avgSpeed = moving.length ? Math.round(moving.reduce((a: number, t: any) => a + t.speed_kmh, 0) / moving.length) : 0;

  const selectedTruckData = selectedTruck ? fleet?.find((t: any) => t.truck_id === selectedTruck) : null;
  const selectedTelemetry = selectedTruckData ? getTelemetryForTruck(selectedTruckData) : null;
  const selectedMeta = selectedTruck ? simulatedRoutes.get(selectedTruck) : null;

  return (
    <Layout>
      <div className="flex flex-col gap-5 h-full" style={{ minHeight: 0 }}>
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-widest text-foreground uppercase flex items-center gap-3">
              <Satellite className="w-6 h-6 text-primary" />
              Fleet Telemetry
            </h2>
            <p className="text-muted-foreground font-mono text-xs mt-1 tracking-wider">
              LIVE GPS · {fleet?.length ?? 0} UNITS TRACKED · REFRESHING EVERY 5S
            </p>
          </div>
          {/* KPI strip */}
          <div className="flex gap-3">
            {[
              { label: "Active", value: activeTrucks, icon: <Activity className="w-3.5 h-3.5" />, color: "#22d3ee" },
              { label: "Avg Speed", value: `${avgSpeed} km/h`, icon: <TrendingUp className="w-3.5 h-3.5" />, color: "#34d399" },
              { label: "Avg Fuel", value: `${avgFuel}%`, icon: <Fuel className="w-3.5 h-3.5" />, color: "#f59e0b" },
            ].map(kpi => (
              <div
                key={kpi.label}
                className="glass-panel rounded-lg px-4 py-2.5 flex items-center gap-2.5 border"
                style={{ borderColor: `${kpi.color}30` }}
              >
                <span style={{ color: kpi.color }}>{kpi.icon}</span>
                <div>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">{kpi.label}</p>
                  <p className="font-bold font-mono text-sm" style={{ color: kpi.color }}>{kpi.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content: map + sidebar */}
        <div className="flex gap-5 flex-1" style={{ minHeight: 0 }}>
          {/* MAP — takes the bulk of the space */}
          <div className="flex-1 flex flex-col gap-3 min-w-0" style={{ minHeight: 0 }}>
            <div
              className="relative rounded-xl overflow-hidden border flex-1"
              style={{
                borderColor: "rgba(34,211,238,0.2)",
                boxShadow: "0 0 40px rgba(34,211,238,0.06), inset 0 0 60px rgba(0,0,0,0.3)",
                minHeight: "420px",
              }}
            >
              {/* Top HUD bar */}
              <div
                className="absolute top-0 left-0 right-0 z-[500] flex items-center justify-between px-4 py-2.5"
                style={{ background: "linear-gradient(to bottom, rgba(2,6,23,0.9), transparent)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  <span className="font-mono text-[10px] text-primary tracking-widest uppercase">Uplink Active · Live GPS Telemetry</span>
                </div>
                <div className="font-mono text-[10px] text-muted-foreground tracking-widest">
                  {fleet?.length} nodes · Southern India grid
                </div>
              </div>

              {/* Bottom legend */}
              <div
                className="absolute bottom-3 left-3 z-[500] flex items-center gap-4 px-3 py-2 rounded-lg font-mono text-[10px]"
                style={{ background: "rgba(2,6,23,0.85)", border: "1px solid rgba(34,211,238,0.15)" }}
              >
                <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-cyan-400 inline-block" /> Forward route</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-violet-400 inline-block" /> Backhaul</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /> Delivery stop</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 inline-block" /> Pickup point</span>
              </div>

              <MapContainer
                center={MAP_CENTER}
                zoom={6}
                style={{ height: "100%", width: "100%", background: "#020617" }}
                zoomControl={false}
                preferCanvas={true}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap &copy; CARTO'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {fleet?.map((truck: any, index: number) => {
                  const meta = simulatedRoutes.get(truck.truck_id);
                  if (!meta) return null;

                  const isSelected = selectedTruck === truck.truck_id;
                  const truckColor = meta.color;

                  const forwardProgress = Math.min(progress * 2, 1);
                  const backhaulProgress = Math.max((progress - 0.5) * 2, 0);

                  const forwardIndex = Math.max(0, Math.min(
                    meta.forwardRoute.length - 1,
                    Math.round(forwardProgress * (meta.forwardRoute.length - 1))
                  ));
                  const backhaulIndex = Math.max(0, Math.min(
                    meta.backhaulRoute.length - 1,
                    Math.round(backhaulProgress * (meta.backhaulRoute.length - 1))
                  ));

                  const currentPosition: LatLngTuple =
                    progress < 0.5
                      ? meta.forwardRoute[forwardIndex]
                      : meta.backhaulRoute[backhaulIndex];

                  const forwardCompleted = meta.forwardRoute.slice(0, forwardIndex + 1);
                  const forwardRemaining = meta.forwardRoute.slice(forwardIndex);
                  const backhaulCompleted = meta.backhaulRoute.slice(0, backhaulIndex + 1);
                  const backhaulRemaining = meta.backhaulRoute.slice(backhaulIndex);

                  const opacity = isSelected ? 1 : (selectedTruck ? 0.35 : 0.85);

                  return (
                    <Fragment key={truck.truck_id}>
                      {/* Forward route ghost */}
                      <Polyline positions={meta.forwardRoute} pathOptions={{ color: truckColor, weight: 1.5, opacity: 0.12 * opacity }} />
                      {/* Forward completed */}
                      <Polyline positions={forwardCompleted} pathOptions={{ color: truckColor, weight: isSelected ? 4 : 3, opacity: 0.9 * opacity }} />
                      {/* Forward remaining */}
                      <Polyline positions={forwardRemaining} pathOptions={{ color: truckColor, weight: 2, opacity: 0.3 * opacity, dashArray: "5 5" }} />

                      {/* Backhaul ghost */}
                      <Polyline positions={meta.backhaulRoute} pathOptions={{ color: "#a78bfa", weight: 1.5, opacity: 0.1 * opacity }} />
                      {/* Backhaul completed */}
                      <Polyline positions={backhaulCompleted} pathOptions={{ color: "#a78bfa", weight: isSelected ? 4 : 3, opacity: 0.9 * opacity }} />
                      {/* Backhaul remaining */}
                      <Polyline positions={backhaulRemaining} pathOptions={{ color: "#a78bfa", weight: 2, opacity: 0.3 * opacity, dashArray: "5 5" }} />

                      {/* Delivery stop marker */}
                      <CircleMarker center={meta.deliveryStop} radius={5} pathOptions={{ color: "#eab308", fillColor: "#fde047", fillOpacity: 0.9, weight: 1.5, opacity: opacity }}>
                        <LeafletTooltip direction="top" offset={[0, -8]} className="!bg-card !text-xs !font-mono">
                          Delivery Drop · {truck.truck_id}
                        </LeafletTooltip>
                      </CircleMarker>

                      {/* Backhaul pickup */}
                      <CircleMarker center={meta.backhaulPickup} radius={4} pathOptions={{ color: "#d946ef", fillColor: "#e879f9", fillOpacity: 0.9, weight: 1.5, opacity: opacity }}>
                        <LeafletTooltip direction="top" offset={[0, -8]} className="!bg-card !text-xs !font-mono">
                          Backhaul Pickup · {truck.truck_id}
                        </LeafletTooltip>
                      </CircleMarker>

                      {/* Truck marker */}
                      <CircleMarker
                        center={currentPosition}
                        radius={isSelected ? 9 : 7}
                        pathOptions={{
                          color: truckColor,
                          fillColor: truckColor,
                          fillOpacity: 1,
                          weight: isSelected ? 3 : 2,
                          opacity: opacity,
                        }}
                        eventHandlers={{ click: () => setSelectedTruck((prev: string | null) => prev === truck.truck_id ? null : truck.truck_id) }}
                      >
                        <LeafletTooltip direction="top" offset={[0, -12]} className="!bg-card !text-xs !font-mono !border-none">
                          <div className="font-bold" style={{ color: truckColor }}>{truck.truck_id}</div>
                          <div className="text-muted-foreground text-[10px]">
                            {truck.speed_kmh} km/h · {truck.model}
                          </div>
                        </LeafletTooltip>
                      </CircleMarker>

                      {/* Outer pulse for selected / in-transit */}
                      {(isSelected || truck.status === "in_transit") && (
                        <CircleMarker
                          center={currentPosition}
                          radius={isSelected ? 14 : 11}
                          pathOptions={{ color: truckColor, fillColor: "transparent", fillOpacity: 0, weight: 1.5, opacity: 0.35 * opacity }}
                        />
                      )}
                    </Fragment>
                  );
                })}
              </MapContainer>
            </div>

            {/* Selected truck detail panel */}
            <AnimatePresence>
              {selectedTruckData && selectedTelemetry && selectedMeta && (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border p-4 flex items-center gap-6"
                  style={{
                    background: "rgba(2,6,23,0.85)",
                    borderColor: `${selectedMeta.color}40`,
                    boxShadow: `0 0 20px ${selectedMeta.color}15`,
                  }}
                >
                  <div className="w-1 self-stretch rounded-full" style={{ background: selectedMeta.color }} />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-lg tracking-wider" style={{ color: selectedMeta.color }}>
                        {selectedTruckData.truck_id}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{selectedTruckData.model}</span>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      LAT {selectedTruckData.lat.toFixed(4)} · LNG {selectedTruckData.lng.toFixed(4)}
                    </div>
                  </div>
                  <div className="flex gap-6 ml-2">
                    {[
                      { label: "Speed", value: `${selectedTruckData.speed_kmh} km/h` },
                      { label: "Fuel", value: `${selectedTruckData.fuel_pct}%` },
                      { label: "Covered", value: `${selectedTelemetry.distanceCoveredKm.toFixed(1)} km` },
                      { label: "Remaining", value: `${selectedTelemetry.remainingDistanceKm.toFixed(1)} km` },
                      { label: "ETA", value: selectedTelemetry.eta },
                    ].map(stat => (
                      <div key={stat.label}>
                        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        <p className="font-bold font-mono text-sm text-foreground">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={() => setSelectedTruck(null)}
                      className="text-muted-foreground hover:text-foreground text-xs font-mono tracking-widest uppercase transition-colors"
                    >
                      Deselect ×
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fleet list sidebar */}
          <div
            className="flex flex-col gap-2 overflow-y-auto"
            style={{ width: "300px", minWidth: "300px" }}
          >
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                {fleet?.length} units
              </span>
              <span className="font-mono text-[10px] text-primary/70 uppercase tracking-widest">
                Click to focus
              </span>
            </div>

            {fleet?.map((truck: any) => {
              const { phase, distanceCoveredKm, eta } = getTelemetryForTruck(truck);
              const phaseInfo = getPhaseInfo(phase);
              const statusColor = getStatusColor(truck.status);
              const meta = simulatedRoutes.get(truck.truck_id);
              const truckColor = meta?.color ?? "#22d3ee";
              const isSelected = selectedTruck === truck.truck_id;
              const totalDist = meta?.totalDistanceKm ?? 1;
              const pct = Math.min(100, Math.round((distanceCoveredKm / totalDist) * 100));

              return (
                <motion.div
                  key={truck.truck_id}
                  layout
                  onClick={() => setSelectedTruck((prev: string | null) => prev === truck.truck_id ? null : truck.truck_id)}
                  className="rounded-lg p-3 cursor-pointer transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: isSelected ? `${truckColor}08` : "rgba(15,23,42,0.7)",
                    border: `1px solid ${isSelected ? truckColor + "40" : "rgba(30,41,59,0.8)"}`,
                    boxShadow: isSelected ? `0 0 15px ${truckColor}20` : "none",
                  }}
                >
                  {/* Color accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg transition-all duration-300"
                    style={{ background: truckColor, opacity: isSelected ? 1 : 0.4 }}
                  />

                  <div className="flex items-start justify-between pl-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm tracking-wider" style={{ color: isSelected ? truckColor : "var(--color-foreground)" }}>
                          {truck.truck_id}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground truncate">{truck.model}</span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-2">
                        <span
                          className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded"
                          style={{ color: statusColor, background: `${statusColor}15`, border: `1px solid ${statusColor}30` }}
                        >
                          {truck.status.replace("_", " ")}
                        </span>
                        <span
                          className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded"
                          style={{ color: phaseInfo.color, background: phaseInfo.bg, border: `1px solid ${phaseInfo.border}` }}
                        >
                          {phaseInfo.label}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1 rounded-full bg-card/80 mb-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: `linear-gradient(to right, ${truckColor}99, ${truckColor})` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-1">
                        <div>
                          <p className="text-[8px] font-mono text-muted-foreground/60 uppercase tracking-widest">Speed</p>
                          <p className="text-xs font-mono font-semibold text-foreground">{truck.speed_kmh}<span className="text-muted-foreground text-[9px]"> km/h</span></p>
                        </div>
                        <div>
                          <p className="text-[8px] font-mono text-muted-foreground/60 uppercase tracking-widest">Fuel</p>
                          <p className="text-xs font-mono font-semibold" style={{ color: truck.fuel_pct < 25 ? "#f87171" : truck.fuel_pct < 50 ? "#f59e0b" : "#34d399" }}>
                            {truck.fuel_pct}<span className="text-muted-foreground text-[9px]">%</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-mono text-muted-foreground/60 uppercase tracking-widest">ETA</p>
                          <p className="text-xs font-mono font-semibold text-primary">{eta}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
