import { useGetDeliveryTrends, useGetAnalyticsDemand, useGetAnalyticsFleet } from "@workspace/api-client-react";
import { Card, CardHeader, CardContent, LoadingScan, ErrorScan, MockAIBadge } from "@/components/shared";
import Layout from "@/components/layout";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { Activity } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/90 backdrop-blur border border-primary/30 p-3 rounded shadow-xl">
        <p className="text-muted-foreground font-mono text-xs mb-2 uppercase">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-bold text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { data: trends, isLoading: tLoad, error: tErr } = useGetDeliveryTrends();
  const { data: demand, isLoading: dLoad, error: dErr } = useGetAnalyticsDemand();
  const { data: fleet, isLoading: fLoad, error: fErr } = useGetAnalyticsFleet();

  if (tLoad || dLoad || fLoad) return <Layout><LoadingScan /></Layout>;
  if (tErr || dErr || fErr) return <Layout><ErrorScan error="Analytics module offline. Data stream corrupted." /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-widest text-foreground uppercase flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary" /> Intelligence Core
            </h2>
            <p className="text-muted-foreground font-mono text-sm mt-1">Deep analysis and predictive modeling</p>
          </div>
          <MockAIBadge />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delivery Performance */}
          <Card className="lg:col-span-2">
            <CardHeader>7-Day Delivery Success Trajectory</CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDelayed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" vertical={false} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="delivered" name="Delivered" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorSuccess)" />
                    <Area type="monotone" dataKey="delayed" name="Delayed" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorDelayed)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Fleet Utilization */}
          <Card>
            <CardHeader>24h Fleet Utilization</CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fleet?.utilization_history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" vertical={false} />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                    <Bar dataKey="utilization" name="Utilization %" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Demand Prediction */}
          <Card>
            <CardHeader action={<MockAIBadge />}>Predicted Demand Surges</CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demand?.predictions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" vertical={false} />
                    <XAxis dataKey="product" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="change_pct" name="Demand Spike %" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: "#eab308" }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
