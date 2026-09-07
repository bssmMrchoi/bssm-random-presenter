import { AmbientBackground } from "@/components/game/AmbientBackground";
import { CountDisplay } from "@/components/game/CountDisplay";
import { GameControls } from "@/components/game/GameControls";
import { GameStage } from "@/components/game/GameStage";
import { MemberEditor } from "@/components/game/MemberEditor";
import { MemberPanel } from "@/components/game/MemberPanel";
import { StrikeTargetPicker } from "@/components/game/StrikeTargetPicker";
import { WeightPanel } from "@/components/game/WeightPanel";
import { usePresenterGame } from "@/hooks/usePresenterGame";
import "@/styles/game-animations.css";

const Index = () => {
  const game = usePresenterGame();
  const isAnimating = !["idle", "ball-wait", "strike-wait", "reveal", "fourball"].includes(game.phase);

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden select-none flex">
      <AmbientBackground isAnimating={isAnimating} />

      <MemberPanel
        members={game.members}
        weights={game.weights}
        currentWeights={game.currentWeights}
        phase={game.phase}
        winner={game.winner}
        tempName={game.tempName}
      />

      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-4 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">⚾ 랜덤 발표자 뽑기</h1>

          <CountDisplay ballCount={game.ballCount} strikeCount={game.strikeCount} />

          <GameStage phase={game.phase} tempName={game.tempName} winner={game.winner} />

          <GameControls
            phase={game.phase}
            showWeights={game.showWeights}
            onStartPitch={game.startPitch}
            onReset={game.fullReset}
            onToggleWeights={game.toggleShowWeights}
          />

          {game.phase === "idle" && (
            <StrikeTargetPicker
              strikeTarget={game.strikeTarget}
              isRandomMode={game.isRandomMode}
              onSelect={game.selectStrikeTarget}
              onSelectRandom={game.selectRandomStrikeTarget}
            />
          )}

          {game.phase === "idle" && (
            <MemberEditor
              memberInput={game.memberInput}
              onChangeInput={game.setMemberInput}
              onShuffle={game.shuffleMemberInput}
              onApply={game.applyMembers}
            />
          )}

          {game.showWeights && game.phase === "idle" && (
            <WeightPanel
              members={game.members}
              weights={game.weights}
              onChangeWeight={game.setMemberWeight}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
