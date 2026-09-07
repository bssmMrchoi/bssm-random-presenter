import type { Phase } from "@/hooks/usePresenterGame";

interface MemberPanelProps {
  members: string[];
  weights: Record<string, number>;
  currentWeights: Record<string, number>;
  phase: Phase;
  winner: string | null;
  tempName: string | null;
}

export function MemberPanel({ members, weights, currentWeights, phase, winner, tempName }: MemberPanelProps) {
  const sortedMembers = [...members].sort((a, b) => a.localeCompare(b, "ko"));

  return (
    <div className="relative z-10 w-28 flex-shrink-0 border-r border-border bg-card/40 flex flex-col">
      <div className="px-2 py-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground text-center tracking-wide">명단</p>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {sortedMembers.flatMap((name) => {
          const total = weights[name] ?? 1;
          const remaining = currentWeights[name] ?? 0;
          const consumed = total - remaining;
          const isWinner = phase === "reveal" && name === winner;
          const isFourball = phase === "fourball" && name === tempName;
          return Array.from({ length: total }, (_, i) => (
            <div key={`${name}-${i}`} className={`text-sm py-1.5 px-1 mx-1 rounded text-center transition-all duration-300 ${
              isWinner
                ? "text-primary font-bold bg-primary/10"
                : isFourball
                ? "text-green-500 font-bold bg-green-500/10"
                : i < consumed
                ? "line-through text-muted-foreground/40"
                : "text-foreground"
            }`}>
              {name}
            </div>
          ));
        })}
      </div>
    </div>
  );
}
