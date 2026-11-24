export function validate(processes) {
  if (!Array.isArray(processes) || processes.length < 1 || processes.length > 100) throw new Error('Add between 1 and 100 processes.');
  const seen = new Set();
  return processes.map((p, i) => {
    const pid = String(p.pid || `P${i + 1}`);
    const at = Number(p.at), bt = Number(p.bt), priority = Number(p.priority ?? 1);
    if (!pid.trim() || seen.has(pid)) throw new Error('Process IDs must be non-empty and unique.');
    if (!Number.isInteger(at) || at < 0 || !Number.isInteger(bt) || bt < 1 || !Number.isFinite(priority)) throw new Error(`Invalid arrival/burst/priority for ${pid}. Arrival must be >= 0 and burst >= 1.`);
    seen.add(pid); return { pid, at, bt, priority, index: i, rt: bt, firstStart: null, ct: 0 };
  });
}
export function finalize(original, timeline) {
  const byId = new Map(original.map(p => [p.pid, p]));
  const rows = original.map(p => {
    const segments = timeline.filter(s => s.pid === p.pid);
    const ct = segments.length ? segments[segments.length - 1].end : 0;
    const first = segments.length ? segments[0].start : p.at;
    const tat = ct - p.at, wt = tat - p.bt, rt = first - p.at;
    return { pid:p.pid, at:p.at, bt:p.bt, priority:p.priority, ct, tat, wt, rt };
  });
  const avg = key => rows.reduce((sum,p)=>sum+p[key],0)/rows.length;
  const end = Math.max(1, ...timeline.map(s=>s.end));
  const busy = timeline.filter(s=>s.pid!=='IDLE').reduce((n,s)=>n+s.end-s.start,0);
  return { processes:rows, timeline, averages:{waiting:avg('wt'),turnaround:avg('tat'),response:avg('rt')}, cpuUtilization:busy/end*100, totalTime:end };
}
export function compressTimeline(timeline) {
  const out=[];
  for (const seg of timeline) {
    const last=out[out.length-1];
    if (last && last.pid===seg.pid && last.end===seg.start) last.end=seg.end;
    else out.push({...seg});
  }
  return out;
}
