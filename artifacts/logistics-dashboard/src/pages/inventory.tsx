import { useGetInventory } from "@workspace/api-client-react";
import { Card, CardContent, Badge, LoadingScan, ErrorScan, MockAIBadge } from "@/components/shared";
import Layout from "@/components/layout";
import { formatCurrency } from "@/lib/utils";
import { AlertCircle, PackageSearch } from "lucide-react";

export default function Inventory() {
  const { data: inventory, isLoading, error } = useGetInventory();

  const getDemandBadge = (demand: string) => {
    switch(demand) {
      case 'CRITICAL': return <Badge variant="destructive" className="animate-pulse">CRITICAL</Badge>;
      case 'HIGH': return <Badge variant="warning">HIGH</Badge>;
      case 'MEDIUM': return <Badge variant="default">MEDIUM</Badge>;
      default: return <Badge variant="success">LOW</Badge>;
    }
  };

  if (isLoading) return <Layout><LoadingScan /></Layout>;
  if (error) return <Layout><ErrorScan error="Unable to query supply cache." /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-widest text-foreground uppercase flex items-center gap-3">
              <PackageSearch className="w-6 h-6 text-primary" /> Supply Cache
            </h2>
            <p className="text-muted-foreground font-mono text-sm mt-1">Global inventory catalog with AI demand forecasting</p>
          </div>
          <MockAIBadge />
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-border/50 font-mono tracking-wider">
                <tr>
                  <th className="px-6 py-4">SKU / Product</th>
                  <th className="px-6 py-4">Warehouse</th>
                  <th className="px-6 py-4 text-right">Stock Level</th>
                  <th className="px-6 py-4 text-right">Unit Value</th>
                  <th className="px-6 py-4">Predicted Demand</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {inventory?.map((item) => {
                  const isLowStock = item.quantity <= item.reorder_point;
                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">{item.product_name}</p>
                        <p className="text-xs font-mono text-primary/70">{item.sku}</p>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono">{item.warehouse}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-mono font-bold text-lg ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                          {item.quantity}
                        </span>
                        <p className="text-[10px] text-muted-foreground font-mono">Min: {item.reorder_point}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-6 py-4">
                        {getDemandBadge(item.predicted_demand)}
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">Conf: {item.confidence}</p>
                      </td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-destructive uppercase tracking-wider">
                            <AlertCircle className="w-4 h-4" /> Reorder Required
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Nominal</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
