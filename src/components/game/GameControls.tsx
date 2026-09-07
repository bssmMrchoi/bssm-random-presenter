import { Button } from "@/components/ui/button";
import type { Phase } from "@/hooks/usePresenterGame";

interface GameControlsProps {
  phase: Phase;
  showWeights: boolean;
  onStartPitch: () => void;
  onReset: () => void;
  onToggleWeights: () => void;
}

export function GameControls({ phase, showWeights, onStartPitch, onReset, onToggleWeights }: GameControlsProps) {
  return (
    <div className="flex justify-center gap-4 mb-8">
      {phase === "idle" && (
        <Button size="lg" onClick={onStartPitch}
          className="text-lg px-10 py-6 rounded-full transition-all duration-300 hover:scale-105 active:scale-95">
          ⚾ 투구!
        </Button>
      )}
      {(phase === "reveal" || phase === "fourball") && (
        <Button size="lg" onClick={onReset} variant="outline"
          className="text-lg px-10 py-6 rounded-full transition-all duration-300 hover:scale-105">
          🔄 처음부터
        </Button>
      )}
      {phase === "idle" && (
        <Button variant="ghost" size="lg" onClick={onToggleWeights} className="rounded-full">
          ⚖️ 가중치 {showWeights ? "숨기기" : "보기"}
        </Button>
      )}
    </div>
  );
}
