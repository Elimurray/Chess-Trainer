export type MoveClassification =
  | 'brilliant'
  | 'best'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder';

export function classifyMove(centipawnLoss: number): MoveClassification {
  if (centipawnLoss <= 0) return 'brilliant';
  if (centipawnLoss <= 10) return 'best';
  if (centipawnLoss <= 25) return 'good';
  if (centipawnLoss <= 50) return 'inaccuracy';
  if (centipawnLoss <= 150) return 'mistake';
  return 'blunder';
}
