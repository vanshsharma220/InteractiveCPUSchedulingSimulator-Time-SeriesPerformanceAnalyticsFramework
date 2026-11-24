import { runFCFS } from './fcfs.js';
import { runSJF } from './sjf.js';
import { runSRTF } from './srtf.js';
import { runPriorityNP } from './priority-np.js';
import { runPriorityP } from './priority-p.js';
import { runRR } from './rr.js';

export const ALGORITHMS = [
  {
    id: 'FCFS',
    name: 'First Come First Served',
    file: 'fcfs.js',
    preemptive: false
  },
  {
    id: 'SJF',
    name: 'Shortest Job First',
    file: 'sjf.js',
    preemptive: false
  },
  {
    id: 'SRTF',
    name: 'Shortest Remaining Time First',
    file: 'srtf.js',
    preemptive: true
  },
  {
    id: 'PRIORITY_NP',
    name: 'Priority (non-preemptive)',
    file: 'priority-np.js',
    preemptive: false
  },
  {
    id: 'PRIORITY_P',
    name: 'Priority (preemptive)',
    file: 'priority-p.js',
    preemptive: true
  },
  {
    id: 'RR',
    name: 'Round Robin',
    file: 'rr.js',
    preemptive: true
  }
];

const runners = {
  FCFS: runFCFS,
  SJF: runSJF,
  SRTF: runSRTF,
  PRIORITY_NP: runPriorityNP,
  PRIORITY_P: runPriorityP,
  RR: runRR
};

export function runScheduler(processes, algorithm, quantum) {
  const run = runners[algorithm];

  if (!run) {
    throw new Error(`Unknown algorithm: ${algorithm}`);
  }

  return {
    ...run(processes, quantum),
    algorithm
  };
}