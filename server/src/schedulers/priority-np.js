import { validate, finalize } from './helpers.js';

export function runPriorityNP(input) {
  const all = validate(input);
  const done = new Set();
  const tl = [];

  let t = 0;

  while (done.size < all.length) {
    const ready = all
      .filter(p => !done.has(p.pid) && p.at <= t)
      .sort(
        (a, b) =>
          a.priority - b.priority ||
          a.at - b.at ||
          a.index - b.index
      );

    if (!ready.length) {
      const next = Math.min(
        ...all
          .filter(p => !done.has(p.pid))
          .map(p => p.at)
      );

      if (next > t) {
        tl.push({
          pid: 'IDLE',
          start: t,
          end: next
        });
      }

      t = next;
      continue;
    }

    const p = ready[0];

    tl.push({
      pid: p.pid,
      start: t,
      end: t + p.bt
    });

    t += p.bt;
    done.add(p.pid);
  }

  return finalize(all, tl);
}