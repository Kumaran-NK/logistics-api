import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export function Card({ children, className, glow = false }: { children: ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={cn("glass-panel rounded-xl overflow-hidden relative", glow && "box-glow border-primary/30", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, action }: { children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <div className={cn("px-6 py-4 border-b border-border/50 flex justify-between items-center bg-card/50", className)}>
      <h3 className="text-lg font-bold text-primary tracking-widest uppercase">{children}</h3>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function Badge({ children, variant = "default", className }: { children: ReactNode; variant?: "default" | "success" | "warning" | "destructive" | "outline"; className?: string }) {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/30",
    success: "bg-accent/10 text-accent border-accent/30",
    warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    destructive: "bg-destructive/10 text-destructive border-destructive/30",
    outline: "bg-transparent text-muted-foreground border-border",
  };
  
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border", variants[variant], className)}>
      {children}
    </span>
  );
}

export function MockAIBadge({ label = "AI Optimized" }: { label?: string }) {
  return (
    <motion.span 
      initial={{ opacity: 0.8 }}
      animate={{ opacity: [0.8, 1, 0.8], boxShadow: ["0 0 0px #06b6d4", "0 0 10px #06b6d4", "0 0 0px #06b6d4"] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/15 border border-primary/50 text-primary text-[10px] font-bold uppercase tracking-widest shrink-0"
    >
      <BrainCircuit className="w-3 h-3" />
      {label}
    </motion.span>
  );
}

export function Button({ 
  children, 
  variant = "primary", 
  className, 
  disabled, 
  onClick,
  type = "button"
}: { 
  children: ReactNode; 
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success"; 
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}) {
  const variants = {
    primary: "bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]",
    secondary: "bg-secondary/50 text-secondary-foreground border border-border hover:bg-secondary hover:border-primary/50",
    outline: "bg-transparent text-foreground border border-border hover:bg-card hover:border-primary/50",
    ghost: "bg-transparent text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent",
    destructive: "bg-destructive/20 text-destructive border border-destructive/50 hover:bg-destructive hover:text-destructive-foreground",
    success: "bg-accent/20 text-accent border border-accent/50 hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className={cn(
        "w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground font-mono text-sm",
        className
      )} 
      {...props} 
    />
  );
}

export function LoadingScan() {
  return (
    <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden glass-panel rounded-xl">
      <div className="absolute inset-0 animate-scan pointer-events-none" />
      <BrainCircuit className="w-12 h-12 text-primary animate-pulse mb-4" />
      <p className="text-primary font-mono text-sm tracking-widest uppercase animate-pulse">Initializing Interface...</p>
    </div>
  );
}

export function ErrorScan({ error }: { error: string }) {
  return (
    <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center glass-panel rounded-xl border-destructive/30">
      <p className="text-destructive font-mono text-sm tracking-widest uppercase mb-2">System Error</p>
      <p className="text-muted-foreground text-xs">{error}</p>
    </div>
  );
}
