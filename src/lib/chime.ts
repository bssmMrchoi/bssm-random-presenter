let ctx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** 발표자 확정 시 울리는 "띠링" 차임벨 효과음 (두 음 상승) */
export function playRevealChime() {
  const audioCtx = getAudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});

  const now = audioCtx.currentTime;
  const notes: [freq: number, start: number, duration: number][] = [
    [1046.5, 0, 0.35], // C6
    [1568.0, 0.12, 0.45], // G6
  ];

  for (const [freq, start, duration] of notes) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;

    const t0 = now + start;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.3, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }
}
