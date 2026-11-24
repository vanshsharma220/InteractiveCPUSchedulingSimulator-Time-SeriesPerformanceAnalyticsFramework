import { validate, finalize } from './helpers.js';

export function runFCFS(input) {
  const p = validate(input).sort(
    (a, b) => a.at - b.at || a.index - b.index
  );

  let t = 0;
  let tl = [];

  for (const x of p) {
    if (t < x.at) {
      tl.push({
        pid: 'IDLE',
        start: t,
        end: x.at
      });

      t = x.at;
    }

    tl.push({
      pid: x.pid,
      start: t,
      end: t + x.bt
    });

    t += x.bt;
  }

  return finalize(p, tl);
}