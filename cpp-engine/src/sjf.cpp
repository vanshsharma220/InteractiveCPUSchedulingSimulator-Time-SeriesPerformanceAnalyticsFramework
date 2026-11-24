
#include "scheduler_common.hpp"

int main() {
    std::vector<Process> p;

    if (!readInput(p)) {
        std::cerr << "Invalid input\n";
        return 1;
    }

    std::vector<Segment> t;

    int time = 0;
    int done = 0;

    while (done < (int)p.size()) {
        int k = -1;

        // Find the shortest available process (non-preemptive SJF).
        for (int i = 0; i < (int)p.size(); i++) {
            if (
                p[i].remaining &&
                p[i].at <= time &&
                (
                    k < 0 ||
                    p[i].bt < p[k].bt ||
                    (p[i].bt == p[k].bt && p[i].at < p[k].at)
                )
            ) {
                k = i;
            }
        }

        // If no process has arrived, keep the CPU idle.
        if (k < 0) {
            int next = 1e9;

            for (auto& x : p) {
                if (x.remaining) {
                    next = std::min(next, x.at);
                }
            }

            addSegment(t, "IDLE", time, next);
            time = next;

            continue;
        }

        auto& x = p[k];

        // Record the process start time.
        x.first = time;

        // Execute the process until it finishes.
        addSegment(t, x.pid, time, time + x.bt);

        time += x.bt;

        x.remaining = 0;
        x.ct = time;

        done++;
    }

    printResult(p, t);
}
