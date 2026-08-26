export type PanelDirection = -1 | 1;

export function getAutoScrollDelta(clientY: number, viewportHeight: number, edge = 90, step = 18): number {
  if (clientY < edge) return -step;
  if (clientY > viewportHeight - edge) return step;
  return 0;
}

export function placePanelBefore<T extends string>(order: readonly T[], panel: T, target: T): T[] {
  if (panel === target || !order.includes(panel) || !order.includes(target)) return [...order];
  const next = order.filter((id) => id !== panel);
  next.splice(next.indexOf(target), 0, panel);
  return next;
}

export function placeUnlockedPanelBefore<T extends string>(order: readonly T[], panel: T, target: T, locked: readonly T[]): T[] {
  if (locked.includes(panel) || locked.includes(target)) return [...order];
  return placePanelBefore(order, panel, target);
}

export function movePanelOrder<T extends string>(order: readonly T[], panel: T, direction: PanelDirection): T[] {
  const index = order.indexOf(panel);
  const destination = index + direction;
  if (index < 0 || destination < 0 || destination >= order.length) return [...order];
  const next = [...order];
  [next[index], next[destination]] = [next[destination], next[index]];
  return next;
}
