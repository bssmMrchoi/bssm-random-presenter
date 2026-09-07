interface AmbientBackgroundProps {
  isAnimating: boolean;
}

export function AmbientBackground({ isAnimating }: AmbientBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: isAnimating ? 1 : 0.3, background: `radial-gradient(ellipse at 50% 120%, hsl(var(--primary) / 0.12) 0%, transparent 60%)` }} />
      {isAnimating && (
        <>
          <div className="absolute top-0 left-[20%] w-32 h-32 rounded-full blur-3xl animate-pulse"
            style={{ background: "hsl(45, 100%, 70%)", opacity: 0.2 }} />
          <div className="absolute top-0 right-[20%] w-32 h-32 rounded-full blur-3xl animate-pulse"
            style={{ background: "hsl(45, 100%, 70%)", opacity: 0.2, animationDelay: "0.3s" }} />
        </>
      )}
    </div>
  );
}
