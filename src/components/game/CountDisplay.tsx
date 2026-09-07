interface CountDisplayProps {
  ballCount: number;
  strikeCount: number;
}

export function CountDisplay({ ballCount, strikeCount }: CountDisplayProps) {
  return (
    <div className="flex justify-center gap-6 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground">B</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${i < ballCount ? "bg-green-500 border-green-500 shadow-[0_0_8px_hsl(120,60%,50%/0.5)]" : "border-muted-foreground/30"}`} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground">S</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${i < strikeCount ? "bg-destructive border-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.5)]" : "border-muted-foreground/30"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
