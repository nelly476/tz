export const clamp = (n, min, max) => {
  return Math.max(min, Math.min(n, max));
}


export const normalizeSearch = (q) => {
  return String(q ?? '').trim().toLowerCase();
}

export const arrayMoveInPlace = (arr, from, to) => {
  if (from === to) return arr;
  if (from < 0 || from >= arr.length) throw new RangeError('from out of range');
  if (to   < 0 || to   >= arr.length) throw new RangeError('to out of range');
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
  return arr;
}


