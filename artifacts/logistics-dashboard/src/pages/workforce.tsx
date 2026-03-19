import { useState } from "react";
import Layout from "@/components/layout";
import { Card, CardHeader, CardContent, Badge, Button, Input, MockAIBadge, LoadingScan } from "@/components/shared";
import { 
  useGetWorkers,
  useGetWorkerTasks,
  useGetWorkerPerformance,
  useGetWorkerRewards,
  useCreateWorker,
  useAssignWorkerTask
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Users, Award, Briefcase, Zap, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Workforce() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workers, isLoading: workersLoading } = useGetWorkers();
  const { data: tasks, isLoading: tasksLoading } = useGetWorkerTasks();
  const { data: performance, isLoading: perfLoading } = useGetWorkerPerformance();
  const { data: rewards, isLoading: rewardsLoading } = useGetWorkerRewards();

  const [workerForm, setWorkerForm] = useState({ name: "", role: "loader" as const, warehouse_id: "" });
  const [taskForm, setTaskForm] = useState({ worker_id: "", task_type: "", description: "", priority: "medium" as const });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
    queryClient.invalidateQueries({ queryKey: ["/api/workers/tasks"] });
  };

  const { mutate: createWorker, isPending: creatingWorker } = useCreateWorker({
    mutation: {
      onSuccess: () => { toast({ title: "Worker Added" }); invalidate(); setWorkerForm({ ...workerForm, name: "" }); },
      onError: () => toast({ title: "Failed", variant: "destructive" })
    }
  });

  const { mutate: assignTask, isPending: assigningTask } = useAssignWorkerTask({
    mutation: {
      onSuccess: () => { toast({ title: "Task Assigned" }); invalidate(); setTaskForm({ ...taskForm, description: "" }); },
      onError: () => toast({ title: "Failed", variant: "destructive" })
    }
  });

  if (workersLoading || tasksLoading || perfLoading || rewardsLoading) return <Layout><LoadingScan /></Layout>;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Roster */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader action={<div className="text-xs text-muted-foreground"><Users className="w-4 h-4 inline mr-1"/>{workers?.length} Total</div>}>
              Active Roster
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto h-[350px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-muted-foreground bg-card border-b border-border/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Worker</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 font-mono">
                  {workers?.map(w => (
                    <tr key={w.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-primary">{w.name}</p>
                        <p className="text-[10px] text-muted-foreground">{w.id} • {w.warehouse_id}</p>
                      </td>
                      <td className="px-6 py-4"><Badge variant="outline">{w.role.replace('_', ' ')}</Badge></td>
                      <td className="px-6 py-4">
                        <Badge variant={w.status === 'active' ? 'success' : w.status === 'on_break' ? 'warning' : 'default'}>{w.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-right font-bold">{w.performance_score}</span>
                          <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-accent" style={{ width: `${w.performance_score}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* AI Performance Insights */}
          <Card className="col-span-1 flex flex-col h-[350px]">
            <CardHeader action={<MockAIBadge />}>Insights</CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {performance?.slice(0, 4).map(p => (
                <div key={p.worker_id} className="p-3 bg-background/50 border border-border/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-foreground">{p.worker_name}</span>
                    {p.eligible_for_reward && <Award className="w-4 h-4 text-yellow-500" />}
                  </div>
                  <p className="text-xs text-primary/80 font-mono mb-2">{p.recommendation}</p>
                  <div className="flex gap-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <span>Prod: {p.productivity_score}</span>
                    <span>Avg Time: {p.avg_task_time_minutes}m</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Forms */}
          <div className="space-y-6">
            <Card>
              <CardHeader>Onboard Personnel</CardHeader>
              <CardContent>
                <form onSubmit={e => { e.preventDefault(); createWorker({ data: workerForm }); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Full Name" value={workerForm.name} onChange={e => setWorkerForm({...workerForm, name: e.target.value})} required />
                    <select 
                      className="bg-background border border-border rounded-lg px-4 py-2 text-foreground font-mono text-sm outline-none"
                      value={workerForm.role}
                      onChange={e => setWorkerForm({...workerForm, role: e.target.value as any})}
                    >
                      <option value="loader">Loader</option>
                      <option value="driver">Driver</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="scanner">Scanner</option>
                      <option value="forklift_operator">Forklift Op.</option>
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <Input placeholder="Warehouse ID" value={workerForm.warehouse_id} onChange={e => setWorkerForm({...workerForm, warehouse_id: e.target.value})} required />
                    <Button type="submit" disabled={creatingWorker} className="shrink-0">Add Worker</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>Assign Directive</CardHeader>
              <CardContent>
                <form onSubmit={e => { e.preventDefault(); assignTask({ data: taskForm }); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Worker ID" value={taskForm.worker_id} onChange={e => setTaskForm({...taskForm, worker_id: e.target.value})} required />
                    <Input placeholder="Task Type (e.g. Unload)" value={taskForm.task_type} onChange={e => setTaskForm({...taskForm, task_type: e.target.value})} required />
                  </div>
                  <Input placeholder="Detailed Description" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} required />
                  <div className="flex justify-between items-center">
                    <select 
                      className="bg-background border border-border rounded-lg px-4 py-2 text-foreground font-mono text-sm outline-none"
                      value={taskForm.priority}
                      onChange={e => setTaskForm({...taskForm, priority: e.target.value as any})}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <Button type="submit" disabled={assigningTask} variant="secondary">Dispatch Task</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Active Tasks Table */}
          <Card className="h-full flex flex-col">
            <CardHeader action={<Briefcase className="w-5 h-5 text-muted-foreground" />}>Active Directives</CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto min-h-[300px]">
              <table className="w-full text-sm text-left font-mono">
                <thead className="text-[10px] uppercase text-muted-foreground bg-card border-b border-border/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Worker</th>
                    <th className="px-6 py-3 font-semibold">Task</th>
                    <th className="px-6 py-3 font-semibold">Priority</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {tasks?.map(t => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-primary text-xs">{t.worker_id}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground text-xs">{t.task_type}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{t.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${t.priority === 'high' ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {t.completed ? <span className="text-accent">Complete</span> : <span className="text-yellow-500 animate-pulse">Pending</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

      </motion.div>
    </Layout>
  );
}
