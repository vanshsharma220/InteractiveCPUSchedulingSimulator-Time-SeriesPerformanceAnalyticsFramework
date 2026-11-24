# CPU scheduling notes

| Algorithm | Rule | Preemptive? |
|---|---|---|
| FCFS | Earliest arrival first | No |
| SJF | Shortest burst among arrived processes | No |
| SRTF | Shortest remaining burst at each time step | Yes |
| Priority NP | Lowest numeric priority value first among arrived processes | No |
| Priority P | Lowest numeric priority value may preempt current process | Yes |
| Round Robin | Ready-queue time slices of configured quantum | Yes |

Tie-breaking is deterministic: arrival time, then original input order. Smaller priority number means higher priority. Idle CPU intervals are included in the backend timeline. Waiting = turnaround − burst; turnaround = completion − arrival; response = first CPU start − arrival.
