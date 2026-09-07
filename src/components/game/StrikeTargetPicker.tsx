import { Button } from "@/components/ui/button";

interface StrikeTargetPickerProps {
  strikeTarget: number;
  isRandomMode: boolean;
  onSelect: (n: number) => void;
  onSelectRandom: () => void;
}

export function StrikeTargetPicker({ strikeTarget, isRandomMode, onSelect, onSelectRandom }: StrikeTargetPickerProps) {
  return (
    <div className="flex justify-center items-center gap-2 mb-6">
      <span className="text-sm font-semibold text-muted-foreground mr-1">몇 번째 스트라이크?</span>
      {[1, 2, 3].map((n) => (
        <Button key={n} size="sm"
          variant={!isRandomMode && strikeTarget === n ? "default" : "outline"}
          onClick={() => onSelect(n)}
          className="rounded-full w-12 h-10 text-base font-bold transition-all duration-200 hover:scale-105">
          {n}S
        </Button>
      ))}
      <Button size="sm" variant={isRandomMode ? "default" : "outline"}
        onClick={onSelectRandom}
        className={`rounded-full w-16 h-10 text-sm font-bold transition-all duration-200 hover:scale-105${isRandomMode ? "" : " border-dashed"}`}>
        🎲 랜덤
      </Button>
    </div>
  );
}
