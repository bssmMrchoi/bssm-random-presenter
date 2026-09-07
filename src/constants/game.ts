export const DEFAULT_MEMBERS = [
  "곽영빈", "김민서", "김주연", "김효주", "노현승", "박건", "박시후",
  "윤동언", "이석찬", "이우린", "전지원", "조현우", "최수혁",
];

export const MIN_WEIGHT = 1;
export const MAX_WEIGHT = 5;

export const BALL_LIMIT = 4;

export const WINDUP_DURATION = 1200;
export const PITCH_DURATION = 800;
export const JUDGE_DURATION = 1200;
export const RESULT_HOLD_DURATION = 1500;
export const REVEAL_DELAY = 800;

export const THEME_SONG_SRC = "/tema_song.mp3";
export const THEME_SONG_VOLUME = 0.7;

/** 투구 횟수(볼+스트라이크 누적)에 따른 스트라이크 확률 */
export function getStrikeChance(pitchNumber: number): number {
  if (pitchNumber === 1) return 0.1;
  if (pitchNumber === 2) return 0.3;
  if (pitchNumber === 3) return 0.5;
  return 0.7;
}
