import { validate, finalize } from './helpers.js';

export function runSRTF(input) {
  const p = validate(input);

  let t = 0;
  let remaining = p.map(x => x.bt);
  let tl = [];
  let finished = 0;
  let first = {};

  while (finished < p.length) {
    const ready = p
      .filter((x, i) => remaining[i] > 0 && x.at <= t)
      .sort(
        (a, b) =>
          remaining[a.index] - remaining[b.index] ||
          a.at - b.at ||
          a.index - b.index
      );

    if (!ready.length) {
      const next = Math.min(
        ...p
          .filter(x => remaining[x.index] > 0)
          .map(x => x.at)
      );

      tl.push({
        pid: 'IDLE',
        start: t,
        end: next
      });

      t = next;
      continue;
    }

    const x = ready[0];
    const i = x.index;

    if (first[x.pid] === undefined) {
      first[x.pid] = t;
    }

    const nextArrival = p
      .filter(q => q.at > t && remaining[q.index] > 0)
      .reduce((m, q) => Math.min(m, q.at), Infinity);

    const duration = Math.min(
      remaining[i],
      Number.isFinite(nextArrival)
        ? nextArrival - t
        : remaining[i]
    );

    tl.push({
      pid: x.pid,
      start: t,
      end: t + duration
    });

    remaining[i] -= duration;
    t += duration;

    if (remaining[i] === 0) {
      finished++;
    }
  }

  return finalize(p, tl);
}