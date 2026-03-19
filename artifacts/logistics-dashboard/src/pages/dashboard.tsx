import { 
  useGetAnalyticsKpis, 
  useGetLatestEvents, 
  useGetRoutes,
  useGetYardTraffic,
  useListVerifications,
  useGetWorkerPerformance,
  useGetFragmentationAnalysis
} from "@workspace/api-client-react";
import { Card, CardHeader, CardContent, MockAIBadge, Badge, LoadingScan, ErrorScan } from "@/components/shared";
import Layout from "@/components/layout";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Clock, Truck, TrendingUp, AlertTriangle, ShieldCheck, MapPin, CheckCircle2, Users, Network } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

function StatCard({ title, value, icon: Icon, trend, isCurrency = false, isPercentage = false, ai = false, customValue }: any) {
  const displayValue = customValue !== undefined 
    ? customValue 
    : (isCurrency ? formatCurrency(value) : isPercentage ? `${value}%` : formatNumber(value));
  const isPositive = trend >= 0;

  return (
    <Card glow className="relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="w-16 h-16 text-primary" />
      </div>
      <CardContent className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h4 className="text-xs font-bold text-muted-foreground tracking-widest uppercase">{title}</h4>
          {ai && <MockAIBadge />}
        </div>
        <div className="flex items-end gap-4">
          <span className="text-3xl font-mono font-bold text-foreground text-glow">{displayValue}</span>
          {trend !== undefined && (
            <span className={`flex items-center text-sm font-bold mb-1 ${isPositive ? 'text-accent' : 'text-destructive'}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useGetAnalyticsKpis();
  const { data: events, isLoading: eventsLoading } = useGetLatestEvents({ query: { refetchInterval: 5000 } });
  const { data: routes, isLoading: routesLoading } = useGetRoutes();
  
  // New KPI data
  const { data: yardTraffic } = useGetYardTraffic();
  const { data: verifications } = useListVerifications();
  const { data: workerPerf } = useGetWorkerPerformance();
  const { data: fragAnalysis } = useGetFragmentationAnalysis();

  const isLoading = kpisLoading || eventsLoading || routesLoading;
  if (isLoading) return <Layout><LoadingScan /></Layout>;
  if (kpisError) return <Layout><ErrorScan error="Failed to load dashboard telemetry." /></Layout>;

  // Calculations for new KPIs
  const verifiedTotal = verifications?.length || 0;
  const passedTotal = verifications?.filter(v => v.verification_status === 'passed').length || 0;
  const verifiedRate = verifiedTotal > 0 ? ((passedTotal / verifiedTotal) * 100).toFixed(1) : 0;
  
  const avgWorkerScore = workerPerf?.length 
    ? (workerPerf.reduce((acc, w) => acc + w.productivity_score, 0) / workerPerf.length).toFixed(1)
    : 0;

  // Frontend fallback while backend /routes mock returns an empty list.
  // This keeps the UI populated until the API is wired to real data.
  const fallbackRoutes = [
    {
      route_id: "blr-chn",
      origin: "Bangalore",
      destination: "Chennai",
      distance_km: 350.2,
      estimated_time: "4h 45m",
      fuel_savings_pct: 9.8,
      optimized: true,
      traffic_level: "low" as const,
    },
    {
      route_id: "hyd-pun",
      origin: "Hyderabad",
      destination: "Pune",
      distance_km: 560.8,
      estimated_time: "7h 30m",
      fuel_savings_pct: 18.5,
      optimized: true,
      traffic_level: "high" as const,
    },
    {
      route_id: "mum-del",
      origin: "Mumbai",
      destination: "Delhi",
      distance_km: 1414.5,
      estimated_time: "18h 22m",
      fuel_savings_pct: 14.2,
      optimized: true,
      traffic_level: "moderate" as const,
    },
    {
      route_id: "ahm-jpr",
      origin: "Ahmedabad",
      destination: "Jaipur",
      distance_km: 668.3,
      estimated_time: "11h 15m",
      fuel_savings_pct: 11.3,
      optimized: true,
      traffic_level: "low" as const,
    },
  ];

  const displayRoutes = routes && routes.length ? routes : fallbackRoutes;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        {/* Core KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Active Shipments" value={kpis?.active_shipments || 0} icon={Truck} trend={12.5} />
          <StatCard title="Fleet Utilization" value={kpis?.fleet_utilization || 0} isPercentage icon={TrendingUp} trend={4.2} />
          <StatCard title="On-Time Rate" value={kpis?.on_time_delivery_rate || 0} isPercentage icon={Clock} trend={-1.4} />
          <StatCard title="Cost Savings" value={kpis?.cost_savings_pct || 0} isPercentage icon={ShieldCheck} trend={8.9} ai />
        </div>

        {/* Extended KPI Grid (New Services) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Yard Congestion" 
            customValue={<span className="uppercase text-2xl">{yardTraffic?.congestion_level || 'N/A'}</span>} 
            icon={MapPin} 
            ai 
          />
          <StatCard title="Verification Rate" value={verifiedRate} isPercentage icon={CheckCircle2} trend={2.1} />
          <StatCard title="Workforce Score" value={avgWorkerScore} icon={Users} trend={5.5} ai />
          <StatCard title="Network Efficiency" value={fragAnalysis?.network_efficiency_score || 0} isPercentage icon={Network} trend={11.2} ai />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Shipment Events */}
          <Card className="lg:col-span-1 flex flex-col h-[500px]">
            <CardHeader action={<div className="flex items-center gap-2 text-xs font-mono text-accent"><span className="w-2 h-2 rounded-full bg-accent animate-ping" /> LIVE EVENTS</div>}>
              Shipment Event Timeline
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="divide-y divide-border/30">
                {events?.map((event) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    key={event.id} 
                    className="p-4 hover:bg-white/5 transition-colors flex gap-4"
                  >
                    <div className="mt-1 shrink-0">
                      {event.severity === 'critical' ? <AlertTriangle className="w-5 h-5 text-destructive" /> :
                       event.severity === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-500" /> :
                       <ShieldCheck className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium uppercase tracking-wider">{event.event.replace(/_/g, ' ')}</p>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground font-mono">
                        <span>{format(new Date(event.timestamp), 'HH:mm:ss')}</span>
                        {event.location && <span className="text-primary/70 truncate max-w-[120px]">{event.location}</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {!events?.length && <div className="p-8 text-center text-muted-foreground font-mono text-sm">No recent signals.</div>}
              </div>
            </CardContent>
          </Card>

          {/* Optimized Routes */}
          <Card className="lg:col-span-2 flex flex-col h-[500px]">
            <CardHeader action={<MockAIBadge />}>Optimized Routes</CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {displayRoutes.slice(0, 5).map((route) => (
                  <div key={route.route_id} className="p-4 rounded-lg border border-border/50 bg-background/50 flex items-center justify-between group glass-panel-hover">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 shrink-0">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-foreground">{route.origin} <span className="text-muted-foreground">→</span> {route.destination}</p>
                          {route.optimized && <Badge variant="success">Optimized</Badge>}
                        </div>
                        <div className="flex gap-4 mt-1 text-xs font-mono text-muted-foreground">
                          <span>Dist: {route.distance_km}km</span>
                          <span>ETA: {route.estimated_time}</span>
                          <span className="text-accent">+ {route.fuel_savings_pct}% Fuel Save</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={route.traffic_level === 'high' ? 'destructive' : route.traffic_level === 'moderate' ? 'warning' : 'default'}>
                        {route.traffic_level} Traffic
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </Layout>
  );
}
