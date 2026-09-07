import { useCallback, useEffect, useRef, useState } from "react";
import {
  BALL_LIMIT,
  DEFAULT_MEMBERS,
  JUDGE_DURATION,
  PITCH_DURATION,
  RESULT_HOLD_DURATION,
  REVEAL_DELAY,
  THEME_SONG_SRC,
  THEME_SONG_VOLUME,
  WINDUP_DURATION,
  getStrikeChance,
} from "@/constants/game";
import { pickWeightedName } from "@/lib/weightedPick";
import { playRevealChime } from "@/lib/chime";

export type Phase =
  | "idle"
  | "windup"
  | "pitch"
  | "name-show"
  | "strike"
  | "reveal"
  | "ball"
  | "ball-wait"
  | "strike-wait"
  | "fourball";

function uniformWeights(members: string[]): Record<string, number> {
  return Object.fromEntries(members.map((m) => [m, 1]));
}

export function usePresenterGame() {
  const [members, setMembers] = useState<string[]>(DEFAULT_MEMBERS);
  const [memberInput, setMemberInput] = useState(DEFAULT_MEMBERS.join(", "));
  const [weights, setWeights] = useState<Record<string, number>>(uniformWeights(DEFAULT_MEMBERS));
  const [currentWeights, setCurrentWeights] = useState<Record<string, number>>(uniformWeights(DEFAULT_MEMBERS));
  const [phase, setPhase] = useState<Phase>("idle");
  const [winner, setWinner] = useState<string | null>(null);
  const [showWeights, setShowWeights] = useState(true);
  const [ballCount, setBallCount] = useState(0);
  const [strikeCount, setStrikeCount] = useState(0);
  const [tempName, setTempName] = useState<string | null>(null);
  const [strikeTarget, setStrikeTarget] = useState(3);
  const [isRandomMode, setIsRandomMode] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const weightsRef = useRef(weights);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    weightsRef.current = weights;
  }, [weights]);

  useEffect(() => {
    const audio = new Audio(THEME_SONG_SRC);
    audio.volume = THEME_SONG_VOLUME;
    audioRef.current = audio;
    return () => audio.pause();
  }, []);

  const stopAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  const clearTimers = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const shuffleMemberInput = useCallback(() => {
    const parsed = memberInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (parsed.length <= 1) return;
    for (let i = parsed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [parsed[i], parsed[j]] = [parsed[j], parsed[i]];
    }
    setMemberInput(parsed.join(", "));
  }, [memberInput]);

  const applyMembers = useCallback(() => {
    const parsed = memberInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (parsed.length === 0) return;
    const newWeights = uniformWeights(parsed);
    setMembers(parsed);
    setWeights(newWeights);
    weightsRef.current = newWeights;
    setCurrentWeights({ ...newWeights });
  }, [memberInput]);

  const setMemberWeight = useCallback((name: string, value: number) => {
    const delta = value - (weightsRef.current[name] ?? 1);
    const updated = { ...weightsRef.current, [name]: value };
    setWeights(updated);
    weightsRef.current = updated;
    if (delta !== 0) {
      setCurrentWeights((prev) => ({
        ...prev,
        [name]: Math.max(0, (prev[name] ?? 0) + delta),
      }));
    }
  }, []);

  const selectStrikeTarget = useCallback((n: number) => {
    setStrikeTarget(n);
    setIsRandomMode(false);
  }, []);

  const selectRandomStrikeTarget = useCallback(() => {
    setStrikeTarget(Math.ceil(Math.random() * 3));
    setIsRandomMode(true);
  }, []);

  const startPitch = useCallback(() => {
    if (phase !== "idle" && phase !== "ball-wait" && phase !== "strike-wait") return;
    clearTimers();

    // 이전 게임에서 idle로 돌아온 경우 currentWeights 동기화
    let pool: Record<string, number> = currentWeights;
    if (phase === "idle") {
      pool = { ...weightsRef.current };
      setCurrentWeights(pool);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else {
      const hasAny = Object.values(pool).some((v) => v > 0);
      if (!hasAny) {
        pool = { ...weightsRef.current };
        setCurrentWeights(pool);
      }
    }

    const chosen = pickWeightedName(pool);

    setTempName(chosen);
    setShowWeights(false);

    const pitchNumber = ballCount + strikeCount + 1;
    const isStrike = Math.random() < getStrikeChance(pitchNumber);

    const doDecrement = () => {
      setCurrentWeights((prev) => {
        const next = { ...prev, [chosen]: Math.max(0, (prev[chosen] ?? 0) - 1) };
        return Object.values(next).every((v) => v === 0) ? { ...weightsRef.current } : next;
      });
    };

    setPhase("windup");
    timerRef.current.push(setTimeout(() => setPhase("pitch"), WINDUP_DURATION));
    timerRef.current.push(setTimeout(() => setPhase("name-show"), WINDUP_DURATION + PITCH_DURATION));

    const judgeAt = WINDUP_DURATION + PITCH_DURATION + JUDGE_DURATION;

    if (isStrike) {
      timerRef.current.push(setTimeout(() => {
        doDecrement();
        setStrikeCount((c) => {
          const n = c + 1;
          if (n >= strikeTarget) {
            setTimeout(() => { stopAudio(); playRevealChime(); setWinner(chosen); setPhase("reveal"); }, REVEAL_DELAY);
          } else {
            setTimeout(() => setPhase("strike-wait"), REVEAL_DELAY);
          }
          return n;
        });
        setPhase("strike");
      }, judgeAt));
    } else {
      timerRef.current.push(setTimeout(() => {
        doDecrement();
        setBallCount((c) => {
          const n = c + 1;
          if (n >= BALL_LIMIT) {
            setTimeout(() => { stopAudio(); setPhase("fourball"); }, REVEAL_DELAY);
          } else {
            setTimeout(() => setPhase("ball-wait"), REVEAL_DELAY);
          }
          return n;
        });
        setPhase("ball");
      }, judgeAt));
    }
  }, [phase, currentWeights, strikeTarget, ballCount, strikeCount]);

  // ball-wait / strike-wait 진입 시 자동으로 다음 투구
  useEffect(() => {
    if (phase === "ball-wait" || phase === "strike-wait") {
      const timer = setTimeout(() => startPitch(), RESULT_HOLD_DURATION);
      return () => clearTimeout(timer);
    }
  }, [phase, startPitch]);

  const fullReset = useCallback(() => {
    clearTimers();
    stopAudio();
    setPhase("idle");
    setWinner(null);
    setTempName(null);
    setBallCount(0);
    setStrikeCount(0);
    setShowWeights(true);
    setIsRandomMode(false);
    setCurrentWeights({ ...weightsRef.current });
  }, []);

  const toggleShowWeights = useCallback(() => setShowWeights((v) => !v), []);

  return {
    members,
    memberInput,
    setMemberInput,
    weights,
    currentWeights,
    phase,
    winner,
    showWeights,
    ballCount,
    strikeCount,
    tempName,
    strikeTarget,
    isRandomMode,
    startPitch,
    fullReset,
    shuffleMemberInput,
    applyMembers,
    setMemberWeight,
    selectStrikeTarget,
    selectRandomStrikeTarget,
    toggleShowWeights,
  };
}

export type PresenterGame = ReturnType<typeof usePresenterGame>;
