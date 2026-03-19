import { useState } from "react";
import { useGetShipments, useCreateShipment, getGetShipmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, Badge, Button, LoadingScan, ErrorScan } from "@/components/shared";
import Layout from "@/components/layout";
import { Plus, Search, Filter } from "lucide-react";
import { format } from "date-fns";

export default function Shipments() {
  const queryClient = useQueryClient();
  const { data: shipments, isLoading, error } = useGetShipments();
  const createMutation = useCreateShipment();
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    origin: "", destination: "", weight_kg: 100, priority: "medium" as const, estimated_delivery: new Date().toISOString()
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetShipmentsQueryKey() });
          setShowCreate(false);
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'delivered': return <Badge variant="success">Delivered</Badge>;
      case 'in_transit': return <Badge variant="default">In Transit</Badge>;
      case 'delayed': return <Badge variant="warning">Delayed</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (isLoading) return <Layout><LoadingScan /></Layout>;
  if (error) return <Layout><ErrorScan error="Failed to fetch shipments databank." /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-widest text-foreground uppercase">Active Shipments</h2>
            <p className="text-muted-foreground font-mono text-sm mt-1">Manage and track fleet logistics vectors</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Initialize Shipment
          </Button>
        </div>

        {showCreate && (
          <Card className="border-primary/50">
            <CardHeader>Initialize New Vector</CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider">Origin</label>
                  <input required value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none text-foreground font-mono" placeholder="Sector 7G" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider">Destination</label>
                  <input required value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none text-foreground font-mono" placeholder="Outpost Delta" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider">Weight (kg)</label>
                  <input required type="number" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: Number(e.target.value)})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none text-foreground font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider">Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none text-foreground font-mono">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <Button type="submit" disabled={createMutation.isPending} className="w-full">
                    {createMutation.isPending ? "Transmitting..." : "Execute"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/50">
            <div className="flex items-center gap-3 w-full max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input placeholder="Query shipping manifest..." className="w-full bg-background/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none text-foreground font-mono" />
              </div>
              <Button variant="outline" className="px-3"><Filter className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-border/50 font-mono tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID / Vector</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Origin &rarr; Destination</th>
                  <th className="px-6 py-4">Mass</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {shipments?.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-primary">{shipment.id.split('-')[0]}</td>
                    <td className="px-6 py-4">{getStatusBadge(shipment.status)}</td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {shipment.origin} <span className="text-primary mx-2">&rarr;</span> {shipment.destination}
                    </td>
                    <td className="px-6 py-4 font-mono">{shipment.weight_kg}kg</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold uppercase tracking-wider ${shipment.priority === 'high' ? 'text-destructive' : shipment.priority === 'medium' ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                        {shipment.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{format(new Date(shipment.estimated_delivery), 'MMM dd, HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
