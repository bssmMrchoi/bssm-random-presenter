export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** currentWeights 기반 가중 무작위 선택. 명단 순서 편향 제거를 위해 CDF 전에 셔플한다. */
export function pickWeightedName(pool: Record<string, number>): string {
  const entries = shuffle(
    (Object.entries(pool) as [string, number][]).filter(([, w]) => w > 0),
  );
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [name, w] of entries) {
    r -= w;
    if (r <= 0) return name;
  }
  return entries[entries.length - 1][0];
}
