import { PitcherDuck } from "./PitcherDuck";
import type { Phase } from "@/hooks/usePresenterGame";

interface GameStageProps {
  phase: Phase;
  tempName: string | null;
  winner: string | null;
}

export function GameStage({ phase, tempName, winner }: GameStageProps) {
  const isAnimating = !["idle", "ball-wait", "strike-wait", "reveal", "fourball"].includes(phase);
  const isPitching = phase === "pitch";
  const isWindup = phase === "windup";

  return (
    <div className="relative flex flex-col items-center justify-center mb-6" style={{ minHeight: 380 }}>
      <PitcherDuck isWindup={isWindup} isPitching={isPitching} />

      {/* 야구공 */}
      <div className={`baseball ${isPitching ? "ball-flying" : ""} ${phase === "name-show" || phase === "strike" || phase === "reveal" ? "ball-caught" : ""} ${phase === "ball" || phase === "ball-wait" ? "ball-missed" : ""}`}>
        <svg viewBox="0 0 40 40" width="40" height="40">
          <circle cx="20" cy="20" r="18" fill="hsl(0, 0%, 95%)" stroke="hsl(0, 0%, 70%)" strokeWidth="1" />
          <path d="M12,8 Q20,16 12,28" fill="none" stroke="hsl(0, 70%, 50%)" strokeWidth="1.5" />
          <path d="M28,8 Q20,16 28,28" fill="none" stroke="hsl(0, 70%, 50%)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* 스피드 라인 */}
      {isPitching && (
        <div className="speed-lines">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="speed-line" style={{
              top: `${35 + (Math.random() - 0.5) * 30}%`,
              left: `${20 + Math.random() * 60}%`,
              animationDelay: `${i * 0.05}s`,
              width: `${40 + Math.random() * 60}px`,
            }} />
          ))}
        </div>
      )}

      {(phase === "strike" || phase === "reveal") && <div className="strike-text">STRIKE!</div>}
      {(phase === "ball" || phase === "ball-wait") && <div className="ball-text">BALL!</div>}

      {phase === "name-show" && tempName && (
        <div className="winner-reveal">
          <div className="winner-name">{tempName}</div>
          <div className="winner-sub">판정 대기 중... 🥁</div>
        </div>
      )}

      {(phase === "ball" || phase === "ball-wait") && tempName && (
        <div className="ball-name-tease">
          <span className="line-through opacity-50 text-2xl font-bold text-muted-foreground">{tempName}</span>
          <span className="text-sm text-muted-foreground mt-1">탈출 성공...😮‍💨</span>
        </div>
      )}

      {phase === "strike-wait" && tempName && (
        <div className="ball-name-tease">
          <span className="line-through opacity-50 text-2xl font-bold text-muted-foreground">{tempName}</span>
        </div>
      )}

      {phase === "reveal" && winner && (
        <div className="winner-reveal">
          <div className="winner-name">{winner}</div>
          <div className="winner-sub">🎤 오늘의 발표자 확정! 🎤</div>
        </div>
      )}

      {phase === "fourball" && tempName && (
        <div className="fourball-reveal">
          <div className="fourball-text">FOUR BALL!</div>
          <div className="fourball-name">{tempName}</div>
          <div className="fourball-sub">🎉 발표 패스! 🎉</div>
        </div>
      )}

      {(phase === "strike" || phase === "fourball") && <div className="screen-shake" />}
    </div>
  );
}
