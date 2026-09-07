import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { MAX_WEIGHT, MIN_WEIGHT } from "@/constants/game";

interface WeightPanelProps {
  members: string[];
  weights: Record<string, number>;
  onChangeWeight: (name: string, value: number) => void;
}

export function WeightPanel({ members, weights, onChangeWeight }: WeightPanelProps) {
  return (
    <Card className="animate-[fade-in_0.3s_ease-out]">
      <CardHeader>
        <CardTitle className="text-lg">⚖️ 가중치 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.map((name) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-16 text-sm font-medium truncate">{name}</span>
              <Slider min={MIN_WEIGHT} max={MAX_WEIGHT} step={1}
                value={[weights[name] ?? 1]}
                onValueChange={([v]) => onChangeWeight(name, v)}
                className="flex-1" />
              <span className="w-8 text-sm text-muted-foreground text-right">x{weights[name] ?? 1}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
