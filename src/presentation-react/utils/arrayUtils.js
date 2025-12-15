export function arraysAlmostEqual(a = [], b = [], eps = 1e-6) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!Number.isFinite(a[i]) || !Number.isFinite(b[i])) return false;
    if (Math.abs(a[i] - b[i]) >= eps) return false;
  }
  return true;
}
