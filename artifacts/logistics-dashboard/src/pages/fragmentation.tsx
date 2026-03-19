import Layout from "@/components/layout";
import { Card, CardHeader, CardContent, Badge, Button, MockAIBadge, LoadingScan } from "@/components/shared";
import { 
  useGetFragmentationAnalysis, 
  useGetConsolidationOpportunities, 
  useOptimizeFragmentation 
} from "@workspace/api-client-react";
import { Network, Zap, TrendingDown, TrendingUp, AlertOctagon, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export default function NetworkOptimization() {
  const { data: analysis, isLoading: analysisLoading } = useGetFragmentationAnalysis();
  const { data: opportunities, isLoading: oppsLoading, refetch: refetchOpportunities } = useGetConsolidationOpportunities();
  
  const [optResult, setOptResult] = useState<any>(null);
  const { mutate: runOptimization, isPending: optimizing } = useOptimizeFragmentation({
    mutation: {
      onSuccess: (data) => {
        setOptResult(data);
        refetchOpportunities();
      },
    },
  });

  if (analysisLoading || oppsLoading) {
    return <Layout><LoadingScan /></Layout>;
  }

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        {/* Top Banner Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card glow className="col-span-1 lg:col-span-2 bg-gradient-to-br from-primary/20 to-transparent border-primary/50">
            <CardContent className="p-6 h-full flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <Network className="w-4 h-4" /> Network Efficiency
                </h3>
                <MockAIBadge />
              </div>
              <div className="flex items-end gap-3 mt-4">
                <span className="text-5xl font-mono font-bold text-glow">{analysis?.network_efficiency_score}</span>
                <span className="text-muted-foreground mb-1 text-sm">/ 100 Score</span>
              </div>
              <p className="mt-4 text-xs font-mono text-primary/80">Analyzed {analysis?.total_shipments} shipments across {analysis?.carriers_involved} carriers.</p>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Fragmented Nodes</p>
              <div className="flex items-center gap-3">
                <AlertOctagon className="w-8 h-8 text-yellow-500" />
                <span className="text-3xl font-mono font-bold">{analysis?.fragmented_count}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-2">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Potential Savings</p>
              <div className="flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-accent" />
                <span className="text-3xl font-mono font-bold text-accent">{analysis?.potential_savings_pct}%</span>
              </div>
              <Button 
                variant="success" 
                className="mt-4 w-full group relative overflow-hidden" 
                onClick={() => runOptimization()}
                disabled={optimizing}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                <Zap className="w-4 h-4 mr-2" />
                {optimizing ? "Processing..." : "Run AI Consolidation"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Optimization Result Modal / Banner */}
        <AnimatePresence>
          {optResult && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
            >
              <Card glow className="border-accent/50 bg-accent/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-accent tracking-widest uppercase flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Optimization Complete
                    </h3>
                    <MockAIBadge label={`Confidence: ${optResult.ai_confidence}`} />
                  </div>
                  <p className="text-foreground font-mono mb-6">{optResult.optimization}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Est. Savings</p>
                      <p className="text-xl font-mono font-bold text-accent mt-1">{formatCurrency(optResult.estimated_savings_inr)}</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Cost Reduction</p>
                      <p className="text-xl font-mono font-bold text-accent mt-1">{optResult.cost_reduction}</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Truck Util. Increase</p>
                      <p className="text-xl font-mono font-bold text-primary mt-1">{optResult.truck_utilization_increase}</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Consolidated</p>
                      <p className="text-xl font-mono font-bold text-foreground mt-1">{optResult.shipments_consolidated} Shipments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Consolidation Opportunities */}
        <h3 className="text-lg font-bold text-primary tracking-widest uppercase mt-8 mb-4">Identified Consolidation Vectors</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {opportunities?.map((opp) => (
            <Card key={opp.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-foreground mb-1">{opp.route}</h4>
                    <p className="text-xs text-muted-foreground font-mono">Opp ID: {opp.id}</p>
                  </div>
                  <Badge variant={opp.priority === 'high' ? 'success' : opp.priority === 'medium' ? 'warning' : 'default'}>
                    {opp.priority} Priority
                  </Badge>
                </div>
                
                <p className="text-sm text-foreground/80 mb-4 h-10">{opp.recommendation}</p>

                <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Cost Red.</p>
                    <p className="font-mono text-accent font-bold mt-1">-{opp.cost_reduction_pct}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Util. Boost</p>
                    <p className="font-mono text-primary font-bold mt-1">+{opp.truck_utilization_increase_pct}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Carriers</p>
                    <p className="font-mono text-foreground font-bold mt-1">{opp.carrier_count} → 1</p>
                  </div>
                </div>
                
                <div className="mt-4 bg-background p-2 rounded text-xs font-mono text-muted-foreground border border-border/30">
                  <span className="text-primary mr-2">Target IDs:</span>
                  {opp.shipment_ids.join(", ")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </motion.div>
    </Layout>
  );
}
