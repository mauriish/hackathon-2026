import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/lib/analysis";

const badgeStyles: Record<RiskLevel, string> = {
  alto: "bg-danger text-white",
  moderado: "bg-warning text-ink",
  bajo: "bg-safe text-white",
};

export function RiskBadge({
  level,
  children,
}: {
  level: RiskLevel;
  children: ReactNode;
}) {
  return (
    <Badge className={`min-h-6 px-3 text-xs font-semibold ${badgeStyles[level]}`}>
      {children}
    </Badge>
  );
}
