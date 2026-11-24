import { validate, finalize } from './helpers.js';

export function runPriorityP(input) {
  const p = validate(input);
  const rem = p.map(x => x.bt);
  const tl = [];

  let t = 0;
  let done = 0;

  while (done < p.length) {
    const ready = p
      .filter(x => rem[x.index] > 0 && x.at <= t)
      .sort(
        (a, b) =>
          a.priority - b.priority ||
          a.at - b.at ||
          a.index - b.index
      );

    if (!ready.length) {
      const next = Math.min(
        ...p
          .filter(x => rem[x.index] > 0)
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

    tl.push({
      pid: x.pid,
      start: t,
      end: t + 1
    });

    rem[i]--;
    t++;

    if (rem[i] === 0) {
      done++;
    }
  }

  return finalize(p, tl);
}