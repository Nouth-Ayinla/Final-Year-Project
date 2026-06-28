import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { GlassCard } from "./GlassCard";

export type SecurityAlert = {
  type: "warning" | "success";
  title: string;
  description: string;
  timestamp: string;
};

type SecurityMonitoringCardProps = {
  alerts: SecurityAlert[];
};

export function SecurityMonitoringCard({
  alerts,
}: SecurityMonitoringCardProps) {
  return (
    <GlassCard className="p-gutter" title="Security Monitoring">
      <div className="space-y-stack-md">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className={`flex gap-3 p-3 rounded-lg border-l-4 ${
              alert.type === "warning"
                ? "bg-surface-container-low border-error"
                : "bg-surface-container-low border-primary"
            }`}
          >
            {alert.type === "warning" ? (
              <AlertTriangle size={20} className="text-error shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2
                size={20}
                className="text-primary shrink-0 mt-0.5"
              />
            )}
            <div>
              <p className="text-label-md font-bold">{alert.title}</p>
              <p className="text-label-sm text-on-surface-variant">
                {alert.description}
              </p>
              <p className="text-[10px] text-outline mt-1">{alert.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
