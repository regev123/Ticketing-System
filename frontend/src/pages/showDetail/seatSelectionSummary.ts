import type { SeatInfo } from '@/types/api';

/**
 * Human-readable lines for the current ticket selection (grouped by section + row).
 */
export function buildSeatSelectionSummaryLines(
  catalogSeats: SeatInfo[],
  selectionIds: Set<string>
): string[] {
  const picked = catalogSeats.filter((s) => selectionIds.has(s.id));
  if (picked.length === 0) return [];

  picked.sort((a, b) => {
    const sec = a.section.localeCompare(b.section);
    if (sec !== 0) return sec;
    if (a.row !== b.row) return a.row - b.row;
    return a.number - b.number;
  });

  const groups = new Map<string, number[]>();
  for (const s of picked) {
    const key = `${s.section}|${s.row}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s.number);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, nums]) => {
      const [section, rowStr] = key.split('|');
      const row = rowStr ?? '';
      const sorted = [...nums].sort((x, y) => x - y);
      return `${section} · Row ${row} · Seats ${sorted.join(', ')}`;
    });
}
