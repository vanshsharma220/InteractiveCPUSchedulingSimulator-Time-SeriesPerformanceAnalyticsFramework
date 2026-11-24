import { validate, finalize } from './helpers.js';

export function runRR(input, quantum = 2) {
  const all = validate(input);

  if (
    !Number.isInteger(Number(quantum)) ||
    Number(quantum) < 1 ||
    Number(quantum) > 100
  ) {
    throw new Error(
      'Round Robin quantum must be an integer from 1 to 100.'
    );
  }

  quantum = Number(quantum);

  const p = all
    .slice()
    .sort((a, b) => a.at - b.at || a.index - b.index);

  const rem = new Map(all.map(x => [x.pid, x.bt]));
  const q = [];
  const tl = [];

  let t = 0;
  let i = 0;
  let done = 0;

  while (done < all.length) {
    while (i < p.length && p[i].at <= t) {
      q.push(p[i++]);
    }

    if (!q.length) {
      const next = p[i].at;

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

    const x = q.shift();
    const run = Math.min(quantum, rem.get(x.pid));

    tl.push({
      pid: x.pid,
      start: t,
      end: t + run
    });

    t += run;

    rem.set(x.pid, rem.get(x.pid) - run);

    while (i < p.length && p[i].at <= t) {
      q.push(p[i++]);
    }

    if (rem.get(x.pid) > 0) {
      q.push(x);
    } else {
      done++;
    }
  }

  return {
    ...finalize(all, tl),
    quantum
  };
}