import { useState } from "react";
import Layout from "@/components/layout";
import { Card, CardHeader, CardContent, Badge, Button, Input, MockAIBadge, LoadingScan } from "@/components/shared";
import { 
  useGetYardSlots, 
  useGetYardDocks, 
  useGetYardArrivals, 
  useGetYardTraffic,
  useScheduleArrival,
  useAssignDock
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MapPin, Truck, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function YardControl() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: slots, isLoading: slotsLoading } = useGetYardSlots();
  const { data: docks, isLoading: docksLoading } = useGetYardDocks();
  const { data: arrivals, isLoading: arrivalsLoading } = useGetYardArrivals();
  const { data: traffic, isLoading: trafficLoading } = useGetYardTraffic();

  const { mutate: scheduleArrival, isPending: scheduling } = useScheduleArrival({
    mutation: {
      onSuccess: () => {
        toast({ title: "Arrival Scheduled", description: "Truck added to queue." });
        queryClient.invalidateQueries({ queryKey: ["/api/yard/arrivals"] });
        setNewArrival({ truck_id: "", scheduled_time: "" });
      },
      onError: () => toast({ title: "Error", description: "Failed to schedule.", variant: "destructive" })
    }
  });

  const { mutate: assignDock, isPending: assigning } = useAssignDock({
    mutation: {
      onSuccess: () => {
        toast({ title: "Dock Assigned", description: "Truck routed to dock." });
        queryClient.invalidateQueries({ queryKey: ["/api/yard/arrivals"] });
        queryClient.invalidateQueries({ queryKey: ["/api/yard/docks"] });
        queryClient.invalidateQueries({ queryKey: ["/api/yard/slots"] });
      },
      onError: () => toast({ title: "Error", description: "Failed to assign dock.", variant: "destructive" })
    }
  });

  const [newArrival, setNewArrival] = useState({ truck_id: "", scheduled_time: "" });

  if (slotsLoading || docksLoading || arrivalsLoading || trafficLoading) {
    return <Layout><LoadingScan /></Layout>;
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'free': return 'bg-accent/20 border-accent/50 text-accent';
      case 'occupied': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500';
      case 'reserved': return 'bg-primary/20 border-primary/50 text-primary';
      default: return 'bg-border/50 text-muted-foreground';
    }
  };

  const getTrafficColor = (level: string | undefined) => {
    switch(level) {
      case 'low': return 'text-accent';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-destructive';
      default: return 'text-foreground';
    }
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Traffic AI Summary */}
          <Card glow className="col-span-1 border-primary/50">
            <CardHeader action={<MockAIBadge label="AI Analysis" />}>Yard Traffic</CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center border-b border-border/50 pb-4">
                <span className="text-muted-foreground font-mono text-sm uppercase">Congestion</span>
                <span className={`text-2xl font-bold uppercase tracking-widest ${getTrafficColor(traffic?.congestion_level)}`}>
                  {traffic?.congestion_level}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Trucks in Yard</p>
                  <p className="text-2xl font-mono text-foreground">{traffic?.trucks_in_yard}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Avg Wait</p>
                  <p className="text-2xl font-mono text-foreground">{traffic?.avg_wait_minutes} <span className="text-sm">min</span></p>
                </div>
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Recommended Action
                </p>
                <p className="text-sm text-primary-foreground font-mono">Route next high-priority arrival to <strong className="text-primary">{traffic?.recommended_dock}</strong> to minimize est. wait ({traffic?.estimated_wait_minutes} min).</p>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Form */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>Schedule Arrival</CardHeader>
            <CardContent>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newArrival.truck_id && newArrival.scheduled_time) {
                    scheduleArrival({ data: newArrival });
                  }
                }}
                className="flex flex-col md:flex-row gap-4 items-end"
              >
                <div className="flex-1 space-y-2 w-full">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Truck ID</label>
                  <Input 
                    placeholder="e.g. T009" 
                    value={newArrival.truck_id}
                    onChange={e => setNewArrival({...newArrival, truck_id: e.target.value})}
                    required
                  />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Scheduled Time</label>
                  <Input 
                    type="datetime-local" 
                    value={newArrival.scheduled_time}
                    onChange={e => setNewArrival({...newArrival, scheduled_time: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" disabled={scheduling} className="w-full md:w-auto h-[42px]">
                  {scheduling ? "Scheduling..." : "Add to Queue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Yard Slots */}
          <Card className="h-[400px] flex flex-col">
            <CardHeader action={<div className="text-xs font-mono text-muted-foreground">Zone Map</div>}>Parking Slots</CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {slots?.map(slot => (
                  <div key={slot.id} className={`p-3 rounded border flex flex-col items-center justify-center gap-2 ${getStatusColor(slot.status)}`}>
                    <span className="font-bold font-mono text-sm">{slot.id}</span>
                    <span className="text-[10px] uppercase tracking-widest">{slot.status}</span>
                    {slot.truck_id && <span className="text-[10px] font-mono bg-background/50 px-1 rounded">{slot.truck_id}</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Docks */}
          <Card className="h-[400px] flex flex-col">
            <CardHeader>Active Docks</CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto">
              <table className="w-full text-sm text-left font-mono">
                <thead className="text-xs uppercase text-muted-foreground bg-card border-b border-border/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 font-semibold tracking-wider">Dock</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Warehouse</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Assigned</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {docks?.map(dock => (
                    <tr key={dock.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{dock.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{dock.warehouse_id}</td>
                      <td className="px-6 py-4 text-primary">{dock.assigned_truck || '—'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={dock.status === 'available' ? 'success' : dock.status === 'blocked' ? 'destructive' : 'warning'}>
                          {dock.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Arrival Queue */}
        <Card>
          <CardHeader>Arrival Queue</CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-muted-foreground bg-card border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">ID</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Truck</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Scheduled</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-mono">
                {arrivals?.map(arr => (
                  <tr key={arr.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{arr.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 font-bold text-primary">{arr.truck_id}</td>
                    <td className="px-6 py-4 text-foreground">{format(new Date(arr.scheduled_time), "MMM dd, HH:mm")}</td>
                    <td className="px-6 py-4">
                      <Badge variant={arr.status === 'departed' ? 'outline' : arr.status === 'docked' ? 'success' : 'default'}>
                        {arr.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {arr.status === 'scheduled' || arr.status === 'arrived' ? (
                        <Button 
                          variant="outline" 
                          className="py-1 px-3 text-xs h-auto"
                          disabled={assigning}
                          onClick={() => {
                            const freeDock = docks?.find(d => d.status === 'available');
                            if (freeDock) {
                              assignDock({ data: { truck_id: arr.truck_id, dock_id: freeDock.id } });
                            } else {
                              toast({ title: "No Docks", description: "No available docks right now.", variant: "destructive" });
                            }
                          }}
                        >
                          Auto-Assign Dock
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-xs">{arr.dock_id || '—'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

      </motion.div>
    </Layout>
  );
}
