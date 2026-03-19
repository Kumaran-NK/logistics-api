import { useState } from "react";
import Layout from "@/components/layout";
import { Card, CardHeader, CardContent, Badge, Button, Input, MockAIBadge, LoadingScan } from "@/components/shared";
import { 
  useListVerifications,
  useScanShipment,
  usePhotoVerifyShipment,
  useReportDamage
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ScanLine, Camera, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Verification() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: verifications, isLoading } = useListVerifications();

  const [scanForm, setScanForm] = useState({ shipment_id: "", scan_code: "" });
  const [photoForm, setPhotoForm] = useState({ shipment_id: "", image_url: "" });
  const [damageForm, setDamageForm] = useState({ shipment_id: "", damage_description: "" });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["/api/verify/list"] });

  const { mutate: scanShipment, isPending: scanning } = useScanShipment({
    mutation: {
      onSuccess: () => { toast({ title: "Scan Successful" }); invalidate(); setScanForm({ shipment_id: "", scan_code: "" }); },
      onError: () => toast({ title: "Scan Failed", variant: "destructive" })
    }
  });

  const { mutate: photoVerify, isPending: photoing } = usePhotoVerifyShipment({
    mutation: {
      onSuccess: () => { toast({ title: "Photo Verified" }); invalidate(); setPhotoForm({ shipment_id: "", image_url: "" }); },
      onError: () => toast({ title: "Photo Verify Failed", variant: "destructive" })
    }
  });

  const { mutate: reportDamage, isPending: damaging } = useReportDamage({
    mutation: {
      onSuccess: () => { toast({ title: "Damage Reported", variant: "destructive" }); invalidate(); setDamageForm({ shipment_id: "", damage_description: "" }); },
      onError: () => toast({ title: "Report Failed", variant: "destructive" })
    }
  });

  if (isLoading) return <Layout><LoadingScan /></Layout>;

  const total = verifications?.length || 0;
  const passed = verifications?.filter(v => v.verification_status === 'passed').length || 0;
  const failed = verifications?.filter(v => v.verification_status === 'failed').length || 0;
  const damaged = verifications?.filter(v => v.verification_status === 'damaged').length || 0;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/40"><CardContent className="p-4 flex flex-col"><span className="text-xs text-muted-foreground uppercase tracking-widest">Total Scans</span><span className="text-2xl font-mono font-bold text-foreground mt-1">{total}</span></CardContent></Card>
          <Card className="bg-accent/10 border-accent/30"><CardContent className="p-4 flex flex-col"><span className="text-xs text-accent uppercase tracking-widest">Passed</span><span className="text-2xl font-mono font-bold text-accent mt-1">{passed}</span></CardContent></Card>
          <Card className="bg-destructive/10 border-destructive/30"><CardContent className="p-4 flex flex-col"><span className="text-xs text-destructive uppercase tracking-widest">Failed</span><span className="text-2xl font-mono font-bold text-destructive mt-1">{failed}</span></CardContent></Card>
          <Card className="bg-yellow-500/10 border-yellow-500/30"><CardContent className="p-4 flex flex-col"><span className="text-xs text-yellow-500 uppercase tracking-widest">Damaged</span><span className="text-2xl font-mono font-bold text-yellow-500 mt-1">{damaged}</span></CardContent></Card>
        </div>

        {/* Action Forms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-t-4 border-t-primary border-x-border border-b-border">
            <CardHeader className="bg-transparent border-none pb-0"><span className="flex items-center gap-2"><ScanLine className="w-5 h-5 text-primary" /> Barcode Scan</span></CardHeader>
            <CardContent>
              <form onSubmit={e => { e.preventDefault(); scanShipment({ data: scanForm }); }} className="space-y-4">
                <Input placeholder="Shipment ID" value={scanForm.shipment_id} onChange={e => setScanForm({...scanForm, shipment_id: e.target.value})} required />
                <Input placeholder="Scan Code" value={scanForm.scan_code} onChange={e => setScanForm({...scanForm, scan_code: e.target.value})} required />
                <Button type="submit" disabled={scanning} className="w-full">Process Scan</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-accent border-x-border border-b-border">
            <CardHeader className="bg-transparent border-none pb-0"><span className="flex items-center gap-2"><Camera className="w-5 h-5 text-accent" /> AI Vision Verify</span></CardHeader>
            <CardContent>
              <form onSubmit={e => { e.preventDefault(); photoVerify({ data: photoForm }); }} className="space-y-4">
                <Input placeholder="Shipment ID" value={photoForm.shipment_id} onChange={e => setPhotoForm({...photoForm, shipment_id: e.target.value})} required />
                <Input placeholder="Image URL / Upload" value={photoForm.image_url} onChange={e => setPhotoForm({...photoForm, image_url: e.target.value})} required />
                <Button type="submit" variant="success" disabled={photoing} className="w-full">Analyze Image</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-destructive border-x-border border-b-border">
            <CardHeader className="bg-transparent border-none pb-0"><span className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> Report Damage</span></CardHeader>
            <CardContent>
              <form onSubmit={e => { e.preventDefault(); reportDamage({ data: damageForm }); }} className="space-y-4">
                <Input placeholder="Shipment ID" value={damageForm.shipment_id} onChange={e => setDamageForm({...damageForm, shipment_id: e.target.value})} required />
                <Input placeholder="Damage Description" value={damageForm.damage_description} onChange={e => setDamageForm({...damageForm, damage_description: e.target.value})} required />
                <Button type="submit" variant="destructive" disabled={damaging} className="w-full">Flag Shipment</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Verification History */}
        <Card className="overflow-hidden">
          <CardHeader action={<MockAIBadge label="AI Monitored" />}>Verification Log</CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-muted-foreground bg-card border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Log ID</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Shipment</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Details</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-mono">
                {verifications?.map(v => (
                  <tr key={v.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{v.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 font-bold text-primary">{v.shipment_id}</td>
                    <td className="px-6 py-4">
                      <Badge variant={v.verification_status === 'passed' ? 'success' : v.verification_status === 'failed' ? 'destructive' : v.verification_status === 'damaged' ? 'warning' : 'default'}>
                        {v.verification_status}
                      </Badge>
                      {v.damage_flag && <AlertTriangle className="w-4 h-4 text-destructive inline ml-2" />}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {v.scan_code ? `Scan: ${v.scan_code}` : v.damage_description ? `Note: ${v.damage_description}` : 'Image verified'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {format(new Date(v.timestamp), "MMM dd, HH:mm")}
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
