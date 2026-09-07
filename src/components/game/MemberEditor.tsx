import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MemberEditorProps {
  memberInput: string;
  onChangeInput: (value: string) => void;
  onShuffle: () => void;
  onApply: () => void;
}

export function MemberEditor({ memberInput, onChangeInput, onShuffle, onApply }: MemberEditorProps) {
  const nameCount = memberInput.split(",").filter((s) => s.trim()).length;

  return (
    <Card className="mb-6 animate-[fade-in_0.3s_ease-out]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">👥 명단 편집</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-2">쉼표(,)로 구분해서 입력 후 적용하세요. 가중치가 초기화됩니다.</p>
        <div className="flex gap-2">
          <textarea
            value={memberInput}
            onChange={(e) => onChangeInput(e.target.value)}
            className="flex-1 text-sm border border-border rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            rows={2}
            placeholder="홍길동, 김철수, 이영희, ..."
          />
          <div className="flex flex-col gap-2 self-end">
            <Button variant="outline" onClick={onShuffle} disabled={nameCount <= 1}>
              🔀 셔플
            </Button>
            <Button onClick={onApply}>적용</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
